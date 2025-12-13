import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '../components/Header';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'GoalMills - Multi-Sport Platform',
    description: 'Your ultimate destination for live scores, fixtures, and sports news',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={`${inter.className} antialiased bg-slate-950 text-slate-200`} suppressHydrationWarning>
                <Header />
                <main>
                    {children}
                </main>
            </body>
        </html>
    );
}

