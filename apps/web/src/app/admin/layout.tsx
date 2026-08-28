'use client';

import { SessionProvider } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { GoalmillsLoader } from '@/components/GoalmillsLoader';

function AdminAuth({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex bg-background min-h-screen items-center justify-center">
        <GoalmillsLoader
          size="fullscreen"
          label="GoalMills Admin"
          sublabel="Authenticating security session..."
        />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return <>{children}</>;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AdminAuth>{children}</AdminAuth>
    </SessionProvider>
  );
}
