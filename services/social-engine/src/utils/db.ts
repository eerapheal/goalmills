/**
 * GoalMills Social Engine — Database Connection
 *
 * Reuses the same singleton connection pattern as apps/admin/src/lib/db.ts.
 */

import mongoose from 'mongoose';
import dns from 'node:dns';
import { logger } from './logger';

// Fix Node.js DNS SRV resolution querySrv ECONNREFUSED issue on Windows/certain ISPs
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch {
  // Ignore if setServers is not supported in the current runtime
}

let isConnected = false;

/**
 * Connect to MongoDB. Returns the mongoose instance.
 * Safe to call multiple times — will reuse existing connection.
 */
export async function dbConnect(): Promise<typeof mongoose> {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose;
  }

  const mongodbUrl = process.env.MONGODB_URL;
  if (!mongodbUrl) {
    throw new Error('MONGODB_URL environment variable is not defined');
  }

  try {
    await mongoose.connect(mongodbUrl, {
      bufferCommands: false,
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = true;
    logger.info('Connected to MongoDB');
    return mongoose;
  } catch (err) {
    logger.error('MongoDB connection failed', err);
    throw err;
  }
}

/**
 * Disconnect from MongoDB gracefully.
 */
export async function dbDisconnect(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
    logger.info('Disconnected from MongoDB');
  }
}

export { dbConnect as connectDB };

