'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { formatDeadlineDate, getDeadlineCountdown, isDeadlinePassed } from '@/app/lib/dateUtils';
import InternshipCard from '@/app/components/InternshipCard';

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
  const { data: session } = useSession();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [savedInternships, setSavedInternships] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState('');
  const [savedFilters, setSavedFilters] = useState<Array<{
    _id: string;
    graduationYear?: number;
    season?: string;
    location?: string;
    industry?: string;
    createdAt: string;
  }>>([]);
  const [alertPreferences, setAlertPreferences] = useState<Set<string>>(new Set());
  
  const [filters, setFilters] = useState<Filters>({
    graduationYear: searchParams.get('graduationYear') || '',
    season: searchParams.get('season') || '',
    location: searchParams.get('location') || '',
    industry: searchParams.get('industry') || '',
  });

  const fetchInternships = async (filterParams: Filters) => {
    setLoading(true);
    setError('');
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filterParams).forEach(([key, value]) => {
        if (value) queryParams.set(key, value);
      });
      
      const response = await fetch(`/api/internships?${queryParams.toString()}`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        setInternships(data.data);
      } else {
        setError('Failed to load internships.');
        setInternships([]);
      }
    } catch (error) {
      console.error('Error fetching internships:', error);
      setError('Something went wrong. Please try again.');
      setInternships([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInternships(filters);
    if (session) {
      fetchSavedInternships();
      fetchSavedFilters();
      fetchAlertPreferences();
    }
  }, [session]);

  const fetchSavedInternships = async () => {
    try {
      const response = await fetch('/api/saved');
      if (response.ok) {
        const data = await response.json();
        const savedIds = new Set(data.savedInternships.map((item: any) => item.internshipId._id));
        setSavedInternships(savedIds);
      }
    } catch (error) {
      console.error('Error fetching saved internships:', error);
    }
  };

  const handleSave = async (internshipId: string) => {
    if (!session) {
      router.push('/login');
      return;
    }

    setSaving(prev => new Set(prev).add(internshipId));

    try {
      const response = await fetch('/api/saved', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ internshipId }),
      });

      if (response.ok) {
        setSavedInternships(prev => new Set(prev).add(internshipId));
        setMessage('Internship saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        const data = await response.json();
        setMessage(data.error || 'Failed to save internship');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage('Error saving internship');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setSaving(prev => {
        const newSet = new Set(prev);
        newSet.delete(internshipId);
        return newSet;
      });
    }
  };

  // Saved Filters API
  const fetchSavedFilters = async () => {
    try {
      const res = await fetch('/api/filters');
      const data = await res.json();
      if (res.ok && data.success) {
        setSavedFilters(data.filters || []);
      }
    } catch (err) {
      console.error('Error fetching saved filters:', err);
    }
  };

  const fetchAlertPreferences = async () => {
    try {
      const res = await fetch('/api/alerts');
      const data = await res.json();
      if (res.ok && data.success) {
        const activeFilterIds = new Set(data.alerts.map((alert: any) => alert.filterId._id));
        setAlertPreferences(activeFilterIds);
      }
    } catch (err) {
      console.error('Error fetching alert preferences:', err);
    }
  };

  const saveCurrentFilters = async () => {
    if (!session) {
      router.push('/login');
      return;
    }
    try {
      const res = await fetch('/api/filters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          graduationYear: filters.graduationYear ? Number(filters.graduationYear) : undefined,
          season: filters.season || undefined,
          location: filters.location || undefined,
          industry: filters.industry || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage('Filters saved');
        setSavedFilters((prev) => [data.filter, ...prev]);
        setTimeout(() => setMessage(''), 2500);
      } else {
        setError(data.error || 'Failed to save filters');
        setTimeout(() => setError(''), 2500);
      }
    } catch (err) {
      setError('Error saving filters');
      setTimeout(() => setError(''), 2500);
    }
  };

  const applySavedFilter = (f: { graduationYear?: number; season?: string; location?: string; industry?: string; }) => {
    updateFilters({
      graduationYear: f.graduationYear ? String(f.graduationYear) : '',
      season: f.season || '',
      location: f.location || '',
      industry: f.industry || '',
    });
  };

  const deleteSavedFilter = async (id: string) => {
    try {
      const res = await fetch(`/api/filters?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        setSavedFilters((prev) => prev.filter((x) => x._id !== id));
        // Also remove from alert preferences if it exists
        setAlertPreferences((prev) => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      } else {
        setError(data.error || 'Failed to delete saved filter');
        setTimeout(() => setError(''), 2500);
      }
    } catch (err) {
      setError('Error deleting saved filter');
      setTimeout(() => setError(''), 2500);
    }
  };

  // Alert functions
  const enableAlerts = async (filterId: string) => {
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filterId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAlertPreferences((prev) => new Set(prev).add(filterId));
        setMessage('Email alerts enabled for this filter');
        setTimeout(() => setMessage(''), 2500);
      } else {
        setError(data.error || 'Failed to enable alerts');
        setTimeout(() => setError(''), 2500);
      }
    } catch (err) {
      setError('Error enabling alerts');
      setTimeout(() => setError(''), 2500);
    }
  };

  const disableAlerts = async (filterId: string) => {
    try {
      const res = await fetch(`/api/alerts?filterId=${filterId}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        setAlertPreferences((prev) => {
          const newSet = new Set(prev);
          newSet.delete(filterId);
          return newSet;
        });
        setMessage('Email alerts disabled for this filter');
        setTimeout(() => setMessage(''), 2500);
      } else {
        setError(data.error || 'Failed to disable alerts');
        setTimeout(() => setError(''), 2500);
      }
    } catch (err) {
      setError('Error disabling alerts');
      setTimeout(() => setError(''), 2500);
    }
  };

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
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
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
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
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
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
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
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
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
          className="text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors duration-200"
        >
          Reset Filters
        </button>

        <div className="mt-4">
          <button
            onClick={saveCurrentFilters}
            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
          >
            Save Current Filters
          </button>
        </div>
      </div>
    </div>
  );

  const MobileFilterButton = () => (
    <button
      onClick={() => setShowMobileFilters(!showMobileFilters)}
      className="mb-4 rounded-lg bg-blue-600 px-4 py-3 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 lg:hidden"
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
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
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
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
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
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
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
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
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
          className="mt-4 text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors duration-200"
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
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <p className="text-lg text-gray-600">Loading internships...</p>
          </div>
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
          {message && (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-md p-4">
              <p className="text-green-800">{message}</p>
            </div>
          )}
          
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Saved Filters Section (moved above cards) */}
          {session && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">My Saved Filters</h2>
              {savedFilters.length === 0 ? (
                <p className="text-sm text-gray-600">You have no saved filters yet.</p>
              ) : (
                <div className="space-y-3">
                  {savedFilters.map((f) => (
                    <div key={f._id} className="rounded border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm text-gray-700 space-x-2">
                          {f.graduationYear && <span><span className="font-medium">Year:</span> {f.graduationYear}</span>}
                          {f.season && <span><span className="font-medium">Season:</span> {f.season}</span>}
                          {f.location && <span><span className="font-medium">Location:</span> {f.location}</span>}
                          {f.industry && <span><span className="font-medium">Industry:</span> {f.industry}</span>}
                          {!f.graduationYear && !f.season && !f.location && !f.industry && (
                            <span className="italic text-gray-500">(No filters selected)</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => applySavedFilter(f)}
                            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                          >
                            Apply
                          </button>
                          <button
                            onClick={() => deleteSavedFilter(f._id)}
                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {alertPreferences.has(f._id) ? (
                            <>
                              <span className="text-green-600 text-sm">🔔 Alerts Enabled</span>
                              <button
                                onClick={() => disableAlerts(f._id)}
                                className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-700 text-sm"
                              >
                                Disable Alerts
                              </button>
                            </>
                          ) : (
                            <>
                              <span className="text-gray-500 text-sm">🔕 Alerts Disabled</span>
                              <button
                                onClick={() => enableAlerts(f._id)}
                                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm"
                              >
                                Enable Alerts
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {internships.length === 0 && !error ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No internships found</h2>
              <p className="text-lg text-gray-600">Try adjusting your filters or check back soon!</p>
            </div>
          ) : internships.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {internships.map((internship) => (
                <InternshipCard
                  key={internship._id}
                  internship={internship}
                  showSaveButton={true}
                  onSave={handleSave}
                  isSaved={savedInternships.has(internship._id)}
                />
              ))}
            </div>
          ) : null}

        </div>
      </div>
    </div>
  );
}
