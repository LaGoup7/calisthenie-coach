/* ========================================================================== */
/* KINETIK v10.127 · Web Push Observability & Resilience Manager                         */
/* P2.1: subscription health, repair flow and per-installation metadata.      */
/* ========================================================================== */
(function(global){
  'use strict';
  const VERSION='1.3.0';
  const STATE_KEY='cc_web_push_device_v1';
  const MANIFEST_DAYS=60;
  const SYNC_DEBOUNCE_MS=1200;
  const MIN_BACKGROUND_SYNC_MS=5*60*1000;
  const HEALTH_CHECK_MS=30*60*1000;
  let config={loaded:false,configured:false,publicKey:null,error:null};
  let syncTimer=null,syncing=false,lastSyncError=null,healthChecking=false;

  function parseState(){
    try{const raw=JSON.parse(global.localStorage?.getItem(STATE_KEY)||'{}');return raw&&typeof raw==='object'?raw:{};}catch(_){return{};}
  }
  function saveState(patch){
    const next={...parseState(),...(patch||{}),version:2};
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
  function rotateIdentity(){
    const installationId=global.crypto?.randomUUID?.().replace(/-/g,'_')||('dev_'+randomBase64Url(18));
    const deviceSecret=randomBase64Url(36);
    saveState({installationId,deviceSecret,serverExists:false,lastFingerprint:null,lastSyncAt:null,lastHealthAt:null,serverHealth:null,serverInfo:null,repairReason:null});
    return {installationId,deviceSecret};
  }
  function timezone(){try{return Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC';}catch(_){return'UTC';}}
  function base64ToUint8Array(value){
    const padding='='.repeat((4-value.length%4)%4),base64=(value+padding).replace(/-/g,'+').replace(/_/g,'/');
    const raw=atob(base64),out=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)out[i]=raw.charCodeAt(i);return out;
  }
  function fingerprint(value){const text=JSON.stringify(value),len=text.length;let h=2166136261;for(let i=0;i<len;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0).toString(16)+':'+len;}
  function endpointFingerprint(endpoint){return endpoint?fingerprint(String(endpoint)):null;}
  function arraysEqual(a,b){if(!a||!b||a.length!==b.length)return false;for(let i=0;i<a.length;i++)if(a[i]!==b[i])return false;return true;}
  function subscriptionMatchesKey(subscription,publicKey){
    try{
      const existing=subscription?.options?.applicationServerKey;
      if(!existing||!publicKey)return true; // Some browsers do not expose the key.
      return arraysEqual(new Uint8Array(existing),base64ToUint8Array(publicKey));
    }catch(_){return true;}
  }
  function detectPlatform(){
    const ua=String(global.navigator?.userAgent||'');
    if(/iPhone|iPad|iPod/i.test(ua)||(/Macintosh/i.test(ua)&&Number(global.navigator?.maxTouchPoints||0)>1))return 'ios';
    if(/Android/i.test(ua))return 'android';
    if(/Windows/i.test(ua))return 'windows';
    if(/Macintosh|Mac OS X/i.test(ua))return 'macos';
    if(/Linux/i.test(ua))return 'linux';
    return 'other';
  }
  function isStandalone(){try{return !!global.matchMedia?.('(display-mode: standalone)')?.matches||global.navigator?.standalone===true;}catch(_){return false;}}
  function defaultDeviceLabel(){
    const platform=detectPlatform(),name=platform==='ios'?'iPhone / iPad':platform==='android'?'Android':platform==='windows'?'Windows':platform==='macos'?'Mac':platform==='linux'?'Linux':'Cet appareil';
    return `${name}${isStandalone()?' · PWA':' · navigateur'}`;
  }
  function sanitizeLabel(value){const text=String(value||'').trim().replace(/\s+/g,' ');return (text||defaultDeviceLabel()).slice(0,48);}
  function deviceMetadata(){
    const state=parseState();
    return {label:sanitizeLabel(state.deviceLabel),platform:detectPlatform(),standalone:isStandalone(),appVersion:'10.148'};
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
  function computeRepairReason(state,cap){
    if(!state.enabled)return null;
    if(cap.permission==='denied')return 'permission_denied';
    if(state.repairReason)return state.repairReason;
    if(!state.subscribed)return 'subscription_missing';
    if(state.serverExists===false)return 'server_missing';
    return null;
  }
  function status(){
    const state=parseState(),cap=capability(),repairReason=computeRepairReason(state,cap);
    const active=!!(state.enabled&&state.subscribed&&cap.permission==='granted'&&config.configured&&!repairReason);
    return {version:VERSION,configured:config.configured,configLoaded:config.loaded,configError:config.error,enabled:!!state.enabled,subscribed:!!state.subscribed,active,permission:cap.permission||'default',supported:cap.supported,requiresInstall:!!cap.requiresInstall,reason:cap.reason,lastSyncAt:state.lastSyncAt||null,lastManifestDays:Number(state.lastManifestDays||0),timezone:state.timezone||timezone(),lastError:lastSyncError||state.lastError||null,repairReason,serverExists:state.serverExists!==false,lastHealthAt:state.lastHealthAt||null,serverHealth:state.serverHealth||null,deviceLabel:sanitizeLabel(state.deviceLabel),devicePlatform:detectPlatform(),deviceStandalone:isStandalone(),installationSuffix:state.installationId?String(state.installationId).slice(-8):null,subscriptionEndpointFp:state.subscriptionEndpointFp||null,serverInfo:state.serverInfo||null};
  }
  async function sync(options={}){
    if(syncing)return false;
    const state=parseState(),cap=capability();
    if(!state.enabled||cap.permission!=='granted')return false;
    const cfg=await loadConfig();if(!cfg.configured||!cfg.publicKey)return false;
    const subscription=await currentSubscription();
    if(!subscription){saveState({subscribed:false,repairReason:'subscription_missing',lastError:'subscription_missing'});return false;}
    if(!subscriptionMatchesKey(subscription,cfg.publicKey)){saveState({subscribed:true,repairReason:'vapid_key_changed',lastError:'vapid_key_changed'});return false;}
    syncing=true;
    try{
      const id=ensureIdentity(),p=prefs(),manifest=buildManifest(new Date(),MANIFEST_DAYS),localStatus=global.KinetikLocalReminders?.getStatus?.()||{};
      const payload={...id,device:deviceMetadata(),subscription:subscription.toJSON?subscription.toJSON():subscription,timezone:timezone(),prefs:{preferredTime:p.preferredTime||'08:00',notificationDetail:p.notificationDetail||'discreet',workoutFollowup:p.workoutFollowup!==false,workoutFollowupDelay:p.workoutFollowupDelay||120},manifest,snoozeAt:localStatus.snoozedUntil||null,snoozeDate:localStatus.snoozedUntil?(global.KinetikDailyTasks?.dateKey?.(new Date())||null):null};
      const endpointFp=endpointFingerprint(payload.subscription?.endpoint);
      const fp=fingerprint({timezone:payload.timezone,prefs:payload.prefs,device:payload.device,days:manifest.days,snoozeAt:payload.snoozeAt,snoozeDate:payload.snoozeDate,endpoint:payload.subscription?.endpoint});
      const previous=parseState(),age=previous.lastSyncAt?Date.now()-new Date(previous.lastSyncAt).getTime():Infinity;
      if(!options.force&&previous.lastFingerprint===fp&&age<6*60*60*1000)return true;
      const data=await api('/api/push/sync',{method:'POST',body:JSON.stringify(payload)});
      lastSyncError=null;
      saveState({enabled:true,subscribed:true,repairReason:null,serverExists:true,lastSyncAt:data.syncedAt||new Date().toISOString(),lastManifestDays:data.manifestDays||0,timezone:data.timezone||timezone(),lastFingerprint:fp,subscriptionEndpointFp:endpointFp,lastError:null,serverHealth:data.health||previous.serverHealth||null,lastHealthAt:new Date().toISOString(),deviceLabel:sanitizeLabel(payload.device.label)});
      try{global.KinetikLocalReminders?.refresh?.();}catch(_){}
      try{global.KinetikAccount?.scheduleSync?.(true);}catch(_){}
      if(options.render!==false)try{global.render?.();}catch(_){}
      return true;
    }catch(error){
      lastSyncError=error.message||'sync_failed';
      const serverCode=error.data?.error||lastSyncError;
      if(serverCode==='account_device_revoked'){try{const current=await currentSubscription();await current?.unsubscribe?.();}catch(_){}saveState({enabled:false,subscribed:false,lastError:'account_device_revoked',repairReason:'account_device_revoked',serverExists:false});try{global.KinetikAccount?.scheduleSync?.(true);}catch(_){}if(options.render!==false)try{global.render?.();}catch(_){}return false;}
      const repairReason=error.status===403?'device_auth_failed':error.status===404?'server_missing':null;
      saveState({lastError:lastSyncError,...(repairReason?{repairReason,serverExists:repairReason!=='server_missing'}:{})});
      if(options.render!==false)try{global.render?.();}catch(_){}
      return false;
    }finally{syncing=false;}
  }
  function scheduleSync(force=false){
    if(syncTimer)clearTimeout(syncTimer);
    syncTimer=setTimeout(()=>sync({force,render:false}),force?0:SYNC_DEBOUNCE_MS);
  }
  async function checkHealth(options={}){
    if(healthChecking)return parseState().serverHealth||null;
    const state=parseState();
    if(!state.enabled||!state.installationId||!state.deviceSecret)return null;
    const age=state.lastHealthAt?Date.now()-new Date(state.lastHealthAt).getTime():Infinity;
    if(!options.force&&age<HEALTH_CHECK_MS)return state.serverHealth||null;
    healthChecking=true;
    try{
      const data=await api('/api/push/status',{method:'POST',body:JSON.stringify({installationId:state.installationId,deviceSecret:state.deviceSecret})});
      if(data.exists===false){saveState({serverExists:false,repairReason:'server_missing',lastHealthAt:new Date().toISOString(),serverHealth:null});return null;}
      saveState({serverExists:true,lastHealthAt:new Date().toISOString(),serverHealth:data.health||null,serverInfo:{device:data.device||null,schedules:data.schedules||null,manifestDays:Number(data.manifestDays||0),preferredTime:data.preferredTime||null,subscription:data.subscription||null,serverNow:data.serverNow||null},deviceLabel:sanitizeLabel(data.device?.label||state.deviceLabel),repairReason:state.repairReason==='server_missing'?null:state.repairReason,lastError:data.health?.lastDeliveryError||state.lastError||null});
      if(options.render!==false)try{global.render?.();}catch(_){}
      return data.health||null;
    }catch(error){
      const authFailed=Number(error.status||0)===403;
      saveState({lastHealthAt:new Date().toISOString(),lastError:error.message||'health_check_failed',...(authFailed?{repairReason:'device_auth_failed'}:{})});
      if(options.render!==false)try{global.render?.();}catch(_){}
      return null;
    }finally{healthChecking=false;}
  }
  async function activate(){
    const cfg=await loadConfig(true);if(!cfg.configured||!cfg.publicKey)return false;
    const cap=capability();if(!cap.supported)return false;
    let permission=global.Notification?.permission||'default';
    if(permission==='default')permission=await global.Notification.requestPermission();
    if(permission!=='granted')return false;
    const registration=await global.navigator.serviceWorker.ready;
    let subscription=await registration.pushManager.getSubscription();
    if(subscription&&!subscriptionMatchesKey(subscription,cfg.publicKey)){try{await subscription.unsubscribe();}catch(_){}subscription=null;}
    if(!subscription)subscription=await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:base64ToUint8Array(cfg.publicKey)});
    ensureIdentity();saveState({enabled:true,subscribed:!!subscription,repairReason:null,lastError:null,deviceLabel:sanitizeLabel(parseState().deviceLabel),subscriptionEndpointFp:endpointFingerprint(subscription?.endpoint)});
    const ok=await sync({force:true,render:false});if(ok)await checkHealth({force:true,render:false});try{global.render?.();}catch(_){}return ok;
  }
  async function repair(){
    const cfg=await loadConfig(true),cap=capability();
    if(!cfg.configured||!cfg.publicKey||!cap.supported||global.Notification?.permission!=='granted')return false;
    try{
      const authMismatch=parseState().repairReason==='device_auth_failed';
      if(authMismatch)rotateIdentity();
      const registration=await global.navigator.serviceWorker.ready;
      let subscription=await registration.pushManager.getSubscription();
      // An auth mismatch means the old server identity cannot be revoked with the
      // local secret. Rotate the browser endpoint too, so the orphan server record
      // receives 404/410 on its next send and self-cleans without duplicate pushes.
      if(subscription&&(authMismatch||!subscriptionMatchesKey(subscription,cfg.publicKey))){try{await subscription.unsubscribe();}catch(_){}subscription=null;}
      if(!subscription)subscription=await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:base64ToUint8Array(cfg.publicKey)});
      ensureIdentity();saveState({enabled:true,subscribed:true,repairReason:null,serverExists:true,lastError:null,subscriptionEndpointFp:endpointFingerprint(subscription?.endpoint)});
      const ok=await sync({force:true,render:false});if(ok)await checkHealth({force:true,render:false});try{global.render?.();}catch(_){}return ok;
    }catch(error){saveState({repairReason:'repair_failed',lastError:error.message||'repair_failed'});try{global.render?.();}catch(_){}return false;}
  }
  async function setDeviceLabel(label){
    saveState({deviceLabel:sanitizeLabel(label)});
    if(parseState().enabled)return sync({force:true});
    try{global.render?.();}catch(_){}return true;
  }
  async function disable(options={}){
    const state=parseState(),id={installationId:state.installationId,deviceSecret:state.deviceSecret};
    try{if(id.installationId&&id.deviceSecret)await api('/api/push/unsubscribe',{method:'POST',body:JSON.stringify(id)});}catch(_){}
    if(options.unsubscribeBrowser!==false){try{const sub=await currentSubscription();await sub?.unsubscribe?.();}catch(_){} }
    saveState({enabled:false,subscribed:false,repairReason:null,serverExists:false,lastSyncAt:null,lastHealthAt:null,serverHealth:null,lastManifestDays:0,lastFingerprint:null,subscriptionEndpointFp:null,lastError:null});
    try{global.KinetikLocalReminders?.refresh?.();}catch(_){}
    if(options.render!==false)try{global.render?.();}catch(_){}
    return true;
  }
  async function test(){
    const state=parseState();if(!state.installationId||!state.deviceSecret||!status().active)return false;
    try{
      const data=await api('/api/push/test',{method:'POST',body:JSON.stringify({installationId:state.installationId,deviceSecret:state.deviceSecret})});
      saveState({serverExists:true,lastHealthAt:new Date().toISOString(),serverHealth:data.health||state.serverHealth||null,lastError:null});
      try{global.render?.();}catch(_){}return true;
    }catch(error){lastSyncError=error.message;saveState({lastError:lastSyncError});try{global.render?.();}catch(_){}return false;}
  }
  async function refresh(){
    const cfg=await loadConfig();
    const state=parseState(),sub=await currentSubscription(),permission=global.Notification?.permission||'default';
    if(state.enabled&&permission==='denied')saveState({subscribed:false,repairReason:'permission_denied',lastError:'permission_denied'});
    else if(state.enabled&&!sub)saveState({subscribed:false,repairReason:'subscription_missing',lastError:'subscription_missing'});
    else if(state.enabled&&sub&&permission==='granted'){
      if(cfg.publicKey&&!subscriptionMatchesKey(sub,cfg.publicKey))saveState({subscribed:true,repairReason:'vapid_key_changed',lastError:'vapid_key_changed'});
      else{
        const endpointFp=endpointFingerprint(sub.endpoint),endpointChanged=!!state.subscriptionEndpointFp&&state.subscriptionEndpointFp!==endpointFp;
        saveState({subscribed:true,repairReason:null,lastError:state.lastError==='subscription_missing'||state.lastError==='vapid_key_changed'?null:state.lastError,subscriptionEndpointFp:endpointFp});
        const age=state.lastSyncAt?Date.now()-new Date(state.lastSyncAt).getTime():Infinity;
        if(endpointChanged||age>MIN_BACKGROUND_SYNC_MS)scheduleSync(true);
        checkHealth({force:false,render:false});
      }
    }
    try{global.render?.();}catch(_){}
  }
  function supportDiagnostic(){
    const st=status(),cap=capability(),p=prefs(),health=st.serverHealth||{},server=st.serverInfo||{};
    return {
      schema:'kinetik-support-diagnostic-v1',generatedAt:new Date().toISOString(),appVersion:'10.148',webPushManager:VERSION,
      runtime:{platform:st.devicePlatform||'other',standalone:!!st.deviceStandalone,timezone:st.timezone||timezone(),notificationPermission:st.permission||'default',pushSupported:!!cap.pushSupported,serviceWorkerSupported:!!global.navigator?.serviceWorker},
      webPush:{configured:!!st.configured,enabled:!!st.enabled,active:!!st.active,subscribed:!!st.subscribed,repairReason:st.repairReason||null,serverExists:!!st.serverExists,lastSyncAt:st.lastSyncAt||null,lastHealthAt:st.lastHealthAt||null,manifestDays:Number(st.lastManifestDays||0),installationSuffix:st.installationSuffix||null,subscriptionFingerprint:st.subscriptionEndpointFp||null},
      server:{schedules:server.schedules?{primary:!!server.schedules.primary,followup:!!server.schedules.followup,snooze:!!server.schedules.snooze}:null,manifestDays:Number(server.manifestDays||0),preferredTime:server.preferredTime||null,subscriptionFingerprint:server.subscription?.fingerprint||null,serverNow:server.serverNow||null},
      health:{lastClientSyncAt:health.lastClientSyncAt||null,lastDeliveryAcceptedAt:health.lastDeliveryAcceptedAt||null,lastDeliveryReason:health.lastDeliveryReason||null,lastReceivedAt:health.lastReceivedAt||null,lastReceivedReason:health.lastReceivedReason||null,lastOpenedAt:health.lastOpenedAt||null,lastOpenedReason:health.lastOpenedReason||null,lastOpenDelayMs:health.lastOpenDelayMs!=null&&Number.isFinite(Number(health.lastOpenDelayMs))?Number(health.lastOpenDelayMs):null,lastTestAcceptedAt:health.lastTestAcceptedAt||null,lastDeliveryErrorAt:health.lastDeliveryErrorAt||null,lastDeliveryError:health.lastDeliveryError||null,consecutiveFailures:Number(health.consecutiveFailures||0),backoffUntil:health.backoffUntil||null,backoffReason:health.backoffReason||null},
      reminderSettings:{enabled:p.enabled!==false,localNotifications:p.localNotifications!==false,preferredTime:p.preferredTime||'08:00',workoutFollowup:p.workoutFollowup!==false,workoutFollowupDelay:Number(p.workoutFollowupDelay||120),notificationDetail:p.notificationDetail==='detailed'?'detailed':'discreet'},
      privacy:{deviceSecretIncluded:false,installationIdIncluded:false,pushEndpointIncluded:false,manifestIncluded:false,measurementsIncluded:false,performanceIncluded:false,photosIncluded:false}
    };
  }
  function downloadSupportDiagnostic(){
    const diagnostic=supportDiagnostic(),text=JSON.stringify(diagnostic,null,2);
    try{
      const blob=new Blob([text],{type:'application/json'}),url=global.URL?.createObjectURL?.(blob),a=global.document?.createElement?.('a');
      if(url&&a){a.href=url;a.download=`kinetik-diagnostic-${new Date().toISOString().slice(0,10)}.json`;a.style.display='none';global.document?.body?.appendChild?.(a);a.click();a.remove?.();setTimeout(()=>global.URL?.revokeObjectURL?.(url),1000);return true;}
    }catch(_){}
    return false;
  }
  function clearLocalState(){try{global.localStorage?.removeItem(STATE_KEY);}catch(_){} }

  const apiPublic={version:VERSION,stateKey:STATE_KEY,getStatus:status,getCapability:capability,loadConfig,activate,repair,disable,sync,scheduleSync,test,buildManifest,refresh,checkHealth,setDeviceLabel,deviceMetadata,currentSubscription,supportDiagnostic,downloadSupportDiagnostic,clearLocalState};
  global.KinetikWebPush=apiPublic;

  // Most KINETIK mutations end with render(). Debounce a manifest sync after those renders.
  try{
    const originalRender=global.render;
    if(typeof originalRender==='function')global.render=function(){const result=originalRender.apply(this,arguments);if(parseState().enabled)scheduleSync(false);return result;};
  }catch(_){}
  try{global.addEventListener?.('focus',refresh);}catch(_){}
  try{global.addEventListener?.('pageshow',refresh);}catch(_){}
  try{global.document?.addEventListener?.('visibilitychange',()=>{if(global.document.visibilityState==='visible')refresh();});}catch(_){}
  try{global.navigator?.serviceWorker?.addEventListener?.('message',event=>{if(event.data?.type==='kinetik-push-subscription-change'){saveState({repairReason:'subscription_changed'});refresh();}});}catch(_){}
  ensureIdentity();if(!parseState().deviceLabel)saveState({deviceLabel:defaultDeviceLabel()});refresh();
  console.info(`[KINETIK] Web Push Health Manager v${VERSION} ready`);
})(window);
