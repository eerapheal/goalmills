import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '../components/Header';
import { ToastProvider } from '../components/Toast';
import { Footer } from '../components/Footer';
import RealtimeListener from '../components/RealtimeListener';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://goalmills.com'),
  referrer: 'no-referrer',
  title: 'GoalMills | Live Scores, Sports Stats & Intelligence',
  description:
    'Get real-time live scores, match stats, standings, and sports intelligence for Football, Cricket, and Basketball. Fast, accurate sports data on web & mobile.',
  keywords: [
    'live scores',
    'football live scores',
    'cricket live score',
    'NBA live scores',
    'basketball live scores',
    'sports analytics',
    'sports betting odds',
    'match statistics',
    'sports predictions',
    'Next.js sports app',
  ],
  alternates: {
    canonical: 'https://goalmills.com',
  },
  openGraph: {
    title: 'GoalMills | Live Sports Scores & Analytics Platform',
    description:
      'Real-time scores, detailed match stats, standings, and intelligence for Football, Cricket, and Basketball.',
    url: 'https://goalmills.com',
    siteName: 'GoalMills',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'GoalMills Live Sports Platform',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GoalMills | Live Scores & Sports Analytics',
    description:
      'Live football, cricket, and basketball scores with deep stats and insights.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://goalmills.com/#organization',
        name: 'GoalMills Sports Intelligence',
        url: 'https://goalmills.com',
        logo: {
          '@type': 'ImageObject',
          url: 'https://goalmills.com/og-image.png',
        },
        sameAs: ['https://twitter.com/goalmills'],
      },
      {
        '@type': 'WebSite',
        '@id': 'https://goalmills.com/#website',
        url: 'https://goalmills.com',
        name: 'GoalMills',
        publisher: { '@id': 'https://goalmills.com/#organization' },
      },
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${inter.className} antialiased bg-slate-950 text-slate-200`}
        suppressHydrationWarning
      >
        <ToastProvider>
          <RealtimeListener />
          <Header />
          <main>{children}</main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
