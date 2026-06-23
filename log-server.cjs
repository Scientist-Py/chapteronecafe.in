const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const webpush = require('web-push');

// 1. Setup VAPID Keys
const publicVapidKey = 'BBZ5GvoqaxRLR2hilJBhK3EnhkEZnJ1GV7gyfNRwAAsaIe5Ef1_cPJKGiKGhzBc65_elag8gBdC5U6JKoKbq3YQ';
const privateVapidKey = 'JKc44j79H09jRQaloictswnz8Ltpp715OywAiY84CaE';

webpush.setVapidDetails(
  'mailto:support@cafechapterone.com',
  publicVapidKey,
  privateVapidKey
);

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;
const LOG_FILE = path.join(__dirname, 'src', 'orders.json');
const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbwtGUxqS0Fqjdh8KNv-iHEs40ECm-RSh5iY5V7RY8XHZXfi0sBEZ-ahRbJrXHBfZCvV/exec';

// Store subscriptions in memory. Maps orderId -> push subscription object
let subscriptions = {};
// Store last known statuses to detect changes
let lastStatuses = {};

// 2. Original Endpoint: Save to orders.json
app.post('/log', (req, res) => {
  try {
    const newOrder = req.body;
    let orders = [];
    if (fs.existsSync(LOG_FILE)) {
      orders = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8') || '[]');
    }
    orders.push(newOrder);
    fs.writeFileSync(LOG_FILE, JSON.stringify(orders, null, 2));
    
    // Also track this order locally to start polling it
    if (!lastStatuses[newOrder.id]) {
       lastStatuses[newOrder.id] = 'Ordered';
    }

    console.log(`[PushServer] Saved order: ${newOrder.id}`);
    res.json({ success: true });
  } catch (err) {
    console.error('[PushServer] Error saving order:', err);
    res.status(500).send('Error');
  }
});

// 3. New Endpoint: Subscribe a device to Web Push for a specific order
app.post('/subscribe', (req, res) => {
  const { subscription, orderId } = req.body;
  if (!subscription || !orderId) {
    return res.status(400).json({ error: 'Missing subscription or orderId' });
  }
  
  subscriptions[orderId] = subscription;
  
  // Track status if not already
  if (!lastStatuses[orderId]) {
    lastStatuses[orderId] = 'Ordered';
  }
  
  console.log(`[PushServer] Device subscribed for order ${orderId}`);
  res.status(201).json({});
});

// 4. Background Polling Service
// The server automatically polls Google Sheets for active orders and sends push notifications
setInterval(async () => {
  const activeOrderIds = Object.keys(subscriptions);
  if (activeOrderIds.length === 0) return;

  for (const orderId of activeOrderIds) {
    try {
      const response = await fetch(`${GOOGLE_SHEET_URL}?orderId=${encodeURIComponent(orderId)}`);
      const data = await response.json();
      
      if (data.found) {
        const currentStatus = data.status;
        const previousStatus = lastStatuses[orderId];
        
        // If status changed!
        if (currentStatus !== previousStatus) {
          console.log(`[PushServer] Status change for ${orderId}: ${previousStatus} -> ${currentStatus}`);
          lastStatuses[orderId] = currentStatus;
          
          // Sync status change back to local orders.json
          syncStatusToLocalFile(orderId, currentStatus);
          
          // Send Push Notification
          const sub = subscriptions[orderId];
          const payload = JSON.stringify({
            title: `Order ${currentStatus}`,
            body: `Your order status is now ${currentStatus}.`,
            icon: '/vite.svg'
          });
          
          webpush.sendNotification(sub, payload).catch(err => {
            console.error('[PushServer] Push error (maybe un-subscribed):', err);
            delete subscriptions[orderId];
          });
          
          // If completed or cancelled, stop polling
          if (currentStatus === 'Completed' || currentStatus === 'Cancelled') {
            delete subscriptions[orderId];
          }
        }
      }
    } catch (err) {
      // ignore network errors during polling
    }
  }
}, 10000); // Poll every 10 seconds

// 4b. Broader Google Sheets Sync — polls ALL orders from GS and syncs status differences to local
// This ensures manual edits in the Google Sheet are reflected in local orders.json
setInterval(async () => {
  try {
    const response = await fetch(`${GOOGLE_SHEET_URL}?action=getOrders`);
    const text = await response.text();
    let gsOrders;
    try {
      gsOrders = JSON.parse(text);
    } catch (e) {
      return; // non-JSON response, skip
    }
    if (!Array.isArray(gsOrders) || gsOrders.length === 0) return;

    // Read local orders
    let localOrders = [];
    if (fs.existsSync(LOG_FILE)) {
      localOrders = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8') || '[]');
    }
    if (localOrders.length === 0) return;

    let changed = false;
    for (const gsOrder of gsOrders) {
      const localOrder = localOrders.find(o => o.id === gsOrder.id);
      if (localOrder && gsOrder.status && localOrder.status !== gsOrder.status) {
        console.log(`[SheetsSync] Status mismatch for ${gsOrder.id}: local="${localOrder.status}" vs sheets="${gsOrder.status}" → updating local`);
        localOrder.status = gsOrder.status;
        localOrder.statusUpdatedAt = gsOrder.statusUpdatedAt || new Date().toISOString();
        lastStatuses[gsOrder.id] = gsOrder.status;
        changed = true;
      }
    }

    if (changed) {
      fs.writeFileSync(LOG_FILE, JSON.stringify(localOrders, null, 2));
      console.log('[SheetsSync] Local orders.json updated with Google Sheets changes.');
    }
  } catch (err) {
    // Silently ignore network errors
  }
}, 15000); // Sync every 15 seconds

// Helper: write a single status change to local orders.json
function syncStatusToLocalFile(orderId, status) {
  try {
    let orders = [];
    if (fs.existsSync(LOG_FILE)) {
      orders = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8') || '[]');
    }
    let found = false;
    orders = orders.map(order => {
      if (order.id === orderId) {
        found = true;
        return { ...order, status, statusUpdatedAt: new Date().toISOString() };
      }
      return order;
    });
    if (found) {
      fs.writeFileSync(LOG_FILE, JSON.stringify(orders, null, 2));
      console.log(`[SyncLocal] Updated ${orderId} to ${status} in orders.json`);
    }
  } catch (err) {
    console.error('[SyncLocal] Error syncing to local file:', err);
  }
}

// 5. Fetch all orders
app.get('/orders', (req, res) => {
  try {
    if (fs.existsSync(LOG_FILE)) {
      const orders = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8') || '[]');
      res.json(orders);
    } else {
      res.json([]);
    }
  } catch (err) {
    console.error('[PushServer] Error reading orders:', err);
    res.status(500).json({ error: 'Error reading orders' });
  }
});

// 6. Update order status
app.post('/update-status', (req, res) => {
  const { orderId, status } = req.body;
  if (!orderId || !status) {
    return res.status(400).json({ error: 'Missing orderId or status' });
  }

  try {
    let orders = [];
    if (fs.existsSync(LOG_FILE)) {
      orders = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8') || '[]');
    }

    let found = false;
    orders = orders.map(order => {
      if (order.id === orderId) {
        found = true;
        return {
          ...order,
          status: status,
          statusUpdatedAt: new Date().toISOString()
        };
      }
      return order;
    });

    if (found) {
      fs.writeFileSync(LOG_FILE, JSON.stringify(orders, null, 2));
      lastStatuses[orderId] = status; // sync with polling
      console.log(`[PushServer] Updated status locally for ${orderId} to ${status}`);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Order not found' });
    }
  } catch (err) {
    console.error('[PushServer] Error updating order status:', err);
    res.status(500).json({ error: 'Error updating status' });
  }
});

app.listen(PORT, () => {
  console.log(`[PushServer] Running on http://localhost:${PORT}`);
  console.log(`[PushServer] Web Push and Background Polling active.`);
});

