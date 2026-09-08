import mongoose from 'mongoose';

// Public sign/day material only. Never store profiles or questions in this cache.
const schema = new mongoose.Schema({
  _id:String,
  value:mongoose.Schema.Types.Mixed,
  retryAfter:Date,
  expiresAt:{type:Date,required:true}
},{versionKey:false});
schema.index({expiresAt:1},{expireAfterSeconds:0});
export const DailyHoroscopeCache = mongoose.models.DailyHoroscopeCache || mongoose.model('DailyHoroscopeCache',schema);
