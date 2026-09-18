import { Metadata } from 'next';
import { BasketballPageClient } from '@/components/basketball/BasketballPageClient';

export const revalidate = 60; // Revalidate every minute for live scores & fresh basketball telemetry

export const metadata: Metadata = {
  title: 'NBA Live Scores, Basketball Standings, EuroLeague & Box Scores | GoalMills',
  description:
    'Real-time NBA live scores, quarter-by-quarter box scores, conference standings, EuroLeague fixtures, team rosters, and game previews on GoalMills.',
  keywords: [
    'NBA live scores',
    'Basketball live scores',
    'NBA standings 2026',
    'EuroLeague basketball results',
    'Quarter box score basketball',
    'Liga ACB basketball',
    'Lakers vs Warriors live',
    'GoalMills Basketball',
  ],
  openGraph: {
    title: 'GoalMills Basketball | Live Scores, Standings & Quarter Box Scores',
    description:
      'Real-time NBA live scores, conference standings, EuroLeague fixtures, and comprehensive box scores.',
    siteName: 'GoalMills Basketball',
    type: 'website',
  },
};

export default function BasketballHubPage() {
  return (
    <main className="min-h-screen bg-[#020617]">
      <BasketballPageClient />
    </main>
  );
}
