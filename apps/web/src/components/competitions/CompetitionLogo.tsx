'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { FiAward } from 'react-icons/fi';

interface CompetitionLogoProps {
  src: string;
  alt: string;
  flag?: string;
  size?: number;
  className?: string;
  priority?: boolean;
}

export function CompetitionLogo({
  src,
  alt,
  flag,
  size = 28,
  className = '',
  priority = false,
}: CompetitionLogoProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`rounded-xl bg-gradient-to-tr from-slate-900 to-blue-950/80 border border-white/10 flex items-center justify-center shrink-0 text-base shadow-inner select-none ${className}`}
        title={alt}
      >
        {flag ? (
          <span className="leading-none text-sm">{flag}</span>
        ) : (
          <FiAward className="text-amber-400 text-xs" />
        )}
      </div>
    );
  }

  return (
    <div
      style={{ width: size, height: size }}
      className={`relative shrink-0 flex items-center justify-center ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        priority={priority}
        className="w-full h-full object-contain filter drop-shadow-sm transition-transform duration-200"
        onError={() => setHasError(true)}
        unoptimized
      />
    </div>
  );
}
