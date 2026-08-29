import { Metadata } from 'next';
import Link from 'next/link';
import dbConnect from '@/lib/db';
import News from '@/models/News';
import { ContentHubLayout } from '@/components/ContentHubLayout';
import { RelatedArticlesMatrix } from '@/components/RelatedArticlesMatrix';
import { SportsPulseNewsSection } from '@/components/SportsPulseNewsSection';
import { FiTrendingUp, FiActivity, FiZap, FiVideo, FiCompass, FiLayers, FiRadio } from 'react-icons/fi';
import { BlogPost } from '@goalmills/types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'The Sports Pulse & Headlines | GoalMills',
  description:
    'Real-time breaking sports news, video match highlights, transfer intel, tactical analysis, and 24/7 global sporting headlines.',
};

export default async function SportsPulsePage() {
  let breakingArticles: BlogPost[] = [];
  let videoArticles: BlogPost[] = [];
  let transferArticles: BlogPost[] = [];

  try {
    await dbConnect();
    const [breakDocs, vidDocs, transferDocs] = await Promise.all([
      News.find({
        $or: [
          { isHot: true },
          { category: { $regex: /pulse|headline|breaking/i } },
          { tags: { $in: ['Breaking', 'Trending', 'Hot'] } },
        ],
      })
        .sort({ views: -1, createdAt: -1 })
        .limit(6)
        .lean(),
      News.find({
        $or: [
          { articleType: 'video' },
          { category: { $regex: /video|highlight/i } },
          { videoUrl: { $exists: true, $ne: '' } },
        ],
      })
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
      News.find({
        $or: [
          { articleType: 'transfer' },
          { category: { $regex: /transfer/i } },
          { tags: { $in: ['Transfers', 'Rumours', 'Done Deal'] } },
        ],
      })
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
    ]);

    breakingArticles = JSON.parse(JSON.stringify(breakDocs));
    videoArticles = JSON.parse(JSON.stringify(vidDocs));
    transferArticles = JSON.parse(JSON.stringify(transferDocs));
  } catch (err) {
    console.error('Error loading sports pulse data:', err);
  }

  const pulseCategories = [
    {
      title: 'Breaking Headlines',
      desc: 'Instant major stories, matchday controversies, and breaking tournament updates.',
      icon: <FiZap className="text-orange-400" size={20} />,
      slug: 'breaking-news',
    },
    {
      title: 'Video Highlights & Plays',
      desc: 'Top goals, match deciders, buzzer-beaters, and wicket compilations.',
      icon: <FiVideo className="text-amber-400" size={20} />,
      slug: 'video-highlights',
    },
    {
      title: 'Transfer Radar',
      desc: 'Confirmed signings, agent intel, buyout clauses, and contract renewals.',
      icon: <FiTrendingUp className="text-orange-300" size={20} />,
      slug: 'transfers',
    },
  ];

  return (
    <>
      <ContentHubLayout
        breadcrumbs={[{ name: 'Sports Pulse & Headlines', url: '/sports-pulse' }]}
        header={
          <div className="relative overflow-hidden rounded-3xl border border-orange-500/20 bg-gradient-to-r from-[#170e06] via-[#0d1424] to-[#060b17] p-6 sm:p-10 shadow-2xl shadow-orange-950/20">
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative max-w-3xl space-y-4">
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                The Sports{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-200">
                  Pulse & Headlines
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Stay informed with curated matchday analysis, breaking tournament stories,
                instant HD video highlights, and real-time VIP sports pulse alerts.
              </p>
            </div>
          </div>
        }
        sidebar={
          <div className="space-y-6">
            <div className="rounded-3xl border border-orange-500/15 bg-white/[0.02] p-5 space-y-4 shadow-lg shadow-orange-950/10">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <FiRadio className="text-orange-400" />
                <span>Pulse Channels</span>
              </h3>
              <div className="space-y-3">
                {pulseCategories.map((cat) => (
                  <div
                    key={cat.slug}
                    className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-orange-500/25 transition-colors space-y-1"
                  >
                    <div className="flex items-center gap-2.5">
                      {cat.icon}
                      <h4 className="text-xs font-bold text-white">{cat.title}</h4>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{cat.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Explore More Sections
              </h4>
              <div className="flex flex-col space-y-2 text-xs">
                <Link
                  href="/news"
                  className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-orange-500/40 text-slate-300 hover:text-white transition-all flex items-center justify-between"
                >
                  <span>All Breaking News</span>
                  <span className="text-orange-400 font-bold">→</span>
                </Link>
                <Link
                  href="/highlights"
                  className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-orange-500/40 text-slate-300 hover:text-white transition-all flex items-center justify-between"
                >
                  <span>Video Highlights</span>
                  <span className="text-orange-400 font-bold">→</span>
                </Link>
                <Link
                  href="/analysis"
                  className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-orange-500/40 text-slate-300 hover:text-white transition-all flex items-center justify-between"
                >
                  <span>Tactical Analysis Hub</span>
                  <span className="text-orange-400 font-bold">→</span>
                </Link>
              </div>
            </div>
          </div>
        }
      >
        {/* Breaking & Trending Stories */}
        {breakingArticles.length > 0 && (
          <RelatedArticlesMatrix
            title="Trending Stories & Breaking Debriefs"
            subtitle="Top stories shaping today's sports conversations"
            articles={breakingArticles}
          />
        )}

        {/* Video Highlights Grid */}
        {videoArticles.length > 0 && (
          <RelatedArticlesMatrix
            title="Match Video Highlights & Top Plays"
            subtitle="Decisive goals, key moments, and tactical analysis clips"
            articles={videoArticles}
          />
        )}

        {/* Transfer Radar */}
        {transferArticles.length > 0 && (
          <RelatedArticlesMatrix
            title="Transfer Pulse & Contract Rumours"
            subtitle="Global movements, release clauses, and scout reports"
            articles={transferArticles}
          />
        )}
      </ContentHubLayout>

      {/* Section 2: Trending Sports Pulse, Video Highlights & VIP Alerts */}
      <SportsPulseNewsSection />
    </>
  );
}
