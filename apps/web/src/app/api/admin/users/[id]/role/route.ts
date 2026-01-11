import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'super-admin') {
    return NextResponse.json({ message: "Unauthorized: Super Admin access required" }, { status: 401 });
  }

  const { id } = await params;
  const { role } = await request.json();

  if (!['user', 'staful', 'super-admin'].includes(role)) {
    return NextResponse.json({ message: "Invalid role" }, { status: 400 });
  }

  await dbConnect();
  try {
    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select("-password");

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ message: "Error updating user role" }, { status: 500 });
  }
}
