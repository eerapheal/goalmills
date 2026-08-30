import { describe, it, expect } from 'vitest';
import { MediaOptimizer } from '../mediaOptimizer';

describe('Phase 10A: Global Media & CDN Optimizer', () => {
  it('should transform Unsplash image URLs with width, quality, and format negotiation', () => {
    const rawUrl = 'https://images.unsplash.com/photo-1522778119026-d647f0596c20';
    const optimized = MediaOptimizer.getOptimizedImageUrl(rawUrl, {
      width: 1200,
      quality: 85,
      format: 'webp',
    });

    expect(optimized).toContain('w=1200');
    expect(optimized).toContain('q=85');
    expect(optimized).toContain('fm=webp');
  });

  it('should generate responsive srcset string across standard viewports', () => {
    const rawUrl = 'https://images.unsplash.com/photo-1522778119026-d647f0596c20';
    const srcset = MediaOptimizer.generateSrcset(rawUrl, [320, 640, 1024]);

    expect(srcset).toContain('320w');
    expect(srcset).toContain('640w');
    expect(srcset).toContain('1024w');
  });

  it('should return correct edge caching policies for static assets and live APIs', () => {
    const immutableHeaders = MediaOptimizer.getEdgeCacheHeaders('immutable_asset');
    expect(immutableHeaders['Cache-Control']).toContain('max-age=31536000');
    expect(immutableHeaders['Cache-Control']).toContain('immutable');

    const liveHeaders = MediaOptimizer.getEdgeCacheHeaders('sports_live_api');
    expect(liveHeaders['Cache-Control']).toContain('s-maxage=30');
    expect(liveHeaders['Cache-Control']).toContain('stale-while-revalidate=60');
  });
});
