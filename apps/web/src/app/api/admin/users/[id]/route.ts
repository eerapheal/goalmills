import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions) as any;
  
  if (!session || session.user.role !== 'super-admin') {
    return NextResponse.json({ message: "Unauthorized: Super Admin role required" }, { status: 401 });
  }

  // Prevent self-deletion
  if (params.id === session.user.id) {
    return NextResponse.json({ message: "Forbidden: You cannot delete your own account" }, { status: 403 });
  }

  await dbConnect();
  try {
    const deletedUser = await User.findByIdAndDelete(params.id);
    if (!deletedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    return NextResponse.json({ message: "Error deleting user" }, { status: 500 });
  }
}
