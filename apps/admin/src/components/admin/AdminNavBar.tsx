'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  FiHome,
  FiLogOut,
  FiKey,
  FiExternalLink,
  FiMenu,
  FiSearch,
  FiActivity,
  FiCheckSquare,
  FiUsers,
  FiDollarSign,
  FiLayout,
  FiCalendar,
  FiFileText,
  FiShare2,
  FiDatabase,
  FiZap,
  FiSliders,
  FiAward,
  FiLayers,
  FiCompass,
  FiPlusCircle,
  FiBookOpen,
  FiMail,
  FiShield,
  FiBell,
} from 'react-icons/fi';
import type { UserRole } from '@goalmills/types';
import type { PermissionAction } from '@/lib/rbac';
import { hasPermission } from '@/lib/rbac';

// ---------------------------------------------------------------------------
// Role-aware Quick Shortcuts — each has a required permission
// ---------------------------------------------------------------------------
interface QuickShortcut {
  label: string;
  href: string;
  icon: any;
  color: string;
  requiredPermission: PermissionAction;
}

const ALL_SHORTCUTS: QuickShortcut[] = [
  // CMS (articles:draft)
  { label: 'Create Article', href: '/admin/news/new',        icon: FiPlusCircle, color: 'text-blue-400 border-blue-500/20 bg-blue-500/10 hover:bg-blue-500/20',         requiredPermission: 'articles:draft' },
  { label: 'Analytics',      href: '/admin/analytics',       icon: FiActivity,   color: 'text-amber-400 border-amber-500/20 bg-amber-500/10 hover:bg-amber-500/20',     requiredPermission: 'articles:draft' },
  { label: 'Ecosystem',      href: '/admin/ecosystem',       icon: FiCompass,    color: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/10 hover:bg-cyan-500/20',         requiredPermission: 'articles:draft' },
  { label: 'Newsletter',     href: '/admin/newsletter',      icon: FiMail,       color: 'text-purple-400 border-purple-500/20 bg-purple-500/10 hover:bg-purple-500/20', requiredPermission: 'articles:draft' },
  { label: 'Distribution',   href: '/admin/distribution',   icon: FiShare2,     color: 'text-purple-400 border-purple-500/20 bg-purple-500/10 hover:bg-purple-500/20', requiredPermission: 'articles:draft' },
  { label: 'AI Recs',        href: '/admin/recommendations', icon: FiSliders,    color: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/10 hover:bg-cyan-500/20',         requiredPermission: 'articles:draft' },
  { label: 'Fan Pass',       href: '/admin/billing',         icon: FiDollarSign, color: 'text-amber-400 border-amber-500/20 bg-amber-500/10 hover:bg-amber-500/20',     requiredPermission: 'articles:draft' },
  { label: 'Sponsors',       href: '/admin/advertisers',     icon: FiAward,      color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20', requiredPermission: 'articles:draft' },
  { label: 'Stream',         href: '/admin/events',          icon: FiZap,        color: 'text-amber-400 border-amber-500/20 bg-amber-500/10 hover:bg-amber-500/20',     requiredPermission: 'articles:draft' },
  { label: 'Warehouse',      href: '/admin/warehouse',       icon: FiDatabase,   color: 'text-blue-400 border-blue-500/20 bg-blue-500/10 hover:bg-blue-500/20',         requiredPermission: 'articles:draft' },
  { label: 'Search',         href: '/admin/search',          icon: FiSearch,     color: 'text-blue-400 border-blue-500/20 bg-blue-500/10 hover:bg-blue-500/20',         requiredPermission: 'articles:draft' },
  { label: 'Categories',     href: '/admin/categories',      icon: FiLayers,     color: 'text-rose-400 border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20',         requiredPermission: 'categories:manage' },
  // HR (role-scoped)
  { label: 'Staff Portal',   href: '/admin/portal',          icon: FiLayout,     color: 'text-indigo-400 border-indigo-500/20 bg-indigo-500/10 hover:bg-indigo-500/20', requiredPermission: 'articles:read' },
  { label: 'Daily Reports',  href: '/admin/reports',         icon: FiCheckSquare, color: 'text-blue-400 border-blue-500/20 bg-blue-500/10 hover:bg-blue-500/20',        requiredPermission: 'reports:read_own' },
  { label: 'Stand-up',       href: '/admin/standup',         icon: FiCalendar,   color: 'text-purple-400 border-purple-500/20 bg-purple-500/10 hover:bg-purple-500/20', requiredPermission: 'standup:attend' },
  { label: 'Handbook',       href: '/admin/handbook',        icon: FiBookOpen,   color: 'text-amber-300 border-amber-500/20 bg-amber-500/10 hover:bg-amber-500/20',     requiredPermission: 'handbook:read' },
  { label: 'Payroll',        href: '/admin/payroll',         icon: FiDollarSign, color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20', requiredPermission: 'payroll:read' },
  { label: 'Evaluations',    href: '/admin/evaluations',     icon: FiAward,      color: 'text-amber-400 border-amber-500/20 bg-amber-500/10 hover:bg-amber-500/20',     requiredPermission: 'evaluations:read' },
  // Admin-only
  { label: 'Employees',      href: '/admin/employees',       icon: FiUsers,      color: 'text-slate-300 border-white/10 bg-white/5 hover:bg-white/10',                   requiredPermission: 'employees:read' },
  { label: 'Sponsorships',   href: '/admin/sponsorships',    icon: FiShield,     color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20', requiredPermission: 'articles:draft' },
];

function getRoleBadge(role?: string): { label: string; cls: string } {
  const map: Record<string, { label: string; cls: string }> = {
    'super-admin': { label: 'Super Admin', cls: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
    manager:       { label: 'Manager',     cls: 'bg-blue-500/15 text-blue-300 border-blue-500/30' },
    editor:        { label: 'Editor',      cls: 'bg-purple-500/15 text-purple-300 border-purple-500/30' },
    staff:         { label: 'Staff',       cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
    contributor:   { label: 'Contributor', cls: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' },
    user:          { label: 'Reader',      cls: 'bg-slate-500/15 text-slate-300 border-slate-500/30' },
  };
  return map[role || ''] || { label: role || 'Admin', cls: 'bg-amber-500/15 text-amber-300 border-amber-500/30' };
}

function isPathActive(currentPath: string, href: string): boolean {
  if (!currentPath || !href) return false;
  if (currentPath === href) return true;
  const n = currentPath.replace(/^\/admin/, '') || '/';
  const t = href.replace(/^\/admin/, '') || '/';
  if (n === t) return true;
  if (t !== '/' && t !== '/dashboard' && n.startsWith(t + '/')) return true;
  return false;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface AdminNavBarProps {
  sidebarCollapsed?: boolean;
  onOpenMobileDrawer?: () => void;
}

export default function AdminNavBar({ sidebarCollapsed, onOpenMobileDrawer }: AdminNavBarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = (session?.user?.role as UserRole) || undefined;

  // Filter shortcuts by role
  const shortcuts = useMemo(
    () => ALL_SHORTCUTS.filter((s) => hasPermission(userRole, s.requiredPermission)),
    [userRole]
  );

  const roleBadge = getRoleBadge(session?.user?.role as string);

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-2xl border-b border-white/[0.07] shadow-lg">
      {/* ════════════════════════════════════════════════
          TOP ROW — Brand / Identity / Actions
      ════════════════════════════════════════════════ */}
      <div className="flex items-center gap-3 px-3 sm:px-5 py-3">

        {/* Mobile menu button */}
        <button
          onClick={onOpenMobileDrawer}
          className="lg:hidden p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white border border-white/10 active:bg-white/10 transition-colors flex-shrink-0"
          aria-label="Open navigation"
        >
          <FiMenu size={18} />
        </button>

        {/* Brand */}
        <Link href="/admin/dashboard" className="flex items-center gap-2.5 group flex-shrink-0">
          <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black text-xs sm:text-sm shadow-md shadow-amber-500/25 group-hover:scale-105 transition-transform">
            GM
          </span>
          <div className="hidden xs:block">
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm sm:text-base font-black text-white uppercase tracking-tight">
                GoalMills
              </span>
              <span className="text-amber-400 text-[11px] font-bold">Admin</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-none hidden sm:block">
              {session?.user?.name || 'Administrator'}
            </p>
          </div>
        </Link>

        {/* Role badge — visible from sm */}
        <span className={`hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${roleBadge.cls}`}>
          {roleBadge.label}
        </span>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right action buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Notifications placeholder */}
          <button className="relative p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white border border-white/10 transition-colors hidden sm:flex">
            <FiBell size={15} />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-500" />
          </button>

          {/* Live Site */}
          <Link
            href="/"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-bold text-xs border border-white/10 transition-all"
          >
            <FiHome size={13} />
            <span className="hidden md:inline">Live Site</span>
            <FiExternalLink size={11} className="text-slate-500" />
          </Link>

          {/* Password */}
          <Link
            href="/profile"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold border border-amber-500/20 transition-all text-xs"
          >
            <FiKey size={13} />
            <span>Password</span>
          </Link>

          {/* Sign Out */}
          <button
            onClick={() => signOut({ callbackUrl: '/signin' })}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold border border-red-500/20 transition-all text-xs"
          >
            <FiLogOut size={13} />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════════════
          QUICK SHORTCUTS — role-filtered chip bar
          Hidden on mobile (sm and below)
      ════════════════════════════════════════════════ */}
      {/* {shortcuts.length > 0 && (
        <div className="hidden md:flex items-center gap-1.5 px-5 pb-3 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mr-1 flex-shrink-0">
            ⚡ Quick:
          </span>
          {shortcuts.map((item) => {
            const Icon = item.icon;
            const active = isPathActive(pathname, item.href);
            return (
              <Link
                key={item.href + item.label}
                href={item.href}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all flex-shrink-0 ${
                  active
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm shadow-amber-500/25 scale-[1.04]'
                    : item.color
                }`}
              >
                <Icon size={11} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )} */}
    </header>
  );
}
