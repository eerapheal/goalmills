'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import AdminNavBar from '@/components/admin/AdminNavBar';
import { GoalmillsLoader } from '@/components/GoalmillsLoader';

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const isAuthPage = pathname === '/signin' || pathname === '/login' || pathname.startsWith('/signin') || pathname.startsWith('/login');

  useEffect(() => {
    if (!isAuthPage) {
      if (status === 'unauthenticated') {
        const callbackUrl = encodeURIComponent(pathname || '/dashboard');
        router.replace(`/signin?callbackUrl=${callbackUrl}`);
      } else if (status === 'authenticated' && session?.user) {
        const role = session.user.role;
        if (role === 'user') {
          // Regular users lack staff/admin access
          router.replace('/signin?error=AccessDenied');
        }
      }
    }
  }, [status, session, pathname, isAuthPage, router]);

  // Auth pages (signin/login) don't show AdminNavBar
  if (isAuthPage) {
    return <main className="min-h-screen bg-background">{children}</main>;
  }

  if (status === 'loading') {
    return (
      <div className="flex bg-background min-h-screen items-center justify-center">
        <GoalmillsLoader
          size="fullscreen"
          label="GoalMills Admin Suite"
          sublabel="Authenticating security credentials..."
        />
      </div>
    );
  }

  if (!session?.user || session.user.role === 'user') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8 flex flex-col">
      <div className="max-w-7xl mx-auto w-full flex-1">
        <AdminNavBar />
        <main className="mt-4">{children}</main>
      </div>
    </div>
  );
}
