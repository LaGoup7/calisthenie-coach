const fs=require('fs');
const {loadAppSource}=require('./test-app-source');
const vm=require('vm');
process.env.PUSH_DELIVERY_SECRET='step13_test_delivery_secret_1234567890';
const core=require('./lib/push-core');

(async()=>{
  const failures=[];let checks=0;const ok=(cond,msg)=>{checks++;if(!cond)failures.push(msg);};

  // Core backoff policy.
  const base={installationId:'device_abcdefghijklmnop',health:{consecutiveFailures:0}};
  const failed1=core.applyDeliveryFailure(base,'push_timeout',new Date('2026-09-01T10:00:00Z'));
  ok(failed1.health.consecutiveFailures===1,'first failure count incorrect');
  ok(failed1.health.backoffUntil==='2026-09-01T10:15:00.000Z','first timeout backoff should be 15 minutes');
  ok(core.isBackoffActive(failed1,new Date('2026-09-01T10:05:00Z'))===true,'active backoff not detected');
  ok(core.isBackoffActive(failed1,new Date('2026-09-01T10:16:00Z'))===false,'expired backoff still active');
  const failed2=core.applyDeliveryFailure(failed1,'push_timeout',new Date('2026-09-01T10:16:00Z'));
  ok(failed2.health.backoffUntil==='2026-09-01T11:16:00.000Z','second timeout backoff should be 1 hour');
  const rate=core.applyDeliveryFailure(base,'push_rate_limited',new Date('2026-09-01T10:00:00Z'));
  ok(rate.health.backoffUntil==='2026-09-01T11:00:00.000Z','rate limit backoff should start at 1 hour');
  const cleared=core.clearDeliveryFailure(failed2);
  ok(cleared.health.consecutiveFailures===0&&!cleared.health.backoffUntil&&!cleared.health.lastDeliveryError,'success did not clear failure/backoff state');

  // Signed receipt token: SW never needs deviceSecret.
  const token=core.createReceiptToken({installationId:'device_abcdefghijklmnop',deliveryId:'delivery_abcdefghijkl',reason:'primary',issuedAt:Date.now()});
  const verified=core.verifyReceiptToken(token);
  ok(!!token&&verified?.installationId==='device_abcdefghijklmnop','receipt token could not be verified');
  ok(verified?.deliveryId==='delivery_abcdefghijkl'&&verified?.reason==='primary','receipt token payload incorrect');
  ok(core.verifyReceiptToken(token.slice(0,-1)+(token.endsWith('A')?'B':'A'))===null,'tampered receipt token was accepted');
  ok(core.healthSnapshot({health:{lastOpenDelayMs:null}}).lastOpenDelayMs===null,'missing open delay was coerced to zero');

  // Receipt endpoint with mocked Upstash REST.
  const redis=new Map();
  const installationId='device_abcdefghijklmnop';
  const device={installationId,health:{lastDeliveryAcceptedAt:new Date().toISOString(),lastDeliveryReason:'primary',consecutiveFailures:0}};
  redis.set('kinetik:push:device:'+installationId,JSON.stringify(device));
  const oldFetch=global.fetch;
  global.fetch=async (_url,options)=>{
    const cmd=JSON.parse(options.body);
    let result=null;
    if(cmd[0]==='GET') result=redis.get(cmd[1])||null;
    else if(cmd[0]==='SET'){
      if(cmd.includes('NX')&&redis.has(cmd[1])) result=null;
      else {redis.set(cmd[1],cmd[2]);result='OK';}
    } else if(cmd[0]==='DEL'){result=redis.delete(cmd[1])?1:0;}
    return {ok:true,status:200,json:async()=>({result})};
  };
  process.env.UPSTASH_REDIS_REST_URL='https://redis.example';
  process.env.UPSTASH_REDIS_REST_TOKEN='token';
  const receiptHandler=require('./api/push/receipt');
  function invoke(body){return new Promise(resolve=>{
    const req={method:'POST',body};
    const res={headers:{},statusCode:0,setHeader(k,v){this.headers[k]=v;},end(text){resolve({status:this.statusCode,body:JSON.parse(text)});}};
    receiptHandler(req,res);
  });}
  const receivedToken=core.createReceiptToken({installationId,deliveryId:'delivery_received_1234',reason:'primary',issuedAt:Date.now()-2000});
  let response=await invoke({receiptToken:receivedToken,event:'received'});
  ok(response.status===200&&response.body.event==='received','received receipt endpoint failed');
  let stored=JSON.parse(redis.get('kinetik:push:device:'+installationId));
  ok(!!stored.health.lastReceivedAt&&stored.health.lastReceivedReason==='primary','received health was not stored');
  response=await invoke({receiptToken:receivedToken,event:'opened'});
  ok(response.status===200&&response.body.event==='opened','opened receipt endpoint failed');
  stored=JSON.parse(redis.get('kinetik:push:device:'+installationId));
  ok(!!stored.health.lastOpenedAt&&stored.health.lastOpenedReason==='primary','opened health was not stored');
  ok(Number(stored.health.lastOpenDelayMs)>=0,'open delay was not stored');
  response=await invoke({receiptToken:'bad.token',event:'opened'});
  ok(response.status===401,'invalid receipt token was not rejected');
  global.fetch=oldFetch;

  // Service Worker posts received/opened receipts.
  const swSource=fs.readFileSync(__dirname+'/sw.js','utf8');
  const listeners={};const receiptCalls=[];let notification=null,focused=false;
  const swSandbox={console,URL,JSON,Promise,setTimeout,clearTimeout,
    fetch:async (url,options={})=>{if(String(url).includes('/api/push/receipt'))receiptCalls.push(JSON.parse(options.body));return {ok:true,clone(){return this;}};},
    caches:{open:async()=>({addAll:async()=>{},put:async()=>{}}),keys:async()=>[],match:async()=>null,delete:async()=>true},
    self:{location:{href:'https://kinetik.example/sw.js',origin:'https://kinetik.example'},addEventListener:(type,fn)=>{listeners[type]=fn;},skipWaiting:async()=>{},clients:{claim:async()=>{},matchAll:async()=>[{focus:async()=>{focused=true;},postMessage(){}}],openWindow:async()=>{}} ,registration:{showNotification:async(title,opts)=>{notification={title,opts};}}}
  };
  swSandbox.self.self=swSandbox.self;vm.createContext(swSandbox);vm.runInContext(swSource,swSandbox,{filename:'sw-step13.js'});
  let pending=[];const pushReceipt='signed_receipt_for_sw';
  listeners.push({data:{json:()=>({title:'KINETIK',body:'Test',data:{receiptToken:pushReceipt,reason:'primary'}})},waitUntil:p=>pending.push(p)});await Promise.all(pending);pending=[];
  ok(notification?.opts?.data?.receiptToken===pushReceipt,'receipt token not kept in notification data');
  ok(receiptCalls.some(x=>x.event==='received'&&x.receiptToken===pushReceipt),'service worker did not report received event');
  listeners.notificationclick({action:'open',notification:{data:notification.opts.data,close(){}},waitUntil:p=>pending.push(p)});await Promise.all(pending);
  ok(receiptCalls.some(x=>x.event==='opened'&&x.receiptToken===pushReceipt),'service worker did not report opened event');
  ok(focused===true,'notification click no longer focuses app');

  // Manager support diagnostic must be intentionally privacy-safe.
  const appSource=loadAppSource(__dirname),dailySource=fs.readFileSync(__dirname+'/daily-tasks.js','utf8'),localSource=fs.readFileSync(__dirname+'/local-reminders.js','utf8'),pushSource=fs.readFileSync(__dirname+'/web-push-manager.js','utf8');
  const store=new Map(),localStorage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
  const sessionStorage={getItem:()=>null,setItem(){},removeItem(){}};
  const appNode={innerHTML:'',dataset:{},classList:{add(){},remove(){},toggle(){}},querySelectorAll(){return[]}};
  const document={visibilityState:'hidden',hasFocus:()=>false,getElementById:id=>id==='app'?appNode:null,querySelectorAll:()=>[],querySelector:()=>null,addEventListener(){},removeEventListener(){},documentElement:{style:{setProperty(){}},dataset:{},classList:{add(){},remove(){},toggle(){}}},body:{appendChild(){},classList:{add(){},remove(){},toggle(){}}},createElement:()=>({style:{},click(){},remove(){},classList:{add(){},remove(){},toggle(){}}})};
  function Notification(){} Notification.permission='granted';Notification.requestPermission=async()=> 'granted';
  const sub={endpoint:'https://push.example/private-endpoint',options:{applicationServerKey:null},toJSON(){return {endpoint:this.endpoint,expirationTime:null,keys:{p256dh:'a',auth:'b'}}},unsubscribe:async()=>true};
  const serviceWorker={ready:Promise.resolve({pushManager:{getSubscription:async()=>sub,subscribe:async()=>sub}}),addEventListener(){}};
  const fetchMock=async(url,options={})=>{
    if(String(url).includes('/api/push/public-key'))return {ok:true,status:200,json:async()=>({ok:true,configured:true,publicKey:Buffer.alloc(65,7).toString('base64url')})};
    if(String(url).includes('/api/push/status'))return {ok:true,status:200,json:async()=>({ok:true,exists:true,serverNow:'2026-09-01T12:00:00Z',device:{label:'iPhone',platform:'ios',standalone:true,appVersion:'10.132'},subscription:{fingerprint:'serverfp'},timezone:'Europe/Berlin',preferredTime:'08:00',manifestDays:12,schedules:{primary:true,followup:true,snooze:false},health:{lastDeliveryAcceptedAt:'2026-09-01T08:00:00Z',lastReceivedAt:'2026-09-01T08:00:01Z',lastOpenedAt:'2026-09-01T08:05:00Z',lastOpenDelayMs:300000,backoffUntil:null,consecutiveFailures:0}})};
    if(String(url).includes('/api/push/sync'))return {ok:true,status:200,json:async()=>({ok:true,syncedAt:'2026-09-01T12:00:00Z',manifestDays:12,timezone:'Europe/Berlin',health:{}})};
    return {ok:true,status:200,json:async()=>({ok:true})};
  };
  const sandbox={console,localStorage,sessionStorage,document,Notification,PushManager:function(){},navigator:{serviceWorker,userAgent:'iPhone',maxTouchPoints:5,standalone:true},location:{origin:'https://kinetik.example',pathname:'/',search:'',href:'https://kinetik.example/'},history:{replaceState(){}},URL,URLSearchParams,Blob,FileReader:function(){},setTimeout:()=>1,clearTimeout(){},setInterval:()=>1,clearInterval(){},requestAnimationFrame:fn=>fn(),cancelAnimationFrame(){},confirm:()=>true,prompt:()=>null,alert(){},fetch:fetchMock,performance:{now:()=>Date.now()},indexedDB:undefined,crypto:global.crypto,queueMicrotask:fn=>fn(),Intl,atob,btoa,Uint8Array};
  sandbox.window=sandbox;sandbox.self=sandbox;sandbox.window.addEventListener=()=>{};sandbox.window.matchMedia=q=>({matches:q.includes('standalone'),addEventListener(){},removeEventListener(){}});
  vm.createContext(sandbox);vm.runInContext(appSource+'\n'+dailySource+'\n'+localSource+'\n'+pushSource,sandbox,{filename:'app-step13.js'});
  await sandbox.KinetikWebPush.loadConfig(true);sandbox.KinetikWebPush.activate && await sandbox.KinetikWebPush.activate();await sandbox.KinetikWebPush.checkHealth({force:true,render:false});
  const diagnostic=sandbox.KinetikWebPush.supportDiagnostic();const text=JSON.stringify(diagnostic);
  ok(diagnostic.schema==='kinetik-support-diagnostic-v1','support diagnostic schema missing');
  ok(diagnostic.appVersion==='10.141'&&diagnostic.webPushManager==='1.3.0','diagnostic version metadata incorrect');
  ok(diagnostic.privacy.deviceSecretIncluded===false&&diagnostic.privacy.pushEndpointIncluded===false,'diagnostic privacy declaration incorrect');
  ok(!text.includes('private-endpoint'),'support diagnostic leaked Push endpoint');
  const rawState=JSON.parse(store.get('cc_web_push_device_v1')||'{}');
  ok(!text.includes(rawState.deviceSecret||'__none__'),'support diagnostic leaked device secret');
  ok(!text.includes(rawState.installationId||'__none__'),'support diagnostic leaked full installation id');
  ok(/Parcours de la dernière notification/.test(sandbox.renderWebPushSettings()),'accepted/received/opened UI missing');
  ok(/Exporter diagnostic support/.test(sandbox.renderWebPushSettings()),'support diagnostic export UI missing');

  // Static integration / packaging contracts.
  const deliver=fs.readFileSync(__dirname+'/api/push/deliver.js','utf8'),testApi=fs.readFileSync(__dirname+'/api/push/test.js','utf8'),receiptApi=fs.readFileSync(__dirname+'/api/push/receipt.js','utf8'),syncApi=fs.readFileSync(__dirname+'/api/push/sync.js','utf8'),appText=loadAppSource(__dirname),managerText=fs.readFileSync(__dirname+'/web-push-manager.js','utf8'),html=fs.readFileSync(__dirname+'/index.html','utf8'),pkg=JSON.parse(fs.readFileSync(__dirname+'/package.json','utf8'));
  ok(deliver.includes('isBackoffActive')&&deliver.includes("skipped:'backoff_active'"),'delivery endpoint does not enforce backoff');
  ok(deliver.includes('push_backend_not_configured')&&deliver.includes('!process.env.PUSH_DELIVERY_SECRET'),'delivery endpoint does not reject missing delivery secret');
  ok(deliver.includes('createReceiptToken')&&testApi.includes('createReceiptToken'),'server notifications do not carry signed receipt tokens');
  ok(receiptApi.includes("['received','opened']")&&receiptApi.includes('verifyReceiptToken'),'receipt endpoint missing validation/events');
  ok(syncApi.includes('subscriptionChanged')&&syncApi.includes('backoffUntil:null'),'new subscription does not clear stale backoff');
  ok(swSource.includes("kinetikSendPushReceipt(options.data,'received')")&&swSource.includes("kinetikSendPushReceipt(data,'opened')"),'service worker receipt telemetry missing');
  ok(managerText.includes('supportDiagnostic')&&managerText.includes('deviceSecretIncluded:false'),'privacy-safe diagnostic generator missing');
  ok(appText.includes('web-push-observability-flow')&&appText.includes('web-push-backoff'),'step13 observability/backoff UI missing');
  ok(html.includes('web-push-manager.js?v=10.141')&&swSource.includes('web-push-manager.js?v=10.141'),'v10.141 manager missing from PWA asset chain');
  ok(swSource.includes("kinetik-v10-141-today-cleanup"),'v10.141 cache missing');
  ok(pkg.version==='10.141.0','package version is not 10.141.0');

  if(failures.length){console.error(`STEP13_RUNTIME_FAIL ${failures.length}/${checks}`);failures.forEach(x=>console.error('-',x));process.exit(1);}else console.log(`STEP13_RUNTIME_OK ${checks} checks`);
})().catch(error=>{console.error(error);process.exit(1)});
