const VERSION = 'isla-v1';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin !== location.origin || u.pathname.startsWith('/api/')) return;
  e.respondWith(
    fetch(r)
      .then(res => {
        if (res.ok) {
          const copia = res.clone();
          caches.open(VERSION).then(c => c.put(r.mode === 'navigate' ? '/' : r, copia));
        }
        return res;
      })
      .catch(() => caches.match(r.mode === 'navigate' ? '/' : r).then(x => x || Response.error()))
  );
});

self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) {}
  e.waitUntil(self.registration.showNotification(d.titulo || 'Isla', {
    body: d.cuerpo || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: d.tag || undefined,
    data: { url: d.url || '/' }
  }));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || '/';
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(ls => {
      for (const c of ls) if ('focus' in c) return c.focus();
      return self.clients.openWindow(url);
    })
  );
});
