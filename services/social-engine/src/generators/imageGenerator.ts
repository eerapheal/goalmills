/**
 * GoalMills Social Engine — Master Image Generator
 *
 * Composites dynamic AI backgrounds (Pollinations.ai / procedural mesh)
 * with razor-sharp SVG vector templates using Sharp.
 *
 * Produces production-ready, ultra-high-resolution PNG graphics
 * formatted for Twitter, Telegram, Facebook, LinkedIn, WhatsApp.
 */

import sharp from 'sharp';
import { generateMatchBackground } from './aiImageGen';
import {
  renderUpcomingFixturesSvg,
  type UpcomingFixturesData,
} from './templates/upcomingFixtures';
import {
  renderPreMatchCardSvg,
  type PreMatchData,
} from './templates/preMatchCard';
import {
  renderHalftimeScorecardSvg,
  type HalftimeScorecardData,
} from './templates/halftimeScorecard';
import {
  renderFulltimeScorecardSvg,
  type FulltimeScorecardData,
} from './templates/fulltimeScorecard';
import {
  renderPostMatchSummarySvg,
  type PostMatchSummaryData,
} from './templates/postMatchSummary';
import { logger } from '../utils/logger';

const CARD_WIDTH = 1200;
const CARD_HEIGHT = 675;

/**
 * Generate weekly upcoming fixtures list graphic.
 */
export async function generateUpcomingFixturesGraphic(
  data: UpcomingFixturesData
): Promise<Buffer> {
  try {
    const bgBuffer = await generateMatchBackground(
      data.leagueName,
      'Matchweek',
      data.leagueName,
      CARD_WIDTH,
      CARD_HEIGHT
    );

    const svgString = renderUpcomingFixturesSvg(data, CARD_WIDTH, CARD_HEIGHT);
    const overlayBuffer = Buffer.from(svgString);

    return await sharp(bgBuffer)
      .composite([{ input: overlayBuffer, top: 0, left: 0 }])
      .png({ quality: 90 })
      .toBuffer();
  } catch (err) {
    logger.error('Failed to generate upcoming fixtures graphic', err);
    throw err;
  }
}

/**
 * Generate pre-match clash preview card (2 days ahead).
 */
export async function generatePreMatchGraphic(
  data: PreMatchData
): Promise<Buffer> {
  try {
    const bgBuffer = await generateMatchBackground(
      data.homeTeam,
      data.awayTeam,
      data.leagueName,
      CARD_WIDTH,
      CARD_HEIGHT
    );

    const svgString = renderPreMatchCardSvg(data, CARD_WIDTH, CARD_HEIGHT);
    const overlayBuffer = Buffer.from(svgString);

    return await sharp(bgBuffer)
      .composite([{ input: overlayBuffer, top: 0, left: 0 }])
      .png({ quality: 90 })
      .toBuffer();
  } catch (err) {
    logger.error('Failed to generate pre-match graphic', err);
    throw err;
  }
}

/**
 * Generate live Half-Time scorecard graphic.
 */
export async function generateHalftimeGraphic(
  data: HalftimeScorecardData
): Promise<Buffer> {
  try {
    const bgBuffer = await generateMatchBackground(
      data.homeTeam,
      data.awayTeam,
      data.leagueName,
      CARD_WIDTH,
      CARD_HEIGHT
    );

    const svgString = renderHalftimeScorecardSvg(data, CARD_WIDTH, CARD_HEIGHT);
    const overlayBuffer = Buffer.from(svgString);

    return await sharp(bgBuffer)
      .composite([{ input: overlayBuffer, top: 0, left: 0 }])
      .png({ quality: 90 })
      .toBuffer();
  } catch (err) {
    logger.error('Failed to generate halftime graphic', err);
    throw err;
  }
}

/**
 * Generate live Full-Time scorecard graphic with complete stats comparison.
 */
export async function generateFulltimeGraphic(
  data: FulltimeScorecardData
): Promise<Buffer> {
  try {
    const bgBuffer = await generateMatchBackground(
      data.homeTeam,
      data.awayTeam,
      data.leagueName,
      CARD_WIDTH,
      CARD_HEIGHT
    );

    const svgString = renderFulltimeScorecardSvg(data, CARD_WIDTH, CARD_HEIGHT);
    const overlayBuffer = Buffer.from(svgString);

    return await sharp(bgBuffer)
      .composite([{ input: overlayBuffer, top: 0, left: 0 }])
      .png({ quality: 90 })
      .toBuffer();
  } catch (err) {
    logger.error('Failed to generate fulltime graphic', err);
    throw err;
  }
}

/**
 * Generate post-match editorial report card with MOTM.
 */
export async function generatePostMatchGraphic(
  data: PostMatchSummaryData
): Promise<Buffer> {
  try {
    const bgBuffer = await generateMatchBackground(
      data.homeTeam,
      data.awayTeam,
      data.leagueName,
      CARD_WIDTH,
      CARD_HEIGHT
    );

    const svgString = renderPostMatchSummarySvg(data, CARD_WIDTH, CARD_HEIGHT);
    const overlayBuffer = Buffer.from(svgString);

    return await sharp(bgBuffer)
      .composite([{ input: overlayBuffer, top: 0, left: 0 }])
      .png({ quality: 90 })
      .toBuffer();
  } catch (err) {
    logger.error('Failed to generate post-match graphic', err);
    throw err;
  }
}
