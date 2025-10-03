import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/options';
import connectDB from '@/app/lib/mongodb';
import AdvicePost from '@/models/AdvicePost';
import AdviceComment from '@/models/AdviceComment';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const posts = await AdvicePost.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    
    // Get comment counts for each post
    const postsWithComments = await Promise.all(
      posts.map(async (post) => {
        const commentCount = await AdviceComment.countDocuments({ postId: post._id });
        return {
          ...post.toObject(),
          commentCount
        };
      })
    );
    
    return NextResponse.json(postsWithComments);
  } catch (error) {
    console.error('Error fetching advice posts:', error);
    return NextResponse.json({ error: 'Failed to fetch advice posts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await connectDB();
    
    const { title, content } = await request.json();
    
    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }
    
    if (title.length > 200) {
      return NextResponse.json({ error: 'Title must be 200 characters or less' }, { status: 400 });
    }
    
    if (content.length > 5000) {
      return NextResponse.json({ error: 'Content must be 5000 characters or less' }, { status: 400 });
    }
    
    const post = new AdvicePost({
      userId: session.user.id,
      title: title.trim(),
      content: content.trim()
    });
    
    await post.save();
    await post.populate('userId', 'name email');
    
    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Error creating advice post:', error);
    return NextResponse.json({ error: 'Failed to create advice post' }, { status: 500 });
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
    const postId = searchParams.get('id');
    
    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }
    
    // Check if user owns the post
    const post = await AdvicePost.findById(postId);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    
    if (post.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized to delete this post' }, { status: 403 });
    }
    
    // Delete associated comments
    await AdviceComment.deleteMany({ postId });
    
    // Delete the post
    await AdvicePost.findByIdAndDelete(postId);
    
    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting advice post:', error);
    return NextResponse.json({ error: 'Failed to delete advice post' }, { status: 500 });
  }
}
