import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
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

    await connectDB();

    // Get all push subscriptions for the current user
    const subscriptions = await PushSubscription.find({ userId: session.user.id });

    if (subscriptions.length === 0) {
      return NextResponse.json({ error: 'No push subscriptions found' }, { status: 404 });
    }

    // Send push notification to all subscriptions
    const payload = {
      title,
      body,
      icon: '/icon.png',
      url: '/internships',
    };

    await sendPushNotificationToAll(subscriptions, payload);

    return NextResponse.json({ 
      success: true, 
      message: `Push notification sent to ${subscriptions.length} device(s)` 
    });
  } catch (error) {
    console.error('Error sending test push notification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
