// ============================================================
// GOOGLE APPS SCRIPT — Paste this entire code into Apps Script
// Sheet ID: 1NBzqY9KJcHdixriy37_jUM1qWSl8Vnxkh5CPKkflj_c
// ============================================================

const SHEET_NAME = 'Orders';

// ---- SETUP: Run this ONCE to create headers & dropdown ----
function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  const headers = [
    'Order ID',           // A
    'Date',               // B
    'Time',               // C
    'Customer Name',      // D
    'Phone',              // E
    'Special Instructions', // F
    'Items Ordered',      // G
    'Quantity',           // H
    'Total Bill (₹)',     // I
    'Delivery Type',      // J
    'Table Number',       // K
    'Machine ID',         // L
    'IP Address',         // M
    'User Agent',         // N
    'Cookies',            // O
    'Order Status',       // P  ← Dropdown column
    'Status Updated At',  // Q
  ];

  // Write headers
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // Style header row
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#1a1714');
  headerRange.setFontColor('#fff9ee');
  headerRange.setHorizontalAlignment('center');

  // Set column widths
  sheet.setColumnWidth(1, 120);
  sheet.setColumnWidth(2, 110);
  sheet.setColumnWidth(3, 90);
  sheet.setColumnWidth(4, 160);
  sheet.setColumnWidth(5, 150);
  sheet.setColumnWidth(6, 200);
  sheet.setColumnWidth(7, 300);
  sheet.setColumnWidth(8, 80);
  sheet.setColumnWidth(9, 110);
  sheet.setColumnWidth(10, 110);
  sheet.setColumnWidth(11, 100);
  sheet.setColumnWidth(12, 200);
  sheet.setColumnWidth(13, 140);
  sheet.setColumnWidth(14, 300);
  sheet.setColumnWidth(15, 200);
  sheet.setColumnWidth(16, 140);
  sheet.setColumnWidth(17, 160);

  // Apply "Order Status" dropdown to column P (rows 2-500)
  const statusRange = sheet.getRange('P2:P500');
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(
      ['Ordered', 'Confirmed', 'Preparing', 'Ready to Serve', 'Completed', 'Cancelled'],
      true
    )
    .setAllowInvalid(false)
    .build();
  statusRange.setDataValidation(statusRule);

  // Freeze header row
  sheet.setFrozenRows(1);

  SpreadsheetApp.getUi().alert('✅ Sheet setup complete!');
}


// ---- HELPER: Add order row to sheet ----
function addOrderToSheet(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

  var itemsSummary = '';
  var totalQty = 0;
  if (data.items && data.items.length) {
    for (var i = 0; i < data.items.length; i++) {
      var item = data.items[i];
      if (i > 0) itemsSummary += ', ';
      itemsSummary += item.name + ' x' + item.qty + ' (₹' + (item.unitPrice * item.qty) + ')';
      totalQty += item.qty;
    }
  }

  var row = [
    data.id || '',
    data.fullDate || new Date().toLocaleDateString(),
    data.createdAt || new Date().toLocaleTimeString(),
    (data.customer && data.customer.name) || '',
    (data.customer && data.customer.phone) || '',
    (data.customer && data.customer.instructions) || '',
    itemsSummary,
    totalQty,
    data.total || 0,
    data.deliveryType || '',
    data.tableNumber || '',
    (data.metadata && data.metadata.machineId) || '',
    (data.metadata && data.metadata.ip) || '',
    (data.metadata && data.metadata.userAgent) || '',
    (data.metadata && data.metadata.cookies) || '',
    'Ordered',
    new Date().toLocaleString('en-IN'),
  ];

  sheet.appendRow(row);

  var lastRow = sheet.getLastRow();
  applyStatusColor(sheet, lastRow);

  return lastRow;
}


// ---- WEB APP: Handles GET requests ----
// - ?action=addOrder&data={JSON}  → adds a new order
// - ?action=getOrders             → returns all orders
// - ?action=updateStatus&orderId=#CO123&status=Preparing → updates status of order
// - ?orderId=#CO12345             → returns order status
function doGet(e) {
  try {
    // --- ADD ORDER via GET ---
    if (e.parameter.action === 'addOrder' && e.parameter.data) {
      var data = JSON.parse(e.parameter.data);
      var rowNum = addOrderToSheet(data);
      
      // JSONP support
      if (e.parameter.callback) {
        return ContentService
          .createTextOutput(e.parameter.callback + '(' + JSON.stringify({ success: true, row: rowNum }) + ')')
          .setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
      return ContentService
        .createTextOutput('Order added to row ' + rowNum)
        .setMimeType(ContentService.MimeType.TEXT);
    }

    // --- GET ALL ORDERS ---
    if (e.parameter.action === 'getOrders') {
      var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
      if (!sheet) {
        var errResponse = JSON.stringify({ error: 'Sheet not found' });
        if (e.parameter.callback) {
          return ContentService
            .createTextOutput(e.parameter.callback + '(' + errResponse + ')')
            .setMimeType(ContentService.MimeType.JAVASCRIPT);
        }
        return ContentService
          .createTextOutput(errResponse)
          .setMimeType(ContentService.MimeType.JSON);
      }
      
      var allData = sheet.getDataRange().getValues();
      var orders = [];
      
      for (var i = 1; i < allData.length; i++) {
        // Build items list from summary text if possible
        var itemsSummary = allData[i][6] || '';
        
        orders.push({
          id: allData[i][0],
          fullDate: allData[i][1],
          createdAt: allData[i][2],
          customer: {
            name: allData[i][3],
            phone: allData[i][4],
            instructions: allData[i][5],
          },
          itemsSummary: itemsSummary,
          quantity: allData[i][7],
          total: allData[i][8],
          deliveryType: allData[i][9],
          tableNumber: allData[i][10],
          metadata: {
            machineId: allData[i][11],
            ip: allData[i][12],
            userAgent: allData[i][13],
            cookies: allData[i][14],
          },
          status: allData[i][15] || 'Ordered',
          statusUpdatedAt: allData[i][16] || '',
        });
      }
      
      var result = JSON.stringify(orders);
      if (e.parameter.callback) {
        return ContentService
          .createTextOutput(e.parameter.callback + '(' + result + ')')
          .setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
      return ContentService
        .createTextOutput(result)
        .setMimeType(ContentService.MimeType.JSON);
    }

    // --- UPDATE STATUS ---
    if (e.parameter.action === 'updateStatus' && e.parameter.orderId && e.parameter.status) {
      var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
      var allData = sheet.getDataRange().getValues();
      var foundRow = -1;
      
      for (var i = 1; i < allData.length; i++) {
        if (allData[i][0] === e.parameter.orderId) {
          foundRow = i + 1; // 1-based index, account for header
          break;
        }
      }
      
      if (foundRow !== -1) {
        sheet.getRange(foundRow, 16).setValue(e.parameter.status); // Column P
        sheet.getRange(foundRow, 17).setValue(new Date().toLocaleString('en-IN')); // Column Q
        applyStatusColor(sheet, foundRow);
        
        var responseObj = { success: true, orderId: e.parameter.orderId, status: e.parameter.status };
        var result = JSON.stringify(responseObj);
        if (e.parameter.callback) {
          return ContentService
            .createTextOutput(e.parameter.callback + '(' + result + ')')
            .setMimeType(ContentService.MimeType.JAVASCRIPT);
        }
        return ContentService
          .createTextOutput(result)
          .setMimeType(ContentService.MimeType.JSON);
      }
      
      var errResult = JSON.stringify({ success: false, error: 'Order not found' });
      if (e.parameter.callback) {
        return ContentService
          .createTextOutput(e.parameter.callback + '(' + errResult + ')')
          .setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
      return ContentService
        .createTextOutput(errResult)
        .setMimeType(ContentService.MimeType.JSON);
    }

    // --- CHECK ORDER STATUS ---
    if (e.parameter.orderId) {
      var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
      var allData = sheet.getDataRange().getValues();

      for (var i = 1; i < allData.length; i++) {
        if (allData[i][0] === e.parameter.orderId) {
          var result = {
            found: true,
            orderId: allData[i][0],
            status: allData[i][15] || 'Ordered',
            statusUpdatedAt: allData[i][16] || '',
            customerName: allData[i][3],
            total: allData[i][8],
          };
          
          if (e.parameter.callback) {
            return ContentService
              .createTextOutput(e.parameter.callback + '(' + JSON.stringify(result) + ')')
              .setMimeType(ContentService.MimeType.JAVASCRIPT);
          }
          return ContentService
            .createTextOutput(JSON.stringify(result))
            .setMimeType(ContentService.MimeType.JSON);
        }
      }

      var notFoundResult = { found: false };
      if (e.parameter.callback) {
        return ContentService
          .createTextOutput(e.parameter.callback + '(' + JSON.stringify(notFoundResult) + ')')
          .setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
      return ContentService
        .createTextOutput(JSON.stringify(notFoundResult))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ error: 'Missing parameters' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}



// ---- WEB APP: Handles POST requests (fallback) ----
function doPost(e) {
  try {
    var raw = '';
    if (e.parameter && e.parameter.orderData) {
      raw = e.parameter.orderData;
    } else if (e.postData && e.postData.contents) {
      raw = e.postData.contents;
    }

    var data = JSON.parse(raw);
    var rowNum = addOrderToSheet(data);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, row: rowNum }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}


// ---- TRIGGER: Auto-update timestamp when status changes ----
function onEdit(e) {
  var sheet = e.source.getActiveSheet();
  if (sheet.getName() !== SHEET_NAME) return;

  var col = e.range.getColumn();
  var row = e.range.getRow();

  if (col === 16 && row > 1) {
    sheet.getRange(row, 17).setValue(new Date().toLocaleString('en-IN'));
    applyStatusColor(sheet, row);
  }
}


// ---- HELPER: Color-code the status cell ----
function applyStatusColor(sheet, row) {
  var statusCell = sheet.getRange(row, 16);
  var status = statusCell.getValue();

  var colors = {
    'Ordered':        { bg: '#FFF3E0', fg: '#E65100' },
    'Confirmed':      { bg: '#E3F2FD', fg: '#1565C0' },
    'Preparing':      { bg: '#FFF8E1', fg: '#F57F17' },
    'Ready to Serve': { bg: '#E8F5E9', fg: '#2E7D32' },
    'Completed':      { bg: '#E0F2F1', fg: '#00695C' },
    'Cancelled':      { bg: '#FFEBEE', fg: '#C62828' },
  };

  var style = colors[status] || { bg: '#FFFFFF', fg: '#000000' };
  statusCell.setBackground(style.bg);
  statusCell.setFontColor(style.fg);
  statusCell.setFontWeight('bold');
}


// ---- TEST: Run this to verify the script works ----
function testAddOrder() {
  var testData = {
    id: '#TEST001',
    total: 499,
    deliveryType: 'Dine In',
    createdAt: new Date().toLocaleTimeString(),
    fullDate: new Date().toLocaleDateString(),
    tableNumber: '5',
    customer: { name: 'Test User', phone: '+91 12345 67890', instructions: 'No onions' },
    items: [{ name: 'Test Pasta', qty: 2, unitPrice: 249 }],
    metadata: { machineId: 'test-123', ip: '127.0.0.1', userAgent: 'Test', cookies: '' }
  };

  var row = addOrderToSheet(testData);
  Logger.log('Test order added at row: ' + row);
}
