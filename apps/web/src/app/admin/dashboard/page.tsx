'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import CreateNewsForm from '@/components/admin/CreateNewsForm';
import UploadVideoForm from '@/components/admin/UploadVideoForm';
import NewsList from '@/components/admin/NewsList';
import VideoList from '@/components/admin/VideoList';
import Link from 'next/link';
import AdminNavBar from '@/components/admin/AdminNavBar';
import {
  FiLogOut,
  FiFileText,
  FiVideo,
  FiList,
  FiLayers,
  FiUsers,
  FiAward,
  FiDollarSign,
  FiCalendar,
  FiCheckSquare,
  FiUserCheck,
} from 'react-icons/fi';

type CreationTab = 'news' | 'video' | 'manage';
type ManageSubTab = 'news' | 'video';

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<CreationTab>('news');
  const [manageSubTab, setManageSubTab] = useState<ManageSubTab>('news');
  const [videoRefreshTrigger, setVideoRefreshTrigger] = useState(0);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 pt-[85px] sm:pt-[95px]">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Navigation Bar with Employee Management Links */}
        <AdminNavBar />

        {/* EMS Quick Launch Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link
            href="/admin/employees"
            className="glass-card p-4 rounded-2xl border border-white/10 hover:border-amber-500/40 hover:bg-amber-500/5 transition-all group shadow-lg"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-2.5 group-hover:scale-110 transition-transform">
              <FiUsers size={20} />
            </div>
            <p className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
              Staff & Trainees
            </p>
            <p className="text-[10px] text-text-muted mt-0.5">Directory & Contracts</p>
          </Link>

          <Link
            href="/admin/reports"
            className="glass-card p-4 rounded-2xl border border-white/10 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all group shadow-lg"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-2.5 group-hover:scale-110 transition-transform">
              <FiCheckSquare size={20} />
            </div>
            <p className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
              Daily Reports
            </p>
            <p className="text-[10px] text-text-muted mt-0.5">Submissions & Review</p>
          </Link>

          <Link
            href="/admin/standup"
            className="glass-card p-4 rounded-2xl border border-white/10 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all group shadow-lg"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2.5 group-hover:scale-110 transition-transform">
              <FiCalendar size={20} />
            </div>
            <p className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
              5:00 PM Stand-up
            </p>
            <p className="text-[10px] text-text-muted mt-0.5">Meet & Roll Call</p>
          </Link>

          <Link
            href="/admin/evaluations"
            className="glass-card p-4 rounded-2xl border border-white/10 hover:border-purple-500/40 hover:bg-purple-500/5 transition-all group shadow-lg"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-2.5 group-hover:scale-110 transition-transform">
              <FiAward size={20} />
            </div>
            <p className="text-xs font-bold text-white group-hover:text-purple-400 transition-colors">
              Scorecards
            </p>
            <p className="text-[10px] text-text-muted mt-0.5">100% Weighted Metric</p>
          </Link>

          <Link
            href="/admin/payroll"
            className="glass-card p-4 rounded-2xl border border-white/10 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all group shadow-lg"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2.5 group-hover:scale-110 transition-transform">
              <FiDollarSign size={20} />
            </div>
            <p className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
              Payroll & Allowances
            </p>
            <p className="text-[10px] text-text-muted mt-0.5">₦30k / ₦50k Ledger</p>
          </Link>

          <Link
            href="/admin/portal"
            className="glass-card p-4 rounded-2xl border border-white/10 hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-all group shadow-lg"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-2.5 group-hover:scale-110 transition-transform">
              <FiUserCheck size={20} />
            </div>
            <p className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">
              Staff Portal
            </p>
            <p className="text-[10px] text-text-muted mt-0.5">Trainee Self-Service</p>
          </Link>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* Responsive Creation Tabs: News Article vs Video Highlight vs Posts */}
        {/* ------------------------------------------------------------- */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between overflow-x-auto no-scrollbar pb-1 border-b border-white/10">
            <div className="flex items-center gap-2 p-1 bg-slate-900/80 rounded-2xl border border-white/10 backdrop-blur-md">
              <button
                type="button"
                onClick={() => setActiveTab('news')}
                className={`inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 ${
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
                className={`inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 ${
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
                className={`inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 ${
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
              <div className="animate-fade-in space-y-8">
                <CreateNewsForm />
                <div className="pt-4 border-t border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
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
                      View All Stories & Manage &rarr;
                    </button>
                  </div>
                  <NewsList />
                </div>
              </div>
            )}

            {activeTab === 'video' && (
              <div className="animate-fade-in max-w-5xl mx-auto space-y-8">
                <UploadVideoForm onSuccess={() => setVideoRefreshTrigger((c) => c + 1)} />
                <div className="pt-4 border-t border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
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
                      View All Videos &rarr;
                    </button>
                  </div>
                  <VideoList refreshTrigger={videoRefreshTrigger} />
                </div>
              </div>
            )}

            {activeTab === 'manage' && (
              <div className="animate-fade-in space-y-6">
                {/* Subtabs for Management */}
                <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                  <button
                    type="button"
                    onClick={() => setManageSubTab('news')}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
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
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
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
