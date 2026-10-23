import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sports Newsletter & Daily Match Intel | GoalMills Brief',
  description:
    'Subscribe to the GoalMills Daily Brief for verified football transfer alerts, tactical breakdowns, CAF tournament news, and live match previews.',
  alternates: {
    canonical: 'https://goalmills.com/newsletter',
  },
};

export default function NewsletterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
