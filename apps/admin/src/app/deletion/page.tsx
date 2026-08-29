'use client';

import React, { useState, useEffect } from 'react';
import {
  FiTrash2,
  FiRotateCcw,
  FiAlertTriangle,
  FiFilter,
  FiRefreshCw,
  FiCheckCircle,
  FiShield,
} from 'react-icons/fi';
import { GoalmillsLoader } from '@/components/GoalmillsLoader';

export default function ContentDeletionPage() {
  const [deletedItems, setDeletedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const fetchDeletedItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/content-deletion?type=${filterType}`);
      const data = await res.json();
      if (data.success) {
        setDeletedItems(data.items || []);
      }
    } catch (err) {
      console.error('Error loading deleted items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedItems();
  }, [filterType]);

  const handleRestore = async (id: string, type: string) => {
    setActionInProgress(id);
    try {
      const res = await fetch('/api/admin/content-deletion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'restore', id, type }),
      });
      const data = await res.json();
      if (data.success) {
        fetchDeletedItems();
      } else {
        alert(data.error || 'Failed to restore item');
      }
    } catch (err) {
      console.error('Error restoring item:', err);
    } finally {
      setActionInProgress(null);
    }
  };

  const handlePurge = async (id: string, type: string, title: string) => {
    if (
      !confirm(
        `PERMANENT PURGE WARNING:\nAre you sure you want to permanently delete "${title}"?\nThis action cannot be undone and will be logged in the admin audit trail.`
      )
    ) {
      return;
    }

    setActionInProgress(id);
    try {
      const res = await fetch('/api/admin/content-deletion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'purge', id, type }),
      });
      const data = await res.json();
      if (data.success) {
        fetchDeletedItems();
      } else {
        alert(data.error || 'Failed to permanently delete item');
      }
    } catch (err) {
      console.error('Error purging item:', err);
    } finally {
      setActionInProgress(null);
    }
  };

  return (
    <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
              <span className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <FiTrash2 className="w-6 h-6" />
              </span>
              Content Deletion & Trash Bin
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Audit-protected soft-deletion system. Recover accidentally removed articles, media, and campaigns or permanently purge.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchDeletedItems}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 transition text-sm font-semibold"
            >
              <FiRefreshCw className="w-4 h-4" />
              <span>Refresh Trash</span>
            </button>
          </div>
        </div>

        {/* Security Alert Banner */}
        <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-900/90 border border-rose-500/30 shadow-lg">
          <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 mt-0.5">
            <FiShield className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Cryptographic & Audited Deletion Policy</h4>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
              GoalMills enforces two-stage deletion. Items placed in the Trash Bin retain metadata and can be safely restored to drafts by Editors. Permanent purging requires Manager/Super-Admin authorization and is permanently logged in the audit trail.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-900/60 border border-white/5">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <FiFilter className="w-3.5 h-3.5" /> Content Type:
          </span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[#141C2B] border border-white/10 text-xs text-white focus:outline-none"
          >
            <option value="all">All Deleted Content</option>
            <option value="news">Articles & News</option>
            <option value="video">Videos & Highlights</option>
            <option value="sponsorship">Sponsorships & Banners</option>
          </select>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <GoalmillsLoader size="lg" label="Scanning Trash Bin" />
          </div>
        ) : deletedItems.length === 0 ? (
          <div className="py-16 text-center rounded-2xl border border-white/10 bg-[#141C2B]">
            <FiCheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">Trash Bin is Empty</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              No soft-deleted articles, videos, or campaigns exist in the trash queue.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-[#141C2B] overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="border-b border-white/10 text-xs uppercase text-slate-400 bg-white/[0.02]">
                  <tr>
                    <th className="py-3 px-4">Title & Item</th>
                    <th className="py-3 px-3">Content Type</th>
                    <th className="py-3 px-3">Deleted By</th>
                    <th className="py-3 px-3">Deleted At</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {deletedItems.map((item) => (
                    <tr key={item.id} className="hover:bg-white/5 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-white line-clamp-1">{item.title}</div>
                        <div className="text-xs text-slate-500 mt-0.5">Author/Entity: {item.author}</div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-300 border border-white/10 uppercase">
                          {item.type}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-xs text-slate-400">
                        {item.deletedBy}
                      </td>

                      <td className="py-3 px-3 text-xs text-slate-400">
                        {item.deletedAt ? new Date(item.deletedAt).toLocaleString() : 'N/A'}
                      </td>

                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleRestore(item.id, item.type)}
                          disabled={actionInProgress === item.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold transition disabled:opacity-50"
                        >
                          <FiRotateCcw className="w-3.5 h-3.5" />
                          <span>Restore</span>
                        </button>
                        <button
                          onClick={() => handlePurge(item.id, item.type, item.title)}
                          disabled={actionInProgress === item.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs font-bold transition disabled:opacity-50"
                        >
                          <FiAlertTriangle className="w-3.5 h-3.5" />
                          <span>Purge Forever</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
  );
}
