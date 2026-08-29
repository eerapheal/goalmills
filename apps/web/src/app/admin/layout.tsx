'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { GoalmillsLoader } from '@/components/GoalmillsLoader';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'unauthenticated') {
      const callbackUrl = encodeURIComponent(pathname || '/admin/dashboard');
      router.replace(`/signin?callbackUrl=${callbackUrl}`);
    } else if (status === 'authenticated' && session?.user) {
      const role = session.user.role;
      if (role === 'user') {
        // Standard non-staff readers redirect to home
        router.replace('/?error=Unauthorized');
      }
    }
  }, [status, session, pathname, router]);

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

  if (!session?.user || session.user.role === 'user') {
    return null;
  }

  return <>{children}</>;
}
