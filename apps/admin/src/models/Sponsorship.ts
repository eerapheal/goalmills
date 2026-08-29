import mongoose from 'mongoose';

export interface ISponsorship {
  _id?: string;
  title: string;
  sponsorName: string;
  sponsorLogo?: string;
  type: 'banner' | 'match_card' | 'article_header' | 'affiliate_link' | 'newsletter_sponsor';
  placement: 'homepage_hero' | 'sports_pulse' | 'match_details' | 'newsletter_footer' | 'global_sidebar';
  targetUrl: string;
  imageUrl?: string;
  tagline?: string;
  ctaText: string;
  sportSlug: 'all' | 'football' | 'cricket' | 'basketball';
  badgeText: string;
  status: 'active' | 'paused' | 'expired' | 'draft' | 'trash';
  startDate: Date;
  endDate?: Date;
  impressions: number;
  clicks: number;
  priority: number;
  budget?: number;
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
      enum: ['banner', 'match_card', 'article_header', 'affiliate_link', 'newsletter_sponsor'],
      default: 'banner',
      index: true,
    },
    placement: {
      type: String,
      enum: ['homepage_hero', 'sports_pulse', 'match_details', 'newsletter_footer', 'global_sidebar'],
      default: 'homepage_hero',
      index: true,
    },
    targetUrl: { type: String, required: [true, 'Please provide target URL'] },
    imageUrl: { type: String, required: false },
    tagline: { type: String, required: false },
    ctaText: { type: String, default: 'Learn More' },
    sportSlug: {
      type: String,
      enum: ['all', 'football', 'cricket', 'basketball'],
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
    priority: { type: Number, default: 1 },
    budget: { type: Number, required: false },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, required: false },
    deletedBy: { type: String, required: false },
  },
  { timestamps: true }
);

export default mongoose.models.Sponsorship || mongoose.model('Sponsorship', SponsorshipSchema);
