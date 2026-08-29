'use client';

import React, { useState, useEffect } from 'react';
import AdminShell from '../AdminShell';
import Link from 'next/link';
import {
  FiSend,
  FiClock,
  FiCheckCircle,
  FiFileText,
  FiMail,
  FiRadio,
  FiTrendingUp,
  FiRefreshCw,
  FiArrowRight,
} from 'react-icons/fi';
import { GoalmillsLoader } from '@/components/GoalmillsLoader';

export default function PublishingDashboardPage() {
  const [drafts, setDrafts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDrafts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/news?status=draft');
      const data = await res.json();
      if (data.success) {
        setDrafts(data.news || []);
      }
    } catch (err) {
      console.error('Error fetching drafts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, []);

  return (
    <AdminShell>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
              <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <FiSend className="w-6 h-6" />
              </span>
              Publishing & Editorial Pipeline
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Review draft articles, coordinate breaking news broadcasts, and dispatch audience newsletter campaigns.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchDrafts}
              className="p-2.5 rounded-xl border border-white/10 bg-slate-900 text-slate-300 hover:text-white transition"
              title="Refresh Pipeline"
            >
              <FiRefreshCw className="w-4 h-4" />
            </button>
            <Link
              href="/admin/news/new"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 font-bold text-white shadow-lg text-sm"
            >
              <FiFileText className="w-4 h-4" />
              <span>Draft New Article</span>
            </Link>
          </div>
        </div>

        {/* Action Hub Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 rounded-2xl bg-[#141C2B] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
                <FiFileText className="w-5 h-5" />
              </span>
              <span className="text-xs font-bold text-slate-400 uppercase">Editorial Drafts</span>
            </div>
            <div>
              <div className="text-3xl font-black text-white">{drafts.length}</div>
              <p className="text-xs text-slate-400 mt-1">Pending review & approval queue</p>
            </div>
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-400 hover:underline"
            >
              <span>Manage Drafts</span>
              <FiArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-6 rounded-2xl bg-[#141C2B] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                <FiMail className="w-5 h-5" />
              </span>
              <span className="text-xs font-bold text-slate-400 uppercase">Newsletter Engine</span>
            </div>
            <div>
              <div className="text-3xl font-black text-white">Campaigns</div>
              <p className="text-xs text-slate-400 mt-1">Dispatch daily/weekly digests via Go Mailer</p>
            </div>
            <Link
              href="/admin/newsletter"
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:underline"
            >
              <span>Open Newsletter Hub</span>
              <FiArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-6 rounded-2xl bg-[#141C2B] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
                <FiRadio className="w-5 h-5" />
              </span>
              <span className="text-xs font-bold text-slate-400 uppercase">Push Alerts</span>
            </div>
            <div>
              <div className="text-3xl font-black text-white">Realtime Broadcast</div>
              <p className="text-xs text-slate-400 mt-1">Web Push & Mobile FCM instant alerts</p>
            </div>
            <Link
              href="/admin/notifications"
              className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 hover:underline"
            >
              <span>Send Push Notification</span>
              <FiArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Drafts Waiting for Approval */}
        <div className="space-y-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FiClock className="text-amber-400" />
            <span>Unpublished Drafts & Submissions</span>
          </h3>

          {loading ? (
            <div className="py-12 flex justify-center">
              <GoalmillsLoader size="md" label="Loading Drafts" />
            </div>
          ) : drafts.length === 0 ? (
            <div className="p-8 rounded-2xl border border-white/10 bg-[#141C2B] text-center">
              <FiCheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-white">All caught up!</p>
              <p className="text-xs text-slate-400 mt-0.5">There are no unpublished drafts in the queue.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {drafts.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between p-4 rounded-xl bg-[#141C2B] border border-white/10 hover:border-white/20 transition"
                >
                  <div>
                    <h4 className="font-bold text-white text-sm">{item.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      By {item.author || 'Staff'} • {item.category || 'General'} •{' '}
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Link
                    href={`/admin/news/edit/${item._id}`}
                    className="px-3.5 py-1.5 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 text-xs font-bold transition"
                  >
                    Review & Publish
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
