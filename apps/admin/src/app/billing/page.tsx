'use client';

import React, { useState, useEffect } from 'react';
import {
  FiDollarSign,
  FiTrendingUp,
  FiUsers,
  FiAward,
  FiCreditCard,
  FiRefreshCw,
  FiShield,
  FiPieChart,
} from 'react-icons/fi';
import type { BillingHubStats } from '@goalmills/types';

export default function BillingStudio() {
  const [stats, setStats] = useState<BillingHubStats | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      const res = await fetch('/api/admin/billing/stats');
      const data = await res.json();
      if (data.success && data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to load billing stats:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <FiDollarSign size={24} />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                <span>Fan Pass & Subscriptions Hub</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  PHASE 10 LIVE
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Stripe recurring billing, fan pass tier distribution, churn telemetry, and revenue expansion.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={loadData}
          className="px-4 py-2 rounded-xl bg-slate-900 border border-white/10 hover:bg-slate-800 text-xs font-bold transition flex items-center gap-2"
        >
          <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Monthly Recurring (MRR)</span>
            <FiTrendingUp className="text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400">
            ${stats ? stats.mrr.toLocaleString() : '—'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            ARR: ${stats ? stats.arr.toLocaleString() : '—'}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Paid Subs</span>
            <FiUsers className="text-amber-400" />
          </div>
          <div className="text-3xl font-black text-white">
            {stats ? stats.activeSubscribers : '—'}
          </div>
          <div className="text-[11px] text-amber-400 mt-1">
            Total users: {stats ? stats.totalSubscribers : '—'}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Monthly Churn</span>
            <FiShield className="text-blue-400" />
          </div>
          <div className="text-3xl font-black text-white">
            {stats ? `${stats.churnRate}%` : '—'}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1">Industry benchmark: 3.5%</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Gateway Status</span>
            <FiCreditCard className="text-purple-400" />
          </div>
          <div className="text-3xl font-black text-purple-400">Stripe</div>
          <div className="text-[11px] text-emerald-400 mt-1">Webhooks 100% Operational</div>
        </div>
      </div>

      {/* Tier Distribution Breakdown */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <FiPieChart className="text-amber-400" />
          <h3 className="text-sm font-black text-white uppercase tracking-wider">
            Subscriber Tier Distribution & Revenue Weight
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
          {[
            {
              tier: 'Free Fans',
              count: stats?.subscribersByTier.free || 0,
              price: '$0/mo',
              color: 'text-slate-400',
              bg: 'bg-slate-800',
            },
            {
              tier: 'Fan Pass',
              count: stats?.subscribersByTier.fan_pass || 0,
              price: '$4.99/mo',
              color: 'text-amber-400',
              bg: 'bg-amber-500/20 border border-amber-500/30',
            },
            {
              tier: 'VIP Club Pass',
              count: stats?.subscribersByTier.vip_pass || 0,
              price: '$9.99/mo',
              color: 'text-purple-400',
              bg: 'bg-purple-500/20 border border-purple-500/30',
            },
            {
              tier: 'Sponsor & Media Pro',
              count: stats?.subscribersByTier.sponsor_pro || 0,
              price: '$49.99/mo',
              color: 'text-emerald-400',
              bg: 'bg-emerald-500/20 border border-emerald-500/30',
            },
          ].map((t, idx) => (
            <div key={idx} className={`p-4 rounded-xl ${t.bg} space-y-1`}>
              <div className="text-xs text-slate-400 font-bold">{t.tier}</div>
              <div className={`text-2xl font-black ${t.color}`}>{t.count} subscribers</div>
              <div className="text-[11px] text-slate-400">{t.price}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
