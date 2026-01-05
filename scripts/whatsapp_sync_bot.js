// WhatsApp Group → Announcements sync bot
// Requires: Node.js, whatsapp-web.js, qrcode-terminal, node-fetch
// Usage: node scripts/whatsapp_sync_bot.js

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fetch = require('node-fetch');

// === CONFIG ===
const GROUP_NAME = 'YOUR_GROUP_NAME_HERE'; // Change to your WhatsApp group name
const ANNOUNCEMENTS_ENDPOINT = 'http://localhost:3000/api/announcements/whatsapp'; // Change to your deployed endpoint

const client = new Client({ authStrategy: new LocalAuth() });

client.on('qr', (qr) => {
  qrcode.generate(qr, { small: true });
  console.log('Scan the QR code above with WhatsApp to log in.');
});

client.on('ready', () => {
  console.log('WhatsApp bot is ready!');
});

client.on('message', async (msg) => {
  try {
    const chat = await msg.getChat();
    if (!chat.isGroup) return;
    if (chat.name !== GROUP_NAME) return;
    if (msg.type !== 'chat' || !msg.body) return;
    // Forward message to announcements endpoint
    const sender = msg._data.notifyName || msg.author || 'Unknown';
    const payload = {
      message: msg.body,
      sender,
      whatsapp_msg_id: msg.id._serialized
    };
    const res = await fetch(ANNOUNCEMENTS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      console.log('Announcement synced:', msg.body.slice(0, 60));
    } else {
      console.error('Failed to sync announcement:', await res.text());
    }
  } catch (err) {
    console.error('Bot error:', err);
  }
});

client.initialize();
