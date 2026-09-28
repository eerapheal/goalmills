import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import {
  resolveConfederationBySlug,
  buildConfederationMetadata,
  getCompetitionsByConfederation,
  generateConfederationJsonLd,
  generateBreadcrumbJsonLd,
} from '@/lib/football';
import { ContentHubLayout } from '@/components/ContentHubLayout';
import { FiAward, FiShield, FiUsers, FiGlobe, FiChevronRight } from 'react-icons/fi';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ confedSlug: string }>;
}): Promise<Metadata> {
  const { confedSlug } = await params;
  const confed = resolveConfederationBySlug(confedSlug);
  if (!confed) return { title: 'Confederation Hub | GoalMills' };
  return buildConfederationMetadata(confed);
}

export default async function ConfederationHubPage({
  params,
}: {
  params: Promise<{ confedSlug: string }>;
}) {
  const { confedSlug } = await params;
  const confed = resolveConfederationBySlug(confedSlug);

  if (!confed) {
    notFound();
  }

  const allComps = getCompetitionsByConfederation(confed.code);

  const clubComps = allComps.filter(
    (c) => (c.competitionType === 'CONTINENTAL_CLUB' || c.level === 'CONFEDERATION') && !c.isWomens && !c.isYouth
  );
  const nationalComps = allComps.filter(
    (c) => (c.competitionType === 'CONTINENTAL_NATIONAL' || c.competitionType === 'NATIONS_LEAGUE' || c.competitionType === 'WORLD_CUP') && !c.isWomens
  );
  const womensComps = allComps.filter((c) => c.isWomens || c.gender === 'FEMALE');
  const youthComps = allComps.filter((c) => c.isYouth || (c.ageCategory && c.ageCategory !== 'SENIOR'));
  const otherComps = allComps.filter(
    (c) =>
      !clubComps.includes(c) &&
      !nationalComps.includes(c) &&
      !womensComps.includes(c) &&
      !youthComps.includes(c)
  );

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://goalmills.com';
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: 'GoalMills', url: baseUrl },
    { name: 'Football', url: `${baseUrl}/football` },
    { name: 'Confederations', url: `${baseUrl}/football` },
    { name: confed.name, url: `${baseUrl}/football/confederations/${confed.slug}` },
  ]);

  const confedJsonLd = generateConfederationJsonLd(confed, allComps, baseUrl);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(confedJsonLd) }}
      />
      <ContentHubLayout
        breadcrumbs={[
          { name: 'Football', url: '/football' },
          { name: 'Confederations', url: '/football' },
          { name: confed.code, url: `/football/confederations/${confed.slug}` },
        ]}
        header={
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-[#070e24] to-slate-950 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="relative h-20 w-20 flex-shrink-0 rounded-2xl bg-white/5 border border-white/10 p-3 shadow-inner flex items-center justify-center">
                  <Image
                    src={confed.logoUrl || '/icon.png'}
                    alt={confed.name}
                    width={64}
                    height={64}
                    className="object-contain"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black tracking-wider uppercase bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      {confed.code}
                    </span>
                    <span className="text-xs text-slate-400">Continental Confederation</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                    {confed.name}
                  </h1>
                  <p className="text-sm text-slate-400 mt-1 max-w-2xl">
                    Official tournament match centre, club championships, national team qualifiers, and live standings.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap sm:flex-nowrap gap-3">
                <div className="px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <div className="text-xs font-medium text-slate-400">Tournaments</div>
                  <div className="text-lg font-black text-white">{allComps.length}</div>
                </div>
              </div>
            </div>
          </div>
        }
      >
        <div className="space-y-8">
          {/* Club Continental Tournaments */}
          {clubComps.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <FiAward className="text-amber-400" />
                  <span>Continental Club Championships</span>
                </h2>
                <span className="text-xs font-semibold text-slate-400">{clubComps.length} Leagues</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {clubComps.map((comp) => (
                  <Link
                    key={comp.id}
                    href={`/football/${comp.slug}`}
                    className="group relative rounded-2xl border border-white/10 bg-slate-900/60 hover:bg-slate-800/80 p-4 transition-all duration-200 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="h-11 w-11 rounded-xl bg-white/5 border border-white/10 p-1.5 flex items-center justify-center flex-shrink-0">
                        <Image
                          src={comp.logoUrl || '/icon.png'}
                          alt={comp.name}
                          width={32}
                          height={32}
                          className="object-contain"
                        />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                          {comp.name}
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>Tier {comp.tier}</span>
                          <span>•</span>
                          <span>{comp.countryName || comp.confederationCode}</span>
                        </div>
                      </div>
                    </div>
                    <FiChevronRight className="text-slate-500 group-hover:text-white transition-colors" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* National Team Tournaments */}
          {nationalComps.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <FiGlobe className="text-blue-400" />
                  <span>National Team Competitions</span>
                </h2>
                <span className="text-xs font-semibold text-slate-400">{nationalComps.length} Tournaments</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {nationalComps.map((comp) => (
                  <Link
                    key={comp.id}
                    href={`/football/${comp.slug}`}
                    className="group relative rounded-2xl border border-white/10 bg-slate-900/60 hover:bg-slate-800/80 p-4 transition-all duration-200 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="h-11 w-11 rounded-xl bg-white/5 border border-white/10 p-1.5 flex items-center justify-center flex-shrink-0">
                        <Image
                          src={comp.logoUrl || '/icon.png'}
                          alt={comp.name}
                          width={32}
                          height={32}
                          className="object-contain"
                        />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                          {comp.name}
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{comp.competitionType}</span>
                        </div>
                      </div>
                    </div>
                    <FiChevronRight className="text-slate-500 group-hover:text-white transition-colors" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Women's Continental Tournaments */}
          {womensComps.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <FiUsers className="text-purple-400" />
                  <span>Women&apos;s Continental Football</span>
                </h2>
                <span className="text-xs font-semibold text-slate-400">{womensComps.length} Competitions</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {womensComps.map((comp) => (
                  <Link
                    key={comp.id}
                    href={`/football/${comp.slug}`}
                    className="group relative rounded-2xl border border-white/10 bg-slate-900/60 hover:bg-slate-800/80 p-4 transition-all duration-200 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="h-11 w-11 rounded-xl bg-white/5 border border-white/10 p-1.5 flex items-center justify-center flex-shrink-0">
                        <Image
                          src={comp.logoUrl || '/icon.png'}
                          alt={comp.name}
                          width={32}
                          height={32}
                          className="object-contain"
                        />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">
                          {comp.name}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">Women&apos;s Football</div>
                      </div>
                    </div>
                    <FiChevronRight className="text-slate-500 group-hover:text-white transition-colors" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Youth & Other Tournaments */}
          {youthComps.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <FiShield className="text-emerald-400" />
                  <span>Youth Tournaments (U17–U23)</span>
                </h2>
                <span className="text-xs font-semibold text-slate-400">{youthComps.length} Tournaments</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {youthComps.map((comp) => (
                  <Link
                    key={comp.id}
                    href={`/football/${comp.slug}`}
                    className="group relative rounded-2xl border border-white/10 bg-slate-900/60 hover:bg-slate-800/80 p-4 transition-all duration-200 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="h-11 w-11 rounded-xl bg-white/5 border border-white/10 p-1.5 flex items-center justify-center flex-shrink-0">
                        <Image
                          src={comp.logoUrl || '/icon.png'}
                          alt={comp.name}
                          width={32}
                          height={32}
                          className="object-contain"
                        />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                          {comp.name}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">{comp.ageCategory || 'Youth'}</div>
                      </div>
                    </div>
                    <FiChevronRight className="text-slate-500 group-hover:text-white transition-colors" />
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </ContentHubLayout>
    </>
  );
}
