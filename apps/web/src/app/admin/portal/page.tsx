'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminNavBar from '@/components/admin/AdminNavBar';
import GoalmillsLoader from '@/components/GoalmillsLoader';
import {
  Employee,
  DailyContentReport,
  EmployeeTrainingProgress,
  StandupMeeting,
  PerformanceScorecard,
  PayrollRecord,
} from '@goalmills/types';
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
} from 'react-icons/fi';

export default function StaffPortalPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [training, setTraining] = useState<EmployeeTrainingProgress | null>(null);
  const [reports, setReports] = useState<DailyContentReport[]>([]);
  const [latestStandup, setLatestStandup] = useState<StandupMeeting | null>(null);
  const [evaluations, setEvaluations] = useState<PerformanceScorecard[]>([]);
  const [payroll, setPayroll] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Daily Submission Form State
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [tasksCompleted, setTasksCompleted] = useState('');
  const [sourcesUsedInput, setSourcesUsedInput] = useState('');
  const [engagementSummary, setEngagementSummary] = useState('');
  const [problemsEncountered, setProblemsEncountered] = useState('');
  const [lessonsLearned, setLessonsLearned] = useState('');

  const [articles, setArticles] = useState<{ title: string; url: string; category: string }[]>([
    { title: '', url: '', category: 'Football' },
  ]);
  const [socialPosts, setSocialPosts] = useState<
    { platform: 'X' | 'Facebook' | 'Instagram' | 'TikTok' | 'YouTube' | 'WhatsApp'; url: string }[]
  >([{ platform: 'X', url: '' }]);
  const [mediaAssets, setMediaAssets] = useState<
    { type: 'canva_graphic' | 'short_video' | 'youtube_video' | 'reel'; title: string; link: string }[]
  >([{ type: 'canva_graphic', title: '', link: '' }]);

  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportSuccessMsg, setReportSuccessMsg] = useState('');

  const fetchStaffData = async (employeeId?: string) => {
    try {
      setLoading(true);
      const empRes = await fetch('/api/admin/employees');
      const empJson = await empRes.json();

      if (empJson.success && empJson.data.length > 0) {
        setEmployees(empJson.data);
        const emp = employeeId
          ? empJson.data.find((e: any) => e._id === employeeId)
          : empJson.data[0];
        setCurrentEmployee(emp);

        if (emp) {
          const [trainRes, repRes, standupRes, evalRes, payRes] = await Promise.all([
            fetch(`/api/training?employeeId=${emp._id}`),
            fetch(`/api/reports/daily?employeeId=${emp._id}`),
            fetch('/api/standups'),
            fetch(`/api/evaluations?employeeId=${emp._id}`),
            fetch(`/api/payroll?employeeId=${emp._id}`),
          ]);

          const [tJson, rJson, sJson, evJson, pJson] = await Promise.all([
            trainRes.json(),
            repRes.json(),
            standupRes.json(),
            evalRes.json(),
            payRes.json(),
          ]);

          if (tJson.success) setTraining(tJson.data);
          if (rJson.success) setReports(rJson.data);
          if (sJson.success && sJson.data.length > 0) setLatestStandup(sJson.data[0]);
          if (evJson.success) setEvaluations(evJson.data);
          if (pJson.success) setPayroll(pJson.data);
        }
      }
    } catch (err) {
      console.error('Error fetching staff portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, []);

  const handleTaskToggle = async (moduleId: string, task: string, currentCompleted: string[]) => {
    if (!currentEmployee) return;
    try {
      const exists = currentCompleted.includes(task);
      const updated = exists
        ? currentCompleted.filter((t) => t !== task)
        : [...currentCompleted, task];

      const modItem = GOALMILLS_TRAINING_MODULES.find((c) => c.id === moduleId);
      const totalTasks = modItem ? modItem.checklist.length : 5;
      const isComplete = updated.length === totalTasks;

      await fetch('/api/training', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: currentEmployee._id,
          moduleId,
          completedTasks: updated,
          status: isComplete ? 'completed' : updated.length > 0 ? 'in_progress' : 'not_started',
        }),
      });

      fetchStaffData(currentEmployee._id);
    } catch (err) {
      console.error('Error updating task checklist:', err);
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEmployee) return;

    try {
      setSubmittingReport(true);
      setReportSuccessMsg('');

      const validArticles = articles.filter((a) => a.title.trim() && a.url.trim());
      const validSocial = socialPosts.filter((s) => s.url.trim());
      const validMedia = mediaAssets.filter((m) => m.title.trim() && m.link.trim());
      const sources = sourcesUsedInput
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch('/api/reports/daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: currentEmployee._id,
          employeeName: currentEmployee.fullName,
          reportDate,
          articles: validArticles,
          socialPosts: validSocial,
          mediaAssets: validMedia,
          sourcesUsed: sources,
          engagementSummary,
          problemsEncountered,
          lessonsLearned,
          tasksCompleted,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setReportSuccessMsg('Daily Content Report submitted successfully for editorial review!');
        setTasksCompleted('');
        setSourcesUsedInput('');
        setEngagementSummary('');
        setProblemsEncountered('');
        setLessonsLearned('');
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
    <div className="min-h-screen bg-background p-4 sm:p-6 pt-[85px] sm:pt-[95px] text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        <AdminNavBar />

        {/* Staff Switcher Header */}
        <div className="glass-card p-6 rounded-3xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-amber-500/20">
              {currentEmployee?.fullName.slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white">{currentEmployee?.fullName}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase">
                  {currentEmployee?.status === 'training' ? '⚡ 30-Day Trainee' : 'Staff Member'}
                </span>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                {currentEmployee?.jobTitle} • {currentEmployee?.department}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {employees.length > 1 && (
              <select
                value={currentEmployee?._id}
                onChange={(e) => fetchStaffData(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs font-bold text-slate-300 focus:outline-none"
              >
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    Switch to: {emp.fullName}
                  </option>
                ))}
              </select>
            )}

            <Link
              href={`/admin/employees/${currentEmployee?._id}/appointment`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-md"
            >
              <FiFileText size={14} />
              <span>{currentEmployee?.appointmentSigned ? 'View Signed Contract' : 'Sign Contract'}</span>
            </Link>
          </div>
        </div>

        {/* 5 PM Standup & Notification Banner */}
        {latestStandup && (
          <div className="glass-card p-5 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <FiVideo size={20} />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">
                  Daily Newsroom Stand-Up: {latestStandup.time} (Google Meet)
                </h3>
                <p className="text-xs text-emerald-300 mt-0.5">
                  Host: {latestStandup.hostName} • Review daily stories, Canva assets & assignments
                </p>
              </div>
            </div>

            <a
              href={latestStandup.meetUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md whitespace-nowrap"
            >
              <span>Join 5:00 PM Meet</span>
              <FiExternalLink size={12} />
            </a>
          </div>
        )}

        {/* Main Grid: Daily Report Submission & Training Checklist */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Daily Content Report Form */}
          <div className="lg:col-span-7 space-y-6">
            <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FiCheckSquare className="text-amber-400" /> End-of-Day Daily Content Submission
                </h2>
                <p className="text-xs text-text-muted mt-0.5">
                  Submit all published stories, social media posts, Canva graphics & video links for editorial review
                </p>
              </div>

              {reportSuccessMsg && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
                  <FiCheckCircle size={16} />
                  <span>{reportSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleReportSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Report Date *</label>
                  <input
                    type="date"
                    required
                    value={reportDate}
                    onChange={(e) => setReportDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Articles Published Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-blue-400">Articles Published Today</label>
                    <button
                      type="button"
                      onClick={() => setArticles([...articles, { title: '', url: '', category: 'Football' }])}
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-bold"
                    >
                      <FiPlus size={12} /> Add Article
                    </button>
                  </div>

                  {articles.map((art, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Article Headline"
                        value={art.title}
                        onChange={(e) => {
                          const copy = [...articles];
                          copy[idx].title = e.target.value;
                          setArticles(copy);
                        }}
                        className="flex-1 p-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:border-blue-500 focus:outline-none"
                      />
                      <input
                        type="url"
                        placeholder="https://goalmills.com/..."
                        value={art.url}
                        onChange={(e) => {
                          const copy = [...articles];
                          copy[idx].url = e.target.value;
                          setArticles(copy);
                        }}
                        className="flex-1 p-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:border-blue-500 focus:outline-none"
                      />
                      {articles.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setArticles(articles.filter((_, i) => i !== idx))}
                          className="p-2 text-slate-500 hover:text-red-400"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Social Posts Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-purple-400">Social Media Posts (X, FB, IG, TikTok, YouTube)</label>
                    <button
                      type="button"
                      onClick={() => setSocialPosts([...socialPosts, { platform: 'X', url: '' }])}
                      className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-bold"
                    >
                      <FiPlus size={12} /> Add Social Post
                    </button>
                  </div>

                  {socialPosts.map((post, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <select
                        value={post.platform}
                        onChange={(e: any) => {
                          const copy = [...socialPosts];
                          copy[idx].platform = e.target.value;
                          setSocialPosts(copy);
                        }}
                        className="p-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none"
                      >
                        <option value="X">X (Twitter)</option>
                        <option value="Facebook">Facebook</option>
                        <option value="Instagram">Instagram</option>
                        <option value="TikTok">TikTok</option>
                        <option value="YouTube">YouTube</option>
                        <option value="WhatsApp">WhatsApp</option>
                      </select>
                      <input
                        type="url"
                        placeholder="Post Direct URL"
                        value={post.url}
                        onChange={(e) => {
                          const copy = [...socialPosts];
                          copy[idx].url = e.target.value;
                          setSocialPosts(copy);
                        }}
                        className="flex-1 p-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:border-blue-500 focus:outline-none"
                      />
                      {socialPosts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setSocialPosts(socialPosts.filter((_, i) => i !== idx))}
                          className="p-2 text-slate-500 hover:text-red-400"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Canva Graphics & Videos */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-amber-400">Canva Graphics & Video Assets</label>
                    <button
                      type="button"
                      onClick={() => setMediaAssets([...mediaAssets, { type: 'canva_graphic', title: '', link: '' }])}
                      className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-bold"
                    >
                      <FiPlus size={12} /> Add Graphic / Video
                    </button>
                  </div>

                  {mediaAssets.map((media, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <select
                        value={media.type}
                        onChange={(e: any) => {
                          const copy = [...mediaAssets];
                          copy[idx].type = e.target.value;
                          setMediaAssets(copy);
                        }}
                        className="p-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none"
                      >
                        <option value="canva_graphic">Canva Graphic</option>
                        <option value="short_video">Short Video (Reel/TikTok)</option>
                        <option value="youtube_video">YouTube Video</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Asset Title"
                        value={media.title}
                        onChange={(e) => {
                          const copy = [...mediaAssets];
                          copy[idx].title = e.target.value;
                          setMediaAssets(copy);
                        }}
                        className="flex-1 p-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:border-blue-500 focus:outline-none"
                      />
                      <input
                        type="url"
                        placeholder="Canva / Drive / Video Link"
                        value={media.link}
                        onChange={(e) => {
                          const copy = [...mediaAssets];
                          copy[idx].link = e.target.value;
                          setMediaAssets(copy);
                        }}
                        className="flex-1 p-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:border-blue-500 focus:outline-none"
                      />
                      {mediaAssets.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setMediaAssets(mediaAssets.filter((_, i) => i !== idx))}
                          className="p-2 text-slate-500 hover:text-red-400"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Sources Used */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Fact-Checking & Sources Verified (One per line)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Official Premier League press release, Fabrizio Romano club confirmation..."
                    value={sourcesUsedInput}
                    onChange={(e) => setSourcesUsedInput(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Tasks Completed & Reflections */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Summary of Tasks Completed *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Detailed summary of all writing, social publishing, graphic design, and audience engagement completed today..."
                    value={tasksCompleted}
                    onChange={(e) => setTasksCompleted(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Problems Encountered</label>
                    <input
                      type="text"
                      placeholder="Any hurdles, delays or issues"
                      value={problemsEncountered}
                      onChange={(e) => setProblemsEncountered(e.target.value)}
                      className="w-full p-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Lessons Learned</label>
                    <input
                      type="text"
                      placeholder="New skills or takeaways today"
                      value={lessonsLearned}
                      onChange={(e) => setLessonsLearned(e.target.value)}
                      className="w-full p-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submittingReport}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-blue-500/25 disabled:opacity-50 transition-all"
                >
                  {submittingReport ? 'Submitting Report...' : 'Submit End-of-Day Report'}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Training Curriculum & Recent Reports */}
          <div className="lg:col-span-5 space-y-6">
            {/* 30-Day Training Progress Box */}
            <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <FiAward className="text-amber-400" /> 30-Day Training Checklist
                  </h3>
                  <p className="text-xs text-text-muted">Interactive Practical Curriculum</p>
                </div>
                <span className="text-sm font-black text-emerald-400">{progressPercent}%</span>
              </div>

              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                {GOALMILLS_TRAINING_MODULES.map((mod) => {
                  const userMod = training?.modules?.find((m) => m.moduleId === mod.id);
                  const completedTasks = userMod?.completedTasks || [];
                  const isDone = userMod?.status === 'completed';

                  return (
                    <div
                      key={mod.id}
                      className={`p-3.5 rounded-2xl border text-xs space-y-2 ${
                        isDone
                          ? 'bg-emerald-950/20 border-emerald-500/30'
                          : 'bg-slate-950/60 border-white/5'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-slate-200">{mod.title}</span>
                        <span className="text-[10px] text-amber-400">{mod.weightPercent}%</span>
                      </div>

                      <div className="space-y-1.5">
                        {mod.checklist.map((task, i) => {
                          const checked = completedTasks.includes(task);
                          return (
                            <label
                              key={i}
                              className="flex items-start gap-2 text-slate-300 hover:text-white cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => handleTaskToggle(mod.id, task, completedTasks)}
                                className="mt-0.5 rounded border-white/20 bg-slate-950 text-emerald-500 focus:ring-0"
                              />
                              <span className={checked ? 'line-through text-slate-500' : ''}>{task}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Submissions & Feedback */}
            <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4 shadow-2xl">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <FiCheckSquare className="text-blue-400" /> Recent Daily Reports
              </h3>

              {reports.length === 0 ? (
                <p className="text-xs text-text-muted italic">No previous daily reports submitted.</p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {reports.map((rep) => (
                    <div
                      key={rep._id}
                      className="p-3 bg-slate-950 rounded-2xl border border-white/5 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200">{rep.reportDate}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            rep.reviewStatus === 'approved'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}
                        >
                          {rep.reviewStatus}
                        </span>
                      </div>

                      {rep.editorScore && (
                        <p className="text-amber-400 font-bold">
                          Score: {rep.editorScore} / 10
                        </p>
                      )}
                      {rep.editorFeedback && (
                        <p className="text-slate-400 italic text-[11px]">
                          Editor Note: {rep.editorFeedback}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
