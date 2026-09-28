import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import dbConnect from '@/lib/db';
import News from '@/models/News';
import { EntityService, CompetitionMeta } from '@/lib/entityService';
import { ContentHubLayout } from '@/components/ContentHubLayout';
import { EntityHeader } from '@/components/EntityHeader';
import { RelatedArticlesMatrix } from '@/components/RelatedArticlesMatrix';
import { TransferCenterCard } from '@/components/TransferCenterCard';
import { CompetitionHubTabs } from '@/components/CompetitionHubTabs';
import { FiCalendar, FiUsers, FiAward, FiShield, FiTrendingUp } from 'react-icons/fi';
import { BlogPost } from '@goalmills/types';
import { LiveNewsFlashTicker } from '@/components/LiveNewsFlashTicker';
import { ALL_COMPETITIONS } from '@/lib/competitionCategories';
import {
  getCanonicalCompetition,
  generateCompetitionJsonLd,
  generateBreadcrumbJsonLd,
  buildCompetitionMetadata,
} from '@/lib/football';

export const dynamic = 'force-dynamic';

function resolveCompetition(slug: string): {
  comp: CompetitionMeta | null;
  canonicalComp: ReturnType<typeof getCanonicalCompetition> | null;
} {
  const canonicalComp = getCanonicalCompetition(slug);
  const legacyComp = EntityService.getCompetition(slug);

  if (legacyComp) {
    return { comp: legacyComp, canonicalComp: canonicalComp || null };
  }

  if (canonicalComp) {
    const adapted: CompetitionMeta = {
      id: canonicalComp.providerId || 0,
      name: canonicalComp.name,
      slug: canonicalComp.slug,
      country: canonicalComp.countryName || canonicalComp.confederationCode,
      logo: canonicalComp.logoUrl || '/icon.png',
      season: canonicalComp.season || '2026/2027',
      featured: canonicalComp.isFeatured ?? true,
      tier: canonicalComp.tier,
      description: `${canonicalComp.name} (${canonicalComp.countryName || canonicalComp.confederationCode}) - Complete Match Centre with Live Scores, Standings, and Fixture Intelligence.`,
    };
    return { comp: adapted, canonicalComp };
  }

  return { comp: null, canonicalComp: null };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ competitionSlug: string }>;
}): Promise<Metadata> {
  const { competitionSlug } = await params;
  const { comp, canonicalComp } = resolveCompetition(competitionSlug);

  if (!comp) return { title: 'Competition Hub | GoalMills' };

  if (canonicalComp) {
    return buildCompetitionMetadata(canonicalComp);
  }

  return {
    title: `${comp.name} Hub: Live Scores, Fixtures, Table, All Teams & Stats | GoalMills`,
    description: `${comp.name} (${comp.season}) complete hub. Access live match results, league tables, full squad lists, transfer rumors, and tactical analysis.`,
    alternates: {
      canonical: `https://goalmills.com/football/${comp.slug}`,
    },
  };
}

export default async function CompetitionHubPage({
  params,
}: {
  params: Promise<{ competitionSlug: string }>;
}) {
  const { competitionSlug } = await params;
  const { comp, canonicalComp } = resolveCompetition(competitionSlug);

  if (!comp) {
    notFound();
  }

  // Look up extended competition metadata from ALL_COMPETITIONS
  const compMeta = ALL_COMPETITIONS.find((c) => c.slug === comp.slug);
  const hasGroups = compMeta?.hasGroups ?? (canonicalComp ? canonicalComp.competitionType === 'TOURNAMENT' : false);
  const hasKnockout = compMeta?.hasKnockout ?? (canonicalComp ? canonicalComp.competitionType === 'CUP' || canonicalComp.competitionType === 'SUPER_CUP' : false);

  // Fetch articles related to this competition
  let competitionArticles: BlogPost[] = [];

  try {
    await dbConnect();
    const articlesDocs = await News.find({
      $or: [
        { competitionSlug: comp.slug },
        { category: { $regex: new RegExp(comp.name.split(' ')[0], 'i') } },
        { tags: { $in: [comp.name, comp.slug] } },
      ],
    })
      .sort({ isBreaking: -1, views: -1, createdAt: -1 })
      .limit(6)
      .lean();

    competitionArticles = JSON.parse(JSON.stringify(articlesDocs));
  } catch (err) {
    console.error('Error fetching competition articles:', err);
  }

  const competitionTransfers = EntityService.getTransfers({ competitionSlug: comp.slug });

  // Schema.org structured data (JSON-LD)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://goalmills.com';
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: 'GoalMills', url: baseUrl },
    { name: 'Football', url: `${baseUrl}/football` },
    { name: comp.name, url: `${baseUrl}/football/${comp.slug}` },
  ]);

  const competitionJsonLd = canonicalComp
    ? generateCompetitionJsonLd(canonicalComp, baseUrl)
    : {
        '@context': 'https://schema.org',
        '@type': 'SportsOrganization',
        name: comp.name,
        url: `${baseUrl}/football/${comp.slug}`,
        sport: 'Football',
        logo: comp.logo,
      };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(competitionJsonLd) }}
      />
      <ContentHubLayout
        breadcrumbs={[
          { name: 'Football', url: '/football' },
          { name: comp.name, url: `/football/${comp.slug}` },
        ]}
        header={
          <div className="space-y-4">
            <LiveNewsFlashTicker sport="football" badgeText={`${comp.name.toUpperCase()} WIRE`} />
            <EntityHeader
              type="competition"
              title={comp.name}
              subtitle={comp.description}
              image={comp.logo}
              parentEntity={{ name: 'Football Hub', url: '/football' }}
              badges={[
                { label: 'Season', value: comp.season, icon: <FiCalendar /> },
                { label: 'Country / Region', value: comp.country, icon: <FiAward /> },
                ...(canonicalComp
                  ? [
                      {
                        label: 'Gender',
                        value: canonicalComp.gender === 'FEMALE' ? '👩 Women' : '👨 Men',
                        icon: <FiUsers />,
                      },
                      {
                        label: 'Tier',
                        value: `Tier ${canonicalComp.tier}`,
                        icon: <FiShield />,
                      },
                    ]
                  : compMeta
                    ? [
                        {
                          label: 'Type',
                          value:
                            compMeta.competitionType === 'knockout'
                              ? '🏆 Knockout'
                              : compMeta.competitionType === 'cup'
                                ? '🥇 Cup'
                                : '📊 League',
                          icon: <FiShield />,
                        },
                      ]
                    : []),
              ]}
            />
          </div>
        }
        sidebar={
          <div className="space-y-6">
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
        {/* Full Competition Hub with 5-Tab System */}
        <section className="space-y-4">
          <CompetitionHubTabs
            competitionId={comp.id}
            competitionSlug={comp.slug}
            competitionName={comp.name}
            hasGroups={hasGroups}
            hasKnockout={hasKnockout}
          />
        </section>

        {/* Related News & Tactical Breakdown */}
        {competitionArticles.length > 0 && (
          <div className="pt-6 border-t border-white/10">
            <RelatedArticlesMatrix
              title={`Latest ${comp.name} News & Analysis`}
              subtitle={`Verified reporting, club press updates, and tactical columns for ${comp.name}`}
              articles={competitionArticles}
            />
          </div>
        )}
      </ContentHubLayout>
    </>
  );
}
