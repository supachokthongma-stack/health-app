function isZwiftActivity(activity) {
  const device = String(activity?.device_name || '').toLowerCase();
  const name = String(activity?.name || '').toLowerCase();
  const type = activity?.type || '';
  return (
    device.includes('zwift')
    || name.includes('zwift')
    || type === 'VirtualRide'
    || type === 'VirtualRun'
  );
}

async function refreshStravaToken(clientId, clientSecret, refreshToken) {
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });

  const response = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Refresh token failed');
  }

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: data.expires_at * 1000,
  };
}

async function getAccessToken(clientId, clientSecret, tokens) {
  const now = Date.now();
  if (tokens.accessToken && tokens.expiresAt && now < tokens.expiresAt - 60_000) {
    return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, expiresAt: tokens.expiresAt };
  }
  return refreshStravaToken(clientId, clientSecret, tokens.refreshToken);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const clientId = process.env.STRAVA_CLIENT_ID || process.env.VITE_STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    res.status(503).json({ error: 'Strava API ยังไม่ได้ตั้งค่า' });
    return;
  }

  const { accessToken, refreshToken, expiresAt } = req.body || {};
  if (!refreshToken) {
    res.status(400).json({ error: 'Missing refresh token' });
    return;
  }

  try {
    const session = await getAccessToken(clientId, clientSecret, { accessToken, refreshToken, expiresAt });

    const activitiesResponse = await fetch(
      'https://www.strava.com/api/v3/athlete/activities?per_page=30',
      { headers: { Authorization: `Bearer ${session.accessToken}` } },
    );

    const activities = await activitiesResponse.json();
    if (!activitiesResponse.ok) {
      res.status(activitiesResponse.status).json({
        error: activities?.message || 'Failed to fetch activities',
      });
      return;
    }

    const zwiftActivities = (Array.isArray(activities) ? activities : [])
      .filter(isZwiftActivity)
      .map((activity) => {
        const start = activity.start_date ? new Date(activity.start_date) : new Date();
        return {
          id: `strava-${activity.id}`,
          stravaId: activity.id,
          date: start.toLocaleDateString('th-TH'),
          time: start.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
          deviceName: activity.device_name || 'Zwift',
          duration: Math.round((activity.moving_time || activity.elapsed_time || 0) / 60),
          distance: Number(((activity.distance || 0) / 1000).toFixed(2)),
          calories: Math.round(activity.calories || activity.kilojoules || 0),
          averageHeartRate: activity.average_heartrate || 0,
          activityType: activity.type === 'VirtualRun' ? 'วิ่ง' : 'ปั่นจักรยาน',
          activityName: activity.name || 'Zwift Activity',
          source: 'strava',
        };
      });

    res.status(200).json({
      activities: zwiftActivities,
      tokens: session,
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Server error' });
  }
}
