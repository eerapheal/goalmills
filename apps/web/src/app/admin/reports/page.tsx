'use client';

import { useState, useEffect } from 'react';
import AdminNavBar from '@/components/admin/AdminNavBar';
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
} from 'react-icons/fi';

export default function DailyReportsAdminPage() {
  const [reports, setReports] = useState<DailyContentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState<DailyContentReport | null>(null);

  // Review Modal State
  const [editorScore, setEditorScore] = useState(8);
  const [editorFeedback, setEditorFeedback] = useState('');
  const [reviewStatus, setReviewStatus] = useState<'approved' | 'reviewed' | 'needs_revision'>('approved');
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
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
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
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSelectedReport(null);
        fetchReports();
      }
    } catch (err) {
      console.error('Error submitting review:', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 pt-[85px] sm:pt-[95px] text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        <AdminNavBar />

        {/* Header & Filter Controls */}
        <div className="glass-card p-6 rounded-3xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xl">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <FiCheckSquare className="text-amber-400" /> Daily Newsroom Content Submissions
            </h1>
            <p className="text-xs text-text-muted mt-0.5">
              Review and grade end-of-day production: articles, social posts, Canva graphics & videos
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs sm:text-sm font-bold text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Review Statuses</option>
              <option value="pending">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="reviewed">Reviewed</option>
              <option value="needs_revision">Needs Revision</option>
            </select>
          </div>
        </div>

        {/* Reports List */}
        {loading ? (
          <div className="p-12 text-center text-text-muted">Loading daily reports...</div>
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
                  className="glass-card p-6 rounded-3xl border border-white/10 shadow-lg space-y-5 hover:border-white/20 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-black text-sm">
                        {rep.employeeName.slice(0, 2)}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base">{rep.employeeName}</h3>
                        <p className="text-xs text-text-muted flex items-center gap-1.5 mt-0.5">
                          <FiCalendar size={12} /> Report Date: <strong className="text-slate-300">{rep.reportDate}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
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
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20 text-xs font-black">
                          <FiStar size={12} /> {rep.editorScore} / 10
                        </span>
                      )}

                      <button
                        onClick={() => {
                          setSelectedReport(rep);
                          setEditorScore(rep.editorScore || 8);
                          setEditorFeedback(rep.editorFeedback || '');
                          setReviewStatus((rep.reviewStatus as any) || 'approved');
                        }}
                        className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all"
                      >
                        {isPending ? 'Review & Grade' : 'Edit Review'}
                      </button>
                    </div>
                  </div>

                  {/* Summary grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                    {/* Articles */}
                    <div className="p-4 bg-slate-950/60 rounded-2xl border border-white/5 space-y-2">
                      <p className="font-bold text-blue-400 flex items-center gap-1.5">
                        <FiFileText /> Articles Published ({rep.articles?.length || 0})
                      </p>
                      {rep.articles?.length > 0 ? (
                        <ul className="space-y-1 text-slate-300">
                          {rep.articles.map((art, i) => (
                            <li key={i} className="truncate">
                              <a
                                href={art.url}
                                target="_blank"
                                rel="noreferrer"
                                className="hover:text-blue-400 hover:underline flex items-center gap-1"
                              >
                                <span>• {art.title}</span>
                                <FiExternalLink size={10} />
                              </a>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-text-muted italic">None recorded</p>
                      )}
                    </div>

                    {/* Social Media */}
                    <div className="p-4 bg-slate-950/60 rounded-2xl border border-white/5 space-y-2">
                      <p className="font-bold text-purple-400 flex items-center gap-1.5">
                        <FiShare2 /> Social Posts ({rep.socialPosts?.length || 0})
                      </p>
                      {rep.socialPosts?.length > 0 ? (
                        <ul className="space-y-1 text-slate-300">
                          {rep.socialPosts.map((post, i) => (
                            <li key={i} className="truncate">
                              <a
                                href={post.url}
                                target="_blank"
                                rel="noreferrer"
                                className="hover:text-purple-400 hover:underline flex items-center gap-1"
                              >
                                <span>• [{post.platform}] {post.captionExcerpt || post.url}</span>
                                <FiExternalLink size={10} />
                              </a>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-text-muted italic">None recorded</p>
                      )}
                    </div>

                    {/* Canva & Video Assets */}
                    <div className="p-4 bg-slate-950/60 rounded-2xl border border-white/5 space-y-2">
                      <p className="font-bold text-amber-400 flex items-center gap-1.5">
                        <FiImage /> Media Assets ({rep.mediaAssets?.length || 0})
                      </p>
                      {rep.mediaAssets?.length > 0 ? (
                        <ul className="space-y-1 text-slate-300">
                          {rep.mediaAssets.map((asset, i) => (
                            <li key={i} className="truncate">
                              <a
                                href={asset.link}
                                target="_blank"
                                rel="noreferrer"
                                className="hover:text-amber-400 hover:underline flex items-center gap-1"
                              >
                                <span>• {asset.title} ({asset.type.replace('_', ' ')})</span>
                                <FiExternalLink size={10} />
                              </a>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-text-muted italic">None recorded</p>
                      )}
                    </div>

                    {/* Tasks & Lessons */}
                    <div className="p-4 bg-slate-950/60 rounded-2xl border border-white/5 space-y-2">
                      <p className="font-bold text-emerald-400 flex items-center gap-1.5">
                        <FiCheckCircle /> Daily Notes & Learnings
                      </p>
                      <p className="text-slate-300 line-clamp-3 leading-relaxed">
                        {rep.tasksCompleted}
                      </p>
                      {rep.lessonsLearned && (
                        <p className="text-text-muted text-[11px] italic line-clamp-2">
                          Lesson: {rep.lessonsLearned}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Feedback display if present */}
                  {rep.editorFeedback && (
                    <div className="p-3.5 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-xs text-blue-200">
                      <strong>Editor Feedback ({rep.reviewedBy}):</strong> {rep.editorFeedback}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Review Modal */}
        {selectedReport && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-white/10 w-full max-w-lg rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
              <div>
                <h3 className="text-xl font-black text-white">Review Daily Report</h3>
                <p className="text-xs text-text-muted">
                  {selectedReport.employeeName} • {selectedReport.reportDate}
                </p>
              </div>

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Review Status</label>
                  <select
                    value={reviewStatus}
                    onChange={(e: any) => setReviewStatus(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:border-blue-500 focus:outline-none"
                  >
                    <option value="approved">Approved & Scored</option>
                    <option value="reviewed">Reviewed (Feedback Provided)</option>
                    <option value="needs_revision">Needs Revision</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Quality & Accuracy Score (1 - 10): <span className="text-amber-400 font-bold">{editorScore} / 10</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={editorScore}
                    onChange={(e) => setEditorScore(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Editor Feedback / Corrections</label>
                  <textarea
                    rows={4}
                    placeholder="Provide constructive feedback, praise strong storytelling, or point out editorial corrections..."
                    value={editorFeedback}
                    onChange={(e) => setEditorFeedback(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
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
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-500/25 disabled:opacity-50"
                  >
                    {submittingReview ? 'Saving Review...' : 'Save & Publish Score'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
