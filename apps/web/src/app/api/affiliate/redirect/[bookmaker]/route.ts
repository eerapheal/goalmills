import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { cacheGet, cacheSet } from '@/lib/redisCache';
import {
  getCanonicalBookmaker,
  isAuthorizedBookmakerDestination,
  renderAffiliateTrackingTemplate,
  hashIpForTelemetry,
  isBettingFeatureEnabled,
} from '@/lib/betting';
import AffiliateLinkModel from '@/models/AffiliateLink';
import AffiliateProgramModel from '@/models/AffiliateProgram';
import AffiliateClickModel from '@/models/AffiliateClick';
import crypto from 'crypto';

const RATE_LIMIT_WINDOW_SECS = 60;
const MAX_CLICKS_PER_WINDOW = 30;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookmaker: string }> }
) {
  try {
    const { bookmaker: rawBookmaker } = await params;
    const bookmaker = getCanonicalBookmaker(rawBookmaker);

    if (!bookmaker) {
      return NextResponse.json(
        { error: 'Unrecognized or unwhitelisted bookmaker operator' },
        { status: 404 }
      );
    }

    if (bookmaker.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'This bookmaker operator is currently not active' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const campaign = searchParams.get('campaign') || 'general';
    const placement = searchParams.get('placement') || 'odds_table';
    const eventId = searchParams.get('eventId') || undefined;
    const marketId = searchParams.get('marketId') || undefined;
    const selectionId = searchParams.get('selectionId') || undefined;
    const country = searchParams.get('country') || undefined;
    const sport = searchParams.get('sport') || 'football';

    // 1. IP Rate Limiting via Redis / In-Memory Cache
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
    const ipHash = hashIpForTelemetry(ip);
    const rateLimitKey = `rate:affiliate:${ipHash}`;

    const recentCount = (await cacheGet<number>(rateLimitKey)) || 0;
    if (recentCount >= MAX_CLICKS_PER_WINDOW) {
      return NextResponse.json(
        { error: 'Too many redirect requests. Please slow down.' },
        { status: 429 }
      );
    }
    await cacheSet(rateLimitKey, recentCount + 1, RATE_LIMIT_WINDOW_SECS);

    // 2. Resolve Destination URL from DB or Canonical Config
    let destinationUrl = bookmaker.websiteUrl;
    let affiliateLinkId: string | undefined;

    if (isBettingFeatureEnabled('affiliateLinks')) {
      try {
        await dbConnect();

        // Find active campaign-specific or placement-specific link
        const linkDoc = await AffiliateLinkModel.findOne({
          bookmakerId: bookmaker.id,
          status: 'ACTIVE',
          $or: [
            { campaign, placement },
            { placement },
            { campaign },
            { placement: 'odds_table' },
          ],
        }).lean();

        if (linkDoc && linkDoc.destinationUrl) {
          affiliateLinkId = String(linkDoc._id || linkDoc.id);
          const clickId = `clk_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

          if (linkDoc.trackingTemplate) {
            destinationUrl = renderAffiliateTrackingTemplate(linkDoc.trackingTemplate, {
              affiliateId: linkDoc.affiliateProgramId || 'goalmills',
              clickId,
              campaign,
              placement,
              sport,
            });
          } else {
            destinationUrl = linkDoc.destinationUrl;
          }
        } else {
          // Check AffiliateProgram for default tracking template
          const programDoc = await AffiliateProgramModel.findOne({
            bookmakerId: bookmaker.id,
            status: 'ACTIVE',
          }).lean();

          if (programDoc && programDoc.trackingTemplate) {
            const clickId = `clk_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
            destinationUrl = renderAffiliateTrackingTemplate(programDoc.trackingTemplate, {
              affiliateId: programDoc.affiliateId,
              clickId,
              campaign,
              placement,
              sport,
            });
          }
        }
      } catch (dbErr) {
        console.error('[AffiliateRedirect] DB resolution error, falling back to canonical URL:', dbErr);
      }
    }

    // 3. Strict Anti-Open-Redirect Security Validation
    if (!isAuthorizedBookmakerDestination(destinationUrl, bookmaker.id)) {
      console.warn(`[Security Alert] Unauthorized destination attempted for ${bookmaker.id}: ${destinationUrl}`);
      destinationUrl = bookmaker.websiteUrl; // Force canonical domain fallback
    }

    // 4. Record Non-PII Click Telemetry
    if (isBettingFeatureEnabled('affiliateTracking')) {
      // Async fire-and-forget telemetry recording
      (async () => {
        try {
          await dbConnect();
          await AffiliateClickModel.create({
            affiliateLinkId,
            bookmakerId: bookmaker.id,
            eventId,
            marketId,
            selectionId,
            placement,
            campaign,
            country: country || request.headers.get('cf-ipcountry') || 'GLOBAL',
            deviceType: request.headers.get('sec-ch-ua-mobile') === '?1' ? 'mobile' : 'desktop',
            referrer: request.headers.get('referer') || '',
            destinationUrl,
            ipHash,
            createdAt: new Date(),
          });

          if (affiliateLinkId) {
            await AffiliateLinkModel.updateOne(
              { _id: affiliateLinkId },
              { $inc: { clickCount: 1 } }
            ).catch(() => {});
          }
        } catch (logErr) {
          console.error('[AffiliateClick] Telemetry logging error:', logErr);
        }
      })();
    }

    // 5. Secure HTTP 307 Temporary Redirect
    return NextResponse.redirect(destinationUrl, {
      status: 307,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Referrer-Policy': 'no-referrer-when-downgrade',
      },
    });
  } catch (error) {
    console.error('[AffiliateRedirect] Unexpected error:', error);
    return NextResponse.redirect('https://goalmills.com', { status: 302 });
  }
}
