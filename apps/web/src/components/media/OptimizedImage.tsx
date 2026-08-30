'use client';

import React, { useState } from 'react';
import { MediaOptimizer } from '../../lib/media/mediaOptimizer';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
  quality?: number;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width = 800,
  height,
  className = '',
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px',
  quality = 80,
}) => {
  const [loaded, setLoaded] = useState(false);

  const optimizedSrc = MediaOptimizer.getOptimizedImageUrl(src, { width, height, quality });
  const avifSrcset = MediaOptimizer.generateSrcset(
    MediaOptimizer.getOptimizedImageUrl(src, { format: 'avif', quality })
  );
  const webpSrcset = MediaOptimizer.generateSrcset(
    MediaOptimizer.getOptimizedImageUrl(src, { format: 'webp', quality })
  );
  const defaultSrcset = MediaOptimizer.generateSrcset(src);

  return (
    <div className={`relative overflow-hidden bg-slate-900 ${className}`}>
      {/* Skeleton Shimmer */}
      {!loaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-slate-800 via-slate-700/50 to-slate-800 animate-pulse" />
      )}

      <picture>
        <source type="image/avif" srcSet={avifSrcset} sizes={sizes} />
        <source type="image/webp" srcSet={webpSrcset} sizes={sizes} />
        <img
          src={optimizedSrc}
          srcSet={defaultSrcset}
          sizes={sizes}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setLoaded(true)}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </picture>
    </div>
  );
};

export default OptimizedImage;
