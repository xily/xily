import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/options';
import connectDB from '@/app/lib/mongodb';
import Review from '@/models/Review';
import Internship from '@/models/Internship';

// GET → return all reviews (optionally filter by company or internshipId)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const company = searchParams.get('company');
    const internshipId = searchParams.get('internshipId');

    const query: any = {};
    if (company) query.company = company;
    if (internshipId) query.internshipId = internshipId;

    const reviews = await Review.find(query)
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .lean();

    const mapped = reviews.map((r: any) => ({
      ...r,
      userId: r.userId && typeof r.userId === 'object' ? (r.userId._id?.toString?.() || '') : r.userId?.toString?.(),
      userName: r.userId && typeof r.userId === 'object' ? r.userId.name : undefined,
    }));

    return NextResponse.json({ success: true, data: mapped });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// POST → logged-in user submits a new review
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { company, internshipId, rating, pros, cons, advice } = body || {};

    if (!company || !rating || !pros || !cons) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    await connectDB();

    if (internshipId) {
      const exists = await Internship.findById(internshipId).select('_id');
      if (!exists) {
        return NextResponse.json({ error: 'Internship not found' }, { status: 404 });
      }
    }

    // If internshipId provided, ensure user hasn't already reviewed this internship
    if (internshipId) {
      const existing = await Review.findOne({ userId: session.user.id, internshipId });
      if (existing) {
        return NextResponse.json({ error: 'You have already reviewed this internship' }, { status: 409 });
      }
    }

    let review;
    try {
      review = await Review.create({
        userId: session.user.id,
        company,
        internshipId: internshipId || undefined,
        rating,
        pros,
        cons,
        advice: advice || undefined,
      });
    } catch (e: any) {
      // Handle unique index collisions gracefully
      if (e?.code === 11000) {
        return NextResponse.json({ error: 'You have already reviewed this internship' }, { status: 409 });
      }
      throw e;
    }

    const plain = review.toObject ? review.toObject() : review;
    const mapped = { ...plain, userId: plain.userId?.toString?.() };
    return NextResponse.json({ success: true, data: mapped }, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE → allow user to delete their review
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Review id is required' }, { status: 400 });
    }

    await connectDB();

    const deleted = await Review.findOneAndDelete({ _id: id, userId: session.user.id });
    if (!deleted) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH → allow user to update their review (by id or internshipId)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const internshipId = searchParams.get('internshipId');

    const body = await request.json();
    const updates: any = {};
    if (body.rating !== undefined) {
      const r = Number(body.rating);
      if (isNaN(r) || r < 1 || r > 5) return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
      updates.rating = r;
    }
    if (body.pros !== undefined) updates.pros = String(body.pros);
    if (body.cons !== undefined) updates.cons = String(body.cons);
    if (body.advice !== undefined) updates.advice = body.advice === '' ? undefined : String(body.advice);

    await connectDB();

    const filter: any = { userId: session.user.id };
    if (id) filter._id = id;
    else if (internshipId) filter.internshipId = internshipId;
    else return NextResponse.json({ error: 'Provide id or internshipId' }, { status: 400 });

    const updated = await Review.findOneAndUpdate(filter, { $set: updates }, { new: true });
    if (!updated) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    const plain = updated.toObject ? updated.toObject() : updated;
    const mapped = { ...plain, userId: plain.userId?.toString?.() };
    return NextResponse.json({ success: true, data: mapped });
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}


