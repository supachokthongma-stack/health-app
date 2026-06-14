const STRAVA_CLIENT_ID = import.meta.env.VITE_STRAVA_CLIENT_ID || '';
const STRAVA_SCOPE = 'activity:read_all';

export function isStravaConfigured() {
  return Boolean(STRAVA_CLIENT_ID);
}

export function getStravaRedirectUri() {
  const base = `${window.location.origin}${window.location.pathname}`;
  const url = new URL(base);
  url.searchParams.set('strava_callback', '1');
  return url.toString();
}

export function buildStravaAuthUrl() {
  if (!STRAVA_CLIENT_ID) {
    throw new Error('STRAVA_NOT_CONFIGURED');
  }
  const params = new URLSearchParams({
    client_id: STRAVA_CLIENT_ID,
    response_type: 'code',
    redirect_uri: getStravaRedirectUri(),
    approval_prompt: 'auto',
    scope: STRAVA_SCOPE,
  });
  return `https://www.strava.com/oauth/authorize?${params.toString()}`;
}

export function isZwiftStravaActivity(activity) {
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

export function mapStravaActivityToZwift(activity) {
  const start = activity.start_date ? new Date(activity.start_date) : new Date();
  const durationMin = Math.round((activity.moving_time || activity.elapsed_time || 0) / 60);
  const distanceKm = Number(((activity.distance || 0) / 1000).toFixed(2));
  const typeLabel = activity.type === 'VirtualRun' ? 'วิ่ง' : 'ปั่นจักรยาน';

  return {
    id: `strava-${activity.id}`,
    stravaId: activity.id,
    date: start.toLocaleDateString('th-TH'),
    time: start.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    deviceName: activity.device_name || 'Zwift',
    duration: durationMin,
    distance: distanceKm,
    calories: Math.round(activity.calories || activity.kilojoules || 0),
    averageHeartRate: activity.average_heartrate || 0,
    activityType: typeLabel,
    activityName: activity.name || 'Zwift Activity',
    source: 'strava',
  };
}

export async function exchangeStravaCode(code) {
  const response = await fetch('/api/strava/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, redirect_uri: getStravaRedirectUri() }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'เชื่อมต่อ Strava ไม่สำเร็จ');
  }
  return data;
}

export async function syncZwiftActivitiesFromStrava(tokens) {
  const response = await fetch('/api/strava/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tokens),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'ดึงข้อมูล Zwift ไม่สำเร็จ');
  }
  return data;
}

export function parseStravaCallback() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('strava_callback') !== '1') return null;
  const code = params.get('code');
  const error = params.get('error');
  return { code, error };
}

export function clearStravaCallbackFromUrl() {
  const url = new URL(window.location.href);
  url.searchParams.delete('strava_callback');
  url.searchParams.delete('code');
  url.searchParams.delete('error');
  url.searchParams.delete('scope');
  url.searchParams.delete('state');
  window.history.replaceState({}, '', url.toString());
}
