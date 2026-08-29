import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import EcosystemEntity from '@/models/EcosystemEntity';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { cacheInvalidatePattern } from '@/lib/redisCache';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
  }

  await dbConnect();
  try {
    const entity = await EcosystemEntity.findById(id).lean();
    if (!entity) {
      return NextResponse.json({ message: 'Ecosystem entity not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: entity });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error fetching ecosystem entity' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = (await getServerSession(authOptions)) as any;
  if (!session?.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  try {
    const body = await request.json();
    const {
      name,
      slug,
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

    const existing = await EcosystemEntity.findById(id);
    if (!existing) {
      return NextResponse.json({ message: 'Ecosystem entity not found' }, { status: 404 });
    }

    if (name) existing.name = name.trim();
    if (slug) {
      existing.slug = slug
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }
    if (shortName !== undefined) existing.shortName = shortName.trim();
    if (sportSlug !== undefined) existing.sportSlug = sportSlug.toLowerCase().trim();
    if (sportName !== undefined) existing.sportName = sportName.trim();
    if (competitionSlug !== undefined)
      existing.competitionSlug = competitionSlug.toLowerCase().trim();
    if (competitionName !== undefined) existing.competitionName = competitionName.trim();
    if (clubSlug !== undefined) existing.clubSlug = clubSlug.toLowerCase().trim();
    if (clubName !== undefined) existing.clubName = clubName.trim();
    if (country !== undefined) existing.country = country.trim();
    if (logo !== undefined) existing.logo = logo.trim();
    if (photo !== undefined) existing.photo = photo.trim();
    if (position !== undefined) existing.position = position.trim();
    if (nationality !== undefined) existing.nationality = nationality.trim();
    if (number !== undefined) existing.number = number ? Number(number) : undefined;
    if (marketValue !== undefined) existing.marketValue = marketValue.trim();
    if (description !== undefined) existing.description = description.trim();
    if (isFeatured !== undefined) existing.isFeatured = Boolean(isFeatured);
    if (tier !== undefined) existing.tier = Number(tier);
    if (order !== undefined) existing.order = Number(order);

    const updated = await existing.save();
    await cacheInvalidatePattern('cache:ecosystem:*');

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error updating ecosystem entity:', error);
    return NextResponse.json(
      { message: error.message || 'Error updating ecosystem entity' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = (await getServerSession(authOptions)) as any;
  if (!session?.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  try {
    const deleted = await EcosystemEntity.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ message: 'Ecosystem entity not found' }, { status: 404 });
    }

    await cacheInvalidatePattern('cache:ecosystem:*');
    return NextResponse.json({ success: true, message: 'Entity deleted successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Error deleting ecosystem entity' },
      { status: 500 }
    );
  }
}
