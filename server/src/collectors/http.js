import Stripe from 'stripe';
import {connectMongo} from '../config/db.js';
import {account,authBudget,cookieToken,digest,fail,sessionCookie,signIn} from './auth.js';
import {CollectorSession,Edition,Wallet,Draw,PackOrder,collectorModels} from './models.js';
import {reservePack,settlePack,drawCard,PACK_CENTS} from './inventory.js';
const headers={'cache-control':'no-store','x-content-type-options':'nosniff','referrer-policy':'no-referrer'};
const json=(body,status=200,extra={})=>Response.json(body,{status,headers:{...headers,...extra}});
export function paymentConfig(){
 const origin=process.env.COLLECTOR_SITE_ORIGIN||'https://enterthefold.io';
 const secret=process.env.STRIPE_SECRET_KEY||'';
 const configured=/^sk_(test|live)_/.test(secret)&&Boolean(process.env.STRIPE_WEBHOOK_SECRET);
 const enabled=configured&&process.env.COLLECTOR_PAYMENTS_ENABLED==='true'&&process.env.COLLECTOR_JOKER_REVIEW_COMPLETE==='true';
 return {origin,enabled,configured,live:secret.startsWith('sk_live_')};
}
let indexReady;
async function ensureIndexes(){if(!indexReady)indexReady=Promise.all(collectorModels.map(m=>m.init())).catch(e=>{indexReady=null;throw e;});await indexReady;}
const stripeClient=()=>new Stripe(process.env.STRIPE_SECRET_KEY,{maxNetworkRetries:1,timeout:10000});
async function body(request,raw=false){
 const reader=request.body?.getReader();if(!reader)return raw?'':{};let total=0;const chunks=[];
 try{while(true){const {value,done}=await reader.read();if(done)break;total+=value.length;if(total>131072)fail(413,'Request is too large.');chunks.push(value);}}finally{await reader.cancel().catch(()=>{});}
 const text=Buffer.concat(chunks).toString('utf8');if(raw)return text;
 try{return JSON.parse(text);}catch{fail(400,'Invalid request.');}
}
export async function collectorHttp(request,route){
 try{
  const cfg=paymentConfig(),method=request.method;
  if(route==='webhook'){
   if(method!=='POST')return json({error:'Method not allowed'},405);
   if(!cfg.configured)return json({error:'Payments are not configured'},503);
   let event;try{event=stripeClient().webhooks.constructEvent(await body(request,true),request.headers.get('stripe-signature')||'',process.env.STRIPE_WEBHOOK_SECRET);}catch{return json({error:'Invalid payment signature'},400);}
   if(Boolean(event.livemode)!==cfg.live)return json({error:'Payment environment mismatch'},400);
   if(!await connectMongo())return json({error:'Collection storage unavailable'},503);
   await ensureIndexes();
   if(['checkout.session.completed','checkout.session.async_payment_succeeded','checkout.session.expired'].includes(event.type))await settlePack(event.data.object,event.type);
   return json({received:true});
  }
  if(method!=='GET'&&request.headers.get('origin')!==cfg.origin)return json({error:'Request origin not allowed'},403);
  if(!await connectMongo())return route==='status'?json({editions:[],paymentsEnabled:false,unavailable:true}):json({error:'Your collection is temporarily unavailable. Please try again.'},503);
  await ensureIndexes();
  if(route==='status'&&method==='GET'){
   const editions=await Edition.find({state:'ready'}).sort({createdAt:-1}).select('_id mode label total cursor packLimit packsReserved').lean();
   return json({paymentsEnabled:cfg.enabled,testMode:cfg.enabled&&!cfg.live,editions:editions.map(e=>({id:e._id,mode:e.mode,label:e.label,total:e.total,remaining:e.total-e.cursor,packsAvailable:e.packLimit-e.packsReserved}))});
  }
  if(['register','login','recover'].includes(route)&&method==='POST'){
   const ip=request.headers.get('x-vercel-forwarded-for')||request.headers.get('x-forwarded-for')?.split(',')[0]||'local';
   await authBudget(ip);
   const result=await signIn(route,await body(request));
   return json({user:result.user,recoveryCode:result.recoveryCode},200,{'set-cookie':sessionCookie(result.token,cfg.origin.startsWith('https:'))});
  }
  const user=await account(request);
  if(route==='me'&&method==='GET')return json({user:user?{id:String(user._id),username:user.username}:null,wallets:user?await Wallet.find({owner:user._id}).select('edition credits -_id').lean():[]});
  if(!user)fail(401,'Sign in to your collector profile first.');
  if(route==='logout'&&method==='POST'){await CollectorSession.deleteOne({token:digest(cookieToken(request))});return json({ok:true},200,{'set-cookie':sessionCookie('',cfg.origin.startsWith('https:'))});}
  if(route==='collection'&&method==='GET'){
   const page=Math.max(1,Math.min(10000,Number(new URL(request.url).searchParams.get('page'))||1));
   const records=await Draw.find({owner:user._id}).sort({_id:-1}).skip((page-1)*12).limit(13).select('card').lean();
   return json({cards:records.slice(0,12).map(r=>r.card),hasMore:records.length>12,page});
  }
  if(route==='draw'&&method==='POST'){
   const input=await body(request);if(typeof input.edition!=='string'||input.edition.length>80)fail(400,'Choose an edition.');
   return json({card:await drawCard(user._id,input.edition,input.requestId)});
  }
  if(route==='checkout'&&method==='POST'){
   if(!cfg.enabled)fail(503,'Collector packs are not on sale yet.');
   const input=await body(request);if(typeof input.edition!=='string'||input.edition.length>80)fail(400,'Choose an edition.');
   const order=await reservePack(user._id,input.edition,input.requestId);
   if(order.state==='paid')return json({paid:true});
   if(order.state==='expired')fail(409,'That checkout expired. Start a new purchase.');
   const stripe=stripeClient();
   const checkout=order.stripeSession?await stripe.checkout.sessions.retrieve(order.stripeSession):await stripe.checkout.sessions.create({
    mode:'payment',payment_method_types:['card'],client_reference_id:order._id,
    metadata:{edition:order.edition,owner:String(user._id)},
    line_items:[{price_data:{currency:'usd',unit_amount:PACK_CENTS,product_data:{name:`The Fold — ${order.edition} — 10 collector draws`,description:'Ten digital collectible card draws for this edition. No cash redemption.'}},quantity:1}],
    success_url:`${cfg.origin}/fortune-teller?collector=return&edition=${encodeURIComponent(order.edition)}`,cancel_url:`${cfg.origin}/fortune-teller?collector=cancelled&edition=${encodeURIComponent(order.edition)}`,expires_at:Math.floor(new Date(order.checkoutExpiresAt).getTime()/1000)
   },{idempotencyKey:`fold-pack-${order._id}`});
   await PackOrder.updateOne({_id:order._id,stripeSession:{$exists:false}},{$set:{stripeSession:checkout.id,livemode:checkout.livemode}});
   if(checkout.payment_status==='paid'){await settlePack(checkout,'checkout.session.completed');return json({paid:true});}
   if(checkout.status==='expired'){await settlePack(checkout,'checkout.session.expired');fail(409,'That checkout expired. Start a new purchase.');}
   return json({url:checkout.url});
  }
  return json({error:'Collection route not found'},404);
 }catch(e){if(!e.status)console.error('Collector request failed',{route,code:e.code||e.name});return json({error:e.status?e.message:'The collection could not finish that request. Please try again.'},e.status||503);}
}
