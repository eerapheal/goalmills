'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import GoalmillsLoader from '@/components/GoalmillsLoader';
import {
  Employee,
  DailyContentReport,
  EmployeeTrainingProgress,
  StandupMeeting,
  PerformanceScorecard,
  PayrollRecord,
  UserRole,
} from '@goalmills/types';
import { hasPermission } from '@/lib/rbac';
import { GOALMILLS_TRAINING_MODULES } from '@/lib/trainingCurriculum';
import {
  FiUserCheck,
  FiFileText,
  FiAward,
  FiCheckSquare,
  FiCalendar,
  FiDollarSign,
  FiVideo,
  FiExternalLink,
  FiCheckCircle,
  FiClock,
  FiPlus,
  FiTrash2,
  FiChevronDown,
  FiAlertCircle,
  FiEdit3,
  FiBookOpen,
  FiDownload,
} from 'react-icons/fi';

type PortalTab = 'daily_report' | 'training_checklist' | 'standup' | 'payroll_contract';

export default function StaffPortalPage() {
  const { data: session } = useSession();
  const userRole = (session?.user?.role as UserRole) || undefined;
  const canSwitchEmployee = hasPermission(userRole, 'employees:read');

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [training, setTraining] = useState<EmployeeTrainingProgress | null>(null);
  const [reports, setReports] = useState<DailyContentReport[]>([]);
  const [latestStandup, setLatestStandup] = useState<StandupMeeting | null>(null);
  const [evaluations, setEvaluations] = useState<PerformanceScorecard[]>([]);
  const [payroll, setPayroll] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<PortalTab>('daily_report');

  // Daily Submission Form State
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [tasksCompleted, setTasksCompleted] = useState('');
  const [sourcesUsed, setSourcesUsed] = useState('GoalMills Newsroom Wire, Opta Sports Data');
  const [blockers, setBlockers] = useState('None');
  const [learningTakeaway, setLearningTakeaway] = useState('');
  const [articles, setArticles] = useState<{ title: string; url: string; category: string }[]>([
    { title: '', url: '', category: 'Football' },
  ]);
  const [socialPosts, setSocialPosts] = useState<{ platform: string; url: string }[]>([
    { platform: 'X', url: '' },
  ]);
  const [mediaAssets, setMediaAssets] = useState<{ type: string; title: string; link: string }[]>([
    { type: 'canva_graphic', title: '', link: '' },
  ]);
  const [submittingReport, setSubmittingReport] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const fetchStaffData = async (empId?: string) => {
    try {
      setLoading(true);
      const empRes = await fetch('/api/admin/employees');
      const empJson = await empRes.json();

      if (empJson.success && empJson.data.length > 0) {
        setEmployees(empJson.data);
        const targetEmp = empId
          ? empJson.data.find((e: Employee) => e._id === empId) || empJson.data[0]
          : empJson.data[0];
        setCurrentEmployee(targetEmp);

        const [trainRes, repRes, standRes, evalRes, payRes] = await Promise.all([
          fetch(`/api/training?employeeId=${targetEmp._id}`),
          fetch(`/api/reports/daily?employeeId=${targetEmp._id}`),
          fetch('/api/standups'),
          fetch('/api/evaluations'),
          fetch(`/api/payroll?employeeId=${targetEmp._id}`),
        ]);

        const [trainJson, repJson, standJson, evalJson, payJson] = await Promise.all([
          trainRes.json(),
          repRes.json(),
          standRes.json(),
          evalRes.json(),
          payRes.json(),
        ]);

        if (trainJson.success) setTraining(trainJson.data);
        if (repJson.success) setReports(repJson.data);
        if (standJson.success && standJson.data.length > 0) setLatestStandup(standJson.data[0]);
        if (evalJson.success) {
          setEvaluations(
            evalJson.data.filter((e: PerformanceScorecard) => e.employeeId === targetEmp._id)
          );
        }
        if (payJson.success) setPayroll(payJson.data);
      }
    } catch (err) {
      console.error('Error loading staff portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, []);

  const handleSwitchEmployee = (empId: string) => {
    fetchStaffData(empId);
  };

  const handleToggleTask = async (moduleId: string, task: string, completed: boolean) => {
    if (!currentEmployee) return;
    try {
      const currentMod = training?.modules?.find((m) => m.moduleId === moduleId);
      const currentTasks = currentMod?.completedTasks || [];
      const updatedTasks = completed
        ? [...currentTasks, task]
        : currentTasks.filter((t) => t !== task);

      const modMeta = GOALMILLS_TRAINING_MODULES.find((m) => m.id === moduleId);
      const isComplete = modMeta ? updatedTasks.length >= modMeta.checklist.length : false;
      const status = isComplete
        ? 'completed'
        : updatedTasks.length > 0
          ? 'in_progress'
          : 'not_started';

      await fetch('/api/training', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: currentEmployee._id,
          moduleId,
          completedTasks: updatedTasks,
          status,
        }),
      });
      fetchStaffData(currentEmployee._id);
    } catch (err) {
      console.error('Error toggling training item:', err);
    }
  };

  const handleAddArticle = () => {
    setArticles([...articles, { title: '', url: '', category: 'Football' }]);
  };

  const handleAddSocial = () => {
    setSocialPosts([...socialPosts, { platform: 'X', url: '' }]);
  };

  const handleAddMedia = () => {
    setMediaAssets([...mediaAssets, { type: 'canva_graphic', title: '', link: '' }]);
  };

  const handleSubmitDailyReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEmployee) return;

    try {
      setSubmittingReport(true);
      setSubmitSuccess(false);

      const validArticles = articles.filter((a) => a.title && a.url);
      const validSocial = socialPosts.filter((s) => s.url);
      const validMedia = mediaAssets.filter((m) => m.link);

      const res = await fetch('/api/reports/daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: currentEmployee._id,
          employeeName: currentEmployee.fullName,
          reportDate,
          tasksCompleted,
          articles: validArticles,
          socialPosts: validSocial,
          mediaAssets: validMedia,
          sourcesUsed,
          learningTakeaway,
          blockers,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSubmitSuccess(true);
        setTasksCompleted('');
        setLearningTakeaway('');
        setArticles([{ title: '', url: '', category: 'Football' }]);
        setSocialPosts([{ platform: 'X', url: '' }]);
        setMediaAssets([{ type: 'canva_graphic', title: '', link: '' }]);
        fetchStaffData(currentEmployee._id);
      }
    } catch (err) {
      console.error('Error submitting daily report:', err);
    } finally {
      setSubmittingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <GoalmillsLoader
          size="fullscreen"
          label="GoalMills Staff Workspace"
          sublabel="Syncing trainee profile, curriculum checklist & daily assignments..."
        />
      </div>
    );
  }

  const progressPercent = training?.overallProgressPercent || 0;

  return (
    <div className="space-y-5 sm:space-y-6 text-white">
      {/* Top Profile & Active Staff Member Card */}
        {currentEmployee && (
          <div className="glass-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/10 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 sm:gap-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center text-slate-950 font-black text-xl sm:text-2xl shadow-lg shadow-amber-500/20 flex-shrink-0">
                  {currentEmployee.fullName.slice(0, 2)}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-lg sm:text-2xl font-black text-white">
                      {currentEmployee.fullName}
                    </h1>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] sm:text-xs font-bold uppercase">
                      {currentEmployee.status === 'training'
                        ? '⚡ 30-Day Trainee'
                        : currentEmployee.status}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-0.5">
                    {currentEmployee.jobTitle} • {currentEmployee.department}
                  </p>
                </div>
              </div>

              {/* Employee Switcher Dropdown (Managers & Admins only) */}
              {canSwitchEmployee && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted font-bold whitespace-nowrap hidden sm:inline">
                    Viewing Profile:
                  </span>
                  <div className="relative w-full sm:w-auto">
                    <select
                      value={currentEmployee._id}
                      onChange={(e) => handleSwitchEmployee(e.target.value)}
                      className="w-full appearance-none px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-xs sm:text-sm font-bold text-slate-200 focus:border-amber-500 focus:outline-none pr-8 shadow-inner"
                    >
                      {employees.map((e) => (
                        <option key={e._id} value={e._id}>
                          {e.fullName}
                        </option>
                      ))}
                    </select>
                    <FiChevronDown
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                      size={14}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-3 border-t border-white/5">
              <div className="bg-slate-900/60 p-2.5 sm:p-3 rounded-xl border border-white/5">
                <span className="text-[10px] sm:text-xs text-text-muted font-bold block uppercase">
                  Curriculum Progress
                </span>
                <span className="text-sm sm:text-base font-black text-amber-400 mt-0.5 block">
                  {progressPercent}% Completed
                </span>
              </div>

              <div className="bg-slate-900/60 p-2.5 sm:p-3 rounded-xl border border-white/5">
                <span className="text-[10px] sm:text-xs text-text-muted font-bold block uppercase">
                  Daily Reports
                </span>
                <span className="text-sm sm:text-base font-black text-white mt-0.5 block">
                  {reports.length} Submitted
                </span>
              </div>

              <div className="bg-slate-900/60 p-2.5 sm:p-3 rounded-xl border border-white/5">
                <span className="text-[10px] sm:text-xs text-text-muted font-bold block uppercase">
                  Monthly Stipend
                </span>
                <span className="text-sm sm:text-base font-black text-emerald-400 mt-0.5 block">
                  ₦{(currentEmployee.currentSalary || 30000).toLocaleString()}
                </span>
              </div>

              <div className="bg-slate-900/60 p-2.5 sm:p-3 rounded-xl border border-white/5">
                <span className="text-[10px] sm:text-xs text-text-muted font-bold block uppercase">
                  Appointment Contract
                </span>
                <Link
                  href={`/admin/employees/${currentEmployee._id}/appointment`}
                  className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1 mt-0.5"
                >
                  <span>{currentEmployee.appointmentSigned ? '✓ Signed' : 'Sign Now'}</span>
                  <FiExternalLink size={11} />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* Mobile Dropdown & Desktop Tab Controls */}
        {/* ------------------------------------------------------------- */}
        <div className="space-y-4">
          {/* Mobile Dropdown View Selector */}
          <div className="block sm:hidden">
            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
              Workspace Module
            </label>
            <div className="relative">
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value as PortalTab)}
                className="w-full appearance-none px-4 py-3 rounded-2xl bg-slate-900 border border-white/15 text-white font-bold text-sm focus:outline-none focus:border-amber-500 transition-colors"
              >
                <option value="daily_report">📝 Submit Daily Report</option>
                <option value="training_checklist">🎓 30-Day Training Modules</option>
                <option value="standup">📹 5:00 PM Newsroom Standup</option>
                <option value="payroll_contract">💼 Contract & Pay Slips</option>
              </select>
              <FiChevronDown
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                size={18}
              />
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <div className="hidden sm:flex items-center gap-2 p-1 bg-slate-900/80 rounded-2xl border border-white/10 backdrop-blur-md">
            <button
              type="button"
              onClick={() => setActiveTab('daily_report')}
              className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-300 ${
                activeTab === 'daily_report'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <FiCheckSquare size={15} />
              <span>Submit Daily Report</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('training_checklist')}
              className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-300 ${
                activeTab === 'training_checklist'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <FiAward size={15} />
              <span>30-Day Curriculum</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('standup')}
              className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-300 ${
                activeTab === 'standup'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <FiVideo size={15} />
              <span>5:00 PM Standup</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('payroll_contract')}
              className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-300 ${
                activeTab === 'payroll_contract'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <FiFileText size={15} />
              <span>Contract & Pay Slips</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Submit Daily Report */}
        {activeTab === 'daily_report' && (
          <div className="glass-card p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-white/10 shadow-2xl space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-base sm:text-xl font-black text-white flex items-center gap-2">
                  <FiCheckSquare className="text-blue-400" /> End-of-Day Content Production
                  Submission
                </h2>
                <p className="text-xs text-text-muted mt-0.5">
                  Submit articles, social posts, Canva graphics, and short video links produced
                  today
                </p>
              </div>
            </div>

            {submitSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-bold flex items-center gap-2 animate-fade-in">
                <FiCheckCircle size={18} />
                <span>
                  Daily content report submitted successfully! Editorial review is in progress.
                </span>
              </div>
            )}

            <form onSubmit={handleSubmitDailyReport} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Report Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={reportDate}
                    onChange={(e) => setReportDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs sm:text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Research Sources Used *
                  </label>
                  <input
                    type="text"
                    required
                    value={sourcesUsed}
                    onChange={(e) => setSourcesUsed(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs sm:text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Summary of Tasks Completed Today *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detail published sports match previews, social breaking news threads, Canva graphics created, and SEO optimization..."
                  value={tasksCompleted}
                  onChange={(e) => setTasksCompleted(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-white/10 text-white text-xs sm:text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Dynamic Articles Array */}
              <div className="space-y-2.5 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Published Website Articles
                  </span>
                  <button
                    type="button"
                    onClick={handleAddArticle}
                    className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    <FiPlus size={14} /> Add Article Link
                  </button>
                </div>
                {articles.map((art, idx) => (
                  <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                    <input
                      type="text"
                      placeholder="Article Headline"
                      value={art.title}
                      onChange={(e) => {
                        const next = [...articles];
                        next[idx].title = e.target.value;
                        setArticles(next);
                      }}
                      className="sm:col-span-6 p-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white"
                    />
                    <input
                      type="url"
                      placeholder="https://goalmills-web.vercel.app/news/..."
                      value={art.url}
                      onChange={(e) => {
                        const next = [...articles];
                        next[idx].url = e.target.value;
                        setArticles(next);
                      }}
                      className="sm:col-span-5 p-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white"
                    />
                    {articles.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setArticles(articles.filter((_, i) => i !== idx))}
                        className="sm:col-span-1 p-2 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Dynamic Social Media Array */}
              <div className="space-y-2.5 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Social Media Posts (X / Facebook / Instagram / TikTok)
                  </span>
                  <button
                    type="button"
                    onClick={handleAddSocial}
                    className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"
                  >
                    <FiPlus size={14} /> Add Social Link
                  </button>
                </div>
                {socialPosts.map((post, idx) => (
                  <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                    <select
                      value={post.platform}
                      onChange={(e) => {
                        const next = [...socialPosts];
                        next[idx].platform = e.target.value;
                        setSocialPosts(next);
                      }}
                      className="sm:col-span-3 p-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white"
                    >
                      <option value="X">X (Twitter)</option>
                      <option value="Facebook">Facebook</option>
                      <option value="Instagram">Instagram</option>
                      <option value="TikTok">TikTok</option>
                    </select>
                    <input
                      type="url"
                      placeholder="Post live link..."
                      value={post.url}
                      onChange={(e) => {
                        const next = [...socialPosts];
                        next[idx].url = e.target.value;
                        setSocialPosts(next);
                      }}
                      className="sm:col-span-8 p-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white"
                    />
                    {socialPosts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setSocialPosts(socialPosts.filter((_, i) => i !== idx))}
                        className="sm:col-span-1 p-2 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Dynamic Media Assets Array */}
              <div className="space-y-2.5 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Canva Graphics & Video Match Highlights
                  </span>
                  <button
                    type="button"
                    onClick={handleAddMedia}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                  >
                    <FiPlus size={14} /> Add Media Link
                  </button>
                </div>
                {mediaAssets.map((media, idx) => (
                  <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                    <select
                      value={media.type}
                      onChange={(e) => {
                        const next = [...mediaAssets];
                        next[idx].type = e.target.value;
                        setMediaAssets(next);
                      }}
                      className="sm:col-span-3 p-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white"
                    >
                      <option value="canva_graphic">Canva Graphic</option>
                      <option value="video_clip">Video Clip</option>
                      <option value="infographic">Match Infographic</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Asset Title / Caption"
                      value={media.title}
                      onChange={(e) => {
                        const next = [...mediaAssets];
                        next[idx].title = e.target.value;
                        setMediaAssets(next);
                      }}
                      className="sm:col-span-4 p-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white"
                    />
                    <input
                      type="url"
                      placeholder="Asset Link / Google Drive / Cloudinary..."
                      value={media.link}
                      onChange={(e) => {
                        const next = [...mediaAssets];
                        next[idx].link = e.target.value;
                        setMediaAssets(next);
                      }}
                      className="sm:col-span-4 p-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white"
                    />
                    {mediaAssets.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setMediaAssets(mediaAssets.filter((_, i) => i !== idx))}
                        className="sm:col-span-1 p-2 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/10">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Key Learning Takeaway
                  </label>
                  <textarea
                    rows={2}
                    placeholder="What new editorial technique, tool or insight did you apply today?"
                    value={learningTakeaway}
                    onChange={(e) => setLearningTakeaway(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Blockers / Editorial Questions
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Any technical or editorial challenges?"
                    value={blockers}
                    onChange={(e) => setBlockers(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={submittingReport}
                  className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all"
                >
                  {submittingReport ? 'Submitting Report...' : 'Submit End-of-Day Report'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: 30-Day Training Curriculum */}
        {activeTab === 'training_checklist' && (
          <div className="space-y-6 animate-fade-in">
            {/* Handbook & Operating SOPs Resource Banner */}
            <div className="glass-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-slate-900 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                  <FiBookOpen size={12} />
                  <span>Official Reference Manual</span>
                </div>
                <h3 className="text-sm sm:text-base font-black text-white">
                  GoalMills Sports Media Training Resources & Handbooks
                </h3>
                <p className="text-xs text-slate-300 max-w-2xl">
                  First Edition 2026 by Ekpenisi Erue Raphael. Access complete SOPs for sports
                  journalism, verification, Canva design, video creation, SEO, and social
                  distribution.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <Link
                  href="/admin/handbook"
                  className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all"
                >
                  <FiBookOpen size={14} />
                  <span>Read Handbook</span>
                </Link>
                <a
                  href="/api/admin/handbook/download"
                  download="GOALMILLS-Training-Resources-&-Handbooks.pdf"
                  className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/15 transition-all"
                >
                  <FiDownload size={14} />
                  <span>Download PDF</span>
                </a>
              </div>
            </div>

            {GOALMILLS_TRAINING_MODULES.map((mod, idx) => {
              const modProgress = training?.modules?.find((m) => m.moduleId === mod.id);
              const completedCount = modProgress?.completedTasks?.length || 0;
              const isDone =
                modProgress?.status === 'completed' ||
                (completedCount >= mod.checklist.length && mod.checklist.length > 0);

              return (
                <div
                  key={mod.id}
                  className="glass-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/10 shadow-xl space-y-4"
                >
                  <div className="border-b border-white/10 pb-3 flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                        Module {idx + 1} • {mod.category} ({mod.weightPercent}%)
                      </span>
                      <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                        {mod.title}
                      </h3>
                      <p className="text-xs text-text-muted mt-0.5">{mod.description}</p>
                    </div>
                    {isDone && (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold flex-shrink-0">
                        ✓ Completed
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Curriculum Tasks ({completedCount}/{mod.checklist.length}):
                    </span>
                    <div className="space-y-2">
                      {mod.checklist.map((taskStr: string, tIdx: number) => {
                        const isTaskDone = modProgress?.completedTasks?.includes(taskStr) || false;
                        return (
                          <button
                            key={tIdx}
                            type="button"
                            onClick={() => handleToggleTask(mod.id, taskStr, !isTaskDone)}
                            className={`w-full flex items-start gap-3 p-2.5 rounded-lg border text-left text-xs transition-all ${
                              isTaskDone
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300 font-medium line-through'
                                : 'bg-slate-950/40 border-white/5 text-slate-300 hover:border-white/20'
                            }`}
                          >
                            <span
                              className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded flex items-center justify-center text-xs ${
                                isTaskDone
                                  ? 'bg-emerald-500 text-slate-950 font-bold'
                                  : 'border border-slate-600'
                              }`}
                            >
                              {isTaskDone && '✓'}
                            </span>
                            <span>{taskStr}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 3: 5:00 PM Standup */}
        {activeTab === 'standup' && (
          <div className="glass-card p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-white/10 shadow-2xl space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-base sm:text-xl font-black text-white flex items-center gap-2">
                  <FiVideo className="text-emerald-400" /> Daily 5:00 PM WAT Newsroom Stand-Up
                </h2>
                <p className="text-xs text-text-muted mt-0.5">
                  Join Google Meet sync with managing editor Raphael Ekpenisi
                </p>
              </div>

              <a
                href={latestStandup?.meetUrl || 'https://meet.google.com/goalmills-newsroom'}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-emerald-600/30 transition-all"
              >
                <span>Launch Google Meet</span>
                <FiExternalLink size={16} />
              </a>
            </div>

            {latestStandup && (
              <div className="bg-slate-900/60 p-4 sm:p-6 rounded-2xl border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 uppercase">
                    Today's Meeting Brief
                  </span>
                  <span className="text-xs text-text-muted">
                    {latestStandup.meetingDate} • {latestStandup.time}
                  </span>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-300">
                    Editorial Priorities & Assignment Focus:
                  </p>
                  <ul className="space-y-1.5 text-xs text-slate-200">
                    {latestStandup.editorialPriorities?.map((p, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Contracts & Pay Slips */}
        {activeTab === 'payroll_contract' && (
          <div className="space-y-6 animate-fade-in">
            {currentEmployee && (
              <div className="glass-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/10 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <FiFileText size={22} />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      Employment & Training Contract
                    </h3>
                    <p className="text-xs text-text-muted">
                      30-Clause Appointment Letter & Digital e-Signature
                    </p>
                  </div>
                </div>

                <Link
                  href={`/admin/employees/${currentEmployee._id}/appointment`}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 text-center"
                >
                  {currentEmployee.appointmentSigned
                    ? 'View Signed Contract'
                    : 'Review & Sign Contract'}
                </Link>
              </div>
            )}

            {/* Payout History */}
            <div className="glass-card rounded-2xl sm:rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
              <div className="p-4 sm:p-5 border-b border-white/10">
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <FiDollarSign className="text-emerald-400" /> Allowance & Payout History
                </h3>
              </div>

              {payroll.length === 0 ? (
                <div className="p-8 text-center text-xs text-text-muted">
                  No payout records generated yet for this period.
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {payroll.map((p) => (
                    <div
                      key={p._id}
                      className="p-4 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <span className="font-bold text-white text-sm block">{p.period}</span>
                        <span className="text-text-muted">
                          Base: ₦{p.baseAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-emerald-400 block">
                          ₦{p.netPay.toLocaleString()}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            p.status === 'paid'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-amber-500/10 text-amber-400'
                          }`}
                        >
                          {p.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
    </div>
  );
}
