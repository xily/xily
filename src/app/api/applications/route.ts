import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/options';
import connectDB from '@/app/lib/mongodb';
import Application from '@/models/Application';
import Internship from '@/models/Internship';

// GET - Fetch all applications for the logged-in user
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

    // Find all applications for the user with populated internship data
    const applications = await (Application as any).find({ userId: session.user.id })
      .populate('internshipId')
      .sort({ updatedAt: -1 });

    return NextResponse.json({ applications });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create or update an application
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { internshipId, status, notes } = await request.json();

    if (!internshipId || !status) {
      return NextResponse.json(
        { error: 'Internship ID and status are required' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['Saved', 'Applied', 'Interviewing', 'Offer', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: Saved, Applied, Interviewing, Offer, Rejected' },
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

    // Find existing application or create new one
    const existingApplication = await (Application as any).findOne({
      userId: session.user.id,
      internshipId: internshipId,
    });

    let application;
    if (existingApplication) {
      // Update existing application
      application = await (Application as any).findByIdAndUpdate(
        existingApplication._id,
        { status, notes },
        { new: true }
      ).populate('internshipId');
    } else {
      // Create new application
      application = new (Application as any)({
        userId: session.user.id,
        internshipId: internshipId,
        status,
        notes,
      });
      await application.save();
      await application.populate('internshipId');
    }

    return NextResponse.json(
      { 
        message: existingApplication ? 'Application updated successfully' : 'Application created successfully',
        application 
      },
      { status: existingApplication ? 200 : 201 }
    );
  } catch (error) {
    console.error('Error creating/updating application:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Remove an application
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

    // Find and delete the application
    const deletedApplication = await (Application as any).findOneAndDelete({
      userId: session.user.id,
      internshipId: internshipId,
    });

    if (!deletedApplication) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Application removed successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error removing application:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
