import { EntityBreadcrumbItem } from '@goalmills/types';
import { slugify } from '../slugUtils';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://goalmills-web.vercel.app';
export const SITE_NAME = 'GoalMills';
export const LOGO_URL = `${SITE_URL}/icon.png`;

/**
 * Generate BreadcrumbList Schema for Google Structured Data
 * Reference: https://developers.google.com/search/docs/appearance/structured-data/breadcrumb
 */
export function generateBreadcrumbSchema(items: EntityBreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

/**
 * Generate NewsArticle Schema for Google Search & Google News
 */
export function generateArticleSchema(article: {
  id: string;
  title: string;
  slug?: string;
  excerpt?: string;
  image?: string;
  createdAt: string;
  updatedAt?: string;
  authorName?: string;
  authorUrl?: string;
  url?: string;
}) {
  const canonicalSlug = article.slug || slugify(article.title) || article.id;
  const fullUrl = article.url || `${SITE_URL}/news/${canonicalSlug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.excerpt || article.title,
    image: [article.image || `${SITE_URL}/icon.png`],
    datePublished: new Date(article.createdAt).toISOString(),
    dateModified: new Date(article.updatedAt || article.createdAt).toISOString(),
    author: [
      {
        '@type': 'Person',
        name: article.authorName || 'GoalMills Staff',
        url: article.authorUrl ? `${SITE_URL}${article.authorUrl}` : undefined,
      },
    ],
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: LOGO_URL,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': fullUrl,
    },
  };
}

/**
 * Generate SportsEvent Schema for Match Hubs
 * Reference: https://schema.org/SportsEvent
 */
export function generateSportsEventSchema(match: {
  id: string | number;
  name: string;
  startDate?: string;
  homeTeam: { name: string; logo?: string };
  awayTeam: { name: string; logo?: string };
  competitionName?: string;
  venueName?: string;
  location?: string;
  url?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: match.name,
    startDate: match.startDate || new Date().toISOString(),
    competitor: [
      {
        '@type': 'SportsTeam',
        name: match.homeTeam.name,
        logo: match.homeTeam.logo,
      },
      {
        '@type': 'SportsTeam',
        name: match.awayTeam.name,
        logo: match.awayTeam.logo,
      },
    ],
    homeTeam: {
      '@type': 'SportsTeam',
      name: match.homeTeam.name,
      logo: match.homeTeam.logo,
    },
    awayTeam: {
      '@type': 'SportsTeam',
      name: match.awayTeam.name,
      logo: match.awayTeam.logo,
    },
    sport: 'Football',
    location: {
      '@type': 'Place',
      name: match.venueName || 'Sports Arena',
      address: match.location || 'International',
    },
    organizer: {
      '@type': 'Organization',
      name: match.competitionName || 'Football League',
    },
    url: match.url || `${SITE_URL}/matches/${match.id}`,
  };
}

/**
 * Generate SportsTeam Schema for Club Hubs
 */
export function generateSportsTeamSchema(team: {
  name: string;
  slug: string;
  logo?: string;
  stadium?: string;
  league?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsTeam',
    name: team.name,
    sport: 'Football',
    logo: team.logo,
    memberOf: team.league
      ? {
          '@type': 'SportsOrganization',
          name: team.league,
        }
      : undefined,
    location: team.stadium
      ? {
          '@type': 'Place',
          name: team.stadium,
        }
      : undefined,
    url: `${SITE_URL}/teams/${team.slug}`,
  };
}

/**
 * Generate Person (Athlete) Schema for Player Hubs
 */
export function generatePersonSchema(player: {
  name: string;
  slug: string;
  photo?: string;
  teamName?: string;
  nationality?: string;
  position?: string;
  bio?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: player.name,
    jobTitle: `Professional Football Player (${player.position || 'Forward'})`,
    nationality: player.nationality,
    image: player.photo,
    description: player.bio,
    worksFor: player.teamName
      ? {
          '@type': 'SportsTeam',
          name: player.teamName,
        }
      : undefined,
    url: `${SITE_URL}/players/${player.slug}`,
  };
}

/**
 * Generate Organization Schema for Brand & About Page
 * Reference: https://developers.google.com/search/docs/appearance/structured-data/organization
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: LOGO_URL,
    founder: {
      '@type': 'Person',
      name: 'Ekpenisi Erue Raphael',
    },
    publishingPrinciples: `${SITE_URL}/about#editorial-standards`,
    correctionsPolicy: `${SITE_URL}/about#corrections-policy`,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'editorial',
      email: 'contact@goalmills.com',
    },
  };
}
