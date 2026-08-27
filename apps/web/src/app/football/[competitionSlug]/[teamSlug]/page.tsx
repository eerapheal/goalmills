import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import dbConnect from '@/lib/db';
import News from '@/models/News';
import { EntityService, PLAYERS_REGISTRY } from '@/lib/entityService';
import { ContentHubLayout } from '@/components/ContentHubLayout';
import { EntityHeader } from '@/components/EntityHeader';
import { RelatedArticlesMatrix } from '@/components/RelatedArticlesMatrix';
import { TransferCenterCard } from '@/components/TransferCenterCard';
import { generateSportsTeamSchema } from '@/lib/seo/schemaGenerator';
import { FiUsers, FiMapPin, FiAward, FiTrendingUp, FiUser, FiArrowRight } from 'react-icons/fi';
import { BlogPost } from '@goalmills/types';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ competitionSlug: string; teamSlug: string }>;
}): Promise<Metadata> {
  const { teamSlug } = await params;
  const club = EntityService.getClub(teamSlug);
  if (!club) return { title: 'Club Hub | GoalMills' };

  return {
    title: `${club.name} Hub: Squad, Fixtures, Transfers & Intelligence | GoalMills`,
    description: `Official ${club.name} content hub. Latest transfer news, tactical analysis, player squad list, upcoming matches, and stadium insights.`,
  };
}

export default async function ClubHubPage({
  params,
}: {
  params: Promise<{ competitionSlug: string; teamSlug: string }>;
}) {
  const { competitionSlug, teamSlug } = await params;
  const club = EntityService.getClub(teamSlug);
  const comp = EntityService.getCompetition(competitionSlug);

  if (!club) {
    notFound();
  }

  // Schema.org SportsTeam JSON-LD
  const teamSchema = generateSportsTeamSchema({
    name: club.name,
    slug: club.slug,
    logo: club.logo,
    stadium: club.stadium,
    league: club.competitionName,
  });

  // Fetch articles related to this club (by team slug, tags, or name)
  let clubArticles: BlogPost[] = [];
  try {
    await dbConnect();
    const articlesDocs = await News.find({
      $or: [
        { 'teams.slug': club.slug },
        { relatedTeam: { $regex: new RegExp(club.shortName, 'i') } },
        { tags: { $in: [club.name, club.shortName, club.slug] } },
        { title: { $regex: new RegExp(club.shortName, 'i') } },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    clubArticles = JSON.parse(JSON.stringify(articlesDocs));
  } catch (err) {
    console.error('Error fetching club articles:', err);
  }

  // Get featured players for this club
  const squadPlayers = Object.values(PLAYERS_REGISTRY).filter((p) => p.clubSlug === club.slug);
  const clubTransfers = EntityService.getTransfers().filter(
    (t) => t.fromTeam.slug === club.slug || t.toTeam.slug === club.slug
  );

  return (
    <ContentHubLayout
      breadcrumbs={[
        { name: 'Football', url: '/football' },
        { name: comp?.name || club.competitionName, url: `/football/${club.competitionSlug}` },
        { name: club.name, url: `/football/${club.competitionSlug}/${club.slug}` },
      ]}
      header={
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(teamSchema) }}
          />
          <EntityHeader
            type="club"
            title={club.name}
            subtitle={`${club.stadium} • Founded in ${club.founded}`}
            image={club.logo}
            parentEntity={{
              name: comp?.name || club.competitionName,
              url: `/football/${club.competitionSlug}`,
            }}
            badges={[
              { label: 'League Position', value: `#${club.position}`, icon: <FiAward /> },
              { label: 'Manager', value: club.manager, icon: <FiUser /> },
              { label: 'Stadium', value: club.stadium.split(',')[0], icon: <FiMapPin /> },
            ]}
          />
        </>
      }
      sidebar={
        <div className="space-y-6">
          {/* Squad & Player Profiles */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <FiUsers className="text-blue-400" />
                <span>Featured Squad</span>
              </h3>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Player Profiles</span>
            </div>

            <div className="space-y-2">
              {squadPlayers.map((player) => (
                <Link
                  key={player.slug}
                  href={`/players/${player.slug}`}
                  className="group flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.02] hover:bg-blue-600/20 border border-white/5 hover:border-blue-500/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative h-9 w-9 rounded-full overflow-hidden bg-slate-900 border border-white/10">
                      <Image
                        src={player.photo}
                        alt={player.name}
                        width={36}
                        height={36}
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors flex items-center gap-1.5">
                        <span>#{player.number}</span>
                        <span>{player.name}</span>
                      </h4>
                      <p className="text-[10px] text-slate-400">{player.position}</p>
                    </div>
                  </div>
                  <FiArrowRight
                    size={14}
                    className="text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-transform"
                  />
                </Link>
              ))}
            </div>
          </div>

          {/* Club Transfer Activity */}
          {clubTransfers.length > 0 && (
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <FiTrendingUp className="text-emerald-400" />
                  <span>Club Transfer Activity</span>
                </h3>
                <Link href="/transfers" className="text-xs font-bold text-blue-400 hover:underline">
                  Radar →
                </Link>
              </div>
              <div className="space-y-3">
                {clubTransfers.map((t) => (
                  <TransferCenterCard key={t.id} transfer={t} />
                ))}
              </div>
            </div>
          )}
        </div>
      }
    >
      {/* Club Intelligence & Articles */}
      {clubArticles.length > 0 ? (
        <RelatedArticlesMatrix
          title={`Latest ${club.shortName} News & Tactical Stories`}
          subtitle={`Match reports, transfer rumors, press updates, and player ratings for ${club.name}`}
          articles={clubArticles}
        />
      ) : (
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 text-center text-slate-400">
          <p className="text-sm">No recent stories tagged with {club.name}. Check back soon!</p>
        </div>
      )}
    </ContentHubLayout>
  );
}
