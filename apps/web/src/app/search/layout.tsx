import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search Football Scores, News, Teams & Players | GoalMills',
  description:
    'Search real-time match results, football news, transfer updates, player scouting records, and league tables across GoalMills.',
  alternates: {
    canonical: 'https://goalmills.com/search',
  },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
