import {
  AffiliateProviderInterface,
  AffiliateLinkRequest,
  AffiliateClickTrackRequest,
  AffiliateClickRecord,
  AffiliateConversionRecord,
  AffiliateConversionFilter,
  AffiliateCommissionRule,
  BettingCampaignDTO,
} from '@goalmills/types';
import dbConnect from '@/lib/db';
import AffiliateProgramModel from '@/models/AffiliateProgram';
import AffiliateLinkModel from '@/models/AffiliateLink';
import AffiliateClickModel from '@/models/AffiliateClick';
import AffiliateConversionModel from '@/models/AffiliateConversion';
import AffiliateCommissionRuleModel from '@/models/AffiliateCommissionRule';
import BettingCampaignModel from '@/models/BettingCampaign';
import {
  getCanonicalBookmaker,
  isAuthorizedBookmakerDestination,
  renderAffiliateTrackingTemplate,
  hashIpForTelemetry,
} from '@/lib/betting';
import crypto from 'crypto';

/**
 * 1. Bookmaker Direct Provider (Internal GoalMills DB Configuration)
 */
export class BookmakerDirectProvider implements AffiliateProviderInterface {
  readonly id = 'direct';
  readonly name = 'GoalMills Direct Bookmaker Integrator';

  async getAffiliateLink(req: AffiliateLinkRequest): Promise<string> {
    const bookmaker = getCanonicalBookmaker(req.bookmakerId);
    if (!bookmaker) throw new Error(`Unknown bookmaker: ${req.bookmakerId}`);

    await dbConnect();
    const linkDoc = await AffiliateLinkModel.findOne({
      bookmakerId: bookmaker.id,
      status: 'ACTIVE',
      $or: [
        { campaign: req.campaign, placement: req.placement },
        { placement: req.placement },
        { campaign: req.campaign },
      ],
    }).lean();

    if (linkDoc && linkDoc.destinationUrl) {
      const clickId = `clk_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      if (linkDoc.trackingTemplate) {
        return renderAffiliateTrackingTemplate(linkDoc.trackingTemplate, {
          affiliateId: linkDoc.affiliateProgramId || 'goalmills',
          clickId,
          campaign: req.campaign || 'general',
          placement: req.placement || 'odds_table',
          sport: req.sport || 'football',
        });
      }
      return linkDoc.destinationUrl;
    }

    const programDoc = await AffiliateProgramModel.findOne({
      bookmakerId: bookmaker.id,
      status: 'ACTIVE',
    }).lean();

    if (programDoc && programDoc.trackingTemplate) {
      const clickId = `clk_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      return renderAffiliateTrackingTemplate(programDoc.trackingTemplate, {
        affiliateId: programDoc.affiliateId,
        clickId,
        campaign: req.campaign || 'general',
        placement: req.placement || 'odds_table',
        sport: req.sport || 'football',
      });
    }

    return bookmaker.websiteUrl;
  }

  async trackClick(req: AffiliateClickTrackRequest): Promise<AffiliateClickRecord> {
    await dbConnect();
    const clickId = `clk_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const ipHash = hashIpForTelemetry(req.ip);
    const bookmaker = getCanonicalBookmaker(req.bookmakerId);
    const destinationUrl = bookmaker?.websiteUrl || 'https://goalmills.com';

    await AffiliateClickModel.create({
      affiliateLinkId: req.affiliateLinkId,
      bookmakerId: req.bookmakerId,
      eventId: req.eventId,
      placement: req.placement,
      campaign: req.campaign || 'general',
      deviceType: req.deviceType || 'desktop',
      referrer: req.referrer || '',
      destinationUrl,
      ipHash,
      createdAt: new Date(),
    });

    return {
      clickId,
      bookmakerId: req.bookmakerId,
      redirectUrl: destinationUrl,
      trackedAt: new Date(),
    };
  }

  async getConversions(filter?: AffiliateConversionFilter): Promise<AffiliateConversionRecord[]> {
    await dbConnect();
    const query: Record<string, any> = {};
    if (filter?.bookmakerId) query.bookmakerId = filter.bookmakerId;
    if (filter?.status) query.status = filter.status;
    if (filter?.since) query.convertedAt = { $gte: filter.since };

    const docs = await AffiliateConversionModel.find(query)
      .sort({ convertedAt: -1 })
      .limit(filter?.limit || 50)
      .lean();

    return docs.map((d: any) => ({
      id: String(d._id || d.id),
      clickId: d.clickId,
      bookmakerId: d.bookmakerId,
      conversionType: d.conversionType,
      conversionValue: d.conversionValue,
      currency: d.currency || 'EUR',
      status: d.status,
      convertedAt: d.convertedAt,
    }));
  }

  async getCommission(bookmakerId: string): Promise<AffiliateCommissionRule[]> {
    await dbConnect();
    const docs = await AffiliateCommissionRuleModel.find({
      bookmakerId,
      status: 'ACTIVE',
    }).lean();

    return docs.map((d: any) => ({
      id: String(d._id || d.id),
      bookmakerId: d.bookmakerId,
      provider: d.provider || 'DIRECT',
      country: d.country,
      commissionType: d.commissionType,
      commissionValue: d.commissionValue,
      currency: d.currency,
      effectiveFrom: d.effectiveFrom,
      status: d.status,
    }));
  }

  async getCampaigns(): Promise<BettingCampaignDTO[]> {
    await dbConnect();
    const docs = await BettingCampaignModel.find({ status: 'ACTIVE' }).lean();
    return docs.map((d: any) => ({
      id: String(d._id || d.id),
      name: d.name,
      sport: d.sport,
      country: d.country,
      bookmakers: d.bookmakers || [],
      placements: d.placements || [],
      startAt: d.startAt,
      endAt: d.endAt,
      budget: d.budget || { total: 0, daily: 0, spent: 0, currency: 'EUR' },
      status: d.status,
    }));
  }
}

/**
 * 2. Betloy Affiliate Provider Adapter
 */
export class BetloyAffiliateProvider extends BookmakerDirectProvider {
  override readonly id = 'betloy';
  override readonly name = 'Betloy Affiliate Network';

  override async getAffiliateLink(req: AffiliateLinkRequest): Promise<string> {
    // Betloy-enhanced tracking with subid forwarding
    const directUrl = await super.getAffiliateLink(req);
    try {
      const url = new URL(directUrl);
      url.searchParams.set('partner', 'betloy_gm');
      if (req.subid) url.searchParams.set('subid2', req.subid);
      return url.toString();
    } catch {
      return directUrl;
    }
  }
}

/**
 * 3. Affiliate Network Aggregator Provider (e.g. Income Access, NetRefer, MyAffiliates)
 */
export class AffiliateNetworkProvider extends BookmakerDirectProvider {
  override readonly id = 'network';
  override readonly name = 'Global iGaming Affiliate Network';
}

/**
 * Factory to retrieve configured affiliate provider
 */
export function getAffiliateProvider(providerId: string = 'direct'): AffiliateProviderInterface {
  switch (providerId.toLowerCase()) {
    case 'betloy':
      return new BetloyAffiliateProvider();
    case 'network':
      return new AffiliateNetworkProvider();
    case 'direct':
    default:
      return new BookmakerDirectProvider();
  }
}
