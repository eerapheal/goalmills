import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Football Regions, Countries & Domestic Leagues | GoalMills',
  description:
    'Browse football leagues and regional tournaments by country. Access national pyramid structures and domestic football competitions worldwide.',
  alternates: {
    canonical: 'https://goalmills.com/regions',
  },
};

export default function RegionsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
