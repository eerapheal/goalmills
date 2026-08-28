'use client';

import { useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import CreateNewsForm from '@/components/admin/CreateNewsForm';
import UploadVideoForm from '@/components/admin/UploadVideoForm';
import NewsList from '@/components/admin/NewsList';
import VideoList from '@/components/admin/VideoList';
import Link from 'next/link';
import AdminNavBar from '@/components/admin/AdminNavBar';
import {
  FiFileText,
  FiVideo,
  FiList,
  FiUsers,
  FiAward,
  FiDollarSign,
  FiCalendar,
  FiCheckSquare,
  FiUserCheck,
  FiChevronDown,
  FiBookOpen,
} from 'react-icons/fi';
import type { UserRole } from '@goalmills/types';
import type { PermissionAction } from '@/lib/rbac';
import { hasPermission } from '@/lib/rbac';

interface QuickLinkCard {
  href: string;
  label: string;
  sublabel: string;
  icon: typeof FiBookOpen;
  colorClass: string;
  requiredPermission: PermissionAction;
}

const EMS_QUICK_LINKS: QuickLinkCard[] = [
  {
    href: '/admin/handbook',
    label: 'Handbook & SOPs',
    sublabel: 'Curriculum & Guide',
    icon: FiBookOpen,
    colorClass: 'amber',
    requiredPermission: 'handbook:read',
  },
  {
    href: '/admin/employees',
    label: 'Staff & Trainees',
    sublabel: 'Directory & Contracts',
    icon: FiUsers,
    colorClass: 'amber',
    requiredPermission: 'employees:read',
  },
  {
    href: '/admin/reports',
    label: 'Daily Reports',
    sublabel: 'Review & Grading',
    icon: FiCheckSquare,
    colorClass: 'blue',
    requiredPermission: 'reports:read_own',
  },
  {
    href: '/admin/standup',
    label: '5:00 PM Stand-up',
    sublabel: 'Meet & Roll-Call',
    icon: FiCalendar,
    colorClass: 'emerald',
    requiredPermission: 'standup:attend',
  },
  {
    href: '/admin/evaluations',
    label: 'Scorecards',
    sublabel: '100% Metric Matrix',
    icon: FiAward,
    colorClass: 'purple',
    requiredPermission: 'evaluations:read',
  },
  {
    href: '/admin/payroll',
    label: 'Payroll Ledger',
    sublabel: '₦30k / ₦50k Stipends',
    icon: FiDollarSign,
    colorClass: 'emerald',
    requiredPermission: 'payroll:read',
  },
  {
    href: '/admin/portal',
    label: 'Staff Portal',
    sublabel: 'Candidate Self-Service',
    icon: FiUserCheck,
    colorClass: 'cyan',
    requiredPermission: 'articles:read',
  },
];

type CreationTab = 'news' | 'video' | 'manage';
type ManageSubTab = 'news' | 'video';

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<CreationTab>('news');
  const [manageSubTab, setManageSubTab] = useState<ManageSubTab>('news');
  const [videoRefreshTrigger, setVideoRefreshTrigger] = useState(0);

  const userRole = (session?.user?.role as UserRole) || undefined;
  const visibleQuickLinks = useMemo(
    () => EMS_QUICK_LINKS.filter((card) => hasPermission(userRole, card.requiredPermission)),
    [userRole]
  );

  return (
    <div className="min-h-screen bg-background p-3.5 sm:p-6 pt-[80px] sm:pt-[95px]">
      <div className="max-w-7xl mx-auto space-y-5 sm:space-y-6">
        {/* Navigation Bar with Mobile Dropdown & Desktop Pills */}
        <AdminNavBar />

        {/* EMS Quick Launch Hub — filtered by user role */}
        {visibleQuickLinks.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <span>⚡</span> Employee Management & Training Operations
              </h2>
              {hasPermission(userRole, 'handbook:read') && (
                <Link
                  href="/admin/handbook"
                  className="text-[11px] sm:text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
                >
                  Open Handbook &rarr;
                </Link>
              )}
            </div>

            <div
              className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-${Math.min(visibleQuickLinks.length, 7)} gap-2.5 sm:gap-3`}
            >
              {visibleQuickLinks.map((card) => {
                const Icon = card.icon;
                return (
                  <Link
                    key={card.href}
                    href={card.href}
                    className={`glass-card p-3.5 sm:p-4 rounded-2xl border border-white/10 hover:border-${card.colorClass}-500/40 hover:bg-${card.colorClass}-500/5 transition-all group shadow-md`}
                  >
                    <div
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-${card.colorClass}-500/10 border border-${card.colorClass}-500/20 flex items-center justify-center text-${card.colorClass}-400 mb-2 group-hover:scale-110 transition-transform`}
                    >
                      <Icon size={18} />
                    </div>
                    <p
                      className={`text-xs font-bold text-white group-hover:text-${card.colorClass}-400 transition-colors truncate`}
                    >
                      {card.label}
                    </p>
                    <p className="text-[10px] text-text-muted mt-0.5 truncate">{card.sublabel}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* Mobile-First Segmented / Dropdown Content Creation Selector */}
        {/* ------------------------------------------------------------- */}
        <div className="space-y-4">
          {/* Mobile Dropdown Control */}
          <div className="block sm:hidden">
            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
              Publishing Workspace
            </label>
            <div className="relative">
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value as CreationTab)}
                className="w-full appearance-none px-4 py-3 rounded-2xl bg-slate-900 border border-white/15 text-white font-bold text-sm focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="news">📰 Create News Article</option>
                <option value="video">🎥 Upload Video Highlight</option>
                <option value="manage">📋 Manage Published Content</option>
              </select>
              <FiChevronDown
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                size={18}
              />
            </div>
          </div>

          {/* Desktop Tab Buttons */}
          <div className="hidden sm:flex items-center justify-between overflow-x-auto no-scrollbar pb-1 border-b border-white/10">
            <div className="flex items-center gap-2 p-1 bg-slate-900/80 rounded-2xl border border-white/10 backdrop-blur-md">
              <button
                type="button"
                onClick={() => setActiveTab('news')}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 ${
                  activeTab === 'news'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 scale-[1.02]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <FiFileText size={16} />
                <span>Create News Article</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('video')}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 ${
                  activeTab === 'video'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/25 scale-[1.02]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <FiVideo size={16} />
                <span>Upload Video Highlight</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('manage')}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 ${
                  activeTab === 'manage'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25 scale-[1.02]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <FiList size={16} />
                <span>Manage Content</span>
              </button>
            </div>
          </div>

          {/* Tab Contents */}
          <div className="transition-all duration-300">
            {activeTab === 'news' && (
              <div className="animate-fade-in space-y-6">
                <CreateNewsForm />
                <div className="pt-4 border-t border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                      <FiFileText className="text-blue-400" /> Recent Published Stories
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('manage');
                        setManageSubTab('news');
                      }}
                      className="text-xs font-bold text-blue-400 hover:text-blue-300 underline"
                    >
                      Manage &rarr;
                    </button>
                  </div>
                  <NewsList />
                </div>
              </div>
            )}

            {activeTab === 'video' && (
              <div className="animate-fade-in max-w-5xl mx-auto space-y-6">
                <UploadVideoForm onSuccess={() => setVideoRefreshTrigger((c) => c + 1)} />
                <div className="pt-4 border-t border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                      <FiVideo className="text-amber-400" /> Recent Published Video Highlights
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('manage');
                        setManageSubTab('video');
                      }}
                      className="text-xs font-bold text-amber-400 hover:text-amber-300 underline"
                    >
                      Manage &rarr;
                    </button>
                  </div>
                  <VideoList refreshTrigger={videoRefreshTrigger} />
                </div>
              </div>
            )}

            {activeTab === 'manage' && (
              <div className="animate-fade-in space-y-5">
                {/* Responsive Sub-tabs */}
                <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                  <button
                    type="button"
                    onClick={() => setManageSubTab('news')}
                    className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                      manageSubTab === 'news'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <FiFileText size={14} />
                    <span>News Articles</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setManageSubTab('video')}
                    className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                      manageSubTab === 'video'
                        ? 'bg-amber-500 text-black shadow-md'
                        : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <FiVideo size={14} />
                    <span>Video Highlights</span>
                  </button>
                </div>

                {manageSubTab === 'news' ? (
                  <NewsList />
                ) : (
                  <VideoList refreshTrigger={videoRefreshTrigger} />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
