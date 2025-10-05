import React, { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { formatDeadlineDate, getDeadlineCountdown, isDeadlinePassed } from '@/app/lib/dateUtils';
import { IndustryType } from '@/models/Internship';
import ReviewsSection from './reviews-section';
import connectDB from '@/app/lib/mongodb';
import Internship from '@/models/Internship';

interface Internship {
  _id: string;
  title: string;
  company: string;
  location?: string;
  industry: IndustryType;
  graduationYear?: number;
  season?: string;
  deadline?: string;
  applyLink?: string;
  verified: boolean;
  createdAt: string;
}

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getInternship(id: string): Promise<Internship | null> {
  try {
    await connectDB();
    const internship = await (Internship as any).findById(id).lean();
    return internship;
  } catch (error) {
    console.error('Error fetching internship:', error);
    return null;
  }
}

export default async function InternshipDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  const internship = await getInternship(id);

  if (!internship) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="max-w-3xl mx-auto">
      {/* Back Button */}
      <Link 
        href="/internships" 
        className="mb-6 inline-flex items-center text-purple-600 hover:text-purple-700"
      >
        ← Back to Internships
      </Link>

      {/* Main Content */}
      <div className="rounded-xl bg-white p-8 shadow-lg">
        {/* Verified Badge */}
        {internship.verified && (
          <div className="mb-4 flex items-center gap-2">
            <span className="text-green-500" aria-label="Verified">✅</span>
            <span className="text-sm text-green-600 font-medium">Verified Listing</span>
          </div>
        )}

        {/* Title */}
        <h1 className="mb-4 text-3xl font-bold text-gray-900">{internship.title}</h1>
        
        {/* Company */}
        <p className="mb-6 text-xl text-gray-700">{internship.company}</p>

        {/* Details Grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          {internship.location && (
            <div>
              <span className="text-sm font-medium text-gray-500">📍 Location</span>
              <p className="text-gray-700">{internship.location}</p>
            </div>
          )}
          
          {internship.industry && (
            <div>
              <span className="text-sm font-medium text-gray-500">🏢 Industry</span>
              <p className="text-gray-700">{internship.industry}</p>
            </div>
          )}
          
          {internship.graduationYear && (
            <div>
              <span className="text-sm font-medium text-gray-500">🎓 Graduation Year</span>
              <p className="text-gray-700">Class of {internship.graduationYear}</p>
            </div>
          )}
          
          {internship.season && (
            <div>
              <span className="text-sm font-medium text-gray-500">📅 Season</span>
              <p className="text-gray-700">{internship.season}</p>
            </div>
          )}
        </div>

        {/* Deadline Section */}
        {internship.deadline && (
          <div className="mb-8 rounded-lg bg-gray-50 p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Application Deadline</h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                ⏰ Deadline: {formatDeadlineDate(new Date(internship.deadline))}
              </p>
              <p className={`text-sm font-medium ${
                isDeadlinePassed(new Date(internship.deadline))
                  ? 'text-red-600 font-semibold'
                  : 'text-purple-600'
              }`}>
                {isDeadlinePassed(new Date(internship.deadline))
                  ? '❌ Closed'
                  : `⏳ ${getDeadlineCountdown(new Date(internship.deadline))}`
                }
              </p>
            </div>
          </div>
        )}

        {/* Description Section */}
        <div className="mb-8">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">About This Internship</h3>
          <div className="prose prose-sm max-w-none text-gray-700">
            <p>
              This is an exciting opportunity to gain hands-on experience in the {internship.industry || 'tech'} industry 
              at {internship.company}. As a {internship.title.toLowerCase()}, you'll work on real projects and 
              contribute to meaningful work while building your professional network.
            </p>
            <p className="mt-4">
              This internship is designed for students graduating in {internship.graduationYear || '2026'} and 
              runs during the {internship.season || 'summer'} period. 
              {internship.location && ` The position is based in ${internship.location}.`}
            </p>
          </div>
        </div>

        {/* Apply Button */}
        <div className="flex gap-4">
          {internship.applyLink ? (
            <Link
              href={internship.applyLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded bg-purple-600 px-6 py-3 text-white font-medium transition-colors hover:bg-purple-700"
            >
              Apply Now
            </Link>
          ) : (
            <span className="inline-flex items-center justify-center rounded bg-gray-400 px-6 py-3 text-white font-medium">
              Application Link Not Available
            </span>
          )}
          
          <Link
            href="/internships"
            className="inline-flex items-center justify-center rounded border border-gray-300 bg-white px-6 py-3 text-gray-700 font-medium transition-colors hover:bg-gray-50"
          >
            Browse More Internships
          </Link>
        </div>
      </div>
      </div>
      <ReviewsSection internshipId={id} company={internship.company} />
    </div>
  );
}
