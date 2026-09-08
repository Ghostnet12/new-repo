import { TEXT_LIMIT } from '../validation/limits.js';
import mongoose from 'mongoose';
const readingSchema=new mongoose.Schema({clientHash:{type:String,required:true,index:true,select:false},deckVersion:{type:String,required:true},spreadKey:String,spreadName:String,question:{type:String,maxlength:TEXT_LIMIT,default:''},focus:String,need:String,profile:{name:{type:String,maxlength:TEXT_LIMIT},gender:{type:String,maxlength:TEXT_LIMIT}},personalization:{type:mongoose.Schema.Types.Mixed,default:{}},cards:[{cardId:Number,name:String,position:String,reversed:Boolean}],analysis:{type:mongoose.Schema.Types.Mixed,required:true},favorite:{type:Boolean,default:false},notes:{type:String,maxlength:TEXT_LIMIT,default:''},expiresAt:{type:Date,default:null}},{timestamps:true});
readingSchema.index({clientHash:1,createdAt:-1});readingSchema.index({expiresAt:1},{expireAfterSeconds:0,sparse:true});
export const Reading=mongoose.models.Reading||mongoose.model('Reading',readingSchema);
