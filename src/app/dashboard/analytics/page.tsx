'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import AnalyticsCard from '@/app/components/AnalyticsCard';
import ChartContainer from '@/app/components/ChartContainer';
import StatusBadge from '@/app/components/StatusBadge';

interface AnalyticsData {
  totalApplications: number;
  statusCounts: Record<string, number>;
  statusData: Array<{ name: string; value: number; color: string }>;
  applicationsOverTime: Array<{ month: string; count: number }>;
  industryData: Array<{ industry: string; count: number }>;
  recentApplications: Array<{
    id: string;
    title: string;
    company: string;
    status: string;
    createdAt: string;
  }>;
}

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) router.push('/login');
  }, [session, status, router]);

  useEffect(() => {
    if (session) {
      fetchAnalytics();
    }
  }, [session]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analytics');
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else {
        setError('Failed to fetch analytics data');
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Error fetching analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
          <div className="text-lg text-gray-600">Loading analytics...</div>
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Analytics</h1>
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

  if (!analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">No Analytics Data</h1>
          <p className="text-gray-600 mb-6">Unable to load your application analytics.</p>
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

  const hasApplications = analytics.totalApplications > 0;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto py-12 px-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-purple-600 hover:text-purple-600-dark mb-4 flex items-center"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Application Analytics
          </h1>
          <p className="text-gray-600">
            Track your internship application progress and insights.
          </p>
        </div>

        {/* Dashboard Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <a
              href="/dashboard"
              className="text-gray-700 hover:text-purple-600 pb-2 text-sm font-medium transition-colors"
            >
              Overview
            </a>
            <a
              href="/dashboard/analytics"
              className="text-purple-600 border-b-2 border-purple-600 pb-2 text-sm font-medium"
            >
              Analytics
            </a>
          </nav>
        </div>

        {!hasApplications ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Applications Yet</h2>
            <p className="text-gray-600 mb-6">
              Start applying to internships to see your analytics here!
            </p>
            <button
              onClick={() => router.push('/internships')}
              className="bg-purple-600 text-white px-6 py-3 rounded hover:bg-purple-600-dark transition-colors"
            >
              Browse Internships
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white border rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-purple-600">{analytics.totalApplications}</div>
                <div className="text-sm text-gray-600">Total Applications</div>
              </div>
              <div className="bg-white border rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-green-600">{analytics.statusCounts['Applied'] || 0}</div>
                <div className="text-sm text-gray-600">Applied</div>
              </div>
              <div className="bg-white border rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-yellow-600">{analytics.statusCounts['Interviewing'] || 0}</div>
                <div className="text-sm text-gray-600">Interviewing</div>
              </div>
              <div className="bg-white border rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-purple-600">{analytics.statusCounts['Offer'] || 0}</div>
                <div className="text-sm text-gray-600">Offers</div>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Applications by Status - Pie Chart */}
              <AnalyticsCard title="Applications by Status">
                <ChartContainer>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {analytics.statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </AnalyticsCard>

              {/* Applications per Industry - Bar Chart */}
              <AnalyticsCard title="Applications per Industry">
                <ChartContainer>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.industryData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="industry" 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        fontSize={12}
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#7C3AED" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </AnalyticsCard>
            </div>

            {/* Applications Over Time - Line Chart */}
            <AnalyticsCard title="Applications Over Time">
              <ChartContainer>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.applicationsOverTime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#7C3AED" 
                      strokeWidth={2}
                      dot={{ fill: '#7C3AED', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </AnalyticsCard>

            {/* Recent Applications */}
            <AnalyticsCard title="Recent Applications">
              <div className="space-y-3">
                {analytics.recentApplications.map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{app.title}</h4>
                      <p className="text-sm text-gray-600">{app.company}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={app.status as any} size="sm" />
                      <span className="text-xs text-gray-500">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </AnalyticsCard>
          </div>
        )}
      </div>
    </div>
  );
}
