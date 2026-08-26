import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Category from "@/models/Category";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = 'force-dynamic';

const DEFAULT_CATEGORIES = [
  { name: 'Breaking News', slug: 'breaking-news', description: 'Urgent football and sports headlines', color: '#EF4444', icon: 'flash', isFeatured: true, order: 1 },
  { name: 'Premier League', slug: 'premier-league', description: 'English Premier League match reports & updates', color: '#3B82F6', icon: 'football', isFeatured: true, order: 2 },
  { name: 'Champions League', slug: 'champions-league', description: 'UEFA Champions League nights and analysis', color: '#6366F1', icon: 'trophy', isFeatured: true, order: 3 },
  { name: 'Transfers & Rumours', slug: 'transfers', description: 'Transfer window intel and confirmed deals', color: '#10B981', icon: 'swap-horizontal', isFeatured: true, order: 4 },
  { name: 'Tactical Analysis', slug: 'tactical-analysis', description: 'Deep dives, formations and match breakdowns', color: '#8B5CF6', icon: 'analytics', isFeatured: true, order: 5 },
  { name: 'AFCON 2025', slug: 'afcon-2025', description: 'Africa Cup of Nations coverage and stories', color: '#F59E0B', icon: 'globe', isFeatured: true, order: 6 },
  { name: 'La Liga', slug: 'la-liga', description: 'Spanish football, Real Madrid, Barcelona & more', color: '#EC4899', icon: 'shield', isFeatured: false, order: 7 },
  { name: 'Serie A', slug: 'serie-a', description: 'Italian Serie A tactical battles', color: '#06B6D4', icon: 'flag', isFeatured: false, order: 8 },
  { name: 'NBA & Basketball', slug: 'nba-basketball', description: 'NBA highlights, trades and game recaps', color: '#F97316', icon: 'basketball', isFeatured: false, order: 9 },
  { name: 'Cricket & IPL', slug: 'cricket-ipl', description: 'International cricket and franchise tournaments', color: '#14B8A6', icon: 'baseball', isFeatured: false, order: 10 },
  { name: "Editor's Picks", slug: 'editors-picks', description: 'Curated top editorial columns', color: '#EAB308', icon: 'star', isFeatured: true, order: 11 },
];

export async function GET() {
  await dbConnect();
  try {
    let categories = await Category.find({}).sort({ order: 1, createdAt: 1 }).lean();

    // Auto-seed default categories if collection is empty
    if (!categories || categories.length === 0) {
      await Category.insertMany(DEFAULT_CATEGORIES);
      categories = await Category.find({}).sort({ order: 1, createdAt: 1 }).lean();
    }

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ message: "Error fetching categories" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = (await getServerSession(authOptions)) as any;
  if (!session || (session.user.role !== 'staff' && session.user.role !== 'super-admin')) {
    return NextResponse.json({ message: "Unauthorized: staff or Super Admin role required" }, { status: 401 });
  }

  await dbConnect();
  try {
    const { name, slug, description, color, icon, isFeatured, order } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ message: "Category name is required" }, { status: 400 });
    }

    const cleanSlug = (slug || name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Check duplicate
    const existing = await Category.findOne({
      $or: [{ name: name.trim() }, { slug: cleanSlug }]
    });
    if (existing) {
      return NextResponse.json({ message: "Category with this name or slug already exists" }, { status: 400 });
    }

    const category = await Category.create({
      name: name.trim(),
      slug: cleanSlug,
      description: description || '',
      color: color || '#3B82F6',
      icon: icon || 'newspaper',
      isFeatured: Boolean(isFeatured),
      order: typeof order === 'number' ? order : 0,
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    console.error('Error creating category:', error);
    return NextResponse.json({ message: error.message || "Error creating category" }, { status: 400 });
  }
}
