'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  FiFileText,
  FiPlusCircle,
  FiCompass,
  FiLayers,
  FiSend,
  FiMail,
  FiActivity,
  FiSliders,
  FiSearch,
  FiZap,
  FiDatabase,
  FiShare2,
  FiDollarSign,
  FiAward,
  FiUsers,
  FiUserCheck,
  FiCheckSquare,
  FiCalendar,
  FiBookOpen,
  FiSettings,
  FiTrash2,
  FiLayout,
  FiShield,
  FiChevronDown,
  FiChevronRight,
  FiHome,
  FiTrendingUp,
  FiGrid,
  FiX,
  FiMenu,
} from 'react-icons/fi';
import type { UserRole } from '@goalmills/types';
import type { PermissionAction } from '@/lib/rbac';
import { hasPermission } from '@/lib/rbac';

// ---------------------------------------------------------------------------
// Data Model
// ---------------------------------------------------------------------------
export interface SidebarNavItem {
  id: string;
  label: string;
  href: string;
  icon: any;
  requiredPermission?: PermissionAction;
  badge?: string;
  badgeColor?: string;
}

export interface SidebarGroup {
  id: string;
  label: string;
  icon: any;
  color: string;
  items: SidebarNavItem[];
  requiredPermission?: PermissionAction;
}

const SIDEBAR_GROUPS: SidebarGroup[] = [
  // ─── CMS & EDITORIAL ──────────────────────────────────────────────────────
  {
    id: 'cms',
    label: 'CMS & Editorial',
    icon: FiFileText,
    color: 'blue',
    items: [
      { id: 'dashboard', label: 'News & Media Hub', href: '/admin/dashboard', icon: FiHome, requiredPermission: 'articles:draft' },
      { id: 'create_article', label: 'Create Article', href: '/admin/news/new', icon: FiPlusCircle, requiredPermission: 'articles:draft', badge: 'New', badgeColor: 'blue' },
      { id: 'publishing', label: 'Publishing Queue', href: '/admin/publishing', icon: FiSend, requiredPermission: 'articles:draft' },
      { id: 'ecosystem', label: 'Content Ecosystem', href: '/admin/ecosystem', icon: FiCompass, requiredPermission: 'articles:draft' },
      { id: 'categories', label: 'Categories & Tags', href: '/admin/categories', icon: FiLayers, requiredPermission: 'categories:manage' },
      { id: 'newsletter', label: 'Newsletter Hub', href: '/admin/newsletter', icon: FiMail, requiredPermission: 'articles:draft' },
    ],
  },
  // ─── ANALYTICS & REVENUE ──────────────────────────────────────────────────
  {
    id: 'analytics',
    label: 'Analytics & Revenue',
    icon: FiTrendingUp,
    color: 'amber',
    items: [
      { id: 'analytics', label: 'Audience Analytics', href: '/admin/analytics', icon: FiActivity, requiredPermission: 'articles:draft', badge: 'Pulse', badgeColor: 'amber' },
      { id: 'billing', label: 'Fan Pass Billing', href: '/admin/billing', icon: FiDollarSign, requiredPermission: 'articles:draft', badge: 'MRR', badgeColor: 'green' },
      { id: 'advertisers', label: 'Advertiser Reports', href: '/admin/advertisers', icon: FiAward, requiredPermission: 'articles:draft' },
      { id: 'sponsorships', label: 'Sponsorships', href: '/admin/sponsorships', icon: FiShield, requiredPermission: 'articles:draft' },
    ],
  },
  // ─── CONTENT OPS ──────────────────────────────────────────────────────────
  {
    id: 'content_ops',
    label: 'Content Ops',
    icon: FiGrid,
    color: 'purple',
    items: [
      { id: 'recommendations', label: 'Recommendation Studio', href: '/admin/recommendations', icon: FiSliders, requiredPermission: 'articles:draft', badge: 'AI', badgeColor: 'purple' },
      { id: 'distribution', label: 'Distribution Hub', href: '/admin/distribution', icon: FiShare2, requiredPermission: 'articles:draft' },
      { id: 'search', label: 'Search Diagnostics', href: '/admin/search', icon: FiSearch, requiredPermission: 'articles:draft' },
      { id: 'events', label: 'Stream & Telemetry', href: '/admin/events', icon: FiZap, requiredPermission: 'articles:draft', badge: 'Live', badgeColor: 'red' },
      { id: 'warehouse', label: 'Sports Warehouse', href: '/admin/warehouse', icon: FiDatabase, requiredPermission: 'articles:draft' },
    ],
  },
  // ─── HR & STAFF ───────────────────────────────────────────────────────────
  {
    id: 'hr',
    label: 'HR & Staff',
    icon: FiUsers,
    color: 'emerald',
    items: [
      { id: 'portal', label: 'Staff Portal', href: '/admin/portal', icon: FiLayout, requiredPermission: 'articles:read', badge: 'Hub', badgeColor: 'emerald' },
      { id: 'employees', label: 'Employees & Staff', href: '/admin/employees', icon: FiUsers, requiredPermission: 'employees:read' },
      { id: 'contracts', label: 'Contracts & Signing', href: '/admin/employees', icon: FiFileText, requiredPermission: 'employees:manage' },
      { id: 'reports', label: 'Daily Reports', href: '/admin/reports', icon: FiCheckSquare, requiredPermission: 'reports:read_own' },
      { id: 'standup', label: '5 PM Stand-up', href: '/admin/standup', icon: FiCalendar, requiredPermission: 'standup:attend' },
      { id: 'handbook', label: 'Handbook & SOPs', href: '/admin/handbook', icon: FiBookOpen, requiredPermission: 'handbook:read' },
      { id: 'evaluations', label: 'Evaluations', href: '/admin/evaluations', icon: FiAward, requiredPermission: 'evaluations:read', badge: 'KPIs', badgeColor: 'amber' },
      { id: 'payroll', label: 'Payroll & Allowances', href: '/admin/payroll', icon: FiDollarSign, requiredPermission: 'payroll:read' },
    ],
  },
  // ─── ADMINISTRATION ───────────────────────────────────────────────────────
  {
    id: 'admin_ops',
    label: 'Administration',
    icon: FiSettings,
    color: 'slate',
    requiredPermission: 'users:manage',
    items: [
      { id: 'users', label: 'User Management', href: '/admin/users', icon: FiUserCheck, requiredPermission: 'users:manage' },
      { id: 'system', label: 'System & Diagnostics', href: '/admin/system', icon: FiSettings, requiredPermission: 'system:settings' },
      { id: 'deletion', label: 'Trash & Deletions', href: '/admin/deletion', icon: FiTrash2, requiredPermission: 'articles:delete' },
    ],
  },
];

// ---------------------------------------------------------------------------
// Color Maps
// ---------------------------------------------------------------------------
const BADGE_COLORS: Record<string, string> = {
  blue:    'bg-blue-500/20 text-blue-400',
  amber:   'bg-amber-500/20 text-amber-400',
  green:   'bg-emerald-500/20 text-emerald-400',
  purple:  'bg-purple-500/20 text-purple-400',
  red:     'bg-red-500/20 text-red-400',
  emerald: 'bg-emerald-500/20 text-emerald-400',
  slate:   'bg-slate-500/20 text-slate-400',
};

type ColorKey = 'blue' | 'amber' | 'purple' | 'emerald' | 'slate';
const GROUP_THEME: Record<ColorKey, { groupIcon: string; itemActive: string; itemBorder: string; groupBg: string }> = {
  blue:    { groupIcon: 'text-blue-400',    itemActive: 'bg-blue-500/15 text-blue-300',    itemBorder: 'border-l-2 border-l-blue-400',    groupBg: 'bg-blue-500/10' },
  amber:   { groupIcon: 'text-amber-400',   itemActive: 'bg-amber-500/15 text-amber-300',   itemBorder: 'border-l-2 border-l-amber-400',   groupBg: 'bg-amber-500/10' },
  purple:  { groupIcon: 'text-purple-400',  itemActive: 'bg-purple-500/15 text-purple-300',  itemBorder: 'border-l-2 border-l-purple-400',  groupBg: 'bg-purple-500/10' },
  emerald: { groupIcon: 'text-emerald-400', itemActive: 'bg-emerald-500/15 text-emerald-300', itemBorder: 'border-l-2 border-l-emerald-400', groupBg: 'bg-emerald-500/10' },
  slate:   { groupIcon: 'text-slate-400',   itemActive: 'bg-slate-500/15 text-slate-200',   itemBorder: 'border-l-2 border-l-slate-400',   groupBg: 'bg-slate-500/10' },
};

// ---------------------------------------------------------------------------
// Route Match Helper
// ---------------------------------------------------------------------------
function isActive(currentPath: string, href: string): boolean {
  if (!currentPath || !href) return false;
  if (currentPath === href) return true;
  const normalize = (p: string) => p.replace(/^\/admin/, '') || '/';
  const n = normalize(currentPath);
  const t = normalize(href);
  if (n === t) return true;
  if (t !== '/' && t !== '/dashboard' && n.startsWith(t + '/')) return true;
  return false;
}

// ---------------------------------------------------------------------------
// DESKTOP SIDEBAR (lg+)
// ---------------------------------------------------------------------------
interface DesktopSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  groups: SidebarGroup[];
  pathname: string;
  userRole?: UserRole;
  expandedGroups: Record<string, boolean>;
  onToggleGroup: (id: string) => void;
}

function DesktopSidebar({ collapsed, onToggle, groups, pathname, userRole, expandedGroups, onToggleGroup }: DesktopSidebarProps) {
  return (
    <aside
      className={`
        hidden lg:flex flex-col flex-shrink-0 h-full sticky top-0
        bg-slate-950/98 border-r border-white/[0.08] backdrop-blur-2xl
        transition-all duration-300 ease-in-out overflow-hidden
        ${collapsed ? 'w-[58px]' : 'w-[228px]'}
      `}
    >
      {/* Toggle button */}
      <div className={`flex items-center border-b border-white/[0.07] px-2 py-3 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed && (
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">
            Modules
          </span>
        )}
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-white transition-colors"
          title={collapsed ? 'Expand navigation' : 'Collapse navigation'}
        >
          {collapsed ? <FiChevronRight size={15} /> : <FiChevronRight size={15} className="rotate-180" />}
        </button>
      </div>

      {/* Groups */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-0.5 px-1.5 custom-scrollbar">
        {groups.map((group) => {
          const GroupIcon = group.icon;
          const theme = GROUP_THEME[group.color as ColorKey] || GROUP_THEME.slate;
          const isExpanded = expandedGroups[group.id];
          const hasActive = group.items.some((item) => isActive(pathname, item.href));

          return (
            <div key={group.id} className="mb-1">
              {/* Group header */}
              <button
                onClick={() => !collapsed && onToggleGroup(group.id)}
                title={collapsed ? group.label : undefined}
                className={`
                  w-full flex items-center gap-2 px-2 py-2 rounded-xl transition-all duration-150
                  ${hasActive ? theme.groupBg : 'hover:bg-white/[0.04]'}
                  ${collapsed ? 'justify-center' : ''}
                `}
              >
                <GroupIcon size={15} className={hasActive ? theme.groupIcon : 'text-slate-600'} />
                {!collapsed && (
                  <>
                    <span className={`flex-1 text-[11px] font-black uppercase tracking-wide truncate text-left ${hasActive ? 'text-white' : 'text-slate-500'}`}>
                      {group.label}
                    </span>
                    <FiChevronDown
                      size={12}
                      className={`flex-shrink-0 text-slate-600 transition-transform duration-200 ${isExpanded ? '' : '-rotate-90'}`}
                    />
                  </>
                )}
              </button>

              {/* Items */}
              {(isExpanded || collapsed) && (
                <div className={collapsed ? 'space-y-0.5 mt-0.5' : 'ml-1.5 space-y-0.5 mt-0.5'}>
                  {group.items.map((item) => {
                    const ItemIcon = item.icon;
                    const active = isActive(pathname, item.href);
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        title={collapsed ? item.label : undefined}
                        className={`
                          flex items-center gap-2 px-2 py-1.5 rounded-lg
                          text-[12px] font-medium transition-all duration-150
                          ${active
                            ? `${theme.itemActive} ${theme.itemBorder} font-semibold`
                            : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.04]'
                          }
                          ${collapsed ? 'justify-center' : ''}
                        `}
                      >
                        <ItemIcon size={13} className={active ? theme.groupIcon : 'text-slate-600'} />
                        {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                        {!collapsed && item.badge && (
                          <span className={`text-[9px] font-black px-1 py-0.5 rounded uppercase ${BADGE_COLORS[item.badgeColor || 'slate']}`}>
                            {item.badge}
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
      </nav>

      {/* Role badge */}
      {!collapsed && (
        <div className="px-2 pb-3">
          <div className="px-2.5 py-2 rounded-xl bg-slate-900/80 border border-white/[0.06]">
            <p className="text-[10px] text-slate-600 uppercase font-bold tracking-wider">Role</p>
            <p className="text-xs font-black text-amber-400 capitalize mt-0.5 truncate">
              {(userRole || 'admin').replace('-', ' ')}
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}

// ---------------------------------------------------------------------------
// MOBILE NAV BAR — Bottom Tab Bar (sm and below)
// ---------------------------------------------------------------------------
interface MobileNavProps {
  groups: SidebarGroup[];
  pathname: string;
  onOpenDrawer: () => void;
}

function MobileBottomNav({ groups, pathname, onOpenDrawer }: MobileNavProps) {
  // Pick the top 4 most-relevant items for the bottom tab bar
  // Priority: Staff Portal, Daily Reports, News/Media, Stand-up (role-dependent)
  const pinned = [
    groups.flatMap((g) => g.items).find((i) => i.id === 'dashboard'),
    groups.flatMap((g) => g.items).find((i) => i.id === 'portal'),
    groups.flatMap((g) => g.items).find((i) => i.id === 'reports'),
    groups.flatMap((g) => g.items).find((i) => i.id === 'standup'),
  ].filter(Boolean) as SidebarNavItem[];

  // Fill remaining slots with first available items if some are missing
  if (pinned.length < 3) {
    groups.forEach((g) => {
      g.items.forEach((item) => {
        if (pinned.length < 4 && !pinned.find((p) => p.id === item.id)) {
          pinned.push(item);
        }
      });
    });
  }

  const displayPinned = pinned.slice(0, 4);

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 safe-area-pb">
      <div className="flex items-stretch bg-slate-950/98 border-t border-white/[0.08] backdrop-blur-2xl">
        {displayPinned.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`
                flex-1 flex flex-col items-center justify-center gap-0.5 py-3 px-1
                transition-all duration-150 min-w-0
                ${active
                  ? 'text-amber-400'
                  : 'text-slate-600 active:text-slate-300'
                }
              `}
            >
              <div className={`relative ${active ? 'scale-110' : ''} transition-transform`}>
                <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                {item.badge && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500" />
                )}
              </div>
              <span className={`text-[10px] font-bold truncate w-full text-center ${active ? 'text-amber-400' : 'text-slate-600'}`}>
                {item.label.split(' ')[0]}
              </span>
            </Link>
          );
        })}

        {/* "More" button opens full drawer */}
        <button
          onClick={onOpenDrawer}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 py-3 px-1 text-slate-600 active:text-slate-300"
        >
          <FiMenu size={20} strokeWidth={1.8} />
          <span className="text-[10px] font-bold">More</span>
        </button>
      </div>
    </nav>
  );
}

// ---------------------------------------------------------------------------
// MOBILE DRAWER — slide-up full navigation panel
// ---------------------------------------------------------------------------
interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  groups: SidebarGroup[];
  pathname: string;
  userRole?: UserRole;
  expandedGroups: Record<string, boolean>;
  onToggleGroup: (id: string) => void;
}

function MobileDrawer({ open, onClose, groups, pathname, userRole, expandedGroups, onToggleGroup }: MobileDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-[60] flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div
        ref={drawerRef}
        className="relative bg-slate-950 border-t border-white/10 rounded-t-3xl max-h-[88vh] flex flex-col shadow-2xl animate-slide-up"
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.07]">
          <div>
            <p className="text-sm font-black text-white">All Modules</p>
            <p className="text-[11px] text-slate-500 mt-0.5 capitalize">
              {(userRole || 'admin').replace('-', ' ')} access
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white transition-colors"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 px-4 py-3 space-y-2 pb-6">
          {groups.map((group) => {
            const GroupIcon = group.icon;
            const theme = GROUP_THEME[group.color as ColorKey] || GROUP_THEME.slate;
            const isExpanded = expandedGroups[group.id];
            const hasActive = group.items.some((item) => isActive(pathname, item.href));

            return (
              <div key={group.id} className="rounded-2xl overflow-hidden border border-white/[0.06] bg-slate-900/50">
                {/* Group header */}
                <button
                  onClick={() => onToggleGroup(group.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${hasActive ? theme.groupBg : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-xl ${theme.groupBg} flex items-center justify-center`}>
                      <GroupIcon size={14} className={theme.groupIcon} />
                    </div>
                    <span className={`text-sm font-black ${hasActive ? 'text-white' : 'text-slate-300'}`}>
                      {group.label}
                    </span>
                  </div>
                  <FiChevronDown
                    size={15}
                    className={`text-slate-500 transition-transform duration-200 ${isExpanded ? '' : '-rotate-90'}`}
                  />
                </button>

                {/* Items */}
                {isExpanded && (
                  <div className="px-2 pb-2 space-y-1 border-t border-white/[0.05]">
                    {group.items.map((item) => {
                      const ItemIcon = item.icon;
                      const active = isActive(pathname, item.href);
                      return (
                        <Link
                          key={item.id}
                          href={item.href}
                          onClick={onClose}
                          className={`
                            flex items-center gap-3 px-3 py-2.5 rounded-xl
                            text-sm font-medium transition-all duration-150
                            ${active
                              ? `${theme.itemActive} ${theme.itemBorder} font-semibold`
                              : 'text-slate-400 active:bg-white/5'
                            }
                          `}
                        >
                          <ItemIcon size={16} className={active ? theme.groupIcon : 'text-slate-600'} />
                          <span className="flex-1">{item.label}</span>
                          {item.badge && (
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${BADGE_COLORS[item.badgeColor || 'slate']}`}>
                              {item.badge}
                            </span>
                          )}
                          {active && <FiChevronRight size={14} className="text-slate-500" />}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MAIN EXPORT — AdminSidebar (orchestrates mobile + desktop)
// ---------------------------------------------------------------------------
export interface AdminSidebarState {
  desktopCollapsed: boolean;
  mobileDrawerOpen: boolean;
  toggleDesktop: () => void;
  openMobileDrawer: () => void;
  closeMobileDrawer: () => void;
}

interface AdminSidebarProps {
  desktopCollapsed: boolean;
  mobileDrawerOpen: boolean;
  onToggleDesktop: () => void;
  onOpenMobileDrawer: () => void;
  onCloseMobileDrawer: () => void;
}

export default function AdminSidebar({
  desktopCollapsed,
  mobileDrawerOpen,
  onToggleDesktop,
  onOpenMobileDrawer,
  onCloseMobileDrawer,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = (session?.user?.role as UserRole) || undefined;

  // Expanded groups state
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(SIDEBAR_GROUPS.map((g) => [g.id, true]))
  );

  // Auto-expand group with the active route
  useEffect(() => {
    SIDEBAR_GROUPS.forEach((group) => {
      if (group.items.some((item) => isActive(pathname, item.href))) {
        setExpandedGroups((prev) => ({ ...prev, [group.id]: true }));
      }
    });
  }, [pathname]);

  const toggleGroup = (id: string) =>
    setExpandedGroups((prev) => ({ ...prev, [id]: !prev[id] }));

  // Filter groups & items by role
  const accessibleGroups = SIDEBAR_GROUPS.map((group) => {
    if (group.requiredPermission && !hasPermission(userRole, group.requiredPermission)) return null;
    const filteredItems = group.items.filter(
      (item) => !item.requiredPermission || hasPermission(userRole, item.requiredPermission)
    );
    return filteredItems.length === 0 ? null : { ...group, items: filteredItems };
  }).filter(Boolean) as SidebarGroup[];

  return (
    <>
      {/* ── Desktop Sidebar ──────────────────────────────── */}
      <DesktopSidebar
        collapsed={desktopCollapsed}
        onToggle={onToggleDesktop}
        groups={accessibleGroups}
        pathname={pathname}
        userRole={userRole}
        expandedGroups={expandedGroups}
        onToggleGroup={toggleGroup}
      />

      {/* ── Mobile Bottom Tab Bar ────────────────────────── */}
      <MobileBottomNav
        groups={accessibleGroups}
        pathname={pathname}
        onOpenDrawer={onOpenMobileDrawer}
      />

      {/* ── Mobile Full Drawer ───────────────────────────── */}
      <MobileDrawer
        open={mobileDrawerOpen}
        onClose={onCloseMobileDrawer}
        groups={accessibleGroups}
        pathname={pathname}
        userRole={userRole}
        expandedGroups={expandedGroups}
        onToggleGroup={toggleGroup}
      />
    </>
  );
}
