import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/app/lib/mongodb';
import AlertPreference from '@/models/AlertPreference';
import SavedFilter from '@/models/SavedFilter';
import Internship from '@/models/Internship';
import User from '@/models/User';
import { sendEmail, sendInternshipAlert } from '@/lib/mailer';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // For MVP, allow any logged-in user to trigger the check
    // In production, you might want to restrict this to admin users
    console.log(`🔍 Manual alert check triggered by ${session.user.email}`);
    
    await connectDB();
    console.log('Starting alert check...');

    const activeAlerts = await AlertPreference.find({ active: true }).populate('userId').populate('filterId');

    for (const alert of activeAlerts) {
      const user = alert.userId as any;
      const filter = alert.filterId as any;

      if (!user || !filter) {
        console.warn(`Skipping alert due to missing user or filter data for alert ID: ${alert._id}`);
        continue;
      }

      const filterCriteria: any = {};
      if (filter.graduationYear) filterCriteria.graduationYear = filter.graduationYear;
      if (filter.season) filterCriteria.season = filter.season;
      if (filter.location) filterCriteria.location = filter.location;
      if (filter.industry) filterCriteria.industry = filter.industry;

      // Find internships created in the last 24 hours that match the filter criteria
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const newInternships = await Internship.find({
        ...filterCriteria,
        createdAt: { $gte: twentyFourHoursAgo },
      });

      if (newInternships.length > 0) {
        console.log(`Found ${newInternships.length} new internships for user ${user.email} with filter ${filter._id}`);
        
        // Create filter description for email
        const filterDescription = Object.entries(filterCriteria)
          .filter(([, value]) => value)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ') || 'All Internships';
        
        // Format internships for email
        const formattedInternships = newInternships.map(internship => ({
          title: internship.title,
          company: internship.company,
          location: internship.location,
          industry: internship.industry,
          applyLink: internship.applyLink
        }));
        
        await sendInternshipAlert(
          user.email,
          user.name || 'User',
          filterDescription,
          formattedInternships
        );
      } else {
        console.log(`No new internships found for user ${user.email} with filter ${filter._id}`);
      }
    }

    console.log('Alert check finished.');
    return NextResponse.json({ 
      success: true, 
      message: 'Alert check completed successfully' 
    });
  } catch (error) {
    console.error('Error in manual alert check:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to run alert check' 
    }, { status: 500 });
  }
}
