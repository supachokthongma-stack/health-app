export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const clientId = process.env.STRAVA_CLIENT_ID || process.env.VITE_STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    res.status(503).json({
      error: 'Strava API ยังไม่ได้ตั้งค่า กรุณาเพิ่ม STRAVA_CLIENT_ID และ STRAVA_CLIENT_SECRET บนเซิร์ฟเวอร์',
    });
    return;
  }

  const { code, redirect_uri: redirectUri } = req.body || {};
  if (!code || !redirectUri) {
    res.status(400).json({ error: 'Missing code or redirect_uri' });
    return;
  }

  try {
    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    });

    const response = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    const data = await response.json();
    if (!response.ok) {
      res.status(response.status).json({
        error: data.message || data.errors?.[0]?.resource || 'Strava token exchange failed',
      });
      return;
    }

    res.status(200).json({
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: data.expires_at * 1000,
      athlete: {
        id: data.athlete?.id,
        firstname: data.athlete?.firstname,
        lastname: data.athlete?.lastname,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Server error' });
  }
}
