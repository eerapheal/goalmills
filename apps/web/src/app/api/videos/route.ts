import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Video from "@/models/Video";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
  await dbConnect();
  try {
    const videos = await Video.find({}).sort({ createdAt: -1 });
    return NextResponse.json(videos);
  } catch (error) {
    return NextResponse.json({ message: "Error fetching videos" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions) as any;
  if (!session || (session.user.role !== 'staful' && session.user.role !== 'super-admin')) {
    return NextResponse.json({ message: "Unauthorized: Staful or Super Admin role required" }, { status: 401 });
  }

  await dbConnect();
  try {
    const { video_title, video_url, video_thumbnail, event_key, source } = await request.json();
    const video = await Video.create({
      video_title,
      video_url,
      video_thumbnail,
      event_key,
      source
    });
    return NextResponse.json(video, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Error creating video" }, { status: 400 });
  }
}
