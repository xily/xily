import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/options';
import connectDB from '@/app/lib/mongodb';
import PushSubscription from '@/models/PushSubscription';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { endpoint, keys } = await request.json();

    if (!endpoint || !keys?.auth || !keys?.p256dh) {
      return NextResponse.json({ error: 'Invalid subscription data' }, { status: 400 });
    }

    await connectDB();

    // Check if subscription already exists
    const existingSubscription = await (PushSubscription as any).findOne({ endpoint });
    
    if (existingSubscription) {
      // Update the userId if it's different
      if (existingSubscription.userId.toString() !== session.user.id) {
        existingSubscription.userId = session.user.id;
        await existingSubscription.save();
      }
      return NextResponse.json({ success: true, message: 'Subscription updated' });
    }

    // Create new subscription
    const subscription = new (PushSubscription as any)({
      userId: session.user.id,
      endpoint,
      keys,
    });

    await subscription.save();

    return NextResponse.json({ success: true, message: 'Subscription saved' });
  } catch (error) {
    console.error('Error saving push subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { endpoint } = await request.json();

    if (!endpoint) {
      return NextResponse.json({ error: 'Endpoint required' }, { status: 400 });
    }

    await connectDB();

    // Delete subscription by endpoint and userId for security
    const result = await (PushSubscription as any).deleteOne({
      endpoint,
      userId: session.user.id,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Subscription removed' });
  } catch (error) {
    console.error('Error removing push subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
