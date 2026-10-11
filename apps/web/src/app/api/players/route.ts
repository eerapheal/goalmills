import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Player from '@/models/Player';
import { slugify } from '@/lib/slugUtils';

const AFRICAN_COUNTRIES = [
  'nigeria',
  'egypt',
  'morocco',
  'ghana',
  'senegal',
  'cameroon',
  'ivory coast',
  'côte d\'ivoire',
  'algeria',
  'tunisia',
  'mali',
  'guinea',
  'drc',
  'congo',
  'south africa',
  'burkina faso',
  'angola',
  'gambia',
  'zambia',
  'uganda',
  'tanzania',
  'kenya',
  'gabon',
  'cape verde',
  'benin',
  'togo',
  'mozambique',
];

function checkAfricanOrigin(nationality?: string): boolean {
  if (!nationality) return false;
  const n = nationality.toLowerCase().trim();
  return AFRICAN_COUNTRIES.some((c) => n.includes(c));
}

// Country flags mapping helper
const COUNTRY_FLAGS: Record<string, string> = {
  nigeria: '🇳🇬',
  egypt: '🇪🇬',
  morocco: '🇲🇦',
  ghana: '🇬🇭',
  senegal: '🇸🇳',
  cameroon: '🇨🇲',
  'ivory coast': '🇨🇮',
  algeria: '🇩🇿',
  tunisia: '🇹🇳',
  mali: '🇲🇱',
  guinea: '🇬🇳',
  'south africa': '🇿🇦',
  england: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  france: '🇫🇷',
  spain: '🇪🇸',
  brazil: '🇧🇷',
  argentina: '🇦🇷',
  portugal: '🇵🇹',
  germany: '🇩🇪',
  norway: '🇳🇴',
  netherlands: '🇳🇱',
};

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const africanOnly = searchParams.get('african') === 'true';
    const competition = searchParams.get('competition');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    const filter: Record<string, any> = {};

    if (africanOnly) {
      filter.africanOrigin = true;
    }
    if (competition && competition !== 'all') {
      filter.competitionSlug = competition;
    }
    if (search) {
      const q = search.trim();
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { clubName: { $regex: q, $options: 'i' } },
        { nationality: { $regex: q, $options: 'i' } },
        { position: { $regex: q, $options: 'i' } },
      ];
    }

    const players = await Player.find(filter)
      .sort({ africanOrigin: -1, 'seasonStats.goals': -1, createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      count: players.length,
      players,
    });
  } catch (error: any) {
    console.error('Error in GET /api/players:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch players' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();

    if (!body.name || typeof body.name !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Player name is required' },
        { status: 400 }
      );
    }

    const name = body.name.trim();
    let baseSlug = body.slug ? slugify(body.slug) : slugify(name);
    let finalSlug = baseSlug;
    let counter = 1;

    // Ensure slug uniqueness
    while (await Player.exists({ slug: finalSlug })) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    const nationality = body.nationality?.trim() || 'Nigeria';
    const flag =
      body.countryFlag ||
      COUNTRY_FLAGS[nationality.toLowerCase()] ||
      (checkAfricanOrigin(nationality) ? '🌍' : '⚽');

    const isAfrican =
      body.africanOrigin !== undefined ? Boolean(body.africanOrigin) : checkAfricanOrigin(nationality);

    const clubName = body.clubName?.trim() || 'Club';
    const clubSlug = body.clubSlug?.trim() || slugify(clubName);

    const avatar =
      body.photo ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        name
      )}&background=07101E&color=38BDF8&size=256&bold=true`;

    const newPlayer = await Player.create({
      name,
      slug: finalSlug,
      number: Number(body.number) || 9,
      position: body.position || 'Striker / Forward',
      nationality,
      countryFlag: flag,
      africanOrigin: isAfrican,
      clubSlug,
      clubName,
      competitionSlug: body.competitionSlug || 'premier-league',
      photo: avatar,
      age: Number(body.age) || 25,
      height: body.height || '184 cm',
      marketValue: body.marketValue || '€50.00M',
      contractUntil: body.contractUntil || 'June 2028',
      weeklyWage: body.weeklyWage || '€100,000',
      releaseClause: body.releaseClause || '€75.00M',
      agent: body.agent || '',
      marketValueTrend: body.marketValueTrend || 'up',
      bio: body.bio || '',
      externalPlayerKey: body.externalPlayerKey || '',
      externalTeamKey: body.externalTeamKey || '',
      seasonStats: {
        appearances: Number(body.seasonStats?.appearances) || 0,
        goals: Number(body.seasonStats?.goals) || 0,
        assists: Number(body.seasonStats?.assists) || 0,
        yellowCards: Number(body.seasonStats?.yellowCards) || 0,
        cleanSheets: Number(body.seasonStats?.cleanSheets) || 0,
        passAccuracy: body.seasonStats?.passAccuracy || '82%',
        rating: Number(body.seasonStats?.rating) || 7.2,
      },
      isFeatured: Boolean(body.isFeatured),
    });

    return NextResponse.json({
      success: true,
      player: newPlayer,
      message: 'Player created successfully',
    });
  } catch (error: any) {
    console.error('Error in POST /api/players:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create player' },
      { status: 500 }
    );
  }
}
