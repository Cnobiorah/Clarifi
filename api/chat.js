const https = require('https');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(500).json({ error: 'API key not configured' });

  const body = JSON.stringify(req.body);

  try {
    const data = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.anthropic.com',
        path: '/v1/messages',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
        },
      };
      const request = https.request(options, (r) => {
        let raw = '';
        r.on('data', chunk => raw += chunk);
        r.on('end', () => {
          try { resolve(JSON.parse(raw)); }
          catch (e) { reject(new Error('Parse error: ' + raw.slice(0, 200))); }
        });
      });
      request.on('error', reject);
      request.write(body);
      request.end();
    });
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
