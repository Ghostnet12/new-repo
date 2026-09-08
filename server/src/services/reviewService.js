import mongoose from 'mongoose';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { connectMongo } from '../config/db.js';
import { TEXT_LIMIT } from '../validation/limits.js';
export const reviewInput=z.object({name:z.string().trim().min(1,'Add a display name.').max(TEXT_LIMIT),rating:z.number().int().min(1,'Choose a star rating.').max(5),comment:z.string().trim().min(10,'Please write at least 10 characters.').max(TEXT_LIMIT),consent:z.literal(true,{errorMap:()=>({message:'Confirm that your review will be public.'})}),website:z.string().max(0).optional().default('')});
const schema=new mongoose.Schema({_id:String,publicId:{type:String,default:randomUUID},name:String,rating:{type:Number,min:1,max:5},comment:String,createdAt:{type:Date,default:Date.now},updatedAt:{type:Date,default:Date.now}},{versionKey:false});
schema.index({createdAt:-1});
const Review=mongoose.models.FoldReview||mongoose.model('FoldReview',schema);
const quotaSchema=new mongoose.Schema({_id:String,used:Number,expiresAt:Date},{versionKey:false});quotaSchema.index({expiresAt:1},{expireAfterSeconds:0});
const Quota=mongoose.models.FoldReviewQuota||mongoose.model('FoldReviewQuota',quotaSchema);
const publicFields='publicId name rating comment createdAt updatedAt -_id';
export function createReviewService({connect=connectMongo,model=Review,quota=Quota,now=()=>new Date()}={}) {
 async function ready(){if(!await connect())throw Object.assign(new Error('Reviews are temporarily unavailable. Please try again shortly.'),{status:503});}
 async function reserve(hash){const date=now(),window=Math.floor(+date/3600000);try{return Boolean(await quota.findOneAndUpdate({_id:hash+':'+window,used:{$lt:6}},{$inc:{used:1},$setOnInsert:{expiresAt:new Date((window+2)*3600000)}},{upsert:true,new:true}));}catch{return false;}}
 return {
 async list(rawPage){await ready();const page=Math.max(1,Math.min(10000,Math.floor(Number(rawPage)||1)));const [reviews,summary]=await Promise.all([model.find({}).sort({createdAt:-1,_id:-1}).skip((page-1)*12).limit(12).select(publicFields).lean(),model.aggregate([{$group:{_id:null,count:{$sum:1},average:{$avg:'$rating'}}}])]);return {reviews,page,total:summary[0]?.count||0,average:summary[0]?.average||null};},
 async mine(hash){await ready();return {review:await model.findById(hash).select(publicFields).lean()};},
 async save(hash,body){const parsed=reviewInput.safeParse(body);if(!parsed.success)throw Object.assign(new Error(parsed.error.issues[0].message),{status:400});if(!/^[a-f0-9]{64}$/.test(hash||''))throw Object.assign(new Error('Invalid review identity.'),{status:401});await ready();if(!await reserve(hash))throw Object.assign(new Error('Please wait before changing your review again. You can make six changes per hour.'),{status:429});const {name,rating,comment}=parsed.data;const review=await model.findOneAndUpdate({_id:hash},{$set:{name,rating,comment,updatedAt:now()},$setOnInsert:{createdAt:now(),publicId:randomUUID()}},{new:true,upsert:true,runValidators:true}).select(publicFields).lean();return {review};},
 async remove(hash){await ready();await model.deleteOne({_id:hash});return {deleted:true};}
 };
}
export const reviews=createReviewService();
export async function reviewResult(action){try{return {status:200,body:await action()};}catch(error){return {status:error.status||503,body:{error:error.status?error.message:'Reviews could not be loaded or saved. Please try again.'}};}}
