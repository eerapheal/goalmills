import { ConfederationCode, ConfederationRecord } from '@goalmills/types';

export const CONFEDERATIONS: Record<ConfederationCode, ConfederationRecord> = {
  FIFA: {
    code: 'FIFA',
    name: 'Fédération Internationale de Football Association',
    slug: 'fifa',
    logoUrl: 'https://media.api-sports.io/football/leagues/1.png',
    displayOrder: 1,
  },
  CAF: {
    code: 'CAF',
    name: 'Confederation of African Football',
    slug: 'caf',
    logoUrl: 'https://media.api-sports.io/football/leagues/12.png',
    displayOrder: 2,
  },
  UEFA: {
    code: 'UEFA',
    name: 'Union of European Football Associations',
    slug: 'uefa',
    logoUrl: 'https://media.api-sports.io/football/leagues/2.png',
    displayOrder: 3,
  },
  CONMEBOL: {
    code: 'CONMEBOL',
    name: 'Confederación Sudamericana de Fútbol',
    slug: 'conmebol',
    logoUrl: 'https://media.api-sports.io/football/leagues/13.png',
    displayOrder: 4,
  },
  CONCACAF: {
    code: 'CONCACAF',
    name: 'Confederation of North, Central America and Caribbean Association Football',
    slug: 'concacaf',
    logoUrl: 'https://media.api-sports.io/football/leagues/16.png',
    displayOrder: 5,
  },
  AFC: {
    code: 'AFC',
    name: 'Asian Football Confederation',
    slug: 'afc',
    logoUrl: 'https://media.api-sports.io/football/leagues/17.png',
    displayOrder: 6,
  },
  OFC: {
    code: 'OFC',
    name: 'Oceania Football Confederation',
    slug: 'ofc',
    logoUrl: 'https://media.api-sports.io/football/leagues/18.png',
    displayOrder: 7,
  },
};

export function getConfederation(code: ConfederationCode): ConfederationRecord | undefined {
  return CONFEDERATIONS[code];
}

export function getAllConfederations(): ConfederationRecord[] {
  return Object.values(CONFEDERATIONS).sort((a, b) => a.displayOrder - b.displayOrder);
}
