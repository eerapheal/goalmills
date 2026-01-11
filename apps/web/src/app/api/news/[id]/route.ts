import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import News from "@/models/News";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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
  const session = await getServerSession(authOptions) as any;
  if (!session || (session.user.role !== 'staff' && session.user.role !== 'super-admin')) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  try {
    const news = await News.findById(params.id);
    if (!news) return NextResponse.json({ message: "News not found" }, { status: 404 });

    // RBAC: super-admin can edit anything; staff can only edit their own
    if (session.user.role === 'staff' && news.authorId?.toString() !== session.user.id) {
      return NextResponse.json({ message: "Forbidden: You can only edit your own posts" }, { status: 403 });
    }

    const body = await request.json();
    const updatedNews = await News.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    });
    return NextResponse.json(updatedNews);
  } catch (error) {
    return NextResponse.json({ message: "Error updating news" }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions) as any;
  if (!session || (session.user.role !== 'staff' && session.user.role !== 'super-admin')) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  try {
    const news = await News.findById(params.id);
    if (!news) return NextResponse.json({ message: "News not found" }, { status: 404 });

    // RBAC check
    if (session.user.role === 'staff' && news.authorId?.toString() !== session.user.id) {
      return NextResponse.json({ message: "Forbidden: You can only delete your own posts" }, { status: 403 });
    }

    await News.findByIdAndDelete(params.id);
    return NextResponse.json({ message: "News deleted successfully" });
  } catch (error) {
    return NextResponse.json({ message: "Error deleting news" }, { status: 500 });
  }
}
