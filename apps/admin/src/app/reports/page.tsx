'use client';

import { useState, useEffect } from 'react';
import GoalmillsLoader from '@/components/GoalmillsLoader';
import { DailyContentReport, DailyScorecardBreakdown } from '@goalmills/types';
import { DAILY_SCORECARD_RUBRICS, PERFORMANCE_RATINGS } from '@/lib/trainingCurriculum';
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
  FiAward,
  FiBarChart2,
} from 'react-icons/fi';

const DEFAULT_SCORECARD: DailyScorecardBreakdown = {
  research: 10,
  accuracy: 10,
  writing: 10,
  seo: 7,
  socialMedia: 7,
  graphicDesign: 7,
  creativity: 7,
  publishingDiscipline: 3,
  analyticsLearning: 3,
  teamworkReporting: 3,
};

export default function DailyReportsAdminPage() {
  const [reports, setReports] = useState<DailyContentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState<DailyContentReport | null>(null);

  // Review Modal State — 10-category 100-point scorecard
  const [scorecard, setScorecard] = useState<DailyScorecardBreakdown>({ ...DEFAULT_SCORECARD });
  const [editorFeedback, setEditorFeedback] = useState('');
  const [reviewStatus, setReviewStatus] = useState<'approved' | 'reviewed' | 'revision' | 'retraining'>(
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

  const calculateTotal = (sc: DailyScorecardBreakdown) =>
    (sc.research || 0) +
    (sc.accuracy || 0) +
    (sc.writing || 0) +
    (sc.seo || 0) +
    (sc.socialMedia || 0) +
    (sc.graphicDesign || 0) +
    (sc.creativity || 0) +
    (sc.publishingDiscipline || 0) +
    (sc.analyticsLearning || 0) +
    (sc.teamworkReporting || 0);

  const getRatingLabel = (total: number) => {
    const r = PERFORMANCE_RATINGS.find((p) => total >= p.min && total <= p.max);
    return r ? r.label : 'Unrated';
  };

  const getRatingColor = (total: number) => {
    if (total >= 90) return 'text-emerald-400';
    if (total >= 80) return 'text-blue-400';
    if (total >= 70) return 'text-amber-400';
    if (total >= 60) return 'text-orange-400';
    return 'text-red-400';
  };

  const handleOpenReview = (report: DailyContentReport) => {
    setSelectedReport(report);
    if (report.scorecard) {
      setScorecard({ ...report.scorecard });
    } else {
      setScorecard({ ...DEFAULT_SCORECARD });
    }
    setEditorFeedback(report.editorFeedback || '');
    setReviewStatus(
      report.reviewStatus === 'pending' ? 'approved' : (report.reviewStatus as any) || 'approved'
    );
  };

  const handleScorecardChange = (key: string, value: number) => {
    setScorecard((prev) => ({ ...prev, [key]: value }));
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
          scorecard,
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
  const totalCurrentScore = calculateTotal(scorecard);

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
                Pending Review
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <FiClock size={16} />
              </div>
            </div>
            <div className="mt-2">
              <h3 className="text-xl sm:text-2xl font-black text-amber-400">{pendingCount}</h3>
              <p className="text-[10px] text-text-muted mt-0.5">Awaiting 100-Point Score</p>
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
              Review and grade trainee assignments using the official 10-category 100-point GoalMills Sports Media Academy rubric
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
              <option value="revision">⚠ Needs Revision</option>
              <option value="retraining">❌ Remedial Training</option>
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
              const hasScore = (rep.totalScore || 0) > 0;

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
                          <FiCalendar size={12} />
                          {rep.trainingDay && (
                            <span className="text-amber-400 font-bold">Day {rep.trainingDay} •</span>
                          )}
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
                        {rep.reviewStatus === 'needs_revision' ? 'Needs Revision' : rep.reviewStatus}
                      </span>

                      {hasScore && (
                        <span className={`flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-full border ${
                          (rep.totalScore || 0) >= 90
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : (rep.totalScore || 0) >= 70
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          <FiBarChart2 size={12} /> {rep.totalScore}/100
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

                  {/* Training Day Lesson */}
                  {rep.lessonStudied && (
                    <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs flex items-center gap-2">
                      <FiAward className="text-amber-400 flex-shrink-0" size={14} />
                      <span className="text-amber-300 font-bold">Lesson Studied:</span>
                      <span className="text-slate-200">{rep.lessonStudied}</span>
                    </div>
                  )}

                  {/* Direct URL Links Row */}
                  {(rep.articleUrl || rep.xUrl || rep.facebookUrl || rep.instagramUrl || rep.tiktokUrl || rep.youtubeUrl || rep.graphicUrl) && (
                    <div className="flex flex-wrap gap-2">
                      {rep.articleUrl && (
                        <a href={rep.articleUrl} target="_blank" rel="noreferrer" className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[11px] font-bold hover:bg-blue-500/20 flex items-center gap-1">
                          📰 Article <FiExternalLink size={10} />
                        </a>
                      )}
                      {rep.xUrl && (
                        <a href={rep.xUrl} target="_blank" rel="noreferrer" className="px-2.5 py-1 rounded-lg bg-slate-500/10 text-slate-300 border border-slate-500/20 text-[11px] font-bold hover:bg-slate-500/20 flex items-center gap-1">
                          𝕏 Post <FiExternalLink size={10} />
                        </a>
                      )}
                      {rep.facebookUrl && (
                        <a href={rep.facebookUrl} target="_blank" rel="noreferrer" className="px-2.5 py-1 rounded-lg bg-blue-600/10 text-blue-300 border border-blue-600/20 text-[11px] font-bold hover:bg-blue-600/20 flex items-center gap-1">
                          Facebook <FiExternalLink size={10} />
                        </a>
                      )}
                      {rep.instagramUrl && (
                        <a href={rep.instagramUrl} target="_blank" rel="noreferrer" className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[11px] font-bold hover:bg-purple-500/20 flex items-center gap-1">
                          Instagram <FiExternalLink size={10} />
                        </a>
                      )}
                      {rep.tiktokUrl && (
                        <a href={rep.tiktokUrl} target="_blank" rel="noreferrer" className="px-2.5 py-1 rounded-lg bg-pink-500/10 text-pink-400 border border-pink-500/20 text-[11px] font-bold hover:bg-pink-500/20 flex items-center gap-1">
                          TikTok <FiExternalLink size={10} />
                        </a>
                      )}
                      {rep.youtubeUrl && (
                        <a href={rep.youtubeUrl} target="_blank" rel="noreferrer" className="px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-[11px] font-bold hover:bg-red-500/20 flex items-center gap-1">
                          YouTube <FiExternalLink size={10} />
                        </a>
                      )}
                      {rep.graphicUrl && (
                        <a href={rep.graphicUrl} target="_blank" rel="noreferrer" className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] font-bold hover:bg-amber-500/20 flex items-center gap-1">
                          🎨 Canva <FiExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  )}

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

                    {/* Media Assets */}
                    <div className="bg-slate-900/40 p-3 rounded-xl border border-white/5 space-y-1.5">
                      <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                        <FiImage size={12} /> Canva & Video ({rep.mediaAssets?.length || 0})
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

                  {/* Source Trail */}
                  {(rep.source1 || rep.source2) && (
                    <div className="p-3 bg-slate-900/40 rounded-xl border border-white/5 text-xs space-y-1">
                      <p className="font-bold text-slate-400 uppercase tracking-wider">Source Verification Trail:</p>
                      {rep.source1 && <p className="text-slate-300">Source 1: <span className="text-slate-200">{rep.source1}</span></p>}
                      {rep.source2 && <p className="text-slate-300">Source 2: <span className="text-slate-200">{rep.source2}</span></p>}
                    </div>
                  )}

                  {/* Scorecard Breakdown (if graded) */}
                  {rep.scorecard && rep.totalScore && (
                    <div className="p-3 sm:p-4 bg-slate-900/60 rounded-xl border border-white/5 space-y-2">
                      <p className="text-xs font-bold text-amber-400 flex items-center gap-1">
                        <FiBarChart2 size={12} /> 10-Category Scorecard ({rep.totalScore}/100 — {rep.performanceRating})
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {DAILY_SCORECARD_RUBRICS.map((rubric) => {
                          const val = (rep.scorecard as any)?.[rubric.key] || 0;
                          return (
                            <div key={rubric.key} className="text-center p-1.5 rounded-lg bg-slate-950 border border-white/5">
                              <span className="text-[10px] text-text-muted block truncate">{rubric.name.split(' ')[0]}</span>
                              <span className="text-sm font-black text-amber-400">{val}<span className="text-[10px] text-slate-500">/{rubric.maxScore}</span></span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Editor Feedback */}
                  {rep.editorFeedback && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs space-y-1">
                      <p className="font-bold text-emerald-400 flex items-center gap-1">
                        <FiMessageSquare size={12} /> Managing Editor Feedback:
                      </p>
                      <p className="text-slate-300 italic whitespace-pre-line">{rep.editorFeedback}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 10-CATEGORY 100-POINT REVIEW MODAL */}
        {/* ------------------------------------------------------------- */}
        {selectedReport && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-slate-900 border-t sm:border border-white/15 w-full max-w-2xl rounded-t-3xl sm:rounded-3xl max-h-[95vh] sm:max-h-[88vh] flex flex-col shadow-2xl animate-fade-in">
              {/* Modal Header */}
              <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between flex-shrink-0">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-white">
                    Score & Review Assignment
                  </h3>
                  <p className="text-xs text-text-muted mt-0.5">
                    {selectedReport.employeeName} •{' '}
                    {selectedReport.trainingDay ? `Day ${selectedReport.trainingDay} • ` : ''}
                    {selectedReport.reportDate}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl bg-white/5"
                >
                  <FiX size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveReview} className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
                {/* Live Total Score Hero */}
                <div className="flex items-center justify-between bg-slate-950 p-4 rounded-2xl border border-white/10">
                  <div>
                    <span className="text-[10px] text-text-muted uppercase font-bold block">Live Total Score</span>
                    <span className={`text-3xl font-black ${getRatingColor(totalCurrentScore)}`}>
                      {totalCurrentScore}<span className="text-base text-slate-500">/100</span>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getRatingColor(totalCurrentScore)} bg-white/5 border border-white/10`}>
                      {getRatingLabel(totalCurrentScore)}
                    </span>
                  </div>
                </div>

                {/* 10 Scorecard Category Sliders */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                    <FiBarChart2 size={13} /> 10-Category Performance Breakdown
                  </h4>
                  {DAILY_SCORECARD_RUBRICS.map((rubric) => {
                    const currentVal = (scorecard as any)[rubric.key] || 0;
                    return (
                      <div key={rubric.key} className="bg-slate-950/60 p-3 rounded-xl border border-white/5">
                        <div className="flex items-center justify-between mb-1.5">
                          <div>
                            <span className="text-xs font-bold text-slate-200 block">{rubric.name}</span>
                            <span className="text-[10px] text-text-muted">{rubric.description}</span>
                          </div>
                          <span className="text-sm font-black text-amber-400 ml-2">
                            {currentVal}<span className="text-[10px] text-slate-500">/{rubric.maxScore}</span>
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max={rubric.maxScore}
                          step="1"
                          value={currentVal}
                          onChange={(e) => handleScorecardChange(rubric.key, Number(e.target.value))}
                          className="w-full accent-amber-500 cursor-pointer h-2"
                        />
                        <div className="flex justify-between text-[9px] text-slate-600 mt-0.5">
                          <span>0</span>
                          <span>{Math.round(rubric.maxScore / 2)}</span>
                          <span>{rubric.maxScore}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Review Decision */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Review Decision *
                  </label>
                  <select
                    value={reviewStatus}
                    onChange={(e: any) => setReviewStatus(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-white/10 text-white text-xs sm:text-sm font-bold focus:border-blue-500 focus:outline-none"
                  >
                    <option value="approved">✓ Approved — Day Complete</option>
                    <option value="reviewed">Reviewed — Satisfactory (No Day Completion)</option>
                    <option value="revision">⚠ Needs Revision — Resubmit Tomorrow</option>
                    <option value="retraining">❌ Remedial Training Required</option>
                  </select>
                </div>

                {/* Editor Feedback */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Managing Editor Notes & Next-Day Priorities
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Provide detailed feedback across the 10 categories. Include specific corrections, next-day priorities, and improvement focus areas..."
                    value={editorFeedback}
                    onChange={(e) => setEditorFeedback(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-white/10 text-white text-xs sm:text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Submit Buttons */}
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
                    {submittingReview ? 'Grading & Notifying...' : `Submit Score (${totalCurrentScore}/100)`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </div>
  );
}
