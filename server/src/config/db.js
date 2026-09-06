import mongoose from 'mongoose';

let connectPromise;
export async function connectMongo() {
  const uri = process.env.MONGODB_URI;
  if (!uri) return false;
  if (mongoose.connection.readyState === 1) return true;
  if (!connectPromise) {
    connectPromise = mongoose.connect(uri, { serverSelectionTimeoutMS: 4000 })
      .then(() => true)
      .catch((error) => { console.error('MongoDB connection failed:', error.message); return false; })
      .finally(() => { connectPromise = undefined; });
  }
  return connectPromise;
}
export function dbStatus() {
  return mongoose.connection.readyState === 1 ? 'connected' : (process.env.MONGODB_URI ? 'disconnected' : 'not-configured');
}
