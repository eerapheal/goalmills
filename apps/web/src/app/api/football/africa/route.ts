import { NextRequest, NextResponse } from 'next/server';
import { EntityService, CLUBS_REGISTRY, COACHES_REGISTRY } from '@/lib/entityService';
import { ALL_COMPETITIONS, COMPETITION_CATEGORY_LABELS } from '@/lib/competitionCategories';

export const dynamic = 'force-dynamic';

/**
 * African Football Intelligence Hub API
 * Serves real-time African superstar metrics, 2026/2027 market valuations,
 * CAF competitions, domestic powerhouses, and diaspora players abroad.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section') || 'all';
    const season = searchParams.get('season') || '2026/2027';

    // 1. African Superstars with 2026/2027 Real Market Values
    const africanPlayers = EntityService.getAfricanPlayers();
    const sortedSuperstars = [...africanPlayers].sort((a, b) => {
      const valA = parseFloat(a.marketValue.replace(/[^0-9.]/g, '')) || 0;
      const valB = parseFloat(b.marketValue.replace(/[^0-9.]/g, '')) || 0;
      return valB - valA;
    });

    // 2. CAF & African Domestic Competitions
    const cafCompetitions = ALL_COMPETITIONS.filter((c) => c.category === 'caf');

    // 3. African Heavyweight Clubs
    const africanClubs = EntityService.getAfricanClubs();

    // 4. African Master Tacticians
    const africanCoaches = EntityService.getAfricanCoaches();

    // 5. African Transfers Radar
    const allTransfers = EntityService.getTransfers();
    const africanTransfers = allTransfers.filter((t) => {
      const p = EntityService.getPlayer(t.playerSlug);
      return p?.africanOrigin || t.competitionSlug === 'caf-champions-league';
    });

    // 6. Top African Scorers Abroad (2026/2027 Season)
    const scorersAbroad = sortedSuperstars
      .filter((p) => (p.seasonStats?.goals || 0) > 0)
      .map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        nationality: p.nationality,
        countryFlag: p.countryFlag,
        clubName: p.clubName,
        clubSlug: p.clubSlug,
        competitionSlug: p.competitionSlug,
        photo: p.photo,
        goals: p.seasonStats.goals,
        assists: p.seasonStats.assists,
        appearances: p.seasonStats.appearances,
        rating: p.seasonStats.rating,
        marketValue: p.marketValue,
        marketValueTrend: p.marketValueTrend,
      }))
      .sort((a, b) => b.goals - a.goals);

    // 7. Market Value Index Summary
    const totalValuationMillions = sortedSuperstars.reduce((sum, p) => {
      return sum + (parseFloat(p.marketValue.replace(/[^0-9.]/g, '')) || 0);
    }, 0);

    const marketValueIndex = {
      season,
      trackedPlayersCount: sortedSuperstars.length,
      combinedMarketValue: `€${totalValuationMillions.toFixed(2)}M`,
      highestValuedPlayer: sortedSuperstars[0] || null,
      topTenValued: sortedSuperstars.slice(0, 10),
    };

    // Formulate response based on requested section
    if (section === 'superstars') {
      return NextResponse.json({
        success: true,
        season,
        data: sortedSuperstars,
      });
    }

    if (section === 'competitions') {
      return NextResponse.json({
        success: true,
        season,
        data: cafCompetitions,
      });
    }

    if (section === 'transfers') {
      return NextResponse.json({
        success: true,
        season,
        data: africanTransfers,
      });
    }

    if (section === 'abroad') {
      return NextResponse.json({
        success: true,
        season,
        data: scorersAbroad,
      });
    }

    // Default: 'all' payload
    return NextResponse.json(
      {
        success: true,
        platform: 'GoalMills Africa',
        season,
        tagline: 'The Leading African Football Intelligence & Real Valuation Network',
        meta: {
          activeCampaign: '2026/2027 Season',
          confederationPriority: 'CAF',
          updatedAt: new Date().toISOString(),
        },
        marketValueIndex,
        superstars: sortedSuperstars,
        competitions: cafCompetitions,
        heavyweightClubs: africanClubs,
        tacticians: africanCoaches,
        transfersRadar: africanTransfers,
        scorersAbroad,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (error: any) {
    console.error('Failed to resolve African football data:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve African football platform data',
        message: error?.message || 'Internal error',
      },
      { status: 500 }
    );
  }
}
