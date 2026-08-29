import React from 'react';
import Link from 'next/link';
import { FiHome, FiArrowLeft, FiAlertTriangle } from 'react-icons/fi';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6 bg-[#141C2B] p-8 rounded-3xl border border-white/10 shadow-2xl">
        <div className="inline-flex p-4 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <FiAlertTriangle className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black text-white tracking-tight">404 - Page Not Found</h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            The sports intelligence feed, article, or match page you are looking for has been moved, expired, or does not exist.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 hover:opacity-95 transition"
          >
            <FiHome className="w-4 h-4" />
            <span>Return to Live Scores</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
