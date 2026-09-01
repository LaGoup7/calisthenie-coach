const fs=require('fs');
const vm=require('vm');
const source=fs.readFileSync(__dirname+'/app.js','utf8');
const dailySource=fs.readFileSync(__dirname+'/daily-tasks.js','utf8');
const localReminderSource=fs.readFileSync(__dirname+'/local-reminders.js','utf8');
const store=new Map();
const localStorage={getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k),clear:()=>store.clear()};
const appNode={innerHTML:'',dataset:{},classList:{add(){},remove(){},toggle(){}},querySelectorAll(){return[]}};
let visibilityState='hidden',focused=false;
const document={
  get visibilityState(){return visibilityState;},hasFocus:()=>focused,
  getElementById:id=>id==='app'?appNode:null,querySelectorAll:()=>[],querySelector:()=>null,addEventListener(){},removeEventListener(){},
  documentElement:{style:{setProperty(){}},dataset:{},classList:{add(){},remove(){},toggle(){}}},body:{classList:{add(){},remove(){},toggle(){}}},
  createElement:tag=>({tagName:tag.toUpperCase(),style:{},dataset:{},classList:{add(){},remove(){},toggle(){}},appendChild(){},remove(){},click(){},setAttribute(){},getContext(){return null}})
};
const sessionStore=new Map();
const sessionStorage={getItem:k=>sessionStore.has(k)?sessionStore.get(k):null,setItem:(k,v)=>sessionStore.set(k,String(v)),removeItem:k=>sessionStore.delete(k),clear:()=>sessionStore.clear()};
const notifications=[];
function Notification(){}
Notification.permission='default';
let permissionRequests=0;
Notification.requestPermission=async()=>{permissionRequests++;Notification.permission='granted';return 'granted';};
const serviceWorker={
  ready:Promise.resolve({showNotification:async(title,options)=>{notifications.push({title,options});}}),
  addEventListener(){},register:async()=>({})
};
const noopTimer=()=>1;
const sandbox={console,localStorage,sessionStorage,document,Notification,navigator:{serviceWorker,userAgent:'Mozilla/5.0 Chrome/151'},location:{origin:'http://localhost',pathname:'/',search:'',href:'http://localhost/'},history:{replaceState(){}},URL:global.URL,URLSearchParams:global.URLSearchParams,Blob:global.Blob,FileReader:function(){},setTimeout:fn=>0,clearTimeout(){},setInterval:noopTimer,clearInterval(){},requestAnimationFrame:fn=>fn(),cancelAnimationFrame(){},confirm:()=>true,prompt:()=>null,fetch:async()=>({ok:false,json:async()=>({})}),performance:{now:()=>Date.now()},indexedDB:undefined,crypto:global.crypto,queueMicrotask:fn=>fn()};
sandbox.window=sandbox;sandbox.window.addEventListener=()=>{};sandbox.window.removeEventListener=()=>{};sandbox.window.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});sandbox.self=sandbox.window;
vm.createContext(sandbox);
vm.runInContext(source+'\n'+dailySource+'\n'+localReminderSource,sandbox,{filename:'app-step10.js'});

(async()=>{
  const failures=[];let checks=0;const ok=(cond,msg)=>{checks++;if(!cond)failures.push(msg);};
  const manager=sandbox.KinetikLocalReminders;
  sandbox.localStorage.clear();
  sandbox.setHistory([]);sandbox.setBodyLogs([]);sandbox.setPlannedEvents([]);sandbox.setActivities([]);sandbox.setFlexLogs([]);sandbox.setMobilityTests([]);sandbox.setAssessments([]);sandbox.setTests([]);

  let p=sandbox.getReminderPrefs();
  ok(p.version===3,'reminder preferences were not migrated to schema v3');
  ok(p.localNotifications===false&&p.notificationDetail==='discreet','local notification privacy defaults are wrong');
  ok(p.snoozeMinutes===30&&p.workoutFollowup===true&&p.workoutFollowupDelay===120,'local reminder timing defaults are wrong');
  ok(manager?.version==='1.0.0','Local Reminder Coordinator is missing or wrong version');
  ok(permissionRequests===0,'notification permission was requested automatically on load');
  ok(sandbox.renderReminderSettings().includes('Notifications locales')&&sandbox.renderReminderSettings().includes('Limite P1'),'local notification settings are not exposed in reminders');

  const permission=await manager.requestPermission();
  p=sandbox.getReminderPrefs();
  ok(permission==='granted'&&permissionRequests===1,'permission is not requested explicitly through the manager');
  ok(p.localNotifications===true,'granted permission does not enable local reminders');
  ok(manager.getStatus().permission==='granted'&&manager.getStatus().supported===true,'granted capability is not reflected in status');

  // Keep only the Tuesday workout task so notification behavior is deterministic.
  sandbox.setReminderPrefs({...sandbox.getReminderPrefs(),enabled:true,localNotifications:true,preferredMoment:'custom',preferredTime:'08:00',workout:true,activities:false,measurements:false,tests:false,mobility:false,recovery:false,notificationDetail:'discreet',workoutFollowup:true,workoutFollowupDelay:120});
  const morning=new Date(2026,8,1,8,5,0); // Tuesday
  visibilityState='hidden';focused=false;
  await manager.tick(morning,{visible:false});
  ok(notifications.length===1,'primary local notification was not emitted after preferred time');
  ok(notifications[0].options?.data?.reason==='primary','primary notification has the wrong reason');
  ok(!String(notifications[0].options?.body||'').includes('Séance Push'),'discreet lock-screen mode leaks the task title');
  const state1=JSON.parse(localStorage.getItem('cc_local_notification_state_v1')||'{}');
  ok(!!state1.days?.['2026-09-01']?.primarySentAt,'primary delivery is not persisted for deduplication');
  await manager.tick(new Date(2026,8,1,8,6,0),{visible:false});
  ok(notifications.length===1,'same-day primary notification was duplicated');

  const snoozed=manager.snooze(30,morning);
  ok(Math.round((snoozed.until-morning)/60000)===30,'snooze duration is wrong');
  await manager.tick(new Date(2026,8,1,8,36,0),{visible:false});
  ok(notifications.length===2&&notifications[1].options?.data?.reason==='snooze','snoozed reminder was not emitted');

  // Detailed privacy mode may expose the exact task title.
  sandbox.setReminderPrefs({...sandbox.getReminderPrefs(),notificationDetail:'detailed'});
  await manager.tick(new Date(2026,8,2,8,5,0),{visible:false}); // Wednesday
  ok(notifications.length===3,'next-day primary notification was not emitted');
  ok(String(notifications[2].options?.body||'').includes('Séance'),'detailed notification mode does not expose useful task detail');

  // Seeing the app after the preferred time counts as seeing the reminder and suppresses a system notification.
  const beforeVisible=notifications.length;
  visibilityState='visible';focused=true;
  await manager.tick(new Date(2026,8,3,8,5,0),{visible:true}); // Thursday
  ok(notifications.length===beforeVisible,'foreground app emitted a redundant system notification');
  const stateVisible=JSON.parse(localStorage.getItem('cc_local_notification_state_v1')||'{}');
  ok(!!stateVisible.days?.['2026-09-03']?.primarySeenAt,'foreground reminder was not marked as seen');
  visibilityState='hidden';focused=false;
  await manager.tick(new Date(2026,8,3,9,0,0),{visible:false});
  ok(notifications.length===beforeVisible,'a primary notification fired after the user already saw the app');

  // If the runtime wakes after the follow-up threshold, send only one workout follow-up, not morning + follow-up back-to-back.
  const beforeFollow=notifications.length;
  await manager.tick(new Date(2026,8,4,18,5,0),{visible:false}); // Friday
  ok(notifications.length===beforeFollow+1,'late runtime wake did not emit exactly one useful reminder');
  ok(notifications.at(-1).options?.data?.reason==='workout-followup','late runtime wake should prefer the workout follow-up');
  const fridayState=JSON.parse(localStorage.getItem('cc_local_notification_state_v1')||'{}').days?.['2026-09-04']||{};
  ok(!!fridayState.primarySkippedAt&&!!fridayState.followupSentAt,'late wake does not persist skipped primary + follow-up state');
  await manager.tick(new Date(2026,8,4,18,6,0),{visible:false});
  ok(notifications.length===beforeFollow+1,'workout follow-up was duplicated');

  // Disable follow-up and verify it cannot fire.
  sandbox.setReminderPrefs({...sandbox.getReminderPrefs(),workoutFollowup:false});
  const beforeNoFollow=notifications.length;
  await manager.tick(new Date(2026,8,5,18,5,0),{visible:false}); // Saturday still workout
  ok(notifications.length===beforeNoFollow+1&&notifications.at(-1).options?.data?.reason==='primary','disabling workout follow-up should fall back to one primary catch-up reminder');

  // Mobility / recovery reminders are inherited from Daily Tasks categories, not hard-coded in the notification layer.
  sandbox.KinetikDailyTasks.registerProvider({id:'step10-category-probe',order:999,getTasks(ctx){return [
    {id:'probe-mobility:'+ctx.dateKey,kind:'mobility',category:'mobility',title:'Routine mobilité probe',status:'pending',priority:60,dueKey:ctx.dateKey},
    {id:'probe-recovery:'+ctx.dateKey,kind:'recovery',category:'recovery',title:'Recovery probe',status:'pending',priority:60,dueKey:ctx.dateKey}
  ];}});
  sandbox.setReminderPrefs({...sandbox.getReminderPrefs(),workout:false,activities:false,measurements:false,tests:false,mobility:true,recovery:false});
  let categoryRows=manager.getPendingTasks(new Date(2026,8,6,10,0,0));
  ok(categoryRows.some(x=>x.id.startsWith('probe-mobility'))&&!categoryRows.some(x=>x.id.startsWith('probe-recovery')),'mobility category is not respected by local reminders');
  sandbox.setReminderPrefs({...sandbox.getReminderPrefs(),mobility:false,recovery:true});
  categoryRows=manager.getPendingTasks(new Date(2026,8,6,10,0,0));
  ok(!categoryRows.some(x=>x.id.startsWith('probe-mobility'))&&categoryRows.some(x=>x.id.startsWith('probe-recovery')),'recovery category is not respected by local reminders');

  // Test notification is explicit and must not alter primary daily delivery state.
  const testBefore=notifications.length;
  const testOk=await manager.testNotification();
  ok(testOk===true&&notifications.length===testBefore+1,'test notification cannot be emitted');
  ok(notifications.at(-1).title.includes('notifications actives'),'test notification copy is wrong');

  // Device-local delivery state is not exported as user data but is registered so Clear all data removes it.
  const appText=source;
  ok(appText.includes('localNotificationState: "cc_local_notification_state_v1"'),'device-local notification state is not registered for full reset');
  ok(appText.includes("filter(([name])=>name!=='localNotificationState')"),'device-local delivery state would leak into backups');
  ok(appText.includes("localStorage.removeItem(STORAGE.localNotificationState)"),'backup restore does not clear stale notification delivery state');

  // Service worker click contract and PWA assets are validated statically here.
  const sw=fs.readFileSync(__dirname+'/sw.js','utf8'),html=fs.readFileSync(__dirname+'/index.html','utf8');
  ok(sw.includes("notificationclick")&&sw.includes("kinetik-reminder-click")&&sw.includes("snooze"),'service worker notification interaction contract is missing');
  ok(sw.includes('local-reminders.js?v=10.124')&&html.includes('local-reminders.js?v=10.124'),'local reminder module is not part of the PWA asset chain');

  if(failures.length){console.error('STEP10_RUNTIME_FAIL',failures);process.exitCode=1;}else console.log('STEP10_RUNTIME_OK '+checks+' checks');
})().catch(e=>{console.error('STEP10_RUNTIME_CRASH',e);process.exitCode=1;});
