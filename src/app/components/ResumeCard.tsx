import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface ResumeCardProps {
  resume: {
    _id: string;
    title: string;
    resumeUrl: string;
    createdAt: string;
    commentCount: number;
    userId: {
      _id: string;
      name: string;
      email: string;
    } | null;
  };
  currentUserId?: string;
  onDelete?: (resumeId: string) => void;
}

export default function ResumeCard({ resume, currentUserId, onDelete }: ResumeCardProps) {
  const isOwner = currentUserId && resume.userId && resume.userId._id === currentUserId;

  return (
    <div className="border rounded-lg p-4 mb-4 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            <Link 
              href={`/resumes/${resume._id}`}
              className="hover:text-purpleBrand-accent transition-colors"
            >
              {resume.title}
            </Link>
          </h3>
          
          <div className="text-sm text-gray-600 mb-2">
            <span className="font-medium">Uploaded by:</span> {resume.userId ? resume.userId.name : 'Unknown User'}
          </div>
          
          <div className="text-sm text-gray-500 mb-3">
            {formatDistanceToNow(new Date(resume.createdAt), { addSuffix: true })}
          </div>
          
          <div className="flex items-center gap-4">
            <Link
              href={resume.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purpleBrand-accent hover:opacity-80 text-sm font-medium"
            >
              View Resume PDF
            </Link>
            
            <span className="text-sm text-gray-500">
              {resume.commentCount} comment{resume.commentCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        
        {isOwner && onDelete && (
          <button
            onClick={() => onDelete(resume._id)}
            className="ml-4 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
