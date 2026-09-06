'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { PlayerMeta } from '@/lib/entityService';
import { PlayerImage } from './PlayerImage';
import { FiX, FiCheck, FiArrowRight, FiShield } from 'react-icons/fi';
import { FaFire } from 'react-icons/fa6';

interface PlayerComparisonModalProps {
  playerA: PlayerMeta;
  playerB: PlayerMeta;
  onClose: () => void;
}

export function PlayerComparisonModal({
  playerA,
  playerB,
  onClose,
}: PlayerComparisonModalProps) {
  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Parse numeric values for comparison bars
  const statsA = playerA.seasonStats;
  const statsB = playerB.seasonStats;

  const parseVal = (val: string) => parseFloat(val.replace(/[^0-9.]/g, '')) || 0;

  const mvA = parseVal(playerA.marketValue);
  const mvB = parseVal(playerB.marketValue);

  const accA = parseVal(statsA.passAccuracy);
  const accB = parseVal(statsB.passAccuracy);

  const metrics: {
    label: string;
    valA: number | string;
    valB: number | string;
    rawA: number;
    rawB: number;
    unit?: string;
    higherIsBetter?: boolean;
  }[] = [
    {
      label: 'Match Rating',
      valA: statsA.rating.toFixed(2),
      valB: statsB.rating.toFixed(2),
      rawA: statsA.rating,
      rawB: statsB.rating,
      higherIsBetter: true,
    },
    {
      label: 'Season Goals',
      valA: statsA.goals,
      valB: statsB.goals,
      rawA: statsA.goals,
      rawB: statsB.goals,
      higherIsBetter: true,
    },
    {
      label: 'Season Assists',
      valA: statsA.assists,
      valB: statsB.assists,
      rawA: statsA.assists,
      rawB: statsB.assists,
      higherIsBetter: true,
    },
    {
      label: 'Pass Accuracy',
      valA: statsA.passAccuracy,
      valB: statsB.passAccuracy,
      rawA: accA,
      rawB: accB,
      higherIsBetter: true,
    },
    {
      label: 'Appearances',
      valA: statsA.appearances,
      valB: statsB.appearances,
      rawA: statsA.appearances,
      rawB: statsB.appearances,
      higherIsBetter: true,
    },
    {
      label: 'Estimated Market Value',
      valA: playerA.marketValue,
      valB: playerB.marketValue,
      rawA: mvA,
      rawB: mvB,
      higherIsBetter: true,
    },
    {
      label: 'Age',
      valA: `${playerA.age} yrs`,
      valB: `${playerB.age} yrs`,
      rawA: playerA.age,
      rawB: playerB.age,
      higherIsBetter: false, // younger can be advantageous
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xl animate-fadeIn">
      <div className="relative w-full max-w-3xl rounded-3xl bg-gradient-to-b from-[#0C1930] to-[#070E1C] border border-blue-500/30 p-5 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          title="Close comparison"
        >
          <FiX size={18} />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-[10px] font-black uppercase tracking-wider">
            <FaFire className="text-amber-400" />
            <span>Head-to-Head Tactical Scouting</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            Player Comparison
          </h3>
        </div>

        {/* Player Cards Banner */}
        <div className="grid grid-cols-2 gap-3 sm:gap-6 pb-6 border-b border-white/10">
          {/* Player A */}
          <div className="flex flex-col items-center text-center space-y-2 p-3 rounded-2xl bg-white/[0.03] border border-white/5">
            <PlayerImage
              src={playerA.photo}
              alt={playerA.name}
              flag={playerA.countryFlag}
              size={72}
              rounded="rounded-2xl"
            />
            <div>
              <h4 className="font-extrabold text-sm sm:text-base text-white line-clamp-1">
                {playerA.name}
              </h4>
              <p className="text-[11px] text-blue-400 font-bold truncate">
                {playerA.position}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {playerA.clubName}
              </p>
            </div>
            <Link
              href={`/players/${playerA.slug}`}
              className="text-[10px] font-bold text-slate-300 hover:text-blue-400 flex items-center gap-1 transition-colors"
            >
              <span>View Profile</span>
              <FiArrowRight size={10} />
            </Link>
          </div>

          {/* Player B */}
          <div className="flex flex-col items-center text-center space-y-2 p-3 rounded-2xl bg-white/[0.03] border border-white/5">
            <PlayerImage
              src={playerB.photo}
              alt={playerB.name}
              flag={playerB.countryFlag}
              size={72}
              rounded="rounded-2xl"
            />
            <div>
              <h4 className="font-extrabold text-sm sm:text-base text-white line-clamp-1">
                {playerB.name}
              </h4>
              <p className="text-[11px] text-blue-400 font-bold truncate">
                {playerB.position}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {playerB.clubName}
              </p>
            </div>
            <Link
              href={`/players/${playerB.slug}`}
              className="text-[10px] font-bold text-slate-300 hover:text-blue-400 flex items-center gap-1 transition-colors"
            >
              <span>View Profile</span>
              <FiArrowRight size={10} />
            </Link>
          </div>
        </div>

        {/* Comparison Metrics */}
        <div className="py-5 space-y-4">
          {metrics.map((m) => {
            const isWinnerA = m.rawA > m.rawB;
            const isWinnerB = m.rawB > m.rawA;
            const isTie = m.rawA === m.rawB;

            const total = m.rawA + m.rawB || 1;
            const pctA = Math.round((m.rawA / total) * 100);
            const pctB = 100 - pctA;

            return (
              <div key={m.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span
                    className={`${
                      isWinnerA ? 'text-emerald-400 font-black' : 'text-slate-300'
                    }`}
                  >
                    {m.valA} {isWinnerA && '★'}
                  </span>
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                    {m.label}
                  </span>
                  <span
                    className={`${
                      isWinnerB ? 'text-emerald-400 font-black' : 'text-slate-300'
                    }`}
                  >
                    {isWinnerB && '★ '}
                    {m.valB}
                  </span>
                </div>

                {/* Split Comparison Bar */}
                <div className="flex h-2 w-full overflow-hidden rounded-full bg-slate-900 border border-white/5">
                  <div
                    style={{ width: `${isTie ? 50 : pctA}%` }}
                    className={`h-full transition-all duration-500 ${
                      isWinnerA
                        ? 'bg-gradient-to-r from-blue-600 to-emerald-400'
                        : 'bg-blue-600/40'
                    }`}
                  />
                  <div
                    style={{ width: `${isTie ? 50 : pctB}%` }}
                    className={`h-full transition-all duration-500 ${
                      isWinnerB
                        ? 'bg-gradient-to-l from-indigo-500 to-emerald-400'
                        : 'bg-indigo-600/40'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition shadow-lg"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
}
