import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'super-admin') {
    return NextResponse.json({ message: "Unauthorized: Super Admin access required" }, { status: 401 });
  }

  await dbConnect();
  try {
    const users = await User.find({}).select("-password").sort({ createdAt: -1 });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ message: "Error fetching users" }, { status: 500 });
  }
}
