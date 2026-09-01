const fs=require('fs');
const vm=require('vm');
const core=require('./api/_lib/push-core');
const appSource=fs.readFileSync(__dirname+'/app.js','utf8');
const dailySource=fs.readFileSync(__dirname+'/daily-tasks.js','utf8');
const localSource=fs.readFileSync(__dirname+'/local-reminders.js','utf8');
const pushSource=fs.readFileSync(__dirname+'/web-push-manager.js','utf8');
const store=new Map();
const localStorage={getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k),clear:()=>store.clear()};
const sessionStore=new Map();
const sessionStorage={getItem:k=>sessionStore.has(k)?sessionStore.get(k):null,setItem:(k,v)=>sessionStore.set(k,String(v)),removeItem:k=>sessionStore.delete(k),clear:()=>sessionStore.clear()};
const appNode={innerHTML:'',dataset:{},classList:{add(){},remove(){},toggle(){}},querySelectorAll(){return[]}};
const document={visibilityState:'hidden',hasFocus:()=>false,getElementById:id=>id==='app'?appNode:null,querySelectorAll:()=>[],querySelector:()=>null,addEventListener(){},removeEventListener(){},documentElement:{style:{setProperty(){}},dataset:{},classList:{add(){},remove(){},toggle(){}}},body:{classList:{add(){},remove(){},toggle(){}}},createElement:tag=>({tagName:tag.toUpperCase(),style:{},dataset:{},classList:{add(){},remove(){},toggle(){}},appendChild(){},remove(){},click(){},setAttribute(){},getContext(){return null}})};
let permissionRequests=0,subscribeCalls=0,unsubscribeCalls=0;
function Notification(){} Notification.permission='default'; Notification.requestPermission=async()=>{permissionRequests++;Notification.permission='granted';return 'granted';};
let vapidPublic=Buffer.alloc(65,7).toString('base64url');
let activeSubscription=null;
function makeSubscription(key){return {endpoint:'https://push.example/sub-'+subscribeCalls,expirationTime:null,keys:{p256dh:'abc',auth:'def'},options:{applicationServerKey:key.buffer.slice(key.byteOffset,key.byteOffset+key.byteLength)},toJSON(){return {endpoint:this.endpoint,expirationTime:null,keys:this.keys}},unsubscribe:async()=>{unsubscribeCalls++;activeSubscription=null;return true;}};}
const pushManager={getSubscription:async()=>activeSubscription,subscribe:async options=>{subscribeCalls++;activeSubscription=makeSubscription(new Uint8Array(options.applicationServerKey));return activeSubscription;}};
const swMessageListeners=[];
const serviceWorker={ready:Promise.resolve({pushManager,showNotification:async()=>{}}),addEventListener:(type,fn)=>{if(type==='message')swMessageListeners.push(fn);},register:async()=>({})};
let serverExists=true,statusAuthFailed=false,statusCalls=0,syncCalls=0;
let serverHealth={lastClientSyncAt:'2026-09-01T09:00:00.000Z',lastDeliveryAcceptedAt:'2026-09-01T08:00:10.000Z',lastDeliveryReason:'primary',lastDeliveryDate:'2026-09-01',lastTestAcceptedAt:null,lastDeliveryErrorAt:null,lastDeliveryError:null,consecutiveFailures:0};
const calls=[];
async function fetchMock(url,options={}){
  const path=String(url),body=options.body?JSON.parse(options.body):null;calls.push({url:path,method:options.method||'GET',body});
  if(path.includes('/api/push/public-key'))return {ok:true,status:200,json:async()=>({ok:true,configured:true,publicKey:vapidPublic})};
  if(path.includes('/api/push/sync')){syncCalls++;serverExists=true;serverHealth={...serverHealth,lastClientSyncAt:'2026-09-01T10:00:00.000Z'};return {ok:true,status:200,json:async()=>({ok:true,active:true,syncedAt:'2026-09-01T10:00:00.000Z',timezone:'Europe/Berlin',manifestDays:30,device:body.device,health:serverHealth})};}
  if(path.includes('/api/push/status')){statusCalls++;if(statusAuthFailed)return {ok:false,status:403,json:async()=>({ok:false,error:'device_auth_failed'})};return {ok:true,status:200,json:async()=>serverExists?({ok:true,exists:true,serverNow:'2026-09-01T10:01:00.000Z',device:{label:'Mon iPhone',platform:'ios',standalone:true,appVersion:'10.127'},subscription:{fingerprint:'abc123'},timezone:'Europe/Berlin',preferredTime:'08:00',manifestDays:30,schedules:{primary:true,followup:true,snooze:false},health:serverHealth}):({ok:true,exists:false,serverNow:'2026-09-01T10:01:00.000Z'})};}
  if(path.includes('/api/push/test')){serverHealth={...serverHealth,lastTestAcceptedAt:'2026-09-01T10:02:00.000Z'};return {ok:true,status:200,json:async()=>({ok:true,sent:true,health:serverHealth})};}
  if(path.includes('/api/push/unsubscribe'))return {ok:true,status:200,json:async()=>({ok:true,removed:true})};
  return {ok:false,status:404,json:async()=>({ok:false,error:'not_found'})};
}
const sandbox={console,localStorage,sessionStorage,document,Notification,PushManager:function(){},navigator:{serviceWorker,userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 19_0 like Mac OS X)',maxTouchPoints:5,standalone:true},location:{origin:'https://kinetik.example',pathname:'/',search:'',href:'https://kinetik.example/'},history:{replaceState(){}},URL:global.URL,URLSearchParams:global.URLSearchParams,Blob:global.Blob,FileReader:function(){},setTimeout:()=>1,clearTimeout(){},setInterval:()=>1,clearInterval(){},requestAnimationFrame:fn=>fn(),cancelAnimationFrame(){},confirm:()=>true,prompt:()=>null,alert(){},fetch:fetchMock,performance:{now:()=>Date.now()},indexedDB:undefined,crypto:global.crypto,queueMicrotask:fn=>fn(),Intl,atob:global.atob,btoa:global.btoa,Uint8Array};
sandbox.window=sandbox;sandbox.self=sandbox;sandbox.window.addEventListener=()=>{};sandbox.window.removeEventListener=()=>{};sandbox.window.matchMedia=q=>({matches:q.includes('standalone'),addEventListener(){},removeEventListener(){}});
vm.createContext(sandbox);vm.runInContext(appSource+'\n'+dailySource+'\n'+localSource+'\n'+pushSource,sandbox,{filename:'app-step12.js'});

(async()=>{
  const failures=[];let checks=0;const ok=(cond,msg)=>{checks++;if(!cond)failures.push(msg);};
  const manager=sandbox.KinetikWebPush;await manager.loadConfig(true);
  ok(manager?.version==='1.2.0','health manager version is incorrect');
  ok(permissionRequests===0,'health boot requested notification permission');
  ok(typeof manager.checkHealth==='function'&&typeof manager.repair==='function','health/repair API missing');
  ok(typeof manager.setDeviceLabel==='function','device label API missing');

  const activated=await manager.activate();
  ok(activated===true,'activation failed');
  ok(permissionRequests===1&&subscribeCalls===1,'explicit activation did not subscribe exactly once');
  ok(manager.getStatus().active===true,'active status missing after activation');
  const syncPayload=calls.find(c=>c.url.includes('/api/push/sync'))?.body;
  ok(syncPayload?.device?.platform==='ios','device platform metadata missing');
  ok(syncPayload?.device?.standalone===true,'PWA standalone metadata missing');
  ok(syncPayload?.device?.appVersion==='10.127','device app version missing');

  await manager.checkHealth({force:true,render:false});
  let status=manager.getStatus();
  ok(status.serverHealth?.lastDeliveryReason==='primary','server delivery health not loaded');
  ok(status.serverInfo?.schedules?.primary===true,'server schedule state not loaded');
  ok(status.serverExists===true,'server device should exist');
  ok(statusCalls>0,'status endpoint was not called');
  ok(/Santé des notifications/.test(sandbox.renderWebPushSettings()),'notification health UI missing');
  ok(/Dernière remise Push/.test(sandbox.renderWebPushSettings()),'delivery diagnostic missing from UI');
  ok(/Multi-appareils/.test(sandbox.renderWebPushSettings()),'multi-device safety note missing');

  await manager.setDeviceLabel('Mon iPhone perso');
  status=manager.getStatus();
  ok(status.deviceLabel==='Mon iPhone perso','device label was not persisted');
  ok(calls.filter(c=>c.url.includes('/api/push/sync')).at(-1)?.body?.device?.label==='Mon iPhone perso','device label was not synchronized');

  // Simulate a lost PushSubscription.
  activeSubscription=null;await manager.refresh();status=manager.getStatus();
  ok(status.repairReason==='subscription_missing','lost subscription was not diagnosed');
  ok(status.active===false,'lost subscription incorrectly remained active');
  const repaired=await manager.repair();
  ok(repaired===true,'lost subscription repair failed');
  ok(subscribeCalls===2,'repair did not recreate PushSubscription');
  ok(manager.getStatus().active===true,'repair did not restore active state');

  // Simulate server-side device loss while local subscription remains alive.
  serverExists=false;await manager.checkHealth({force:true,render:false});status=manager.getStatus();
  ok(status.repairReason==='server_missing'&&status.serverExists===false,'missing server device was not diagnosed');
  const syncBefore=syncCalls;ok(await manager.repair()===true,'server-missing repair failed');
  ok(syncCalls>syncBefore&&manager.getStatus().serverExists===true,'server-missing repair did not resync device');

  // Simulate VAPID rotation. Existing subscription exposes old applicationServerKey.
  const oldSub=activeSubscription;vapidPublic=Buffer.alloc(65,9).toString('base64url');await manager.loadConfig(true);await manager.refresh();status=manager.getStatus();
  ok(status.repairReason==='vapid_key_changed','VAPID rotation was not diagnosed');
  const beforeRotationSubscribe=subscribeCalls;ok(await manager.repair()===true,'VAPID rotation repair failed');
  ok(unsubscribeCalls>=1&&subscribeCalls===beforeRotationSubscribe+1,'VAPID repair did not rotate browser subscription');
  ok(activeSubscription!==oldSub,'VAPID repair kept the obsolete subscription');

  // Simulate a corrupted local/server capability secret. Repair must rotate both
  // the installation identity and browser subscription to avoid duplicate sends.
  statusAuthFailed=true;await manager.checkHealth({force:true,render:false});status=manager.getStatus();
  ok(status.repairReason==='device_auth_failed','device auth mismatch was not diagnosed');
  const authOldSuffix=status.installationSuffix,authOldSub=activeSubscription,authSubscribeBefore=subscribeCalls,authUnsubscribeBefore=unsubscribeCalls;
  statusAuthFailed=false;ok(await manager.repair()===true,'device auth mismatch repair failed');status=manager.getStatus();
  ok(status.installationSuffix!==authOldSuffix,'auth repair did not rotate installation identity');
  ok(activeSubscription!==authOldSub&&subscribeCalls===authSubscribeBefore+1&&unsubscribeCalls===authUnsubscribeBefore+1,'auth repair did not rotate PushSubscription');

  const tested=await manager.test();ok(tested===true,'server test failed');
  ok(manager.getStatus().serverHealth?.lastTestAcceptedAt,'server test health timestamp not stored');

  ok(core.sanitizeDeviceMeta({label:'  iPhone   Perso  ',platform:'ios',standalone:1,appVersion:'10.127'}).label==='iPhone Perso','device metadata label sanitization failed');
  ok(core.sanitizeDeviceMeta({platform:'evil'}).platform==='other','unknown platform was accepted');
  ok(core.deliveryErrorCode({statusCode:410})==='subscription_expired','410 error classification failed');
  ok(core.deliveryErrorCode({status:429})==='push_rate_limited','429 error classification failed');
  const health=core.healthSnapshot({health:{consecutiveFailures:2,lastDeliveryError:'push_timeout'}});
  ok(health.consecutiveFailures===2&&health.lastDeliveryError==='push_timeout','health snapshot failed');
  ok(core.withHealth({health:{consecutiveFailures:2}},{consecutiveFailures:0,lastDeliveryAcceptedAt:'x'}).health.consecutiveFailures===0,'health patch/reset failed');

  const sw=fs.readFileSync(__dirname+'/sw.js','utf8'),html=fs.readFileSync(__dirname+'/index.html','utf8'),appText=fs.readFileSync(__dirname+'/app.js','utf8'),statusApi=fs.readFileSync(__dirname+'/api/push/status.js','utf8'),deliver=fs.readFileSync(__dirname+'/api/push/deliver.js','utf8'),testApi=fs.readFileSync(__dirname+'/api/push/test.js','utf8'),syncApi=fs.readFileSync(__dirname+'/api/push/sync.js','utf8'),pkg=JSON.parse(fs.readFileSync(__dirname+'/package.json','utf8'));
  ok(sw.includes("addEventListener('pushsubscriptionchange'")&&sw.includes('kinetik-push-subscription-change'),'service worker subscription-change signal missing');
  ok(statusApi.includes('healthSnapshot')&&statusApi.includes('exists:false'),'authenticated device status endpoint missing');
  ok(deliver.includes('lastDeliveryAcceptedAt')&&deliver.includes('applyDeliveryFailure'),'delivery health persistence missing');
  ok(testApi.includes('lastTestAcceptedAt'),'test-delivery health persistence missing');
  ok(syncApi.includes('sanitizeDeviceMeta')&&syncApi.includes('lastClientSyncAt'),'device metadata/client sync health missing');
  ok(appText.includes('renderWebPushHealth')&&appText.includes('repairWebPush'),'health/repair settings UI not wired');
  ok(appText.includes('Nom de l’appareil')&&appText.includes('Multi-appareils'),'current-device management UI missing');
  ok(html.includes('web-push-manager.js?v=10.127')&&sw.includes('web-push-manager.js?v=10.127'),'v10.127 Web Push manager not in PWA asset chain');
  ok(sw.includes("kinetik-v10-127-push-observability"),'v10.127 cache name missing');
  ok(pkg.version==='10.127.0','package version not updated');

  if(failures.length){console.error(`STEP12_RUNTIME_FAIL ${failures.length}/${checks}`);failures.forEach(x=>console.error('-',x));process.exit(1);}else console.log(`STEP12_RUNTIME_OK ${checks} checks`);
})().catch(error=>{console.error(error);process.exit(1)});
