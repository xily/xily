'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import AdviceCommentCard from '@/app/components/AdviceCommentCard';
import toast from 'react-hot-toast';

interface AdvicePost {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
}

interface AdviceComment {
  _id: string;
  comment: string;
  createdAt: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
}

export default function AdviceDetailPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  
  const [post, setPost] = useState<AdvicePost | null>(null);
  const [comments, setComments] = useState<AdviceComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (postId) {
      fetchPost();
      fetchComments();
    }
  }, [postId]);

  const fetchPost = async () => {
    try {
      const response = await fetch('/api/advice-posts');
      if (response.ok) {
        const posts = await response.json();
        const foundPost = posts.find((p: AdvicePost) => p._id === postId);
        if (foundPost) {
          setPost(foundPost);
        } else {
          setError('Post not found');
        }
      } else {
        setError('Failed to fetch post');
      }
    } catch (err) {
      console.error('Error fetching post:', err);
      setError('Error fetching post');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/advice-comments?postId=${postId}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      } else {
        console.error('Failed to fetch comments');
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      toast.error('Please log in to comment');
      return;
    }
    
    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    setSubmittingComment(true);
    
    try {
      const response = await fetch('/api/advice-comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId,
          comment: newComment.trim()
        }),
      });

      if (response.ok) {
        const newCommentData = await response.json();
        setComments(prev => [newCommentData, ...prev]);
        setNewComment('');
        toast.success('Comment added successfully!');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to add comment');
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      toast.error('Error adding comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const response = await fetch(`/api/advice-comments?id=${commentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setComments(prev => prev.filter(comment => comment._id !== commentId));
        toast.success('Comment deleted successfully');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete comment');
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
      toast.error('Error deleting comment');
    }
  };

  const handleDeletePost = async () => {
    if (!post) return;
    
    try {
      const response = await fetch(`/api/advice-posts?id=${post._id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Post deleted successfully');
        router.push('/advice');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete post');
      }
    } catch (err) {
      console.error('Error deleting post:', err);
      toast.error('Error deleting post');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Post Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/advice')}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
          >
            Back to Advice Board
          </button>
        </div>
      </div>
    );
  }

  const isPostOwner = session?.user?.id === post.userId._id;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-purple-600 hover:text-purple-700 mb-4 flex items-center"
          >
            ← Back
          </button>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{post.title}</h1>
              <div className="text-gray-600 mb-4">
                <span className="font-medium">By {post.userId.name}</span>
                <span className="mx-2">•</span>
                <span>{new Date(post.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
            </div>
            
            {isPostOwner && (
              <button
                onClick={handleDeletePost}
                className="ml-4 px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Delete Post
              </button>
            )}
          </div>
        </div>

        {/* Post Content */}
        <div className="bg-white rounded-lg border shadow-sm p-6 mb-8">
          <div className="prose max-w-none">
            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Comments ({comments.length})
          </h2>
          
          {/* Add Comment Form */}
          {session ? (
            <form onSubmit={handleSubmitComment} className="mb-6">
              <div className="mb-4">
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                  Add a Comment
                </label>
                <textarea
                  id="comment"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts or additional advice..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  maxLength={1000}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {newComment.length}/1000 characters
                </p>
              </div>
              <button
                type="submit"
                disabled={submittingComment || !newComment.trim()}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {submittingComment ? 'Posting...' : 'Post Comment'}
              </button>
            </form>
          ) : (
            <div className="mb-6 p-4 bg-gray-50 rounded-md">
              <p className="text-gray-600 text-sm">
                <a href="/login" className="text-purple-600 hover:text-purple-700">
                  Log in
                </a> to add comments and share your thoughts.
              </p>
            </div>
          )}

          {/* Comments List */}
          {comments.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">💬</div>
              <p className="text-gray-500">No comments yet. Be the first to share your thoughts!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => (
                <AdviceCommentCard
                  key={comment._id}
                  comment={comment}
                  currentUserId={session?.user?.id}
                  onDelete={handleDeleteComment}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
