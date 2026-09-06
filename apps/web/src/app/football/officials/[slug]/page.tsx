import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { EntityService, OFFICIALS_REGISTRY } from '@/lib/entityService';
import { OfficialImage } from '@/components/OfficialImage';
import { BackButton } from '@/components/BackButton';
import {
  FiShield,
  FiActivity,
  FiAlertTriangle,
  FiCheckCircle,
  FiCalendar,
  FiTrendingUp,
  FiArrowRight,
  FiGlobe,
} from 'react-icons/fi';

interface OfficialDetailPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: OfficialDetailPageProps): Promise<Metadata> {
  const official = EntityService.getOfficial(params.slug);
  if (!official) {
    return {
      title: 'Match Official Profile | GoalMills',
    };
  }

  return {
    title: `${official.name} - Match Official Stats, Disciplinary History & Cards | GoalMills`,
    description: `${official.name} officiating profile: ${official.matches} career matches, ${official.yellowCardsPerGame} yellow cards/game, ${official.redCardsPerGame} red cards/game, VAR accuracy ${official.varAccuracy}, and recent match assignments.`,
  };
}

export default function OfficialDetailPage({ params }: OfficialDetailPageProps) {
  const official = EntityService.getOfficial(params.slug);

  if (!official) {
    notFound();
  }

  const otherOfficials = EntityService.getAllOfficials()
    .filter((o) => o.slug !== official.slug)
    .slice(0, 4);

  const getStrictnessBadge = (rating: typeof official.strictnessRating) => {
    switch (rating) {
      case 'High-Card Index':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'Strict':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'Balanced':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'Permissive':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

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
          <Link href="/football/officials" className="hover:text-white transition">
            Officials
          </Link>
          <span>/</span>
          <span className="text-amber-400 font-bold">{official.name}</span>
        </div>

        {/* ─── Hero Official Profile Card ────────────────────────────────────── */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#0F1E38] to-[#081224] border border-blue-500/20 p-6 sm:p-10 shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8">
            <OfficialImage
              src={official.photo}
              name={official.name}
              countryFlag={official.countryFlag}
              size={110}
              className="border-4 border-amber-500/30 shadow-2xl"
              priority
            />

            <div className="flex-1 text-center md:text-left space-y-3">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span
                  className={`text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${getStrictnessBadge(
                    official.strictnessRating
                  )}`}
                >
                  {official.strictnessRating}
                </span>
                <span className="text-xs font-bold text-slate-300 bg-slate-900/80 px-2.5 py-1 rounded-full border border-white/10">
                  FIFA Badge Since {official.fifaBadgeSince}
                </span>
                <span className="text-xs font-bold text-blue-300 bg-blue-950/80 px-2.5 py-1 rounded-full border border-blue-500/30">
                  {official.role}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                {official.name}
              </h1>

              <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                {official.bio}
              </p>

              {/* Competitions Badges */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 pt-2">
                {official.competitions.map((comp) => (
                  <span
                    key={comp}
                    className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-900/80 border border-white/10 text-slate-200"
                  >
                    {comp}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ─── Disciplinary Intelligence Metrics ─────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-[#0A162B] p-4 rounded-2xl border border-blue-500/20 text-center shadow-lg">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">
              Matches Officiated
            </span>
            <span className="text-2xl sm:text-3xl font-black text-white">{official.matches}</span>
            <span className="text-[10px] text-slate-500 block mt-1 font-mono">Career total</span>
          </div>

          <div className="bg-[#0A162B] p-4 rounded-2xl border border-yellow-500/20 text-center shadow-lg">
            <span className="text-xs text-yellow-400 font-bold uppercase tracking-wider block mb-1">
              Yellows / Game
            </span>
            <span className="text-2xl sm:text-3xl font-black text-yellow-400">
              {official.yellowCardsPerGame}
            </span>
            <span className="text-[10px] text-slate-500 block mt-1 font-mono">
              {official.yellowCardsTotal} Total
            </span>
          </div>

          <div className="bg-[#0A162B] p-4 rounded-2xl border border-red-500/20 text-center shadow-lg">
            <span className="text-xs text-red-400 font-bold uppercase tracking-wider block mb-1">
              Reds / Game
            </span>
            <span className="text-2xl sm:text-3xl font-black text-red-400">
              {official.redCardsPerGame}
            </span>
            <span className="text-[10px] text-slate-500 block mt-1 font-mono">
              {official.redCardsTotal} Total
            </span>
          </div>

          <div className="bg-[#0A162B] p-4 rounded-2xl border border-blue-500/20 text-center shadow-lg">
            <span className="text-xs text-blue-400 font-bold uppercase tracking-wider block mb-1">
              Fouls / Game
            </span>
            <span className="text-2xl sm:text-3xl font-black text-blue-400">
              {official.foulsPerGame}
            </span>
            <span className="text-[10px] text-slate-500 block mt-1 font-mono">Foul tolerance</span>
          </div>

          <div className="bg-[#0A162B] p-4 rounded-2xl border border-purple-500/20 text-center shadow-lg">
            <span className="text-xs text-purple-400 font-bold uppercase tracking-wider block mb-1">
              Penalties / Game
            </span>
            <span className="text-2xl sm:text-3xl font-black text-purple-400">
              {official.penaltiesPerGame}
            </span>
            <span className="text-[10px] text-slate-500 block mt-1 font-mono">
              {official.penaltiesAwardedTotal} Total
            </span>
          </div>

          <div className="bg-[#0A162B] p-4 rounded-2xl border border-emerald-500/20 text-center shadow-lg">
            <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider block mb-1">
              VAR Accuracy
            </span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-400">
              {official.varAccuracy}
            </span>
            <span className="text-[10px] text-slate-500 block mt-1 font-mono">Overturns upheld</span>
          </div>
        </div>

        {/* ─── Disciplinary Profile & Assignment Logs ──────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Officiating Style & Analysis */}
          <div className="lg:col-span-1 space-y-6">
            <div className="rounded-3xl border border-white/10 bg-[#091529]/90 p-6 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase tracking-wider border-b border-white/10 pb-3">
                <FiActivity className="w-4 h-4" />
                <span>Disciplinary Profile</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Referees with a <strong className="text-amber-400">{official.strictnessRating}</strong> rating
                maintain high disciplinary thresholds. Their bookings-per-fixture metric (
                {official.yellowCardsPerGame}) compares to the European elite benchmark of 3.82.
              </p>

              {/* Visual Cards Ratio Bar */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span>Booking Distribution</span>
                  <span>{official.yellowCardsTotal + official.redCardsTotal} Total</span>
                </div>
                <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden flex">
                  <div
                    style={{
                      width: `${(
                        (official.yellowCardsTotal /
                          (official.yellowCardsTotal + official.redCardsTotal || 1)) *
                        100
                      ).toFixed(1)}%`,
                    }}
                    className="bg-yellow-400 h-full"
                    title="Yellow Cards"
                  />
                  <div
                    style={{
                      width: `${(
                        (official.redCardsTotal /
                          (official.yellowCardsTotal + official.redCardsTotal || 1)) *
                        100
                      ).toFixed(1)}%`,
                    }}
                    className="bg-red-500 h-full"
                    title="Red Cards"
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 bg-yellow-400 rounded-sm inline-block" />
                    Yellows: {official.yellowCardsTotal}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 bg-red-500 rounded-sm inline-block" />
                    Reds: {official.redCardsTotal}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Hub Navigation */}
            <div className="rounded-3xl border border-blue-500/20 bg-[#0A162B] p-6 space-y-3 shadow-xl">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Explore More Referees
              </h3>
              <p className="text-xs text-slate-300">
                Compare {official.name} against other top European & FIFA Elite match officials.
              </p>
              <Link
                href="/football/officials"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all"
              >
                <span>View All Match Officials</span>
                <FiArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* Recent Match Logs */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-3xl border border-white/10 bg-[#0A162B] p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <FiCalendar className="text-amber-400" />
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    Recent Fixture Assignments & Card Logs
                  </h3>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Live Officiating Desk</span>
              </div>

              <div className="space-y-3">
                {official.recentMatches.map((match, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-2 hover:border-amber-500/30 transition"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                        {match.competition}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">{match.date}</span>
                    </div>
                    <div className="text-sm font-black text-white">{match.fixture}</div>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-300 pt-1">
                      <span className="flex items-center gap-1 text-yellow-400">
                        <span>🟨</span> {match.yellowCards} Yellows
                      </span>
                      <span className="flex items-center gap-1 text-red-400">
                        <span>🟥</span> {match.redCards} Reds
                      </span>
                      <span className="flex items-center gap-1 text-blue-400">
                        <span>🎯</span> {match.penalties} Penalties
                      </span>
                      {match.varDecision && (
                        <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                          <FiCheckCircle size={12} /> {match.varDecision}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Related Officials Comparison */}
            <div className="rounded-3xl border border-white/10 bg-[#091529]/70 p-6 space-y-3 shadow-xl">
              <h4 className="text-xs font-black text-white uppercase tracking-wider">
                Related Elite Officials
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {otherOfficials.map((ref) => (
                  <Link
                    key={ref.slug}
                    href={`/football/officials/${ref.slug}`}
                    className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-amber-500/10 border border-white/5 hover:border-amber-500/30 transition text-center group"
                  >
                    <span className="text-xs font-bold text-slate-200 group-hover:text-amber-400 truncate block">
                      {ref.name}
                    </span>
                    <span className="text-[10px] text-yellow-400 font-bold block mt-0.5">
                      {ref.yellowCardsPerGame} 🟨/G
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
