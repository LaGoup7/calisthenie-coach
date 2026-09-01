const crypto = require('crypto');

const DEVICE_PREFIX = 'kinetik:push:device:';
const SENT_PREFIX = 'kinetik:push:sent:';
const DEVICE_TTL_SECONDS = 60 * 60 * 24 * 120;

function envReady() {
  const required = ['VAPID_PUBLIC_KEY','VAPID_PRIVATE_KEY','VAPID_SUBJECT','UPSTASH_REDIS_REST_URL','UPSTASH_REDIS_REST_TOKEN','QSTASH_TOKEN','PUSH_DELIVERY_SECRET'];
  return { ready: required.every(key => !!process.env[key]), missing: required.filter(key => !process.env[key]) };
}

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.setHeader('Cache-Control','no-store');
  res.end(JSON.stringify(body));
}

async function readJson(req, maxBytes = 300000) {
  if (req.body && typeof req.body === 'object') return req.body;
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (Buffer.byteLength(raw) > maxBytes) throw Object.assign(new Error('Payload too large'), { statusCode:413 });
  }
  if (!raw) return {};
  try { return JSON.parse(raw); }
  catch (_) { throw Object.assign(new Error('Invalid JSON'), { statusCode:400 }); }
}

function safeId(value) {
  const id = String(value || '');
  return /^[A-Za-z0-9_-]{16,128}$/.test(id) ? id : null;
}

function safeSecret(value) {
  const secret = String(value || '');
  return /^[A-Za-z0-9_-]{32,160}$/.test(secret) ? secret : null;
}

function hash(value) {
  return crypto.createHash('sha256').update(String(value || '')).digest('hex');
}

function sameHash(a,b) {
  try {
    const aa = Buffer.from(String(a || ''), 'hex');
    const bb = Buffer.from(String(b || ''), 'hex');
    return aa.length === bb.length && aa.length > 0 && crypto.timingSafeEqual(aa,bb);
  } catch (_) { return false; }
}

function deviceKey(id) { return DEVICE_PREFIX + id; }
function sentKey(id,date,reason) { return SENT_PREFIX + id + ':' + date + ':' + reason; }

function validateTimezone(value) {
  const timezone = String(value || 'UTC').slice(0,100);
  try { new Intl.DateTimeFormat('en-US',{timeZone:timezone}).format(new Date()); return timezone; }
  catch (_) { return 'UTC'; }
}

function dateKeyInTimezone(date, timezone) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone:validateTimezone(timezone), year:'numeric', month:'2-digit', day:'2-digit' }).formatToParts(date);
  const map = Object.fromEntries(parts.map(x => [x.type,x.value]));
  return `${map.year}-${map.month}-${map.day}`;
}

function normalizeTime(value, fallback='08:00') {
  const match = String(value || '').match(/^(\d{2}):(\d{2})$/);
  if (!match) return fallback;
  const h = Number(match[1]), m = Number(match[2]);
  if (h < 0 || h > 23 || m < 0 || m > 59) return fallback;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
}

function followupTime(prefs) {
  if (prefs?.workoutFollowup === false) return null;
  const base = normalizeTime(prefs?.preferredTime, '08:00');
  const [h,m] = base.split(':').map(Number);
  const delay = [60,120,180,240].includes(Number(prefs?.workoutFollowupDelay)) ? Number(prefs.workoutFollowupDelay) : 120;
  const total = Math.max(18*60, h*60+m+delay);
  if (total > 21*60+30) return null;
  return `${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`;
}

function cronAt(time, timezone) {
  const [h,m] = normalizeTime(time).split(':').map(Number);
  return `CRON_TZ=${validateTimezone(timezone)} ${m} ${h} * * *`;
}

function deterministicScheduleId(installationId, reason) {
  return `kinetik-${hash(installationId).slice(0,24)}-${reason}`;
}

function validateSubscription(input) {
  if (!input || typeof input !== 'object') return null;
  const endpoint = String(input.endpoint || '');
  const p256dh = String(input.keys?.p256dh || '');
  const auth = String(input.keys?.auth || '');
  if (!endpoint.startsWith('https://') || endpoint.length > 4096 || !p256dh || !auth) return null;
  return { endpoint, expirationTime: input.expirationTime ?? null, keys:{ p256dh, auth } };
}

function sanitizeManifest(input) {
  const rawDays = input?.days && typeof input.days === 'object' ? input.days : {};
  const days = {};
  Object.entries(rawDays).slice(0,120).forEach(([date, value]) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !value || typeof value !== 'object') return;
    const clean = {};
    ['primary','workout-followup'].forEach(reason => {
      const item = value[reason];
      if (!item || typeof item !== 'object') return;
      const count = Math.max(1, Math.min(99, Number(item.count || 1)));
      clean[reason] = {
        count,
        taskId: item.taskId ? String(item.taskId).slice(0,220) : null,
        title: String(item.title || 'KINETIK').slice(0,100),
        body: String(item.body || `${count} priorité${count>1?'s':''} t’attendent dans KINETIK.`).slice(0,240),
      };
    });
    if (Object.keys(clean).length) days[date] = clean;
  });
  return { generatedAt:String(input?.generatedAt || new Date().toISOString()).slice(0,40), days };
}


function sanitizeDeviceMeta(input) {
  const platform = ['ios','android','windows','macos','linux','other'].includes(String(input?.platform||'')) ? String(input.platform) : 'other';
  const label = String(input?.label || 'Cet appareil').trim().replace(/\s+/g,' ').slice(0,48) || 'Cet appareil';
  return { label, platform, standalone: !!input?.standalone, appVersion: String(input?.appVersion || '').slice(0,24) };
}

function deliveryErrorCode(error) {
  const status = Number(error?.statusCode || error?.status || 0);
  if (status === 404 || status === 410) return 'subscription_expired';
  if (status === 401 || status === 403) return 'push_auth_failed';
  if (status === 429) return 'push_rate_limited';
  if (status >= 500) return 'push_service_unavailable';
  const raw = String(error?.message || 'delivery_failed').toLowerCase();
  if (/timeout|timed out/.test(raw)) return 'push_timeout';
  if (/network|fetch|socket|econn/.test(raw)) return 'push_network_error';
  return 'delivery_failed';
}

function healthSnapshot(device) {
  const health = device?.health || {};
  return {
    lastClientSyncAt: health.lastClientSyncAt || null,
    lastDeliveryAcceptedAt: health.lastDeliveryAcceptedAt || null,
    lastDeliveryReason: health.lastDeliveryReason || null,
    lastDeliveryDate: health.lastDeliveryDate || null,
    lastTestAcceptedAt: health.lastTestAcceptedAt || null,
    lastDeliveryErrorAt: health.lastDeliveryErrorAt || null,
    lastDeliveryError: health.lastDeliveryError || null,
    consecutiveFailures: Math.max(0, Number(health.consecutiveFailures || 0)),
  };
}

function withHealth(device, patch) {
  return { ...device, health: { ...healthSnapshot(device), ...(patch || {}) }, updatedAt: new Date().toISOString() };
}

function canonicalOrigin(req) {
  const configured = String(process.env.PUBLIC_APP_URL || '').replace(/\/$/,'');
  if (configured.startsWith('https://')) return configured;
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || '');
  if (!host || /localhost|127\.0\.0\.1/.test(host)) return null;
  const proto = String(req.headers['x-forwarded-proto'] || 'https').split(',')[0].trim();
  return `${proto}://${host}`.replace(/\/$/,'');
}

async function redisCommand(command) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error('Redis not configured');
  const response = await fetch(url, {
    method:'POST',
    headers:{ Authorization:`Bearer ${token}`, 'Content-Type':'application/json' },
    body:JSON.stringify(command),
  });
  const data = await response.json().catch(()=>({}));
  if (!response.ok || data.error) throw new Error(data.error || `Redis ${response.status}`);
  return data.result;
}

async function getDevice(id) {
  const raw = await redisCommand(['GET',deviceKey(id)]);
  if (!raw) return null;
  try { return typeof raw === 'string' ? JSON.parse(raw) : raw; }
  catch (_) { return null; }
}

async function putDevice(device) {
  await redisCommand(['SET',deviceKey(device.installationId),JSON.stringify(device),'EX',DEVICE_TTL_SECONDS]);
  return device;
}

async function deleteDevice(id) { await redisCommand(['DEL',deviceKey(id)]); }

async function claimDelivery(id,date,reason) {
  const result = await redisCommand(['SET',sentKey(id,date,reason),String(Date.now()),'NX','EX',60*60*72]);
  return result === 'OK';
}

async function releaseDelivery(id,date,reason) { await redisCommand(['DEL',sentKey(id,date,reason)]); }

async function qstashRequest(path, options={}) {
  const token = process.env.QSTASH_TOKEN;
  if (!token) throw new Error('QStash not configured');
  const base = String(process.env.QSTASH_URL || 'https://qstash.upstash.io').replace(/\/$/,'');
  const response = await fetch(base + path, {
    ...options,
    headers:{ Authorization:`Bearer ${token}`, ...(options.headers || {}) },
  });
  const text = await response.text();
  let data = {}; try { data = text ? JSON.parse(text) : {}; } catch (_) { data = { raw:text }; }
  if (!response.ok) { const error=new Error(data.error || data.message || `QStash ${response.status}`); error.status=response.status; throw error; }
  return data;
}

async function upsertSchedule({scheduleId,destination,cron,body}) {
  return qstashRequest(`/v2/schedules/${encodeURIComponent(destination)}`, {
    method:'POST',
    headers:{
      'Content-Type':'application/json',
      'Upstash-Cron':cron,
      'Upstash-Schedule-Id':scheduleId,
      'Upstash-Method':'POST',
      'Upstash-Retries':'2',
      'Upstash-Forward-Authorization':`Bearer ${process.env.PUSH_DELIVERY_SECRET}`,
    },
    body:JSON.stringify(body),
  });
}

async function deleteSchedule(scheduleId) {
  if (!scheduleId) return;
  try { await qstashRequest(`/v2/schedules/${encodeURIComponent(scheduleId)}`, { method:'DELETE' }); }
  catch (error) { if (Number(error.status)!==404 && !/404/.test(String(error.message))) throw error; }
}

async function publishOneOff({destination,notBefore,body,dedupId,label}) {
  return qstashRequest(`/v2/publish/${encodeURIComponent(destination)}`, {
    method:'POST',
    headers:{
      'Content-Type':'application/json',
      'Upstash-Method':'POST',
      'Upstash-Retries':'2',
      'Upstash-Not-Before':String(Math.floor(new Date(notBefore).getTime()/1000)),
      'Upstash-Deduplication-Id':dedupId,
      'Upstash-Label':label || 'kinetik-push',
      'Upstash-Forward-Authorization':`Bearer ${process.env.PUSH_DELIVERY_SECRET}`,
    },
    body:JSON.stringify(body),
  });
}

async function cancelMessage(messageId) {
  if (!messageId) return;
  try { await qstashRequest(`/v2/messages/${encodeURIComponent(messageId)}`, { method:'DELETE' }); }
  catch (error) { if (Number(error.status)!==404 && !/404/.test(String(error.message))) throw error; }
}


async function allowNewDevice(req) {
  const forwarded=String(req.headers['x-forwarded-for']||req.headers['x-real-ip']||'unknown').split(',')[0].trim();
  const key='kinetik:push:register:'+hash(forwarded+'|'+String(process.env.PUSH_DELIVERY_SECRET||'')).slice(0,32);
  const count=Number(await redisCommand(['INCR',key])||0);
  if(count===1) await redisCommand(['EXPIRE',key,86400]);
  return count<=20;
}

function authDevice(device, secret) {
  return !!(device && safeSecret(secret) && sameHash(device.secretHash, hash(secret)));
}

module.exports = {
  envReady,json,readJson,safeId,safeSecret,hash,deviceKey,validateTimezone,dateKeyInTimezone,
  normalizeTime,followupTime,cronAt,deterministicScheduleId,validateSubscription,sanitizeManifest,sanitizeDeviceMeta,
  deliveryErrorCode,healthSnapshot,withHealth,canonicalOrigin,redisCommand,getDevice,putDevice,deleteDevice,claimDelivery,releaseDelivery,upsertSchedule,
  deleteSchedule,publishOneOff,cancelMessage,allowNewDevice,authDevice
};
