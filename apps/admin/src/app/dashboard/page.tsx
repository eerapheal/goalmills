'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import GoalmillsLoader from '@/components/GoalmillsLoader';
import { DailyContentReport } from '@goalmills/types';
import type { UserRole } from '@goalmills/types';
import { hasPermission } from '@/lib/rbac';
import {
  FiFileText,
  FiPlusCircle,
  FiSend,
  FiCompass,
  FiLayers,
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
  FiChevronRight,
  FiTrendingUp,
  FiClock,
  FiCheckCircle,
  FiAlertTriangle,
  FiStar,
  FiExternalLink,
  FiGrid,
  FiHome,
} from 'react-icons/fi';

// ---------------------------------------------------------------------------
// Role-aware quick action cards grouped by category
// ---------------------------------------------------------------------------
interface ActionCard {
  id: string;
  label: string;
  desc: string;
  href: string;
  icon: any;
  color: string; // Tailwind accent classes
  badge?: string;
  requiredPermission: import('@/lib/rbac').PermissionAction;
}

interface ActionGroup {
  id: string;
  title: string;
  icon: any;
  color: string;
  actions: ActionCard[];
}

const ACTION_GROUPS: ActionGroup[] = [
  {
    id: 'cms',
    title: 'CMS & Editorial',
    icon: FiFileText,
    color: 'blue',
    actions: [
      { id: 'dashboard',   label: 'News & Media',        desc: 'Manage articles & videos',       href: '/admin/dashboard',        icon: FiHome,       color: 'from-blue-600 to-blue-700',    requiredPermission: 'articles:draft' },
      { id: 'create',      label: 'Create Article',      desc: 'Write a new sports story',       href: '/admin/news/new',         icon: FiPlusCircle, color: 'from-blue-500 to-indigo-600',  requiredPermission: 'articles:draft', badge: 'New' },
      { id: 'publishing',  label: 'Publishing Queue',    desc: 'Review & schedule content',      href: '/admin/publishing',       icon: FiSend,       color: 'from-violet-600 to-purple-700', requiredPermission: 'articles:draft' },
      { id: 'ecosystem',   label: 'Ecosystem',           desc: 'Competitions, clubs & tags',     href: '/admin/ecosystem',        icon: FiCompass,    color: 'from-cyan-600 to-teal-700',    requiredPermission: 'articles:draft' },
      { id: 'categories',  label: 'Categories',          desc: 'Manage leagues & topics',        href: '/admin/categories',       icon: FiLayers,     color: 'from-rose-600 to-pink-700',    requiredPermission: 'categories:manage' },
      { id: 'newsletter',  label: 'Newsletter',          desc: 'Email campaigns & roundups',     href: '/admin/newsletter',       icon: FiMail,       color: 'from-purple-600 to-violet-700', requiredPermission: 'articles:draft' },
    ],
  },
  {
    id: 'analytics',
    title: 'Analytics & Revenue',
    icon: FiTrendingUp,
    color: 'amber',
    actions: [
      { id: 'analytics',    label: 'Audience Analytics', desc: 'Performance KPIs & telemetry',   href: '/admin/analytics',        icon: FiActivity,   color: 'from-amber-500 to-orange-600',  requiredPermission: 'articles:draft', badge: 'Pulse' },
      { id: 'billing',      label: 'Fan Pass Billing',   desc: 'Stripe MRR & subscriptions',     href: '/admin/billing',          icon: FiDollarSign, color: 'from-emerald-600 to-green-700', requiredPermission: 'articles:draft', badge: 'MRR' },
      { id: 'advertisers',  label: 'Advertiser Reports', desc: 'PoP & viewability audits',        href: '/admin/advertisers',      icon: FiAward,      color: 'from-amber-600 to-yellow-700',  requiredPermission: 'articles:draft' },
      { id: 'sponsorships', label: 'Sponsorships',       desc: 'Brand deals & ad campaigns',     href: '/admin/sponsorships',     icon: FiShield,     color: 'from-emerald-500 to-teal-600',  requiredPermission: 'articles:draft' },
    ],
  },
  {
    id: 'content_ops',
    title: 'Content Ops',
    icon: FiGrid,
    color: 'purple',
    actions: [
      { id: 'recommendations', label: 'AI Recommendations', desc: 'Algorithm weights & testing', href: '/admin/recommendations', icon: FiSliders,  color: 'from-purple-600 to-violet-700', requiredPermission: 'articles:draft', badge: 'AI' },
      { id: 'distribution',    label: 'Distribution Hub',   desc: 'Social syndication & RSS',    href: '/admin/distribution',    icon: FiShare2,   color: 'from-purple-500 to-indigo-600', requiredPermission: 'articles:draft' },
      { id: 'search',          label: 'Search Diagnostics', desc: 'Full-text index health',      href: '/admin/search',          icon: FiSearch,   color: 'from-cyan-600 to-blue-700',     requiredPermission: 'articles:draft' },
      { id: 'events',          label: 'Stream & Telemetry', desc: 'Live match event broker',     href: '/admin/events',          icon: FiZap,      color: 'from-amber-500 to-orange-600',  requiredPermission: 'articles:draft', badge: 'Live' },
      { id: 'warehouse',       label: 'Sports Warehouse',   desc: 'Historical match data',       href: '/admin/warehouse',       icon: FiDatabase, color: 'from-blue-600 to-cyan-700',     requiredPermission: 'articles:draft' },
    ],
  },
  {
    id: 'hr',
    title: 'HR & Staff',
    icon: FiUsers,
    color: 'emerald',
    actions: [
      { id: 'portal',      label: 'Staff Portal',       desc: 'Daily hub for all staff',        href: '/admin/portal',       icon: FiLayout,      color: 'from-emerald-600 to-teal-700',  requiredPermission: 'articles:read', badge: 'Hub' },
      { id: 'employees',   label: 'Employees',          desc: 'Directory & onboarding',         href: '/admin/employees',    icon: FiUsers,       color: 'from-blue-600 to-indigo-700',   requiredPermission: 'employees:read' },
      { id: 'reports',     label: 'Daily Reports',      desc: 'EOD deliverables & tracking',    href: '/admin/reports',      icon: FiCheckSquare, color: 'from-blue-500 to-blue-700',     requiredPermission: 'reports:read_own' },
      { id: 'standup',     label: '5 PM Stand-up',      desc: 'Newsroom video syncs',           href: '/admin/standup',      icon: FiCalendar,    color: 'from-purple-600 to-violet-700', requiredPermission: 'standup:attend' },
      { id: 'handbook',    label: 'Handbook & SOPs',    desc: 'Journalism curriculum guide',    href: '/admin/handbook',     icon: FiBookOpen,    color: 'from-amber-500 to-yellow-600',  requiredPermission: 'handbook:read' },
      { id: 'evaluations', label: 'Evaluations',        desc: '30-day trainee assessments',     href: '/admin/evaluations',  icon: FiAward,       color: 'from-amber-600 to-orange-700',  requiredPermission: 'evaluations:read', badge: 'KPIs' },
      { id: 'payroll',     label: 'Payroll',            desc: 'Stipends & salary slips',        href: '/admin/payroll',      icon: FiDollarSign,  color: 'from-emerald-600 to-green-700', requiredPermission: 'payroll:read' },
    ],
  },
  {
    id: 'admin_ops',
    title: 'Administration',
    icon: FiSettings,
    color: 'slate',
    actions: [
      { id: 'users',    label: 'User Management',    desc: 'Accounts & role assignment',  href: '/admin/users',    icon: FiUserCheck, color: 'from-slate-600 to-slate-700',   requiredPermission: 'users:manage' },
      { id: 'system',   label: 'System',             desc: 'Config & diagnostics',        href: '/admin/system',   icon: FiSettings,  color: 'from-slate-500 to-slate-700',   requiredPermission: 'system:settings' },
      { id: 'deletion', label: 'Trash & Deletions',  desc: 'Deleted content recovery',    href: '/admin/deletion', icon: FiTrash2,    color: 'from-red-700 to-rose-800',      requiredPermission: 'articles:delete' },
    ],
  },
];

// Color themes per group
const GROUP_THEME: Record<string, { header: string; dot: string; groupBg: string }> = {
  blue:    { header: 'text-blue-400',    dot: 'bg-blue-500',    groupBg: 'bg-blue-500/10 border-blue-500/20' },
  amber:   { header: 'text-amber-400',   dot: 'bg-amber-500',   groupBg: 'bg-amber-500/10 border-amber-500/20' },
  purple:  { header: 'text-purple-400',  dot: 'bg-purple-500',  groupBg: 'bg-purple-500/10 border-purple-500/20' },
  emerald: { header: 'text-emerald-400', dot: 'bg-emerald-500', groupBg: 'bg-emerald-500/10 border-emerald-500/20' },
  slate:   { header: 'text-slate-400',   dot: 'bg-slate-500',   groupBg: 'bg-slate-500/10 border-slate-500/20' },
};

// ---------------------------------------------------------------------------
// Stat Card — top summary strip for super-admin/manager
// ---------------------------------------------------------------------------
interface StatCardProps {
  label: string;
  value: string | number;
  sub: string;
  icon: any;
  color: string;
}

function StatCard({ label, value, sub, icon: Icon, color }: StatCardProps) {
  return (
    <div className="glass-card p-4 sm:p-5 rounded-2xl border border-white/10 flex items-center gap-3 sm:gap-4">
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl ${color} flex items-center justify-center flex-shrink-0`}>
        <Icon size={20} className="text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] sm:text-xs text-slate-500 uppercase font-bold tracking-wider truncate">{label}</p>
        <p className="text-xl sm:text-2xl font-black text-white mt-0.5">{value}</p>
        <p className="text-[11px] text-slate-500 mt-0.5 truncate">{sub}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pending Reports Widget (super-admin/manager only)
// ---------------------------------------------------------------------------
function PendingReportsWidget() {
  const [reports, setReports] = useState<DailyContentReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reports/daily?status=pending')
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setReports(json.data?.slice(0, 5) || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="glass-card p-6 rounded-2xl border border-white/10 flex items-center justify-center h-32">
        <GoalmillsLoader size="sm" label="Loading reports..." sublabel="" />
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-white/[0.07]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <FiCheckSquare size={14} className="text-amber-400" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white">Pending Daily Reports</h2>
            <p className="text-[11px] text-slate-500">Awaiting your editorial review</p>
          </div>
        </div>
        <Link
          href="/admin/reports"
          className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
        >
          View All <FiChevronRight size={13} />
        </Link>
      </div>

      {/* List */}
      {reports.length === 0 ? (
        <div className="px-5 py-8 text-center">
          <FiCheckCircle size={28} className="mx-auto text-emerald-500/40 mb-2" />
          <p className="text-sm font-bold text-slate-500">All caught up! No pending reports.</p>
        </div>
      ) : (
        <div className="divide-y divide-white/[0.05]">
          {reports.map((rep) => (
            <div
              key={rep._id}
              className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 font-black text-xs flex-shrink-0">
                  {rep.employeeName?.slice(0, 2) || '??'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{rep.employeeName}</p>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    <FiClock size={10} /> {rep.reportDate}
                  </p>
                </div>
              </div>
              <Link
                href="/admin/reports"
                className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 font-bold text-[11px] border border-blue-500/20 transition-all"
              >
                Review
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Action Group Section
// ---------------------------------------------------------------------------
function ActionGroupSection({ group, userRole }: { group: ActionGroup; userRole?: UserRole }) {
  const visibleActions = group.actions.filter(
    (a) => hasPermission(userRole, a.requiredPermission)
  );
  if (visibleActions.length === 0) return null;

  const theme = GROUP_THEME[group.color] || GROUP_THEME.slate;
  const GroupIcon = group.icon;

  return (
    <section>
      {/* Group Header */}
      <div className="flex items-center gap-2.5 mb-3">
        <div className={`w-2 h-2 rounded-full ${theme.dot}`} />
        <GroupIcon size={15} className={theme.header} />
        <h2 className={`text-[13px] font-black uppercase tracking-wider ${theme.header}`}>
          {group.title}
        </h2>
        <span className="text-[10px] text-slate-600 font-bold">
          {visibleActions.length} modules
        </span>
      </div>

      {/* Action Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
        {visibleActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.id}
              href={action.href}
              className="group relative flex flex-col gap-2.5 p-3.5 sm:p-4 rounded-2xl bg-slate-900/60 border border-white/[0.07] hover:border-white/20 hover:bg-slate-800/60 transition-all duration-200 active:scale-[0.97] overflow-hidden"
            >
              {/* Gradient icon bg */}
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg flex-shrink-0`}>
                <Icon size={17} className="text-white" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[13px] sm:text-sm font-bold text-white leading-tight">{action.label}</span>
                  {action.badge && (
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 uppercase">
                      {action.badge}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-tight line-clamp-2">{action.desc}</p>
              </div>

              {/* Hover arrow */}
              <FiChevronRight
                size={13}
                className="absolute top-3 right-3 text-slate-700 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all"
              />

              {/* Subtle hover glow */}
              <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-[0.04] transition-opacity rounded-2xl pointer-events-none`} />
            </Link>
          );
        })}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Staff Self-Service Panel (staff/contributor only)
// ---------------------------------------------------------------------------
function StaffWorkspacePanel({ userRole }: { userRole?: UserRole }) {
  const items = [
    { label: 'Submit Daily Report',  href: '/admin/portal',   icon: FiCheckSquare, color: 'bg-blue-500/20 text-blue-400 border-blue-500/20',    permission: 'reports:submit' as const },
    { label: 'Join 5 PM Stand-up',   href: '/admin/standup',  icon: FiCalendar,    color: 'bg-purple-500/20 text-purple-400 border-purple-500/20', permission: 'standup:attend' as const },
    { label: 'Read Handbook & SOPs', href: '/admin/handbook', icon: FiBookOpen,    color: 'bg-amber-500/20 text-amber-400 border-amber-500/20',  permission: 'handbook:read' as const },
    { label: 'Staff Portal Hub',     href: '/admin/portal',   icon: FiLayout,      color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20', permission: 'articles:read' as const },
  ].filter((i) => hasPermission(userRole, i.permission));

  return (
    <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
      <div className="px-4 sm:px-5 py-4 border-b border-white/[0.07]">
        <h2 className="text-sm font-black text-white flex items-center gap-2">
          <FiLayout size={15} className="text-emerald-400" />
          Your Workspace
        </h2>
        <p className="text-[11px] text-slate-500 mt-0.5">Quick access to your daily tools</p>
      </div>
      <div className="p-3 grid grid-cols-2 gap-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href + item.label}
              href={item.href}
              className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-bold transition-all active:scale-[0.97] ${item.color}`}
            >
              <Icon size={16} />
              <span className="leading-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Dashboard Page
// ---------------------------------------------------------------------------
export default function AdminDashboard() {
  const { data: session } = useSession();
  const userRole = (session?.user?.role as UserRole) || undefined;

  const [stats, setStats] = useState({ employees: 0, pendingReports: 0, publishedToday: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  const isAdminOrManager = hasPermission(userRole, 'employees:read');
  const canSeeReports = hasPermission(userRole, 'reports:read_all');
  const isStaffOnly = !hasPermission(userRole, 'articles:draft') && hasPermission(userRole, 'articles:read');

  // Filter accessible groups
  const visibleGroups = useMemo(() =>
    ACTION_GROUPS.map((group) => ({
      ...group,
      actions: group.actions.filter((a) => hasPermission(userRole, a.requiredPermission)),
    })).filter((g) => g.actions.length > 0),
    [userRole]
  );

  // Fetch top-level stats for admin/manager
  useEffect(() => {
    if (!isAdminOrManager) { setStatsLoading(false); return; }
    Promise.all([
      fetch('/api/admin/employees').then((r) => r.json()).catch(() => ({ data: [] })),
      fetch('/api/reports/daily?status=pending').then((r) => r.json()).catch(() => ({ data: [] })),
    ]).then(([empJson, repJson]) => {
      setStats({
        employees: empJson.data?.length || 0,
        pendingReports: repJson.data?.length || 0,
        publishedToday: 0,
      });
    }).finally(() => setStatsLoading(false));
  }, [isAdminOrManager]);

  return (
    <div className="space-y-5 sm:space-y-6 text-white">

      {/* ── Welcome Banner ────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            Welcome back, {session?.user?.name?.split(' ')[0] || 'Admin'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            GoalMills Admin Hub — {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/news/new"
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg ${
              hasPermission(userRole, 'articles:draft')
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/20 hover:shadow-blue-500/30'
                : 'hidden'
            }`}
          >
            <FiPlusCircle size={14} />
            <span>New Article</span>
          </Link>
          {hasPermission(userRole, 'reports:submit') && (
            <Link
              href="/admin/portal"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20"
            >
              <FiCheckSquare size={14} />
              <span>Submit Report</span>
            </Link>
          )}
        </div>
      </div>

      {/* ── Stats Strip (admin/manager only) ─────────── */}
      {isAdminOrManager && !statsLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
          <StatCard label="Total Staff"       value={stats.employees}      sub="Active roster"              icon={FiUsers}       color="bg-blue-500/20" />
          <StatCard label="Pending Reports"   value={stats.pendingReports} sub="Awaiting editorial review"  icon={FiCheckSquare} color={stats.pendingReports > 0 ? 'bg-amber-500/20' : 'bg-emerald-500/20'} />
          <StatCard label="Published Today"   value={stats.publishedToday} sub="Articles live"              icon={FiFileText}    color="bg-purple-500/20" />
          <StatCard label="Platform Status"   value="Live"                 sub="All systems operational"    icon={FiActivity}    color="bg-emerald-500/20" />
        </div>
      )}

      {/* ── Main Grid ────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5 sm:gap-6">

        {/* Left column — grouped action cards */}
        <div className="space-y-6 sm:space-y-8">
          {isStaffOnly && (
            /* Staff/Contributor who can't access CMS — show their workspace prominently */
            <div className="sm:hidden">
              <StaffWorkspacePanel userRole={userRole} />
            </div>
          )}

          {visibleGroups.map((group) => (
            <ActionGroupSection key={group.id} group={group} userRole={userRole} />
          ))}
        </div>

        {/* Right sidebar — only visible on xl, role-aware widgets */}
        <div className="space-y-4">
          {/* Staff workspace for editors+ on side */}
          {!isStaffOnly && (
            <StaffWorkspacePanel userRole={userRole} />
          )}

          {/* Pending reports widget for admin/manager */}
          {canSeeReports && (
            <PendingReportsWidget />
          )}

          {/* Staff access their own recent reports widget */}
          {!canSeeReports && hasPermission(userRole, 'reports:read_own') && (
            <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/[0.07]">
                <div className="flex items-center gap-2">
                  <FiCheckSquare size={14} className="text-blue-400" />
                  <span className="text-sm font-black text-white">My Reports</span>
                </div>
                <Link href="/admin/reports" className="text-[11px] font-bold text-blue-400 flex items-center gap-1">
                  View All <FiChevronRight size={12} />
                </Link>
              </div>
              <div className="px-4 py-6 text-center">
                <FiCheckSquare size={28} className="mx-auto text-blue-400/30 mb-2" />
                <p className="text-xs font-bold text-slate-500">Go to Daily Reports to view & submit</p>
                <Link href="/admin/reports" className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold">
                  Open Reports
                </Link>
              </div>
            </div>
          )}

          {/* Quick navigation links */}
          <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
            <div className="px-4 py-3.5 border-b border-white/[0.07]">
              <span className="text-sm font-black text-white flex items-center gap-2">
                <FiExternalLink size={14} className="text-slate-400" />
                Quick Links
              </span>
            </div>
            <div className="p-3 space-y-1">
              {[
                { label: 'Live Site', href: '/', external: true },
                { label: 'API Documentation', href: '/api/openapi.json', external: true },
                { label: 'Profile & Password', href: '/profile', external: false },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  target={link.external ? '_blank' : undefined}
                  rel={link.external ? 'noreferrer' : undefined}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white text-xs font-semibold transition-colors"
                >
                  <span>{link.label}</span>
                  <FiExternalLink size={11} className="text-slate-600" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
