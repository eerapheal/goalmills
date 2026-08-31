import { NextResponse } from 'next/server';

export async function GET() {
  const coaches = [
    {
      coache: 'Pep Guardiola',
      coache_country: 'Spain',
      team_name: 'Manchester City',
      trophies: 38,
      coache_image: 'https://ui-avatars.com/api/?name=Pep+Guardiola&background=random&size=200',
    },
    {
      coache: 'Jürgen Klopp',
      coache_country: 'Germany',
      team_name: 'Liverpool',
      trophies: 12,
      coache_image: 'https://ui-avatars.com/api/?name=Jurgen+Klopp&background=random&size=200',
    },
    {
      coache: 'Carlo Ancelotti',
      coache_country: 'Italy',
      team_name: 'Real Madrid',
      trophies: 28,
      coache_image: 'https://ui-avatars.com/api/?name=Carlo+Ancelotti&background=random&size=200',
    },
    {
      coache: 'Mikel Arteta',
      coache_country: 'Spain',
      team_name: 'Arsenal',
      trophies: 2,
      coache_image: 'https://ui-avatars.com/api/?name=Mikel+Arteta&background=random&size=200',
    },
    {
      coache: 'Erik ten Hag',
      coache_country: 'Netherlands',
      team_name: 'Manchester United',
      trophies: 6,
      coache_image: 'https://ui-avatars.com/api/?name=Erik+ten+Hag&background=random&size=200',
    },
    {
      coache: 'Thomas Tuchel',
      coache_country: 'Germany',
      team_name: 'Bayern Munich',
      trophies: 11,
      coache_image: 'https://ui-avatars.com/api/?name=Thomas+Tuchel&background=random&size=200',
    },
  ];
  return NextResponse.json({ success: 1, result: coaches });
}
