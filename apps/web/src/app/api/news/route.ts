import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import News from "@/models/News";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const isAdminRequest = searchParams.get('admin') === 'true';
  const session = await getServerSession(authOptions) as any;

  await dbConnect();
  try {
    let filter = {};

    // If it's an admin request, enforce role-based filtering
    if (isAdminRequest) {
      if (!session || (session.user.role !== 'staff' && session.user.role !== 'super-admin')) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }

      // If staff, only show their own posts
      if (session.user.role === 'staff') {
        filter = { authorId: session.user.id };
      }
      // If super-admin, filter remains {} (all posts)
    }

    const news = await News.find(filter).sort({ createdAt: -1 });
    return NextResponse.json(news);
  } catch (error) {
    return NextResponse.json({ message: "Error fetching news" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions) as any;
  if (!session || (session.user.role !== 'staff' && session.user.role !== 'super-admin')) {
    return NextResponse.json({ message: "Unauthorized: staff or Super Admin role required" }, { status: 401 });
  }

  await dbConnect();
  try {
    const { title, excerpt, content, image, source, category } = await request.json();
    const news = await News.create({
      title,
      excerpt,
      content,
      image,
      source,
      category: category || 'General',
      author: session.user.name || 'Admin',
      authorId: session.user.id,
      readTime: Math.ceil(content.split(' ').length / 200) || 5, // Estimate read time
    });
    return NextResponse.json(news, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Error creating news" }, { status: 400 });
  }
}
