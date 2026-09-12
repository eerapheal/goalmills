import { Metadata } from 'next';
import { ContentHubLayout } from '@/components/ContentHubLayout';
import { CricketScreen } from '@/components/CricketScreen';
import {
  CricketSidebar,
  INITIAL_MAJOR_TOURNAMENTS,
  INITIAL_FEATURED_TEAMS,
} from '@/components/CricketSidebar';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Live Cricket Scores, IPL 2026/2027, ICC World Cup, Fixtures & Points Tables | GoalMills',
  description:
    'Real-time live cricket scores, ball-by-ball commentary, IPL 2026/2027 points table, ICC Men’s World Cup fixtures, Test match updates, and team standings on GoalMills.',
  keywords: [
    'Cricket live scores',
    'IPL 2026/2027 live',
    'ICC World Cup fixtures',
    'T20 World Cup live',
    'Cricket points table',
    'Test championship live',
    'Big Bash League scores',
    'GoalMills Cricket',
  ],
  openGraph: {
    title: 'GoalMills Cricket | Live Scores, IPL, ICC Fixtures & Standings',
    description:
      'Real-time cricket live scores, ball-by-ball updates, IPL points table, ICC fixtures, and team standings.',
    siteName: 'GoalMills Cricket',
    type: 'website',
  },
};

// Exported verified AllSportsAPI tournament and team definitions
export const CRICKET_MAJOR_TOURNAMENTS = INITIAL_MAJOR_TOURNAMENTS;
export const FEATURED_CRICKET_TEAMS = INITIAL_FEATURED_TEAMS;

export default function CricketHubPage() {
  return (
    <ContentHubLayout
      breadcrumbs={[{ name: 'Cricket Hub', url: '/cricket' }]}
      header={<></>}
      sidebar={<CricketSidebar />}
    >
      {/* Live Match Engine Section */}
      <section className="space-y-4">
        <CricketScreen />
      </section>
    </ContentHubLayout>
  );
}
