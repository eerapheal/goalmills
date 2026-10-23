import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Confirm Subscription | GoalMills Newsletter',
  description: 'Confirm your email subscription to GoalMills sports updates.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NewsletterConfirmLayout({ children }: { children: React.ReactNode }) {
  return children;
}
