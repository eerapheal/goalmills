import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import News from "@/models/News";
import { getServerSession } from "next-auth/next";

export async function GET() {
  await dbConnect();
  try {
    const news = await News.find({}).sort({ createdAt: -1 });
    return NextResponse.json(news);
  } catch (error) {
    return NextResponse.json({ message: "Error fetching news" }, { status: 500 });
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
    const news = await News.create(body);
    return NextResponse.json(news, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Error creating news" }, { status: 400 });
  }
}
