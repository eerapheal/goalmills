'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiShield, FiMapPin, FiAward, FiTrendingUp, FiGlobe } from 'react-icons/fi';

export interface EntityBadge {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}

export interface EntityTab {
  key: string;
  label: string;
  count?: number;
}

interface EntityHeaderProps {
  type: 'competition' | 'club' | 'player';
  title: string;
  subtitle?: string;
  image?: string;
  flag?: string;
  parentEntity?: {
    name: string;
    url: string;
  };
  badges?: EntityBadge[];
  tabs?: EntityTab[];
  activeTab?: string;
  onTabChange?: (key: string) => void;
  actionButton?: React.ReactNode;
}

export function EntityHeader({
  type,
  title,
  subtitle,
  image,
  flag,
  parentEntity,
  badges = [],
  tabs = [],
  activeTab,
  onTabChange,
  actionButton,
}: EntityHeaderProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0c172e] via-[#091122] to-[#060b18] p-6 sm:p-8 shadow-2xl backdrop-blur-xl mb-8">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Main Info */}
          <div className="flex items-center gap-5 sm:gap-6">
            {image && (
              <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-white/[0.04] border border-white/10 p-2.5 shadow-xl flex-shrink-0 flex items-center justify-center overflow-hidden">
                {!imgError ? (
                  <Image
                    src={image}
                    alt={title}
                    width={96}
                    height={96}
                    className="object-contain max-h-full max-w-full drop-shadow-md"
                    onError={() => setImgError(true)}
                    unoptimized
                  />
                ) : (
                  <div className="text-3xl select-none">{flag || '🏆'}</div>
                )}
              </div>
            )}

            <div>
              {/* Type Badge & Parent Link */}
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] sm:text-xs font-black uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  {type}
                </span>
                {flag && <span className="text-sm">{flag}</span>}
                {parentEntity && (
                  <Link
                    href={parentEntity.url}
                    className="text-xs font-semibold text-slate-400 hover:text-white transition-colors flex items-center gap-1"
                  >
                    <span>• {parentEntity.name}</span>
                  </Link>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-2">
                {title}
              </h1>

              {subtitle && <p className="text-xs sm:text-sm text-slate-400 mt-1">{subtitle}</p>}
            </div>
          </div>

          {/* Quick Stats Badges */}
          {badges.length > 0 && (
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full md:w-auto">
              {badges.map((badge, idx) => (
                <div
                  key={badge.label + idx}
                  className="flex flex-col px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-md"
                >
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    {badge.icon}
                    {badge.label}
                  </span>
                  <span className="text-sm sm:text-base font-extrabold text-white">
                    {badge.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {actionButton}
        </div>

        {/* Navigation Tabs */}
        {tabs.length > 0 && (
          <div className="mt-8 border-t border-white/10 pt-4 flex items-center gap-2 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => onTabChange?.(tab.key)}
                  className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>{tab.label}</span>
                  {typeof tab.count === 'number' && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
