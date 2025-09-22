import mongoose from 'mongoose';
import connectDB from '../src/app/lib/mongodb';
import AlertPreference from '../src/models/AlertPreference';
import SavedFilter from '../src/models/SavedFilter';
import Internship from '../src/models/Internship';
import User from '../src/models/User';
import { sendInternshipAlert } from '../src/lib/mailer';

interface InternshipDoc {
  _id: string;
  title: string;
  company: string;
  location?: string;
  industry?: string;
  applyLink?: string;
  createdAt: Date;
}

interface FilterDoc {
  _id: string;
  graduationYear?: number;
  season?: string;
  location?: string;
  industry?: string;
}

interface UserDoc {
  _id: string;
  name: string;
  email: string;
}

async function checkAlerts() {
  try {
    console.log('🔍 Starting alert check...');
    
    // Connect to database
    await connectDB();
    console.log('✅ Connected to database');

    // Get all active alert preferences with populated filter and user data
    const alerts = await AlertPreference.find({ active: true })
      .populate('filterId')
      .populate('userId')
      .lean();

    console.log(`📧 Found ${alerts.length} active alert preferences`);

    for (const alert of alerts) {
      const filter = alert.filterId as FilterDoc;
      const user = alert.userId as UserDoc;

      if (!filter || !user) {
        console.log(`⚠️ Skipping alert ${alert._id} - missing filter or user data`);
        continue;
      }

      console.log(`🔍 Checking alerts for user ${user.email} with filter ${filter._id}`);

      // Build query based on filter criteria
      const query: any = {};
      
      if (filter.graduationYear) {
        query.graduationYear = filter.graduationYear;
      }
      if (filter.season) {
        query.season = filter.season;
      }
      if (filter.location) {
        query.location = filter.location;
      }
      if (filter.industry) {
        query.industry = filter.industry;
      }

      // Find internships created in the last 24 hours that match the filter
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      query.createdAt = { $gte: yesterday };

      const matchingInternships = await Internship.find(query).lean() as InternshipDoc[];

      console.log(`📊 Found ${matchingInternships.length} new internships matching filter`);

      if (matchingInternships.length > 0) {
        // Create filter name for email
        const filterParts = [];
        if (filter.graduationYear) filterParts.push(`Year: ${filter.graduationYear}`);
        if (filter.season) filterParts.push(`Season: ${filter.season}`);
        if (filter.location) filterParts.push(`Location: ${filter.location}`);
        if (filter.industry) filterParts.push(`Industry: ${filter.industry}`);
        const filterName = filterParts.length > 0 ? filterParts.join(', ') : 'All internships';

        // Send email alert
        const success = await sendInternshipAlert(
          user.email,
          user.name,
          filterName,
          matchingInternships.map(internship => ({
            title: internship.title,
            company: internship.company,
            location: internship.location,
            industry: internship.industry,
            applyLink: internship.applyLink,
          }))
        );

        if (success) {
          console.log(`✅ Email sent to ${user.email} for ${matchingInternships.length} internships`);
        } else {
          console.log(`❌ Failed to send email to ${user.email}`);
        }
      } else {
        console.log(`ℹ️ No new internships found for ${user.email}`);
      }
    }

    console.log('✅ Alert check completed');
  } catch (error) {
    console.error('❌ Error in alert check:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the script
if (require.main === module) {
  checkAlerts()
    .then(() => {
      console.log('🎉 Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

export default checkAlerts;
