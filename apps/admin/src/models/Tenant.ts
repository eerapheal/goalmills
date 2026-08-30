import mongoose from 'mongoose';

const TenantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a tenant organization name'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Please provide a tenant slug'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[a-z0-9-]+$/, 'Tenant slug can only contain lowercase alphanumeric characters and hyphens'],
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'trial', 'cancelled'],
      default: 'active',
      index: true,
    },
    plan: {
      type: String,
      enum: ['free', 'creator', 'publisher', 'enterprise'],
      default: 'free',
    },
    customDomain: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true,
      unique: true,
    },
    settings: {
      brandName: { type: String, default: '' },
      logoUrl: { type: String, default: '' },
      faviconUrl: { type: String, default: '' },
      primaryColor: { type: String, default: '#3B82F6' },
      accentColor: { type: String, default: '#F59E0B' },
      defaultSport: { type: String, default: 'football' },
      supportedSports: { type: [String], default: ['football', 'cricket', 'basketball'] },
      contactEmail: { type: String, default: '' },
    },
    features: {
      newsletter: { type: Boolean, default: true },
      videoHighlights: { type: Boolean, default: true },
      advancedAds: { type: Boolean, default: false },
      customDomain: { type: Boolean, default: false },
      apiAccess: { type: Boolean, default: false },
      customThemes: { type: Boolean, default: false },
      sportsPredictions: { type: Boolean, default: true },
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
  },
  { timestamps: true }
);

TenantSchema.index({ slug: 1 });
TenantSchema.index({ customDomain: 1 }, { sparse: true });
TenantSchema.index({ status: 1 });

export default mongoose.models.Tenant || mongoose.model('Tenant', TenantSchema);
