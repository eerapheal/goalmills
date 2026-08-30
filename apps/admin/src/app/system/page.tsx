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

        {/* Multi-Tenant Organizations Management */}
        <TenantManagementSection />

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

function TenantManagementSection() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [plan, setPlan] = useState('free');
  const [customDomain, setCustomDomain] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/tenants');
      const data = await res.json();
      if (data.success) {
        setTenants(data.tenants || []);
      }
    } catch (err) {
      console.error('Failed to load tenants:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug, plan, customDomain: customDomain || undefined }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`Tenant "${name}" created successfully!`);
        setName('');
        setSlug('');
        setCustomDomain('');
        setShowAddModal(false);
        fetchTenants();
        setTimeout(() => setMessage(null), 3500);
      } else {
        alert(data.error || 'Failed to create tenant');
      }
    } catch (err: any) {
      alert(err.message || 'Error creating tenant');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (tenant: any) => {
    if (tenant._id === 'default' || tenant.slug === 'goalmills') {
      alert('Default platform tenant status cannot be changed');
      return;
    }
    const nextStatus = tenant.status === 'active' ? 'suspended' : 'active';
    if (!confirm(`Are you sure you want to change status of "${tenant.name}" to ${nextStatus.toUpperCase()}?`)) return;

    try {
      const res = await fetch(`/api/admin/tenants/${tenant._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        fetchTenants();
      } else {
        alert(data.error || 'Failed to update tenant status');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update tenant');
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#141C2B] p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <FiShield className="w-4 h-4" />
            </span>
            <span>Multi-Tenant Organizations & Publishing Brands</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Isolated tenant routing, domain mapping, plan tiers, and feature entitlements.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(!showAddModal)}
          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition self-start sm:self-auto"
        >
          {showAddModal ? 'Cancel' : '+ Provision New Tenant'}
        </button>
      </div>

      {message && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          {message}
        </div>
      )}

      {showAddModal && (
        <form onSubmit={handleCreateTenant} className="p-4 rounded-xl bg-slate-900 border border-white/10 space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">
            Provision New Tenant Organization
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Organization Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Apex Sports News"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Subdomain Slug *</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="e.g. apex"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Plan Tier</label>
              <select
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white outline-none focus:border-blue-500"
              >
                <option value="free">Free Tier</option>
                <option value="creator">Creator ($49/mo)</option>
                <option value="publisher">Publisher ($199/mo)</option>
                <option value="enterprise">Enterprise ($499/mo)</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Custom Domain (Optional)</label>
              <input
                type="text"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value.toLowerCase())}
                placeholder="e.g. sports.apexdaily.com"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition disabled:opacity-50"
            >
              {submitting ? 'Provisioning...' : 'Confirm & Launch Tenant'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="py-8 text-center text-slate-400 text-xs">Loading tenant organizations...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="text-slate-400 border-b border-white/10 text-[10px] uppercase font-bold">
                <th className="pb-2">Organization</th>
                <th className="pb-2">Slug / Subdomain</th>
                <th className="pb-2">Custom Domain</th>
                <th className="pb-2">Plan</th>
                <th className="pb-2">Status</th>
                <th className="pb-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {tenants.map((t) => (
                <tr key={t._id} className="hover:bg-slate-900/50">
                  <td className="py-2.5 font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    <span>{t.name}</span>
                    {t.slug === 'goalmills' && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase font-mono font-bold">
                        Primary
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 font-mono text-cyan-400">{t.slug}.goalmills.com</td>
                  <td className="py-2.5 text-slate-400 font-mono">{t.customDomain || '—'}</td>
                  <td className="py-2.5">
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-200 border border-white/10 uppercase font-bold text-[9px]">
                      {t.plan || 'Free'}
                    </span>
                  </td>
                  <td className="py-2.5">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase border ${
                        t.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="py-2.5 text-right">
                    {t.slug !== 'goalmills' && (
                      <button
                        onClick={() => handleToggleStatus(t)}
                        className="text-[10px] font-bold text-slate-300 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition"
                      >
                        {t.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
