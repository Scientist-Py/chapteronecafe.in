// =====================================================
// IMPORTANT: After deploying the Apps Script as a web app,
// paste your deployment URL below.
// =====================================================
const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbwtGUxqS0Fqjdh8KNv-iHEs40ECm-RSh5iY5V7RY8XHZXfi0sBEZ-ahRbJrXHBfZCvV/exec';

export async function getOrderMetadata() {
  const metadata = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    cookies: document.cookie,
    timestamp: new Date().toISOString(),
    localTime: new Date().toLocaleString(),
    machineId: getOrCreateMachineId(),
  };

  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    metadata.ip = data.ip;
  } catch (err) {
    metadata.ip = 'Unavailable';
  }

  return metadata;
}

function getOrCreateMachineId() {
  let id = localStorage.getItem('cafe_machine_id');
  if (!id) {
    id = 'mid-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();
    localStorage.setItem('cafe_machine_id', id);
  }
  return id;
}

export async function saveOrderToLocalDB(order) {
  // 1. Save to localStorage (backup)
  const orders = JSON.parse(localStorage.getItem('cafe_orders_db') || '[]');
  orders.push(order);
  localStorage.setItem('cafe_orders_db', JSON.stringify(orders, null, 2));

  // 2. Send to local log-server (orders.json file)
  try {
    await fetch('http://localhost:3001/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    console.log('Order synced to orders.json');
  } catch (err) {
    console.warn('Local log-server not running:', err.message);
  }

  // 3. Send to Google Sheets via GET (most reliable for Apps Script)
  if (GOOGLE_SHEET_URL && !GOOGLE_SHEET_URL.includes('YOUR_')) {
    try {
      // Prepare compact data for URL (trim large fields)
      const compact = {
        id: order.id,
        total: order.total,
        deliveryType: order.deliveryType,
        createdAt: order.createdAt,
        fullDate: order.fullDate,
        tableNumber: order.tableNumber,
        customer: order.customer,
        items: (order.items || []).map(i => ({
          name: i.name, qty: i.qty, unitPrice: i.unitPrice
        })),
        metadata: {
          machineId: order.metadata?.machineId || '',
          ip: order.metadata?.ip || '',
          userAgent: (order.metadata?.userAgent || '').substring(0, 120),
          cookies: (order.metadata?.cookies || '').substring(0, 100),
        }
      };

      const encoded = encodeURIComponent(JSON.stringify(compact));
      const url = `${GOOGLE_SHEET_URL}?action=addOrder&data=${encoded}`;

      // Use script tag injection — guaranteed no CORS issues
      const script = document.createElement('script');
      script.src = url;
      script.onerror = () => script.remove();
      script.onload = () => script.remove();
      document.head.appendChild(script);

      console.log('Order sent to Google Sheet');
    } catch (err) {
      console.warn('Could not sync to Google Sheet:', err.message);
    }
  }
}

// 4. Poll for live order status updates — Local first, then Google Sheets JSONP fallback
export async function pollOrderStatus(orderId) {
  // Strategy 1: Try local Express server (fast, no CORS)
  try {
    const response = await fetch('http://localhost:3001/orders');
    if (response.ok) {
      const orders = await response.json();
      const match = orders.find(o => o.id === orderId);
      if (match && match.status) {
        return { status: match.status, updatedAt: match.statusUpdatedAt || '' };
      }
    }
  } catch (err) {
    // Local server not running — fall through to Google Sheets
  }

  // Strategy 2: Try Google Sheets via JSONP (CORS-safe)
  if (GOOGLE_SHEET_URL && !GOOGLE_SHEET_URL.includes('YOUR_')) {
    try {
      const result = await pollOrderStatusFromGS(orderId);
      if (result) return result;
    } catch (err) {
      console.warn('GS JSONP poll failed:', err.message);
    }
  }

  // Strategy 3: Check localStorage as absolute fallback
  try {
    const orders = JSON.parse(localStorage.getItem('cafe_orders_db') || '[]');
    const match = orders.find(o => o.id === orderId);
    if (match && match.status) {
      return { status: match.status, updatedAt: match.statusUpdatedAt || '' };
    }
  } catch (e) {}

  return null;
}

// JSONP-based Google Sheets status poll (CORS-safe for browser)
function pollOrderStatusFromGS(orderId) {
  return new Promise((resolve, reject) => {
    const callbackName = 'jsonp_status_' + Math.round(100000 * Math.random());
    const timeout = setTimeout(() => {
      delete window[callbackName];
      try { document.getElementById(callbackName)?.remove(); } catch(e) {}
      resolve(null); // timeout — don't reject, just return null
    }, 8000);

    window[callbackName] = function(data) {
      clearTimeout(timeout);
      delete window[callbackName];
      try { document.getElementById(callbackName)?.remove(); } catch(e) {}
      if (data && data.found) {
        resolve({ status: data.status, updatedAt: data.statusUpdatedAt || '' });
      } else {
        resolve(null);
      }
    };

    const script = document.createElement('script');
    script.id = callbackName;
    script.src = `${GOOGLE_SHEET_URL}?orderId=${encodeURIComponent(orderId)}&callback=${callbackName}`;
    script.onerror = function() {
      clearTimeout(timeout);
      delete window[callbackName];
      try { document.getElementById(callbackName)?.remove(); } catch(e) {}
      resolve(null);
    };
    document.head.appendChild(script);
  });
}

// 5. Fetch all orders from Google Sheets (via CORS-safe JSONP)
export function fetchOrdersFromGS() {
  return new Promise((resolve, reject) => {
    if (!GOOGLE_SHEET_URL || GOOGLE_SHEET_URL.includes('YOUR_')) {
      resolve([]);
      return;
    }
    const callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
    window[callbackName] = function(data) {
      delete window[callbackName];
      try {
        const el = document.getElementById(callbackName);
        if (el) el.remove();
      } catch (e) {}
      resolve(data);
    };
    
    const script = document.createElement('script');
    script.id = callbackName;
    script.src = `${GOOGLE_SHEET_URL}?action=getOrders&callback=${callbackName}`;
    script.onerror = function() {
      delete window[callbackName];
      try {
        const el = document.getElementById(callbackName);
        if (el) el.remove();
      } catch (e) {}
      reject(new Error('JSONP request failed'));
    };
    document.head.appendChild(script);
  });
}

// 6. Update order status in Google Sheets (via CORS-safe JSONP)
export function updateOrderStatusInGS(orderId, status) {
  return new Promise((resolve, reject) => {
    if (!GOOGLE_SHEET_URL || GOOGLE_SHEET_URL.includes('YOUR_')) {
      resolve({ success: false, error: 'No Sheets URL' });
      return;
    }
    const callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
    window[callbackName] = function(data) {
      delete window[callbackName];
      try {
        const el = document.getElementById(callbackName);
        if (el) el.remove();
      } catch (e) {}
      resolve(data);
    };
    
    const script = document.createElement('script');
    script.id = callbackName;
    script.src = `${GOOGLE_SHEET_URL}?action=updateStatus&orderId=${encodeURIComponent(orderId)}&status=${encodeURIComponent(status)}&callback=${callbackName}`;
    script.onerror = function() {
      delete window[callbackName];
      try {
        const el = document.getElementById(callbackName);
        if (el) el.remove();
      } catch (e) {}
      reject(new Error('JSONP request failed'));
    };
    document.head.appendChild(script);
  });
}

// 7. Fetch all orders from local log-server or localStorage
export async function fetchOrdersLocal() {
  try {
    const response = await fetch('http://localhost:3001/orders');
    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.warn('Local log-server not running or error fetching:', err.message);
  }
  // Fallback to localStorage
  return JSON.parse(localStorage.getItem('cafe_orders_db') || '[]');
}

// 8. Update order status locally (localStorage and local server)
export async function updateOrderStatusLocal(orderId, status) {
  // Update in localStorage
  try {
    const orders = JSON.parse(localStorage.getItem('cafe_orders_db') || '[]');
    const updated = orders.map(o => o.id === orderId ? { ...o, status, statusUpdatedAt: new Date().toISOString() } : o);
    localStorage.setItem('cafe_orders_db', JSON.stringify(updated, null, 2));
  } catch (e) {
    console.error('LocalStorage update failed:', e);
  }

  // Update in local server
  try {
    const response = await fetch('http://localhost:3001/update-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, status }),
    });
    return response.ok;
  } catch (err) {
    console.warn('Local log-server not running or update failed:', err.message);
    return false;
  }
}

