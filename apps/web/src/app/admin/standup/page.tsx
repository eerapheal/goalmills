'use client';

import { useState, useEffect } from 'react';
import AdminNavBar from '@/components/admin/AdminNavBar';
import GoalmillsLoader from '@/components/GoalmillsLoader';
import { StandupMeeting, StandupAttendee, Employee } from '@goalmills/types';
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
  FiX,
  FiChevronDown,
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
      console.error('Error fetching standups:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStandups();
  }, []);

  const handleCreateStandup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const priorities = editorialPrioritiesInput
        .split('\n')
        .map((p) => p.trim())
        .filter(Boolean);

      const initialAttendees = employees.map((emp) => ({
        employeeId: emp._id as string,
        employeeName: emp.fullName,
        status: 'present' as const,
      }));

      const res = await fetch('/api/standups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meetingDate,
          time,
          meetUrl,
          hostName: 'Ekpenisi Erue Raphael',
          editorialPriorities: priorities,
          attendees: initialAttendees,
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

  const handleToggleAttendance = async (
    meetingId: string,
    employeeId: string,
    currentStatus: string
  ) => {
    const meeting = standups.find((m) => m._id === meetingId);
    if (!meeting) return;

    const nextStatus = currentStatus === 'present' ? 'absent' : 'present';
    const updatedAttendees = (meeting.attendees || []).map((att: StandupAttendee) =>
      att.employeeId === employeeId ? { ...att, status: nextStatus as 'present' | 'absent' } : att
    );

    try {
      await fetch('/api/standups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...meeting,
          attendees: updatedAttendees,
        }),
      });

      setStandups((prev) =>
        prev.map((m) => (m._id === meetingId ? { ...m, attendees: updatedAttendees } : m))
      );
    } catch (err) {
      console.error('Error toggling attendance:', err);
    }
  };

  return (
    <div className="min-h-screen bg-background p-3.5 sm:p-6 pt-[80px] sm:pt-[95px] text-white">
      <div className="max-w-7xl mx-auto space-y-5 sm:space-y-6">
        <AdminNavBar />

        {/* Live Daily 5:00 PM Meeting Banner */}
        <div className="glass-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-xl shadow-lg shadow-emerald-500/10 flex-shrink-0">
              <FiVideo size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <h1 className="text-base sm:text-xl font-black text-white">
                  5:00 PM – 5:30 PM WAT Newsroom Stand-Up
                </h1>
              </div>
              <p className="text-xs text-emerald-300/80 mt-0.5">
                Mandatory daily editorial sync for all sports media officers, editors & trainees
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <a
              href="https://meet.google.com/goalmills-newsroom"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-lg shadow-emerald-600/30 w-full sm:w-auto"
            >
              <span>Launch Google Meet</span>
              <FiExternalLink size={14} />
            </a>

            <button
              onClick={() => setShowScheduleModal(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm uppercase tracking-wider transition-all w-full sm:w-auto"
            >
              <FiPlus size={16} />
              <span>Schedule</span>
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
          <div className="grid grid-cols-1 gap-5 sm:gap-6">
            {standups.map((meeting) => (
              <div
                key={meeting._id}
                className="glass-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/10 shadow-lg space-y-5"
              >
                {/* Meeting Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3 sm:pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-black flex-shrink-0">
                      <FiVideo size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base sm:text-lg">
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
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 font-bold text-xs transition-all w-fit"
                  >
                    <span>Join Link</span>
                    <FiExternalLink size={12} />
                  </a>
                </div>

                {/* Editorial Priorities */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Today's Editorial Priorities & Story Assignments:
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-200">
                    {meeting.editorialPriorities.map((item, idx) => (
                      <li
                        key={idx}
                        className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Attendance Roll-Call Chips */}
                <div className="space-y-2.5 pt-2 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <FiUsers size={14} /> Attendance Roll-Call (
                      {meeting.attendees?.filter((a: StandupAttendee) => a.status === 'present')
                        .length || 0}{' '}
                      / {meeting.attendees?.length || 0} Present)
                    </h4>
                    <span className="text-[11px] text-text-muted">Tap to toggle attendance</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {meeting.attendees?.map((att: StandupAttendee) => {
                      const isPresent = att.status === 'present';
                      return (
                        <button
                          key={att.employeeId}
                          type="button"
                          onClick={() =>
                            handleToggleAttendance(meeting._id!, att.employeeId, att.status)
                          }
                          className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold transition-all text-left ${
                            isPresent
                              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                              : 'bg-slate-900/40 border-white/5 text-slate-400 hover:border-white/20'
                          }`}
                        >
                          <span className="truncate">{att.employeeName}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold flex items-center gap-1 ${
                              isPresent
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-red-500/10 text-red-400'
                            }`}
                          >
                            {isPresent ? <FiUserCheck size={10} /> : <FiUserX size={10} />}
                            <span>{att.status}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* Responsive Schedule Standup Modal */}
        {/* ------------------------------------------------------------- */}
        {showScheduleModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-slate-900 border-t sm:border border-white/15 w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-5 sm:p-8 space-y-5 shadow-2xl animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-white">
                    Schedule 5:00 PM Standup
                  </h3>
                  <p className="text-xs text-text-muted">
                    Create daily roll-call and assign newsroom stories
                  </p>
                </div>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl bg-white/5"
                >
                  <FiX size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateStandup} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Meeting Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs sm:text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Meeting Time Slot *
                  </label>
                  <input
                    type="text"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs sm:text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Google Meet URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={meetUrl}
                    onChange={(e) => setMeetUrl(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs sm:text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Editorial Priorities (One per line)
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={editorialPrioritiesInput}
                    onChange={(e) => setEditorialPrioritiesInput(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs sm:text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
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
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                  >
                    {submitting ? 'Creating...' : 'Schedule Standup'}
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
