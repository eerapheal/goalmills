import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Cricket Match Centre | Live Scores, IPL 2026, WTC, Points Tables & Stats | GoalMills',
    template: '%s | GoalMills Cricket',
  },
  description:
    'Live cricket ball-by-ball scorecards, IPL 2026 points table, WTC standings, top run scorers, umpire DRS command desk, team dugouts, and matchday pitch reports.',
  alternates: {
    canonical: 'https://goalmills.com/cricket',
  },
  openGraph: {
    title: 'GoalMills Cricket Match Centre | Live Scores, Standings & Tactical Intelligence',
    description:
      'Real-time cricket scores, IPL points table, batter leaderboards, umpire DRS stats, and tactical managerial profiles across 30+ franchise and ICC tournaments.',
    siteName: 'GoalMills Cricket',
    type: 'website',
  },
};

export default function CricketLayout({ children }: { children: React.ReactNode }) {
  return children;
}
