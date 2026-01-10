import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import News from "@/models/News";
import { getServerSession } from "next-auth/next";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  try {
    const news = await News.findById(params.id);
    if (!news) return NextResponse.json({ message: "News not found" }, { status: 404 });
    return NextResponse.json(news);
  } catch (error) {
    return NextResponse.json({ message: "Error fetching news" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  try {
    const body = await request.json();
    const news = await News.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    });
    if (!news) return NextResponse.json({ message: "News not found" }, { status: 404 });
    return NextResponse.json(news);
  } catch (error) {
    return NextResponse.json({ message: "Error updating news" }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  try {
    const news = await News.findByIdAndDelete(params.id);
    if (!news) return NextResponse.json({ message: "News not found" }, { status: 404 });
    return NextResponse.json({ message: "News deleted successfully" });
  } catch (error) {
    return NextResponse.json({ message: "Error deleting news" }, { status: 500 });
  }
}
