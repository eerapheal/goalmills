'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
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
  FiPlusCircle,
  FiActivity,
  FiLayout,
  FiExternalLink,
} from 'react-icons/fi';
import type { UserRole } from '@goalmills/types';
import type { PermissionAction } from '@/lib/rbac';
import { hasPermission } from '@/lib/rbac';

export interface SubNavItem {
  id: string;
  label: string;
  href: string;
  description: string;
  icon: any;
  requiredPermission?: PermissionAction;
  badge?: string;
}

export interface PrimaryTab {
  id: string;
  label: string;
  shortLabel?: string;
  href: string;
  icon: any;
  requiredPermission?: PermissionAction;
  subItems: SubNavItem[];
}

const PRIMARY_TABS: PrimaryTab[] = [
  {
    id: 'cms',
    label: 'CMS & Editorial',
    shortLabel: 'CMS',
    href: '/admin/dashboard',
    icon: FiFileText,
    requiredPermission: 'articles:draft',
    subItems: [
      {
        id: 'news_media',
        label: 'News & Media',
        href: '/admin/dashboard',
        description: 'Published articles, breaking feeds & newsroom wire',
        icon: FiFileText,
        requiredPermission: 'articles:draft',
      },
      {
        id: 'create_article',
        label: 'Create Article',
        href: '/admin/news/new',
        description: 'Compose sports previews, match reports & analysis',
        icon: FiPlusCircle,
        requiredPermission: 'articles:draft',
        badge: 'New',
      },
      {
        id: 'ecosystem',
        label: 'Content Ecosystem',
        href: '/admin/ecosystem',
        description: 'Competitions, clubs, sports & publisher tag network',
        icon: FiCompass,
        requiredPermission: 'articles:draft',
      },
      {
        id: 'categories',
        label: 'Categories & Tags',
        href: '/admin/categories',
        description: 'Manage leagues, topics, filter badges & taxonomy',
        icon: FiLayers,
        requiredPermission: 'categories:manage',
      },
      {
        id: 'publishing',
        label: 'Publishing Queue',
        href: '/admin/publishing',
        description: 'Pending editorial reviews & scheduled release drafts',
        icon: FiSend,
        requiredPermission: 'articles:draft',
      },
      {
        id: 'newsletter',
        label: 'Newsletter Hub',
        href: '/admin/newsletter',
        description: 'Send subscriber email campaigns & match roundups',
        icon: FiMail,
        requiredPermission: 'articles:draft',
      },
      {
        id: 'analytics',
        label: 'Audience Analytics',
        href: '/admin/analytics',
        description: 'Telemetry, read duration & content performance KPIs',
        icon: FiActivity,
        requiredPermission: 'articles:draft',
        badge: 'Pulse',
      },
    ],
  },
  {
    id: 'audience_analytics',
    label: 'Analytics',
    shortLabel: 'Analytics',
    href: '/admin/analytics',
    icon: FiActivity,
    requiredPermission: 'articles:draft',
    subItems: [],
  },
  {
    id: 'employee_management',
    label: 'HR & Staff Operations',
    shortLabel: 'HR & Staff',
    href: '/admin/employees',
    icon: FiUsers,
    requiredPermission: 'employees:read',
    subItems: [
      {
        id: 'staff_portal',
        label: 'Staff Portal / Workspace',
        href: '/admin/portal',
        description: 'Daily submissions, curriculum checklist & standup',
        icon: FiLayout,
        requiredPermission: 'articles:read',
        badge: 'Hub',
      },
      {
        id: 'employees_directory',
        label: 'Employees & Staff',
        href: '/admin/employees',
        description: 'Directory, onboarding contracts & staff profiles',
        icon: FiUsers,
        requiredPermission: 'employees:read',
      },
      {
        id: 'daily_reports',
        label: 'Daily Reports',
        href: '/admin/reports',
        description: 'End-of-day deliverables, links & task tracking',
        icon: FiCheckSquare,
        requiredPermission: 'reports:read_own',
      },
      {
        id: 'standup',
        label: '5 PM Stand-up',
        href: '/admin/standup',
        description: 'Daily newsroom video syncs & attendance logs',
        icon: FiCalendar,
        requiredPermission: 'standup:attend',
      },
      {
        id: 'handbook',
        label: 'Handbook & SOPs',
        href: '/admin/handbook',
        description: 'Official sports journalism curriculum & PDF guide',
        icon: FiBookOpen,
        requiredPermission: 'handbook:read',
      },
      {
        id: 'evaluations',
        label: 'Evaluations & Scorecards',
        href: '/admin/evaluations',
        description: '30-Day trainee assessment, KPIs & transition reviews',
        icon: FiAward,
        requiredPermission: 'evaluations:read',
        badge: 'KPIs',
      },
      {
        id: 'payroll',
        label: 'Payroll & Allowances',
        href: '/admin/payroll',
        description: 'Monthly stipends, salary slips & disbursement logs',
        icon: FiDollarSign,
        requiredPermission: 'payroll:read',
      },
    ],
  },
  {
    id: 'user_management',
    label: 'User Management',
    shortLabel: 'Users',
    href: '/admin/users',
    icon: FiUserCheck,
    requiredPermission: 'users:manage',
    subItems: [],
  },
  {
    id: 'sponsorship_management',
    label: 'Sponsorships',
    shortLabel: 'Ads',
    href: '/admin/sponsorships',
    icon: FiDollarSign,
    requiredPermission: 'articles:draft',
    subItems: [],
  },
  {
    id: 'content_deletion',
    label: 'Trash & Deletions',
    shortLabel: 'Trash',
    href: '/admin/deletion',
    icon: FiTrash2,
    requiredPermission: 'articles:draft',
    subItems: [],
  },
  {
    id: 'system_configuration',
    label: 'System & Diagnostics',
    shortLabel: 'System',
    href: '/admin/system',
    icon: FiSettings,
    requiredPermission: 'articles:draft',
    subItems: [],
  },
];

// Quick jump desktop shortcut chips for high frequency operations
const QUICK_SHORTCUTS = [
  { label: 'Analytics', href: '/admin/analytics', icon: FiActivity, color: 'text-amber-400 border-amber-500/20 bg-amber-500/10 hover:bg-amber-500/20' },
  { label: 'Portal', href: '/admin/portal', icon: FiLayout, color: 'text-indigo-400 border-indigo-500/20 bg-indigo-500/10 hover:bg-indigo-500/20' },
  { label: 'Create Article', href: '/admin/news/new', icon: FiPlusCircle, color: 'text-amber-400 border-amber-500/20 bg-amber-500/10 hover:bg-amber-500/20' },
  { label: 'Evaluation', href: '/admin/evaluations', icon: FiAward, color: 'text-amber-400 border-amber-500/20 bg-amber-500/10 hover:bg-amber-500/20' },
  { label: 'Handbook', href: '/admin/handbook', icon: FiBookOpen, color: 'text-amber-300 border-amber-500/20 bg-amber-500/10 hover:bg-amber-500/20' },
  { label: 'Payroll', href: '/admin/payroll', icon: FiDollarSign, color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20' },
  { label: 'Reports', href: '/admin/reports', icon: FiCheckSquare, color: 'text-blue-400 border-blue-500/20 bg-blue-500/10 hover:bg-blue-500/20' },
  { label: 'Stand-up', href: '/admin/standup', icon: FiCalendar, color: 'text-purple-400 border-purple-500/20 bg-purple-500/10 hover:bg-purple-500/20' },
  { label: 'Ecosystem', href: '/admin/ecosystem', icon: FiCompass, color: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/10 hover:bg-cyan-500/20' },
  { label: 'Categories', href: '/admin/categories', icon: FiLayers, color: 'text-rose-400 border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20' },
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

function isPathActive(currentPath: string, targetHref: string): boolean {
  if (!currentPath || !targetHref) return false;
  if (currentPath === targetHref) return true;

  const normalize = (p: string) => {
    let s = p.replace(/^\/admin/, '');
    if (s === '') s = '/';
    return s;
  };

  const normCurrent = normalize(currentPath);
  const normTarget = normalize(targetHref);

  if (normCurrent === normTarget) return true;
  if (normTarget !== '/' && normTarget !== '/dashboard' && normCurrent.startsWith(normTarget + '/')) {
    return true;
  }
  return false;
}

export default function AdminNavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileExpandedSection, setMobileExpandedSection] = useState<string | null>(null);
  const navContainerRef = useRef<HTMLDivElement>(null);

  const userRole = (session?.user?.role as UserRole) || undefined;

  // Filter primary tabs and their sub-items by role permission
  const accessibleTabs = useMemo(() => {
    return PRIMARY_TABS.map((tab) => {
      const filteredSubItems = tab.subItems.filter((sub) => {
        if (!sub.requiredPermission) return true;
        return hasPermission(userRole, sub.requiredPermission);
      });

      return {
        ...tab,
        subItems: filteredSubItems,
      };
    }).filter((tab) => {
      if (tab.subItems.length > 0) return true;
      if (!tab.requiredPermission) return true;
      return hasPermission(userRole, tab.requiredPermission);
    });
  }, [userRole]);

  // Flatten all accessible items for mobile quick dropdown
  const allSubItems = useMemo(() => {
    const items: { group: string; label: string; href: string }[] = [];
    accessibleTabs.forEach((tab) => {
      if (tab.subItems.length > 1) {
        tab.subItems.forEach((sub) => {
          items.push({
            group: tab.label,
            label: sub.label,
            href: sub.href,
          });
        });
      } else {
        items.push({
          group: tab.label,
          label: tab.label,
          href: tab.href,
        });
      }
    });
    return items;
  }, [accessibleTabs]);

  // Determine current active dropdown value for mobile select
  const currentSelectValue = useMemo(() => {
    const match = allSubItems.find((item) => isPathActive(pathname, item.href));
    return match ? match.href : pathname;
  }, [pathname, allSubItems]);

  // Determine active primary tab
  const activeTabId = useMemo(() => {
    for (const tab of accessibleTabs) {
      if (isPathActive(pathname, tab.href)) return tab.id;
      for (const sub of tab.subItems) {
        if (isPathActive(pathname, sub.href)) return tab.id;
      }
    }
    return 'cms';
  }, [pathname, accessibleTabs]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navContainerRef.current && !navContainerRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setOpenDropdown(null);
  }, [pathname]);

  return (
    <header
      ref={navContainerRef}
      className="glass-card border border-white/10 rounded-2xl sm:rounded-3xl mb-5 sm:mb-6 shadow-2xl backdrop-blur-2xl bg-slate-950/90 relative z-50"
    >
      <div className="p-3.5 sm:p-5 space-y-3.5">
        {/* ========================================================================= */}
        {/* TOP ROW: Brand, Identity, Role Badge & Desktop Shortcuts */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-between gap-3">
          {/* Brand Info */}
          <Link href="/admin/dashboard" className="flex items-center gap-2.5 sm:gap-3 group">
            <span className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black text-sm sm:text-lg shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              GM
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-xl font-black text-white uppercase tracking-tight">
                  GoalMills <span className="text-amber-400 text-xs sm:text-sm font-bold">Admin Hub</span>
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate max-w-[170px] sm:max-w-[260px] flex items-center gap-1.5">
                <span>{session?.user?.name || 'Administrator'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-500/20 font-mono font-bold">
                  {getRoleBadge(session?.user?.role as string)}
                </span>
              </p>
            </div>
          </Link>

          {/* Desktop Right Quick Actions */}
          <div className="hidden xl:flex items-center gap-2">
            <Link
              href="/profile"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold border border-amber-500/20 transition-all text-xs"
              title="Profile & Password Security"
            >
              <FiKey size={13} />
              <span>Password</span>
            </Link>
            <Link
              href="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all text-xs border border-white/10"
              title="Open Live Public GoalMills Site"
            >
              <FiHome size={13} />
              <span>Live Site</span>
              <FiExternalLink size={11} className="text-slate-400" />
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
              target="_blank"
              rel="noreferrer"
              className="p-2.5 rounded-xl bg-white/5 text-slate-300 hover:text-white text-xs font-bold border border-white/10"
              title="View Public Site"
            >
              <FiHome size={16} />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-all flex items-center gap-1.5 text-xs font-bold"
              aria-label="Toggle Admin Navigation"
            >
              {mobileMenuOpen ? <FiX size={18} /> : <FiMenu size={18} />}
              <span className="text-xs font-black uppercase">Menu</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* DESKTOP QUICK ACCESS SHORTCUT BAR */}
        {/* ========================================================================= */}
        <div className="hidden lg:flex items-center justify-between gap-2 pt-2 border-t border-white/10">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
              <span>⚡</span> Quick Links:
            </span>
            {QUICK_SHORTCUTS.map((item) => {
              const Icon = item.icon;
              const isActive = isPathActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20 scale-[1.03]'
                      : item.color
                  }`}
                >
                  <Icon size={12} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="hidden lg:flex xl:hidden items-center gap-2">
            <Link
              href="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 text-white text-xs font-bold"
            >
              <FiHome size={12} />
              <span>Live Site</span>
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/signin' })}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 text-xs font-bold"
            >
              <FiLogOut size={12} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* DESKTOP PRIMARY MODULE TABS (Interactive Dropdowns only for multi-item tabs) */}
        {/* ========================================================================= */}
        <nav className="hidden lg:flex items-center gap-1.5 pt-2 border-t border-white/5 overflow-visible relative">
          {accessibleTabs.map((tab) => {
            const Icon = tab.icon;
            const isTabActive = activeTabId === tab.id;
            const hasDropdown = tab.subItems.length > 1;
            const isDropdownOpen = hasDropdown && openDropdown === tab.id;

            // Direct link for single-page modules (User Management, Sponsorships, Deletion, System)
            if (!hasDropdown) {
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black tracking-wide uppercase transition-all duration-200 ${
                    isTabActive
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/25 scale-[1.02]'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </Link>
              );
            }

            // Interactive Popover Dropdown for multi-item modules (CMS & Editorial, HR & Staff)
            return (
              <div
                key={tab.id}
                className="relative"
                onMouseEnter={() => setOpenDropdown(tab.id)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <Link
                  href={tab.href}
                  onClick={() => setOpenDropdown(null)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black tracking-wide uppercase transition-all duration-200 ${
                    isTabActive
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/25 scale-[1.02]'
                      : isDropdownOpen
                        ? 'bg-white/10 text-white'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                  <FiChevronDown
                    size={12}
                    className={`transition-transform duration-200 ${
                      isDropdownOpen ? 'rotate-180 text-white' : 'text-slate-400'
                    }`}
                  />
                </Link>

                {isDropdownOpen && (
                  <div className="absolute left-0 top-full mt-1.5 w-72 sm:w-80 rounded-2xl bg-slate-950/95 border border-white/15 backdrop-blur-2xl shadow-2xl p-2 z-50 animate-fade-in space-y-1">
                    <div className="px-3 py-1.5 border-b border-white/10 flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                        {tab.label} Modules
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {tab.subItems.length} items
                      </span>
                    </div>

                    <div className="space-y-1 max-h-[360px] overflow-y-auto custom-scrollbar">
                      {tab.subItems.map((sub) => {
                        const SubIcon = sub.icon;
                        const isSubActive = isPathActive(pathname, sub.href);

                        return (
                          <Link
                            key={sub.id + sub.href}
                            href={sub.href}
                            onClick={() => setOpenDropdown(null)}
                            className={`group flex items-start gap-3 p-2.5 rounded-xl transition-all ${
                              isSubActive
                                ? 'bg-amber-500/15 border border-amber-500/40 text-amber-300'
                                : 'hover:bg-white/10 text-slate-200 border border-transparent'
                            }`}
                          >
                            <div
                              className={`p-2 rounded-lg mt-0.5 transition-colors ${
                                isSubActive
                                  ? 'bg-amber-500 text-slate-950'
                                  : 'bg-white/5 text-slate-300 group-hover:bg-amber-500/20 group-hover:text-amber-400'
                              }`}
                            >
                              <SubIcon size={14} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <span
                                  className={`text-xs font-bold truncate ${
                                    isSubActive ? 'text-amber-300' : 'text-white'
                                  }`}
                                >
                                  {sub.label}
                                </span>
                                {sub.badge && (
                                  <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 uppercase font-mono">
                                    {sub.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 leading-tight mt-0.5 line-clamp-1">
                                {sub.description}
                              </p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* ========================================================================= */}
        {/* MOBILE PROMINENT QUICK SELECTOR DROPDOWN (All-in-one Jump Dropdown) */}
        {/* ========================================================================= */}
        <div className="block lg:hidden pt-2 border-t border-white/10">
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="mobile-admin-dropdown"
              className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5"
            >
              <span>⚡</span>
              <span>Quick Module Navigator</span>
            </label>
            <span className="text-[10px] text-slate-400 font-bold uppercase">
              1-Tap Switch
            </span>
          </div>

          <div className="relative">
            <select
              id="mobile-admin-dropdown"
              value={currentSelectValue}
              onChange={(e) => {
                router.push(e.target.value);
              }}
              className="w-full appearance-none px-4 py-3 rounded-2xl bg-slate-900/95 border-2 border-amber-500/30 text-white text-xs sm:text-sm font-bold focus:outline-none focus:border-amber-400 pr-10 shadow-xl transition-all"
            >
              {accessibleTabs.map((tab) => {
                if (tab.subItems.length > 1) {
                  return (
                    <optgroup key={tab.id} label={`📂 ${tab.label}`}>
                      {tab.subItems.map((sub) => (
                        <option key={sub.id + sub.href} value={sub.href}>
                          {sub.label}
                        </option>
                      ))}
                    </optgroup>
                  );
                }
                return (
                  <option key={tab.id} value={tab.href}>
                    📌 {tab.label}
                  </option>
                );
              })}
            </select>
            <FiChevronDown
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-amber-400 pointer-events-none"
              size={18}
            />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MOBILE ACCORDION DRAWER WITH FULL CATEGORIZED MENUS */}
        {/* ========================================================================= */}
        {mobileMenuOpen && (
          <div className="pt-3 border-t border-white/10 space-y-4 lg:hidden animate-fade-in">
            {/* Quick Action Badges on Mobile Drawer */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Featured Tools:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {QUICK_SHORTCUTS.slice(0, 6).map((item) => {
                  const Icon = item.icon;
                  const isActive = isPathActive(pathname, item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold border transition-all ${
                        isActive
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                          : item.color
                      }`}
                    >
                      <Icon size={14} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Categorized Navigation: Single Link or Accordion */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                All Admin Modules:
              </span>

              {accessibleTabs.map((tab) => {
                const Icon = tab.icon;
                const isTabActive = activeTabId === tab.id;
                const hasDropdown = tab.subItems.length > 1;

                if (!hasDropdown) {
                  return (
                    <Link
                      key={tab.id}
                      href={tab.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-2.5 p-3 rounded-2xl border text-xs font-black uppercase transition-all ${
                        isTabActive
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                          : 'bg-slate-900/60 border-white/10 text-slate-300 hover:text-white'
                      }`}
                    >
                      <Icon size={15} className={isTabActive ? 'text-slate-950' : 'text-amber-400'} />
                      <span>{tab.label}</span>
                    </Link>
                  );
                }

                const isExpanded =
                  mobileExpandedSection === tab.id || (mobileExpandedSection === null && isTabActive);

                return (
                  <div
                    key={tab.id}
                    className="rounded-2xl border border-white/10 bg-slate-900/60 overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setMobileExpandedSection(isExpanded ? '__none__' : tab.id)
                      }
                      className={`w-full flex items-center justify-between p-3 text-xs font-black uppercase transition-colors ${
                        isTabActive
                          ? 'bg-amber-500/10 text-amber-300'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon size={15} className="text-amber-400" />
                        <span>{tab.label}</span>
                      </div>
                      <FiChevronDown
                        size={14}
                        className={`transition-transform duration-200 ${
                          isExpanded ? 'rotate-180 text-amber-400' : 'text-slate-400'
                        }`}
                      />
                    </button>

                    {isExpanded && (
                      <div className="p-2 space-y-1 border-t border-white/5 bg-slate-950/40">
                        {tab.subItems.map((sub) => {
                          const SubIcon = sub.icon;
                          const isSubActive = isPathActive(pathname, sub.href);

                          return (
                            <Link
                              key={sub.id + sub.href}
                              href={sub.href}
                              onClick={() => setMobileMenuOpen(false)}
                              className={`flex items-center justify-between p-2.5 rounded-xl text-xs transition-all ${
                                isSubActive
                                  ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                                  : 'bg-white/5 text-slate-200 hover:bg-white/10 font-bold'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <SubIcon size={14} />
                                <span>{sub.label}</span>
                              </div>
                              {sub.badge && (
                                <span
                                  className={`text-[9px] font-black px-1.5 py-0.2 rounded uppercase ${
                                    isSubActive
                                      ? 'bg-slate-950 text-amber-400'
                                      : 'bg-amber-500/20 text-amber-400'
                                  }`}
                                >
                                  {sub.badge}
                                </span>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2.5 rounded-xl bg-amber-500/10 text-amber-300 text-xs font-bold border border-amber-500/20"
              >
                Password Security
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/signin' })}
                className="flex-1 text-center py-2.5 rounded-xl bg-red-500/10 text-red-400 text-xs font-bold border border-red-500/20"
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
