'use client';

import React from 'react';
import { formatDeadlineDate, getDeadlineCountdown, isDeadlinePassed } from '@/app/lib/dateUtils';

interface Internship {
  _id: string;
  title: string;
  company: string;
  location?: string;
  industry?: string;
  graduationYear?: number;
  season?: string;
  deadline?: string;
  applyLink?: string;
  verified: boolean;
  createdAt: string;
}

interface InternshipCardProps {
  internship: Internship;
  showRemoveButton?: boolean;
  onRemove?: (internshipId: string) => void;
  showSaveButton?: boolean;
  onSave?: (internshipId: string) => void;
  isSaved?: boolean;
}

export default function InternshipCard({ 
  internship, 
  showRemoveButton = false, 
  onRemove,
  showSaveButton = false,
  onSave,
  isSaved = false
}: InternshipCardProps) {
  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onRemove) {
      onRemove(internship._id);
    }
  };

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onSave) {
      onSave(internship._id);
    }
  };

  const handleCardClick = () => {
    window.location.href = `/internships/${internship._id}`;
  };

  return (
    <div 
      className="relative rounded-xl bg-white p-6 shadow-md transition-shadow hover:shadow-lg cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Verified badge */}
      {internship.verified && (
        <div className="absolute right-4 top-4">
          <span className="text-green-500" aria-label="Verified">✅</span>
        </div>
      )}
      
      {/* Action buttons */}
      {(showRemoveButton || showSaveButton) && (
        <div className="absolute right-4 top-12 flex gap-2">
          {showRemoveButton && (
            <button
              onClick={handleRemove}
              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
            >
              Remove
            </button>
          )}
          {showSaveButton && (
            <button
              onClick={handleSave}
              className={`px-3 py-1 rounded text-sm ${
                isSaved 
                  ? 'bg-gray-500 text-white cursor-not-allowed' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
              disabled={isSaved}
            >
              {isSaved ? 'Saved' : 'Save'}
            </button>
          )}
        </div>
      )}
      
      {/* Title */}
      <h2 className="mb-2 text-xl font-bold text-gray-900 pr-20">{internship.title}</h2>
      
      {/* Company */}
      <p className="mb-1 text-sm font-medium text-gray-700">{internship.company}</p>
      
      {/* Details */}
      <div className="mb-4 space-y-1">
        {internship.location && (
          <p className="text-sm text-gray-600">📍 {internship.location}</p>
        )}
        {internship.industry && (
          <p className="text-sm text-gray-600">🏢 {internship.industry}</p>
        )}
        {internship.graduationYear && (
          <p className="text-sm text-gray-600">🎓 Class of {internship.graduationYear}</p>
        )}
        {internship.season && (
          <p className="text-sm text-gray-600">📅 {internship.season}</p>
        )}
      </div>
      
      {/* Deadline */}
      {internship.deadline && (
        <div className="mb-4">
          {isDeadlinePassed(internship.deadline) ? (
            <p className="text-sm text-red-600 font-medium">
              ⏰ Deadline passed: {formatDeadlineDate(internship.deadline)}
            </p>
          ) : (
            <p className="text-sm text-gray-600">
              ⏰ {getDeadlineCountdown(internship.deadline)}
            </p>
          )}
        </div>
      )}
      
      {/* Apply Button */}
      {internship.applyLink && (
        <div className="mt-4">
          <a
            href={internship.applyLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded bg-blue-600 px-6 py-3 text-white font-medium transition-colors hover:bg-blue-700"
            onClick={(e) => e.stopPropagation()}
          >
            Apply Now
          </a>
        </div>
      )}
    </div>
  );
}
