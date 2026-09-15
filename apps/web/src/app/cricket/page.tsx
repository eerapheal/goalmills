import { Metadata } from 'next';
import { CricketPageClient } from '@/components/cricket/CricketPageClient';

export const revalidate = 60; // Revalidate every minute for live scores & fresh cricket data

export const metadata: Metadata = {
  title:
    'Cricket Match Centre | Live Scores, IPL 2026, WTC, Points Tables, DRS & Batters | GoalMills',
  description:
    'Live cricket ball-by-ball scorecards, IPL 2026 points table, WTC standings, top run scorers, umpire DRS command desk, team dugouts, and matchday pitch reports.',
  keywords: [
    'Cricket live scores',
    'IPL 2026 points table',
    'WTC standings 2025 2026',
    'Live cricket scorecard',
    'Virat Kohli runs stats',
    'T20 World Cup fixtures',
    'Cricket DRS review tracking',
    'Big Bash League scores',
    'GoalMills Cricket Match Centre',
  ],
  openGraph: {
    title: 'GoalMills Cricket Match Centre | Live Scores, Standings & Tactical Intelligence',
    description:
      'Real-time cricket scores, IPL points table, batter leaderboards, umpire DRS stats, and tactical managerial profiles across 30+ franchise and ICC tournaments.',
    siteName: 'GoalMills Cricket',
    type: 'website',
  },
};

export default function CricketHubPage() {
  return (
    <main className="min-h-screen bg-[#020617]">
      <CricketPageClient />
    </main>
  );
}
