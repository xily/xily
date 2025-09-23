import webpush from 'web-push';

// Configure web-push with VAPID keys
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

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
