'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FiArrowRight, FiCheckCircle, FiClock, FiAlertCircle } from 'react-icons/fi';
import { TransferItem, TransferStatus } from '@goalmills/types';

interface TransferCenterCardProps {
  transfer: TransferItem;
  className?: string;
}

export function TransferCenterCard({ transfer, className = '' }: TransferCenterCardProps) {
  const getStatusBadge = (status: TransferStatus) => {
    switch (status) {
      case 'done_deal':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <FiCheckCircle size={12} />
            Done Deal
          </span>
        );
      case 'agreement':
      case 'medical':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <FiClock size={12} />
            Agreed / Medical
          </span>
        );
      case 'negotiation':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <FiClock size={12} />
            Advanced Talks
          </span>
        );
      case 'rumour':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <FiAlertCircle size={12} />
            Rumour / Interest
          </span>
        );
    }
  };

  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] p-5 transition-all duration-300 hover:border-blue-500/40 shadow-xl ${className}`}
    >
      <div className="flex items-center justify-between gap-4 mb-4">
        {getStatusBadge(transfer.status)}
        {transfer.fee && (
          <span className="text-xs font-black text-amber-400 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
            {transfer.fee}
          </span>
        )}
      </div>

      {/* Clubs & Player Visual Flow */}
      <div className="flex items-center justify-between gap-3 my-3">
        {/* From Club */}
        <div className="flex flex-col items-center text-center flex-1 min-w-0">
          {transfer.fromTeam.logo && (
            <div className="relative h-12 w-12 rounded-xl bg-slate-900/80 p-2 mb-1.5 flex items-center justify-center border border-white/10">
              <Image
                src={transfer.fromTeam.logo}
                alt={transfer.fromTeam.name}
                width={40}
                height={40}
                className="object-contain max-h-full max-w-full"
              />
            </div>
          )}
          <span className="text-xs font-bold text-slate-300 truncate max-w-full">
            {transfer.fromTeam.name}
          </span>
        </div>

        {/* Transfer Arrow & Player Tag */}
        <div className="flex flex-col items-center justify-center px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600/30 text-blue-400 border border-blue-500/30">
            <FiArrowRight size={14} />
          </div>
          <span className="text-[10px] text-slate-500 font-bold uppercase mt-1">Transfer</span>
        </div>

        {/* To Club */}
        <div className="flex flex-col items-center text-center flex-1 min-w-0">
          {transfer.toTeam.logo && (
            <div className="relative h-12 w-12 rounded-xl bg-slate-900/80 p-2 mb-1.5 flex items-center justify-center border border-white/10">
              <Image
                src={transfer.toTeam.logo}
                alt={transfer.toTeam.name}
                width={40}
                height={40}
                className="object-contain max-h-full max-w-full"
              />
            </div>
          )}
          <span className="text-xs font-bold text-slate-300 truncate max-w-full">
            {transfer.toTeam.name}
          </span>
        </div>
      </div>

      {/* Player Link & Description */}
      <div className="mt-4 pt-3 border-t border-white/5 space-y-1.5">
        <Link
          href={`/players/${transfer.playerSlug}`}
          className="text-sm sm:text-base font-extrabold text-white hover:text-blue-400 transition-colors flex items-center gap-1.5"
        >
          <span>{transfer.playerName}</span>
          <span className="text-xs text-blue-400">→ Profile</span>
        </Link>

        {transfer.description && (
          <p className="text-xs text-slate-400 leading-relaxed">{transfer.description}</p>
        )}
      </div>
    </div>
  );
}
