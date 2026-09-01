const CACHE = 'kinetik-v10-131-integrity-lot-a';
const ASSETS = ['./','./index.html','./styles.css?v=10.131','./app.js?v=10.131','./app-adaptive.js?v=10.131','./app-planning.js?v=10.131','./app-progress.js?v=10.131','./app-body.js?v=10.131','./app-journey.js?v=10.131','./daily-tasks.js?v=10.131','./local-reminders.js?v=10.131','./web-push-manager.js?v=10.131','./account-manager.js?v=10.131','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (!['http:','https:'].includes(url.protocol)) return;
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;
  const isCore = e.request.mode === 'navigate' || ['/', '/index.html', '/app.js', '/app-adaptive.js', '/app-planning.js', '/app-progress.js', '/app-body.js', '/app-journey.js', '/daily-tasks.js', '/local-reminders.js', '/web-push-manager.js', '/account-manager.js', '/styles.css', '/manifest.webmanifest'].includes(url.pathname);
  if (isCore) {
    e.respondWith(fetch(e.request).then(resp => {
      const copy = resp.clone(); caches.open(CACHE).then(c=>c.put(e.request, copy)); return resp;
    }).catch(()=>caches.match(e.request).then(r=>r || caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(resp => {
    const copy = resp.clone(); caches.open(CACHE).then(c=>c.put(e.request, copy)); return resp;
  })));
});



async function kinetikSendPushReceipt(data,eventName){
  const receiptToken=data?.receiptToken;if(!receiptToken)return false;
  try{
    const response=await fetch('/api/push/receipt',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({receiptToken,event:eventName})});
    return !!response.ok;
  }catch(_){return false;}
}

/* P2 reliable Web Push. The service worker is started by the browser even when
   the KINETIK window is closed. */
self.addEventListener('push', event => {
  event.waitUntil((async()=>{
    let payload={};
    try { payload=event.data?.json?.() || {}; } catch (_) { try { payload={body:event.data?.text?.()||''}; } catch(__){} }
    const title=payload.title || 'KINETIK';
    const options={
      body:payload.body || 'Une priorité t’attend dans KINETIK.',
      icon:'./icons/icon-192.png', badge:'./icons/icon-192.png',
      tag:payload.tag || 'kinetik-web-push',
      data:{...(payload.data||{}),source:'web-push'},
      actions:Array.isArray(payload.actions)?payload.actions:[{action:'snooze',title:'Plus tard'},{action:'open',title:'Ouvrir'}],
    };
    try { await self.registration.showNotification(title,options); }
    catch (_) { const {actions,...fallback}=options; await self.registration.showNotification(title,fallback); }
    await kinetikSendPushReceipt(options.data,'received');
  })());
});

/* P1/P2 notification interactions. */
self.addEventListener('notificationclick', event => {
  const data = event.notification?.data || {};
  const action = event.action === 'snooze' ? 'snooze' : 'open';
  event.notification?.close?.();
  event.waitUntil((async()=>{
    await kinetikSendPushReceipt(data,'opened');
    const windows = await self.clients.matchAll({ type:'window', includeUncontrolled:true });
    const target = windows.find(client => 'focus' in client) || null;
    if (target) {
      await target.focus();
      target.postMessage({ type:'kinetik-reminder-click', action, taskId:data.taskId || null, reason:data.reason || null });
      return;
    }
    const url = new URL('./', self.location.href);
    url.searchParams.set('kinetikReminder','1');
    if (data.taskId) url.searchParams.set('task',String(data.taskId));
    if (action === 'snooze') url.searchParams.set('snooze','1');
    await self.clients.openWindow(url.href);
  })());
});

/* V10.127 · Notify open KINETIK clients when the browser rotates/losses the
   PushSubscription. The next foreground refresh performs the authenticated
   repair/synchronization because Service Workers cannot read localStorage. */
self.addEventListener('pushsubscriptionchange', event => {
  event.waitUntil((async()=>{
    const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    windows.forEach(client=>client.postMessage({type:'kinetik-push-subscription-change'}));
  })());
});
