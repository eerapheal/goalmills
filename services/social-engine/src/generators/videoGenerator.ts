/**
 * GoalMills Social Engine — Video Slide Generator
 *
 * Converts scorecard graphics into short (5-second) animated MP4 videos
 * for video-first platforms like TikTok and YouTube Shorts.
 *
 * Uses child_process ffmpeg if available on the host system,
 * or gracefully returns the image buffer for platforms that accept photo modes.
 */

import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { logger } from '../utils/logger';

const execAsync = promisify(exec);

/**
 * Check if ffmpeg binary is available on the machine.
 */
let ffmpegAvailable: boolean | null = null;

async function checkFfmpeg(): Promise<boolean> {
  if (ffmpegAvailable !== null) return ffmpegAvailable;
  try {
    await execAsync('ffmpeg -version');
    ffmpegAvailable = true;
    return true;
  } catch {
    ffmpegAvailable = false;
    return false;
  }
}

/**
 * Convert an image buffer to a 5-second vertical/standard MP4 video with subtle zoom.
 *
 * @param imageBuffer - PNG image buffer
 * @param durationSeconds - Video length in seconds (default: 5)
 */
export async function convertImageToVideo(
  imageBuffer: Buffer,
  durationSeconds = 5
): Promise<Buffer | null> {
  const hasFfmpeg = await checkFfmpeg();
  if (!hasFfmpeg) {
    logger.warn('ffmpeg is not installed on system; skipping video slide conversion');
    return null;
  }

  const tmpDir = os.tmpdir();
  const inputPath = path.join(tmpDir, `gm_img_${Date.now()}_${Math.random().toString(36).slice(2)}.png`);
  const outputPath = path.join(tmpDir, `gm_vid_${Date.now()}_${Math.random().toString(36).slice(2)}.mp4`);

  try {
    await fs.writeFile(inputPath, imageBuffer);

    // ffmpeg command: create video from image with subtle zoompan effect
    const ffmpegCmd = `ffmpeg -y -loop 1 -i "${inputPath}" -c:v libx264 -t ${durationSeconds} -pix_fmt yuv420p -vf "scale=1280:720,zoompan=z='min(zoom+0.001,1.05)':d=${durationSeconds * 25}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'" -r 25 "${outputPath}"`;

    await execAsync(ffmpegCmd);

    const videoBuffer = await fs.readFile(outputPath);
    return videoBuffer;
  } catch (err: any) {
    logger.error('Failed to convert image to video via ffmpeg', err);
    return null;
  } finally {
    // Clean up temporary files
    try {
      await fs.unlink(inputPath);
      await fs.unlink(outputPath);
    } catch {}
  }
}
