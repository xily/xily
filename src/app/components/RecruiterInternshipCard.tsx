import { useState } from 'react';
import FeaturedBadge from './FeaturedBadge';
import IndustryBadge from './IndustryBadge';
import toast from 'react-hot-toast';

interface RecruiterInternshipCardProps {
  internship: {
    _id: string;
    title: string;
    company: string;
    location?: string;
    industry: string;
    graduationYear?: number;
    season?: string;
    deadline?: string;
    applyLink?: string;
    featured: boolean;
    createdAt: string;
  };
  onUpdate: (internshipId: string, updates: any) => void;
  onDelete: (internshipId: string) => void;
}

export default function RecruiterInternshipCard({ 
  internship, 
  onUpdate, 
  onDelete 
}: RecruiterInternshipCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggleFeatured = async () => {
    setIsUpdating(true);
    try {
      await onUpdate(internship._id, { featured: !internship.featured });
      toast.success(`Internship ${!internship.featured ? 'featured' : 'unfeatured'} successfully`);
    } catch (error) {
      toast.error('Failed to update internship');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this internship?')) {
      return;
    }
    
    setIsDeleting(true);
    try {
      await onDelete(internship._id);
      toast.success('Internship deleted successfully');
    } catch (error) {
      toast.error('Failed to delete internship');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={`border rounded-lg p-4 mb-4 bg-white shadow-sm hover:shadow-md transition-shadow ${
      internship.featured ? 'border-yellow-300 bg-yellow-50' : ''
    }`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{internship.title}</h3>
            {internship.featured && <FeaturedBadge />}
          </div>
          
          <div className="text-gray-700 font-medium mb-2">{internship.company}</div>
          
          <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
            {internship.location && (
              <span>📍 {internship.location}</span>
            )}
            {internship.season && (
              <span>📅 {internship.season}</span>
            )}
            {internship.graduationYear && (
              <span>🎓 {internship.graduationYear}</span>
            )}
          </div>
          
          <div className="flex items-center gap-2 mb-3">
            <IndustryBadge industry={internship.industry} />
            {internship.deadline && (
              <span className="text-sm text-gray-500">
                Deadline: {new Date(internship.deadline).toLocaleDateString()}
              </span>
            )}
          </div>
          
          {internship.applyLink && (
            <a
              href={internship.applyLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View Application Link →
            </a>
          )}
        </div>
        
        <div className="flex flex-col gap-2 ml-4">
          <button
            onClick={handleToggleFeatured}
            disabled={isUpdating}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              internship.featured
                ? 'bg-yellow-200 text-yellow-800 hover:bg-yellow-300'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isUpdating ? 'Updating...' : (internship.featured ? 'Unfeature' : 'Feature')}
          </button>
          
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
