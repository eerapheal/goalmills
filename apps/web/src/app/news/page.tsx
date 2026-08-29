import { Suspense } from 'react';
import dbConnect from '@/lib/db';
import News from '@/models/News';
import Category from '@/models/Category';
import NewsFeedClient from '@/components/news/NewsFeedClient';
import { BlogPost, Category as ICategory } from '@goalmills/types';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Breaking Sports News, Football Transfer Rumours & Match Reports | GoalMills',
  description:
    'Stay updated with breaking sports news, football transfer rumours, confirmed deals, match previews, lineups, and post-match reports across world football, NBA, cricket, and more.',
};

export default async function NewsPage() {
  let initialNews: BlogPost[] = [];
  let initialCategories: ICategory[] = [];

  try {
    await dbConnect();
    const [newsDocs, catDocs] = await Promise.all([
      News.find({}).sort({ createdAt: -1 }).lean(),
      Category.find({}).sort({ order: 1, createdAt: 1 }).lean(),
    ]);

    initialNews = JSON.parse(JSON.stringify(newsDocs));
    initialCategories = JSON.parse(JSON.stringify(catDocs));
  } catch (err) {
    console.error('Error fetching initial news data:', err);
  }

  return (
    <main className="min-h-screen bg-[#070E1A] text-white selection:bg-amber-500 selection:text-slate-950 px-4 sm:px-6 lg:px-12 pt-[100px] sm:pt-[105px] pb-20 relative overflow-hidden">
      {/* Ambient Glows */}
      <div className="fixed top-0 left-1/4 h-[500px] w-[500px] bg-blue-600/10 blur-[150px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 h-[600px] w-[600px] bg-amber-500/5 blur-[160px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto">
        <Suspense
          fallback={<div className="py-24 text-center text-slate-400 font-bold">Loading sports pulse...</div>}
        >
          <NewsFeedClient initialNews={initialNews} initialCategories={initialCategories} />
        </Suspense>
      </div>
    </main>
  );
}
