'use client';

import CreateNewsForm from '@/components/admin/CreateNewsForm';
import Link from 'next/link';
import { FiArrowLeft, FiCompass } from 'react-icons/fi';

export default function CreateArticlePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 glass-card p-5 rounded-2xl border border-white/10">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
            <span>✍️</span> Compose New Article
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Publish sports coverage, transfer news, tactical breakdowns, and player features with 4-level ecosystem mapping.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/ecosystem"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-bold border border-blue-500/20 text-xs transition-colors"
          >
            <FiCompass /> Ecosystem Tags
          </Link>
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-bold text-xs border border-white/10 transition-colors"
          >
            <FiArrowLeft /> Dashboard
          </Link>
        </div>
      </div>

      <CreateNewsForm />
    </div>
  );
}
