'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { getPlayerFallbackAvatar } from '@/lib/football/logoUtils';

// Global cache of broken image URLs to prevent redundant network requests and 404 console spam
const failedImageUrls = new Set<string>();

interface PlayerAvatarProps {
  name?: string | null;
  src?: string | null;
  size?: number;
  className?: string;
  priority?: boolean;
}

export function PlayerAvatar({
  name = 'Player',
  src,
  size = 40,
  className = 'w-full h-full object-cover',
  priority = false,
}: PlayerAvatarProps) {
  const playerName = name || 'Player';
  const fallback = useMemo(
    () => getPlayerFallbackAvatar(playerName, size),
    [playerName, size]
  );

  const cleanSrc = src && typeof src === 'string' ? src.trim() : '';
  const isInitiallyBroken = !cleanSrc || failedImageUrls.has(cleanSrc);

  const [currentSrc, setCurrentSrc] = useState<string>(isInitiallyBroken ? fallback : cleanSrc);
  const [hasError, setHasError] = useState<boolean>(isInitiallyBroken);

  useEffect(() => {
    if (cleanSrc && !failedImageUrls.has(cleanSrc)) {
      setCurrentSrc(cleanSrc);
      setHasError(false);
    } else {
      setCurrentSrc(fallback);
      setHasError(true);
    }
  }, [cleanSrc, fallback]);

  return (
    <img
      src={hasError ? fallback : currentSrc}
      alt={playerName}
      width={size}
      height={size}
      decoding="async"
      loading={priority ? 'eager' : 'lazy'}
      onError={() => {
        if (cleanSrc) {
          failedImageUrls.add(cleanSrc);
        }
        setHasError(true);
        setCurrentSrc(fallback);
      }}
      className={className}
    />
  );
}
