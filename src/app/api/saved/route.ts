import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/options';
import connectDB from '@/app/lib/mongodb';
import SavedInternship from '@/models/SavedInternship';
import Internship from '@/models/Internship';

// GET - Fetch all saved internships for the logged-in user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Find all saved internships for the user with populated internship data
    const savedInternships = await SavedInternship.find({ userId: session.user.id })
      .populate('internshipId')
      .sort({ savedAt: -1 });

    return NextResponse.json({ savedInternships });
  } catch (error) {
    console.error('Error fetching saved internships:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Save an internship for the logged-in user
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { internshipId } = await request.json();

    if (!internshipId) {
      return NextResponse.json(
        { error: 'Internship ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if internship exists
    const internship = await Internship.findById(internshipId);
    if (!internship) {
      return NextResponse.json(
        { error: 'Internship not found' },
        { status: 404 }
      );
    }

    // Check if already saved
    const existingSave = await SavedInternship.findOne({
      userId: session.user.id,
      internshipId: internshipId,
    });

    if (existingSave) {
      return NextResponse.json(
        { error: 'Internship already saved' },
        { status: 400 }
      );
    }

    // Save the internship
    const savedInternship = new SavedInternship({
      userId: session.user.id,
      internshipId: internshipId,
    });

    await savedInternship.save();

    return NextResponse.json(
      { message: 'Internship saved successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error saving internship:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a saved internship
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const internshipId = searchParams.get('internshipId');

    if (!internshipId) {
      return NextResponse.json(
        { error: 'Internship ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find and delete the saved internship
    const deletedSave = await SavedInternship.findOneAndDelete({
      userId: session.user.id,
      internshipId: internshipId,
    });

    if (!deletedSave) {
      return NextResponse.json(
        { error: 'Saved internship not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Internship removed successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error removing saved internship:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
