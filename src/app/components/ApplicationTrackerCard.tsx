'use client';

import React, { useState } from 'react';
import { formatDeadlineDate, getDeadlineCountdown, isDeadlinePassed } from '@/app/lib/dateUtils';
import StatusBadge from './StatusBadge';

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

interface Application {
  _id: string;
  status: 'Saved' | 'Applied' | 'Interviewing' | 'Offer' | 'Rejected';
  notes?: string;
  updatedAt: string;
}

interface ApplicationTrackerCardProps {
  internship: Internship;
  application?: Application;
  onUpdateApplication: (internshipId: string, status: string, notes: string) => Promise<void>;
  onRemove: (internshipId: string) => void;
  isUpdating?: boolean;
}


export default function ApplicationTrackerCard({ 
  internship, 
  application,
  onUpdateApplication,
  onRemove,
  isUpdating = false
}: ApplicationTrackerCardProps) {
  const [status, setStatus] = useState(application?.status || 'Saved');
  const [notes, setNotes] = useState(application?.notes || '');
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = async () => {
    await onUpdateApplication(internship._id, status, notes);
    setIsEditing(false);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onRemove(internship._id);
  };

  const handleCardClick = () => {
    window.location.href = `/internships/${internship._id}`;
  };

  return (
    <div 
      className="relative rounded-xl bg-white p-6 shadow-md transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer border border-gray-100"
      onClick={handleCardClick}
    >
      {/* Verified badge */}
      {internship.verified && (
        <div className="absolute right-4 top-4">
          <span className="text-green-500" aria-label="Verified">✅</span>
        </div>
      )}
      
      {/* Remove button */}
      <div className="absolute right-4 top-12">
        <button
          onClick={handleRemove}
          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
        >
          Remove
        </button>
      </div>
      
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

      {/* Application Tracker Section */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="space-y-4">
          {/* Status Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Application Status
            </label>
            {isEditing ? (
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="border rounded px-2 py-1 w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <option value="Saved">Saved</option>
                <option value="Applied">Applied</option>
                <option value="Interviewing">Interviewing</option>
                <option value="Offer">Offer</option>
                <option value="Rejected">Rejected</option>
              </select>
            ) : (
              <div className="flex items-center gap-2">
                <StatusBadge status={status} size="sm" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                  className="text-blue-600 text-sm hover:text-blue-700"
                >
                  Edit
                </button>
              </div>
            )}
          </div>

          {/* Notes Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            {isEditing ? (
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this application..."
                className="textarea border rounded px-3 py-2 w-full h-20 resize-none"
                onClick={(e) => e.stopPropagation()}
                maxLength={500}
              />
            ) : (
              <div className="min-h-[60px]">
                {notes ? (
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{notes}</p>
                ) : (
                  <p className="text-sm text-gray-400 italic">No notes added</p>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                  className="text-blue-600 text-sm hover:text-blue-700 mt-1"
                >
                  {notes ? 'Edit notes' : 'Add notes'}
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSave();
                }}
                disabled={isUpdating}
                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
              >
                {isUpdating ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setStatus(application?.status || 'Saved');
                  setNotes(application?.notes || '');
                  setIsEditing(false);
                }}
                className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 text-sm"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
