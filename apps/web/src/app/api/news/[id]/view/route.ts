import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import News from "@/models/News";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }

  await dbConnect();
  try {
    const updated = await News.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true, select: '_id views title' }
    );
    if (!updated) {
      return NextResponse.json({ message: "News not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, views: updated.views });
  } catch (error) {
    return NextResponse.json({ message: "Error incrementing view" }, { status: 500 });
  }
}
