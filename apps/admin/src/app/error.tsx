'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { FiRefreshCw, FiHome, FiAlertCircle } from 'react-icons/fi';

export default function AdminErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('GoalMills Admin Error:', error?.message);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6 bg-[#141C2B] p-8 rounded-3xl border border-white/10 shadow-2xl">
        <div className="inline-flex p-4 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <FiAlertCircle className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-white">Admin Operations Error</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            An error occurred while executing the management action. Review server logs or retry.
          </p>
        </div>

        <div className="pt-2 flex items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg transition"
          >
            <FiRefreshCw className="w-4 h-4" />
            <span>Retry Action</span>
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition"
          >
            <FiHome className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
