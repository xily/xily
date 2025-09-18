import React from 'react';
import Link from 'next/link';

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

async function getInternships(): Promise<Internship[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/internships`, {
      cache: 'no-store', // Always fetch fresh data
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch internships');
    }
    
    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Error fetching internships:', error);
    return [];
  }
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'TBD';
  }
}

export default async function InternshipsPage() {
  const internships = await getInternships();

  if (internships.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="text-center">
          <h1 className="mb-4 text-3xl font-bold text-gray-900">Internships</h1>
          <p className="text-lg text-gray-600">No internships found. Check back soon!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">Internships</h1>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {internships.map((internship) => (
          <div key={internship._id} className="relative rounded-xl bg-white p-6 shadow-md">
            {/* Verified badge */}
            {internship.verified && (
              <div className="absolute right-4 top-4">
                <span className="text-green-500" aria-label="Verified">✅</span>
              </div>
            )}
            
            {/* Title */}
            <h2 className="mb-2 text-xl font-bold text-gray-900">{internship.title}</h2>
            
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
              {internship.deadline && (
                <p className="text-sm text-gray-600">
                  ⏰ Deadline: {formatDate(internship.deadline)}
                </p>
              )}
            </div>
            
            {/* Apply button */}
            {internship.applyLink ? (
              <Link
                href={internship.applyLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
              >
                Apply Now
              </Link>
            ) : (
              <span className="inline-block rounded bg-gray-400 px-4 py-2 text-white">
                No Link Available
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
