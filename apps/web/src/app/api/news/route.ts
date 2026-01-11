import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import News from "@/models/News";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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
