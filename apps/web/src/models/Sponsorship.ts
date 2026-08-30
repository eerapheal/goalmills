import mongoose from 'mongoose';

export interface ISponsorshipTargeting {
  sports?: string[];
  competitions?: string[];
  teams?: string[];
  devices?: ('all' | 'desktop' | 'mobile' | 'tablet')[];
  countries?: string[];
}

export interface ISponsorshipBudgetControls {
  dailyBudget?: number;
  totalBudget?: number;
  maxImpressions?: number;
  maxClicks?: number;
  cpmRate?: number;
  cpcRate?: number;
  pacing?: 'even' | 'asap';
}

export interface ISponsorship {
  _id?: string;
  title: string;
  sponsorName: string;
  sponsorLogo?: string;
  type: 'banner' | 'match_card' | 'article_header' | 'affiliate_link' | 'newsletter_sponsor' | 'video_sponsor';
  placement:
    | 'homepage_hero'
    | 'sports_pulse'
    | 'match_details'
    | 'newsletter_footer'
    | 'global_sidebar'
    | 'article_inline'
    | 'breaking_ticker'
    | 'video_preroll'
    | 'mobile_interstitial';
  targetUrl: string;
  imageUrl?: string;
  tagline?: string;
  ctaText: string;
  sportSlug: 'all' | 'football' | 'cricket' | 'basketball' | 'tennis' | 'baseball' | 'hockey' | string;
  badgeText: string;
  status: 'active' | 'paused' | 'expired' | 'draft' | 'trash';
  startDate: Date;
  endDate?: Date;
  impressions: number;
  clicks: number;
  ctr?: number;
  spent?: number;
  priority: number;
  budget?: number;
  targeting?: ISponsorshipTargeting;
  budgetControls?: ISponsorshipBudgetControls;
  tenantId?: string;
  tenantSlug?: string;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const SponsorshipSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Please provide a sponsorship title'], trim: true },
    sponsorName: { type: String, required: [true, 'Please provide the sponsor name'], trim: true },
    sponsorLogo: { type: String, required: false },
    type: {
      type: String,
      enum: ['banner', 'match_card', 'article_header', 'affiliate_link', 'newsletter_sponsor', 'video_sponsor'],
      default: 'banner',
      index: true,
    },
    placement: {
      type: String,
      enum: [
        'homepage_hero',
        'sports_pulse',
        'match_details',
        'newsletter_footer',
        'global_sidebar',
        'article_inline',
        'breaking_ticker',
        'video_preroll',
        'mobile_interstitial',
      ],
      default: 'homepage_hero',
      index: true,
    },
    targetUrl: { type: String, required: [true, 'Please provide target URL'] },
    imageUrl: { type: String, required: false },
    tagline: { type: String, required: false },
    ctaText: { type: String, default: 'Learn More' },
    sportSlug: {
      type: String,
      default: 'all',
      index: true,
    },
    badgeText: { type: String, default: 'SPONSORED' },
    status: {
      type: String,
      enum: ['active', 'paused', 'expired', 'draft', 'trash'],
      default: 'active',
      index: true,
    },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: false },
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    ctr: { type: Number, default: 0 },
    spent: { type: Number, default: 0 },
    priority: { type: Number, default: 1 },
    budget: { type: Number, required: false },
    targeting: {
      sports: [{ type: String }],
      competitions: [{ type: String }],
      teams: [{ type: String }],
      devices: [{ type: String }],
      countries: [{ type: String }],
    },
    budgetControls: {
      dailyBudget: { type: Number },
      totalBudget: { type: Number },
      maxImpressions: { type: Number },
      maxClicks: { type: Number },
      cpmRate: { type: Number },
      cpcRate: { type: Number },
      pacing: { type: String, enum: ['even', 'asap'], default: 'asap' },
    },
    tenantId: { type: String, default: 'default', index: true },
    tenantSlug: { type: String, default: 'goalmills', index: true },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, required: false },
    deletedBy: { type: String, required: false },
  },
  { timestamps: true }
);

SponsorshipSchema.index({ tenantId: 1, status: 1, placement: 1, priority: -1 });
SponsorshipSchema.index({ status: 1, isDeleted: 1, priority: -1 });

export default mongoose.models.Sponsorship || mongoose.model('Sponsorship', SponsorshipSchema);
