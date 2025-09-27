'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AdvicePostCard from '@/app/components/AdvicePostCard';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import toast from 'react-hot-toast';

interface AdvicePost {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  commentCount: number;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
}

export default function AdvicePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState<AdvicePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [submittingPost, setSubmittingPost] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/advice-posts');
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      } else {
        setError('Failed to fetch advice posts');
      }
    } catch (err) {
      console.error('Error fetching advice posts:', err);
      setError('Error fetching advice posts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      toast.error('Please log in to create a post');
      return;
    }
    
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      toast.error('Please provide both title and content');
      return;
    }

    setSubmittingPost(true);
    
    try {
      const response = await fetch('/api/advice-posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newPostTitle.trim(),
          content: newPostContent.trim()
        }),
      });

      if (response.ok) {
        const newPost = await response.json();
        setPosts(prev => [newPost, ...prev]);
        setNewPostTitle('');
        setNewPostContent('');
        toast.success('Post created successfully!');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to create post');
      }
    } catch (err) {
      console.error('Error creating post:', err);
      toast.error('Error creating post');
    } finally {
      setSubmittingPost(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const response = await fetch(`/api/advice-posts?id=${postId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPosts(prev => prev.filter(post => post._id !== postId));
        toast.success('Post deleted successfully');
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
          <LoadingSpinner size="md" />
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto py-8 px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Career Tips & Advice Board
          </h1>
          <p className="text-gray-600">
            Share your career insights and get advice from fellow students.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* New Post Form */}
        {session ? (
          <div className="border p-4 rounded-lg mb-6 bg-white">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Post</h2>
            <form onSubmit={handleSubmitPost} className="space-y-4">
              <div>
                <label htmlFor="post-title" className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  id="post-title"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  placeholder="Enter a descriptive title..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  maxLength={200}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {newPostTitle.length}/200 characters
                </p>
              </div>
              
              <div>
                <label htmlFor="post-content" className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                <textarea
                  id="post-content"
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Share your career tips, experiences, or ask for advice..."
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  maxLength={5000}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {newPostContent.length}/5000 characters
                </p>
              </div>
              
              <button
                type="submit"
                disabled={submittingPost || !newPostTitle.trim() || !newPostContent.trim()}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-600-dark disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {submittingPost ? 'Creating...' : 'Create Post'}
              </button>
            </form>
          </div>
        ) : (
          <div className="border p-4 rounded-lg mb-6 bg-purple-600-light">
            <p className="text-gray-700">
              <a href="/login" className="text-purple-600 hover:text-purple-600-dark font-medium">
                Log in
              </a> to create posts and share your career advice.
            </p>
          </div>
        )}

        {/* Posts List */}
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💡</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No posts yet</h2>
            <p className="text-gray-600">Be the first to share career advice!</p>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              All Posts ({posts.length})
            </h2>
            {posts.map((post) => (
              <AdvicePostCard
                key={post._id}
                post={post}
                currentUserId={session?.user?.id}
                onDelete={handleDeletePost}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
