import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/options';
import connectDB from '@/app/lib/mongodb';
import PushSubscription from '@/models/PushSubscription';
import { sendPushNotificationToAll } from '@/lib/push';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, body } = await request.json();

    if (!title || !body) {
      return NextResponse.json({ error: 'Title and body are required' }, { status: 400 });
    }

    // Check if VAPID keys are configured
    if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
      return NextResponse.json({ 
        error: 'Push notifications are not configured. Please set VAPID keys in environment variables.' 
      }, { status: 500 });
    }

    await connectDB();

    // Get all push subscriptions for the current user
    const subscriptions = await (PushSubscription as any).find({ userId: session.user.id });

    if (subscriptions.length === 0) {
      return NextResponse.json({ 
        error: 'No push subscriptions found. Please enable notifications first.' 
      }, { status: 404 });
    }

    // Send push notification to all subscriptions
    const payload = {
      title,
      body,
      icon: '/icon.png',
      url: '/internships',
    };

    try {
      const summary = await sendPushNotificationToAll(subscriptions, payload);
      if (summary.successes === 0) {
        return NextResponse.json({
          success: false,
          error: 'Failed to deliver to any subscription',
          details: summary,
        }, { status: 502 });
      }

      return NextResponse.json({ 
        success: true, 
        message: `Delivered to ${summary.successes}/${summary.total} device(s)` ,
        details: summary,
      });
    } catch (pushError) {
      console.error('Push notification error:', pushError);
      return NextResponse.json({ 
        error: `Failed to send push notification: ${pushError instanceof Error ? pushError.message : 'Unknown error'}` 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error sending test push notification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
