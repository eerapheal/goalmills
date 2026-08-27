import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms and Conditions | GoalMills',
  description: 'Terms and Conditions for using the GoalMills platform.',
};

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-gradient-gold">
          Terms and Conditions
        </h1>

        <div className="glass p-8 rounded-3xl border border-white/10 space-y-6 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the GoalMills website or mobile application, you agree to be
              bound by these Terms and Conditions and all applicable laws and regulations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. Use License</h2>
            <p>
              Permission is granted to temporarily download one copy of the materials on GoalMills
              for personal, non-commercial transitory viewing only. This is the grant of a license,
              not a transfer of title.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. Disclaimer</h2>
            <p>
              The materials on GoalMills are provided on an 'as is' basis. GoalMills makes no
              warranties, expressed or implied, and hereby disclaims and negates all other
              warranties including, without limitation, implied warranties or conditions of
              merchantability, fitness for a particular purpose, or non-infringement of intellectual
              property or other violation of rights.
            </p>
            <p className="mt-2">
              Furthermore, while we strive for accuracy, GoalMills does not warrant or make any
              representations concerning the accuracy, likely results, or reliability of the use of
              the sports data and insights provided.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Limitations</h2>
            <p>
              In no event shall GoalMills or its suppliers be liable for any damages (including,
              without limitation, damages for loss of data or profit, or due to business
              interruption) arising out of the use or inability to use the materials on GoalMills.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. User Accounts</h2>
            <p>
              If you create an account, you are responsible for maintaining the confidentiality of
              your account and password. You agree to accept responsibility for all activities that
              occur under your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Governing Law</h2>
            <p>
              These terms and conditions are governed by and construed in accordance with the laws
              of the jurisdiction in which GoalMills operates, and you irrevocably submit to the
              exclusive jurisdiction of the courts in that State or location.
            </p>
          </section>

          <div className="pt-8 border-t border-white/5 text-sm text-slate-500">
            Last Updated: April 10, 2026
          </div>
        </div>
      </div>
    </div>
  );
}
