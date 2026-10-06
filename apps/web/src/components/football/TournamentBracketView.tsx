'use client';

import React, { useState } from 'react';
import { TournamentBracket, KnockoutRound, KnockoutMatchNode } from '@goalmills/types';

interface TournamentBracketViewProps {
  bracket: TournamentBracket;
  className?: string;
}

export function TournamentBracketView({ bracket, className = '' }: TournamentBracketViewProps) {
  const [selectedRoundSlug, setSelectedRoundSlug] = useState<string>(
    bracket.rounds?.[0]?.slug || ''
  );

  if (!bracket || !bracket.rounds || bracket.rounds.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#0B1526]/60 p-8 text-center text-slate-400">
        <span className="text-2xl mb-2 block">🏆</span>
        <h4 className="text-sm font-bold text-white mb-1">Knockout Tournament Tree</h4>
        <p className="text-xs">Knockout bracket and fixture pairings will appear as matches are scheduled.</p>
      </div>
    );
  }

  const champion = bracket.championTeam;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Champion Banner if Concluded */}
      {champion && (
        <div className="relative overflow-hidden rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-orange-500/10 p-5 shadow-lg shadow-amber-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl animate-bounce">🏆</span>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                  Tournament Champion
                </span>
                <h3 className="text-lg font-black text-white">{champion.teamName}</h3>
              </div>
            </div>
            {bracket.runnerUpTeam && (
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Runner-Up
                </span>
                <p className="text-xs font-bold text-slate-300">{bracket.runnerUpTeam.teamName}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Round Selector Tabs */}
      <div className="flex lg:hidden items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {bracket.rounds.map((round) => {
          const isActive = (selectedRoundSlug || bracket.rounds[0]?.slug) === round.slug;
          return (
            <button
              key={round.id}
              onClick={() => setSelectedRoundSlug(round.slug)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/30'
                  : 'bg-[#0B1526] text-slate-400 hover:text-white border-white/5'
              }`}
            >
              {round.name}
            </button>
          );
        })}
      </div>

      {/* Desktop Horizontal Bracket Layout / Mobile Active Round */}
      <div className="hidden lg:flex gap-6 overflow-x-auto pb-4 scrollbar-thin">
        {bracket.rounds.map((round) => (
          <div key={round.id} className="min-w-[260px] flex-1 flex flex-col">
            {/* Round Header */}
            <div className="mb-4 pb-2 border-b border-white/10 flex items-center justify-between">
              <h4 className="text-xs font-black text-white uppercase tracking-wider">
                {round.name}
              </h4>
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/10">
                {round.legType === 'TWO_LEGGED' ? '2 Legs' : '1 Leg'}
              </span>
            </div>

            {/* Matches Column with spacing */}
            <div className="flex-1 flex flex-col justify-around gap-4">
              {(round.matches || []).map((match) => (
                <BracketMatchCard key={match.id} match={match} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Single Round View */}
      <div className="lg:hidden space-y-3">
        {bracket.rounds
          .filter((r) => r.slug === (selectedRoundSlug || bracket.rounds[0]?.slug))
          .map((round) => (
            <div key={round.id} className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>{round.name}</span>
                <span className="font-mono text-[10px]">
                  {round.legType === 'TWO_LEGGED' ? 'Two-legged tie' : 'Single knockout match'}
                </span>
              </div>
              <div className="space-y-3">
                {(round.matches || []).map((match) => (
                  <BracketMatchCard key={match.id} match={match} />
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

function BracketMatchCard({ match }: { match: KnockoutMatchNode }) {
  const isFinished = match.status === 'FT' || match.status === 'AET' || match.status === 'PEN';
  const isLive = match.status === 'LIVE';

  const homeWon = isFinished && match.homeTeam.isWinner;
  const awayWon = isFinished && match.awayTeam.isWinner;

  const homeDisplayScore = match.legs?.aggregateScore?.home ?? match.homeTeam.score;
  const awayDisplayScore = match.legs?.aggregateScore?.away ?? match.awayTeam.score;

  return (
    <div
      className={`rounded-xl border p-3 transition-all ${
        isLive
          ? 'bg-[#0B1526] border-red-500/40 shadow-lg shadow-red-500/10'
          : 'bg-[#0A1424]/90 border-blue-500/20 hover:border-blue-500/40'
      }`}
    >
      {/* Status Bar */}
      <div className="flex items-center justify-between text-[10px] mb-2 text-slate-400">
        <span className="font-mono text-[9px] text-slate-500">Match #{match.matchNumber}</span>
        {isLive && (
          <span className="flex items-center gap-1 font-black text-red-400 uppercase text-[9px] animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            Live
          </span>
        )}
        {isFinished && (
          <span className="font-bold text-slate-400 text-[9px]">{match.status}</span>
        )}
        {!isFinished && !isLive && (
          <span className="text-slate-500 text-[9px]">{match.scheduledAt || 'TBD'}</span>
        )}
      </div>

      {/* Home Team */}
      <div
        className={`flex items-center justify-between py-1.5 px-2 rounded-lg transition-colors ${
          homeWon ? 'bg-blue-600/15 border border-blue-500/30' : 'hover:bg-white/5'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 pr-2">
          {match.homeTeam.teamLogo ? (
            <img
              src={match.homeTeam.teamLogo}
              alt=""
              className="w-4 h-4 object-contain shrink-0"
            />
          ) : (
            <div className="w-4 h-4 rounded bg-slate-800 text-[8px] flex items-center justify-center font-bold text-slate-400 shrink-0">
              {match.homeTeam.teamName?.[0] || 'H'}
            </div>
          )}
          <span
            className={`text-xs truncate ${
              homeWon ? 'font-black text-white' : 'font-medium text-slate-300'
            }`}
          >
            {match.homeTeam.teamName}
          </span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-xs shrink-0">
          {homeDisplayScore !== undefined ? (
            <span className={`font-bold ${homeWon ? 'text-amber-400' : 'text-slate-300'}`}>
              {homeDisplayScore}
            </span>
          ) : (
            <span className="text-slate-600">-</span>
          )}
        </div>
      </div>

      {/* Away Team */}
      <div
        className={`flex items-center justify-between py-1.5 px-2 mt-1 rounded-lg transition-colors ${
          awayWon ? 'bg-blue-600/15 border border-blue-500/30' : 'hover:bg-white/5'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 pr-2">
          {match.awayTeam.teamLogo ? (
            <img
              src={match.awayTeam.teamLogo}
              alt=""
              className="w-4 h-4 object-contain shrink-0"
            />
          ) : (
            <div className="w-4 h-4 rounded bg-slate-800 text-[8px] flex items-center justify-center font-bold text-slate-400 shrink-0">
              {match.awayTeam.teamName?.[0] || 'A'}
            </div>
          )}
          <span
            className={`text-xs truncate ${
              awayWon ? 'font-black text-white' : 'font-medium text-slate-300'
            }`}
          >
            {match.awayTeam.teamName}
          </span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-xs shrink-0">
          {awayDisplayScore !== undefined ? (
            <span className={`font-bold ${awayWon ? 'text-amber-400' : 'text-slate-300'}`}>
              {awayDisplayScore}
            </span>
          ) : (
            <span className="text-slate-600">-</span>
          )}
        </div>
      </div>

      {/* Penalty Shootout or Agg Note */}
      {match.homeTeam.penaltyScore !== undefined && match.awayTeam.penaltyScore !== undefined && (
        <div className="mt-1.5 pt-1 border-t border-white/5 text-[9px] font-mono text-slate-400 text-center">
          Penalties: {match.homeTeam.penaltyScore} - {match.awayTeam.penaltyScore}
        </div>
      )}
      {match.legs?.aggregateScore && (
        <div className="mt-1 text-[9px] font-mono text-slate-500 text-center">
          (Agg: {match.legs.aggregateScore.home}-{match.legs.aggregateScore.away})
        </div>
      )}
    </div>
  );
}
