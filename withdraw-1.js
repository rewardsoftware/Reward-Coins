// Vercel Serverless Function — FaucetPay PEPE Instant Payout
// Environment Variable: FAUCETPAY_API_KEY (set in Vercel dashboard)

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { address, coins, username } = req.body;

  // --- Validation ---
  if (!address || !coins || isNaN(coins)) {
    return res.status(400).json({ success: false, error: 'Invalid request data' });
  }

  const coinAmount = parseInt(coins);
  const pepeAmount = coinAmount * 5; // 1 Coin = 5 PEPE

  // Minimum 10 PEPE = 2 Coins
  if (pepeAmount < 10) {
    return res.status(400).json({ success: false, error: 'Minimum withdrawal is 10 PEPE (2 Coins)' });
  }

  const apiKey = process.env.FAUCETPAY_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ success: false, error: 'API key not configured' });
  }

  try {
    const params = new URLSearchParams({
      api_key: apiKey,
      to: address,
      amount: pepeAmount,
      currency: 'PEPE',
      referral: 'NO',
    });

    const fpRes = await fetch('https://faucetpay.io/api/v1/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const data = await fpRes.json();

    // FaucetPay status 200 = success
    if (data.status === 200) {
      return res.status(200).json({
        success: true,
        message: `${pepeAmount} PEPE sent successfully!`,
        pepe: pepeAmount,
        coins: coinAmount,
        payout_id: data.payout_id || null,
      });
    } else {
      return res.status(200).json({
        success: false,
        error: data.message || 'FaucetPay payment failed',
      });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Server error: ' + err.message });
  }
}
