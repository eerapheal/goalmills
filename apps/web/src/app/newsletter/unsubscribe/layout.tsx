import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Unsubscribe | GoalMills Newsletter',
  description: 'Manage your GoalMills newsletter cancellation.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NewsletterUnsubscribeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
