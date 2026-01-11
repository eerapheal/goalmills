import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User from '../models/User';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGODB_URL = process.env.MONGODB_URL;

async function promote(email: string) {
  try {
    if (!MONGODB_URL) throw new Error("MONGODB_URL not found");
    await mongoose.connect(MONGODB_URL);
    console.log('Connected to MongoDB');

    const user = await User.findOneAndUpdate(
      { email },
      { role: 'super-admin' },
      { new: true }
    );

    if (user) {
      console.log(`User ${email} promoted to super-admin successfully`);
    } else {
      console.log(`User with email ${email} not found`);
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

const email = process.argv[2];
if (!email) {
  console.log("Usage: npx tsx src/scripts/promote-user.ts <email>");
  process.exit(1);
}

promote(email);
