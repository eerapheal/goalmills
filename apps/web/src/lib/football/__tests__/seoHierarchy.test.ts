import { describe, it, expect } from 'vitest';
import {
  resolveCompetitionBySlug,
  resolveConfederationBySlug,
  resolveCountryBySlug,
  buildCompetitionMetadata,
  buildConfederationMetadata,
  buildCountryMetadata,
  generateCompetitionJsonLd,
  generateBreadcrumbJsonLd,
  generateSportsEventJsonLd,
  generateConfederationJsonLd,
  generateCountryPyramidJsonLd,
  getCanonicalCompetition,
  getAllCanonicalCompetitions,
  getAllConfederations,
  getAllCountries,
  PRIORITY_CLUBS_LIST,
} from '../index';
import { NormalizedFixture } from '@goalmills/types';

describe('GoalMills Phase 4: SEO Information Architecture & Schema.org Validation', () => {
  describe('Slug & Entity Resolution', () => {
    it('resolves canonical competition slugs accurately', () => {
      const epl = resolveCompetitionBySlug('premier-league');
      expect(epl).toBeDefined();
      expect(epl?.id).toBe('ENG-PREMIER-LEAGUE');

      const cafCl = resolveCompetitionBySlug('caf-champions-league');
      expect(cafCl).toBeDefined();
      expect(cafCl?.id).toBe('CAF-CHAMPIONS-LEAGUE');

      const npfl = resolveCompetitionBySlug('npfl');
      expect(npfl).toBeDefined();
      expect(npfl?.id).toBe('NGA-NPFL');

      const ucl = resolveCompetitionBySlug('champions-league');
      expect(ucl).toBeDefined();
      expect(ucl?.id).toBe('UEFA-CHAMPIONS-LEAGUE');

      const nonExistent = resolveCompetitionBySlug('unknown-alien-league');
      expect(nonExistent).toBeUndefined();
    });

    it('resolves confederations by slug and code', () => {
      const caf = resolveConfederationBySlug('caf');
      expect(caf).toBeDefined();
      expect(caf?.code).toBe('CAF');

      const uefa = resolveConfederationBySlug('UEFA');
      expect(uefa).toBeDefined();
      expect(uefa?.code).toBe('UEFA');

      const fifa = resolveConfederationBySlug('fifa');
      expect(fifa).toBeDefined();
      expect(fifa?.code).toBe('FIFA');

      const invalid = resolveConfederationBySlug('invalid-confed');
      expect(invalid).toBeUndefined();
    });

    it('resolves countries by slugified name and ISO code', () => {
      const england = resolveCountryBySlug('england');
      expect(england).toBeDefined();
      expect(england?.code).toBe('GB-ENG');

      const nigeria = resolveCountryBySlug('nigeria');
      expect(nigeria).toBeDefined();
      expect(nigeria?.code).toBe('NG');

      const southAfrica = resolveCountryBySlug('south-africa');
      expect(southAfrica).toBeDefined();
      expect(southAfrica?.code).toBe('ZA');

      const spainByCode = resolveCountryBySlug('ES');
      expect(spainByCode).toBeDefined();
      expect(spainByCode?.name).toBe('Spain');
    });
  });

  describe('Schema.org JSON-LD Generators', () => {
    it('generates valid BreadcrumbList structured data', () => {
      const breadcrumbs = [
        { name: 'GoalMills', url: 'https://goalmills.com' },
        { name: 'Football', url: 'https://goalmills.com/football' },
        { name: 'Premier League', url: 'https://goalmills.com/football/premier-league' },
      ];

      const jsonLd = generateBreadcrumbJsonLd(breadcrumbs);
      expect(jsonLd['@context']).toBe('https://schema.org');
      expect(jsonLd['@type']).toBe('BreadcrumbList');
      expect(jsonLd.itemListElement).toHaveLength(3);
      expect(jsonLd.itemListElement[0].position).toBe(1);
      expect(jsonLd.itemListElement[2].name).toBe('Premier League');
      expect(jsonLd.itemListElement[2].item).toBe('https://goalmills.com/football/premier-league');
    });

    it('generates valid SportsOrganization structured data for competitions', () => {
      const comp = getCanonicalCompetition('ENG-PREMIER-LEAGUE')!;
      const jsonLd = generateCompetitionJsonLd(comp, 'https://goalmills.com');

      expect(jsonLd['@context']).toBe('https://schema.org');
      expect(jsonLd['@type']).toBe('SportsOrganization');
      expect(jsonLd.name).toBe('Premier League');
      expect(jsonLd.sport).toBe('Football');
      expect(jsonLd.url).toBe('https://goalmills.com/football/premier-league');
    });

    it('generates valid SportsEvent structured data for live/scheduled fixtures', () => {
      const fixture: NormalizedFixture = {
        fixtureId: 'gm-fix-9901',
        providerFixtureId: '9901',
        competitionId: 'ENG-PREMIER-LEAGUE',
        seasonId: '2026-2027',
        homeTeamId: 'arsenal',
        homeTeamName: 'Arsenal',
        homeTeamLogo: 'https://media.api-sports.io/football/teams/42.png',
        awayTeamId: 'chelsea',
        awayTeamName: 'Chelsea',
        awayTeamLogo: 'https://media.api-sports.io/football/teams/43.png',
        scheduledAt: '2026-10-15T15:00:00Z',
        status: 'Scheduled',
        classificationStatus: 'RESOLVED',
        countryCode: 'GB-ENG',
        confederationCode: 'UEFA',
        gender: 'MALE',
        ageCategory: 'SENIOR',
        priorityRank: 1,
        isFeatured: true,
        lastUpdatedAt: '2026-10-15T12:00:00Z',
        venue: 'Emirates Stadium',
      };

      const jsonLd = generateSportsEventJsonLd(fixture, 'https://goalmills.com');
      expect(jsonLd['@context']).toBe('https://schema.org');
      expect(jsonLd['@type']).toBe('SportsEvent');
      expect(jsonLd.name).toBe('Arsenal vs Chelsea');
      expect(jsonLd.sport).toBe('Football');
      expect(jsonLd.homeTeam.name).toBe('Arsenal');
      expect(jsonLd.awayTeam.name).toBe('Chelsea');
      expect(jsonLd.eventStatus).toBe('https://schema.org/EventScheduled');
    });

    it('generates valid confederation and country pyramid structured data', () => {
      const caf = resolveConfederationBySlug('caf')!;
      const nigeria = resolveCountryBySlug('nigeria')!;
      const epl = getCanonicalCompetition('ENG-PREMIER-LEAGUE')!;

      const confedLd = generateConfederationJsonLd(caf, [epl], 'https://goalmills.com');
      expect(confedLd['@type']).toBe('SportsOrganization');
      expect(confedLd.name).toBe(caf.name);

      const countryLd = generateCountryPyramidJsonLd(nigeria, [epl], 'https://goalmills.com');
      expect(countryLd['@type']).toBe('SportsOrganization');
      expect(countryLd.name).toContain('Nigeria');
    });
  });

  describe('SEO Dynamic Metadata Builders', () => {
    it('constructs complete metadata with canonical link and OpenGraph tags', () => {
      const epl = getCanonicalCompetition('ENG-PREMIER-LEAGUE')!;
      const meta = buildCompetitionMetadata(epl, 'https://goalmills.com');

      expect(meta.title).toContain('Premier League Hub');
      expect(meta.description).toContain('Premier League');
      expect(meta.alternates?.canonical).toBe('https://goalmills.com/football/premier-league');
      expect(meta.openGraph?.url).toBe('https://goalmills.com/football/premier-league');
      expect((meta.twitter as any)?.card).toBe('summary');
    });

    it('constructs confederation and country metadata', () => {
      const uefa = resolveConfederationBySlug('uefa')!;
      const uefaMeta = buildConfederationMetadata(uefa, 'https://goalmills.com');
      expect(uefaMeta.title).toContain('UEFA');
      expect(uefaMeta.alternates?.canonical).toBe('https://goalmills.com/football/confederations/uefa');

      const nigeria = resolveCountryBySlug('nigeria')!;
      const nigeriaMeta = buildCountryMetadata(nigeria, 'https://goalmills.com');
      expect(nigeriaMeta.title).toContain('Nigeria Football');
      expect(nigeriaMeta.alternates?.canonical).toBe('https://goalmills.com/football/countries/nigeria');
    });
  });

  describe('Sitemap Coverage & Volume Verification', () => {
    it('maintains expected registry volume for search engine indexing', () => {
      const competitions = getAllCanonicalCompetitions();
      const confederations = getAllConfederations();
      const countries = getAllCountries();

      expect(competitions.length).toBeGreaterThanOrEqual(60);
      expect(confederations.length).toBe(7);
      expect(countries.length).toBeGreaterThanOrEqual(30);
      expect(PRIORITY_CLUBS_LIST.length).toBeGreaterThanOrEqual(40);
    });
  });
});
