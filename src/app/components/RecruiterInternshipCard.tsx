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
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: internship.title,
    company: internship.company,
    location: internship.location || '',
    industry: internship.industry,
    graduationYear: internship.graduationYear || '',
    season: internship.season || '',
    deadline: internship.deadline ? new Date(internship.deadline).toISOString().split('T')[0] : '',
    applyLink: internship.applyLink || '',
    featured: internship.featured
  });

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

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({
      title: internship.title,
      company: internship.company,
      location: internship.location || '',
      industry: internship.industry,
      graduationYear: internship.graduationYear || '',
      season: internship.season || '',
      deadline: internship.deadline ? new Date(internship.deadline).toISOString().split('T')[0] : '',
      applyLink: internship.applyLink || '',
      featured: internship.featured
    });
  };

  const handleSaveEdit = async () => {
    if (!editData.title.trim() || !editData.company.trim() || !editData.industry) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsUpdating(true);
    try {
      await onUpdate(internship._id, editData);
      setIsEditing(false);
      toast.success('Internship updated successfully');
    } catch (error) {
      toast.error('Failed to update internship');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({
      title: internship.title,
      company: internship.company,
      location: internship.location || '',
      industry: internship.industry,
      graduationYear: internship.graduationYear || '',
      season: internship.season || '',
      deadline: internship.deadline ? new Date(internship.deadline).toISOString().split('T')[0] : '',
      applyLink: internship.applyLink || '',
      featured: internship.featured
    });
  };

  if (isEditing) {
    return (
      <div className="border rounded-lg p-4 mb-4 bg-purple-600-light border-purple-600">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Internship</h3>
        <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                value={editData.title}
                onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
              <input
                type="text"
                value={editData.company}
                onChange={(e) => setEditData(prev => ({ ...prev, company: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={editData.location}
                onChange={(e) => setEditData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Industry *</label>
              <select
                value={editData.industry}
                onChange={(e) => setEditData(prev => ({ ...prev, industry: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
                required
              >
                <option value="Tech">Tech</option>
                <option value="Finance">Finance</option>
                <option value="Marketing">Marketing</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Consulting">Consulting</option>
                <option value="Education">Education</option>
                <option value="Government">Government</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Year</label>
              <input
                type="number"
                value={editData.graduationYear}
                onChange={(e) => setEditData(prev => ({ ...prev, graduationYear: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Season</label>
              <input
                type="text"
                value={editData.season}
                onChange={(e) => setEditData(prev => ({ ...prev, season: e.target.value }))}
                placeholder="e.g., Summer 2024"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
              <input
                type="date"
                value={editData.deadline}
                onChange={(e) => setEditData(prev => ({ ...prev, deadline: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Application Link</label>
              <input
                type="url"
                value={editData.applyLink}
                onChange={(e) => setEditData(prev => ({ ...prev, applyLink: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="featured-edit"
              checked={editData.featured}
              onChange={(e) => setEditData(prev => ({ ...prev, featured: e.target.checked }))}
              className="h-4 w-4 text-purple-600 focus:ring-purple-600 border-gray-300 rounded"
            />
            <label htmlFor="featured-edit" className="text-sm font-medium text-gray-700">
              Feature this internship
            </label>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isUpdating}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-600-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={handleCancelEdit}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

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
            <IndustryBadge industry={internship.industry || 'Other'} />
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
              className="text-purple-600 hover:text-purple-600-dark text-sm font-medium"
            >
              View Application Link →
            </a>
          )}
        </div>
        
        <div className="flex flex-col gap-2 ml-4">
          <button
            onClick={handleEdit}
            className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-600-dark transition-colors"
          >
            Edit
          </button>
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
