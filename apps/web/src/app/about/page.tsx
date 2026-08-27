import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | GoalMills',
  description:
    'Learn more about GoalMills, your premier destination for sports analytics and real-time scores.',
};

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-gradient">About GoalMills</h1>

        <div className="glass p-8 rounded-3xl border border-white/10 space-y-8 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Our Mission</h2>
            <p>
              GoalMills was founded with a singular mission: to provide sports fans with the
              fastest, most accurate, and deeply insightful sports data available. We believe that
              every fan deserves professional-grade analytics at their fingertips.
            </p>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-card p-6 rounded-2xl">
              <h3 className="text-xl font-semibold text-blue-400 mb-3">Real-Time Precision</h3>
              <p className="text-sm">
                We process millions of data points every second to ensure our live scores are among
                the fastest in the industry.
              </p>
            </div>
            <div className="glass-card p-6 rounded-2xl">
              <h3 className="text-xl font-semibold text-amber-400 mb-3">Deep Insights</h3>
              <p className="text-sm">
                Beyond scores, we provide betting odds, match predictions, and historical statistics
                to give you the full picture.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Multi-Sport Coverage</h2>
            <p>
              Whether you're a die-hard Football fan, a Cricket enthusiast, an NBA follower, or a
              Tennis aficionado, GoalMills has you covered. Our platform is designed to scale with
              the sports you love.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Our Technology</h2>
            <p>
              Built on modern, high-performance architecture, GoalMills ensures a seamless
              experience across web and mobile devices. Our team of engineers and sports analysts
              work tirelessly to refine our algorithms and data delivery.
            </p>
          </section>

          <div className="pt-8 border-t border-white/5 text-center">
            <p className="text-slate-400">
              Join thousands of fans who trust GoalMills for their daily sports fix.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
