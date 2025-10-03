import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/options';
import connectDB from '@/app/lib/mongodb';
import AlertPreference from '@/models/AlertPreference';
import SavedFilter from '@/models/SavedFilter';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const alerts = await AlertPreference.find({ userId: session.user.id, active: true })
      .populate('filterId')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, alerts });
  } catch (error) {
    console.error('GET /api/alerts error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load alert preferences' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { filterId } = body || {};

    if (!filterId) {
      return NextResponse.json({ success: false, error: 'Filter ID is required' }, { status: 400 });
    }

    await connectDB();

    // Verify the filter belongs to the user
    const filter = await SavedFilter.findOne({ _id: filterId, userId: session.user.id });
    if (!filter) {
      return NextResponse.json({ success: false, error: 'Filter not found' }, { status: 404 });
    }

    // Create or update alert preference
    const alert = await AlertPreference.findOneAndUpdate(
      { userId: session.user.id, filterId },
      { active: true },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, alert }, { status: 201 });
  } catch (error) {
    console.error('POST /api/alerts error:', error);
    return NextResponse.json({ success: false, error: 'Failed to enable alerts' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const filterId = searchParams.get('filterId');
    if (!filterId) {
      return NextResponse.json({ success: false, error: 'Filter ID is required' }, { status: 400 });
    }

    await connectDB();
    const result = await AlertPreference.deleteOne({ 
      userId: session.user.id, 
      filterId 
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, error: 'Alert preference not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/alerts error:', error);
    return NextResponse.json({ success: false, error: 'Failed to disable alerts' }, { status: 500 });
  }
}
