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
import { PlayerImage } from '@/components/players/PlayerImage';
import { generatePersonSchema } from '@/lib/seo/schemaGenerator';
import {
  FiAward,
  FiShield,
  FiTrendingUp,
  FiActivity,
  FiTarget,
  FiZap,
  FiCheckCircle,
  FiBarChart2,
} from 'react-icons/fi';
import { BlogPost, FootballPlayer } from '@goalmills/types';
import { advancedFootballApi } from '@/services/advancedFootballApi';

export const dynamic = 'force-dynamic';

async function resolvePlayerOrFetchApi(identifier: string) {
  if (!identifier) return null;

  // 1. Check curated EntityService
  let player = EntityService.getPlayer(identifier);
  if (!player) {
    player = EntityService.getAllPlayers().find(
      (p) => String(p.id) === identifier || p.slug.toLowerCase() === identifier.toLowerCase()
    );
  }
  if (player) {
    return { type: 'curated' as const, data: player };
  }

  // 2. Query Live AllSportsAPI
  try {
    const isNumeric = /^\d+$/.test(identifier);
    const apiRes = await advancedFootballApi.getPlayers(
      isNumeric ? { playerId: identifier } : { playerName: identifier.replace(/-/g, ' ') }
    );

    if (apiRes?.result && apiRes.result.length > 0) {
      const apiPlayer = apiRes.result[0];
      return { type: 'api' as const, data: apiPlayer };
    }
  } catch (err) {
    console.error('Error querying player from AllSportsAPI:', err);
  }

  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  const resolved = await resolvePlayerOrFetchApi(slug);

  if (!resolved) return { title: 'Player Profile | GoalMills' };

  if (resolved.type === 'curated') {
    const player = resolved.data;
    return {
      title: `${player.name} (${player.position}) Profile, Stats & Transfers | GoalMills`,
      description: `${player.name} profile on GoalMills. In-depth career stats, goals, assists, biography, transfer intel, and tactical analysis.`,
    };
  } else {
    const p = resolved.data;
    return {
      title: `${p.player_name} (${p.player_type || 'Footballer'}) Profile & Live Stats | GoalMills`,
      description: `${p.player_name} (${p.team_name || 'Club'}) football statistics, appearances, goals, yellow/red cards, and ratings on GoalMills.`,
    };
  }
}

export default async function PlayerHubPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  const resolved = await resolvePlayerOrFetchApi(slug);

  if (!resolved) {
    notFound();
  }

  if (resolved.type === 'curated') {
    const player = resolved.data;
    const club = EntityService.getClub(player.clubSlug);

    const personSchema = generatePersonSchema({
      name: player.name,
      slug: player.slug,
      photo: player.photo,
      teamName: player.clubName,
      nationality: player.nationality,
      position: player.position,
      bio: player.bio,
    });

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

    const playerTransfers = EntityService.getTransfers().filter((t) => t.playerSlug === player.slug);

    return (
      <ContentHubLayout
        breadcrumbs={[
          { name: 'Football', url: '/football' },
          { name: 'Players Hub', url: '/football/players' },
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
                { label: 'Goals', value: player.seasonStats.goals, icon: <FiTarget /> },
                { label: 'Assists', value: player.seasonStats.assists, icon: <FiActivity /> },
                { label: 'Rating', value: player.seasonStats.rating, icon: <FiAward /> },
              ]}
            />
          </>
        }
        sidebar={
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 space-y-3 shadow-xl">
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

            {playerTransfers.length > 0 && (
              <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 space-y-4 shadow-xl">
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

  // Render AllSportsAPI Dynamic Player Profile
  const p = resolved.data as FootballPlayer;

  let playerArticles: BlogPost[] = [];
  try {
    await dbConnect();
    const articlesDocs = await News.find({
      $or: [
        { tags: { $in: [p.player_name] } },
        { title: { $regex: new RegExp(p.player_name.split(' ')[1] || p.player_name, 'i') } },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(4)
      .lean();

    playerArticles = JSON.parse(JSON.stringify(articlesDocs));
  } catch (err) {
    console.error('Error fetching player articles:', err);
  }

  return (
    <ContentHubLayout
      breadcrumbs={[
        { name: 'Football', url: '/football' },
        { name: 'Players Hub', url: '/football/players' },
        { name: p.player_name, url: `/players/${p.player_key || slug}` },
      ]}
      header={
        <div className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-[#0B1728] via-[#0E1E38] to-[#070F1E] p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative h-28 w-28 rounded-3xl bg-slate-900 border-2 border-white/10 p-2 overflow-hidden shadow-2xl flex items-center justify-center">
              <PlayerImage
                src={p.player_image}
                alt={p.player_name}
                size={100}
                rounded="rounded-2xl"
              />
            </div>

            <div className="space-y-2 text-center sm:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-black uppercase">
                  {p.player_type || 'Player'}
                </span>
                {p.player_number && (
                  <span className="px-2.5 py-1 rounded-full bg-white/10 text-white text-xs font-mono font-bold">
                    #{p.player_number}
                  </span>
                )}
                {p.player_injured === 'Yes' && (
                  <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold">
                    🏥 Injured
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white">{p.player_name}</h1>
              <p className="text-xs text-slate-300 flex items-center justify-center sm:justify-start gap-2">
                <span>{p.team_name || 'Club'}</span>
                {p.player_age && <span>• {p.player_age} years old</span>}
              </p>
            </div>
          </div>
        </div>
      }
      sidebar={
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-[#0B1526] p-5 space-y-3 shadow-xl">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-3">
              <FiShield className="text-amber-400" />
              <span>Player Metrics & Discipline</span>
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Minutes Played</span>
                <span className="font-bold text-white font-mono">{p.player_minutes || '0'} min</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Total Shots</span>
                <span className="font-bold text-white font-mono">{p.player_shots_total || '0'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Pass Accuracy</span>
                <span className="font-bold text-emerald-400 font-mono">
                  {p.player_passes_accuracy ? `${p.player_passes_accuracy}%` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Tackles / Duels Won</span>
                <span className="font-bold text-white font-mono">
                  {p.player_tackles || p.player_duels_won || '0'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Yellow Cards</span>
                <span className="font-bold text-amber-400 font-mono">{p.player_yellow_cards || '0'}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Red Cards</span>
                <span className="font-bold text-rose-400 font-mono">{p.player_red_cards || '0'}</span>
              </div>
            </div>
          </div>
        </div>
      }
    >
      {/* 4 Performance Metric Cards */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-white/10 bg-[#0B1526] p-4 text-center shadow-lg">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Matches Played
          </span>
          <p className="text-2xl sm:text-3xl font-black text-white mt-1 font-mono">
            {p.player_match_played || '0'}
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-center shadow-lg">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
            Goals Scored
          </span>
          <p className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1 font-mono">
            {p.player_goals || '0'}
          </p>
        </div>
        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4 text-center shadow-lg">
          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
            Assists
          </span>
          <p className="text-2xl sm:text-3xl font-black text-blue-400 mt-1 font-mono">
            {p.player_assists || '0'}
          </p>
        </div>
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-center shadow-lg">
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
            Overall Rating
          </span>
          <p className="text-2xl sm:text-3xl font-black text-amber-400 mt-1 font-mono">
            {p.player_rating || '7.5'}
          </p>
        </div>
      </section>

      {playerArticles.length > 0 && (
        <RelatedArticlesMatrix
          title={`Articles & Intelligence for ${p.player_name}`}
          subtitle={`Match reports, transfer gossip, and intelligence updates`}
          articles={playerArticles}
        />
      )}
    </ContentHubLayout>
  );
}
