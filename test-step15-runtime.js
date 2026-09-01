const fs=require('fs'),vm=require('vm'),nodeCrypto=require('crypto');
function ok(cond,msg){if(!cond)throw new Error(msg);checks++;}
let checks=0;

(async()=>{
  // ---- Client manager -------------------------------------------------------
  const store=new Map(),calls=[];
  const localStorage={getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
  let accountId='acc_abcdefghijklmnopqrstuvwxyz1234',deviceId=null;
  const cryptoObj=nodeCrypto.webcrypto;cryptoObj.randomUUID=nodeCrypto.randomUUID;
  const members=()=>[{deviceId:deviceId||'pending',deviceIdSuffix:String(deviceId||'pending').slice(-8),current:true,label:'Mon PC',platform:'windows',standalone:false,appVersion:'10.132',joinedAt:'2026-09-01T10:00:00Z',lastSeenAt:'2026-09-01T10:01:00Z',notificationsMuted:false,pushLinked:false,pushInstallationSuffix:null}];
  const context={console,JSON,Date,Math,Uint8Array,btoa:s=>Buffer.from(s,'binary').toString('base64'),setTimeout,clearTimeout,Intl,crypto:cryptoObj,localStorage,navigator:{userAgent:'Windows NT 10.0',maxTouchPoints:0},matchMedia:()=>({matches:false}),document:{visibilityState:'visible',addEventListener(){}},addEventListener(){},render(){},fetch:async(url,opt={})=>{const body=JSON.parse(opt.body||'{}');calls.push({url,body});deviceId=deviceId||body.deviceId;if(body.action==='create')return{ok:true,status:200,json:async()=>({ok:true,accountId,createdAt:'2026-09-01T10:00:00Z'})};if(body.action==='status')return{ok:true,status:200,json:async()=>({ok:true,accountId,createdAt:'2026-09-01T10:00:00Z',members:members(),maxDevices:8})};if(body.action==='pair')return{ok:true,status:200,json:async()=>({ok:true,pairCode:'ABCD-EFGH',expiresAt:new Date(Date.now()+600000).toISOString()})};if(body.action==='rename')return{ok:true,status:200,json:async()=>({ok:true,label:body.label})};if(body.action==='mute')return{ok:true,status:200,json:async()=>({ok:true,muted:body.muted})};if(body.action==='leave')return{ok:true,status:200,json:async()=>({ok:true,left:true})};return{ok:true,status:200,json:async()=>({ok:true})};},KinetikWebPush:{setDeviceLabel:async()=>true}};
  context.window=context;vm.createContext(context);vm.runInContext(fs.readFileSync(__dirname+'/account-manager.js','utf8'),context);
  const manager=context.KinetikAccount;ok(manager?.version==='1.0.0','account manager missing');ok(manager.getStatus().linked===false,'fresh install should be unlinked');
  ok(await manager.create(),'account creation failed');ok(manager.getStatus().linked===true,'account did not become linked');ok(manager.getStatus().memberCount===1,'member list missing after creation');
  const pair=await manager.createPairCode();ok(pair==='ABCD-EFGH','pair code not exposed');ok(manager.getStatus().pairCode==='ABCD-EFGH','pair state missing');ok(manager.normalizeCode('abcd efgh')==='ABCD-EFGH','pair code normalization failed');
  ok(await manager.rename('  Mon PC  '),'device rename failed');ok(calls.some(c=>c.body.action==='rename'&&c.body.label==='Mon PC'),'rename API not called');
  ok(await manager.setMuted(deviceId,true),'mute call failed');ok(calls.some(c=>c.body.action==='mute'&&c.body.muted===true),'mute API not called');
  ok(await manager.leave(),'leave failed');ok(manager.getStatus().linked===false,'leave did not clear local account link');
  ok(calls.every(c=>c.url==='/api/account'),'account manager does not use the single rewritten endpoint');

  // ---- Server account core -------------------------------------------------
  const kv=new Map();
  process.env.UPSTASH_REDIS_REST_URL='https://redis.test';process.env.UPSTASH_REDIS_REST_TOKEN='redis-token';process.env.PUSH_DELIVERY_SECRET='delivery-secret';
  process.env.VAPID_PUBLIC_KEY='pub';process.env.VAPID_PRIVATE_KEY='priv';process.env.VAPID_SUBJECT='mailto:test@example.com';process.env.QSTASH_TOKEN='qstash';
  global.fetch=async(url,opt={})=>{
    if(String(url).startsWith('https://redis.test')){
      const cmd=JSON.parse(opt.body||'[]'),op=String(cmd[0]||'').toUpperCase(),key=cmd[1];let result=null;
      if(op==='GET')result=kv.has(key)?kv.get(key):null;
      else if(op==='GETDEL'){result=kv.has(key)?kv.get(key):null;kv.delete(key);}
      else if(op==='SET'){
        const nx=cmd.includes('NX');if(nx&&kv.has(key))result=null;else{kv.set(key,String(cmd[2]));result='OK';}
      } else if(op==='DEL'){result=kv.delete(key)?1:0;}
      else if(op==='INCR'){const n=Number(kv.get(key)||0)+1;kv.set(key,String(n));result=n;}
      else if(op==='EXPIRE'){result=1;}
      else throw new Error('Unsupported Redis command '+op);
      return{ok:true,status:200,json:async()=>({result})};
    }
    throw new Error('Unexpected fetch '+url);
  };
  delete require.cache[require.resolve('./lib/push-core')];delete require.cache[require.resolve('./lib/account-core')];delete require.cache[require.resolve('./api/push/status')];delete require.cache[require.resolve('./api/push/sync')];delete require.cache[require.resolve('./api/push/deliver')];
  const pushCore=require('./lib/push-core'),accountCore=require('./lib/account-core'),statusHandler=require('./api/push/status'),syncHandler=require('./api/push/sync'),deliverHandler=require('./api/push/deliver');
  const p1='push_installation_abcdefghijkl',ps1='pushsecret_abcdefghijklmnopqrstuvwxyz1234567890',p2='push_installation_mnopqrstuvwxyz',ps2='pushsecret_zyxwvutsrqponmlkjihgfedcba0987654321';
  await pushCore.putDevice({installationId:p1,secretHash:pushCore.hash(ps1),schedules:{},health:{}});await pushCore.putDevice({installationId:p2,secretHash:pushCore.hash(ps2),schedules:{},health:{}});
  function run(handler,body,query={scope:'account'},headers={}){return new Promise((resolve,reject)=>{const req={method:'POST',headers:{'x-forwarded-for':'127.0.0.1',...headers},query,body};const res={statusCode:200,headers:{},setHeader(k,v){this.headers[k]=v;},end(txt){let data={};try{data=JSON.parse(txt||'{}');}catch{}resolve({status:this.statusCode,data});}};Promise.resolve(handler(req,res)).catch(reject);});}
  const d1='account_device_abcdefghijkl',ds1='accountsecret_abcdefghijklmnopqrstuvwxyz1234567890',d2='account_device_mnopqrstuvwxyz',ds2='accountsecret_zyxwvutsrqponmlkjihgfedcba0987654321';
  let r=await run(statusHandler,{action:'create',deviceId:d1,deviceSecret:ds1,device:{label:'iPhone',platform:'ios',standalone:true,appVersion:'10.132'},pushInstallationId:p1,pushDeviceSecret:ps1});ok(r.status===200&&r.data.accountId,'server account create failed');const aid=r.data.accountId;
  r=await run(statusHandler,{action:'pair',accountId:aid,deviceId:d1,deviceSecret:ds1,device:{label:'iPhone'},pushInstallationId:p1,pushDeviceSecret:ps1});ok(r.data.pairCode&&r.data.pairCode.length===9,'server pair code invalid');const code=r.data.pairCode;
  r=await run(statusHandler,{action:'join',pairCode:code,deviceId:d2,deviceSecret:ds2,device:{label:'PC',platform:'windows'},pushInstallationId:p2,pushDeviceSecret:ps2});ok(r.status===200&&r.data.accountId===aid,'second device join failed');
  r=await run(statusHandler,{action:'status',accountId:aid,deviceId:d1,deviceSecret:ds1,device:{label:'iPhone'},pushInstallationId:p1,pushDeviceSecret:ps1});ok(r.data.members.length===2,'multi-device list should contain 2 devices');ok(r.data.members.some(x=>x.pushLinked),'push link was not recorded');
  r=await run(statusHandler,{action:'mute',accountId:aid,deviceId:d1,deviceSecret:ds1,targetDeviceId:d2,muted:true,device:{label:'iPhone'},pushInstallationId:p1,pushDeviceSecret:ps1});ok(r.data.muted===true,'remote mute failed');ok(await accountCore.isPushMuted(p2),'delivery mute lookup failed');
  r=await run(deliverHandler,{installationId:p2,reason:'primary'},{},{authorization:'Bearer delivery-secret'});ok(r.status===200&&r.data.skipped==='account_muted','scheduled delivery did not honor remote mute');
  r=await run(statusHandler,{action:'revoke',accountId:aid,deviceId:d1,deviceSecret:ds1,targetDeviceId:d2,device:{label:'iPhone'},pushInstallationId:p1,pushDeviceSecret:ps1});ok(r.data.revoked===true,'remote revoke failed');ok(await accountCore.isPushRevoked(p2),'revoked push marker missing');ok(await pushCore.getDevice(p2)===null,'revoked push installation was not deleted');
  r=await run(syncHandler,{installationId:p2,deviceSecret:ps2,subscription:{endpoint:'https://push.example/device',keys:{p256dh:'x',auth:'y'}}},{});ok(r.status===403&&r.data.error==='account_device_revoked','revoked device can resurrect Web Push');
  r=await run(statusHandler,{action:'join',pairCode:code,deviceId:'third_device_abcdefghijkl',deviceSecret:'thirdsecret_abcdefghijklmnopqrstuvwxyz1234567890',device:{label:'Third'} });ok(r.status===404&&r.data.error==='pairing_code_invalid','pair code was not single use');

  // ---- Static deployment + privacy contracts -------------------------------
  const html=fs.readFileSync(__dirname+'/index.html','utf8'),sw=fs.readFileSync(__dirname+'/sw.js','utf8'),vercel=JSON.parse(fs.readFileSync(__dirname+'/vercel.json','utf8')),journey=fs.readFileSync(__dirname+'/app-journey.js','utf8'),server=fs.readFileSync(__dirname+'/lib/account-core.js','utf8'),deliver=fs.readFileSync(__dirname+'/api/push/deliver.js','utf8'),pushManager=fs.readFileSync(__dirname+'/web-push-manager.js','utf8'),appCore=fs.readFileSync(__dirname+'/app.js','utf8'),pkg=JSON.parse(fs.readFileSync(__dirname+'/package.json','utf8'));
  ok(html.includes('account-manager.js?v=10.132')&&sw.includes('account-manager.js?v=10.132'),'account manager missing from PWA chain');ok(html.indexOf('account-manager.js?v=10.132')>html.indexOf('web-push-manager.js?v=10.132'),'account manager load order is incorrect');ok(sw.includes('kinetik-v10-132-ux-lot-b'),'v10.132 cache missing');ok(pkg.version==='10.132.0','package version mismatch');
  ok(vercel.rewrites?.some(x=>x.source==='/api/account'&&String(x.destination).includes('/api/push/status')),'account rewrite missing');
  const apiFiles=[];for(const dir of ['api/push','api/strava'])for(const f of fs.readdirSync(__dirname+'/'+dir))if(f.endsWith('.js'))apiFiles.push(dir+'/'+f);ok(apiFiles.length===12,'Hobby function count changed: '+apiFiles.length);ok(!fs.existsSync(__dirname+'/api/account.js'),'account must not add a 13th Vercel function');ok(!fs.existsSync(__dirname+'/api/_lib'),'obsolete api/_lib must stay absent');
  ok(journey.includes('Compte & appareils')&&journey.includes('createKinetikPairCode')&&journey.includes('account-device-revoke'),'multi-device settings UI missing');ok(deliver.includes('isPushMuted'),'scheduled Push does not respect per-device mute');ok(pushManager.includes('account_device_revoked')&&pushManager.includes('unsubscribe'),'revoked browser cannot self-disable its stale Push');ok(server.includes('MAX_DEVICES = 8')&&server.includes('PAIR_TTL = 10 * 60'),'pairing limits missing');
  ok(!/bodyLogs|measurements|performanceLogs|workoutHistory|photos/i.test(server),'account server must not sync sports/body data');ok(!server.includes('deviceSecret:'),'raw account secrets appear to be persisted');ok(!appCore.includes('cc_kinetik_account_v1'),'account identity leaked into sports STORAGE/export core');
  console.log(`STEP15_RUNTIME_OK ${checks} checks`);
})().catch(e=>{console.error('STEP15_RUNTIME_FAIL',e.stack||e);process.exit(1);});
