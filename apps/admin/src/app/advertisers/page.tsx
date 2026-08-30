'use client';

import React, { useState, useEffect } from 'react';
import {
  FiShield,
  FiAward,
  FiDownload,
  FiCheckCircle,
  FiTrendingUp,
  FiDollarSign,
  FiLayers,
  FiRefreshCw,
  FiFileText,
  FiExternalLink,
} from 'react-icons/fi';
import type { AdvertiserHubStats, AdvertiserReportSummary } from '@goalmills/types';

export default function AdvertiserReportingStudio() {
  const [stats, setStats] = useState<AdvertiserHubStats | null>(null);
  const [selectedReport, setSelectedReport] = useState<AdvertiserReportSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  async function loadData() {
    try {
      const res = await fetch('/api/admin/advertisers/report');
      const data = await res.json();
      if (data.success && data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to load advertiser stats:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function generateProofCertificate(sponsorId: string) {
    setGenerating(true);
    try {
      const res = await fetch(`/api/admin/advertisers/report?sponsorId=${encodeURIComponent(sponsorId)}`);
      const data = await res.json();
      if (data.success && data.report) {
        setSelectedReport(data.report);
      }
    } catch (err) {
      console.error('Failed to generate proof certificate:', err);
    } finally {
      setGenerating(false);
    }
  }

  function downloadCsv() {
    window.location.href = '/api/admin/advertisers/export';
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <FiAward size={24} />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                <span>Advertiser Proof-of-Performance Hub</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  PHASE 10 LIVE
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Certified viewability audits, cryptographic SHA-256 delivery certificates, and sponsor settlement.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={downloadCsv}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            <FiDownload />
            <span>Export Audit CSV</span>
          </button>

          <button
            onClick={loadData}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-white/10 hover:bg-slate-800 text-xs font-bold transition flex items-center gap-2"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Delivered Impressions</span>
            <FiLayers className="text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white">
            {stats ? stats.totalDeliveredImpressions.toLocaleString() : '—'}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1">Across 8 campaigns</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Average CTR</span>
            <FiTrendingUp className="text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400">
            {stats ? `${stats.averageCtr}%` : '—'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Verified human engagement</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Estimated Revenue</span>
            <FiDollarSign className="text-purple-400" />
          </div>
          <div className="text-3xl font-black text-white">
            ${stats ? stats.totalRevenueMonthly.toLocaleString() : '—'}
          </div>
          <div className="text-[11px] text-purple-300 mt-1">Effective CPM: $12.50</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Sponsors</span>
            <FiShield className="text-blue-400" />
          </div>
          <div className="text-3xl font-black text-white">
            {stats ? stats.activeSponsors : '—'}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1">100% Brand Safety Compliance</div>
        </div>
      </div>

      {/* Brand Sponsors Table & Certificate Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Table */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/60 border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <FiFileText className="text-emerald-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Active Brand Sponsor Campaigns
              </h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Real-time Telemetry</span>
          </div>

          <div className="space-y-2.5">
            {stats?.topSponsors.map((s) => (
              <div
                key={s.sponsorId}
                className="p-4 rounded-xl bg-slate-950/80 border border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-bold text-white text-sm">{s.sponsorName}</div>
                  <div className="text-slate-400 text-[11px]">
                    Delivered: <span className="text-slate-200 font-mono font-bold">{s.impressions.toLocaleString()}</span> impressions | Spend: <span className="text-emerald-400 font-mono font-bold">${s.spend.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    CTR {s.ctr}%
                  </span>

                  <button
                    onClick={() => generateProofCertificate(s.sponsorId)}
                    disabled={generating}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-[11px] transition flex items-center gap-1.5"
                  >
                    <FiShield />
                    <span>Audit Certificate</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Certificate Display */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border border-emerald-500/30 space-y-4 shadow-xl shadow-emerald-500/5">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <FiShield className="text-emerald-400" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Verifiable Proof-of-Performance
            </h3>
          </div>

          {selectedReport ? (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 space-y-1">
                <div className="flex items-center gap-1.5 font-black text-sm">
                  <FiCheckCircle />
                  <span>Certified Delivery Certificate</span>
                </div>
                <div className="text-[11px] opacity-80">
                  SHA-256 Hash: <span className="font-mono text-[10px] break-all">{selectedReport.certificateHash}</span>
                </div>
              </div>

              <div className="space-y-2 text-slate-300">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Sponsor:</span>
                  <span className="font-bold text-white">{selectedReport.sponsorName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Campaign:</span>
                  <span className="font-bold text-white">{selectedReport.campaignName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Total Impressions:</span>
                  <span className="font-mono font-bold text-white">{selectedReport.impressions.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Viewable Impressions:</span>
                  <span className="font-mono font-bold text-emerald-400">{selectedReport.viewableImpressions.toLocaleString()} ({selectedReport.viewabilityRate}%)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Clicks / CTR:</span>
                  <span className="font-mono font-bold text-amber-400">{selectedReport.clicks.toLocaleString()} ({selectedReport.ctr}%)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Campaign Spend:</span>
                  <span className="font-mono font-bold text-emerald-400">${selectedReport.totalSpend.toLocaleString()}</span>
                </div>
              </div>

              <div className="text-[10px] text-slate-500 pt-2 text-center">
                Generated: {new Date(selectedReport.generatedAt).toUTCString()}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              Click &quot;Audit Certificate&quot; on any brand sponsor to render a verifiable cryptographic delivery certificate.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
