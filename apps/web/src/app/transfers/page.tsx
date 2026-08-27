import { Metadata } from 'next';
import Link from 'next/link';
import dbConnect from '@/lib/db';
import News from '@/models/News';
import { EntityService } from '@/lib/entityService';
import { ContentHubLayout } from '@/components/ContentHubLayout';
import { TransferCenterCard } from '@/components/TransferCenterCard';
import { RelatedArticlesMatrix } from '@/components/RelatedArticlesMatrix';
import { FiTrendingUp, FiCheckCircle, FiClock, FiDollarSign } from 'react-icons/fi';
import { BlogPost } from '@goalmills/types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Transfer Center: Confirmed Deals, Rumours & Market Intel | GoalMills',
  description:
    'Real-time sports transfer ecosystem: Done deals, advanced negotiations, verified rumours, Premier League & African player market movements, and tactical transfer fit analysis.',
};

export default async function TransfersPage() {
  const transfers = EntityService.getTransfers();
  const doneDeals = transfers.filter((t) => t.status === 'done_deal');
  const negotiations = transfers.filter(
    (t) => t.status === 'negotiation' || t.status === 'agreement' || t.status === 'medical'
  );
  const rumours = transfers.filter((t) => t.status === 'rumour');

  let transferArticles: BlogPost[] = [];
  try {
    await dbConnect();
    const articlesDocs = await News.find({
      $or: [
        { articleType: 'transfer' },
        { category: { $regex: /transfer/i } },
        { categorySlug: 'transfers' },
        { tags: { $in: ['Transfers', 'Done Deal', 'Rumour', 'Transfer Window'] } },
      ],
    })
      .sort({ isBreaking: -1, createdAt: -1 })
      .limit(6)
      .lean();

    transferArticles = JSON.parse(JSON.stringify(articlesDocs));
  } catch (err) {
    console.error('Error loading transfer articles:', err);
  }

  return (
    <ContentHubLayout
      breadcrumbs={[{ name: 'Transfer Center', url: '/transfers' }]}
      header={
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-[#140b2e] via-[#0d1527] to-[#060b18] p-6 sm:p-10 shadow-2xl">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-black uppercase tracking-widest">
              <FiTrendingUp /> 24/7 TRANSFER ECOSYSTEM
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Football Transfer Command Center
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Track official announcements, fee breakdowns, contract terms, medicals, agent talks,
              and tactical analyses of how new signings fit their squads.
            </p>
          </div>
        </div>
      }
      sidebar={
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 space-y-3">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <FiDollarSign className="text-amber-400" />
              <span>Transfer Tiers Guide</span>
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="font-bold text-emerald-400 block">Tier 1: Official & Verified</span>
                <span className="text-slate-300">Direct club announcements and verified signatures.</span>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <span className="font-bold text-blue-400 block">Tier 2: Advanced Negotiations</span>
                <span className="text-slate-300">Personal terms agreed & active fee discussions.</span>
              </div>
              <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <span className="font-bold text-purple-400 block">Tier 3: Verified Interest</span>
                <span className="text-slate-300">Scouting inquiries and club monitoring leads.</span>
              </div>
            </div>
          </div>
        </div>
      }
    >
      {/* Confirmed Done Deals Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-600/30 text-emerald-400 text-sm">
              <FiCheckCircle />
            </span>
            <span>Confirmed Done Deals</span>
          </h2>
          <span className="text-xs font-bold text-slate-400">{doneDeals.length} Verified</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {doneDeals.map((t) => (
            <TransferCenterCard key={t.id} transfer={t} />
          ))}
        </div>
      </section>

      {/* Active Negotiations */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-600/30 text-blue-400 text-sm">
              <FiClock />
            </span>
            <span>Advanced Negotiations & Medicals</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {negotiations.map((t) => (
            <TransferCenterCard key={t.id} transfer={t} />
          ))}
        </div>
      </section>

      {/* Verified Rumours */}
      {rumours.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-purple-600/30 text-purple-400 text-sm">
                ⚡
              </span>
              <span>Verified Market Rumours</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {rumours.map((t) => (
              <TransferCenterCard key={t.id} transfer={t} />
            ))}
          </div>
        </section>
      )}

      {/* Transfer Editorial & Tactical Fit Analyses */}
      {transferArticles.length > 0 && (
        <RelatedArticlesMatrix
          title="Transfer Analysis & Tactical Fit Breakdown"
          subtitle="How new signings elevate their clubs, tactical compatibility, and market value insights"
          articles={transferArticles}
        />
      )}
    </ContentHubLayout>
  );
}
