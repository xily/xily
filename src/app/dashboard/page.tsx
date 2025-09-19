'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Still loading
    if (!session) router.push('/login'); // Not authenticated
  }, [session, status, router]);

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome to your Dashboard, {session.user?.name}!
            </h1>
            <p className="text-gray-600 mb-4">
              Email: {session.user?.email}
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-blue-800">
                🎉 Authentication is working! You are successfully logged in.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
