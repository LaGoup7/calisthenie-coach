const crypto = require('crypto');
const {
  json, readJson, safeId, safeSecret, hash, redisCommand,
  getDevice, deleteDevice, deleteSchedule, cancelMessage, authDevice,
} = require('./push-core');

const ACCOUNT_PREFIX = 'kinetik:account:';
const PAIR_PREFIX = 'kinetik:account:pair:';
const PUSH_LINK_PREFIX = 'kinetik:account:push:';
const REVOKED_PUSH_PREFIX = 'kinetik:account:revoked-push:';
const ACCOUNT_TTL = 60 * 60 * 24 * 365 * 2;
const PAIR_TTL = 10 * 60;
const MAX_DEVICES = 8;

function randomToken(bytes = 18) {
  return crypto.randomBytes(bytes).toString('base64url');
}
function randomAccountId() { return `acc_${randomToken(18)}`; }
function normalizePairCode(value) { return String(value || '').toUpperCase().replace(/[^A-Z2-9]/g, '').slice(0, 8); }
function randomPairCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 8; i++) out += alphabet[crypto.randomInt(0, alphabet.length)];
  return out;
}
function displayPairCode(code) { const c = normalizePairCode(code); return c.length === 8 ? `${c.slice(0,4)}-${c.slice(4)}` : c; }
function safeAccountId(value) {
  const id = String(value || '');
  return /^acc_[A-Za-z0-9_-]{20,80}$/.test(id) ? id : null;
}
function safeDeviceId(value) { return safeId(value); }
function accountKey(id) { return ACCOUNT_PREFIX + id; }
function pairKey(code) { return PAIR_PREFIX + normalizePairCode(code); }
function pushLinkKey(id) { return PUSH_LINK_PREFIX + id; }
function revokedPushKey(id) { return REVOKED_PUSH_PREFIX + id; }
function nowIso() { return new Date().toISOString(); }

function sanitizeMeta(input) {
  const platform = ['ios','android','windows','macos','linux','other'].includes(String(input?.platform || '')) ? String(input.platform) : 'other';
  const label = String(input?.label || 'Cet appareil').trim().replace(/\s+/g, ' ').slice(0,48) || 'Cet appareil';
  const appVersion = String(input?.appVersion || '').slice(0,24);
  return { label, platform, standalone: !!input?.standalone, appVersion };
}
function publicMember(deviceId, member, currentDeviceId) {
  return {
    deviceId,
    deviceIdSuffix: String(deviceId).slice(-8),
    current: deviceId === currentDeviceId,
    label: member.label || 'Cet appareil',
    platform: member.platform || 'other',
    standalone: !!member.standalone,
    appVersion: member.appVersion || null,
    joinedAt: member.joinedAt || null,
    lastSeenAt: member.lastSeenAt || null,
    notificationsMuted: !!member.notificationsMuted,
    pushLinked: !!member.pushInstallationId,
    pushInstallationSuffix: member.pushInstallationId ? String(member.pushInstallationId).slice(-8) : null,
  };
}
async function readAccount(accountId) {
  const id = safeAccountId(accountId); if (!id) return null;
  const raw = await redisCommand(['GET', accountKey(id)]);
  if (!raw) return null;
  try { return typeof raw === 'string' ? JSON.parse(raw) : raw; } catch (_) { return null; }
}
async function writeAccount(account) {
  account.updatedAt = nowIso();
  await redisCommand(['SET', accountKey(account.accountId), JSON.stringify(account), 'EX', ACCOUNT_TTL]);
  return account;
}
async function deleteAccount(accountId) { await redisCommand(['DEL', accountKey(accountId)]); }
function authMember(account, deviceId, deviceSecret) {
  const member = account?.members?.[deviceId],secret=safeSecret(deviceSecret);
  if(!member||member.revokedAt||!secret)return false;
  try{const a=Buffer.from(String(member.secretHash||''),'hex'),b=Buffer.from(hash(secret),'hex');return a.length===b.length&&a.length>0&&crypto.timingSafeEqual(a,b);}catch(_){return false;}
}
async function allowAccountAction(req, bucket, limit) {
  const forwarded = String(req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown').split(',')[0].trim();
  const key = `kinetik:account:rate:${bucket}:` + hash(forwarded + '|' + String(process.env.PUSH_DELIVERY_SECRET || '')).slice(0,32);
  const count = Number(await redisCommand(['INCR', key]) || 0);
  if (count === 1) await redisCommand(['EXPIRE', key, 86400]);
  return count <= limit;
}

async function validatedPushInstallation(body) {
  const id=safeId(body.pushInstallationId), secret=safeSecret(body.pushDeviceSecret);
  if(!id||!secret)return null;
  try{const device=await getDevice(id);return device&&authDevice(device,secret)?id:null;}catch(_){return null;}
}

async function setPushLink(accountId, deviceId, previousPushId, pushInstallationId) {
  const next = safeId(pushInstallationId);
  if (previousPushId && previousPushId !== next) await redisCommand(['DEL', pushLinkKey(previousPushId)]);
  if (next) {
    await redisCommand(['SET', pushLinkKey(next), JSON.stringify({accountId,deviceId}), 'EX', ACCOUNT_TTL]);
    await redisCommand(['DEL', revokedPushKey(next)]);
  }
}
async function cleanupPushInstallation(pushInstallationId, markRevoked = false) {
  const id = safeId(pushInstallationId); if (!id) return;
  try {
    const device = await getDevice(id);
    if (device) {
      await Promise.allSettled([
        deleteSchedule(device.schedules?.primaryId),
        deleteSchedule(device.schedules?.followupId),
        cancelMessage(device.snooze?.messageId),
      ]);
      await deleteDevice(id);
    }
  } catch (_) {}
  await redisCommand(['DEL', pushLinkKey(id)]);
  if (markRevoked) await redisCommand(['SET', revokedPushKey(id), '1', 'EX', ACCOUNT_TTL]);
}
async function isPushMuted(pushInstallationId) {
  const id = safeId(pushInstallationId); if (!id) return false;
  const raw = await redisCommand(['GET', pushLinkKey(id)]); if (!raw) return false;
  let link = null; try { link = typeof raw === 'string' ? JSON.parse(raw) : raw; } catch (_) { return false; }
  const account = await readAccount(link.accountId); if (!account) return false;
  return !!account.members?.[link.deviceId]?.notificationsMuted;
}
async function isPushRevoked(pushInstallationId) {
  const id = safeId(pushInstallationId); if (!id) return false;
  return !!(await redisCommand(['GET', revokedPushKey(id)]));
}
async function syncCurrentMember(account, deviceId, body) {
  const member = account.members[deviceId];
  const meta = sanitizeMeta(body.device || {});
  const pushId = await validatedPushInstallation(body);
  const previousPush = member.pushInstallationId || null;
  Object.assign(member, meta, { lastSeenAt: nowIso(), pushInstallationId: pushId || null });
  await setPushLink(account.accountId, deviceId, previousPush, pushId);
  await writeAccount(account);
  return member;
}
async function createAccount(req, res, body) {
  if (!(await allowAccountAction(req, 'create', 8))) return json(res,429,{ok:false,error:'rate_limited'});
  const deviceId = safeDeviceId(body.deviceId), deviceSecret = safeSecret(body.deviceSecret);
  if (!deviceId || !deviceSecret) return json(res,400,{ok:false,error:'invalid_device'});
  const meta = sanitizeMeta(body.device || {}), accountId = randomAccountId(), createdAt = nowIso(), pushId = await validatedPushInstallation(body);
  const account = { version:1, accountId, createdAt, updatedAt:createdAt, members:{ [deviceId]:{ secretHash:hash(deviceSecret), ...meta, joinedAt:createdAt, lastSeenAt:createdAt, notificationsMuted:false, pushInstallationId:pushId || null } } };
  await writeAccount(account);
  await setPushLink(accountId, deviceId, null, pushId);
  return json(res,200,{ok:true,accountId,createdAt,memberCount:1});
}
async function joinAccount(req, res, body) {
  if (!(await allowAccountAction(req, 'join', 40))) return json(res,429,{ok:false,error:'rate_limited'});
  const code = normalizePairCode(body.pairCode), deviceId = safeDeviceId(body.deviceId), deviceSecret = safeSecret(body.deviceSecret);
  if (code.length !== 8 || !deviceId || !deviceSecret) return json(res,400,{ok:false,error:'invalid_pairing'});
  const raw = await redisCommand(['GETDEL', pairKey(code)]); if (!raw) return json(res,404,{ok:false,error:'pairing_code_invalid'});
  let pair = null; try { pair = typeof raw === 'string' ? JSON.parse(raw) : raw; } catch (_) {}
  const account = pair?.accountId ? await readAccount(pair.accountId) : null; if (!account) return json(res,404,{ok:false,error:'account_not_found'});
  const activeMembers = Object.values(account.members || {}).filter(m => !m.revokedAt);
  if (activeMembers.length >= MAX_DEVICES) return json(res,409,{ok:false,error:'device_limit_reached'});
  const meta = sanitizeMeta(body.device || {}), joinedAt = nowIso(), pushId = await validatedPushInstallation(body);
  account.members[deviceId] = { secretHash:hash(deviceSecret), ...meta, joinedAt, lastSeenAt:joinedAt, notificationsMuted:false, pushInstallationId:pushId || null };
  await writeAccount(account);
  await setPushLink(account.accountId, deviceId, null, pushId);
  return json(res,200,{ok:true,accountId:account.accountId,joinedAt,memberCount:Object.keys(account.members).length});
}
async function authenticatedAccount(body) {
  const accountId = safeAccountId(body.accountId), deviceId = safeDeviceId(body.deviceId), deviceSecret = safeSecret(body.deviceSecret);
  if (!accountId || !deviceId || !deviceSecret) return {error:'invalid_account_identity'};
  const account = await readAccount(accountId); if (!account) return {error:'account_not_found'};
  if (!authMember(account, deviceId, deviceSecret)) return {error:'member_auth_failed'};
  return {account,accountId,deviceId,deviceSecret};
}
async function handleAuthenticated(req, res, body) {
  const auth = await authenticatedAccount(body);
  if (auth.error) return json(res, auth.error === 'account_not_found' ? 404 : 403, {ok:false,error:auth.error});
  const {account,deviceId} = auth;
  await syncCurrentMember(account, deviceId, body);
  const action = String(body.action || 'status');
  if (action === 'status') {
    const members = Object.entries(account.members || {}).filter(([,m])=>!m.revokedAt).map(([id,m])=>publicMember(id,m,deviceId)).sort((a,b)=>Number(b.current)-Number(a.current)||String(a.label).localeCompare(String(b.label)));
    return json(res,200,{ok:true,accountId:account.accountId,accountSuffix:account.accountId.slice(-8),createdAt:account.createdAt,members,maxDevices:MAX_DEVICES,serverNow:nowIso()});
  }
  if (action === 'pair') {
    let code = null;
    for (let i=0;i<6;i++) {
      const candidate=randomPairCode(), result=await redisCommand(['SET',pairKey(candidate),JSON.stringify({accountId:account.accountId,createdBy:deviceId,createdAt:nowIso()}),'NX','EX',PAIR_TTL]);
      if(result==='OK'){code=candidate;break;}
    }
    if(!code)return json(res,500,{ok:false,error:'pairing_code_failed'});
    return json(res,200,{ok:true,pairCode:displayPairCode(code),expiresAt:new Date(Date.now()+PAIR_TTL*1000).toISOString()});
  }
  if (action === 'rename') {
    const label = sanitizeMeta({...(account.members[deviceId]||{}),label:body.label}).label;
    account.members[deviceId].label = label; account.members[deviceId].lastSeenAt = nowIso(); await writeAccount(account);
    return json(res,200,{ok:true,label});
  }
  if (action === 'mute') {
    const targetId=safeDeviceId(body.targetDeviceId); if(!targetId||!account.members[targetId]||account.members[targetId].revokedAt)return json(res,404,{ok:false,error:'device_not_found'});
    account.members[targetId].notificationsMuted=!!body.muted; await writeAccount(account);
    return json(res,200,{ok:true,targetDeviceId:targetId,muted:!!body.muted});
  }
  if (action === 'revoke') {
    const targetId=safeDeviceId(body.targetDeviceId); if(!targetId||targetId===deviceId)return json(res,400,{ok:false,error:'invalid_revoke_target'});
    const target=account.members[targetId]; if(!target||target.revokedAt)return json(res,404,{ok:false,error:'device_not_found'});
    target.revokedAt=nowIso(); target.revokedBy=deviceId; await writeAccount(account);
    if(target.pushInstallationId)await cleanupPushInstallation(target.pushInstallationId,true);
    return json(res,200,{ok:true,revoked:true,targetDeviceId:targetId});
  }
  if (action === 'leave') {
    const self=account.members[deviceId], pushId=self?.pushInstallationId||null;
    if(pushId)await redisCommand(['DEL',pushLinkKey(pushId)]);
    delete account.members[deviceId];
    const remaining=Object.values(account.members||{}).filter(m=>!m.revokedAt);
    if(!remaining.length)await deleteAccount(account.accountId); else await writeAccount(account);
    return json(res,200,{ok:true,left:true,accountDeleted:!remaining.length});
  }
  return json(res,400,{ok:false,error:'unknown_account_action'});
}
async function handleAccountRequest(req,res) {
  if(req.method!=='POST')return json(res,405,{ok:false,error:'method_not_allowed'});
  try {
    const body=await readJson(req),action=String(body.action||'status');
    if(action==='create')return createAccount(req,res,body);
    if(action==='join')return joinAccount(req,res,body);
    return handleAuthenticated(req,res,body);
  } catch(error) {
    console.error('[KINETIK account]',error);
    return json(res,500,{ok:false,error:'account_failed'});
  }
}

module.exports = {
  handleAccountRequest, isPushMuted, isPushRevoked,
  readAccount, safeAccountId, normalizePairCode, displayPairCode,
};
