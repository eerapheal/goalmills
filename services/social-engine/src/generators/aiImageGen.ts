/**
 * GoalMills Social Engine — AI Image Background Generator
 *
 * Uses Pollinations.ai (100% free, no API key required) to generate
 * photorealistic stadium atmospheres and dramatic sports match imagery.
 *
 * Includes an ultra-fast procedural SVG/Sharp gradient fallback so
 * graphic generation never blocks or fails during network slowdowns.
 */

import axios from 'axios';
import sharp from 'sharp';
import { logger } from '../utils/logger';

/**
 * Generate a dynamic matchday stadium background image using Pollinations.ai.
 *
 * @param homeTeam - Home team name
 * @param awayTeam - Away team name
 * @param league - League name
 * @param width - Image width (default: 1200)
 * @param height - Image height (default: 630)
 */
export async function generateMatchBackground(
  homeTeam: string,
  awayTeam: string,
  league: string,
  width = 1200,
  height = 630
): Promise<Buffer> {
  const prompt = encodeURIComponent(
    `dramatic football stadium at night under floodlights, cinematic atmospheric haze, ${homeTeam} versus ${awayTeam}, professional sports arena, empty pitch, dark moody volumetric lighting, photorealistic 8k, no text, no logos, no watermarks`
  );

  const seed = Math.floor(Math.random() * 1000000);
  const pollinationsUrl = `https://image.pollinations.ai/prompt/${prompt}?width=${width}&height=${height}&seed=${seed}&nologo=true`;

  try {
    const response = await axios.get(pollinationsUrl, {
      responseType: 'arraybuffer',
      timeout: 10000, // 10s timeout
    });

    if (response.status === 200 && response.data) {
      const buffer = Buffer.from(response.data);
      // Ensure image is formatted cleanly to target dimensions
      return await sharp(buffer)
        .resize(width, height, { fit: 'cover' })
        .png()
        .toBuffer();
    }
  } catch (err: any) {
    logger.warn('Pollinations.ai background generation timed out/failed, using premium gradient fallback', {
      error: err.message,
    });
  }

  // High-fidelity dark procedural background fallback
  return generateProceduralBackground(homeTeam, awayTeam, width, height);
}

/**
 * Procedural stadium-inspired dark gradient background (Sharp/SVG).
 * Fast, offline-capable, and ultra-crisp.
 */
export async function generateProceduralBackground(
  homeTeam: string,
  awayTeam: string,
  width = 1200,
  height = 630
): Promise<Buffer> {
  const svg = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <!-- Base Dark Mesh Gradient -->
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0a0e17" />
        <stop offset="45%" stop-color="#0f172a" />
        <stop offset="100%" stop-color="#050811" />
      </linearGradient>

      <!-- Stadium Floodlight Glows -->
      <radialGradient id="topGlow" cx="50%" cy="0%" r="60%">
        <stop offset="0%" stop-color="#1e3a8a" stop-opacity="0.45" />
        <stop offset="70%" stop-color="#0f172a" stop-opacity="0.0" />
      </radialGradient>

      <radialGradient id="homeGlow" cx="20%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#0284c7" stop-opacity="0.25" />
        <stop offset="100%" stop-color="#0284c7" stop-opacity="0" />
      </radialGradient>

      <radialGradient id="awayGlow" cx="80%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.25" />
        <stop offset="100%" stop-color="#3b82f6" stop-opacity="0" />
      </radialGradient>

      <!-- Subtle Pitch Line Grid Pattern -->
      <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
        <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#1e293b" stroke-width="0.75" stroke-opacity="0.4" />
      </pattern>
    </defs>

    <!-- Background Base -->
    <rect width="${width}" height="${height}" fill="url(#bgGrad)" />
    <rect width="${width}" height="${height}" fill="url(#grid)" />

    <!-- Lighting overlays -->
    <rect width="${width}" height="${height}" fill="url(#topGlow)" />
    <rect width="${width}" height="${height}" fill="url(#homeGlow)" />
    <rect width="${width}" height="${height}" fill="url(#awayGlow)" />

    <!-- Center Pitch Vignette Circle -->
    <circle cx="${width / 2}" cy="${height / 2}" r="${Math.min(width, height) * 0.35}" fill="none" stroke="#334155" stroke-width="1.5" stroke-opacity="0.3" stroke-dasharray="8 6" />
    <line x1="${width / 2}" y1="0" x2="${width / 2}" y2="${height}" stroke="#334155" stroke-width="1.5" stroke-opacity="0.25" />
  </svg>
  `;

  return sharp(Buffer.from(svg)).png().toBuffer();
}
