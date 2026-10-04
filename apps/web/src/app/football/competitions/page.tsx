import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { CompetitionDirectory } from '@/components/football/CompetitionDirectory';
import { ALL_COMPETITIONS } from '@/lib/competitionCategories';
import { FiArrowLeft, FiGlobe, FiAward, FiShield } from 'react-icons/fi';

export const metadata: Metadata = {
  title: 'Football Competition Directory (75+ Global & African Leagues) | GoalMills',
  description:
    'Authoritative directory of 75+ major world football competitions, African leagues (CAF Champions League, NPFL, Betway Premiership), European leagues (EPL, La Liga, UCL), and domestic tournaments.',
  alternates: {
    canonical: 'https://goalmills.com/football/competitions',
  },
};

export default function CompetitionsDirectoryPage() {
  const cafCount = ALL_COMPETITIONS.filter((c) => c.category === 'caf').length;
  const top5Count = ALL_COMPETITIONS.filter((c) => c.category === 'european-top5').length;
  const uefaClubCount = ALL_COMPETITIONS.filter((c) => c.category === 'european-club').length;

  return (
    <main className="min-h-screen bg-[#020617] pt-[72px] pb-20 text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Hero Header */}
      <div className="relative border-b border-[#1e293b] bg-gradient-to-b from-[#09152a] via-[#060e1d] to-[#020617] overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-4">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/football" className="hover:text-white transition-colors">
              Football
            </Link>
            <span>/</span>
            <span className="text-white">Competition Directory</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-black uppercase tracking-wider">
                <FiGlobe />
                <span>Authoritative Coverage</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                Competition Directory
              </h1>
              <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                Explore 75+ canonical football leagues and tournaments with real-time match centres,
                official standings tables, club directories, and player intelligence.
              </p>
            </div>

            {/* Quick Stat Highlights */}
            <div className="grid grid-cols-3 gap-2.5 bg-[#0a1324] border border-[#1e293b] p-3 rounded-2xl shrink-0">
              <div className="text-center px-2 py-1">
                <p className="text-xl sm:text-2xl font-black text-amber-400">{cafCount}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  African CAF
                </p>
              </div>
              <div className="text-center px-2 py-1 border-x border-[#1e293b]">
                <p className="text-xl sm:text-2xl font-black text-blue-400">{top5Count}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Top 5 EU
                </p>
              </div>
              <div className="text-center px-2 py-1">
                <p className="text-xl sm:text-2xl font-black text-emerald-400">{ALL_COMPETITIONS.length}+</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Total
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Directory Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <CompetitionDirectory compact={false} />
      </div>
    </main>
  );
}
