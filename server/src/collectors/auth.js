import {randomBytes,createHash,scrypt as scryptCallback,timingSafeEqual} from 'node:crypto';
import {promisify} from 'node:util';
import {Collector,CollectorSession,AuthLimit} from './models.js';
const scrypt=promisify(scryptCallback);
export const digest=value=>createHash('sha256').update(value).digest('hex');
export const fail=(status,message)=>{throw Object.assign(new Error(message),{status});};
const name=value=>typeof value==='string'?value.trim().toLowerCase():'';
export async function passwordHash(value,salt=randomBytes(16).toString('hex')){return `${salt}:${(await scrypt(value,salt,64)).toString('hex')}`;}
async function matches(value,stored){const [salt,key]=stored.split(':');const computed=(await passwordHash(value,salt)).split(':')[1];return timingSafeEqual(Buffer.from(key,'hex'),Buffer.from(computed,'hex'));}
export async function authBudget(ip){const window=Math.floor(Date.now()/900000);const key=digest(`${ip}:${window}`);const v=await AuthLimit.findOneAndUpdate({_id:key},{$inc:{count:1},$setOnInsert:{expiresAt:new Date((window+2)*900000)}},{upsert:true,new:true});if(v.count>20)fail(429,'Too many sign-in attempts. Please try again in 15 minutes.');}
export async function signIn(action,input){
 const username=name(input?.username),password=input?.password;
 if(!/^[a-z0-9_-]{3,32}$/.test(username)||typeof password!=='string'||password.length<12||password.length>128)fail(400,'Use a username of 3–32 letters, numbers, underscores or hyphens and a password of 12–128 characters.');
 let user=await Collector.findOne({username}),recoveryCode;
 if(action==='register'){
  if(user)fail(409,'That username is unavailable.');
  recoveryCode=randomBytes(24).toString('hex');
  try{user=await Collector.create({username,password:await passwordHash(password),recovery:digest(recoveryCode)});}catch(e){if(e.code===11000)fail(409,'That username is unavailable.');throw e;}
 }else if(action==='recover'){
  if(!user||typeof input.recoveryCode!=='string'||!timingSafeEqual(Buffer.from(user.recovery,'hex'),Buffer.from(digest(input.recoveryCode.trim()),'hex')))fail(401,'The username or recovery key was not recognised.');
  recoveryCode=randomBytes(24).toString('hex');
  // Consume the previous recovery key exactly once, including concurrent requests.
  const changed=await Collector.findOneAndUpdate({_id:user._id,recovery:user.recovery},{$set:{password:await passwordHash(password),recovery:digest(recoveryCode)}},{new:true});
  if(!changed)fail(401,'That recovery key has already been used.');
  user=changed;await CollectorSession.deleteMany({owner:user._id});
 }else{
  const valid=await matches(password,user?.password||'00000000000000000000000000000000:'+('00'.repeat(64)));
  if(!user||!valid)fail(401,'The username or password was not recognised.');
 }
 const token=randomBytes(32).toString('hex');
 await CollectorSession.create({owner:user._id,token:digest(token),expiresAt:new Date(Date.now()+30*86400000)});
 return {user:{id:String(user._id),username:user.username},token,recoveryCode};
}
export function cookieToken(request){return /(?:^|;\s*)fold_collector=([a-f0-9]{64})(?:;|$)/.exec(request.headers.get('cookie')||'')?.[1];}
export async function account(request){const token=cookieToken(request);if(!token)return null;const session=await CollectorSession.findOne({token:digest(token),expiresAt:{$gt:new Date()}}).lean();if(!session)return null;return Collector.findById(session.owner).select('_id username').lean();}
export function sessionCookie(token='',secure=true){return `fold_collector=${token}; Path=/api/collectors; HttpOnly; SameSite=Strict; Max-Age=${token?2592000:0}${secure?'; Secure':''}`;}
