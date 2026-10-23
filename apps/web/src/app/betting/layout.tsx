import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Betting Intelligence & Odds Comparison Hub | GoalMills',
    template: '%s | GoalMills Betting',
  },
  description:
    'Comprehensive sports betting intelligence, real-time bookmaker odds comparison, AI accumulator analysis, and bet code tools on GoalMills.',
  alternates: {
    canonical: 'https://goalmills.com/betting',
  },
};

export default function BettingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
