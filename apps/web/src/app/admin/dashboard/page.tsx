'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import CreateNewsForm from '@/components/admin/CreateNewsForm';
import UploadVideoForm from '@/components/admin/UploadVideoForm';
import NewsList from '@/components/admin/NewsList';
import VideoList from '@/components/admin/VideoList';
import Link from 'next/link';
import {
  FiLogOut,
  FiFileText,
  FiVideo,
  FiList,
  FiLayers,
  FiUsers,
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
        {/* Header Profile & Quick Links */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center glass-card p-5 sm:p-6 rounded-3xl gap-4 border border-white/10 shadow-2xl">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight flex items-center gap-2">
              <span>⚡</span> Admin Command Center
            </h1>
            <p className="text-xs sm:text-sm text-text-muted mt-0.5">
              Welcome back, <span className="text-secondary font-bold">{session?.user?.name}</span> ({session?.user?.role})
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {session?.user?.role === 'super-admin' && (
              <Link
                href="/admin/users"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-bold border border-blue-500/20 transition-all text-xs sm:text-sm"
              >
                <FiUsers size={14} />
                <span>Users</span>
              </Link>
            )}
            <Link
              href="/admin/categories"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 font-bold border border-purple-500/20 transition-all text-xs sm:text-sm"
            >
              <FiLayers size={14} />
              <span>Categories</span>
            </Link>
            <Link
              href="/"
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all text-xs sm:text-sm"
            >
              View Site
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/signin' })}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold border border-red-500/20 transition-all text-xs sm:text-sm"
            >
              <FiLogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
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

