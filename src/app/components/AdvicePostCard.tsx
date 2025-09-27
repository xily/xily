import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface AdvicePostCardProps {
  post: {
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
  };
  currentUserId?: string;
  onDelete?: (postId: string) => void;
}

export default function AdvicePostCard({ post, currentUserId, onDelete }: AdvicePostCardProps) {
  const isOwner = currentUserId && post.userId._id === currentUserId;
  
  // Create preview of content (first 150 characters)
  const contentPreview = post.content.length > 150 
    ? post.content.substring(0, 150) + '...'
    : post.content;

  return (
    <div className="border rounded-lg p-4 mb-4 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            <Link 
              href={`/advice/${post._id}`}
              className="hover:text-purple-600 transition-colors"
            >
              {post.title}
            </Link>
          </h3>
          
          <p className="text-gray-700 mb-3 leading-relaxed">
            {contentPreview}
          </p>
          
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-4">
              <span className="font-medium text-gray-600">
                By {post.userId.name}
              </span>
              <span>
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <span>
                {post.commentCount} comment{post.commentCount !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
        
        {isOwner && onDelete && (
          <button
            onClick={() => onDelete(post._id)}
            className="ml-4 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
