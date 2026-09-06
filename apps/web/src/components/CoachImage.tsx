'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface CoachImageProps {
  src?: string;
  name: string;
  countryFlag?: string;
  clubLogo?: string;
  size?: number;
  className?: string;
  priority?: boolean;
}

export const CoachImage: React.FC<CoachImageProps> = ({
  src,
  name,
  countryFlag,
  clubLogo,
  size = 64,
  className = '',
  priority = false,
}) => {
  const [hasError, setHasError] = useState(false);

  const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name || 'Coach'
  )}&background=0A162B&color=38BDF8&size=${size * 2}&bold=true`;

  const finalSrc = hasError || !src ? fallbackUrl : src;

  return (
    <div
      className={`relative rounded-2xl overflow-hidden bg-slate-900/90 border border-blue-500/25 shadow-md flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={finalSrc}
        alt={name || 'Manager'}
        width={size}
        height={size}
        priority={priority}
        onError={() => setHasError(true)}
        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        unoptimized
      />

      {/* Floating club badge or flag badge */}
      {clubLogo ? (
        <div
          className="absolute -bottom-1 -right-1 rounded-full overflow-hidden border-2 border-slate-950 shadow-md bg-slate-900 p-0.5"
          style={{ width: Math.max(18, Math.round(size * 0.35)), height: Math.max(18, Math.round(size * 0.35)) }}
          title="Club Crest"
        >
          <Image
            src={clubLogo}
            alt="Club"
            width={24}
            height={24}
            className="w-full h-full object-contain"
            unoptimized
          />
        </div>
      ) : countryFlag ? (
        <div
          className="absolute -bottom-1 -right-1 rounded-full overflow-hidden border-2 border-slate-950 shadow-md bg-slate-900"
          style={{ width: Math.max(16, Math.round(size * 0.35)), height: Math.max(16, Math.round(size * 0.35)) }}
          title="Nationality"
        >
          <Image
            src={countryFlag}
            alt="Flag"
            width={24}
            height={24}
            className="w-full h-full object-cover"
            unoptimized
          />
        </div>
      ) : null}
    </div>
  );
};
