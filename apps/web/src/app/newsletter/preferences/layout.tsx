import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Newsletter Preferences & Channel Subscriptions | GoalMills',
  description:
    'Customize your GoalMills newsletter notifications, sport coverage preferences, and email dispatch frequency.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NewsletterPreferencesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
