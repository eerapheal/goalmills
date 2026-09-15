import { Metadata } from 'next';
import { EntityService, CLUBS_REGISTRY } from '@/lib/entityService';
import { FootballPageClient } from '@/components/football/FootballPageClient';

export const revalidate = 60; // Revalidate every minute for live scores & fresh data

export const metadata: Metadata = {
  title:
    'Football Match Centre | Live Scores, Standings, Superstars, Officials & Tacticians | GoalMills',
  description:
    'Live football scores, Premier League, Champions League, AFCON & CAF fixtures, league tables, player market values, referee VAR tracking, and manager tactical philosophies.',
  keywords: [
    'Football live scores',
    'Premier League live scores',
    'Champions League fixtures',
    'AFCON 2026 2027 live scores',
    'CAF Champions League results',
    'Football player market values',
    'Victor Osimhen stats',
    'Erling Haaland goals',
    'Football referees VAR ratings',
    'Football managers tactics',
    'GoalMills Football Match Centre',
  ],
  openGraph: {
    title: 'GoalMills Football Match Centre | Live Scores, Tables & Tactical Intelligence',
    description:
      'Real-time football scores, standings, superstar valuations, referee stats, and tactical managerial profiles across 75+ global and African leagues.',
    siteName: 'GoalMills',
    type: 'website',
  },
};

export default function FootballPage() {
  const allPlayers = EntityService.getAllPlayers();
  const allOfficials = EntityService.getAllOfficials();
  const allCoaches = EntityService.getAllCoaches();
  const clubs = [...EntityService.getAfricanClubs(), ...Object.values(CLUBS_REGISTRY)];

  return (
    <main className="min-h-screen bg-[#020617]">
      <FootballPageClient
        initialPlayers={allPlayers}
        initialOfficials={allOfficials}
        initialCoaches={allCoaches}
        initialClubs={clubs}
      />
    </main>
  );
}
