import React from 'react';
import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 border-t border-white/5 pt-16 pb-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="text-2xl font-bold text-white mb-6 block">
              Goal<span className="text-blue-500">Mills</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">
              Your ultimate destination for real-time live scores, deep match analytics, and expert
              sports insights across Football, Cricket, NBA, and Tennis.
            </p>
          </div>

          {/* Links Columns */}
          <div>
            <h3 className="text-white font-semibold mb-6">Sports</h3>
            <ul className="space-y-4 text-slate-400 text-sm">
              <li>
                <Link href="/football" className="hover:text-blue-400 transition-colors">
                  Football
                </Link>
              </li>
              <li>
                <Link href="/cricket" className="hover:text-blue-400 transition-colors">
                  Cricket
                </Link>
              </li>
              <li>
                <Link href="/basketball" className="hover:text-blue-400 transition-colors">
                  Basketball (NBA)
                </Link>
              </li>
              <li>
                <Link href="/tennis" className="hover:text-blue-400 transition-colors">
                  Tennis
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-6">Company</h3>
            <ul className="space-y-4 text-slate-400 text-sm">
              <li>
                <Link href="/about" className="hover:text-blue-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/news" className="hover:text-blue-400 transition-colors">
                  Latest News
                </Link>
              </li>
              <li>
                <Link href="#newsletter-section" className="hover:text-blue-400 transition-colors flex items-center gap-1.5 text-amber-300 font-semibold">
                  <span>Newsletter Intel</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 border border-amber-500/30">Free</span>
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-blue-400 transition-colors">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-6">Legal</h3>
            <ul className="space-y-4 text-slate-400 text-sm">
              <li>
                <Link href="/privacy-policy" className="hover:text-blue-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-blue-400 transition-colors">
                  Terms and Conditions
                </Link>
              </li>
              <li>
                <Link href="/data-deletion" className="hover:text-blue-400 transition-colors">
                  Data Deletion
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-xs text-center md:text-left">
            © {currentYear} GoalMills. All rights reserved. Registered sports data provider.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-slate-500 text-xs">Developed with Precision</span>
            <div className="flex gap-4">
              {/* Social Placeholders */}
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-blue-500/10 hover:border-blue-500/50 transition-all cursor-pointer">
                <span className="text-xs">𝕏</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-blue-500/10 hover:border-blue-500/50 transition-all cursor-pointer">
                <span className="text-xs">IG</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
