import React from 'react';
import Link from 'next/link';
import { FiHome, FiAlertTriangle } from 'react-icons/fi';

export default function AdminNotFound() {
  return (
    <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6 bg-[#141C2B] p-8 rounded-3xl border border-white/10 shadow-2xl">
        <div className="inline-flex p-4 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <FiAlertTriangle className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-white">404 - Admin Resource Not Found</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            The requested operations dashboard, campaign, or user profile was not found or has been purged.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg transition"
          >
            <FiHome className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
