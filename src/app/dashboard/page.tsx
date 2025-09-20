'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ApplicationTrackerCard from '@/app/components/ApplicationTrackerCard';

interface SavedInternship {
  _id: string;
  internshipId: {
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
  };
  savedAt: string;
}

interface Application {
  _id: string;
  internshipId: {
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
  };
  status: 'Saved' | 'Applied' | 'Interviewing' | 'Offer' | 'Rejected';
  notes?: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [savedInternships, setSavedInternships] = useState<SavedInternship[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (status === 'loading') return; // Still loading
    if (!session) router.push('/login'); // Not authenticated
  }, [session, status, router]);

  useEffect(() => {
    if (session) {
      fetchSavedInternships();
      fetchApplications();
    }
  }, [session]);

  const fetchSavedInternships = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/saved');
      if (response.ok) {
        const data = await response.json();
        setSavedInternships(data.savedInternships);
      } else {
        setError('Failed to fetch saved internships');
      }
    } catch (err) {
      setError('Error fetching saved internships');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/applications');
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications);
      } else {
        console.error('Failed to fetch applications');
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
    }
  };

  const handleUpdateApplication = async (internshipId: string, status: string, notes: string) => {
    setUpdating(prev => new Set(prev).add(internshipId));
    
    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ internshipId, status, notes }),
      });
      
      if (response.ok) {
        const data = await response.json();
        // Update applications state
        setApplications(prev => {
          const existing = prev.find(app => app.internshipId._id === internshipId);
          if (existing) {
            return prev.map(app => 
              app.internshipId._id === internshipId 
                ? { ...app, status: status as any, notes, updatedAt: new Date().toISOString() }
                : app
            );
          } else {
            return [...prev, data.application];
          }
        });
      } else {
        setError('Failed to update application');
      }
    } catch (err) {
      setError('Error updating application');
    } finally {
      setUpdating(prev => {
        const newSet = new Set(prev);
        newSet.delete(internshipId);
        return newSet;
      });
    }
  };

  const handleRemove = async (internshipId: string) => {
    try {
      // Remove from saved internships
      const savedResponse = await fetch(`/api/saved?internshipId=${internshipId}`, {
        method: 'DELETE',
      });
      
      // Remove from applications
      const appResponse = await fetch(`/api/applications?internshipId=${internshipId}`, {
        method: 'DELETE',
      });
      
      if (savedResponse.ok) {
        setSavedInternships(prev => 
          prev.filter(item => item.internshipId._id !== internshipId)
        );
        setApplications(prev => 
          prev.filter(app => app.internshipId._id !== internshipId)
        );
      } else {
        setError('Failed to remove internship');
      }
    } catch (err) {
      setError('Error removing internship');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto py-12 px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {session.user?.name}!
          </h1>
          <p className="text-gray-600">
            Track your internship applications and manage your saved opportunities.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-lg text-gray-600">Loading your applications...</div>
          </div>
        ) : savedInternships.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No saved internships yet</h2>
            <p className="text-gray-600 mb-6">
              Start exploring internships and save the ones you're interested in!
            </p>
            <a
              href="/internships"
              className="inline-flex items-center justify-center rounded bg-blue-600 px-6 py-3 text-white font-medium transition-colors hover:bg-blue-700"
            >
              Browse Internships
            </a>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Application Tracker ({savedInternships.length} internships)
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Track your application status and add notes for each internship.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
              {savedInternships.map((savedInternship) => {
                const application = applications.find(app => app.internshipId._id === savedInternship.internshipId._id);
                return (
                  <ApplicationTrackerCard
                    key={savedInternship._id}
                    internship={savedInternship.internshipId}
                    application={application}
                    onUpdateApplication={handleUpdateApplication}
                    onRemove={handleRemove}
                    isUpdating={updating.has(savedInternship.internshipId._id)}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
