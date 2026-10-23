import { ALL_COMPETITIONS, leagueLogo } from '../competitionCategories';
import { PRIORITY_CLUBS, PRIORITY_CLUBS_LIST, teamLogo } from './clubRegistry';
import { CANONICAL_COMPETITIONS, CANONICAL_COMPETITIONS_LIST } from './competitionRegistry';
import { slugify } from '../slugUtils';

/**
 * Authoritative dynamic league/competition logo resolver.
 * Searches:
 * 1. Explicit fallbackUrl from API (e.g. event.league_logo)
 * 2. 75+ ALL_COMPETITIONS registry (by slug, apiSportsId, or name match)
 * 3. CANONICAL_COMPETITIONS registry
 * 4. High-resolution API-Sports CDN by ID
 * 5. Dynamic styled SVG avatar badge
 */
export function resolveLeagueLogo(leagueNameOrId?: string | number, fallbackUrl?: string): string {
  // Reject 404-prone allsportsapi logo_leagues URLs
  const isDeadAllSportsLogo = Boolean(fallbackUrl && fallbackUrl.includes('allsportsapi.com/logo/logo_leagues'));
  if (fallbackUrl && fallbackUrl.startsWith('http') && !isDeadAllSportsLogo) {
    return fallbackUrl;
  }

  // If fallbackUrl was a dead allsports logo, extract id/slug from it if leagueNameOrId is not provided
  let effectiveIdOrName = leagueNameOrId;
  if (!effectiveIdOrName && isDeadAllSportsLogo && fallbackUrl) {
    const match = fallbackUrl.match(/logo_leagues\/(\d+)(?:_([^.]+))?\.png/);
    if (match) {
      effectiveIdOrName = match[2] || match[1];
    }
  }

  if (!effectiveIdOrName) {
    return 'https://media.api-sports.io/football/leagues/39.png';
  }

  const rawStr = String(effectiveIdOrName).trim();
  const cleanedStr = rawStr
    .replace(/\s*[-–—]\s*(Group\s+Stage|Preliminary\s+(?:Round|Stage)|Qualification|Qualifying|Play-?offs?|Knockout\s+Stage|Final\s+Stage|Round\s+of\s+\d+|Quarter-?finals?|Semi-?finals?|Finals?|Regular\s+Season)\b/gi, '')
    .trim();
  const queryStr = cleanedStr || rawStr;
  const querySlug = slugify(queryStr);
  const queryNum = Number(queryStr);

  // 1. Check ALL_COMPETITIONS (by provider ID first)
  if (!isNaN(queryNum) && queryNum > 0) {
    const byProviderId = ALL_COMPETITIONS.find((c) => c.id === queryNum);
    if (byProviderId?.logo) return byProviderId.logo;
  }

  const bySlug = ALL_COMPETITIONS.find(
    (c) =>
      c.slug === querySlug ||
      slugify(c.name) === querySlug ||
      c.name.toLowerCase() === queryStr.toLowerCase()
  );
  if (bySlug?.logo) return bySlug.logo;

  // 2. Check CANONICAL_COMPETITIONS (by providerId or slug)
  const canon =
    CANONICAL_COMPETITIONS[queryStr.toUpperCase()] ||
    CANONICAL_COMPETITIONS[querySlug] ||
    CANONICAL_COMPETITIONS[queryStr] ||
    CANONICAL_COMPETITIONS_LIST.find(
      (c) =>
        (c.providerId && Number(c.providerId) === queryNum) ||
        c.slug === querySlug ||
        slugify(c.name) === querySlug
    );
  if (canon?.logoUrl && !canon.logoUrl.includes('allsportsapi.com/logo/logo_leagues')) {
    return canon.logoUrl;
  }

  // 3. Check by apiSportsId as fallback
  if (!isNaN(queryNum) && queryNum > 0) {
    const byApiSportsId = ALL_COMPETITIONS.find((c) => c.apiSportsId === queryNum);
    if (byApiSportsId?.logo) return byApiSportsId.logo;
    const canonByApiSports = CANONICAL_COMPETITIONS_LIST.find((c) => c.apiSportsId === queryNum);
    if (canonByApiSports?.logoUrl && !canonByApiSports.logoUrl.includes('allsportsapi.com/logo/logo_leagues')) {
      return canonByApiSports.logoUrl;
    }
    return leagueLogo(queryNum);
  }

  // 4. Clean dynamic fallback badge
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    queryStr.slice(0, 12)
  )}&background=0f172a&color=38bdf8&bold=true&size=128`;
}

/**
 * Authoritative dynamic football team logo resolver.
 * Searches:
 * 1. Explicit fallbackUrl from API (e.g. event.home_team_logo)
 * 2. PRIORITY_CLUBS registry (by slug, id, or name match)
 * 3. High-resolution API-Sports CDN
 * 4. Dynamic styled SVG avatar badge
 */
export function resolveTeamLogo(teamNameOrId?: string | number, fallbackUrl?: string): string {
  if (fallbackUrl && fallbackUrl.startsWith('http')) {
    return fallbackUrl;
  }

  if (!teamNameOrId) {
    return `https://ui-avatars.com/api/?name=FC&background=0f172a&color=38bdf8&bold=true&size=128`;
  }

  const queryStr = String(teamNameOrId).trim();
  const querySlug = slugify(queryStr);
  const queryNum = Number(queryStr);

  // 1. Direct registry lookup
  const direct = PRIORITY_CLUBS[querySlug];
  if (direct?.logoUrl) return direct.logoUrl;

  // 2. Search list by name or provider ID
  const matched = PRIORITY_CLUBS_LIST.find(
    (c) =>
      c.slug === querySlug ||
      slugify(c.name) === querySlug ||
      slugify(c.shortName) === querySlug ||
      (c.providerId && Number(c.providerId) === queryNum)
  );
  if (matched?.logoUrl) return matched.logoUrl;

  // 3. If numeric ID passed, use team CDN
  if (!isNaN(queryNum) && queryNum > 0) {
    return teamLogo(queryNum);
  }

  // 4. Dynamic team avatar
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    queryStr.slice(0, 15)
  )}&background=0f172a&color=38bdf8&bold=true&size=128`;
}

/**
 * Generate a high-performance, dark-themed SVG player avatar data URI with player initials.
 * Zero network requests, never 404s, works offline and immediately.
 */
export function getPlayerFallbackAvatar(name: string, size = 128): string {
  const clean = (name || 'Player').replace(/[^a-zA-Z\s]/g, '').trim();
  const initials =
    clean
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join('') || 'P';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
    <defs>
      <linearGradient id="grad-p" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0f172a" />
        <stop offset="100%" stop-color="#1e293b" />
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" rx="${size / 2}" fill="url(#grad-p)" stroke="#334155" stroke-width="2"/>
    <text x="50%" y="54%" font-family="system-ui, -apple-system, sans-serif" font-size="${Math.round(size * 0.38)}" font-weight="800" fill="#38bdf8" text-anchor="middle" dominant-baseline="middle">${initials}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
