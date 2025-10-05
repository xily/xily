'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import CommentCard from '@/app/components/CommentCard';
import toast from 'react-hot-toast';

interface Resume {
  _id: string;
  title: string;
  resumeUrl: string;
  createdAt: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  } | null;
}

interface Comment {
  _id: string;
  comment: string;
  createdAt: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
}

export default function ResumeDetailPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const resumeId = params.id as string;
  
  const [resume, setResume] = useState<Resume | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (resumeId) {
      fetchResume();
      fetchComments();
    }
  }, [resumeId]);

  const fetchResume = async () => {
    try {
      const response = await fetch('/api/resumes');
      if (response.ok) {
        const resumes = await response.json();
        const foundResume = resumes.find((r: Resume) => r._id === resumeId);
        if (foundResume) {
          setResume(foundResume);
        } else {
          setError('Resume not found');
        }
      } else {
        setError('Failed to fetch resume');
      }
    } catch (err) {
      console.error('Error fetching resume:', err);
      setError('Error fetching resume');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/resume-comments?resumeId=${resumeId}`);
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
      const response = await fetch('/api/resume-comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeId,
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
      const response = await fetch(`/api/resume-comments?id=${commentId}`, {
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

  if (error || !resume) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Resume Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-purple-600 hover:text-purple-700 mb-4 flex items-center"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{resume.title}</h1>
          <div className="text-gray-600">
            <span className="font-medium">Uploaded by:</span> {resume.userId ? resume.userId.name : 'Unknown User'}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {new Date(resume.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* PDF Viewer */}
          <div className="bg-white rounded-lg border shadow-sm">
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Resume Preview</h2>
            </div>
            <div className="p-4">
              <iframe
                src={resume.resumeUrl}
                className="w-full h-96 border rounded"
                title={resume.title}
              />
              <div className="mt-4 text-center">
                <a
                  href={resume.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
                >
                  Open in New Tab
                </a>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="bg-white rounded-lg border shadow-sm">
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                Comments ({comments.length})
              </h2>
            </div>
            
            <div className="p-4">
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
                      placeholder="Share your feedback, tips, or suggestions..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      required
                    />
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
                    </a> to add comments and provide feedback.
                  </p>
                </div>
              )}

              {/* Comments List */}
              {comments.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">💬</div>
                  <p className="text-gray-500">No comments yet. Be the first to provide feedback!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <CommentCard
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
      </div>
    </div>
  );
}
