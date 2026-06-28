export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const BOT_TOKEN = process.env.BOT_TOKEN;
  const CHAT_ID   = '6601027952';

  if (!BOT_TOKEN) return res.status(500).json({ ok: false, error: 'BOT_TOKEN not set' });

  const { username, userId, coins, usdt, method, address } = req.body;

  const text = `💸 *NEW WITHDRAWAL REQUEST*\n\n` +
    `👤 *User:* ${username || 'Unknown'}\n` +
    `🆔 *Telegram ID:* ${userId || 'N/A'}\n` +
    `🪙 *Coins:* ${coins}\n` +
    `💵 *USDT:* $${usdt}\n` +
    `📤 *Method:* ${method}\n` +
    `🏦 *Wallet/ID:* \`${address}\`\n` +
    `🕐 *Time:* ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`;

  try {
    const r = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'Markdown' })
    });
    const data = await r.json();
    if (data.ok) return res.status(200).json({ ok: true });
    else return res.status(500).json({ ok: false, error: data.description });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
}
