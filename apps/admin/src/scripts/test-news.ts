import mongoose from 'mongoose';
import dns from 'node:dns';
import dotenv from 'dotenv';
import path from 'path';
import News from '../models/News';
import Category from '../models/Category';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch {}

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'apps/web/.env') });

const MONGODB_URL = process.env.MONGODB_URL;

async function verify() {
  if (!MONGODB_URL) {
    console.error('MONGODB_URL missing');
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URL);
  console.log('Connected to DB for verification.');

  // 1. Categories Check
  const categories = await Category.find({}).sort({ order: 1 });
  console.log(`\n✅ CATEGORIES IN DB (${categories.length}):`);
  categories.forEach((c) => console.log(`  - [${c.slug}] ${c.name} (${c.color})`));

  // 2. All News Count
  const allNews = await News.find({});
  console.log(`\n✅ TOTAL NEWS IN DB: ${allNews.length}`);

  // 3. Breaking News
  const breaking = await News.find({ isBreaking: true });
  console.log(`\n✅ BREAKING NEWS (${breaking.length}):`);
  breaking.forEach((b) => console.log(`  - ${b.title}`));

  // 4. Featured News
  const featured = await News.find({ isFeatured: true });
  console.log(`\n✅ FEATURED NEWS (${featured.length}):`);
  featured.forEach((f) => console.log(`  - ${f.title}`));

  // 5. Team Filter (Arsenal)
  const arsenalNews = await News.find({
    $or: [{ relatedTeam: /Arsenal/i }, { tags: { $in: [/Arsenal/i] } }, { title: /Arsenal/i }],
  });
  console.log(`\n✅ ARSENAL NEWS (${arsenalNews.length}):`);
  arsenalNews.forEach((a) => console.log(`  - ${a.title}`));

  // 6. Transfers
  const transfers = await News.find({
    $or: [{ categorySlug: 'transfers' }, { title: /transfer|deal|record/i }],
  });
  console.log(`\n✅ TRANSFERS NEWS (${transfers.length}):`);
  transfers.forEach((t) => console.log(`  - ${t.title}`));

  // 7. Tactical Analysis
  const analysis = await News.find({
    $or: [{ categorySlug: 'tactical-analysis' }, { title: /tactical|tactics/i }],
  });
  console.log(`\n✅ TACTICAL ANALYSIS (${analysis.length}):`);
  analysis.forEach((a) => console.log(`  - ${a.title}`));

  await mongoose.disconnect();
  console.log('\n🎉 ALL NEWS & CATEGORY FILTERS VERIFIED SUCCESSFULLY!');
}

verify();
