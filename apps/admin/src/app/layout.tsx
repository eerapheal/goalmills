import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import { ReduxProvider } from '@/components/ReduxProvider';
import { ToastProvider } from '@/components/Toast';
import AdminShell from './AdminShell';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'GoalMills | Enterprise Admin & Editorial Suite',
  description: 'Enterprise Content Management, Staff EMS, and Analytics Suite for GoalMills Sports Media.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} antialiased bg-slate-950 text-slate-200 min-h-screen`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <ReduxProvider>
            <ToastProvider>
              <AdminShell>{children}</AdminShell>
            </ToastProvider>
          </ReduxProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
