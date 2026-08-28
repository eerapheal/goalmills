'use client';

import { useState, useEffect } from 'react';
import AdminNavBar from '@/components/admin/AdminNavBar';
import GoalmillsLoader from '@/components/GoalmillsLoader';
import { StandupMeeting, Employee } from '@goalmills/types';
import {
  FiCalendar,
  FiVideo,
  FiCheckCircle,
  FiClock,
  FiUserCheck,
  FiUserX,
  FiPlus,
  FiExternalLink,
  FiUsers,
} from 'react-icons/fi';

export default function StandupAdminPage() {
  const [standups, setStandups] = useState<StandupMeeting[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // New Standup Form State
  const [meetingDate, setMeetingDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('5:00 PM – 5:30 PM WAT');
  const [meetUrl, setMeetUrl] = useState('https://meet.google.com/goalmills-newsroom');
  const [editorialPrioritiesInput, setEditorialPrioritiesInput] = useState(
    '1. Major Football Transfer Breaking News\n2. Matchday 4 Match Previews\n3. Canva Matchday Scorecards'
  );
  const [submitting, setSubmitting] = useState(false);

  const fetchStandups = async () => {
    try {
      setLoading(true);
      const [standupRes, empRes] = await Promise.all([
        fetch('/api/standups'),
        fetch('/api/admin/employees'),
      ]);

      const sJson = await standupRes.json();
      const eJson = await empRes.json();

      if (sJson.success) setStandups(sJson.data);
      if (eJson.success) setEmployees(eJson.data);
    } catch (err) {
      console.error('Error loading standups:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStandups();
  }, []);

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const priorities = editorialPrioritiesInput
        .split('\n')
        .map((p) => p.trim())
        .filter(Boolean);

      const res = await fetch('/api/standups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meetingDate,
          time,
          meetUrl,
          editorialPriorities: priorities,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setShowScheduleModal(false);
        fetchStandups();
      }
    } catch (err) {
      console.error('Error scheduling standup:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 pt-[85px] sm:pt-[95px] text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        <AdminNavBar />

        {/* Header & Quick Action */}
        <div className="glass-card p-6 rounded-3xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xl">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <FiCalendar className="text-amber-400" /> Daily Newsroom Stand-Up (5:00 PM WAT)
            </h1>
            <p className="text-xs text-text-muted mt-0.5">
              Review daily content, address corrections, assign priorities, and track newsroom attendance
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={meetUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20"
            >
              <FiVideo size={16} />
              <span>Launch Google Meet</span>
              <FiExternalLink size={12} />
            </a>

            <button
              onClick={() => setShowScheduleModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-500/20"
            >
              <FiPlus size={16} />
              <span>Create Daily Standup</span>
            </button>
          </div>
        </div>

        {/* Standups List */}
        {loading ? (
          <div className="p-12 flex justify-center">
            <GoalmillsLoader
              size="md"
              label="Newsroom Stand-Up Desk"
              sublabel="Fetching 5:00 PM WAT roll-call & meeting logs..."
            />
          </div>
        ) : standups.length === 0 ? (
          <div className="glass-card p-12 rounded-3xl border border-white/10 text-center space-y-3">
            <FiCalendar className="mx-auto text-slate-600" size={40} />
            <p className="text-slate-400 font-bold">No stand-up meetings scheduled yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {standups.map((meeting) => (
              <div
                key={meeting._id}
                className="glass-card p-6 rounded-3xl border border-white/10 shadow-lg space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-black">
                      <FiVideo size={22} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">
                        Daily Stand-up • {meeting.meetingDate}
                      </h3>
                      <p className="text-xs text-text-muted flex items-center gap-2 mt-0.5">
                        <span className="text-amber-400 font-semibold">{meeting.time}</span>
                        <span>• Host: {meeting.hostName}</span>
                      </p>
                    </div>
                  </div>

                  <a
                    href={meeting.meetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white"
                  >
                    <span>Join Meet Link</span>
                    <FiExternalLink size={11} />
                  </a>
                </div>

                {/* Grid: Agenda & Attendees */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs sm:text-sm">
                  {/* Priorities & Agenda */}
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-950/60 rounded-2xl border border-white/5 space-y-2">
                      <h4 className="font-bold text-amber-400 text-xs uppercase tracking-wider">
                        Editorial Priorities for Today
                      </h4>
                      <ul className="space-y-1.5 text-slate-300">
                        {meeting.editorialPriorities?.length > 0 ? (
                          meeting.editorialPriorities.map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-amber-400 font-bold">•</span>
                              <span>{item}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-text-muted italic">Standard daily newsroom coverage</li>
                        )}
                      </ul>
                    </div>

                    <div className="p-4 bg-slate-950/60 rounded-2xl border border-white/5 space-y-2">
                      <h4 className="font-bold text-blue-400 text-xs uppercase tracking-wider">
                        Stand-Up Agenda
                      </h4>
                      <ul className="space-y-1 text-slate-300">
                        {meeting.agenda?.map((a, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-blue-400 font-bold">{i + 1}.</span>
                            <span>{a}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Attendance Roll Call */}
                  <div className="p-4 bg-slate-950/60 rounded-2xl border border-white/5 space-y-3">
                    <h4 className="font-bold text-emerald-400 text-xs uppercase tracking-wider flex items-center justify-between">
                      <span>Staff Attendance Roll-Call</span>
                      <span className="text-text-muted font-normal">
                        {meeting.attendees?.length || 0} Members
                      </span>
                    </h4>

                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {meeting.attendees?.map((att, i) => {
                        const isPresent = att.status === 'present';
                        return (
                          <div
                            key={i}
                            className="p-2.5 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold">
                                {att.employeeName.slice(0, 1)}
                              </div>
                              <span className="font-semibold text-slate-200">{att.employeeName}</span>
                            </div>

                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                isPresent
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : 'bg-red-500/20 text-red-400'
                              }`}
                            >
                              {att.status}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Schedule Standup Modal */}
        {showScheduleModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-white/10 w-full max-w-lg rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
              <div>
                <h3 className="text-xl font-black text-white">Create Daily Stand-Up</h3>
                <p className="text-xs text-text-muted">
                  5:00 PM – 5:30 PM WAT Daily Newsroom Sync
                </p>
              </div>

              <form onSubmit={handleScheduleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Meeting Date</label>
                  <input
                    type="date"
                    required
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Google Meet URL</label>
                  <input
                    type="url"
                    required
                    value={meetUrl}
                    onChange={(e) => setMeetUrl(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Editorial Priorities (One per line)
                  </label>
                  <textarea
                    rows={4}
                    value={editorialPrioritiesInput}
                    onChange={(e) => setEditorialPrioritiesInput(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowScheduleModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-500/25 disabled:opacity-50"
                  >
                    {submitting ? 'Scheduling...' : 'Save & Notify Staff'}
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
