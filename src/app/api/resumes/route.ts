import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import connectDB from '@/app/lib/mongodb';
import Resume from '@/models/Resume';
import ResumeComment from '@/models/ResumeComment';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    let query = {};
    if (userId) {
      query = { userId };
    }
    
    const resumes = await Resume.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    
    // Get comment counts for each resume
    const resumesWithComments = await Promise.all(
      resumes.map(async (resume) => {
        const commentCount = await ResumeComment.countDocuments({ resumeId: resume._id });
        return {
          ...resume.toObject(),
          commentCount
        };
      })
    );
    
    return NextResponse.json(resumesWithComments);
  } catch (error) {
    console.error('Error fetching resumes:', error);
    return NextResponse.json({ error: 'Failed to fetch resumes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await connectDB();
    
    const { resumeUrl, title } = await request.json();
    
    if (!resumeUrl || !title) {
      return NextResponse.json({ error: 'Resume URL and title are required' }, { status: 400 });
    }
    
    // Check if user already has a resume
    const existingResume = await Resume.findOne({ userId: session.user.id });
    
    if (existingResume) {
      // Update existing resume
      existingResume.resumeUrl = resumeUrl;
      existingResume.title = title;
      existingResume.createdAt = new Date(); // Update timestamp
      await existingResume.save();
      
      return NextResponse.json(existingResume, { status: 200 });
    } else {
      // Create new resume
      const resume = new Resume({
        userId: session.user.id,
        resumeUrl,
        title
      });
      
      await resume.save();
      
      return NextResponse.json(resume, { status: 201 });
    }
  } catch (error) {
    console.error('Error creating/updating resume:', error);
    return NextResponse.json({ error: 'Failed to create/update resume' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const resumeId = searchParams.get('id');
    
    if (!resumeId) {
      return NextResponse.json({ error: 'Resume ID is required' }, { status: 400 });
    }
    
    // Check if user owns the resume
    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }
    
    if (resume.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized to delete this resume' }, { status: 403 });
    }
    
    // Delete associated comments
    await ResumeComment.deleteMany({ resumeId });
    
    // Delete the resume
    await Resume.findByIdAndDelete(resumeId);
    
    return NextResponse.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    console.error('Error deleting resume:', error);
    return NextResponse.json({ error: 'Failed to delete resume' }, { status: 500 });
  }
}
