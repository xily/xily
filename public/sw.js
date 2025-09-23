// Service Worker for Push Notifications
self.addEventListener('push', function(event) {
  console.log('Push event received:', event);
  
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'New Notification';
  const body = data.body || 'You have a new notification';
  const icon = data.icon || '/icon.png';
  const url = data.url || '/';

  const options = {
    body: body,
    icon: icon,
    badge: icon,
    data: {
      url: url
    },
    actions: [
      {
        action: 'open',
        title: 'Open',
        icon: icon
      },
      {
        action: 'close',
        title: 'Close',
        icon: icon
      }
    ],
    requireInteraction: false,
    silent: false
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', function(event) {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // Default action or 'open' action
  const url = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(function(clientList) {
      // Check if there's already a window/tab open with the target URL
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If no existing window, open a new one
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Handle notification close
self.addEventListener('notificationclose', function(event) {
  console.log('Notification closed:', event);
});

// Service worker installation
self.addEventListener('install', function(event) {
  console.log('Service Worker installing');
  self.skipWaiting();
});

// Service worker activation
self.addEventListener('activate', function(event) {
  console.log('Service Worker activating');
  event.waitUntil(self.clients.claim());
});
