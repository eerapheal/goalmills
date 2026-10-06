'use client';

import React, { useState, useEffect } from 'react';
import { getPlayerFallbackAvatar } from '@/lib/football/logoUtils';

interface PlayerAvatarProps {
  name: string;
  src?: string | null;
  size?: number;
  className?: string;
  priority?: boolean;
}

export function PlayerAvatar({
  name,
  src,
  size = 40,
  className = 'w-full h-full object-cover',
  priority = false,
}: PlayerAvatarProps) {
  const fallback = getPlayerFallbackAvatar(name, size);
  const [currentSrc, setCurrentSrc] = useState<string>(src || fallback);
  const [hasError, setHasError] = useState<boolean>(!src);

  useEffect(() => {
    if (src && src.trim() !== '') {
      setCurrentSrc(src);
      setHasError(false);
    } else {
      setCurrentSrc(fallback);
      setHasError(true);
    }
  }, [src, fallback]);

  return (
    <img
      src={hasError ? fallback : currentSrc}
      alt={name}
      width={size}
      height={size}
      decoding="async"
      loading={priority ? 'eager' : 'lazy'}
      onError={() => {
        if (!hasError) {
          setHasError(true);
          setCurrentSrc(fallback);
        }
      }}
      className={className}
    />
  );
}
