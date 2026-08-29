import mongoose from 'mongoose';
import dns from 'node:dns';

// Fix Node.js DNS SRV resolution querySrv ECONNREFUSED issue on Windows/certain ISPs
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch {
  // Ignore if setServers is not supported in the current runtime
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  const mongodbUrl = process.env.MONGODB_URL;

  if (!mongodbUrl) {
    throw new Error('Please define the MONGODB_URL environment variable inside .env');
  }

  if (cached!.conn) {
    return cached!.conn;
  }

  if (!cached!.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    };

    cached!.promise = mongoose.connect(mongodbUrl, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }
  try {
    cached!.conn = await cached!.promise;
  } catch (e) {
    cached!.promise = null;
    throw e;
  }

  return cached!.conn;
}

export default dbConnect;
