import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/app/lib/mongodb';
import SavedFilter from '@/models/SavedFilter';

export async function GET() {
  try {
    const session = await getServerSession(authOptions as any);
    if (!session?.user?.id) {
      return NextResponse.json({ success: true, filters: [] });
    }

    await connectDB();
    const filters = await SavedFilter.find({ userId: session.user.id }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, filters });
  } catch (error) {
    console.error('GET /api/filters error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load saved filters' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { graduationYear, season, location, industry } = body || {};

    await connectDB();
    // Avoid duplicates: if a saved filter with identical criteria exists, return it
    const query: any = {
      userId: session.user.id,
      graduationYear: graduationYear ? Number(graduationYear) : { $in: [undefined, null] },
      season: season || { $in: [undefined, null, ''] },
      location: location || { $in: [undefined, null, ''] },
      industry: industry || { $in: [undefined, null, ''] },
    };

    // Build exact-match query by only including fields that are provided, and ensuring missing ones are null/undefined
    const exactQuery: any = { userId: session.user.id };
    if (graduationYear) exactQuery.graduationYear = Number(graduationYear); else exactQuery.graduationYear = { $exists: false };
    if (season) exactQuery.season = season; else exactQuery.season = { $in: [undefined, null] };
    if (location) exactQuery.location = location; else exactQuery.location = { $in: [undefined, null] };
    if (industry) exactQuery.industry = industry; else exactQuery.industry = { $in: [undefined, null] };

    const existing = await SavedFilter.findOne(exactQuery);
    if (existing) {
      return NextResponse.json({ success: true, filter: existing, duplicate: true }, { status: 200 });
    }

    const created = await SavedFilter.create({
      userId: session.user.id,
      graduationYear: graduationYear ? Number(graduationYear) : undefined,
      season: season || undefined,
      location: location || undefined,
      industry: industry || undefined,
    });

    return NextResponse.json({ success: true, filter: created }, { status: 201 });
  } catch (error) {
    console.error('POST /api/filters error:', error);
    return NextResponse.json({ success: false, error: 'Failed to save filter' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });
    }

    await connectDB();
    const result = await SavedFilter.deleteOne({ _id: id, userId: session.user.id });
    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, error: 'Filter not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/filters error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete filter' }, { status: 500 });
  }
}


