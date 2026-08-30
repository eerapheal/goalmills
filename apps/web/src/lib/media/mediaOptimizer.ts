/**
 * GoalMills Global Media & CDN Optimization Utility (10A)
 * Handles responsive srcset generation, format negotiation (WebP/AVIF), and edge cache-control policies.
 */

import type { ImageTransformOptions, OptimizedMediaResult } from '@goalmills/types';

export class MediaOptimizer {
  /**
   * Generates a CDN-optimized URL with format, width, and quality parameters
   */
  public static getOptimizedImageUrl(
    rawSrc: string,
    options: ImageTransformOptions = {}
  ): string {
    if (!rawSrc) return '';

    const width = options.width || 800;
    const quality = options.quality || 80;
    const format = options.format || 'auto';
    const fit = options.fit || 'cover';

    try {
      // Unsplash CDN support
      if (rawSrc.includes('images.unsplash.com')) {
        const url = new URL(rawSrc);
        url.searchParams.set('w', width.toString());
        url.searchParams.set('q', quality.toString());
        url.searchParams.set('auto', 'format');
        url.searchParams.set('fit', fit === 'cover' ? 'crop' : 'max');
        if (options.height) url.searchParams.set('h', options.height.toString());
        if (format !== 'auto') url.searchParams.set('fm', format);
        return url.toString();
      }

      // Cloudinary support
      if (rawSrc.includes('res.cloudinary.com')) {
        const parts = rawSrc.split('/upload/');
        if (parts.length === 2) {
          const transform = `f_auto,q_${quality},w_${width},c_${fit}`;
          return `${parts[0]}/upload/${transform}/${parts[1]}`;
        }
      }

      // Generic CDN query params fallback
      if (rawSrc.startsWith('http://') || rawSrc.startsWith('https://')) {
        const url = new URL(rawSrc);
        url.searchParams.set('w', width.toString());
        url.searchParams.set('q', quality.toString());
        url.searchParams.set('f', format);
        return url.toString();
      }

      return rawSrc;
    } catch {
      return rawSrc;
    }
  }

  /**
   * Generates a responsive srcset attribute across standard sports viewport widths
   */
  public static generateSrcset(
    rawSrc: string,
    widths: number[] = [320, 640, 768, 1024, 1280]
  ): string {
    if (!rawSrc) return '';

    return widths
      .map((w) => `${MediaOptimizer.getOptimizedImageUrl(rawSrc, { width: w })} ${w}w`)
      .join(', ');
  }

  /**
   * Returns immutable edge caching headers for sports media delivery
   */
  public static getEdgeCacheHeaders(
    policy: 'immutable_asset' | 'sports_live_api' | 'syndication_feed'
  ): Record<string, string> {
    switch (policy) {
      case 'immutable_asset':
        return {
          'Cache-Control': 'public, max-age=31536000, immutable',
          'Vary': 'Accept, Accept-Encoding',
        };
      case 'sports_live_api':
        return {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
          'Vary': 'Accept-Encoding, x-tenant-slug',
        };
      case 'syndication_feed':
        return {
          'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
          'Vary': 'Accept-Encoding, x-tenant-slug',
        };
    }
  }
}

export default MediaOptimizer;
