import mongoose from 'mongoose';
const profileSchema = new mongoose.Schema({
  clientHash:{type:String,required:true,unique:true,index:true,select:false}, name:{type:String,trim:true,maxlength:50,default:''}, gender:{type:String,trim:true,maxlength:30,default:''}, birthday:{type:String,default:''}, preferredSpread:{type:String,default:'three'}
},{timestamps:true});
export const Profile = mongoose.models.Profile || mongoose.model('Profile', profileSchema);
