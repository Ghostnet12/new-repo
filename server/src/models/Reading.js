import mongoose from 'mongoose';
const readingSchema = new mongoose.Schema({
  clientHash:{type:String,required:true,index:true,select:false}, spreadKey:String, spreadName:String, question:{type:String,maxlength:180,default:''}, focus:String, need:String,
  profile:{name:String,gender:String,birthday:String}, cards:[{cardId:Number,name:String,position:String,reversed:Boolean}], analysis:{type:mongoose.Schema.Types.Mixed,required:true}, favorite:{type:Boolean,default:false}, notes:{type:String,maxlength:2000,default:''}
},{timestamps:true});
readingSchema.index({clientHash:1,createdAt:-1});
export const Reading = mongoose.models.Reading || mongoose.model('Reading', readingSchema);
