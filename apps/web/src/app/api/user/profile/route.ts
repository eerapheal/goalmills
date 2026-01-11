import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        
        const { username, image } = await request.json();
        
        await dbConnect();
        
        // Check if username is already taken by another user
        if (username) {
            const existingUser = await User.findOne({ 
                username: username, 
                _id: { $ne: session.user.id } 
            });
            
            if (existingUser) {
                return NextResponse.json({ message: "Username already taken" }, { status: 400 });
            }
        }
        
        const updates: any = {};
        if (username) updates.username = username;
        if (image) updates.image = image;
        
        const updatedUser = await User.findByIdAndUpdate(
            session.user.id,
            { $set: updates },
            { new: true }
        ).select('-password');
        
        return NextResponse.json(updatedUser);
        
    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
