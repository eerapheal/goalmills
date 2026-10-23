import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Newsletter Archive & Historical Editions | GoalMills',
  description:
    'Read past editions of the GoalMills Daily Brief, covering European fixtures, African football milestones, transfer window analyses, and scouting spotlights.',
  alternates: {
    canonical: 'https://goalmills.com/newsletter/archive',
  },
};

export default function NewsletterArchiveLayout({ children }: { children: React.ReactNode }) {
  return children;
}
