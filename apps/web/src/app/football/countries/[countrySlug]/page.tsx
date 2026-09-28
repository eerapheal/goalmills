import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import {
  resolveCountryBySlug,
  buildCountryMetadata,
  getCompetitionsByCountry,
  getClubsByCountry,
  generateCountryPyramidJsonLd,
  generateBreadcrumbJsonLd,
} from '@/lib/football';
import { ContentHubLayout } from '@/components/ContentHubLayout';
import { FiAward, FiShield, FiUsers, FiCompass, FiChevronRight } from 'react-icons/fi';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ countrySlug: string }>;
}): Promise<Metadata> {
  const { countrySlug } = await params;
  const country = resolveCountryBySlug(countrySlug);
  if (!country) return { title: 'Country Football Hub | GoalMills' };
  return buildCountryMetadata(country);
}

export default async function CountryHubPage({
  params,
}: {
  params: Promise<{ countrySlug: string }>;
}) {
  const { countrySlug } = await params;
  const country = resolveCountryBySlug(countrySlug);

  if (!country) {
    notFound();
  }

  const allComps = getCompetitionsByCountry(country.code);
  const clubs = getClubsByCountry(country.code);

  const tier1Comps = allComps.filter((c) => c.tier === 1 && !c.isWomens && c.competitionType === 'LEAGUE');
  const lowerTierComps = allComps.filter((c) => c.tier > 1 && !c.isWomens && c.competitionType === 'LEAGUE');
  const cupComps = allComps.filter(
    (c) => (c.competitionType === 'CUP' || c.competitionType === 'SUPER_CUP') && !c.isWomens
  );
  const womensComps = allComps.filter((c) => c.isWomens || c.gender === 'FEMALE');
  const otherComps = allComps.filter(
    (c) =>
      !tier1Comps.includes(c) &&
      !lowerTierComps.includes(c) &&
      !cupComps.includes(c) &&
      !womensComps.includes(c)
  );

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://goalmills.com';
  const countrySlugFormatted = country.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: 'GoalMills', url: baseUrl },
    { name: 'Football', url: `${baseUrl}/football` },
    { name: 'Countries', url: `${baseUrl}/football` },
    { name: country.name, url: `${baseUrl}/football/countries/${countrySlugFormatted}` },
  ]);

  const countryJsonLd = generateCountryPyramidJsonLd(country, allComps, baseUrl);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(countryJsonLd) }}
      />
      <ContentHubLayout
        breadcrumbs={[
          { name: 'Football', url: '/football' },
          { name: 'Countries', url: '/football' },
          { name: country.name, url: `/football/countries/${countrySlugFormatted}` },
        ]}
        header={
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-[#070e24] to-slate-950 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="relative h-20 w-20 flex-shrink-0 rounded-2xl bg-white/5 border border-white/10 p-2 shadow-inner flex items-center justify-center overflow-hidden">
                  <Image
                    src={country.flagUrl || '/icon.png'}
                    alt={country.name}
                    width={64}
                    height={48}
                    className="object-cover rounded-lg"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black tracking-wider uppercase bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      {country.code}
                    </span>
                    <span className="text-xs text-slate-400">{country.confederationCode} Member</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                    {country.name} Football
                  </h1>
                  <p className="text-sm text-slate-400 mt-1 max-w-2xl">
                    National football pyramid, domestic leagues, cup tournaments, women&apos;s football, and registered priority clubs.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap sm:flex-nowrap gap-3">
                <div className="px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <div className="text-xs font-medium text-slate-400">Leagues & Cups</div>
                  <div className="text-lg font-black text-white">{allComps.length}</div>
                </div>
                <div className="px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <div className="text-xs font-medium text-slate-400">Priority Clubs</div>
                  <div className="text-lg font-black text-white">{clubs.length}</div>
                </div>
              </div>
            </div>
          </div>
        }
      >
        <div className="space-y-8">
          {/* Top Flight Leagues */}
          {tier1Comps.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <FiAward className="text-amber-400" />
                  <span>Top-Tier League Football</span>
                </h2>
                <span className="text-xs font-semibold text-slate-400">Tier 1</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {tier1Comps.map((comp) => (
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
                          <span>{comp.season || '2026/2027'}</span>
                          <span>•</span>
                          <span>Priority #{comp.priorityRank}</span>
                        </div>
                      </div>
                    </div>
                    <FiChevronRight className="text-slate-500 group-hover:text-white transition-colors" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Lower Divisions */}
          {lowerTierComps.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <FiShield className="text-blue-400" />
                  <span>Secondary & Lower Divisions</span>
                </h2>
                <span className="text-xs font-semibold text-slate-400">{lowerTierComps.length} Leagues</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {lowerTierComps.map((comp) => (
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
                        </div>
                      </div>
                    </div>
                    <FiChevronRight className="text-slate-500 group-hover:text-white transition-colors" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Domestic Cups */}
          {cupComps.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <FiAward className="text-emerald-400" />
                  <span>Domestic Cup Tournaments</span>
                </h2>
                <span className="text-xs font-semibold text-slate-400">{cupComps.length} Cups</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {cupComps.map((comp) => (
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

          {/* Women's Domestic League */}
          {womensComps.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <FiUsers className="text-purple-400" />
                  <span>Women&apos;s National Football</span>
                </h2>
                <span className="text-xs font-semibold text-slate-400">{womensComps.length} Leagues</span>
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

          {/* Priority Clubs in Country */}
          {clubs.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <FiCompass className="text-cyan-400" />
                  <span>Registered Priority Clubs</span>
                </h2>
                <span className="text-xs font-semibold text-slate-400">{clubs.length} Clubs</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {clubs.map((club) => (
                  <div
                    key={club.id}
                    className="rounded-2xl border border-white/10 bg-slate-900/40 p-3.5 text-center flex flex-col items-center justify-center gap-2 hover:border-white/20 transition-all"
                  >
                    <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 p-2 flex items-center justify-center">
                      <Image
                        src={club.logoUrl || '/icon.png'}
                        alt={club.name}
                        width={36}
                        height={36}
                        className="object-contain"
                      />
                    </div>
                    <div className="text-xs font-bold text-white truncate max-w-full">
                      {club.name}
                    </div>
                    {club.stadium && (
                      <div className="text-[10px] text-slate-400 truncate max-w-full">
                        {club.stadium}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </ContentHubLayout>
    </>
  );
}
