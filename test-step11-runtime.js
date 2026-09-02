const fs=require('fs');
const {loadAppSource}=require('./test-app-source');
const vm=require('vm');
const core=require('./lib/push-core');
const appSource=loadAppSource(__dirname);
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
function Notification(){}
Notification.permission='default';
Notification.requestPermission=async()=>{permissionRequests++;Notification.permission='granted';return 'granted';};
const subscription={endpoint:'https://push.example/sub-123',expirationTime:null,keys:{p256dh:'abc',auth:'def'},toJSON(){return {endpoint:this.endpoint,expirationTime:null,keys:this.keys}},unsubscribe:async()=>{unsubscribeCalls++;return true;}};
let activeSubscription=null;
const pushManager={getSubscription:async()=>activeSubscription,subscribe:async options=>{subscribeCalls++;if(!(options.applicationServerKey instanceof Uint8Array))throw new Error('bad vapid key');activeSubscription=subscription;return subscription;}};
const serviceWorker={ready:Promise.resolve({pushManager,showNotification:async()=>{}}),addEventListener(){},register:async()=>({})};
const calls=[];
const vapidPublic=Buffer.alloc(65,4).toString('base64url');
async function fetchMock(url,options={}){
  calls.push({url:String(url),method:options.method||'GET',body:options.body?JSON.parse(options.body):null});
  if(String(url).includes('/api/push/public-key'))return {ok:true,status:200,json:async()=>({ok:true,configured:true,publicKey:vapidPublic})};
  if(String(url).includes('/api/push/sync'))return {ok:true,status:200,json:async()=>({ok:true,active:true,syncedAt:'2026-09-01T09:00:00.000Z',timezone:'Europe/Berlin',manifestDays:30})};
  if(String(url).includes('/api/push/test'))return {ok:true,status:200,json:async()=>({ok:true,sent:true})};
  if(String(url).includes('/api/push/unsubscribe'))return {ok:true,status:200,json:async()=>({ok:true,removed:true})};
  return {ok:false,status:404,json:async()=>({ok:false,error:'not_found'})};
}
const sandbox={console,localStorage,sessionStorage,document,Notification,PushManager:function(){},navigator:{serviceWorker,userAgent:'Mozilla/5.0 Chrome/151'},location:{origin:'https://kinetik.example',pathname:'/',search:'',href:'https://kinetik.example/'},history:{replaceState(){}},URL:global.URL,URLSearchParams:global.URLSearchParams,Blob:global.Blob,FileReader:function(){},setTimeout:()=>1,clearTimeout(){},setInterval:()=>1,clearInterval(){},requestAnimationFrame:fn=>fn(),cancelAnimationFrame(){},confirm:()=>true,prompt:()=>null,alert(){},fetch:fetchMock,performance:{now:()=>Date.now()},indexedDB:undefined,crypto:global.crypto,queueMicrotask:fn=>fn(),Intl,atob:global.atob,btoa:global.btoa,Uint8Array};
sandbox.window=sandbox;sandbox.self=sandbox;sandbox.window.addEventListener=()=>{};sandbox.window.removeEventListener=()=>{};sandbox.window.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
vm.createContext(sandbox);
vm.runInContext(appSource+'\n'+dailySource+'\n'+localSource+'\n'+pushSource,sandbox,{filename:'app-step11.js'});

(async()=>{
  const failures=[];let checks=0;const ok=(cond,msg)=>{checks++;if(!cond)failures.push(msg);};
  const manager=sandbox.KinetikWebPush;
  await manager.loadConfig(true);
  ok(manager&&manager.version==='1.3.0','Web Push manager missing or wrong version');
  ok(permissionRequests===0,'notification permission was requested without user action');
  ok(manager.getStatus().configured===true,'server VAPID configuration was not detected');
  ok(manager.getStatus().active===false,'Web Push should not be active before opt-in');

  sandbox.setHistory([]);sandbox.setBodyLogs([]);sandbox.setPlannedEvents([]);sandbox.setActivities([]);sandbox.setFlexLogs([]);sandbox.setMobilityTests([]);sandbox.setAssessments([]);sandbox.setTests([]);
  sandbox.setReminderPrefs({...sandbox.getReminderPrefs(),enabled:true,workout:true,activities:false,measurements:false,tests:false,mobility:false,recovery:false,localNotifications:true,notificationDetail:'discreet',preferredTime:'08:00'});
  const now=new Date(2026,8,1,7,0,0);
  let manifest=manager.buildManifest(now,2),today=sandbox.KinetikDailyTasks.dateKey(now),primary=manifest.days[today]?.primary;
  ok(!!primary,'future reminder manifest did not include today workout');
  ok(primary&&primary.count===1,'primary manifest count is incorrect');
  ok(primary&&primary.taskId===null,'discreet manifest leaked an exact task id');
  ok(primary&&/priorité/.test(primary.body),'discreet manifest body should stay generic');
  ok(!!manifest.days[today]?.['workout-followup'],'workout follow-up was not represented in manifest');

  sandbox.setReminderPrefs({...sandbox.getReminderPrefs(),notificationDetail:'detailed'});
  manifest=manager.buildManifest(now,1);primary=manifest.days[today]?.primary;
  ok(primary&&!!primary.taskId,'detailed mode should keep single task id for direct opening');
  ok(primary&&/Push|Handstand/.test(primary.body),'detailed mode did not include the task title');

  const activated=await manager.activate();
  ok(activated===true,'explicit Web Push activation failed');
  ok(permissionRequests===1,'activation did not request permission exactly once');
  ok(subscribeCalls===1,'PushManager.subscribe was not called');
  ok(manager.getStatus().active===true,'Web Push status did not become active');
  const syncCall=calls.find(x=>x.url.includes('/api/push/sync'));
  ok(!!syncCall,'subscription was not synchronized to server');
  ok(syncCall&&syncCall.body.timezone,'timezone missing from server sync');
  ok(syncCall&&syncCall.body.subscription.endpoint===subscription.endpoint,'push subscription endpoint missing from sync');
  ok(syncCall&&syncCall.body.manifest&&Object.keys(syncCall.body.manifest.days).length>0,'reminder manifest missing from sync');
  ok(syncCall&&typeof syncCall.body.deviceSecret==='string'&&syncCall.body.deviceSecret.length>=32,'device capability secret missing');
  ok(sandbox.KinetikLocalReminders.getNextOccurrence(now)===null,'P1 local reminder was not suppressed while P2 is active');
  const pushSettings=sandbox.renderReminderSettings();
  ok(/Détails appareil/.test(pushSettings),'P2 Web Push device details are not rendered');
  ok(/Web Push/.test(pushSettings),'Web Push status is missing from device details');

  const tested=await manager.test();ok(tested===true&&calls.some(x=>x.url.includes('/api/push/test')),'server push test endpoint was not called');
  await manager.disable();
  ok(calls.some(x=>x.url.includes('/api/push/unsubscribe')),'server subscription was not removed on disable');
  ok(unsubscribeCalls===1,'browser PushSubscription was not unsubscribed');
  ok(manager.getStatus().enabled===false,'Web Push remained enabled after disable');

  ok(core.normalizeTime('17:42')==='17:42'&&core.normalizeTime('99:99')==='08:00','server time normalization failed');
  ok(core.followupTime({preferredTime:'08:00',workoutFollowup:true,workoutFollowupDelay:120})==='18:00','server follow-up floor is incorrect');
  ok(core.followupTime({preferredTime:'20:30',workoutFollowup:true,workoutFollowupDelay:120})===null,'server follow-up ceiling is incorrect');
  ok(core.cronAt('08:15','Europe/Berlin')==='CRON_TZ=Europe/Berlin 15 8 * * *','timezone-aware QStash cron is incorrect');
  ok(core.validateTimezone('Not/AZone')==='UTC','invalid timezone was not normalized');
  ok(core.deterministicScheduleId('abcdefghijklmnop','primary')===core.deterministicScheduleId('abcdefghijklmnop','primary'),'schedule id is not deterministic');
  ok(core.deterministicScheduleId('abcdefghijklmnop','primary')!==core.deterministicScheduleId('abcdefghijklmnop','followup'),'primary/follow-up schedule ids collide');
  ok(!!core.validateSubscription({endpoint:'https://push.example/a',keys:{p256dh:'a',auth:'b'}}),'valid push subscription rejected');
  ok(core.validateSubscription({endpoint:'http://push.example/a',keys:{p256dh:'a',auth:'b'}})===null,'insecure push endpoint accepted');
  const sanitized=core.sanitizeManifest({days:{'2026-09-01':{primary:{count:2,taskId:'x',title:'T',body:'B'},evil:{count:1}}}});
  ok(!!sanitized.days['2026-09-01'].primary&&!sanitized.days['2026-09-01'].evil,'server manifest sanitization failed');

  const sw=fs.readFileSync(__dirname+'/sw.js','utf8'),html=fs.readFileSync(__dirname+'/index.html','utf8'),appText=loadAppSource(__dirname),pkg=JSON.parse(fs.readFileSync(__dirname+'/package.json','utf8'));
  ok(sw.includes("addEventListener('push'")&&sw.includes('registration.showNotification'),'service worker push event is missing');
  ok(sw.includes('web-push-manager.js?v=10.142')&&html.includes('web-push-manager.js?v=10.142'),'Web Push manager is not in PWA asset chain');
  ok(pkg.dependencies&&pkg.dependencies['web-push'],'server web-push dependency missing');
  ok(appText.includes('webPushDeviceState: "cc_web_push_device_v1"'),'device Web Push state not registered for reset');
  ok(appText.includes('function backupStorageEntries()')&&appText.includes("'localNotificationState','webPushDeviceState','skillPriorities'"),'device push state would leak into user backup');
  ok(appText.includes('await window.KinetikWebPush?.disable?.({unsubscribeBrowser:true,render:false})'),'backup import does not unregister previous server device');
  ok(fs.existsSync(__dirname+'/api/push/sync.js')&&fs.existsSync(__dirname+'/api/push/deliver.js'),'Web Push server endpoints missing');

  if(failures.length){console.error('STEP11_RUNTIME_FAIL',failures);process.exit(1);}console.log(`STEP11_RUNTIME_OK ${checks} checks`);
})();
