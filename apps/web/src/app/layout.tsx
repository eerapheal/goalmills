import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '../components/Header';
import { MobileBottomNav } from '../components/MobileBottomNav';
import { ToastProvider } from '../components/Toast';
import { Footer } from '../components/Footer';
import RealtimeListener from '../components/RealtimeListener';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL('https://goalmills.com'),
  referrer: 'no-referrer',
  title: {
    default: 'GoalMills | Live Football Scores, Cricket, NBA Stats & Sports News',
    template: '%s | GoalMills',
  },
  description:
    'Real-time live scores, match fixtures, football transfer rumours, league standings, NBA box scores, cricket updates, and video highlights across world sports.',
  keywords: [
    'live scores',
    'football live scores',
    'cricket live score',
    'NBA live scores',
    'premier league table',
    'football transfer news',
    'transfer rumours today',
    'champions league fixtures',
    'match predictions',
    'football stats',
    'nba standings',
    'ipl live score',
    'sports news blog',
    'match highlights video',
    'lineups and team news',
  ],
  alternates: {
    canonical: 'https://goalmills.com',
  },
  openGraph: {
    title: 'GoalMills | Live Football Scores, Cricket, NBA & Sports News',
    description:
      'Real-time scores, match fixtures, football transfer rumours, league standings, NBA box scores, and sports news.',
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
    title: 'GoalMills | Live Football Scores, Cricket, NBA & Sports News',
    description:
      'Live football scores, match fixtures, transfer news, league tables, and video highlights.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SportsOrganization',
        '@id': 'https://goalmills.com/#organization',
        name: 'GoalMills Sports News & Live Scores',
        url: 'https://goalmills.com',
        logo: {
          '@type': 'ImageObject',
          url: 'https://goalmills.com/icon.png',
        },
        sameAs: ['https://twitter.com/goalmills'],
      },
      {
        '@type': 'WebSite',
        '@id': 'https://goalmills.com/#website',
        url: 'https://goalmills.com',
        name: 'GoalMills',
        description: 'Live scores, football fixtures, transfer news, and league standings',
        publisher: { '@id': 'https://goalmills.com/#organization' },
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://goalmills.com/news?search={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
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
          <main className="pb-16 lg:pb-0">{children}</main>
          <MobileBottomNav />
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
