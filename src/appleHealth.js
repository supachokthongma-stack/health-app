const HEALTH_READ_TYPES = ['steps', 'distance', 'calories', 'heartRate', 'restingHeartRate'];

const METRIC_LABELS = {
  steps: { label: 'ก้าวเดิน', unit: 'ก้าว' },
  distance: { label: 'ระยะทาง', unit: 'กม.' },
  calories: { label: 'เคลื่อนไหว', unit: 'แคล' },
  heartRate: { label: 'อัตราการเต้นหัวใจ', unit: 'bpm' },
  restingHeartRate: { label: 'ชีพจรขณะพัก', unit: 'bpm' },
};

export function isIOSDevice() {
  if (typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

export async function getHealthRuntime() {
  try {
    const { Capacitor } = await import('@capacitor/core');
    if (!Capacitor.isNativePlatform()) {
      return { mode: isIOSDevice() ? 'web_ios' : 'web' };
    }

    const { Health } = await import('@capgo/capacitor-health');
    const availability = await Health.isAvailable();
    if (!availability?.available) {
      return { mode: 'unavailable', reason: availability?.reason || 'Health ไม่พร้อมใช้งาน' };
    }

    return { mode: 'native', Health, platform: Capacitor.getPlatform() };
  } catch {
    return { mode: isIOSDevice() ? 'web_ios' : 'web' };
  }
}

export function getAppleHealthAvailabilityMessage(mode) {
  if (mode === 'native') return null;
  if (mode === 'web_ios') {
    return 'บน iPhone ต้องติดตั้ง Health Trainer เป็นแอpp iOS (Capacitor + HealthKit) เพื่อเชื่อม Apple Health โดยตรง — เว็บใน Safari เข้า HealthKit ไม่ได้';
  }
  if (mode === 'unavailable') {
    return 'อุปกรณ์นี้ไม่รองรับการเชื่อม Apple Health / Health Connect';
  }
  return 'เชื่อม Apple Health ได้เมื่อติดตั้งแอpp บน iPhone/Android — หรือบันทึกด้วยตัวเองด้านล่าง';
}

function formatMetricValue(dataType, value) {
  const numeric = Number(value) || 0;
  if (dataType === 'distance') return Number((numeric / 1000).toFixed(2));
  if (dataType === 'calories') return Math.round(numeric);
  if (dataType === 'heartRate' || dataType === 'restingHeartRate') return Math.round(numeric);
  return Math.round(numeric);
}

export async function connectAppleHealth() {
  const runtime = await getHealthRuntime();
  if (runtime.mode !== 'native') {
    return {
      success: false,
      mode: runtime.mode,
      message: getAppleHealthAvailabilityMessage(runtime.mode),
    };
  }

  await runtime.Health.requestAuthorization({ read: HEALTH_READ_TYPES });
  return {
    success: true,
    mode: 'native',
    platform: runtime.platform,
  };
}

export async function syncAppleHealthMetrics() {
  const runtime = await getHealthRuntime();
  if (runtime.mode !== 'native') {
    throw new Error(getAppleHealthAvailabilityMessage(runtime.mode));
  }

  const endDate = new Date().toISOString();
  const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const summary = {};
  const entries = [];

  for (const dataType of HEALTH_READ_TYPES) {
    try {
      let value = 0;

      if (dataType === 'heartRate' || dataType === 'restingHeartRate') {
        const { samples } = await runtime.Health.queryAggregated({
          dataType,
          startDate,
          endDate,
          bucket: 'day',
          aggregation: 'average',
        });
        value = samples?.[samples.length - 1]?.value ?? samples?.[0]?.value ?? 0;
      } else {
        const { samples } = await runtime.Health.queryAggregated({
          dataType,
          startDate,
          endDate,
          bucket: 'day',
          aggregation: 'sum',
        });
        value = samples?.reduce((sum, sample) => sum + (Number(sample.value) || 0), 0) ?? 0;
      }

      const formatted = formatMetricValue(dataType, value);
      if (formatted <= 0 && dataType !== 'steps') continue;

      const meta = METRIC_LABELS[dataType];
      summary[dataType] = formatted;
      entries.push({
        dataType: meta.label,
        value: formatted,
        unit: meta.unit,
        rawType: dataType,
        source: 'apple-health',
      });
    } catch (error) {
      console.warn(`Apple Health sync skipped for ${dataType}`, error);
    }
  }

  return {
    summary,
    entries,
    syncedAt: new Date().toISOString(),
    platform: runtime.platform,
  };
}

export function buildAppleHealthSummaryCards(summary = {}) {
  return [
    { key: 'calories', label: 'เคลื่อนไหว', value: summary.calories ?? '—', unit: 'แคล' },
    { key: 'steps', label: 'ก้าวเดิน', value: summary.steps ?? '—', unit: 'ก้าว' },
    { key: 'distance', label: 'ระยะทาง', value: summary.distance ?? '—', unit: 'กม.' },
    { key: 'heartRate', label: 'ชีพจร', value: summary.heartRate ?? '—', unit: 'bpm' },
  ];
}
