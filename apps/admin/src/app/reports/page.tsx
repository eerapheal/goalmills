'use client';

import { useState, useEffect } from 'react';
import GoalmillsLoader from '@/components/GoalmillsLoader';
import { DailyContentReport } from '@goalmills/types';
import {
  FiCheckSquare,
  FiFileText,
  FiShare2,
  FiImage,
  FiVideo,
  FiCheckCircle,
  FiClock,
  FiMessageSquare,
  FiStar,
  FiExternalLink,
  FiFilter,
  FiCalendar,
  FiX,
  FiChevronDown,
  FiAlertTriangle,
} from 'react-icons/fi';

export default function DailyReportsAdminPage() {
  const [reports, setReports] = useState<DailyContentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState<DailyContentReport | null>(null);

  // Review Modal State
  const [editorScore, setEditorScore] = useState(8);
  const [editorFeedback, setEditorFeedback] = useState('');
  const [reviewStatus, setReviewStatus] = useState<'approved' | 'reviewed' | 'needs_revision'>(
    'approved'
  );
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const url = new URL('/api/reports/daily', window.location.origin);
      if (statusFilter !== 'all') url.searchParams.set('status', statusFilter);

      const res = await fetch(url.toString());
      const json = await res.json();
      if (json.success) {
        setReports(json.data);
      }
    } catch (err) {
      console.error('Error fetching daily reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const handleOpenReview = (report: DailyContentReport) => {
    setSelectedReport(report);
    setEditorScore(report.editorScore || 8);
    setEditorFeedback(report.editorFeedback || '');
    setReviewStatus(report.reviewStatus === 'pending' ? 'approved' : report.reviewStatus);
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;

    try {
      setSubmittingReview(true);
      const res = await fetch('/api/reports/daily', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId: selectedReport._id,
          reviewStatus,
          editorScore,
          editorFeedback,
          reviewedBy: 'Ekpenisi Erue Raphael',
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSelectedReport(null);
        fetchReports();
      }
    } catch (err) {
      console.error('Error updating report review:', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const pendingCount = reports.filter((r) => r.reviewStatus === 'pending').length;
  const approvedCount = reports.filter((r) => r.reviewStatus === 'approved').length;

  return (
    <div className="space-y-5 sm:space-y-6 text-white">
      {/* Top Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4">
          <div className="glass-card p-3.5 sm:p-5 rounded-2xl border border-white/10 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs text-text-muted uppercase tracking-wider font-bold">
                Total Submissions
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <FiCheckSquare size={16} />
              </div>
            </div>
            <div className="mt-2">
              <h3 className="text-xl sm:text-2xl font-black text-white">{reports.length}</h3>
              <p className="text-[10px] text-text-muted mt-0.5">Daily Logs</p>
            </div>
          </div>

          <div className="glass-card p-3.5 sm:p-5 rounded-2xl border border-white/10 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs text-text-muted uppercase tracking-wider font-bold">
                Pending Editorial Review
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <FiClock size={16} />
              </div>
            </div>
            <div className="mt-2">
              <h3 className="text-xl sm:text-2xl font-black text-amber-400">{pendingCount}</h3>
              <p className="text-[10px] text-text-muted mt-0.5">Awaiting Score</p>
            </div>
          </div>

          <div className="glass-card p-3.5 sm:p-5 rounded-2xl border border-white/10 flex flex-col justify-between col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs text-text-muted uppercase tracking-wider font-bold">
                Approved Reports
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <FiCheckCircle size={16} />
              </div>
            </div>
            <div className="mt-2">
              <h3 className="text-xl sm:text-2xl font-black text-emerald-400">{approvedCount}</h3>
              <p className="text-[10px] text-text-muted mt-0.5">Scored & Verified</p>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="glass-card p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-white/10 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <FiCheckSquare className="text-blue-400" /> Daily Content Review Queue
            </h1>
            <p className="text-xs text-text-muted mt-0.5">
              Review and grade trainee sports articles, social posts, Canva graphics, and short-form
              video assets
            </p>
          </div>

          {/* Status Dropdown */}
          <div className="relative min-w-[200px]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs sm:text-sm font-bold text-slate-300 focus:outline-none focus:border-blue-500 pr-9 transition-colors"
            >
              <option value="all">All Review Statuses</option>
              <option value="pending">⏳ Pending Review</option>
              <option value="approved">✓ Approved & Scored</option>
              <option value="needs_revision">⚠ Needs Revision</option>
            </select>
            <FiChevronDown
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              size={16}
            />
          </div>
        </div>

        {/* Reports List */}
        {loading ? (
          <div className="p-12 flex justify-center">
            <GoalmillsLoader
              size="md"
              label="Newsroom Daily Submissions"
              sublabel="Fetching content production reports..."
            />
          </div>
        ) : reports.length === 0 ? (
          <div className="glass-card p-12 rounded-3xl border border-white/10 text-center space-y-3">
            <FiCheckSquare className="mx-auto text-slate-600" size={40} />
            <p className="text-slate-400 font-bold">No daily content reports submitted yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {reports.map((rep) => {
              const isApproved = rep.reviewStatus === 'approved';
              const isPending = rep.reviewStatus === 'pending';

              return (
                <div
                  key={rep._id}
                  className="glass-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/10 shadow-lg space-y-4 hover:border-white/20 transition-all"
                >
                  {/* Top Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-black text-sm flex-shrink-0 shadow-md">
                        {rep.employeeName.slice(0, 2)}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm sm:text-base">
                          {rep.employeeName}
                        </h3>
                        <p className="text-xs text-text-muted flex items-center gap-1.5 mt-0.5">
                          <FiCalendar size={12} /> Date:{' '}
                          <strong className="text-slate-300">{rep.reportDate}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 justify-between sm:justify-end">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          isApproved
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : isPending
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}
                      >
                        {rep.reviewStatus.replace('_', ' ')}
                      </span>

                      {rep.editorScore && (
                        <span className="flex items-center gap-1 text-xs font-black text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                          <FiStar size={12} /> {rep.editorScore}/10
                        </span>
                      )}

                      <button
                        onClick={() => handleOpenReview(rep)}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md"
                      >
                        {isPending ? 'Review & Grade' : 'Edit Review'}
                      </button>
                    </div>
                  </div>

                  {/* Tasks Summary */}
                  <div className="bg-slate-900/60 p-3 sm:p-4 rounded-xl border border-white/5 space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Work Completed Summary:
                    </p>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                      {rep.tasksCompleted}
                    </p>
                  </div>

                  {/* Produced Assets Chips */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Articles */}
                    <div className="bg-slate-900/40 p-3 rounded-xl border border-white/5 space-y-1.5">
                      <span className="text-[11px] font-bold text-blue-400 flex items-center gap-1">
                        <FiFileText size={12} /> Articles ({rep.articles?.length || 0})
                      </span>
                      <div className="space-y-1">
                        {rep.articles?.map((art, idx) => (
                          <a
                            key={idx}
                            href={art.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-slate-300 hover:text-white flex items-center justify-between group truncate"
                          >
                            <span className="truncate">{art.title || art.url}</span>
                            <FiExternalLink
                              size={10}
                              className="text-slate-500 group-hover:text-blue-400 flex-shrink-0 ml-1"
                            />
                          </a>
                        ))}
                      </div>
                    </div>

                    {/* Social Media */}
                    <div className="bg-slate-900/40 p-3 rounded-xl border border-white/5 space-y-1.5">
                      <span className="text-[11px] font-bold text-purple-400 flex items-center gap-1">
                        <FiShare2 size={12} /> Social Media ({rep.socialPosts?.length || 0})
                      </span>
                      <div className="space-y-1">
                        {rep.socialPosts?.map((post, idx) => (
                          <a
                            key={idx}
                            href={post.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-slate-300 hover:text-white flex items-center justify-between group truncate"
                          >
                            <span className="truncate">
                              {post.platform}: Post #{idx + 1}
                            </span>
                            <FiExternalLink
                              size={10}
                              className="text-slate-500 group-hover:text-purple-400 flex-shrink-0 ml-1"
                            />
                          </a>
                        ))}
                      </div>
                    </div>

                    {/* Media Assets (Canva / Videos) */}
                    <div className="bg-slate-900/40 p-3 rounded-xl border border-white/5 space-y-1.5">
                      <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                        <FiImage size={12} /> Canva & Video Assets ({rep.mediaAssets?.length || 0})
                      </span>
                      <div className="space-y-1">
                        {rep.mediaAssets?.map((media, idx) => (
                          <a
                            key={idx}
                            href={media.link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-slate-300 hover:text-white flex items-center justify-between group truncate"
                          >
                            <span className="truncate">{media.title || media.type}</span>
                            <FiExternalLink
                              size={10}
                              className="text-slate-500 group-hover:text-amber-400 flex-shrink-0 ml-1"
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Sources Used & Feedback */}
                  {rep.editorFeedback && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs space-y-1">
                      <p className="font-bold text-emerald-400 flex items-center gap-1">
                        <FiMessageSquare size={12} /> Editorial Feedback & Remarks:
                      </p>
                      <p className="text-slate-300 italic">{rep.editorFeedback}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* Responsive Review Modal */}
        {/* ------------------------------------------------------------- */}
        {selectedReport && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-slate-900 border-t sm:border border-white/15 w-full max-w-xl rounded-t-3xl sm:rounded-3xl p-5 sm:p-8 space-y-5 shadow-2xl animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-white">
                    Score & Review Daily Submission
                  </h3>
                  <p className="text-xs text-text-muted mt-0.5">
                    {selectedReport.employeeName} • {selectedReport.reportDate}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl bg-white/5"
                >
                  <FiX size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveReview} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Review Decision *
                  </label>
                  <select
                    value={reviewStatus}
                    onChange={(e: any) => setReviewStatus(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-white/10 text-white text-xs sm:text-sm font-bold focus:border-blue-500 focus:outline-none"
                  >
                    <option value="approved">✓ Approved & Verified</option>
                    <option value="reviewed">Reviewed (Satisfactory)</option>
                    <option value="needs_revision">⚠ Needs Revision / Corrections</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-300">
                      Editor Score (1 – 10)
                    </label>
                    <span className="text-sm font-black text-amber-400">{editorScore} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={editorScore}
                    onChange={(e) => setEditorScore(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>1 (Poor)</span>
                    <span>5 (Average)</span>
                    <span>10 (Outstanding)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Editorial Feedback & Actionable Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide constructive feedback on writing quality, SEO optimization, social hooks, or Canva visual standards..."
                    value={editorFeedback}
                    onChange={(e) => setEditorFeedback(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-white/10 text-white text-xs sm:text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedReport(null)}
                    className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-500/20 disabled:opacity-50"
                  >
                    {submittingReview ? 'Saving...' : 'Submit Evaluation'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </div>
  );
}
