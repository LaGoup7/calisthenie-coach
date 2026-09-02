/* KINETIK v10.146 · Account & multi-device manager (local-first identity only). */
(function(global){
  'use strict';
  const VERSION='1.0.0';
  const STATE_KEY='cc_kinetik_account_v1';
  const REFRESH_MS=10*60*1000;
  let loading=false, refreshTimer=null, pairState={code:null,expiresAt:null};

  function parseState(){try{const x=JSON.parse(global.localStorage?.getItem(STATE_KEY)||'{}');return x&&typeof x==='object'?x:{};}catch(_){return{};}}
  function saveState(patch){const next={...parseState(),...(patch||{}),version:1};try{global.localStorage?.setItem(STATE_KEY,JSON.stringify(next));}catch(_){}return next;}
  function randomBase64Url(bytes=32){const a=new Uint8Array(bytes);global.crypto?.getRandomValues?.(a);let s='';for(const b of a)s+=String.fromCharCode(b);return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
  function ensureIdentity(){const s=parseState(),deviceId=s.deviceId||global.crypto?.randomUUID?.().replace(/-/g,'_')||('acct_'+randomBase64Url(18)),deviceSecret=s.deviceSecret||randomBase64Url(36);if(deviceId!==s.deviceId||deviceSecret!==s.deviceSecret)saveState({deviceId,deviceSecret});return{deviceId,deviceSecret};}
  function detectPlatform(){const ua=String(global.navigator?.userAgent||'');if(/iPhone|iPad|iPod/i.test(ua)||(/Macintosh/i.test(ua)&&Number(global.navigator?.maxTouchPoints||0)>1))return'ios';if(/Android/i.test(ua))return'android';if(/Windows/i.test(ua))return'windows';if(/Macintosh|Mac OS X/i.test(ua))return'macos';if(/Linux/i.test(ua))return'linux';return'other';}
  function standalone(){try{return!!global.matchMedia?.('(display-mode: standalone)')?.matches||global.navigator?.standalone===true;}catch(_){return false;}}
  function defaultLabel(){const p=detectPlatform();return p==='ios'?'Mon iPhone / iPad':p==='android'?'Mon Android':p==='windows'?'Mon PC Windows':p==='macos'?'Mon Mac':p==='linux'?'Mon appareil Linux':'Cet appareil';}
  function label(){return String(parseState().label||defaultLabel()).trim().replace(/\s+/g,' ').slice(0,48)||defaultLabel();}
  function pushIdentity(){try{const p=JSON.parse(global.localStorage?.getItem('cc_web_push_device_v1')||'{}');return{installationId:p.installationId||null,deviceSecret:p.deviceSecret||null};}catch(_){return{installationId:null,deviceSecret:null};}}
  function deviceMeta(){return{label:label(),platform:detectPlatform(),standalone:standalone(),appVersion:'10.146'};}
  async function api(body){const r=await global.fetch('/api/account',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}),data=await r.json().catch(()=>({}));if(!r.ok||data.ok===false)throw Object.assign(new Error(data.error||`HTTP ${r.status}`),{status:r.status,data});return data;}
  function basePayload(action){const s=parseState(),id=ensureIdentity(),push=pushIdentity();return{action,...id,accountId:s.accountId||null,device:deviceMeta(),pushInstallationId:push.installationId,pushDeviceSecret:push.deviceSecret};}
  function normalizeCode(value){const c=String(value||'').toUpperCase().replace(/[^A-Z2-9]/g,'').slice(0,8);return c.length>4?`${c.slice(0,4)}-${c.slice(4)}`:c;}
  function linked(){return!!parseState().accountId;}
  function detachLocal({revoked=false}={}){const s=parseState();saveState({accountId:null,members:[],accountCreatedAt:null,lastSyncAt:null,lastError:revoked?'device_revoked':null,revokedAt:revoked?new Date().toISOString():null});pairState={code:null,expiresAt:null};return s;}
  async function refresh(options={}){
    if(loading||!linked())return false;const s=parseState(),age=s.lastSyncAt?Date.now()-new Date(s.lastSyncAt).getTime():Infinity;if(!options.force&&age<REFRESH_MS)return true;loading=true;
    try{const data=await api(basePayload('status'));saveState({accountId:data.accountId,members:data.members||[],accountCreatedAt:data.createdAt||s.accountCreatedAt||null,lastSyncAt:new Date().toISOString(),lastError:null,revokedAt:null,maxDevices:data.maxDevices||8});if(options.render!==false)try{global.render?.();}catch(_){}return true;}
    catch(error){const code=error.data?.error||error.message;if(['member_auth_failed','account_not_found'].includes(code)){detachLocal({revoked:code==='member_auth_failed'});if(code==='member_auth_failed')try{await global.KinetikWebPush?.disable?.({unsubscribeBrowser:true,render:false});}catch(_){} }else saveState({lastError:code||'account_unavailable'});if(options.render!==false)try{global.render?.();}catch(_){}return false;}
    finally{loading=false;}
  }
  function scheduleSync(force=false){if(refreshTimer)clearTimeout(refreshTimer);refreshTimer=setTimeout(()=>refresh({force,render:true}),force?0:700);}
  async function create(){if(loading)return false;loading=true;try{const data=await api(basePayload('create'));saveState({accountId:data.accountId,accountCreatedAt:data.createdAt||new Date().toISOString(),members:[],lastError:null,revokedAt:null});loading=false;await refresh({force:true});return true;}catch(error){saveState({lastError:error.data?.error||error.message||'account_create_failed'});return false;}finally{loading=false;try{global.render?.();}catch(_){}}}
  async function join(code){const normalized=normalizeCode(code);if(normalized.replace('-','').length!==8)return false;if(loading)return false;loading=true;try{const data=await api({...basePayload('join'),pairCode:normalized});saveState({accountId:data.accountId,accountCreatedAt:null,members:[],lastError:null,revokedAt:null});loading=false;await refresh({force:true});return true;}catch(error){saveState({lastError:error.data?.error||error.message||'pairing_failed'});return false;}finally{loading=false;try{global.render?.();}catch(_){}}}
  async function createPairCode(){if(!linked())return null;try{const data=await api(basePayload('pair'));pairState={code:data.pairCode||null,expiresAt:data.expiresAt||null};try{global.render?.();}catch(_){}return pairState.code;}catch(error){saveState({lastError:error.data?.error||error.message||'pairing_code_failed'});try{global.render?.();}catch(_){}return null;}}
  async function rename(value){if(!linked())return false;const clean=String(value||'').trim().replace(/\s+/g,' ').slice(0,48)||defaultLabel();try{const data=await api({...basePayload('rename'),label:clean});saveState({label:data.label||clean,lastError:null});try{await global.KinetikWebPush?.setDeviceLabel?.(data.label||clean);}catch(_){}await refresh({force:true});return true;}catch(error){saveState({lastError:error.data?.error||error.message||'rename_failed'});return false;}}
  async function setMuted(deviceId,muted){if(!linked())return false;try{await api({...basePayload('mute'),targetDeviceId:deviceId,muted:!!muted});await refresh({force:true});return true;}catch(error){saveState({lastError:error.data?.error||error.message||'mute_failed'});return false;}}
  async function revoke(deviceId){if(!linked())return false;try{await api({...basePayload('revoke'),targetDeviceId:deviceId});await refresh({force:true});return true;}catch(error){saveState({lastError:error.data?.error||error.message||'revoke_failed'});return false;}}
  async function leave(){if(!linked()){try{global.localStorage?.removeItem(STATE_KEY);}catch(_){}return true;}try{await api(basePayload('leave'));detachLocal();return true;}catch(error){saveState({lastError:error.data?.error||error.message||'leave_failed'});return false;}finally{try{global.render?.();}catch(_){}}}
  async function clearAll(){try{await leave();}catch(_){}try{global.localStorage?.removeItem(STATE_KEY);}catch(_){}pairState={code:null,expiresAt:null};}
  function getStatus(){const s=parseState(),members=Array.isArray(s.members)?s.members:[],current=members.find(x=>x.current)||null;return{version:VERSION,linked:!!s.accountId,accountId:s.accountId||null,accountSuffix:s.accountId?String(s.accountId).slice(-8):null,deviceId:s.deviceId||ensureIdentity().deviceId,deviceIdSuffix:String(s.deviceId||ensureIdentity().deviceId).slice(-8),deviceLabel:label(),platform:detectPlatform(),standalone:standalone(),members,current,memberCount:members.length,maxDevices:Number(s.maxDevices||8),loading,lastSyncAt:s.lastSyncAt||null,lastError:s.lastError||null,revokedAt:s.revokedAt||null,pairCode:pairState.code,pairExpiresAt:pairState.expiresAt};}

  const publicApi={version:VERSION,stateKey:STATE_KEY,getStatus,create,join,createPairCode,refresh,scheduleSync,rename,setMuted,revoke,leave,clearAll,normalizeCode,deviceMeta};
  global.KinetikAccount=publicApi;
  ensureIdentity();if(linked())refresh({force:true,render:false});
  try{global.addEventListener?.('focus',()=>refresh());global.addEventListener?.('pageshow',()=>refresh());global.document?.addEventListener?.('visibilitychange',()=>{if(global.document.visibilityState==='visible')refresh();});}catch(_){}
  console.info(`[KINETIK] Account Manager v${VERSION} ready`);
})(window);
