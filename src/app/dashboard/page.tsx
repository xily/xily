'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ApplicationTrackerCard from '@/app/components/ApplicationTrackerCard';
import StatusBadge from '@/app/components/StatusBadge';

// Convert VAPID key from base64 to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

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

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [savedInternships, setSavedInternships] = useState<SavedInternship[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState<Set<string>>(new Set());
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);

  useEffect(() => {
    if (status === 'loading') return; // Still loading
    if (!session) router.push('/login'); // Not authenticated
  }, [session, status, router]);

  useEffect(() => {
    if (session) {
      fetchSavedInternships();
      fetchApplications();
      checkNotificationPermission();
      checkSubscriptionStatus();
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

  const checkNotificationPermission = () => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  };

  const checkSubscriptionStatus = async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      } catch (error) {
        console.error('Error checking subscription status:', error);
      }
    }
  };

  const enableNotifications = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setError('Push notifications are not supported in this browser');
      return;
    }

    setSubscriptionLoading(true);
    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission !== 'granted') {
        setError('Notification permission denied');
        return;
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // Get VAPID public key
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        setError('VAPID public key not configured. Please check your environment variables.');
        return;
      }

      // Convert VAPID key to Uint8Array
      const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey,
      });

      // Send subscription to server
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      });

      if (response.ok) {
        setIsSubscribed(true);
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to enable notifications');
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      setError(`Failed to enable notifications: ${error.message || error}`);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const disableNotifications = async () => {
    setSubscriptionLoading(true);
    try {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        
        if (subscription) {
          // Unsubscribe from push notifications
          await subscription.unsubscribe();
          
          // Remove subscription from server
          const response = await fetch('/api/push/subscribe', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ endpoint: subscription.endpoint }),
          });

          if (response.ok) {
            setIsSubscribed(false);
            setError('');
          } else {
            const errorData = await response.json();
            setError(errorData.error || 'Failed to disable notifications');
          }
        }
      }
    } catch (error) {
      console.error('Error disabling notifications:', error);
      setError('Failed to disable notifications');
    } finally {
      setSubscriptionLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {session.user?.name}!
              </h1>
              <p className="text-gray-600">
                Track your internship applications and manage your saved opportunities.
              </p>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <div className="text-sm text-gray-500">
                {notificationPermission === 'granted' && isSubscribed ? (
                  <span className="text-green-600">🔔 Notifications enabled</span>
                ) : notificationPermission === 'denied' ? (
                  <span className="text-red-600">🔕 Notifications blocked</span>
                ) : (
                  <span className="text-gray-500">🔔 Notifications disabled</span>
                )}
                <div className="text-xs text-gray-400 mt-1">
                  Permission: {notificationPermission}
                </div>
              </div>
              <div className="flex space-x-2">
                {!isSubscribed ? (
                  <button
                    onClick={enableNotifications}
                    disabled={subscriptionLoading || notificationPermission === 'denied'}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                  >
                    {subscriptionLoading ? 'Enabling...' : 'Enable Notifications'}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={disableNotifications}
                      disabled={subscriptionLoading}
                      className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                    >
                      {subscriptionLoading ? 'Disabling...' : 'Disable Notifications'}
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const response = await fetch('/api/push/test', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              title: 'Test Notification',
                              body: 'This is a test push notification from Internly!'
                            })
                          });
                          if (response.ok) {
                            setError('');
                          } else {
                            const errorData = await response.json();
                            setError(errorData.error || 'Failed to send test notification');
                          }
                        } catch (error) {
                          setError('Failed to send test notification');
                        }
                      }}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
                    >
                      Test Notification
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
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

        {/* Application Timeline Section */}
        {applications.length > 0 && (
          <div className="mt-16">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
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
                      <div className="relative z-10 flex-shrink-0 w-12 h-12 bg-white rounded-full border-4 border-blue-600 flex items-center justify-center">
                        <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
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
                                className="text-blue-600 hover:text-blue-800 font-medium"
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
        {applications.length === 0 && savedInternships.length > 0 && (
          <div className="mt-16 text-center py-12">
            <div className="text-6xl mb-4">📅</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No applications yet</h2>
            <p className="text-gray-600 mb-6">
              Start applying to internships to see your timeline here!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
