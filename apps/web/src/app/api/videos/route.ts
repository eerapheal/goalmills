import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Video from "@/models/Video";
import { getServerSession } from "next-auth/next";

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
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  try {
    const body = await request.json();
    const video = await Video.create(body);
    return NextResponse.json(video, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Error creating video" }, { status: 400 });
  }
}
