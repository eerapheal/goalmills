import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Video from "@/models/Video";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { cacheGet, cacheSet, cacheDel, cacheInvalidatePattern, getSeoCacheHeaders } from "@/lib/redisCache";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
    return NextResponse.json({ message: "Invalid Video ID" }, { status: 400 });
  }

  const cacheKey = `cache:videos:item:${id}`;
  const cached = await cacheGet(cacheKey);
  if (cached) {
    return NextResponse.json(cached, {
      headers: {
        ...getSeoCacheHeaders(60, 300),
        'X-Cache': 'HIT',
      },
    });
  }

  await dbConnect();
  try {
    const video = await Video.findById(id).lean();
    if (!video) {
      return NextResponse.json({ message: "Video not found" }, { status: 404 });
    }

    await cacheSet(cacheKey, video, 300);

    return NextResponse.json(video, {
      headers: {
        ...getSeoCacheHeaders(60, 300),
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    return NextResponse.json({ message: "Error fetching video" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = (await getServerSession(authOptions)) as any;
  if (!session || (session.user?.role !== 'staff' && session.user?.role !== 'super-admin')) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  try {
    const body = await request.json();
    const video = await Video.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!video) return NextResponse.json({ message: "Video not found" }, { status: 404 });

    // Invalidate caches
    await cacheDel(`cache:videos:item:${id}`);
    await cacheInvalidatePattern('cache:videos:*');

    return NextResponse.json(video);
  } catch (error) {
    return NextResponse.json({ message: "Error updating video" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = (await getServerSession(authOptions)) as any;
  if (!session || (session.user?.role !== 'staff' && session.user?.role !== 'super-admin')) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  try {
    const video = await Video.findByIdAndDelete(id);
    if (!video) return NextResponse.json({ message: "Video not found" }, { status: 404 });

    // Invalidate caches
    await cacheDel(`cache:videos:item:${id}`);
    await cacheInvalidatePattern('cache:videos:*');

    return NextResponse.json({ message: "Video deleted successfully" });
  } catch (error) {
    return NextResponse.json({ message: "Error deleting video" }, { status: 500 });
  }
}


