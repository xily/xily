'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import ApplicationTrackerCard from '@/app/components/ApplicationTrackerCard';
import StatusBadge from '@/app/components/StatusBadge';
import ResumeCard from '@/app/components/ResumeCard';
import toast from 'react-hot-toast';


// Format date for timeline display
function formatTimelineDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });
  } catch {
    return 'Invalid Date';
  }
}

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

interface Resume {
  _id: string;
  title: string;
  resumeUrl: string;
  createdAt: string;
  commentCount: number;
  userId: {
    _id: string;
    name: string;
    email: string;
  } | null;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [savedInternships, setSavedInternships] = useState<SavedInternship[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [userResume, setUserResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState<Set<string>>(new Set());
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeTitle, setResumeTitle] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  useEffect(() => {
    if (status === 'loading') return; // Still loading
    if (!session) router.push('/auth'); // Not authenticated
  }, [session, status, router]);

  useEffect(() => {
    if (session) {
      fetchSavedInternships();
      fetchApplications();
      fetchResumes();
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

  const fetchResumes = async () => {
    try {
      const response = await fetch('/api/resumes');
      if (response.ok) {
        const data = await response.json();
        setResumes(data);
        
        // Find user's resume
        const userResumeData = data.find((resume: Resume) => resume.userId && resume.userId._id === session?.user?.id);
        setUserResume(userResumeData || null);
        
        // Pre-fill form if user has existing resume
        if (userResumeData) {
          setResumeTitle(userResumeData.title);
        }
      } else {
        console.error('Failed to fetch resumes');
      }
    } catch (err) {
      console.error('Error fetching resumes:', err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Please upload a PDF file only');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size must be less than 5MB');
        return;
      }
      setResumeFile(file);
    }
  };

  const handleUploadResume = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resumeFile || !resumeTitle.trim()) {
      toast.error('Please provide both a file and title');
      return;
    }

    setUploadingResume(true);
    
    try {
      // For MVP, we'll create a simple file URL
      // In production, you'd upload to Cloudinary/S3
      const resumeUrl = URL.createObjectURL(resumeFile);
      
      const response = await fetch('/api/resumes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeUrl,
          title: resumeTitle.trim()
        }),
      });

      if (response.ok) {
        const resumeData = await response.json();
        
        if (userResume) {
          // Update existing resume
          setResumes(prev => prev.map(resume => 
            resume._id === resumeData._id ? resumeData : resume
          ));
          setUserResume(resumeData);
          toast.success('Resume updated successfully!');
        } else {
          // Add new resume
          setResumes(prev => [resumeData, ...prev]);
          setUserResume(resumeData);
          toast.success('Resume uploaded successfully!');
        }
        
        setResumeTitle('');
        setResumeFile(null);
        // Reset file input
        const fileInput = document.getElementById('resume-file') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to upload resume');
      }
    } catch (err) {
      console.error('Error uploading resume:', err);
      toast.error('Error uploading resume');
    } finally {
      setUploadingResume(false);
    }
  };

  const handleDeleteResume = async (resumeId: string) => {
    if (!confirm('Are you sure you want to delete this resume? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/resumes?id=${resumeId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setResumes(prev => prev.filter(resume => resume._id !== resumeId));
        setUserResume(null);
        setResumeTitle('');
        toast.success('Resume deleted successfully');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete resume');
      }
    } catch (err) {
      console.error('Error deleting resume:', err);
      toast.error('Error deleting resume');
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
        toast.success('Application updated successfully');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to update application');
      }
    } catch (err) {
      console.error('Error updating application:', err);
      toast.error('Error updating application');
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
        toast.success('Internship removed successfully');
      } else {
        const data = await savedResponse.json();
        toast.error(data.error || 'Failed to remove internship');
      }
    } catch (err) {
      console.error('Error removing internship:', err);
      toast.error('Error removing internship');
    }
  };


  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purpleBrand-accent"></div>
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
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
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center mb-2">
                <Image src="/logo.png" alt="Internly logo" width={32} height={32} className="mr-2" />
                <h1 className="text-3xl font-bold text-gray-900">Internly Dashboard</h1>
              </div>
              <p className="text-gray-600">
                Welcome back, {session.user?.name}!
              </p>
            </div>
          </div>
        </div>

        {/* Dashboard Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <a
              href="/dashboard"
              className="text-gray-900 border-b-2 border-purpleBrand-accent pb-2 text-sm font-medium"
            >
              Overview
            </a>
            <a
              href="/dashboard/analytics"
              className="text-gray-700 hover:text-purpleBrand-accent pb-2 text-sm font-medium transition-colors"
            >
              Analytics
            </a>
          </nav>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purpleBrand-accent"></div>
              <div className="text-lg text-gray-600">Loading your applications...</div>
            </div>
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
              className="inline-flex items-center justify-center rounded bg-purpleBrand px-6 py-3 text-black font-medium transition-colors hover:bg-purpleBrand-dark"
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

        {/* Application Timeline Section */}
        {applications.length > 0 && (
          <div className="mt-16">
            <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Application Timeline
              </h2>
              <p className="text-gray-600">
                Your application history in chronological order.
              </p>
            </div>
            
            <div className="max-w-3xl mx-auto">
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                
                {/* Timeline entries */}
                <div className="space-y-8">
                  {applications.map((application, index) => (
                    <div key={application._id} className="relative flex items-start">
                      {/* Timeline dot */}
                      <div className="relative z-10 flex-shrink-0 w-12 h-12 bg-white rounded-full border-4 border-purpleBrand-accent flex items-center justify-center">
                        <div className="w-3 h-3 bg-purpleBrand-accent rounded-full"></div>
                      </div>
                      
                      {/* Timeline content */}
                      <div className="ml-6 flex-1">
                        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-bold text-gray-900 text-lg mb-1">
                                {application.internshipId.title}
                              </h3>
                              <p className="text-gray-700 font-medium">
                                {application.internshipId.company}
                              </p>
                              {application.internshipId.location && (
                                <p className="text-sm text-gray-600 mt-1">
                                  📍 {application.internshipId.location}
                                </p>
                              )}
                            </div>
                            <div className="flex flex-col items-end space-y-2">
                              <StatusBadge status={application.status} size="sm" />
                              <span className="text-xs text-gray-500">
                                {formatTimelineDate(application.updatedAt)}
                              </span>
                            </div>
                          </div>
                          
                          {application.notes && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-md">
                              <p className="text-sm text-gray-700">
                                <span className="font-medium">Notes:</span> {application.notes}
                              </p>
                            </div>
                          )}
                          
                          <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                            <span>Updated {formatTimelineDate(application.updatedAt)}</span>
                            {application.internshipId.applyLink && (
                              <a
                                href={application.internshipId.applyLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purpleBrand-accent hover:opacity-80 font-medium"
                              >
                                View Application →
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No applications message for timeline */}
        {applications.length === 0 && (
          <div className="mt-16 text-center py-12">
            <div className="text-6xl mb-4">📅</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No applications yet</h2>
            <p className="text-gray-600 mb-6">
              {savedInternships.length > 0 
                ? "Start applying to internships to see your timeline here!"
                : "Save some internships and start applying to see your timeline here!"
              }
            </p>
            {savedInternships.length > 0 && (
              <p className="text-sm text-gray-500">
                You have {savedInternships.length} saved internship(s). Click on them to change their status to "Applied" and they'll appear in your timeline.
              </p>
            )}
          </div>
        )}

        {/* Resume Review Section */}
        <div className="mt-16">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Resume Review
            </h2>
            <p className="text-gray-600">
              Upload your resume and get feedback from peers, or review others' resumes.
            </p>
          </div>

          {/* Upload Resume Form */}
          <div className="border p-4 rounded-lg mb-6 bg-white">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {userResume ? 'Update Your Resume' : 'Upload Resume'}
            </h3>
            <form onSubmit={handleUploadResume} className="space-y-4">
              <div>
                <label htmlFor="resume-title" className="block text-sm font-medium text-gray-700 mb-2">
                  Resume Title
                </label>
                <input
                  type="text"
                  id="resume-title"
                  value={resumeTitle}
                  onChange={(e) => setResumeTitle(e.target.value)}
                  placeholder="e.g., Software Intern Resume"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purpleBrand-accent focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="resume-file" className="block text-sm font-medium text-gray-700 mb-2">
                  PDF File
                </label>
                <input
                  type="file"
                  id="resume-file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purpleBrand-accent focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">PDF files only, max 10MB</p>
              </div>
              
              <button
                type="submit"
                disabled={uploadingResume || !resumeFile || !resumeTitle.trim()}
                className="bg-purpleBrand text-black px-4 py-2 rounded hover:bg-purpleBrand-dark disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {uploadingResume ? (userResume ? 'Updating...' : 'Uploading...') : (userResume ? 'Update Resume' : 'Upload Resume')}
              </button>
            </form>
          </div>

          {/* User's Current Resume */}
          {userResume && (
            <div className="border p-4 rounded-lg mb-6 bg-purpleBrand-light">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Current Resume</h3>
              <ResumeCard
                resume={userResume}
                currentUserId={session?.user?.id}
                onDelete={handleDeleteResume}
              />
            </div>
          )}

          {/* Other Resumes List */}
          {resumes.filter(resume => resume.userId && resume.userId._id !== session?.user?.id).length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No resumes uploaded yet</h3>
              <p className="text-gray-600">Be the first to upload a resume and start getting feedback!</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Other Resumes ({resumes.filter(resume => resume.userId && resume.userId._id !== session?.user?.id).length})
              </h3>
              {resumes.filter(resume => resume.userId && resume.userId._id !== session?.user?.id).map((resume) => (
                <ResumeCard
                  key={resume._id}
                  resume={resume}
                  currentUserId={session?.user?.id}
                  onDelete={handleDeleteResume}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
