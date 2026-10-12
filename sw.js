'use strict';
// Change VERSION whenever any cached app file changes. Do not skip waiting:
// the next version activates once all old tabs/app windows have closed.
const VERSION = 'v1.1.0';
const BASE = self.registration.scope;
const PREFIX = 'gold-calc:' + BASE + ':';
const CACHE = PREFIX + VERSION;
const ASSETS = [
  'index.html', 'style.css', 'calculator.js', 'app.js', 'pwa.js',
  'manifest.json', 'icons/icon-192.png', 'icons/icon-512.png'
].map(path => new URL(path, BASE).href);

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) {
      if (name.startsWith(PREFIX) && name !== CACHE) await caches.delete(name);
    }
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  const root = new URL(BASE);
  if (url.origin !== root.origin || !url.pathname.startsWith(root.pathname)) return;
  const isAppNavigation = event.request.mode === 'navigate' &&
    (url.pathname === root.pathname || url.pathname === new URL('index.html', BASE).pathname);
  const key = isAppNavigation ? new URL('index.html', BASE).href : url.origin + url.pathname;
  if (!ASSETS.includes(key)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const stored = await cache.match(key);
    return stored || fetch(event.request);
  })());
});
