import { precacheAndRoute } from 'workbox-precaching';

// Required for VitePWA to inject assets
precacheAndRoute(self.__WB_MANIFEST || []);

// Listen to Web Push events
self.addEventListener('push', function (event) {
  if (event.data) {
    try {
      const data = event.data.json();
      const title = data.title || 'Order Update';
      const options = {
        body: data.body || 'Your order status has changed.',
        icon: data.icon || '/vite.svg',
        badge: '/vite.svg',
        vibrate: [200, 100, 200, 100, 200],
        requireInteraction: true,
      };

      // Show the system notification
      event.waitUntil(self.registration.showNotification(title, options));
    } catch (e) {
      // Fallback if data is not JSON
      event.waitUntil(self.registration.showNotification('Order Update', {
        body: event.data.text()
      }));
    }
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  // Open the app when notification is clicked
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
          }
        }
        return client.focus();
      }
      return clients.openWindow('/');
    })
  );
});
