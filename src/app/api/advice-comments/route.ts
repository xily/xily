import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/options';
import connectDB from '@/app/lib/mongodb';
import AdviceComment from '@/models/AdviceComment';
import AdvicePost from '@/models/AdvicePost';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    
    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }
    
    const comments = await (AdviceComment as any).find({ postId })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    
    return NextResponse.json(comments);
  } catch (error) {
    console.error('Error fetching advice comments:', error);
    return NextResponse.json({ error: 'Failed to fetch advice comments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await connectDB();
    
    const { postId, comment } = await request.json();
    
    if (!postId || !comment) {
      return NextResponse.json({ error: 'Post ID and comment are required' }, { status: 400 });
    }
    
    if (comment.length > 1000) {
      return NextResponse.json({ error: 'Comment must be 1000 characters or less' }, { status: 400 });
    }
    
    // Verify post exists
    const post = await AdvicePost.findById(postId);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    
    const adviceComment = new AdviceComment({
      postId,
      userId: session.user.id,
      comment: comment.trim()
    });
    
    await adviceComment.save();
    await adviceComment.populate('userId', 'name email');
    
    return NextResponse.json(adviceComment, { status: 201 });
  } catch (error) {
    console.error('Error creating advice comment:', error);
    return NextResponse.json({ error: 'Failed to create advice comment' }, { status: 500 });
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
    const comment = await AdviceComment.findById(commentId);
    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }
    
    if (comment.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized to delete this comment' }, { status: 403 });
    }
    
    await AdviceComment.findByIdAndDelete(commentId);
    
    return NextResponse.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting advice comment:', error);
    return NextResponse.json({ error: 'Failed to delete advice comment' }, { status: 500 });
  }
}
