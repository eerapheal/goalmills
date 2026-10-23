import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Football Match Centre | Live Scores, Tables, Fixtures & Stats | GoalMills',
    template: '%s | GoalMills Football',
  },
  description:
    'Live football scores, Premier League, Champions League, AFCON & CAF fixtures, league tables, team rosters, and telemetry intelligence.',
  alternates: {
    canonical: 'https://goalmills.com/football',
  },
  openGraph: {
    title: 'GoalMills Football Match Centre | Live Scores, Tables & Match Intelligence',
    description:
      'Real-time football scores, standings, and telemetry intelligence across 75+ global and African leagues.',
    siteName: 'GoalMills',
    type: 'website',
  },
};

export default function FootballLayout({ children }: { children: React.ReactNode }) {
  return children;
}
