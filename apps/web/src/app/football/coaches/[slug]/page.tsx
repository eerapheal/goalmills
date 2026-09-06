import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { EntityService, CLUBS_REGISTRY } from '@/lib/entityService';
import { CoachImage } from '@/components/CoachImage';
import { BackButton } from '@/components/BackButton';
import {
  FiAward,
  FiActivity,
  FiShield,
  FiCalendar,
  FiTrendingUp,
  FiArrowRight,
  FiCheckCircle,
} from 'react-icons/fi';

interface CoachDetailPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: CoachDetailPageProps): Promise<Metadata> {
  const coach = EntityService.getCoach(params.slug);
  if (!coach) {
    return {
      title: 'Manager Profile | GoalMills',
    };
  }

  return {
    title: `${coach.name} - Manager Profile, Tactics, Win Rate & Trophies | GoalMills`,
    description: `${coach.name} managerial profile: ${coach.preferredFormation} formation, ${coach.winPercentage}% win rate across ${coach.matchesManaged} matches, ${coach.trophiesCount} major trophies, and club career timeline.`,
  };
}

export default function CoachDetailPage({ params }: CoachDetailPageProps) {
  const coach = EntityService.getCoach(params.slug);

  if (!coach) {
    notFound();
  }

  const club = CLUBS_REGISTRY[coach.currentClubSlug];
  const otherCoaches = EntityService.getAllCoaches()
    .filter((c) => c.slug !== coach.slug)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-[#070A1A] pt-[85px] pb-24 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Navigation Breadcrumbs */}
        <div className="flex items-center gap-3 text-xs font-semibold text-slate-400">
          <BackButton />
          <Link href="/football" className="hover:text-white transition">
            Football
          </Link>
          <span>/</span>
          <Link href="/football/coaches" className="hover:text-white transition">
            Managers
          </Link>
          <span>/</span>
          <span className="text-blue-400 font-bold">{coach.name}</span>
        </div>

        {/* ─── Hero Manager Profile Card ─────────────────────────────────────── */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#0F1E38] to-[#081224] border border-blue-500/20 p-6 sm:p-10 shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8">
            <CoachImage
              src={coach.photo}
              name={coach.name}
              countryFlag={coach.countryFlag}
              clubLogo={club?.logo}
              size={120}
              className="border-4 border-blue-500/30 shadow-2xl"
              priority
            />

            <div className="flex-1 text-center md:text-left space-y-3">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  🏆 {coach.trophiesCount} Major Trophies
                </span>
                <span className="text-xs font-bold text-slate-300 bg-slate-900/80 px-2.5 py-1 rounded-full border border-white/10">
                  {coach.nationality} • {coach.age} yrs
                </span>
                <Link
                  href={`/football/teams/${coach.currentClubSlug}`}
                  className="text-xs font-bold text-blue-300 hover:text-white bg-blue-950/80 hover:bg-blue-900 px-2.5 py-1 rounded-full border border-blue-500/30 transition flex items-center gap-1"
                >
                  <span>{coach.currentClubName}</span>
                  <FiArrowRight size={11} />
                </Link>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                {coach.name}
              </h1>

              <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                {coach.bio}
              </p>

              {/* Preferred System Badge */}
              <div className="pt-2">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-blue-500/30 text-blue-300 text-xs font-bold">
                  <span>⚙️ Preferred Setup:</span>
                  <strong className="text-white">{coach.preferredFormation}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Managerial Record Dashboard ───────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#0A162B] p-4 rounded-2xl border border-blue-500/20 text-center shadow-lg">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">
              Matches Managed
            </span>
            <span className="text-2xl sm:text-3xl font-black text-white">{coach.matchesManaged}</span>
            <span className="text-[10px] text-slate-500 block mt-1 font-mono">Senior career</span>
          </div>

          <div className="bg-[#0A162B] p-4 rounded-2xl border border-emerald-500/20 text-center shadow-lg">
            <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider block mb-1">
              Win Percentage
            </span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-400">
              {coach.winPercentage}%
            </span>
            <span className="text-[10px] text-slate-500 block mt-1 font-mono">
              ~{Math.round((coach.matchesManaged * coach.winPercentage) / 100)} Wins
            </span>
          </div>

          <div className="bg-[#0A162B] p-4 rounded-2xl border border-amber-500/20 text-center shadow-lg">
            <span className="text-xs text-amber-400 font-bold uppercase tracking-wider block mb-1">
              Draw Rate
            </span>
            <span className="text-2xl sm:text-3xl font-black text-amber-400">
              {coach.drawPercentage}%
            </span>
            <span className="text-[10px] text-slate-500 block mt-1 font-mono">
              ~{Math.round((coach.matchesManaged * coach.drawPercentage) / 100)} Draws
            </span>
          </div>

          <div className="bg-[#0A162B] p-4 rounded-2xl border border-purple-500/20 text-center shadow-lg">
            <span className="text-xs text-purple-400 font-bold uppercase tracking-wider block mb-1">
              Silverware Count
            </span>
            <span className="text-2xl sm:text-3xl font-black text-purple-400">
              {coach.trophiesCount}
            </span>
            <span className="text-[10px] text-slate-500 block mt-1 font-mono">Major honours</span>
          </div>
        </div>

        {/* ─── Tactical Philosophy & Career Details ────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tactical Philosophy & System */}
          <div className="lg:col-span-1 space-y-6">
            <div className="rounded-3xl border border-white/10 bg-[#091529]/90 p-6 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 text-blue-400 font-black text-xs uppercase tracking-wider border-b border-white/10 pb-3">
                <FiActivity className="w-4 h-4" />
                <span>Tactical Philosophy</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                {coach.coachingStyle}
              </p>

              {/* Visual Win Ratio Bar */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span>Match Record Split</span>
                  <span>{coach.matchesManaged} Games</span>
                </div>
                <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${coach.winPercentage}%` }}
                    className="bg-emerald-400 h-full"
                    title={`Win: ${coach.winPercentage}%`}
                  />
                  <div
                    style={{ width: `${coach.drawPercentage}%` }}
                    className="bg-amber-400 h-full"
                    title={`Draw: ${coach.drawPercentage}%`}
                  />
                  <div
                    style={{ width: `${coach.lossPercentage}%` }}
                    className="bg-red-500 h-full"
                    title={`Loss: ${coach.lossPercentage}%`}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 font-mono">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 bg-emerald-400 rounded-sm inline-block" />
                    Win {coach.winPercentage}%
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 bg-amber-400 rounded-sm inline-block" />
                    Draw {coach.drawPercentage}%
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 bg-red-500 rounded-sm inline-block" />
                    Loss {coach.lossPercentage}%
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Hub Navigation */}
            <div className="rounded-3xl border border-blue-500/20 bg-[#0A162B] p-6 space-y-3 shadow-xl">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Explore More Managers
              </h3>
              <p className="text-xs text-slate-300">
                Compare {coach.name} against top European tacticians across all 5 major leagues.
              </p>
              <Link
                href="/football/coaches"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider transition-all"
              >
                <span>View All Managers</span>
                <FiArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* Trophy Cabinet & Club Career Timeline */}
          <div className="lg:col-span-2 space-y-6">
            {/* Trophy Cabinet */}
            <div className="rounded-3xl border border-white/10 bg-[#0A162B] p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <FiAward className="text-amber-400" />
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    Silverware & Major Honours ({coach.trophiesCount})
                  </h3>
                </div>
                <span className="text-[10px] text-amber-300 uppercase font-mono font-bold">
                  Trophy Cabinet
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {coach.majorHonours.map((honour, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-white/5"
                  >
                    <span className="text-xl">🏆</span>
                    <span className="text-xs font-bold text-slate-200">{honour}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Career Clubs Timeline */}
            <div className="rounded-3xl border border-white/10 bg-[#0A162B] p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <FiCalendar className="text-blue-400" />
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    Managerial Career Timeline
                  </h3>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Tenure History</span>
              </div>

              <div className="space-y-3">
                {coach.careerClubs.map((tenure, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 hover:border-blue-500/30 transition"
                  >
                    <div>
                      <span className="text-sm font-black text-white block">
                        {tenure.club}
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">
                        {tenure.years} • {tenure.matches} Matches
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-lg border border-emerald-400/20 block">
                        {tenure.winRate} Win
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Related Tacticians */}
            <div className="rounded-3xl border border-white/10 bg-[#091529]/70 p-6 space-y-3 shadow-xl">
              <h4 className="text-xs font-black text-white uppercase tracking-wider">
                Related Elite Managers
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {otherCoaches.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/football/coaches/${c.slug}`}
                    className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-blue-600/15 border border-white/5 hover:border-blue-500/30 transition text-center group"
                  >
                    <span className="text-xs font-bold text-slate-200 group-hover:text-blue-400 truncate block">
                      {c.name}
                    </span>
                    <span className="text-[10px] text-amber-400 font-bold block mt-0.5">
                      {c.trophiesCount} 🏆 • {c.winPercentage}%
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
