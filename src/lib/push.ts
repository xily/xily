import webpush from 'web-push';

// Configure web-push with VAPID keys
const vapidSubject = process.env.VAPID_SUBJECT || process.env.VAPID_EMAIL || 'mailto:admin@example.com';
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

if (!vapidPublicKey || !vapidPrivateKey) {
  console.error('VAPID keys are not configured. Push notifications will not work.');
  console.error('Please set NEXT_PUBLIC_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY environment variables.');
} else {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    auth: string;
    p256dh: string;
  };
}

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  url?: string;
}

export async function sendPushNotification(
  subscription: PushSubscriptionData,
  payload: PushPayload
): Promise<void> {
  if (!vapidPublicKey || !vapidPrivateKey) {
    throw new Error('VAPID keys are not configured. Cannot send push notifications.');
  }

  try {
    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        auth: subscription.keys.auth,
        p256dh: subscription.keys.p256dh,
      },
    };

    const pushPayload = JSON.stringify(payload);

    await webpush.sendNotification(pushSubscription, pushPayload);
    console.log('Push notification sent successfully to:', subscription.endpoint);
  } catch (error) {
    console.error('Error sending push notification:', error);
    throw error;
  }
}

export async function sendPushNotificationToAll(
  subscriptions: PushSubscriptionData[],
  payload: PushPayload
): Promise<void> {
  const promises = subscriptions.map(subscription =>
    sendPushNotification(subscription, payload).catch(error => {
      console.error(`Failed to send notification to ${subscription.endpoint}:`, error);
    })
  );

  await Promise.allSettled(promises);
}
