'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import RecruiterInternshipCard from '@/app/components/RecruiterInternshipCard';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { IndustryType } from '@/models/Internship';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface RecruiterProfile {
  _id: string;
  companyName: string;
  website: string;
  createdAt: string;
}

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
  featured: boolean;
  createdAt: string;
}

export default function RecruiterPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [recruiter, setRecruiter] = useState<RecruiterProfile | null>(null);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [recruiterFormData, setRecruiterFormData] = useState({
    companyName: '',
    website: ''
  });
  
  const [internshipFormData, setInternshipFormData] = useState({
    title: '',
    company: '',
    location: '',
    industry: 'Tech',
    graduationYear: '',
    season: '',
    deadline: '',
    applyLink: '',
    featured: false
  });

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) router.push('/auth');
  }, [session, status, router]);

  useEffect(() => {
    if (session) {
      fetchRecruiterProfile();
      fetchInternships();
    }
  }, [session]);

  const fetchRecruiterProfile = async () => {
    try {
      const response = await fetch('/api/recruiters');
      if (response.ok) {
        const data = await response.json();
        setRecruiter(data);
      } else if (response.status === 404) {
        // No recruiter profile yet
        setRecruiter(null);
      } else {
        setError('Failed to fetch recruiter profile');
      }
    } catch (err) {
      console.error('Error fetching recruiter profile:', err);
      setError('Error fetching recruiter profile');
    }
  };

  const fetchInternships = async () => {
    try {
      const response = await fetch('/api/recruiter-internships');
      if (response.ok) {
        const data = await response.json();
        setInternships(data);
      } else {
        console.error('Failed to fetch internships');
      }
    } catch (err) {
      console.error('Error fetching internships:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const { companyName, website } = recruiterFormData;
    
    if (!companyName || !website) {
      toast.error('Please fill in all required fields');
      return;
    }

    setCreating(true);
    try {
      const response = await fetch('/api/recruiters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName, website })
      });

      if (response.ok) {
        const data = await response.json();
        setRecruiter(data);
        toast.success('Recruiter profile created successfully!');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to create profile');
      }
    } catch (err) {
      console.error('Error creating profile:', err);
      toast.error('Error creating profile');
    } finally {
      setCreating(false);
    }
  };

  const handleCreateInternship = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!internshipFormData.title || !internshipFormData.company || !internshipFormData.industry) {
      toast.error('Please fill in all required fields');
      return;
    }

    setCreating(true);
    try {
      const response = await fetch('/api/recruiter-internships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(internshipFormData)
      });

      if (response.ok) {
        const newInternship = await response.json();
        setInternships(prev => [newInternship, ...prev]);
        setInternshipFormData({
          title: '',
          company: '',
          location: '',
          industry: 'Tech',
          graduationYear: '',
          season: '',
          deadline: '',
          applyLink: '',
          featured: false
        });
        setShowCreateForm(false);
        toast.success('Internship created successfully!');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to create internship');
      }
    } catch (err) {
      console.error('Error creating internship:', err);
      toast.error('Error creating internship');
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateInternship = async (internshipId: string, updates: any) => {
    try {
      const response = await fetch('/api/recruiter-internships', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ internshipId, ...updates })
      });

      if (response.ok) {
        const updatedInternship = await response.json();
        setInternships(prev => prev.map(internship => 
          internship._id === internshipId ? updatedInternship : internship
        ));
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to update internship');
        throw new Error('Update failed');
      }
    } catch (err) {
      console.error('Error updating internship:', err);
      throw err;
    }
  };

  const handleDeleteInternship = async (internshipId: string) => {
    try {
      const response = await fetch(`/api/recruiter-internships?id=${internshipId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setInternships(prev => prev.filter(internship => internship._id !== internshipId));
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to delete internship');
        throw new Error('Delete failed');
      }
    } catch (err) {
      console.error('Error deleting internship:', err);
      throw err;
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-2">
          <LoadingSpinner size="md" />
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect to login
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-600-dark transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto py-12 px-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-purple-600 hover:text-purple-600-dark mb-4 flex items-center"
          >
            ← Back
          </button>
          <div className="flex items-center mb-2">
            <Image src="/logo.png" alt="Internly logo" width={32} height={32} className="mr-2" />
            <h1 className="text-3xl font-bold text-gray-900">Recruiter Dashboard</h1>
          </div>
          <p className="text-gray-600">
            Manage your company's internship listings and feature roles.
          </p>
        </div>

        {!recruiter ? (
          /* Create Recruiter Profile */
          <div className="border p-4 rounded-lg mb-6 bg-white">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Create Recruiter Profile</h2>
            <form onSubmit={handleCreateProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    value={recruiterFormData.companyName}
                    onChange={(e) => setRecruiterFormData(prev => ({ ...prev, companyName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                    Website *
                  </label>
                  <input
                    type="url"
                    id="website"
                    value={recruiterFormData.website}
                    onChange={(e) => setRecruiterFormData(prev => ({ ...prev, website: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={creating}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-600-dark disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {creating ? 'Creating...' : 'Create Profile'}
              </button>
            </form>
          </div>
        ) : (
          <>
            {/* Recruiter Profile */}
            <div className="border p-4 rounded-lg mb-6 bg-white">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Company Profile</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Company Name</span>
                  <p className="text-lg text-gray-900">{recruiter.companyName}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Website</span>
                  <p className="text-lg text-gray-900">
                    <a href={recruiter.website} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-600-dark">
                      {recruiter.website}
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Internships Section */}
            <div className="border p-4 rounded-lg mb-6 bg-white">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Internship Listings</h2>
                <button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-600-dark transition-colors"
                >
                  {showCreateForm ? 'Cancel' : 'Add New Internship'}
                </button>
              </div>

              {/* Create Internship Form */}
              {showCreateForm && (
                <form onSubmit={handleCreateInternship} className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-md font-semibold text-gray-900 mb-4">Create New Internship</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                        Title *
                      </label>
                      <input
                        type="text"
                        id="title"
                        value={internshipFormData.title}
                        onChange={(e) => setInternshipFormData(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                        Company *
                      </label>
                      <input
                        type="text"
                        id="company"
                        value={internshipFormData.company}
                        onChange={(e) => setInternshipFormData(prev => ({ ...prev, company: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        id="location"
                        value={internshipFormData.location}
                        onChange={(e) => setInternshipFormData(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
                        Industry *
                      </label>
                      <select
                        id="industry"
                        value={internshipFormData.industry}
                        onChange={(e) => setInternshipFormData(prev => ({ ...prev, industry: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
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
                      <label htmlFor="graduationYear" className="block text-sm font-medium text-gray-700 mb-2">
                        Graduation Year
                      </label>
                      <input
                        type="number"
                        id="graduationYear"
                        value={internshipFormData.graduationYear}
                        onChange={(e) => setInternshipFormData(prev => ({ ...prev, graduationYear: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor="season" className="block text-sm font-medium text-gray-700 mb-2">
                        Season
                      </label>
                      <input
                        type="text"
                        id="season"
                        value={internshipFormData.season}
                        onChange={(e) => setInternshipFormData(prev => ({ ...prev, season: e.target.value }))}
                        placeholder="e.g., Summer 2024"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-2">
                        Deadline
                      </label>
                      <input
                        type="date"
                        id="deadline"
                        value={internshipFormData.deadline}
                        onChange={(e) => setInternshipFormData(prev => ({ ...prev, deadline: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor="applyLink" className="block text-sm font-medium text-gray-700 mb-2">
                        Application Link
                      </label>
                      <input
                        type="url"
                        id="applyLink"
                        value={internshipFormData.applyLink}
                        onChange={(e) => setInternshipFormData(prev => ({ ...prev, applyLink: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={internshipFormData.featured}
                      onChange={(e) => setInternshipFormData(prev => ({ ...prev, featured: e.target.checked }))}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-600 border-gray-300 rounded"
                    />
                    <label htmlFor="featured" className="text-sm font-medium text-gray-700">
                      Feature this internship (show at top of listings)
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={creating}
                      className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-600-dark disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {creating ? 'Creating...' : 'Create Internship'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Internships List */}
              {internships.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">📝</div>
                  <p className="text-gray-500">No internships posted yet. Create your first one!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {internships.map((internship) => (
                    <RecruiterInternshipCard
                      key={internship._id}
                      internship={internship}
                      onUpdate={handleUpdateInternship}
                      onDelete={handleDeleteInternship}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
