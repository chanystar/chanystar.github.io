/**
 * Vercel Serverless Function: Google OAuth Callback Handler (with CORS)
 * 
 * URL: https://your-vercel-app.vercel.app/api/auth?code=AUTH_CODE
 * 
 * This function:
 * 1. Receives authorization code from Google
 * 2. Exchanges code for ID token (server-side, secure)
 * 3. Returns token to frontend (supports CORS for cross-domain)
 */

const https = require('https');

function fetchJSON(url, options) {
  return new Promise((resolve, reject) => {
    https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject).end(options.body);
  });
}

// Helper: Add CORS headers
function addCorsHeaders(res, origin) {
  // Allow GitHub Pages and localhost
  const allowedOrigins = [
    'https://chanystar.github.io',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ];
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}

module.exports = async (req, res) => {
  const origin = req.headers.origin || '';
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    addCorsHeaders(res, origin);
    return res.status(200).end();
  }

  const { code } = req.query;

  // 환경변수 확인
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'https://your-vercel-app.vercel.app/api/auth';
  const frontendUrl = process.env.FRONTEND_URL || 'https://chanystar.github.io';

  // 필수 환경변수 체크
  if (!clientId || !clientSecret) {
    addCorsHeaders(res, origin);
    return res.status(400).json({ error: 'Missing Google OAuth credentials' });
  }

  if (!code) {
    addCorsHeaders(res, origin);
    return res.status(400).json({ error: 'Missing authorization code' });
  }

  try {
    // Google Token Endpoint로 Authorization Code 교환
    const tokenUrl = 'https://oauth2.googleapis.com/token';
    const tokenOptions = {
      hostname: 'oauth2.googleapis.com',
      path: '/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    };

    const tokenData = await fetchJSON(tokenUrl, tokenOptions);

    if (tokenData.error) {
      console.error('Token exchange error:', tokenData.error);
      addCorsHeaders(res, origin);
      return res.status(400).json({ error: tokenData.error_description || tokenData.error });
    }

    const idToken = tokenData.id_token;
    const accessToken = tokenData.access_token;

    // CORS 헤더 추가
    addCorsHeaders(res, origin);

    // JSON으로 토큰 반환 (프런트엔드가 처리)
    return res.status(200).json({
      success: true,
      id_token: idToken,
      access_token: accessToken,
      token_type: tokenData.token_type,
      expires_in: tokenData.expires_in,
    });
  } catch (error) {
    console.error('OAuth error:', error);
    addCorsHeaders(res, origin);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
