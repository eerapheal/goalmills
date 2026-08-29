import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import EcosystemEntity from '@/models/EcosystemEntity';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { COMPETITIONS_REGISTRY, CLUBS_REGISTRY, PLAYERS_REGISTRY } from '@/lib/entityService';
import { cacheGet, cacheSet, cacheDel, cacheInvalidatePattern } from '@/lib/redisCache';

export const dynamic = 'force-dynamic';

export const DEFAULT_SPORTS = [
  { name: 'Football', slug: 'football', icon: '⚽', isFeatured: true, order: 1 },
  { name: 'Basketball', slug: 'basketball', icon: '🏀', isFeatured: true, order: 2 },
  { name: 'Cricket', slug: 'cricket', icon: '🏏', isFeatured: true, order: 3 },
  { name: 'Tennis', slug: 'tennis', icon: '🎾', isFeatured: true, order: 4 },
  { name: 'Motorsport / F1', slug: 'motorsport', icon: '🏎️', isFeatured: false, order: 5 },
  { name: 'Boxing / MMA', slug: 'combat-sports', icon: '🥊', isFeatured: false, order: 6 },
  { name: 'Rugby', slug: 'rugby', icon: '🏉', isFeatured: false, order: 7 },
  { name: 'Athletics', slug: 'athletics', icon: '🏃', isFeatured: false, order: 8 },
  { name: 'Esports', slug: 'esports', icon: '🎮', isFeatured: false, order: 9 },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'all';
  const sportSlug = searchParams.get('sportSlug');
  const competitionSlug = searchParams.get('competitionSlug');
  const clubSlug = searchParams.get('clubSlug');
  const search = searchParams.get('search')?.toLowerCase();

  await dbConnect();

  try {
    const query: any = {};
    if (type && type !== 'all') {
      query.type = type;
    }
    if (sportSlug) query.sportSlug = sportSlug.toLowerCase();
    if (competitionSlug) query.competitionSlug = competitionSlug.toLowerCase();
    if (clubSlug) query.clubSlug = clubSlug.toLowerCase();

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
        { shortName: { $regex: search, $options: 'i' } },
        { nationality: { $regex: search, $options: 'i' } },
        { country: { $regex: search, $options: 'i' } },
      ];
    }

    const dbEntities = await EcosystemEntity.find(query).sort({ order: 1, createdAt: -1 }).lean();

    // Map built-in presets
    const builtInSports = DEFAULT_SPORTS.map((s) => ({
      _id: `builtin-sport-${s.slug}`,
      type: 'sport',
      name: s.name,
      slug: s.slug,
      logo: s.icon,
      isFeatured: s.isFeatured,
      order: s.order,
      isCustom: false,
    }));

    const builtInCompetitions = Object.values(COMPETITIONS_REGISTRY).map((c) => ({
      _id: `builtin-comp-${c.slug}`,
      type: 'competition',
      name: c.name,
      slug: c.slug,
      sportSlug: 'football',
      sportName: 'Football',
      country: c.country,
      logo: c.logo,
      tier: c.tier,
      isFeatured: c.featured,
      description: c.description,
      isCustom: false,
    }));

    const builtInClubs = Object.values(CLUBS_REGISTRY).map((c) => ({
      _id: `builtin-club-${c.slug}`,
      type: 'club',
      name: c.name,
      slug: c.slug,
      shortName: c.shortName,
      sportSlug: 'football',
      sportName: 'Football',
      competitionSlug: c.competitionSlug,
      competitionName: c.competitionName,
      logo: c.logo,
      country: '',
      isFeatured: true,
      isCustom: false,
    }));

    const builtInPlayers = Object.values(PLAYERS_REGISTRY).map((p) => ({
      _id: `builtin-player-${p.slug}`,
      type: 'player',
      name: p.name,
      slug: p.slug,
      sportSlug: 'football',
      competitionSlug: p.competitionSlug,
      clubSlug: p.clubSlug,
      clubName: p.clubName,
      photo: p.photo,
      position: p.position,
      nationality: p.nationality,
      number: p.number,
      marketValue: p.marketValue,
      isCustom: false,
    }));

    // Filter built-ins according to requested type & filters
    let mergedBuiltIns: any[] = [];
    if (type === 'all' || type === 'sport') {
      mergedBuiltIns.push(...builtInSports);
    }
    if (type === 'all' || type === 'competition') {
      mergedBuiltIns.push(
        ...builtInCompetitions.filter((c) => !sportSlug || c.sportSlug === sportSlug)
      );
    }
    if (type === 'all' || type === 'club') {
      mergedBuiltIns.push(
        ...builtInClubs.filter(
          (c) =>
            (!sportSlug || c.sportSlug === sportSlug) &&
            (!competitionSlug || c.competitionSlug === competitionSlug)
        )
      );
    }
    if (type === 'all' || type === 'player') {
      mergedBuiltIns.push(
        ...builtInPlayers.filter(
          (p) =>
            (!sportSlug || p.sportSlug === sportSlug) &&
            (!competitionSlug || p.competitionSlug === competitionSlug) &&
            (!clubSlug || p.clubSlug === clubSlug)
        )
      );
    }

    if (search) {
      mergedBuiltIns = mergedBuiltIns.filter(
        (item) =>
          item.name.toLowerCase().includes(search) ||
          item.slug.toLowerCase().includes(search) ||
          (item.shortName && item.shortName.toLowerCase().includes(search)) ||
          (item.nationality && item.nationality.toLowerCase().includes(search)) ||
          (item.country && item.country.toLowerCase().includes(search))
      );
    }

    // Merge: custom entities override built-ins with same type+slug, and rest append
    const customSlugMap = new Set(dbEntities.map((e: any) => `${e.type}:${e.slug}`));
    const nonOverriddenBuiltIns = mergedBuiltIns.filter(
      (b) => !customSlugMap.has(`${b.type}:${b.slug}`)
    );

    const allEntities = [...dbEntities, ...nonOverriddenBuiltIns];

    return NextResponse.json({
      success: true,
      count: allEntities.length,
      data: allEntities,
    });
  } catch (error: any) {
    console.error('Error fetching ecosystem entities:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error fetching ecosystem entities' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = (await getServerSession(authOptions)) as any;
  if (!session?.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const body = await request.json();
    const {
      type,
      name,
      slug: customSlug,
      shortName,
      sportSlug,
      sportName,
      competitionSlug,
      competitionName,
      clubSlug,
      clubName,
      country,
      logo,
      photo,
      position,
      nationality,
      number,
      marketValue,
      description,
      isFeatured,
      tier,
      order,
    } = body;

    if (!type || !name) {
      return NextResponse.json({ message: 'Entity type and name are required' }, { status: 400 });
    }

    const generatedSlug = (customSlug || name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Check if duplicate in custom DB
    const existing = await EcosystemEntity.findOne({ type, slug: generatedSlug });
    if (existing) {
      return NextResponse.json(
        { message: `A ${type} with slug "${generatedSlug}" already exists.` },
        { status: 409 }
      );
    }

    const newEntity = await EcosystemEntity.create({
      type,
      name: name.trim(),
      slug: generatedSlug,
      shortName: shortName?.trim() || name.trim(),
      sportSlug: sportSlug ? sportSlug.toLowerCase().trim() : undefined,
      sportName: sportName?.trim(),
      competitionSlug: competitionSlug ? competitionSlug.toLowerCase().trim() : undefined,
      competitionName: competitionName?.trim(),
      clubSlug: clubSlug ? clubSlug.toLowerCase().trim() : undefined,
      clubName: clubName?.trim(),
      country: country?.trim(),
      logo: logo?.trim(),
      photo: photo?.trim(),
      position: position?.trim(),
      nationality: nationality?.trim(),
      number: number ? Number(number) : undefined,
      marketValue: marketValue?.trim(),
      description: description?.trim() || '',
      isFeatured: Boolean(isFeatured),
      tier: tier ? Number(tier) : 1,
      order: order ? Number(order) : 0,
      isCustom: true,
      createdBy: session.user.id,
    });

    await cacheInvalidatePattern('cache:ecosystem:*');

    return NextResponse.json({ success: true, data: newEntity }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating ecosystem entity:', error);
    return NextResponse.json(
      { message: error.message || 'Error creating ecosystem entity' },
      { status: 400 }
    );
  }
}
