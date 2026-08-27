import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Data Deletion Instructions | GoalMills',
  description:
    'Official Data Deletion & Account Erasure Instructions for GoalMills Web and Mobile Application under Google Play Store and GDPR/CCPA guidelines.',
};

export default function DataDeletion() {
  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4">
            User Data Control &amp; Erasure
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
            Data Deletion Instructions
          </h1>
          <p className="text-slate-400 text-base md:text-lg leading-relaxed">
            At GoalMills, we are committed to upholding your right to data erasure. You have full
            control over your personal data and may request account deletion at any time.
          </p>
          <div className="flex flex-wrap gap-4 mt-4 text-xs text-slate-500">
            <span>
              <strong>Google Play Compliance:</strong> App Data Deletion Policy
            </span>
            <span>•</span>
            <span>
              <strong>Processing SLA:</strong> Within 30 Calendar Days
            </span>
          </div>
        </div>

        {/* Content Container */}
        <div className="glass p-8 md:p-10 rounded-3xl border border-white/10 space-y-8 text-slate-300 leading-relaxed text-sm md:text-base">
          {/* Section 1: Overview */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold text-white mb-3">
              1. How to Request Account &amp; Data Deletion
            </h2>
            <p>
              You may request the deletion of your GoalMills account and all associated personal
              information using either of the two official methods below:
            </p>
          </section>

          {/* Method 1 */}
          <section className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 font-bold text-sm">
                1
              </span>
              <h3 className="text-lg font-bold text-white">
                Method 1: In-App Account Deletion (Self-Service)
              </h3>
            </div>
            <p className="text-slate-400 text-sm">
              If you are logged into your account in the GoalMills mobile app or web platform:
            </p>
            <ol className="list-decimal ml-6 space-y-2 text-slate-300 text-sm">
              <li>Open the GoalMills app or website and log into your account.</li>
              <li>
                Navigate to your <strong>Profile</strong> or <strong>Settings</strong> page.
              </li>
              <li>
                Scroll to the <strong>Account Management &amp; Security</strong> section.
              </li>
              <li>
                Click or tap <span className="text-red-400 font-semibold">"Delete Account"</span>.
              </li>
              <li>
                Confirm your deletion request. Your account credentials, profile, and saved
                preferences will be queued for permanent erasure.
              </li>
            </ol>
          </section>

          {/* Method 2 */}
          <section className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-sm">
                2
              </span>
              <h3 className="text-lg font-bold text-white">
                Method 2: Direct Email Request (Without App Access)
              </h3>
            </div>
            <p className="text-slate-400 text-sm">
              If you have uninstalled the app, cannot log in, or prefer manual processing, you can
              submit a deletion request directly to our Data Protection team:
            </p>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 space-y-2">
              <p className="text-sm">
                <strong>Recipient:</strong>{' '}
                <a
                  href="mailto:privacy@goalmills.com?subject=Data%20Deletion%20Request"
                  className="text-blue-400 hover:underline"
                >
                  privacy@goalmills.com
                </a>{' '}
                or{' '}
                <a
                  href="mailto:support@goalmills.com?subject=Data%20Deletion%20Request"
                  className="text-blue-400 hover:underline"
                >
                  support@goalmills.com
                </a>
              </p>
              <p className="text-sm">
                <strong>Subject Line:</strong> Data Deletion Request - [Your Registered Email or
                Username]
              </p>
              <p className="text-sm text-slate-400">
                <strong>Required Information:</strong> Please provide your registered email address
                or username so we can identify and securely verify your account.
              </p>
            </div>
          </section>

          {/* Section 2: What Data is Deleted */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold text-white mb-3">
              2. What Data is Permanently Deleted?
            </h2>
            <p>
              Upon execution of your deletion request, the following data is permanently purged from
              our databases:
            </p>
            <ul className="list-disc ml-6 mt-3 space-y-2 text-slate-300 text-sm">
              <li>
                <strong>Account Credentials &amp; Profile:</strong> Username, email address,
                password hash, and avatar photo.
              </li>
              <li>
                <strong>Personalization &amp; Preferences:</strong> Followed sports teams, leagues,
                and customized scoreboard settings.
              </li>
              <li>
                <strong>Support History:</strong> Customer service message logs associated with your
                email.
              </li>
              <li>
                <strong>Device Tokens:</strong> Push notification registration tokens.
              </li>
            </ul>
          </section>

          {/* Section 3: Data Retention & Exceptions */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold text-white mb-3">
              3. Data Retention Timelines &amp; Exceptions
            </h2>
            <p className="text-sm text-slate-300">
              - <strong>Processing Timeline:</strong> Deletion requests are processed and completed
              within <strong>30 days</strong> of verification.
              <br />- <strong>Guest Users:</strong> If you use GoalMills without creating an
              account, no personally identifiable information (PII) is stored in our database.
              <br />- <strong>Legal &amp; Security Logs:</strong> Minimal anonymized technical
              server logs (such as error diagnostics and security audit logs) may be retained for up
              to 90 days strictly for fraud prevention, server security, and legal compliance, after
              which they are permanently overwritten.
            </p>
          </section>

          {/* Section 4: Contact */}
          <section className="pt-4 border-t border-white/10">
            <h2 className="text-lg font-bold text-white mb-2">Need Assistance?</h2>
            <p className="text-sm text-slate-400">
              If you have questions or require confirmation regarding your data deletion, email our
              Privacy Officer at{' '}
              <a href="mailto:privacy@goalmills.com" className="text-blue-400 hover:underline">
                privacy@goalmills.com
              </a>
              .
            </p>
          </section>

          {/* Navigation Footer */}
          <div className="pt-6 border-t border-white/10 flex flex-wrap justify-between items-center text-xs text-slate-500 gap-4">
            <Link href="/privacy-policy" className="text-blue-400 hover:underline font-medium">
              ← Return to Privacy Policy
            </Link>
            <span>GoalMills © {new Date().getFullYear()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
