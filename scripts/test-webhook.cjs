/**
 * Test webhook sender with proper HMAC-SHA256 signature.
 * Usage: node scripts/test-webhook.cjs
 */
const crypto = require('crypto');

// Your Meta App Secret (from Vercel env vars or .env.local)
const APP_SECRET = process.env.META_APP_SECRET || 'your-meta-app-secret';

// Your webhook URL
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://wacrm-sandy.vercel.app/api/whatsapp/webhook';

// Test payload (matches Meta's format)
const payload = {
  object: "whatsapp_business_account",
  entry: [{
    id: "1323765479716858",
    changes: [{
      value: {
        messaging_product: "whatsapp",
        metadata: {
          display_phone_number: "15552032785",
          phone_number_id: "1237527342776448"
        },
        contacts: [{
          profile: { name: "Test User" },
          wa_id: "923189477670"
        }],
        messages: [{
          id: "wamid.test123",
          timestamp: String(Math.floor(Date.now() / 1000)),
          from: "923189477670",
          type: "text",
          text: { body: "Hello from test webhook" }
        }]
      },
      field: "messages"
    }]
  }]
};

const rawBody = JSON.stringify(payload);

// Calculate HMAC-SHA256 signature (Meta format: sha256=<hex>)
const signature = 'sha256=' + crypto.createHmac('sha256', APP_SECRET).update(rawBody).digest('hex');

console.log('Webhook URL:', WEBHOOK_URL);
console.log('Signature:', signature);
console.log('Payload:', rawBody);
console.log('\n--- Sending request... ---\n');

fetch(WEBHOOK_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-hub-signature-256': signature,
  },
  body: rawBody,
})
.then(async (res) => {
  console.log('Status:', res.status);
  const text = await res.text();
  console.log('Response:', text);
})
.catch(err => {
  console.error('Error:', err.message);
});
