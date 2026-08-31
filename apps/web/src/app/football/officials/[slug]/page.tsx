'use client';

import { useParams } from 'next/navigation';
import { BackButton } from '@/components/BackButton';

export default function FootballOfficialPage() {
  const params = useParams();
  const slug = params.slug as string;
  const name = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className="min-h-screen bg-[#070a1a] pt-[90px] pb-20">
      <div className="bg-gradient-to-b from-[#0B1526] to-[#070a1a] border-b border-white/5 pt-12 pb-8 px-4 relative">
        <BackButton className="absolute top-4 left-4 z-20" />
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-600/30 to-yellow-600/30 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🟨</span>
          </div>
          <h1 className="text-3xl font-black text-white mb-2">{name}</h1>
          <p className="text-slate-400 text-sm">Match Official / Referee</p>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="rounded-2xl border border-white/10 bg-[#0B1526]/50 p-6 text-center">
          <p className="text-slate-300 text-sm">
            Detailed officiating profile for <strong className="text-white">{name}</strong> with match history,
            card statistics, and competition assignments will be displayed here.
          </p>
          <p className="text-slate-500 text-xs mt-3">
            Data sourced from AllSports API in real-time.
          </p>
        </div>
      </div>
    </div>
  );
}
