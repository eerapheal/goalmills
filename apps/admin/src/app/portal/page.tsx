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
import {
  GOALMILLS_TRAINING_MODULES,
  GOALMILLS_30_DAY_CURRICULUM,
  DAILY_SCORECARD_RUBRICS,
  PERFORMANCE_RATINGS,
  EDITORIAL_POLICIES,
} from '@/lib/trainingCurriculum';
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
  FiShare2,
  FiImage,
  FiBarChart2,
  FiMessageSquare,
  FiShield,
} from 'react-icons/fi';

type PortalTab =
  | 'daily_report'
  | 'scorecards'
  | 'training_checklist'
  | 'standup'
  | 'payroll_contract'
  | 'editorial_policies';

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
  const [trainingDay, setTrainingDay] = useState<number>(1);
  const [articleUrl, setArticleUrl] = useState('');
  const [xUrl, setXUrl] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [graphicUrl, setGraphicUrl] = useState('');
  const [source1, setSource1] = useState('');
  const [source2, setSource2] = useState('');
  const [tasksCompleted, setTasksCompleted] = useState('');
  const [sourcesUsed, setSourcesUsed] = useState('GoalMills Newsroom Wire, Opta Sports Data');
  const [blockers, setBlockers] = useState('None');
  const [learningTakeaway, setLearningTakeaway] = useState('');

  // Additional dynamic rows
  const [articles, setArticles] = useState<{ title: string; url: string; category: string }[]>([]);
  const [socialPosts, setSocialPosts] = useState<{ platform: string; url: string }[]>([]);
  const [mediaAssets, setMediaAssets] = useState<{ type: string; title: string; link: string }[]>([]);
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

        if (trainJson.success) {
          setTraining(trainJson.data);
          // Suggest next uncompleted day
          const completed = trainJson.data?.completedDays || [];
          const nextDay = completed.length < 30 ? completed.length + 1 : 30;
          setTrainingDay(nextDay);
        }
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

  const selectedDayCurriculum = GOALMILLS_30_DAY_CURRICULUM.find((d) => d.day === trainingDay);

  const handleSubmitDailyReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEmployee) return;

    try {
      setSubmittingReport(true);
      setSubmitSuccess(false);

      const validArticles = [
        ...(articleUrl ? [{ title: `Day ${trainingDay} Primary Article`, url: articleUrl, category: 'Football' }] : []),
        ...articles.filter((a) => a.title && a.url),
      ];

      const validSocial = [
        ...(xUrl ? [{ platform: 'X', url: xUrl }] : []),
        ...(facebookUrl ? [{ platform: 'Facebook', url: facebookUrl }] : []),
        ...(instagramUrl ? [{ platform: 'Instagram', url: instagramUrl }] : []),
        ...(tiktokUrl ? [{ platform: 'TikTok', url: tiktokUrl }] : []),
        ...(youtubeUrl ? [{ platform: 'YouTube', url: youtubeUrl }] : []),
        ...socialPosts.filter((s) => s.url),
      ];

      const validMedia = [
        ...(graphicUrl ? [{ type: 'canva_graphic', title: `Day ${trainingDay} Canva Graphic`, link: graphicUrl }] : []),
        ...mediaAssets.filter((m) => m.link),
      ];

      const res = await fetch('/api/reports/daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: currentEmployee._id,
          employeeName: currentEmployee.fullName,
          reportDate,
          trainingDay,
          lessonStudied: selectedDayCurriculum?.title || `Day ${trainingDay}`,
          articleUrl,
          xUrl,
          facebookUrl,
          instagramUrl,
          tiktokUrl,
          youtubeUrl,
          graphicUrl,
          source1,
          source2,
          tasksCompleted,
          articles: validArticles,
          socialPosts: validSocial,
          mediaAssets: validMedia,
          sourcesUsed: sourcesUsed || `${source1}, ${source2}`,
          learningTakeaway,
          blockers,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSubmitSuccess(true);
        setTasksCompleted('');
        setLearningTakeaway('');
        setArticleUrl('');
        setXUrl('');
        setFacebookUrl('');
        setInstagramUrl('');
        setTiktokUrl('');
        setYoutubeUrl('');
        setGraphicUrl('');
        setSource1('');
        setSource2('');
        setArticles([]);
        setSocialPosts([]);
        setMediaAssets([]);
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

  const completedDaysCount = training?.completedDays?.length || 0;
  const isCertified = training?.isCertified || (completedDaysCount >= 30 && currentEmployee?.status !== 'training');
  const progressPercent = training?.overallProgressPercent || Math.round((completedDaysCount / 30) * 100);

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

                  {/* Badges */}
                  {isCertified ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] sm:text-xs font-black uppercase flex items-center gap-1">
                      <FiAward size={13} /> Certified Specialist
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] sm:text-xs font-black uppercase flex items-center gap-1 animate-pulse">
                      <FiClock size={13} /> On Training (Day {completedDaysCount + 1}/30)
                    </span>
                  )}
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
                Training Progress
              </span>
              <span className="text-sm sm:text-base font-black text-amber-400 mt-0.5 block">
                {completedDaysCount}/30 Days ({progressPercent}%)
              </span>
            </div>

            <div className="bg-slate-900/60 p-2.5 sm:p-3 rounded-xl border border-white/5">
              <span className="text-[10px] sm:text-xs text-text-muted font-bold block uppercase">
                Submitted Reports
              </span>
              <span className="text-sm sm:text-base font-black text-white mt-0.5 block">
                {reports.length} Logs
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
                <span>{currentEmployee.appointmentSigned ? '✓ Signed & Active' : 'Sign Now'}</span>
                <FiExternalLink size={11} />
              </Link>
            </div>
          </div>

          {/* Unsigned Contract Alert Banner */}
          {!currentEmployee.appointmentSigned && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                  <FiAlertCircle size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Action Required: Official Appointment Letter Unsigned</p>
                  <p className="text-[11px] text-slate-300">Please review and digitally sign your official employment & training contract.</p>
                </div>
              </div>
              <Link
                href={`/admin/employees/${currentEmployee._id}/appointment`}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md hover:from-amber-400 hover:to-amber-500 transition-all text-center flex-shrink-0"
              >
                Sign Contract Now &rarr;
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Navigation Tabs */}
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
              <option value="scorecards">📊 Graded Scorecards & Feedback</option>
              <option value="training_checklist">🎓 30-Day Training Modules</option>
              <option value="editorial_policies">⚖️ Editorial Policies & Standards</option>
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
        <div className="hidden sm:flex items-center gap-2 p-1.5 bg-slate-900/80 rounded-2xl border border-white/10 backdrop-blur-md">
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
            onClick={() => setActiveTab('scorecards')}
            className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-300 ${
              activeTab === 'scorecards'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FiBarChart2 size={15} />
            <span>Graded Scorecards ({reports.filter((r) => (r.totalScore || 0) > 0).length})</span>
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
            onClick={() => setActiveTab('editorial_policies')}
            className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-300 ${
              activeTab === 'editorial_policies'
                ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-lg shadow-red-500/25'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FiShield size={15} />
            <span>Editorial Policies</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('standup')}
            className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-300 ${
              activeTab === 'standup'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
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
                ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-lg shadow-slate-700/25'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FiFileText size={15} />
            <span>Contract & Pay Slips</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: SUBMIT DAILY REPORT (30-Day Academy Submission Pipeline) */}
      {/* ========================================================================= */}
      {activeTab === 'daily_report' && (
        <div className="glass-card p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-white/10 shadow-2xl space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-base sm:text-xl font-black text-white flex items-center gap-2">
                <FiCheckSquare className="text-blue-400" /> End-of-Day Content Production Submission
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                Submit your daily articles, graphics, social links, video clips, and source trail for Managing Editor grading
              </p>
            </div>

            {/* Daily Minimum Reminder Pill */}
            <span className="px-3 py-1 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs font-bold whitespace-nowrap">
              Daily Target: 2 Articles • 2 Graphics • 5 Social • 1 Video
            </span>
          </div>

          {submitSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-bold flex items-center gap-2 animate-fade-in">
              <FiCheckCircle size={18} />
              <span>
                Daily report submitted successfully to database! Managing Editor Raphael will score your submission across the 10-category rubric.
              </span>
            </div>
          )}

          <form onSubmit={handleSubmitDailyReport} className="space-y-5">
            {/* Top Config Row: Report Date & Training Day Selector */}
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
                  Training Curriculum Day (1 – 30) *
                </label>
                <select
                  value={trainingDay}
                  onChange={(e) => setTrainingDay(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs sm:text-sm font-bold focus:border-amber-500 focus:outline-none"
                >
                  {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => {
                    const c = GOALMILLS_30_DAY_CURRICULUM.find((item) => item.day === d);
                    const isDone = training?.completedDays?.includes(d);
                    return (
                      <option key={d} value={d}>
                        Day {d}: {c?.title} {isDone ? '✓ (Completed)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Selected Day Curriculum Focus Card */}
            {selectedDayCurriculum && (
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-amber-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-400 uppercase">
                    Day {selectedDayCurriculum.day} Curriculum Assignment:
                  </span>
                  <span className="text-[11px] text-text-muted">Week {selectedDayCurriculum.week}</span>
                </div>
                <h4 className="text-sm font-bold text-white">{selectedDayCurriculum.title}</h4>
                <p className="text-xs text-slate-300">
                  <strong>Production Requirement:</strong>{' '}
                  {selectedDayCurriculum.dailyOutput ||
                    selectedDayCurriculum.production?.join('; ') ||
                    'Standard daily newsroom assignment'}
                </p>
                <p className="text-[11px] text-slate-400">
                  <strong>Standup Focus:</strong>{' '}
                  {selectedDayCurriculum.standupFocus ||
                    selectedDayCurriculum.objectives?.join(' • ') ||
                    selectedDayCurriculum.moduleTitle}
                </p>
              </div>
            )}

            {/* Direct URL Inputs for Core Deliverables */}
            <div className="space-y-3 pt-2 border-t border-white/10">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                Primary Deliverable Links (Articles, Graphics, Video & Socials)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    📰 Published Article URL (Website CMS) *
                  </label>
                  <input
                    type="url"
                    placeholder="https://goalmills-web.vercel.app/news/..."
                    value={articleUrl}
                    onChange={(e) => setArticleUrl(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    🎨 Canva Graphic URL (View / Share link) *
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.canva.com/design/..."
                    value={graphicUrl}
                    onChange={(e) => setGraphicUrl(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    𝕏 (Twitter) Live Post URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://x.com/GoalMills/status/..."
                    value={xUrl}
                    onChange={(e) => setXUrl(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Facebook Post URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://facebook.com/..."
                    value={facebookUrl}
                    onChange={(e) => setFacebookUrl(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Instagram Post / Reel URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://instagram.com/p/..."
                    value={instagramUrl}
                    onChange={(e) => setInstagramUrl(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    TikTok Video URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://tiktok.com/@goalmills/video/..."
                    value={tiktokUrl}
                    onChange={(e) => setTiktokUrl(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:border-pink-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    YouTube Shorts / Video URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://youtube.com/shorts/..."
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Source Verification Trail (Mandatory 2 independent sources) */}
            <div className="space-y-3 pt-2 border-t border-white/10">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                  Mandatory Source Verification Trail (Min 2 Verified Sources)
                </span>
                <p className="text-[11px] text-text-muted mt-0.5">
                  Tier-1: Club statements, official press conferences. Tier-2: Fabrizio Romano, Ornstein, BBC, Reuters.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Source 1 (Primary Verification Source) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Official Manchester United Press Release / Match Post-Game Audio"
                    value={source1}
                    onChange={(e) => setSource1(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Source 2 (Secondary Corroborating Source) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fabrizio Romano Tier-1 Report / Opta Sports Match Data"
                    value={source2}
                    onChange={(e) => setSource2(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Work Completed Summary */}
            <div className="pt-2 border-t border-white/10">
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Summary of Work Completed Today *
              </label>
              <textarea
                rows={4}
                required
                placeholder="Detail the match previews, breaking news angles, SEO optimization, social engagement hooks, and Canva designs executed today..."
                value={tasksCompleted}
                onChange={(e) => setTasksCompleted(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-950 border border-white/10 text-white text-xs sm:text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Additional Output Links (Optional expansion) */}
            <div className="space-y-2.5 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Additional Article Links (If produced &gt; 1 article today)
                </span>
                <button
                  type="button"
                  onClick={handleAddArticle}
                  className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <FiPlus size={14} /> Add Extra Article
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
                  <button
                    type="button"
                    onClick={() => setArticles(articles.filter((_, i) => i !== idx))}
                    className="sm:col-span-1 p-2 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Learning & Blockers Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/10">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Key Learning Takeaway (Curriculum Reflection) *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="What new journalistic technique, Canva design tip, or SEO tactic did you learn today?"
                  value={learningTakeaway}
                  onChange={(e) => setLearningTakeaway(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Blockers & Editorial Questions for 5:00 PM Standup
                </label>
                <textarea
                  rows={2}
                  placeholder="Any technical issues, fact-checking obstacles, or questions for Raphael?"
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
                {submittingReport ? 'Submitting to Database...' : `Submit Day ${trainingDay} Assignment`}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: GRADED SCORECARDS & MANAGING EDITOR FEEDBACK */}
      {/* ========================================================================= */}
      {activeTab === 'scorecards' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-xl font-black text-white flex items-center gap-2">
                <FiBarChart2 className="text-emerald-400" /> Graded Daily Assignments & Scorecards
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                Review your 100-point rubric breakdown and Managing Editor feedback for each submitted training day
              </p>
            </div>
          </div>

          {reports.length === 0 ? (
            <div className="glass-card p-12 rounded-3xl border border-white/10 text-center space-y-3">
              <FiCheckSquare className="mx-auto text-slate-600" size={40} />
              <p className="text-slate-400 font-bold">No daily reports submitted yet.</p>
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
                    className="glass-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/10 shadow-lg space-y-4"
                  >
                    {/* Top Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-xs uppercase">
                            Day {rep.trainingDay || '—'}
                          </span>
                          <h3 className="font-bold text-white text-sm sm:text-base">
                            {rep.lessonStudied || `Report for ${rep.reportDate}`}
                          </h3>
                        </div>
                        <p className="text-xs text-text-muted mt-0.5">
                          Submitted on <strong>{rep.reportDate}</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {hasScore && (() => {
                          const total = rep.totalScore || 0;
                          const ratingConfig = PERFORMANCE_RATINGS.find(
                            (p) => total >= p.min && total <= p.max
                          );
                          const ratingBadge = ratingConfig?.badge || rep.performanceRating || 'Graded';
                          const ratingClass =
                            ratingConfig?.color === 'emerald'
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : ratingConfig?.color === 'blue'
                              ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                              : ratingConfig?.color === 'amber'
                              ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                              : ratingConfig?.color === 'orange'
                              ? 'bg-orange-500/15 text-orange-400 border-orange-500/30'
                              : 'bg-red-500/15 text-red-400 border-red-500/30';

                          return (
                            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${ratingClass}`}>
                              {ratingBadge} • {total}/100
                            </span>
                          );
                        })()}

                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isApproved
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : isPending
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}>
                          {rep.reviewStatus}
                        </span>
                      </div>
                    </div>

                    {/* 10-Category Scorecard Breakdown (if graded) */}
                    {rep.scorecard && (
                      <div className="p-3 sm:p-4 bg-slate-950/80 rounded-xl border border-white/5 space-y-2">
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                          📊 10-Category Scorecard Breakdown:
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                          {DAILY_SCORECARD_RUBRICS.map((rubric) => {
                            const val = (rep.scorecard as any)?.[rubric.key] || 0;
                            return (
                              <div key={rubric.key} className="text-center p-2 rounded-lg bg-slate-900 border border-white/5">
                                <span className="text-[10px] text-text-muted block truncate">{rubric.name.split(' ')[0]}</span>
                                <span className="text-sm font-black text-amber-400">{val}<span className="text-[10px] text-slate-500">/{rubric.maxScore}</span></span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Managing Editor Feedback */}
                    {rep.editorFeedback && (
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs space-y-1">
                        <p className="font-bold text-emerald-400 flex items-center gap-1">
                          <FiMessageSquare size={12} /> Managing Editor Feedback (Raphael Ekpenisi):
                        </p>
                        <p className="text-slate-300 italic whitespace-pre-line">{rep.editorFeedback}</p>
                      </div>
                    )}

                    {/* Submitted Links Chips */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {rep.articleUrl && (
                        <a href={rep.articleUrl} target="_blank" rel="noreferrer" className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[11px] font-bold hover:bg-blue-500/20 flex items-center gap-1">
                          📰 Article <FiExternalLink size={10} />
                        </a>
                      )}
                      {rep.graphicUrl && (
                        <a href={rep.graphicUrl} target="_blank" rel="noreferrer" className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] font-bold hover:bg-amber-500/20 flex items-center gap-1">
                          🎨 Canva <FiExternalLink size={10} />
                        </a>
                      )}
                      {rep.xUrl && (
                        <a href={rep.xUrl} target="_blank" rel="noreferrer" className="px-2.5 py-1 rounded-lg bg-slate-500/10 text-slate-300 border border-slate-500/20 text-[11px] font-bold hover:bg-slate-500/20 flex items-center gap-1">
                          𝕏 Post <FiExternalLink size={10} />
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
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: 30-DAY TRAINING CURRICULUM MODULES */}
      {/* ========================================================================= */}
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
                journalism, verification, Canva design, video creation, SEO, and social distribution.
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

      {/* ========================================================================= */}
      {/* TAB 4: 5:00 PM STANDUP */}
      {/* ========================================================================= */}
      {activeTab === 'standup' && (
        <div className="glass-card p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-white/10 shadow-2xl space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-base sm:text-xl font-black text-white flex items-center gap-2">
                <FiVideo className="text-emerald-400" /> Daily 5:00 PM WAT Newsroom Stand-Up
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                Mandatory Google Meet daily review with Managing Editor Raphael Ekpenisi
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

          <div className="bg-slate-900/60 p-4 sm:p-6 rounded-2xl border border-white/5 space-y-4">
            <h3 className="text-xs font-bold text-amber-400 uppercase">
              The 4 Questions Every Trainee Must Answer in Standup:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-slate-950/80 rounded-xl border border-white/5 text-xs">
                <span className="font-bold text-amber-400 block">Question 1:</span>
                <span className="text-slate-200">What did I study today?</span>
              </div>
              <div className="p-3 bg-slate-950/80 rounded-xl border border-white/5 text-xs">
                <span className="font-bold text-blue-400 block">Question 2:</span>
                <span className="text-slate-200">What did I create today?</span>
              </div>
              <div className="p-3 bg-slate-950/80 rounded-xl border border-white/5 text-xs">
                <span className="font-bold text-emerald-400 block">Question 3:</span>
                <span className="text-slate-200">What did I publish today?</span>
              </div>
              <div className="p-3 bg-slate-950/80 rounded-xl border border-white/5 text-xs">
                <span className="font-bold text-pink-400 block">Question 4:</span>
                <span className="text-slate-200">What was my biggest challenge today?</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: CONTRACTS & PAY SLIPS */}
      {/* ========================================================================= */}
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
      {/* ========================================================================= */}
      {/* TAB: EDITORIAL POLICIES & STANDARDS */}
      {/* ========================================================================= */}
      {activeTab === 'editorial_policies' && (
        <div className="space-y-6 animate-fade-in">
          {/* Header Card */}
          <div className="glass-card p-5 sm:p-7 rounded-3xl border border-amber-500/30 space-y-3 bg-gradient-to-br from-slate-900/90 via-slate-950/90 to-amber-950/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-wider mb-2">
                  <FiShield /> Official Newsroom Standards
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  GoalMills Editorial Policies & Publishing Guidelines
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
                  Mandatory guidelines for all sports journalists, creators, and editors. Adherence to these standards protects GoalMills credibility and ensures journalistic excellence.
                </p>
              </div>
              <div className="flex-shrink-0">
                <span className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs font-bold text-amber-400">
                  Version 2026.1 • Active
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Approval Policy */}
            <div className="glass-card p-5 sm:p-6 rounded-3xl border border-white/10 space-y-4">
              <h3 className="text-sm sm:text-base font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <FiCheckCircle className="text-amber-400" /> 1. Editorial Approval Policy
              </h3>
              <div className="space-y-3">
                {EDITORIAL_POLICIES.approvalPolicy.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/5 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed font-medium">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Copyright & Fair Use */}
            <div className="glass-card p-5 sm:p-6 rounded-3xl border border-white/10 space-y-4">
              <h3 className="text-sm sm:text-base font-black text-red-400 uppercase tracking-wider flex items-center gap-2">
                <FiAlertCircle className="text-red-400" /> 2. Copyright & Fair-Use Rules
              </h3>
              <div className="space-y-3">
                {EDITORIAL_POLICIES.copyrightRule.map((rule, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-950/70 border border-red-500/10 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-lg bg-red-500/20 text-red-400 font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      ✕
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed font-medium">{rule}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Source Hierarchy */}
            <div className="glass-card p-5 sm:p-6 rounded-3xl border border-white/10 space-y-4">
              <h3 className="text-sm sm:text-base font-black text-blue-400 uppercase tracking-wider flex items-center gap-2">
                <FiBookOpen className="text-blue-400" /> 3. Source Verification Hierarchy
              </h3>
              <div className="space-y-3">
                {EDITORIAL_POLICIES.sourcePolicy.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-950/70 border border-blue-500/10 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      T{idx + 1}
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed font-medium">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Correction Policy */}
            <div className="glass-card p-5 sm:p-6 rounded-3xl border border-white/10 space-y-4">
              <h3 className="text-sm sm:text-base font-black text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <FiClock className="text-emerald-400" /> 4. Five-Step Correction Protocol
              </h3>
              <div className="space-y-3">
                {EDITORIAL_POLICIES.correctionPolicy.map((step, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-950/70 border border-emerald-500/10 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed font-medium">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 5. Editorial Mistake Database Categories */}
          <div className="glass-card p-5 sm:p-6 rounded-3xl border border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                  <FiAlertCircle className="text-amber-400" /> Monitored Editorial Mistake Categories
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Submissions and published articles are audited against these 16 error classifications.
                </p>
              </div>
              <span className="text-xs font-bold text-slate-400 bg-white/5 px-3 py-1 rounded-xl w-fit">
                {EDITORIAL_POLICIES.mistakeDatabaseCategories.length} Categories
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              {EDITORIAL_POLICIES.mistakeDatabaseCategories.map((cat, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-slate-950/80 border border-white/5 flex items-center gap-2 text-xs text-slate-300 font-semibold"
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                  <span className="truncate">{cat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
