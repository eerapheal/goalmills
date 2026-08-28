'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { AppointmentLetterData } from '@goalmills/types';
import {
  FiArrowLeft,
  FiPrinter,
  FiCheckCircle,
  FiAlertCircle,
  FiPenTool,
  FiShield,
  FiFileText,
} from 'react-icons/fi';

export default function AppointmentLetterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<AppointmentLetterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [signatureInput, setSignatureInput] = useState('');
  const [agreeCheck, setAgreeCheck] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchAppointment = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/employees/${id}/appointment`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        if (json.data.employeeSignature) {
          setSignatureInput(json.data.employeeSignature);
          setAgreeCheck(true);
        }
      }
    } catch (err) {
      console.error('Error loading appointment letter:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointment();
  }, [id]);

  const handleSignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signatureInput.trim()) {
      setErrorMsg('Please type your full legal name as digital signature');
      return;
    }
    if (!agreeCheck) {
      setErrorMsg('You must check the acknowledgement agreement box');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');
      const res = await fetch(`/api/admin/employees/${id}/appointment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeSignature: signatureInput }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to sign appointment letter');
      }

      setSuccessMsg('Appointment letter signed and accepted successfully!');
      fetchAppointment();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to sign contract');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Loading Appointment Contract...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4">
        <p className="text-red-400 font-bold">Appointment contract not found.</p>
        <Link href="/admin/employees" className="px-4 py-2 bg-blue-600 rounded-xl text-xs font-bold">
          &larr; Back to Staff Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4 sm:px-6 pt-[85px] sm:pt-[95px] text-slate-100 print:bg-white print:text-black print:p-0 print:pt-0">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Actions Bar (Hidden when printing) */}
        <div className="flex items-center justify-between glass-card p-4 rounded-2xl border border-white/10 print:hidden">
          <Link
            href={`/admin/employees/${id}`}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white"
          >
            <FiArrowLeft size={14} /> Back to Employee Profile
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all"
            >
              <FiPrinter size={14} />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>

        {/* Official Document Sheet */}
        <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8 text-slate-200 print:bg-white print:border-0 print:shadow-none print:p-6 print:text-black">
          {/* Company Letterhead */}
          <div className="text-center border-b-2 border-amber-400/40 pb-6 space-y-1 print:border-black">
            <h1 className="text-3xl sm:text-4xl font-black tracking-wider text-amber-400 uppercase print:text-black">
              GOALMILLS
            </h1>
            <p className="text-xs sm:text-sm font-semibold tracking-wide text-slate-300 print:text-gray-700">
              {data.companyPhone} | {data.companyEmail} | {data.companyWebsite}
            </p>
            <div className="pt-2">
              <span className="inline-block px-4 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 font-extrabold text-xs tracking-widest uppercase print:border-black print:text-black">
                EMPLOYMENT & TRAINING APPOINTMENT LETTER
              </span>
            </div>
            <p className="text-xs text-slate-400 pt-1 print:text-gray-600">Date: {data.date}</p>
          </div>

          {/* Recipient Details */}
          <div className="space-y-1 bg-slate-950/60 p-4 rounded-2xl border border-white/5 print:bg-transparent print:border-0 print:p-0">
            <p className="text-xs text-text-muted uppercase font-bold tracking-wider">To:</p>
            <p className="text-base font-bold text-white print:text-black">{data.candidateName}</p>
            <p className="text-xs text-slate-300 print:text-gray-700">Address: {data.candidateAddress}</p>
            <p className="text-xs text-slate-300 print:text-gray-700">Email: {data.candidateEmail}</p>
            <p className="text-xs text-slate-300 print:text-gray-700">Phone: {data.candidatePhone}</p>
          </div>

          {/* Salutation & Opening */}
          <div className="space-y-4 leading-relaxed text-sm">
            <p className="font-bold text-amber-400 text-base print:text-black">
              Employment Appointment — {data.position}
            </p>
            <p>Dear {data.candidateName},</p>
            <p>
              We are pleased to offer you an appointment with GoalMills as a{' '}
              <strong className="text-white print:text-black">{data.position}</strong>, effective{' '}
              <strong className="text-white print:text-black">{data.startDate}</strong>.
            </p>
            <p>
              This appointment is intended to develop you into a capable member of the GoalMills sports media and
              digital publishing team. Your role will combine structured training with practical daily responsibilities
              in sports journalism, content creation, social media management, audience engagement, graphics,
              publishing, and digital audience growth.
            </p>
            <p>
              Your employment will begin with a structured 30-day GoalMills Sports Media Training Programme, during
              which you will learn and immediately apply the skills required for your position.
            </p>
          </div>

          {/* Clauses List */}
          <div className="space-y-6 text-sm divide-y divide-white/10 print:divide-gray-300">
            {/* Clause 1 */}
            <div className="pt-4 space-y-2">
              <h3 className="font-extrabold text-white text-base print:text-black">1. POSITION</h3>
              <ul className="list-disc list-inside space-y-1 text-slate-300 print:text-gray-800 text-xs sm:text-sm">
                <li><strong>Job Title:</strong> {data.position}</li>
                <li><strong>Department:</strong> {data.department}</li>
                <li><strong>Employment Start Date:</strong> {data.startDate}</li>
                <li><strong>Initial Training Period:</strong> {data.trainingPeriod}</li>
                <li><strong>Work Arrangement:</strong> {data.workArrangement}</li>
                <li><strong>Reports To:</strong> {data.reportsTo}</li>
                <li><strong>Primary Platform:</strong> GoalMills website and official social media platforms</li>
              </ul>
            </div>

            {/* Clause 2 */}
            <div className="pt-4 space-y-2">
              <h3 className="font-extrabold text-white text-base print:text-black">2. TRAINING PERIOD</h3>
              <p className="text-slate-300 print:text-gray-800">
                Your first month will be a structured 30-day practical training and onboarding period designed around:
              </p>
              <div className="p-3 bg-amber-400/10 rounded-xl border border-amber-400/20 font-bold text-center text-amber-400 print:border-black print:text-black">
                Learn &rarr; Create &rarr; Publish &rarr; Submit &rarr; Review &rarr; Improve
              </div>
              <p className="text-xs text-slate-300 print:text-gray-800">
                The training covers: Sports article writing, Sports research & Fact-checking, Journalism & editorial standards, SEO, Content planning, Breaking-news coverage, Matchday coverage, Social media, Community management, Canva graphic design, Short-form video (Reels, TikTok, Shorts), YouTube, Facebook, X, Audience growth, Analytics, Content repurposing, and GoalMills newsroom operations.
              </p>
            </div>

            {/* Clause 3 & 4 */}
            <div className="pt-4 space-y-2">
              <h3 className="font-extrabold text-white text-base print:text-black">3. TRAINING COMPENSATION</h3>
              <p className="text-slate-300 print:text-gray-800">
                For the initial 30-day training period: <strong className="text-white print:text-black">Training Salary: ₦{data.trainingSalary.toLocaleString()}</strong>.
                This amount will be paid for the first month of training. The training period is paid employment and not an unpaid internship.
              </p>
            </div>

            <div className="pt-4 space-y-2">
              <h3 className="font-extrabold text-white text-base print:text-black">4. STARTING SALARY AFTER TRAINING</h3>
              <p className="text-slate-300 print:text-gray-800">
                Following successful completion of the initial training period, your starting salary will be: <strong className="text-white print:text-black">₦{data.startingSalary.toLocaleString()} per month</strong>.
              </p>
            </div>

            {/* Clause 5 */}
            <div className="pt-4 space-y-2">
              <h3 className="font-extrabold text-white text-base print:text-black">5. FUTURE SALARY REVIEW</h3>
              <p className="text-slate-300 print:text-gray-800">
                GoalMills is an early-stage sports media business. Once GoalMills begins generating sustainable revenue through advertising, sponsorships, partnerships, and monetization, management intends to review employee compensation and renegotiate the salary accordingly.
              </p>
            </div>

            {/* Clause 16 & 17 */}
            <div className="pt-4 space-y-2">
              <h3 className="font-extrabold text-white text-base print:text-black">16. DAILY REPORTING & STAND-UP</h3>
              <p className="text-slate-300 print:text-gray-800">
                At the end of each working day, you must submit your daily content report including published articles, social posts, Canva graphics, video links, sources, problems encountered, and lessons learned.
              </p>
              <p className="text-slate-300 print:text-gray-800">
                You are required to attend the GoalMills daily newsroom stand-up from <strong className="text-white print:text-black">5:00 PM – 5:30 PM West Africa Time (WAT)</strong> on Google Meet.
              </p>
            </div>

            {/* Clause 18 */}
            <div className="pt-4 space-y-2">
              <h3 className="font-extrabold text-white text-base print:text-black">18. 100% WEIGHTED PERFORMANCE EVALUATION</h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs pt-1">
                <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-center">
                  <span className="block font-bold">Journalism</span>
                  <span className="text-amber-400 font-black">15%</span>
                </div>
                <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-center">
                  <span className="block font-bold">Writing</span>
                  <span className="text-amber-400 font-black">15%</span>
                </div>
                <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-center">
                  <span className="block font-bold">Research</span>
                  <span className="text-amber-400 font-black">15%</span>
                </div>
                <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-center">
                  <span className="block font-bold">SEO</span>
                  <span className="text-amber-400 font-black">10%</span>
                </div>
                <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-center">
                  <span className="block font-bold">Social Media</span>
                  <span className="text-amber-400 font-black">10%</span>
                </div>
                <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-center">
                  <span className="block font-bold">Canva Design</span>
                  <span className="text-amber-400 font-black">10%</span>
                </div>
                <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-center">
                  <span className="block font-bold">Video</span>
                  <span className="text-amber-400 font-black">10%</span>
                </div>
                <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-center">
                  <span className="block font-bold">Discipline</span>
                  <span className="text-amber-400 font-black">5%</span>
                </div>
                <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-center">
                  <span className="block font-bold">Analytics</span>
                  <span className="text-amber-400 font-black">5%</span>
                </div>
                <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-center">
                  <span className="block font-bold">Teamwork</span>
                  <span className="text-amber-400 font-black">5%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Signatures Section */}
          <div className="pt-8 border-t-2 border-white/20 grid grid-cols-1 sm:grid-cols-2 gap-8 print:border-black">
            {/* Company Signature */}
            <div className="space-y-3 bg-slate-950/40 p-5 rounded-2xl border border-white/5 print:bg-transparent print:border-0 print:p-0">
              <p className="text-xs font-bold text-amber-400 uppercase tracking-wider print:text-black">
                FOR GOALMILLS
              </p>
              <div className="space-y-1 text-sm">
                <p><strong>Name:</strong> {data.founderName}</p>
                <p><strong>Position:</strong> {data.founderPosition}</p>
                <p className="font-serif italic text-lg text-emerald-400 print:text-black py-1">
                  ✍️ {data.founderName}
                </p>
                <p className="text-xs text-text-muted print:text-gray-700">Date: {data.founderSignatureDate}</p>
              </div>
            </div>

            {/* Employee Signature Area */}
            <div className="space-y-3 bg-slate-950/40 p-5 rounded-2xl border border-white/5 print:bg-transparent print:border-0 print:p-0">
              <p className="text-xs font-bold text-blue-400 uppercase tracking-wider print:text-black">
                EMPLOYEE ACKNOWLEDGEMENT & ACCEPTANCE
              </p>

              {data.isAccepted ? (
                <div className="space-y-1 text-sm">
                  <p><strong>Name:</strong> {data.candidateName}</p>
                  <p className="font-serif italic text-lg text-emerald-400 print:text-black py-1">
                    ✍️ {data.employeeSignature}
                  </p>
                  <p className="text-xs text-emerald-400 font-bold flex items-center gap-1 print:text-black">
                    <FiCheckCircle size={13} /> Digitally Signed on {data.employeeSignatureDate}
                  </p>
                </div>
              ) : (
                <div className="space-y-3 print:hidden">
                  <p className="text-xs text-text-muted">
                    Sign below to confirm your acceptance of this appointment and agree to the GoalMills training terms.
                  </p>

                  {errorMsg && (
                    <p className="text-xs text-red-400 font-bold">{errorMsg}</p>
                  )}
                  {successMsg && (
                    <p className="text-xs text-emerald-400 font-bold">{successMsg}</p>
                  )}

                  <form onSubmit={handleSignSubmit} className="space-y-3">
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreeCheck}
                        onChange={(e) => setAgreeCheck(e.target.checked)}
                        className="mt-0.5 rounded border-white/20 bg-slate-900 text-blue-500 focus:ring-0"
                      />
                      <span className="text-xs text-slate-300">
                        I confirm that I have read, understood, and accept the terms of this Employment & Training Appointment Letter.
                      </span>
                    </label>

                    <div>
                      <input
                        type="text"
                        placeholder="Type full legal name as digital signature"
                        value={signatureInput}
                        onChange={(e) => setSignatureInput(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/20 text-white font-serif italic text-sm focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                    >
                      {submitting ? 'Submitting Signature...' : 'Accept Appointment & Sign'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
