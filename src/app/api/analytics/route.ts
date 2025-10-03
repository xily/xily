import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/options';
import connectDB from '@/app/lib/mongodb';
import Application from '@/models/Application';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await connectDB();
    
    // Get all applications for the user
    const applications = await Application.find({ userId: session.user.id })
      .populate('internshipId', 'industry')
      .sort({ createdAt: -1 });
    
    // Calculate total applications
    const totalApplications = applications.length;
    
    // Applications by status
    const statusCounts = applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Applications over time (grouped by month)
    const applicationsOverTime = applications.reduce((acc, app) => {
      const date = new Date(app.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      
      if (!acc[monthKey]) {
        acc[monthKey] = { month: monthName, count: 0 };
      }
      acc[monthKey].count += 1;
      return acc;
    }, {} as Record<string, { month: string; count: number }>);
    
    // Convert to array and sort by month
    const applicationsOverTimeArray = Object.values(applicationsOverTime)
      .sort((a, b) => {
        const aDate = new Date(a.month + ' 1');
        const bDate = new Date(b.month + ' 1');
        return aDate.getTime() - bDate.getTime();
      });
    
    // Most applied industries
    const industryCounts = applications.reduce((acc, app) => {
      const industry = app.internshipId.industry || 'Other';
      acc[industry] = (acc[industry] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Convert to array and sort by count
    const industryArray = Object.entries(industryCounts)
      .map(([industry, count]) => ({ industry, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 industries
    
    // Status distribution for pie chart
    const statusData = [
      { name: 'Saved', value: statusCounts['Saved'] || 0, color: '#7C3AED' },
      { name: 'Applied', value: statusCounts['Applied'] || 0, color: '#10B981' },
      { name: 'Interviewing', value: statusCounts['Interviewing'] || 0, color: '#F59E0B' },
      { name: 'Offer', value: statusCounts['Offer'] || 0, color: '#8B5CF6' },
      { name: 'Rejected', value: statusCounts['Rejected'] || 0, color: '#EF4444' }
    ];
    
    const analytics = {
      totalApplications,
      statusCounts,
      statusData,
      applicationsOverTime: applicationsOverTimeArray,
      industryData: industryArray,
      recentApplications: applications.slice(0, 5).map(app => ({
        id: app._id,
        title: app.internshipId.title,
        company: app.internshipId.company,
        status: app.status,
        createdAt: app.createdAt
      }))
    };
    
    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
