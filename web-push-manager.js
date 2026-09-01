/* ========================================================================== */
/* KINETIK v10.125 · Reliable Web Push Manager                               */
/* P2: standards-based Push API subscription + server-side scheduling.       */
/* ========================================================================== */
(function(global){
  'use strict';
  const VERSION='1.0.0';
  const STATE_KEY='cc_web_push_device_v1';
  const MANIFEST_DAYS=60;
  const SYNC_DEBOUNCE_MS=1200;
  const MIN_BACKGROUND_SYNC_MS=5*60*1000;
  let config={loaded:false,configured:false,publicKey:null,error:null};
  let syncTimer=null,syncing=false,lastSyncError=null;

  function parseState(){
    try{const raw=JSON.parse(global.localStorage?.getItem(STATE_KEY)||'{}');return raw&&typeof raw==='object'?raw:{};}catch(_){return{};}
  }
  function saveState(patch){
    const next={...parseState(),...(patch||{}),version:1};
    try{global.localStorage?.setItem(STATE_KEY,JSON.stringify(next));}catch(_){}
    return next;
  }
  function randomBase64Url(bytes=32){
    const arr=new Uint8Array(bytes);global.crypto?.getRandomValues?.(arr);
    let bin='';for(const byte of arr)bin+=String.fromCharCode(byte);
    return btoa(bin).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  }
  function ensureIdentity(){
    const current=parseState();
    const installationId=current.installationId||global.crypto?.randomUUID?.().replace(/-/g,'_')||('dev_'+randomBase64Url(18));
    const deviceSecret=current.deviceSecret||randomBase64Url(36);
    if(installationId!==current.installationId||deviceSecret!==current.deviceSecret)saveState({installationId,deviceSecret});
    return {installationId,deviceSecret};
  }
  function timezone(){try{return Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC';}catch(_){return'UTC';}}
  function base64ToUint8Array(value){
    const padding='='.repeat((4-value.length%4)%4),base64=(value+padding).replace(/-/g,'+').replace(/_/g,'/');
    const raw=atob(base64),out=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)out[i]=raw.charCodeAt(i);return out;
  }
  function capability(){
    const local=global.KinetikLocalReminders?.getCapability?.()||{};
    const pushSupported=!!global.navigator?.serviceWorker&&typeof global.PushManager!=='undefined';
    return {...local,pushSupported,supported:!!local.supported&&pushSupported,reason:!pushSupported?'push-api-unsupported':local.reason||null};
  }
  async function api(path,options={}){
    const response=await global.fetch(path,{...options,headers:{'Content-Type':'application/json',...(options.headers||{})}});
    const data=await response.json().catch(()=>({}));
    if(!response.ok||data.ok===false)throw Object.assign(new Error(data.error||`HTTP ${response.status}`),{status:response.status,data});
    return data;
  }
  async function loadConfig(force=false){
    if(config.loaded&&!force)return config;
    try{const data=await api('/api/push/public-key',{method:'GET',headers:{}});config={loaded:true,configured:!!data.configured,publicKey:data.publicKey||null,error:null};}
    catch(error){config={loaded:true,configured:false,publicKey:null,error:error.message||'configuration_unavailable'};}
    try{global.render?.();}catch(_){}
    return config;
  }
  function prefs(){try{return global.getReminderPrefs?.()||{};}catch(_){return{};}}
  function contentFor(tasks,reason,p){
    const detailed=p.notificationDetail==='detailed',count=tasks.length;
    if(reason==='workout-followup'){
      const workout=tasks.find(task=>task.kind==='workout');
      return {title:'KINETIK · séance encore à faire',body:detailed&&workout?workout.title:'Ta séance est encore à faire dans KINETIK.',count:1,taskId:detailed?(workout?.id||null):null};
    }
    const title=count===1?'KINETIK · 1 priorité':`KINETIK · ${count} priorités`;
    const body=detailed?tasks.slice(0,3).map(task=>task.title).join(' · ')+(count>3?` · +${count-3}`:''):(count===1?'Une priorité t’attend dans ton parcours du jour.':`${count} priorités t’attendent dans ton parcours du jour.`);
    return {title,body,count,taskId:detailed&&count===1?tasks[0].id:null};
  }
  function dateAtOffset(now,offset){const d=new Date(now);d.setHours(12,0,0,0);d.setDate(d.getDate()+offset);return d;}
  function buildManifest(now=new Date(),days=MANIFEST_DAYS){
    const engine=global.KinetikDailyTasks,p=prefs(),out={generatedAt:new Date().toISOString(),days:{}};
    if(!engine?.getAgendaTasks||p.enabled===false)return out;
    for(let i=0;i<days;i++){
      const date=dateAtOffset(now,i),key=engine.dateKey?engine.dateKey(date):date.toISOString().slice(0,10);
      let tasks=[];try{tasks=engine.getAgendaTasks({now:date,includeDone:true}).filter(task=>task.status==='pending'||task.status==='blocked');}catch(_){tasks=[];}
      if(!tasks.length)continue;
      const primary=contentFor(tasks,'primary',p),day={primary};
      if(p.workoutFollowup!==false&&tasks.some(task=>task.kind==='workout'))day['workout-followup']=contentFor(tasks.filter(task=>task.kind==='workout'),'workout-followup',p);
      out.days[key]=day;
    }
    return out;
  }
  async function currentSubscription(){
    try{const registration=await global.navigator?.serviceWorker?.ready;return await registration?.pushManager?.getSubscription?.()||null;}catch(_){return null;}
  }
  function status(){
    const state=parseState(),cap=capability(),active=!!(state.enabled&&state.subscribed&&cap.permission==='granted'&&config.configured);
    return {version:VERSION,configured:config.configured,configLoaded:config.loaded,configError:config.error,enabled:!!state.enabled,subscribed:!!state.subscribed,active,permission:cap.permission||'default',supported:cap.supported,requiresInstall:!!cap.requiresInstall,reason:cap.reason,lastSyncAt:state.lastSyncAt||null,lastManifestDays:Number(state.lastManifestDays||0),timezone:state.timezone||timezone(),lastError:lastSyncError||state.lastError||null};
  }
  function fingerprint(value){const text=JSON.stringify(value),len=text.length;let h=2166136261;for(let i=0;i<len;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0).toString(16)+':'+len;}
  async function sync(options={}){
    if(syncing)return false;
    const state=parseState(),cap=capability();
    if(!state.enabled||cap.permission!=='granted')return false;
    const cfg=await loadConfig();if(!cfg.configured||!cfg.publicKey)return false;
    const subscription=await currentSubscription();if(!subscription){saveState({subscribed:false,lastError:'subscription_missing'});return false;}
    syncing=true;
    try{
      const id=ensureIdentity(),p=prefs(),manifest=buildManifest(new Date(),MANIFEST_DAYS),localStatus=global.KinetikLocalReminders?.getStatus?.()||{};
      const payload={...id,subscription:subscription.toJSON?subscription.toJSON():subscription,timezone:timezone(),prefs:{preferredTime:p.preferredTime||'08:00',notificationDetail:p.notificationDetail||'discreet',workoutFollowup:p.workoutFollowup!==false,workoutFollowupDelay:p.workoutFollowupDelay||120},manifest,snoozeAt:localStatus.snoozedUntil||null,snoozeDate:localStatus.snoozedUntil?(global.KinetikDailyTasks?.dateKey?.(new Date())||null):null};
      const fp=fingerprint({timezone:payload.timezone,prefs:payload.prefs,days:manifest.days,snoozeAt:payload.snoozeAt,snoozeDate:payload.snoozeDate,endpoint:payload.subscription?.endpoint});
      const previous=parseState(),age=previous.lastSyncAt?Date.now()-new Date(previous.lastSyncAt).getTime():Infinity;
      if(!options.force&&previous.lastFingerprint===fp&&age<6*60*60*1000)return true;
      const data=await api('/api/push/sync',{method:'POST',body:JSON.stringify(payload)});
      lastSyncError=null;saveState({enabled:true,subscribed:true,lastSyncAt:data.syncedAt||new Date().toISOString(),lastManifestDays:data.manifestDays||0,timezone:data.timezone||timezone(),lastFingerprint:fp,lastError:null});
      try{global.KinetikLocalReminders?.refresh?.();}catch(_){}
      if(options.render!==false)try{global.render?.();}catch(_){}
      return true;
    }catch(error){lastSyncError=error.message||'sync_failed';saveState({lastError:lastSyncError});if(options.render!==false)try{global.render?.();}catch(_){}return false;}
    finally{syncing=false;}
  }
  function scheduleSync(force=false){
    if(syncTimer)clearTimeout(syncTimer);
    syncTimer=setTimeout(()=>sync({force,render:false}),force?0:SYNC_DEBOUNCE_MS);
  }
  async function activate(){
    const cfg=await loadConfig(true);if(!cfg.configured||!cfg.publicKey)return false;
    const cap=capability();if(!cap.supported)return false;
    let permission=global.Notification?.permission||'default';
    if(permission==='default')permission=await global.Notification.requestPermission();
    if(permission!=='granted')return false;
    const registration=await global.navigator.serviceWorker.ready;
    let subscription=await registration.pushManager.getSubscription();
    if(!subscription)subscription=await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:base64ToUint8Array(cfg.publicKey)});
    ensureIdentity();saveState({enabled:true,subscribed:!!subscription,lastError:null});
    const ok=await sync({render:false});try{global.render?.();}catch(_){}return ok;
  }
  async function disable(options={}){
    const state=parseState(),id={installationId:state.installationId,deviceSecret:state.deviceSecret};
    try{if(id.installationId&&id.deviceSecret)await api('/api/push/unsubscribe',{method:'POST',body:JSON.stringify(id)});}catch(_){}
    if(options.unsubscribeBrowser!==false){try{const sub=await currentSubscription();await sub?.unsubscribe?.();}catch(_){}}
    saveState({enabled:false,subscribed:false,lastSyncAt:null,lastManifestDays:0,lastFingerprint:null,lastError:null});
    try{global.KinetikLocalReminders?.refresh?.();}catch(_){}
    if(options.render!==false)try{global.render?.();}catch(_){}
    return true;
  }
  async function test(){
    const state=parseState();if(!state.installationId||!state.deviceSecret||!status().active)return false;
    try{await api('/api/push/test',{method:'POST',body:JSON.stringify({installationId:state.installationId,deviceSecret:state.deviceSecret})});return true;}catch(error){lastSyncError=error.message;return false;}
  }
  async function refresh(){
    await loadConfig();
    const state=parseState(),sub=await currentSubscription();
    if(state.enabled&&!sub){saveState({subscribed:false,lastError:'subscription_missing'});}
    else if(state.enabled&&sub&&global.Notification?.permission==='granted'){
      if(!state.subscribed)saveState({subscribed:true,lastError:null});
      const age=state.lastSyncAt?Date.now()-new Date(state.lastSyncAt).getTime():Infinity;
      if(age>MIN_BACKGROUND_SYNC_MS)scheduleSync(true);
    }
    try{global.render?.();}catch(_){}
  }
  function clearLocalState(){try{global.localStorage?.removeItem(STATE_KEY);}catch(_){} }

  const apiPublic={version:VERSION,stateKey:STATE_KEY,getStatus:status,getCapability:capability,loadConfig,activate,disable,sync,scheduleSync,test,buildManifest,refresh,clearLocalState};
  global.KinetikWebPush=apiPublic;

  // Most KINETIK mutations end with render(). Debounce a manifest sync after those renders.
  try{
    const originalRender=global.render;
    if(typeof originalRender==='function')global.render=function(){const result=originalRender.apply(this,arguments);if(parseState().enabled)scheduleSync(false);return result;};
  }catch(_){}
  try{global.addEventListener?.('focus',refresh);}catch(_){}
  try{global.addEventListener?.('pageshow',refresh);}catch(_){}
  try{global.document?.addEventListener?.('visibilitychange',()=>{if(global.document.visibilityState==='visible')refresh();});}catch(_){}
  ensureIdentity();refresh();
  console.info(`[KINETIK] Reliable Web Push Manager v${VERSION} ready`);
})(window);
