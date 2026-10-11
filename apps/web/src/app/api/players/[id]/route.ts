import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Player from '@/models/Player';
import { slugify } from '@/lib/slugUtils';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    await dbConnect();
    const { id } = await context.params;

    let player = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      player = await Player.findById(id).lean();
    }
    if (!player) {
      player = await Player.findOne({ slug: id.toLowerCase() }).lean();
    }

    if (!player) {
      return NextResponse.json(
        { success: false, error: 'Player not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, player });
  } catch (error: any) {
    console.error('Error in GET /api/players/[id]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch player' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    await dbConnect();
    const { id } = await context.params;
    const body = await req.json();

    let player = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      player = await Player.findById(id);
    }
    if (!player) {
      player = await Player.findOne({ slug: id.toLowerCase() });
    }

    if (!player) {
      return NextResponse.json(
        { success: false, error: 'Player not found' },
        { status: 404 }
      );
    }

    // Update fields if provided
    if (body.name) player.name = body.name.trim();
    if (body.slug && body.slug !== player.slug) {
      const targetSlug = slugify(body.slug);
      const exists = await Player.findOne({ slug: targetSlug, _id: { $ne: player._id } });
      if (!exists) player.slug = targetSlug;
    }
    if (body.number !== undefined) player.number = Number(body.number);
    if (body.position) player.position = body.position;
    if (body.nationality) player.nationality = body.nationality;
    if (body.countryFlag) player.countryFlag = body.countryFlag;
    if (body.africanOrigin !== undefined) player.africanOrigin = Boolean(body.africanOrigin);
    if (body.clubName) player.clubName = body.clubName;
    if (body.clubSlug) player.clubSlug = body.clubSlug;
    if (body.competitionSlug) player.competitionSlug = body.competitionSlug;
    if (body.photo) player.photo = body.photo;
    if (body.age !== undefined) player.age = Number(body.age);
    if (body.height) player.height = body.height;
    if (body.marketValue) player.marketValue = body.marketValue;
    if (body.contractUntil) player.contractUntil = body.contractUntil;
    if (body.weeklyWage) player.weeklyWage = body.weeklyWage;
    if (body.releaseClause) player.releaseClause = body.releaseClause;
    if (body.agent !== undefined) player.agent = body.agent;
    if (body.marketValueTrend) player.marketValueTrend = body.marketValueTrend;
    if (body.bio !== undefined) player.bio = body.bio;
    if (body.externalPlayerKey !== undefined) player.externalPlayerKey = body.externalPlayerKey;
    if (body.externalTeamKey !== undefined) player.externalTeamKey = body.externalTeamKey;
    if (body.isFeatured !== undefined) player.isFeatured = Boolean(body.isFeatured);

    if (body.seasonStats) {
      player.seasonStats = {
        appearances: Number(body.seasonStats.appearances ?? player.seasonStats.appearances),
        goals: Number(body.seasonStats.goals ?? player.seasonStats.goals),
        assists: Number(body.seasonStats.assists ?? player.seasonStats.assists),
        yellowCards: Number(body.seasonStats.yellowCards ?? player.seasonStats.yellowCards),
        cleanSheets: Number(body.seasonStats.cleanSheets ?? player.seasonStats.cleanSheets ?? 0),
        passAccuracy: body.seasonStats.passAccuracy ?? player.seasonStats.passAccuracy,
        rating: Number(body.seasonStats.rating ?? player.seasonStats.rating),
      };
    }

    await player.save();

    return NextResponse.json({
      success: true,
      player,
      message: 'Player updated successfully',
    });
  } catch (error: any) {
    console.error('Error in PUT /api/players/[id]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update player' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    await dbConnect();
    const { id } = await context.params;

    let deleted = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      deleted = await Player.findByIdAndDelete(id);
    }
    if (!deleted) {
      deleted = await Player.findOneAndDelete({ slug: id.toLowerCase() });
    }

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Player not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Player '${deleted.name}' deleted successfully`,
    });
  } catch (error: any) {
    console.error('Error in DELETE /api/players/[id]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete player' },
      { status: 500 }
    );
  }
}
