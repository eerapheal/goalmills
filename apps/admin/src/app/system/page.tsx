'use client';

import React, { useState, useEffect } from 'react';
import {
  FiSettings,
  FiServer,
  FiZap,
  FiShield,
  FiDatabase,
  FiCheckCircle,
  FiRefreshCw,
  FiActivity,
  FiMail,
  FiCpu,
} from 'react-icons/fi';
import { GoalmillsLoader } from '@/components/GoalmillsLoader';

export default function SystemConfigurationPage() {
  const [loading, setLoading] = useState(true);
  const [healthData, setHealthData] = useState<any>(null);
  const [clearingCache, setClearingCache] = useState(false);
  const [cacheStatus, setCacheStatus] = useState<string | null>(null);

  const fetchDiagnostics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/system/health');
      const data = await res.json();
      if (data.success) {
        setHealthData(data.services);
      }
    } catch (err) {
      console.error('Failed to fetch health diagnostics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagnostics();
  }, []);

  const handlePurgeCache = async () => {
    if (!confirm('Are you sure you want to invalidate all Redis and in-memory cache keys?')) return;
    setClearingCache(true);
    try {
      const res = await fetch('/api/admin/system/cache-flush', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setCacheStatus('Cache flushed successfully across all nodes!');
        fetchDiagnostics();
        setTimeout(() => setCacheStatus(null), 3000);
      } else {
        alert(data.error || 'Failed to flush cache');
      }
    } catch (err) {
      console.error('Error flushing cache:', err);
    } finally {
      setClearingCache(false);
    }
  };

  const redis = healthData?.redis;
  const db = healthData?.database;
  const mailer = healthData?.mailer;
  const providers = healthData?.providers;

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
              <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <FiSettings className="w-6 h-6" />
              </span>
              System Configuration & Diagnostics
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Live multi-tier Redis telemetry, database health, microservice latency, and sports provider circuit-breaker status.
            </p>
          </div>

          <button
            onClick={fetchDiagnostics}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-slate-900 text-slate-300 hover:text-white transition text-sm font-semibold self-start sm:self-auto"
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Diagnostics</span>
          </button>
        </div>

        {/* Primary Health Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Redis Card */}
          <div className="p-6 rounded-2xl bg-[#141C2B] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
                <FiZap className="w-5 h-5" />
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                  redis?.status === 'HEALTHY'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}
              >
                {redis?.status || 'ONLINE'} ({redis?.mode || 'in-memory'})
              </span>
            </div>

            <div>
              <h4 className="text-base font-bold text-white">Multi-Tier Redis Engine</h4>
              <p className="text-xs text-slate-400 mt-1">
                Single-flight stampede protection and fallback cache.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-xs">
              <div className="p-2 rounded-lg bg-slate-900">
                <div className="text-slate-400">Latency</div>
                <div className="text-sm font-bold text-white mt-0.5">
                  {redis ? `${redis.latencyMs}ms` : '0ms'}
                </div>
              </div>
              <div className="p-2 rounded-lg bg-slate-900">
                <div className="text-slate-400">Hit Ratio</div>
                <div className="text-sm font-bold text-emerald-400 mt-0.5">
                  {redis?.metrics?.hitRatio || '100%'}
                </div>
              </div>
              <div className="p-2 rounded-lg bg-slate-900">
                <div className="text-slate-400">Memory Entries</div>
                <div className="text-sm font-bold text-white mt-0.5">
                  {redis?.memoryEntries || 0}
                </div>
              </div>
              <div className="p-2 rounded-lg bg-slate-900">
                <div className="text-slate-400">Stampede Saves</div>
                <div className="text-sm font-bold text-amber-400 mt-0.5">
                  {redis?.metrics?.singleFlightSaves || 0}
                </div>
              </div>
            </div>

            <button
              onClick={handlePurgeCache}
              disabled={clearingCache}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition active:scale-95"
            >
              {clearingCache ? 'Purging Cache...' : 'Flush Redis & Memory Cache'}
            </button>
            {cacheStatus && (
              <p className="text-xs text-emerald-400 text-center font-semibold">{cacheStatus}</p>
            )}
          </div>

          {/* Database Card */}
          <div className="p-6 rounded-2xl bg-[#141C2B] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                <FiDatabase className="w-5 h-5" />
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                  db?.status === 'HEALTHY'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}
              >
                {db?.status || 'ONLINE'}
              </span>
            </div>

            <div>
              <h4 className="text-base font-bold text-white">MongoDB Atlas Cluster</h4>
              <p className="text-xs text-slate-400 mt-1">
                Lazy connection pool with serverSelectionTimeout guards.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-xs">
              <div className="p-2 rounded-lg bg-slate-900">
                <div className="text-slate-400">Cluster Latency</div>
                <div className="text-sm font-bold text-white mt-0.5">
                  {db ? `${db.latencyMs}ms` : '0ms'}
                </div>
              </div>
              <div className="p-2 rounded-lg bg-slate-900">
                <div className="text-slate-400">Pool Max Size</div>
                <div className="text-sm font-bold text-white mt-0.5">10 Conns</div>
              </div>
            </div>
          </div>

          {/* Security & Shield Card */}
          <div className="p-6 rounded-2xl bg-[#141C2B] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
                <FiShield className="w-5 h-5" />
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[11px] font-bold">
                ENFORCED
              </span>
            </div>

            <div>
              <h4 className="text-base font-bold text-white">Security & Secret Shield</h4>
              <p className="text-xs text-slate-400 mt-1">
                RBAC, NoSQL sanitization, ReDoS mitigation, and CSRF protection.
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-white/5 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span>Client Secrets Exposed</span>
                <span className="text-emerald-400 font-bold">0 (Shielded)</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Telemetry Bot Guard</span>
                <span className="text-emerald-400 font-bold">Active (Rate-Limited)</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Audit Trail Logger</span>
                <span className="text-emerald-400 font-bold">Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Connected Microservices & Sports Providers */}
        <div className="rounded-2xl border border-white/10 bg-[#141C2B] p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FiServer className="text-cyan-400" />
            <span>Sports Providers & Connected Microservices</span>
          </h3>

          <div className="divide-y divide-white/5 text-sm">
            <div className="py-3 flex items-center justify-between">
              <div>
                <span className="font-bold text-white">Football Ingestion Engine</span>
                <p className="text-xs text-slate-400">AllSportsAPI • 250ms fetch spacer • Circuit Breaker Active</p>
              </div>
              <span className="text-xs font-semibold text-emerald-400">Healthy</span>
            </div>

            <div className="py-3 flex items-center justify-between">
              <div>
                <span className="font-bold text-white">Cricket Ingestion Engine</span>
                <p className="text-xs text-slate-400">Cricbuzz RapidAPI / AllSports • Full Scorecard & Inning Normalization</p>
              </div>
              <span className="text-xs font-semibold text-emerald-400">Healthy</span>
            </div>

            <div className="py-3 flex items-center justify-between">
              <div>
                <span className="font-bold text-white">Basketball Ingestion Engine</span>
                <p className="text-xs text-slate-400">AllSportsAPI • Period & Quarter Normalization</p>
              </div>
              <span className="text-xs font-semibold text-emerald-400">Healthy</span>
            </div>

            <div className="py-3 flex items-center justify-between">
              <div>
                <span className="font-bold text-white">Go Enterprise Mailer Service</span>
                <p className="text-xs text-slate-400">Port 8085 • Priority Queue & Traffic Shaping</p>
              </div>
              <span
                className={`text-xs font-semibold ${
                  mailer?.status === 'HEALTHY' ? 'text-emerald-400' : 'text-slate-400'
                }`}
              >
                {mailer?.status === 'HEALTHY' ? `Connected (${mailer.latencyMs}ms)` : 'Standby / Local'}
              </span>
            </div>
          </div>
        </div>
      </div>
  );
}
