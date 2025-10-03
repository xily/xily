import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/options';
import connectDB from '@/app/lib/mongodb';
import ResumeComment from '@/models/ResumeComment';
import Resume from '@/models/Resume';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const resumeId = searchParams.get('resumeId');
    
    if (!resumeId) {
      return NextResponse.json({ error: 'Resume ID is required' }, { status: 400 });
    }
    
    const comments = await ResumeComment.find({ resumeId })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    
    return NextResponse.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await connectDB();
    
    const { resumeId, comment } = await request.json();
    
    if (!resumeId || !comment) {
      return NextResponse.json({ error: 'Resume ID and comment are required' }, { status: 400 });
    }
    
    // Verify resume exists
    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }
    
    const resumeComment = new ResumeComment({
      resumeId,
      userId: session.user.id,
      comment
    });
    
    await resumeComment.save();
    await resumeComment.populate('userId', 'name email');
    
    return NextResponse.json(resumeComment, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
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
    const commentId = searchParams.get('id');
    
    if (!commentId) {
      return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 });
    }
    
    // Check if user owns the comment
    const comment = await ResumeComment.findById(commentId);
    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }
    
    if (comment.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized to delete this comment' }, { status: 403 });
    }
    
    await ResumeComment.findByIdAndDelete(commentId);
    
    return NextResponse.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}
