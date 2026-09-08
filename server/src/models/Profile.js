import { TEXT_LIMIT } from '../validation/limits.js';
import mongoose from 'mongoose';
const profileSchema = new mongoose.Schema({
  clientHash:{type:String,required:true,unique:true,index:true,select:false}, name:{type:String,trim:true,maxlength:TEXT_LIMIT,default:''}, gender:{type:String,trim:true,maxlength:TEXT_LIMIT,default:''}, birthday:{type:String,default:''}, natal:{enabled:Boolean,time:String,place:{type:String,maxlength:TEXT_LIMIT},latitude:String,longitude:String,timezone:{type:String,maxlength:TEXT_LIMIT},timeAccuracy:String,disambiguation:String}, preferredSpread:{type:String,default:'three'}
},{timestamps:true});
export const Profile = mongoose.models.Profile || mongoose.model('Profile', profileSchema);
