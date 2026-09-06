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
    default: 'GoalMills Africa | Live Football Scores, CAF Champions League & 2026/2027 Superstars Market Values',
    template: '%s | GoalMills Africa',
  },
  description:
    'Africa’s premier live football platform for the 2026/2027 season. Real-time scores for CAF Champions League, NPFL, Betway Premiership PSL, Botola Pro, AFCON qualifiers, and authentic real-world player market valuations for African and global superstars.',
  keywords: [
    'GoalMills Africa',
    'African football live scores',
    'CAF Champions League live scores 2026/2027',
    'CAF Confederation Cup results',
    'NPFL live scores Nigeria',
    'Betway Premiership South Africa PSL',
    'Botola Pro Morocco scores',
    'Egyptian Premier League standings',
    'AFCON 2027 qualifiers',
    'Victor Osimhen market value 2026/2027',
    'Mohamed Salah stats and contract',
    'Ademola Lookman Atalanta',
    'Achraf Hakimi transfer value',
    'African players in Europe goals',
    'football transfer news today',
    'champions league fixtures 2026/2027',
    'live sports scores',
  ],
  alternates: {
    canonical: 'https://goalmills.com',
  },
  openGraph: {
    title: 'GoalMills Africa | Live Football Scores, CAF Competitions & 2026/2027 Superstars',
    description:
      'Africa’s leading live football intelligence platform. Real-time CAF scores, African domestic league tables, and 2026/2027 authentic player market values.',
    url: 'https://goalmills.com',
    siteName: 'GoalMills Africa',
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
