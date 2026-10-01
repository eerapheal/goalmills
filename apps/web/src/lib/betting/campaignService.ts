import dbConnect from '@/lib/db';
import BettingCampaignModel from '@/models/BettingCampaign';
import CampaignPlacementModel from '@/models/CampaignPlacement';
import {
  CommercialPlacementType,
  BettingCampaignDTO,
  CampaignPlacementDTO,
} from '@goalmills/types';

export interface CampaignEvaluationResult {
  placement: CampaignPlacementDTO | null;
  bookmakerId: string | null;
  badgeText: string;
  ctaText?: string;
  isSponsored: boolean;
}

/**
 * Creates a new betting campaign with start/end schedules and budget constraints.
 */
export async function createBettingCampaign(
  campaign: Partial<BettingCampaignDTO>
): Promise<BettingCampaignDTO> {
  await dbConnect();
  const doc = await BettingCampaignModel.create({
    name: campaign.name,
    sport: campaign.sport || 'all',
    country: campaign.country || 'GLOBAL',
    bookmakers: campaign.bookmakers || [],
    placements: campaign.placements || [],
    startAt: campaign.startAt || new Date(),
    endAt: campaign.endAt,
    budget: campaign.budget || { total: 0, daily: 0, spent: 0, currency: 'EUR' },
    status: campaign.status || 'ACTIVE',
  });

  return {
    id: String(doc._id || doc.id),
    name: doc.name,
    sport: doc.sport,
    country: doc.country,
    bookmakers: doc.bookmakers,
    placements: doc.placements,
    startAt: doc.startAt,
    endAt: doc.endAt,
    budget: doc.budget,
    status: doc.status,
  };
}

/**
 * Retrieves all active campaigns with optional sport and country filtering.
 */
export async function getActiveCampaigns(filter?: {
  sport?: string;
  country?: string;
}): Promise<BettingCampaignDTO[]> {
  await dbConnect();
  const now = new Date();
  const query: Record<string, any> = {
    status: 'ACTIVE',
    startAt: { $lte: now },
    $or: [{ endAt: { $exists: false } }, { endAt: null }, { endAt: { $gte: now } }],
  };

  if (filter?.sport && filter.sport !== 'all') {
    query.$or = [{ sport: 'all' }, { sport: filter.sport }];
  }

  const docs = await BettingCampaignModel.find(query).lean();
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

/**
 * Attaches a placement specification to a campaign.
 */
export async function registerCampaignPlacement(
  placement: Partial<CampaignPlacementDTO>
): Promise<CampaignPlacementDTO> {
  await dbConnect();
  const doc = await CampaignPlacementModel.create({
    campaignId: placement.campaignId,
    bookmakerId: placement.bookmakerId,
    placement: placement.placement,
    priority: placement.priority || 10,
    badgeText: placement.badgeText || 'SPONSORED',
    customCta: placement.customCta,
    targetCountry: placement.targetCountry || 'GLOBAL',
    status: placement.status || 'ACTIVE',
  });

  return {
    id: String(doc._id || doc.id),
    campaignId: String(doc.campaignId),
    bookmakerId: doc.bookmakerId,
    placement: doc.placement,
    priority: doc.priority,
    badgeText: doc.badgeText,
    customCta: doc.customCta,
    targetCountry: doc.targetCountry,
    impressions: doc.impressions,
    clicks: doc.clicks,
    status: doc.status,
  };
}

/**
 * Evaluates the active campaign placement for a given slot.
 * Enforces that commercial placements NEVER distort objective odds.
 */
export async function evaluatePlacementSlot(
  placementType: CommercialPlacementType,
  country: string = 'GLOBAL'
): Promise<CampaignEvaluationResult> {
  try {
    await dbConnect();
    const doc = await CampaignPlacementModel.findOne({
      placement: placementType,
      status: 'ACTIVE',
      $or: [{ targetCountry: 'GLOBAL' }, { targetCountry: country }],
    })
      .sort({ priority: -1, createdAt: -1 })
      .lean();

    if (!doc) {
      return {
        placement: null,
        bookmakerId: null,
        badgeText: 'AD',
        isSponsored: false,
      };
    }

    // Increment impressions asynchronously
    CampaignPlacementModel.updateOne({ _id: doc._id }, { $inc: { impressions: 1 } }).catch(() => {});

    return {
      placement: {
        id: String(doc._id || doc.id),
        campaignId: String(doc.campaignId),
        bookmakerId: doc.bookmakerId,
        placement: doc.placement,
        priority: doc.priority,
        badgeText: doc.badgeText || 'SPONSORED',
        customCta: doc.customCta,
        targetCountry: doc.targetCountry,
        impressions: doc.impressions + 1,
        clicks: doc.clicks,
        status: doc.status,
      },
      bookmakerId: doc.bookmakerId,
      badgeText: doc.badgeText || 'SPONSORED',
      ctaText: doc.customCta,
      isSponsored: true,
    };
  } catch (err) {
    console.warn('[CampaignService] Placement evaluation error:', err);
    return {
      placement: null,
      bookmakerId: null,
      badgeText: 'AD',
      isSponsored: false,
    };
  }
}
