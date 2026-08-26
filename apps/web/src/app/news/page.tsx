import { Suspense } from 'react';
import dbConnect from '@/lib/db';
import News from '@/models/News';
import Category from '@/models/Category';
import NewsFeedClient from '@/components/news/NewsFeedClient';
import { BlogPost, Category as ICategory } from '@goalmills/types';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Sports News, Transfers & Pulse | GoalMills',
  description:
    'Stay ahead with breaking sports news, transfer intel, tactical analysis, and live updates across world football, NBA, cricket, and more.',
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
    <main className="min-h-screen bg-[#070B12] px-4 sm:px-6 lg:px-12 pt-[105px] pb-20">
      <div className="max-w-7xl mx-auto">
        <Suspense
          fallback={
            <div className="py-24 text-center text-slate-400">
              Loading sports pulse...
            </div>
          }
        >
          <NewsFeedClient
            initialNews={initialNews}
            initialCategories={initialCategories}
          />
        </Suspense>
      </div>
    </main>
  );
}
