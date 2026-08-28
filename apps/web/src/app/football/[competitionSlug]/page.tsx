import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import dbConnect from '@/lib/db';
import News from '@/models/News';
import { EntityService, CLUBS_REGISTRY } from '@/lib/entityService';
import { ContentHubLayout } from '@/components/ContentHubLayout';
import { EntityHeader } from '@/components/EntityHeader';
import { RelatedArticlesMatrix } from '@/components/RelatedArticlesMatrix';
import { TransferCenterCard } from '@/components/TransferCenterCard';
import { FootballStandingsTable } from '@/components/FootballStandingsTable';
import { FootballTopScorers } from '@/components/FootballTopScorers';
import { advancedFootballApi } from '@/services/advancedFootballApi';
import { FiCalendar, FiUsers, FiAward, FiShield, FiTrendingUp } from 'react-icons/fi';
import { BlogPost, FootballStanding, FootballTopscorer } from '@goalmills/types';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ competitionSlug: string }>;
}): Promise<Metadata> {
  const { competitionSlug } = await params;
  const comp = EntityService.getCompetition(competitionSlug);
  if (!comp) return { title: 'Competition Hub | GoalMills' };

  return {
    title: `${comp.name} Hub: Fixtures, Table, Clubs, News & Stats | GoalMills`,
    description: `${comp.name} (${comp.season}) complete hub. Access live match results, league tables, squad lists, transfer rumors, and tactical analysis.`,
  };
}

export default async function CompetitionHubPage({
  params,
}: {
  params: Promise<{ competitionSlug: string }>;
}) {
  const { competitionSlug } = await params;
  const comp = EntityService.getCompetition(competitionSlug);

  if (!comp) {
    notFound();
  }

  // Fetch articles related to this competition
  let competitionArticles: BlogPost[] = [];
  let transferArticles: BlogPost[] = [];

  try {
    await dbConnect();
    const [articlesDocs, transferDocs] = await Promise.all([
      News.find({
        $or: [
          { competitionSlug: comp.slug },
          { category: { $regex: new RegExp(comp.name.split(' ')[0], 'i') } },
          { tags: { $in: [comp.name, comp.slug] } },
        ],
      })
        .sort({ isBreaking: -1, createdAt: -1 })
        .limit(6)
        .lean(),
      News.find({
        articleType: 'transfer',
        $or: [{ competitionSlug: comp.slug }, { tags: { $in: [comp.name, comp.slug] } }],
      })
        .sort({ createdAt: -1 })
        .limit(3)
        .lean(),
    ]);

    competitionArticles = JSON.parse(JSON.stringify(articlesDocs));
    transferArticles = JSON.parse(JSON.stringify(transferDocs));
  } catch (err) {
    console.error('Error fetching competition articles:', err);
  }

  // Fetch Standings & Top Scorers via advancedFootballApi
  let standingsData: FootballStanding[] = [];
  let topScorersData: FootballTopscorer[] = [];

  try {
    const [standingsRes, scorersRes] = await Promise.all([
      advancedFootballApi
        .getStandings(comp.id)
        .catch(() => ({ success: 0, result: { total: [] } })),
      advancedFootballApi.getTopscorers(comp.id).catch(() => ({ success: 0, result: [] })),
    ]);

    if (standingsRes?.result?.total && Array.isArray(standingsRes.result.total)) {
      standingsData = standingsRes.result.total;
    }
    if (scorersRes?.result && Array.isArray(scorersRes.result)) {
      topScorersData = scorersRes.result.slice(0, 10);
    }
  } catch (err) {
    console.error('Error fetching sports API data for competition:', err);
  }

  // Filter registered clubs that belong to this competition
  const clubs = Object.values(CLUBS_REGISTRY).filter((c) => c.competitionSlug === comp.slug);
  const competitionTransfers = EntityService.getTransfers({ competitionSlug: comp.slug });

  return (
    <ContentHubLayout
      breadcrumbs={[
        { name: 'Football', url: '/football' },
        { name: comp.name, url: `/football/${comp.slug}` },
      ]}
      header={
        <EntityHeader
          type="competition"
          title={comp.name}
          subtitle={comp.description}
          image={comp.logo}
          parentEntity={{ name: 'Football Hub', url: '/football' }}
          badges={[
            { label: 'Season', value: comp.season, icon: <FiCalendar /> },
            { label: 'Country / Region', value: comp.country, icon: <FiAward /> },
            { label: 'Registered Clubs', value: clubs.length || 20, icon: <FiUsers /> },
          ]}
        />
      }
      sidebar={
        <div className="space-y-6">
          {/* Participating Clubs */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <FiShield className="text-blue-400" />
                <span>{comp.name} Clubs</span>
              </h3>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Level 3 Hubs</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {clubs.map((club) => (
                <Link
                  key={club.slug}
                  href={`/football/${comp.slug}/${club.slug}`}
                  className="group flex flex-col items-center text-center p-3 rounded-2xl bg-white/[0.02] hover:bg-blue-600/20 border border-white/5 hover:border-blue-500/30 transition-all"
                >
                  <div className="relative h-10 w-10 rounded-xl bg-slate-900 p-1.5 mb-1.5 flex items-center justify-center">
                    <Image
                      src={club.logo}
                      alt={club.name}
                      width={32}
                      height={32}
                      className="object-contain"
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-200 group-hover:text-white truncate max-w-full">
                    {club.shortName}
                  </span>
                  <span className="text-[10px] text-blue-400 font-bold">Pos: #{club.position}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Transfer Radar */}
          {competitionTransfers.length > 0 && (
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <FiTrendingUp className="text-emerald-400" />
                  <span>Transfer Desk</span>
                </h3>
                <Link href="/transfers" className="text-xs font-bold text-blue-400 hover:underline">
                  View All →
                </Link>
              </div>
              <div className="space-y-3">
                {competitionTransfers.map((t) => (
                  <TransferCenterCard key={t.id} transfer={t} />
                ))}
              </div>
            </div>
          )}
        </div>
      }
    >
      {/* League Standings Table */}
      {standingsData.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-600/30 text-blue-400 text-sm">
                🏆
              </span>
              <span>{comp.name} Standings</span>
            </h2>
          </div>
          <FootballStandingsTable standings={standingsData} leagueId={comp.id} />
        </section>
      )}

      {/* Top Scorers */}
      {topScorersData.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-600/30 text-amber-400 text-sm">
                ⚽
              </span>
              <span>Golden Boot & Top Scorers</span>
            </h2>
          </div>
          <FootballTopScorers scorers={topScorersData} />
        </section>
      )}

      {/* Related News & Tactical Breakdown */}
      {competitionArticles.length > 0 ? (
        <RelatedArticlesMatrix
          title={`Latest ${comp.name} News & Analysis`}
          subtitle={`Verified reporting, club press updates, and tactical columns for ${comp.name}`}
          articles={competitionArticles}
        />
      ) : (
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 text-center text-slate-400">
          <p className="text-sm">
            Stay tuned for upcoming editorial reports and match previews for {comp.name}.
          </p>
        </div>
      )}
    </ContentHubLayout>
  );
}
