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
import { generatePersonSchema } from '@/lib/seo/schemaGenerator';
import { FiAward, FiShield, FiTrendingUp, FiActivity, FiTarget, FiZap } from 'react-icons/fi';
import { BlogPost } from '@goalmills/types';

export const dynamic = 'force-dynamic';

function resolvePlayer(identifier: string) {
  if (!identifier) return undefined;
  let player = EntityService.getPlayer(identifier);
  if (!player) {
    player = EntityService.getAllPlayers().find(
      (p) => String(p.id) === identifier || p.slug.toLowerCase() === identifier.toLowerCase()
    );
  }
  return player;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  const player = resolvePlayer(slug);
  if (!player) return { title: 'Player Profile | GoalMills' };

  return {
    title: `${player.name} (${player.position}) Profile, Stats & Transfers | GoalMills`,
    description: `${player.name} profile on GoalMills. In-depth career stats, goals, assists, biography, transfer intel, and tactical analysis.`,
  };
}

export default async function PlayerHubPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  const player = resolvePlayer(slug);

  if (!player) {
    notFound();
  }

  const club = EntityService.getClub(player.clubSlug);

  // Person Schema.org JSON-LD
  const personSchema = generatePersonSchema({
    name: player.name,
    slug: player.slug,
    photo: player.photo,
    teamName: player.clubName,
    nationality: player.nationality,
    position: player.position,
    bio: player.bio,
  });

  // Fetch articles related to this player
  let playerArticles: BlogPost[] = [];
  try {
    await dbConnect();
    const articlesDocs = await News.find({
      $or: [
        { 'players.slug': player.slug },
        { tags: { $in: [player.name, player.slug] } },
        { title: { $regex: new RegExp(player.name.split(' ')[1] || player.name, 'i') } },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    playerArticles = JSON.parse(JSON.stringify(articlesDocs));
  } catch (err) {
    console.error('Error fetching player articles:', err);
  }

  // Get player transfer tracker
  const playerTransfers = EntityService.getTransfers().filter((t) => t.playerSlug === player.slug);

  return (
    <ContentHubLayout
      breadcrumbs={[
        { name: 'Football', url: '/football' },
        { name: 'Players', url: '/football' },
        { name: player.name, url: `/players/${player.slug}` },
      ]}
      header={
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
          />
          <EntityHeader
            type="player"
            title={`${player.name} #${player.number}`}
            subtitle={`${player.position} • ${player.clubName}`}
            image={player.photo}
            flag={player.countryFlag}
            parentEntity={{
              name: player.clubName,
              url: club ? `/football/${club.competitionSlug}/${club.slug}` : '/football',
            }}
            badges={[
              { label: 'Market Value', value: player.marketValue, icon: <FiTrendingUp /> },
              { label: 'Goals (25/26)', value: player.seasonStats.goals, icon: <FiTarget /> },
              { label: 'Assists', value: player.seasonStats.assists, icon: <FiActivity /> },
              { label: 'Rating', value: player.seasonStats.rating, icon: <FiAward /> },
            ]}
          />
        </>
      }
      sidebar={
        <div className="space-y-6">
          {/* Bio Card */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 space-y-3">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <FiShield className="text-blue-400" />
              <span>Biography & Info</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">{player.bio}</p>
            <div className="pt-3 border-t border-white/5 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-500 font-bold block">Nationality:</span>
                <span className="text-white font-semibold">
                  {player.countryFlag} {player.nationality}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-bold block">Age:</span>
                <span className="text-white font-semibold">{player.age} yrs</span>
              </div>
              <div>
                <span className="text-slate-500 font-bold block">Height:</span>
                <span className="text-white font-semibold">{player.height}</span>
              </div>
              <div>
                <span className="text-slate-500 font-bold block">Pass Accuracy:</span>
                <span className="text-emerald-400 font-bold">
                  {player.seasonStats.passAccuracy}
                </span>
              </div>
            </div>
          </div>

          {/* Transfer Radar */}
          {playerTransfers.length > 0 && (
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <FiTrendingUp className="text-emerald-400" />
                  <span>Transfer Status</span>
                </h3>
              </div>
              <div className="space-y-3">
                {playerTransfers.map((t) => (
                  <TransferCenterCard key={t.id} transfer={t} />
                ))}
              </div>
            </div>
          )}
        </div>
      }
    >
      {/* Season Breakdown Stats Cards */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Appearances
          </span>
          <p className="text-2xl sm:text-3xl font-black text-white mt-1">
            {player.seasonStats.appearances}
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
            Goals Scored
          </span>
          <p className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">
            {player.seasonStats.goals}
          </p>
        </div>
        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 text-center">
          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
            Assists
          </span>
          <p className="text-2xl sm:text-3xl font-black text-blue-400 mt-1">
            {player.seasonStats.assists}
          </p>
        </div>
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-center">
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
            Match Rating
          </span>
          <p className="text-2xl sm:text-3xl font-black text-amber-400 mt-1">
            {player.seasonStats.rating}
          </p>
        </div>
      </section>

      {/* Linked Articles & Deep Dives */}
      {playerArticles.length > 0 ? (
        <RelatedArticlesMatrix
          title={`Articles & Intelligence Featuring ${player.name}`}
          subtitle={`Match reports, tactical analysis, transfer intel, and interviews`}
          articles={playerArticles}
        />
      ) : (
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 text-center text-slate-400">
          <p className="text-sm">No recent articles tagged for {player.name} yet.</p>
        </div>
      )}
    </ContentHubLayout>
  );
}
