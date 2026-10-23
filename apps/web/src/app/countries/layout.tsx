import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Country Domestic Football & Leagues | GoalMills',
    template: '%s | GoalMills',
  },
  description: 'Explore national football leagues, domestic cups, and tournaments by country.',
};

export default function CountriesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
