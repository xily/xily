'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

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

interface Filters {
  graduationYear: string;
  season: string;
  location: string;
  industry: string;
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

export default function InternshipsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  const [filters, setFilters] = useState<Filters>({
    graduationYear: searchParams.get('graduationYear') || '',
    season: searchParams.get('season') || '',
    location: searchParams.get('location') || '',
    industry: searchParams.get('industry') || '',
  });

  const fetchInternships = async (filterParams: Filters) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filterParams).forEach(([key, value]) => {
        if (value) queryParams.set(key, value);
      });
      
      const response = await fetch(`/api/internships?${queryParams.toString()}`);
      const data = await response.json();
      setInternships(data.success ? data.data : []);
    } catch (error) {
      console.error('Error fetching internships:', error);
      setInternships([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInternships(filters);
  }, []);

  const updateFilters = (newFilters: Partial<Filters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    
    // Update URL
    const queryParams = new URLSearchParams();
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value) queryParams.set(key, value);
    });
    
    const newUrl = queryParams.toString() ? `?${queryParams.toString()}` : '/internships';
    router.push(newUrl, { scroll: false });
    
    // Fetch filtered data
    fetchInternships(updatedFilters);
  };

  const resetFilters = () => {
    const emptyFilters = { graduationYear: '', season: '', location: '', industry: '' };
    setFilters(emptyFilters);
    router.push('/internships', { scroll: false });
    fetchInternships(emptyFilters);
  };

  const FilterSidebar = () => (
    <div className="w-64 bg-gray-50 border-r p-4">
      <div className="mb-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Filters</h2>
        
        {/* Graduation Year */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Graduation Year
          </label>
          <select
            value={filters.graduationYear}
            onChange={(e) => updateFilters({ graduationYear: e.target.value })}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">All Years</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
          </select>
        </div>

        {/* Season */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Season
          </label>
          <select
            value={filters.season}
            onChange={(e) => updateFilters({ season: e.target.value })}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">All Seasons</option>
            <option value="Summer 2025">Summer 2025</option>
            <option value="Fall 2025">Fall 2025</option>
            <option value="Summer 2026">Summer 2026</option>
            <option value="Fall 2026">Fall 2026</option>
            <option value="Summer 2027">Summer 2027</option>
            <option value="Fall 2027">Fall 2027</option>
          </select>
        </div>

        {/* Location */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Location
          </label>
          <select
            value={filters.location}
            onChange={(e) => updateFilters({ location: e.target.value })}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">All Locations</option>
            <option value="New York">New York, NY</option>
            <option value="San Francisco">San Francisco, CA</option>
            <option value="Los Angeles">Los Angeles, CA</option>
            <option value="Seattle">Seattle, WA</option>
            <option value="Austin">Austin, TX</option>
            <option value="Boston">Boston, MA</option>
            <option value="Chicago">Chicago, IL</option>
            <option value="Denver">Denver, CO</option>
            <option value="Miami">Miami, FL</option>
            <option value="Remote">Remote</option>
          </select>
        </div>

        {/* Industry */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Industry
          </label>
          <select
            value={filters.industry}
            onChange={(e) => updateFilters({ industry: e.target.value })}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">All Industries</option>
            <option value="Tech">Tech</option>
            <option value="Finance">Finance</option>
            <option value="Marketing">Marketing</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Reset Button */}
        <button
          onClick={resetFilters}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );

  const MobileFilterButton = () => (
    <button
      onClick={() => setShowMobileFilters(!showMobileFilters)}
      className="mb-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 lg:hidden"
    >
      {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
    </button>
  );

  const MobileFilters = () => (
    showMobileFilters && (
      <div className="mb-6 rounded-lg bg-gray-50 p-4 lg:hidden">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Filters</h3>
        
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Graduation Year */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Graduation Year
            </label>
            <select
              value={filters.graduationYear}
              onChange={(e) => updateFilters({ graduationYear: e.target.value })}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">All Years</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
            </select>
          </div>

          {/* Season */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Season
            </label>
            <select
              value={filters.season}
              onChange={(e) => updateFilters({ season: e.target.value })}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">All Seasons</option>
              <option value="Summer 2025">Summer 2025</option>
              <option value="Fall 2025">Fall 2025</option>
              <option value="Summer 2026">Summer 2026</option>
              <option value="Fall 2026">Fall 2026</option>
              <option value="Summer 2027">Summer 2027</option>
              <option value="Fall 2027">Fall 2027</option>
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Location
            </label>
            <select
              value={filters.location}
              onChange={(e) => updateFilters({ location: e.target.value })}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">All Locations</option>
              <option value="New York">New York, NY</option>
              <option value="San Francisco">San Francisco, CA</option>
              <option value="Los Angeles">Los Angeles, CA</option>
              <option value="Seattle">Seattle, WA</option>
              <option value="Austin">Austin, TX</option>
              <option value="Boston">Boston, MA</option>
              <option value="Chicago">Chicago, IL</option>
              <option value="Denver">Denver, CO</option>
              <option value="Miami">Miami, FL</option>
              <option value="Remote">Remote</option>
            </select>
          </div>

          {/* Industry */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Industry
            </label>
            <select
              value={filters.industry}
              onChange={(e) => updateFilters({ industry: e.target.value })}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">All Industries</option>
              <option value="Tech">Tech</option>
              <option value="Finance">Finance</option>
              <option value="Marketing">Marketing</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <button
          onClick={resetFilters}
          className="mt-4 text-sm text-gray-500 hover:text-gray-700"
        >
          Reset Filters
        </button>
      </div>
    )
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="text-center">
          <h1 className="mb-4 text-3xl font-bold text-gray-900">Internships</h1>
          <p className="text-lg text-gray-600">Loading internships...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">Internships</h1>
      
      <MobileFilterButton />
      <MobileFilters />
      
      <div className="flex gap-6">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <FilterSidebar />
        </div>
        
        {/* Main Content */}
        <div className="flex-1">
          {internships.length === 0 ? (
            <div className="text-center">
              <p className="text-lg text-gray-600">No internships found. Check back soon!</p>
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
}
