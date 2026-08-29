'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  FiUsers,
  FiFileText,
  FiAward,
  FiDollarSign,
  FiLayers,
  FiUserCheck,
  FiCalendar,
  FiCheckSquare,
  FiHome,
  FiLogOut,
  FiMenu,
  FiX,
  FiChevronDown,
  FiBookOpen,
  FiKey,
  FiMail,
  FiCompass,
  FiTrash2,
  FiSend,
  FiSettings,
  FiShield,
  FiZap,
} from 'react-icons/fi';
import type { UserRole } from '@goalmills/types';
import type { PermissionAction } from '@/lib/rbac';
import { hasPermission } from '@/lib/rbac';

interface PrimaryTab {
  id: string;
  label: string;
  href: string;
  icon: any;
  requiredPermission?: PermissionAction;
  subItems?: { label: string; href: string; icon?: any }[];
}

const PRIMARY_TABS: PrimaryTab[] = [
  {
    id: 'cms',
    label: 'CMS',
    href: '/admin/dashboard',
    icon: FiFileText,
    requiredPermission: 'articles:draft',
    subItems: [
      { label: 'News & Media', href: '/admin/dashboard', icon: FiFileText },
      { label: 'Content Ecosystem', href: '/admin/ecosystem', icon: FiCompass },
      { label: 'Categories', href: '/admin/categories', icon: FiLayers },
      { label: 'Create Article', href: '/admin/news/new', icon: FiFileText },
    ],
  },
  {
    id: 'employee_management',
    label: 'Employee Management',
    href: '/admin/employees',
    icon: FiUsers,
    requiredPermission: 'employees:read',
    subItems: [
      { label: 'Employees & Staff', href: '/admin/employees', icon: FiUsers },
      { label: 'Daily Reports', href: '/admin/reports', icon: FiCheckSquare },
      { label: '5 PM Stand-up', href: '/admin/standup', icon: FiCalendar },
      { label: 'Handbook & SOPs', href: '/admin/handbook', icon: FiBookOpen },
      { label: 'Evaluations', href: '/admin/evaluations', icon: FiAward },
      { label: 'Payroll', href: '/admin/payroll', icon: FiDollarSign },
    ],
  },
  {
    id: 'user_management',
    label: 'User Management',
    href: '/admin/users',
    icon: FiUserCheck,
    requiredPermission: 'users:manage',
    subItems: [
      { label: 'User Directory', href: '/admin/users', icon: FiUserCheck },
      { label: 'Staff Roles & Invitations', href: '/admin/users', icon: FiShield },
    ],
  },
  {
    id: 'sponsorship_management',
    label: 'Sponsorship Management',
    href: '/admin/sponsorships',
    icon: FiDollarSign,
    requiredPermission: 'articles:draft',
    subItems: [
      { label: 'Active Campaigns', href: '/admin/sponsorships', icon: FiDollarSign },
      { label: 'Create Partnership', href: '/admin/sponsorships', icon: FiDollarSign },
    ],
  },
  {
    id: 'content_deletion',
    label: 'Content Deletion',
    href: '/admin/deletion',
    icon: FiTrash2,
    requiredPermission: 'articles:draft',
    subItems: [
      { label: 'Trash Bin', href: '/admin/deletion', icon: FiTrash2 },
      { label: 'Deletion Audit Log', href: '/admin/deletion', icon: FiShield },
    ],
  },
  {
    id: 'publishing',
    label: 'Publishing',
    href: '/admin/publishing',
    icon: FiSend,
    requiredPermission: 'articles:draft',
    subItems: [
      { label: 'Drafts Queue', href: '/admin/publishing', icon: FiSend },
      { label: 'Newsletter Hub', href: '/admin/newsletter', icon: FiMail },
    ],
  },
  {
    id: 'system_configuration',
    label: 'System Configuration',
    href: '/admin/system',
    icon: FiSettings,
    requiredPermission: 'articles:draft',
    subItems: [
      { label: 'System Diagnostics', href: '/admin/system', icon: FiSettings },
      { label: 'Redis Cache Purge', href: '/admin/system', icon: FiZap },
    ],
  },
];

function getRoleBadge(role?: string): string {
  const labels: Record<string, string> = {
    'super-admin': 'Super Admin',
    manager: 'Manager',
    editor: 'Editor',
    staff: 'Staff',
    contributor: 'Contributor',
    user: 'Reader',
  };
  return labels[role || ''] || role || 'Admin';
}

export default function AdminNavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const userRole = (session?.user?.role as UserRole) || undefined;

  const accessibleTabs = useMemo(() => {
    return PRIMARY_TABS.filter((tab) => {
      if (!tab.requiredPermission) return true;
      return hasPermission(userRole, tab.requiredPermission);
    });
  }, [userRole]);

  // Determine which primary tab matches the current path
  const activeTabId = useMemo(() => {
    if (pathname.startsWith('/admin/employees') || pathname.startsWith('/admin/reports') || pathname.startsWith('/admin/standup') || pathname.startsWith('/admin/handbook') || pathname.startsWith('/admin/evaluations') || pathname.startsWith('/admin/payroll')) {
      return 'employee_management';
    }
    if (pathname.startsWith('/admin/users')) {
      return 'user_management';
    }
    if (pathname.startsWith('/admin/sponsorships')) {
      return 'sponsorship_management';
    }
    if (pathname.startsWith('/admin/deletion')) {
      return 'content_deletion';
    }
    if (pathname.startsWith('/admin/publishing') || pathname.startsWith('/admin/newsletter')) {
      return 'publishing';
    }
    if (pathname.startsWith('/admin/system')) {
      return 'system_configuration';
    }
    return 'cms';
  }, [pathname]);

  return (
    <header className="glass-card border-b border-white/10 rounded-2xl sm:rounded-3xl mb-5 sm:mb-6 shadow-2xl backdrop-blur-2xl bg-slate-950/85">
      <div className="p-3.5 sm:p-5">
        {/* Top Row: Brand, User Info & Quick Actions */}
        <div className="flex items-center justify-between gap-3">
          {/* Brand Info */}
          <Link href="/admin/dashboard" className="flex items-center gap-2.5 sm:gap-3 group">
            <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black text-sm sm:text-base shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              GM
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-xl font-black text-white uppercase tracking-tight">
                  GoalMills <span className="text-amber-400 text-xs sm:text-sm font-bold">Admin Hub</span>
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate max-w-[150px] sm:max-w-[240px]">
                {session?.user?.name || 'Administrator'}{' '}
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-amber-300 font-mono">
                  {getRoleBadge(session?.user?.role as string)}
                </span>
              </p>
            </div>
          </Link>

          {/* Desktop Right Quick Actions */}
          <div className="hidden lg:flex items-center gap-2">
            <Link
              href="/admin/ecosystem"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-bold border border-blue-500/20 transition-all text-xs"
            >
              <FiCompass size={13} />
              <span>Ecosystem</span>
            </Link>
            <Link
              href="/profile"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold border border-amber-500/20 transition-all text-xs"
              title="Profile & Password Settings"
            >
              <FiKey size={13} />
              <span>Password</span>
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all text-xs"
            >
              <FiHome size={13} />
              <span>Live Site</span>
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/signin' })}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold border border-red-500/20 transition-all text-xs"
            >
              <FiLogOut size={13} />
              <span>Sign Out</span>
            </button>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex items-center gap-2 lg:hidden">
            <Link
              href="/"
              className="p-2 rounded-xl bg-white/5 text-slate-300 hover:text-white text-xs font-bold"
              title="View Site"
            >
              <FiHome size={16} />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/15 transition-all"
              aria-label="Toggle Admin Navigation"
            >
              {mobileMenuOpen ? <FiX size={18} /> : <FiMenu size={18} />}
            </button>
          </div>
        </div>

        {/* Desktop Primary Tabs Navigation (7 Core Modules strictly ordered) */}
        <nav className="hidden lg:flex items-center gap-1.5 mt-4 pt-3 border-t border-white/10 overflow-x-auto no-scrollbar">
          {accessibleTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTabId === tab.id;

            return (
              <div key={tab.id} className="relative group">
                <Link
                  href={tab.href}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20 scale-[1.02]'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={15} />
                  <span>{tab.label}</span>
                </Link>
              </div>
            );
          })}
        </nav>

        {/* Mobile Dropdown Quick Selector */}
        <div className="mt-3 block lg:hidden">
          <div className="relative">
            <select
              value={pathname}
              onChange={(e) => router.push(e.target.value)}
              className="w-full appearance-none px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white text-xs sm:text-sm font-bold focus:outline-none focus:border-amber-500 pr-9 transition-colors shadow-inner"
            >
              {accessibleTabs.map((tab) => (
                <optgroup key={tab.id} label={tab.label}>
                  {tab.subItems?.map((sub) => (
                    <option key={sub.href} value={sub.href}>
                      {sub.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <FiChevronDown
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              size={16}
            />
          </div>
        </div>

        {/* Mobile Accordion Drawer */}
        {mobileMenuOpen && (
          <div className="mt-3 pt-3 border-t border-white/10 space-y-3 lg:hidden animate-fade-in">
            <div className="space-y-2">
              {accessibleTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTabId === tab.id;
                return (
                  <div key={tab.id} className="space-y-1">
                    <Link
                      href={tab.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-amber-500 text-slate-950 shadow-md'
                          : 'bg-white/5 text-slate-300 hover:text-white'
                      }`}
                    >
                      <Icon size={15} />
                      <span>{tab.label}</span>
                    </Link>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 rounded-xl bg-amber-500/10 text-amber-300 text-xs font-bold"
              >
                Password
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/signin' })}
                className="flex-1 text-center py-2 rounded-xl bg-red-500/10 text-red-400 text-xs font-bold"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
