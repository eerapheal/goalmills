import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'NBA Live Scores, Basketball Standings, EuroLeague & Box Scores | GoalMills',
    template: '%s | GoalMills Basketball',
  },
  description:
    'Real-time NBA live scores, quarter-by-quarter box scores, conference standings, EuroLeague fixtures, team rosters, and game previews on GoalMills.',
  alternates: {
    canonical: 'https://goalmills.com/basketball',
  },
  openGraph: {
    title: 'GoalMills Basketball | Live Scores, Standings & Quarter Box Scores',
    description:
      'Real-time NBA live scores, conference standings, EuroLeague fixtures, and comprehensive box scores.',
    siteName: 'GoalMills Basketball',
    type: 'website',
  },
};

export default function BasketballLayout({ children }: { children: React.ReactNode }) {
  return children;
}
