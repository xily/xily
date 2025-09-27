import { formatDistanceToNow } from 'date-fns';

interface AdviceCommentCardProps {
  comment: {
    _id: string;
    comment: string;
    createdAt: string;
    userId: {
      _id: string;
      name: string;
      email: string;
    };
  };
  currentUserId?: string;
  onDelete?: (commentId: string) => void;
}

export default function AdviceCommentCard({ comment, currentUserId, onDelete }: AdviceCommentCardProps) {
  const isOwner = currentUserId && comment.userId._id === currentUserId;

  return (
    <div className="border rounded p-3 mb-2 bg-gray-50">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium text-gray-900 text-sm">
              {comment.userId.name}
            </span>
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
          </div>
          
          <p className="text-gray-700 text-sm leading-relaxed">
            {comment.comment}
          </p>
        </div>
        
        {isOwner && onDelete && (
          <button
            onClick={() => onDelete(comment._id)}
            className="ml-3 px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
