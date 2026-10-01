import dbConnect from '@/lib/db';
import BetSlipModel from '@/models/BetSlip';
import { SavedBetSlip, BetSlipLeg } from '@goalmills/types';
import crypto from 'crypto';

export function generatePublicSlipId(): string {
  const timeHex = Date.now().toString(36);
  const randHex = crypto.randomBytes(3).toString('hex');
  return `gm_slip_${timeHex}_${randHex}`;
}

export interface CreateBetSlipParams {
  userId?: string;
  title?: string;
  sourceBookmaker: string;
  originalCode?: string;
  totalOdds: number;
  legs: BetSlipLeg[];
  isPublic?: boolean;
  stake?: number;
  tags?: string[];
  notes?: string;
}

/**
 * Saves a new accumulator bet slip to the database with a secure unique publicId.
 */
export async function saveBetSlip(params: CreateBetSlipParams): Promise<SavedBetSlip> {
  await dbConnect();

  const publicId = generatePublicSlipId();
  const title = params.title || `Acca (${params.legs.length} Legs)`;
  const legCount = params.legs.length;
  const stake = params.stake || 10;
  const potentialPayout = parseFloat((stake * params.totalOdds).toFixed(2));

  const doc = await BetSlipModel.create({
    publicId,
    userId: params.userId,
    title,
    sourceBookmaker: params.sourceBookmaker,
    originalCode: params.originalCode || '',
    totalOdds: params.totalOdds,
    legCount,
    legs: params.legs,
    isPublic: Boolean(params.isPublic),
    status: 'ACTIVE',
    tags: params.tags || [],
    notes: params.notes || '',
    stake,
    potentialPayout,
    currency: 'EUR',
  });

  return doc.toObject ? doc.toObject() : doc;
}

/**
 * Retrieves saved slips for a user.
 */
export async function getUserSavedSlips(userId?: string): Promise<SavedBetSlip[]> {
  await dbConnect();
  const query = userId ? { userId } : {};
  const docs = await BetSlipModel.find(query).sort({ createdAt: -1 }).limit(50).lean();
  return docs as unknown as SavedBetSlip[];
}

/**
 * Retrieves a slip by internal ID (verifying user ownership).
 */
export async function getBetSlipById(id: string, userId?: string): Promise<SavedBetSlip | null> {
  await dbConnect();
  const query: any = { _id: id };
  if (userId) query.userId = userId;
  const doc = await BetSlipModel.findOne(query).lean();
  return doc as unknown as SavedBetSlip | null;
}

/**
 * Updates title, isPublic, notes, status of a slip.
 */
export async function updateBetSlip(
  id: string,
  userId: string | undefined,
  updates: Partial<SavedBetSlip>
): Promise<SavedBetSlip | null> {
  await dbConnect();
  const query: any = { _id: id };
  if (userId) query.userId = userId;

  const doc = await BetSlipModel.findOneAndUpdate(
    query,
    { $set: updates },
    { new: true }
  ).lean();

  return doc as unknown as SavedBetSlip | null;
}

/**
 * Deletes a slip.
 */
export async function deleteBetSlip(id: string, userId?: string): Promise<boolean> {
  await dbConnect();
  const query: any = { _id: id };
  if (userId) query.userId = userId;
  const res = await BetSlipModel.deleteOne(query);
  return (res.deletedCount || 0) > 0;
}

/**
 * Retrieves a public slip by publicId.
 * Strictly checks isPublic, sanitizes personal info, and returns public view.
 */
export async function getPublicBetSlip(publicId: string): Promise<SavedBetSlip | null> {
  await dbConnect();
  const doc = await BetSlipModel.findOne({ publicId, isPublic: true }).lean();
  if (!doc) return null;

  // Sanitize personal and sensitive internal fields
  const sanitized: SavedBetSlip = {
    id: String(doc._id),
    publicId: doc.publicId,
    title: doc.title,
    sourceBookmaker: doc.sourceBookmaker,
    originalCode: doc.originalCode,
    totalOdds: doc.totalOdds,
    legCount: doc.legCount,
    legs: doc.legs,
    isPublic: true,
    status: doc.status,
    tags: doc.tags,
    notes: doc.notes,
    potentialPayout: doc.potentialPayout,
    stake: doc.stake,
    currency: doc.currency,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };

  return sanitized;
}
