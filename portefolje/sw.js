/* Portefølje notifications helper. No fetch handler on purpose: the app is never
   cached here, so deploys always load fresh. This only lets price alerts show as
   OS notifications while the app is open or in the background. */
self.addEventListener('install', e=>self.skipWaiting());
self.addEventListener('activate', e=>e.waitUntil(self.clients.claim()));
self.addEventListener('notificationclick', e=>{
  e.notification.close();
  e.waitUntil((async()=>{
    const cs=await self.clients.matchAll({type:'window', includeUncontrolled:true});
    for(const c of cs){ if('focus' in c) return c.focus(); }
    if(self.clients.openWindow) return self.clients.openWindow('./');
  })());
});
