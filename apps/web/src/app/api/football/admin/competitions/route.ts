import { NextRequest, NextResponse } from 'next/server';
import {
  getAllCanonicalCompetitions,
  getCanonicalCompetition,
  PROVIDER_LEAGUE_TO_CANONICAL,
  PRIORITY_CLUBS_LIST,
} from '@/lib/football';
import { CanonicalCompetition } from '@goalmills/types';

// In-memory runtime override store for admin updates during session
const runtimeOverrides = new Map<string, Partial<CanonicalCompetition>>();
const runtimeProviderMappings = new Map<number, string>();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('q')?.toLowerCase().trim() || '';
    const confed = searchParams.get('confederation')?.toUpperCase().trim() || '';
    const country = searchParams.get('country')?.toUpperCase().trim() || '';
    const tier = searchParams.get('tier')?.trim() || '';
    const gender = searchParams.get('gender')?.toUpperCase().trim() || '';
    const isFeatured = searchParams.get('featured');

    const allComps = getAllCanonicalCompetitions();

    // Apply any runtime overrides
    const enriched = allComps.map((comp) => {
      const override = runtimeOverrides.get(comp.id);
      return override ? { ...comp, ...override } : comp;
    });

    let filtered = enriched;

    if (search) {
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(search) ||
          c.id.toLowerCase().includes(search) ||
          c.slug.toLowerCase().includes(search) ||
          (c.countryName && c.countryName.toLowerCase().includes(search)) ||
          String(c.providerId).includes(search)
      );
    }

    if (confed) {
      filtered = filtered.filter((c) => c.confederationCode.toUpperCase() === confed);
    }

    if (country) {
      filtered = filtered.filter((c) => c.countryCode.toUpperCase() === country);
    }

    if (tier) {
      filtered = filtered.filter((c) => String(c.tier) === tier);
    }

    if (gender) {
      filtered = filtered.filter((c) => c.gender.toUpperCase() === gender);
    }

    if (isFeatured !== null && isFeatured !== undefined && isFeatured !== '') {
      const boolVal = isFeatured === 'true';
      filtered = filtered.filter((c) => c.isFeatured === boolVal);
    }

    // Sorting by priorityRank ascending
    filtered.sort((a, b) => a.priorityRank - b.priorityRank);

    // Calculate registry statistics
    const stats = {
      totalCompetitions: enriched.length,
      domesticCount: enriched.filter((c) => c.isDomestic).length,
      continentalCount: enriched.filter((c) => c.isContinental).length,
      internationalCount: enriched.filter((c) => c.isInternational).length,
      womensCount: enriched.filter((c) => c.isWomens || c.gender === 'FEMALE').length,
      youthCount: enriched.filter((c) => c.isYouth || c.ageCategory !== 'SENIOR').length,
      featuredCount: enriched.filter((c) => c.isFeatured).length,
      indexableCount: enriched.filter((c) => c.isIndexable).length,
      totalProviderMappings:
        Object.keys(PROVIDER_LEAGUE_TO_CANONICAL).length + runtimeProviderMappings.size,
      totalPriorityClubs: PRIORITY_CLUBS_LIST.length,
    };

    return NextResponse.json({
      success: true,
      stats,
      total: filtered.length,
      competitions: filtered,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch competitions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      competitionId,
      providerId,
      priorityRank,
      isFeatured,
      isIndexable,
      tier,
      gender,
      ageCategory,
    } = body;

    if (!competitionId) {
      return NextResponse.json(
        { success: false, error: 'competitionId is required' },
        { status: 400 }
      );
    }

    const comp = getCanonicalCompetition(competitionId);
    if (!comp) {
      return NextResponse.json(
        { success: false, error: `Competition ${competitionId} not found in canonical registry` },
        { status: 404 }
      );
    }

    const updates: Partial<CanonicalCompetition> = {};
    if (providerId !== undefined) {
      const pidNum = Number(providerId);
      updates.providerId = pidNum;
      runtimeProviderMappings.set(pidNum, competitionId);
    }
    if (priorityRank !== undefined) updates.priorityRank = Number(priorityRank);
    if (isFeatured !== undefined) updates.isFeatured = Boolean(isFeatured);
    if (isIndexable !== undefined) updates.isIndexable = Boolean(isIndexable);
    if (tier !== undefined) updates.tier = tier;
    if (gender !== undefined) updates.gender = gender;
    if (ageCategory !== undefined) updates.ageCategory = ageCategory;
    updates.updatedAt = new Date().toISOString();

    const existing = runtimeOverrides.get(competitionId) || {};
    runtimeOverrides.set(competitionId, { ...existing, ...updates });

    return NextResponse.json({
      success: true,
      message: `Updated competition ${competitionId}`,
      updated: { ...comp, ...runtimeOverrides.get(competitionId) },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update competition' },
      { status: 500 }
    );
  }
}
