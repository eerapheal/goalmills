'use client';

import EcosystemManager from '@/components/admin/EcosystemManager';
import Link from 'next/link';
import { FiArrowLeft, FiCompass, FiFileText } from 'react-icons/fi';

export default function AdminEcosystemPage() {
  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 pt-[90px]">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center glass-card p-6 rounded-3xl border border-white/10 gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-widest mb-1">
              <FiCompass /> Publisher Distribution Network
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight flex items-center gap-2.5">
              <span>⚡</span> Content Ecosystem & Tags
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
              Create, edit, and manage custom Sports, Competitions, Clubs, Players, and Categories.
              Custom entities automatically populate all publishing selectors and auto-distribution hubs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-colors text-xs border border-white/10"
            >
              <FiFileText /> News Engine
            </Link>
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-colors text-xs border border-white/10"
            >
              <FiArrowLeft /> Dashboard
            </Link>
          </div>
        </div>

        {/* Ecosystem Manager Tabbed Engine */}
        <EcosystemManager />
      </div>
    </div>
  );
}
