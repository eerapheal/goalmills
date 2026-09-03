'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import AdminNavBar from '@/components/admin/AdminNavBar';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { GoalmillsLoader } from '@/components/GoalmillsLoader';

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const isAuthPage =
    pathname === '/signin' ||
    pathname === '/login' ||
    pathname.startsWith('/signin') ||
    pathname.startsWith('/login');

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [pathname]);

  // Auth guard
  useEffect(() => {
    if (!isAuthPage) {
      if (status === 'unauthenticated') {
        const callbackUrl = encodeURIComponent(pathname || '/dashboard');
        router.replace(`/signin?callbackUrl=${callbackUrl}`);
      } else if (status === 'authenticated' && session?.user) {
        if (session.user.role === 'user') {
          router.replace('/signin?error=AccessDenied');
        }
      }
    }
  }, [status, session, pathname, isAuthPage, router]);

  // Auth pages — no shell
  if (isAuthPage) {
    return <main className="min-h-screen bg-background">{children}</main>;
  }

  // Loading state
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

  // Unauthenticated or insufficient role
  if (!session?.user || session.user.role === 'user') {
    return null;
  }

  return (
    /*
     * Layout:
     *   Mobile  (< lg): full-width stack — TopBar + Content + fixed bottom nav
     *   Desktop (≥ lg): horizontal — Sidebar | TopBar + Content
     */
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">

      {/* ── Desktop Sidebar (hidden on mobile, rendered inside AdminSidebar) ── */}
      <AdminSidebar
        desktopCollapsed={desktopCollapsed}
        mobileDrawerOpen={mobileDrawerOpen}
        onToggleDesktop={() => setDesktopCollapsed((c) => !c)}
        onOpenMobileDrawer={() => setMobileDrawerOpen(true)}
        onCloseMobileDrawer={() => setMobileDrawerOpen(false)}
      />

      {/* ── Main Column ─────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">

        {/* Top navigation bar */}
        <AdminNavBar
          sidebarCollapsed={desktopCollapsed}
          onOpenMobileDrawer={() => setMobileDrawerOpen(true)}
        />

        {/* Page content */}
        <main className="flex-1 p-3 sm:p-5 md:p-6 pb-24 lg:pb-6">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
