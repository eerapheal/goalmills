'use client';

import CategoryManager from '@/components/admin/CategoryManager';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';

export default function AdminCategoriesPage() {
  return (
    <div className="min-h-screen bg-background p-6 pt-[90px]">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-center glass-card p-6 rounded-2xl gap-4">
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
              Post Categories
            </h1>
            <p className="text-text-muted">
              Configure topics, tags and filter badges across GoalMills
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/ecosystem"
              className="flex items-center px-4 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 font-bold transition-colors text-sm border border-blue-500/30"
            >
              Full Ecosystem Hub
            </Link>
            <Link
              href="/admin/news"
              className="flex items-center px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-colors text-sm"
            >
              Manage Posts
            </Link>
            <Link
              href="/admin/dashboard"
              className="flex items-center px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-colors"
            >
              <FiArrowLeft className="mr-2" />
              <span>Dashboard</span>
            </Link>
          </div>
        </div>

        <CategoryManager />
      </div>
    </div>
  );
}
