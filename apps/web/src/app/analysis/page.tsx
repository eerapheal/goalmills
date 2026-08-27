import { Metadata } from 'next';
import Link from 'next/link';
import dbConnect from '@/lib/db';
import News from '@/models/News';
import { ContentHubLayout } from '@/components/ContentHubLayout';
import { RelatedArticlesMatrix } from '@/components/RelatedArticlesMatrix';
import { FiTrendingUp, FiActivity, FiLayers, FiCompass, FiTarget } from 'react-icons/fi';
import { BlogPost } from '@goalmills/types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Tactical & Statistical Analysis Hub | GoalMills',
  description:
    'In-depth football tactical breakdowns, manager philosophies, player scouting reports, pressing metrics, and statistical intelligence.',
};

export default async function AnalysisHubPage() {
  let tacticalArticles: BlogPost[] = [];
  let playerAnalysisArticles: BlogPost[] = [];
  let statsArticles: BlogPost[] = [];

  try {
    await dbConnect();
    const [tacDocs, playerDocs, statDocs] = await Promise.all([
      News.find({
        $or: [
          { articleType: 'tactical_analysis' },
          { category: { $regex: /tactical|tactics/i } },
        ],
      })
        .sort({ views: -1, createdAt: -1 })
        .limit(6)
        .lean(),
      News.find({
        $or: [
          { articleType: 'player_analysis' },
          { category: { $regex: /player analysis|scout/i } },
        ],
      })
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
      News.find({
        $or: [
          { category: { $regex: /stat|metric/i } },
          { tags: { $in: ['Statistics', 'Data', 'Analytics'] } },
        ],
      })
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
    ]);

    tacticalArticles = JSON.parse(JSON.stringify(tacDocs));
    playerAnalysisArticles = JSON.parse(JSON.stringify(playerDocs));
    statsArticles = JSON.parse(JSON.stringify(statDocs));
  } catch (err) {
    console.error('Error loading analysis data:', err);
  }

  const analysisCategories = [
    {
      title: 'Tactical Analysis',
      desc: 'Formations, high-pressing structures, transition phases, and set-piece innovations.',
      icon: <FiLayers className="text-blue-400" size={20} />,
      slug: 'tactical-analysis',
    },
    {
      title: 'Player Deep Dives',
      desc: 'Heatmaps, passing networks, xG overperformance, and progressive carry metrics.',
      icon: <FiTarget className="text-emerald-400" size={20} />,
      slug: 'player-analysis',
    },
    {
      title: 'Statistical Debriefs',
      desc: '5 statistics that explain the weekend fixtures, expected points (xPTS) and trends.',
      icon: <FiActivity className="text-amber-400" size={20} />,
      slug: 'statistical-analysis',
    },
  ];

  return (
    <ContentHubLayout
      breadcrumbs={[{ name: 'Analysis Hub', url: '/analysis' }]}
      header={
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-[#0d1c38] via-[#09152b] to-[#050b17] p-6 sm:p-10 shadow-2xl">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-black uppercase tracking-widest">
              <FiCompass /> TACTICAL & DATA LAB
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              GoalMills Sports Intelligence & Analysis Hub
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Move beyond basic scores. Discover why teams win, how managers organize their press,
              and what the advanced metrics reveal about Europe and Africa's top performers.
            </p>
          </div>
        </div>
      }
      sidebar={
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <FiCompass className="text-blue-400" />
              <span>Intelligence Pillars</span>
            </h3>
            <div className="space-y-3">
              {analysisCategories.map((cat) => (
                <div key={cat.slug} className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                  <div className="flex items-center gap-2.5">
                    {cat.icon}
                    <h4 className="text-xs font-bold text-white">{cat.title}</h4>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{cat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      }
    >
      {/* Tactical Analysis Showcase */}
      {tacticalArticles.length > 0 && (
        <RelatedArticlesMatrix
          title="Team Tactics & Match Breakdowns"
          subtitle="Tactical setups, transition speeds, and pressing efficiency"
          articles={tacticalArticles}
        />
      )}

      {/* Player Deep Dives */}
      {playerAnalysisArticles.length > 0 && (
        <RelatedArticlesMatrix
          title="Player Profiles & Tactical Fits"
          subtitle="How individual talent adapts to coach demands and team systems"
          articles={playerAnalysisArticles}
        />
      )}

      {/* Statistical Trends */}
      {statsArticles.length > 0 && (
        <RelatedArticlesMatrix
          title="Data & Numbers That Tell the Story"
          subtitle="xG, xA, progressive passes, and statistical milestones"
          articles={statsArticles}
        />
      )}
    </ContentHubLayout>
  );
}
