import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import Internship, { INDUSTRY_OPTIONS, IndustryType } from '@/models/Internship';
import PushSubscription from '@/models/PushSubscription';
import { sendPushNotificationToAll } from '@/lib/push';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const searchParams = request.nextUrl.searchParams;
    const filter: any = {};
    
    // Filter by graduationYear
    if (searchParams.get('graduationYear')) {
      filter.graduationYear = parseInt(searchParams.get('graduationYear')!);
    }
    
    // Filter by season (case-insensitive)
    if (searchParams.get('season')) {
      filter.season = { $regex: searchParams.get('season'), $options: 'i' };
    }
    
    // Filter by location (case-insensitive)
    if (searchParams.get('location')) {
      filter.location = { $regex: searchParams.get('location'), $options: 'i' };
    }
    
    // Filter by industry (exact match)
    if (searchParams.get('industry')) {
      const industry = searchParams.get('industry') as IndustryType;
      if (INDUSTRY_OPTIONS.includes(industry)) {
        filter.industry = industry;
      }
    }
    
    const internships = await Internship.find(filter).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: internships });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    
    // Validate industry if provided
    if (body.industry && !INDUSTRY_OPTIONS.includes(body.industry)) {
      body.industry = 'Other'; // Fallback to 'Other' for invalid industries
    }
    
    const created = await Internship.create(body);
    
    // Send push notification to all subscribed users
    try {
      const subscriptions = await PushSubscription.find({});
      if (subscriptions.length > 0) {
        const payload = {
          title: 'New Internship Posted!',
          body: `${created.company} - ${created.title}`,
          icon: '/icon.png',
          url: `/internships/${created._id}`,
        };
        
        await sendPushNotificationToAll(subscriptions, payload);
      }
    } catch (pushError) {
      console.error('Error sending push notification:', pushError);
      // Don't fail the internship creation if push notification fails
    }
    
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Server error' }, { status: 500 });
  }
}


