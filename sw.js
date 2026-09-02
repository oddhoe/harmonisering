/* Harmonisering - offline-caching.
   Appen skal virke i felt uten dekning, men samtidig plukke opp
   nye datasett med en gang du legger dem ut. Derfor:

     HTML          les fra cache, hent ny i bakgrunnen, si fra
                   hvis den er endret
     datasettet    hent fra nett, fall tilbake til cache
     ovrige filer  les fra cache, hent og lagre forste gang
     NVDB, kart    aldri cache - de er ferske eller ingenting
*/

const CACHE = 'harmonisering-v2';

const CORE = [
  './',
  'index.html',
  'harmonisering-data.json',
  'manifest.json',
  'icon-192.png',
  'icon-512.png',
  'apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    // Legg inn en og en, slik at en fil som mangler ikke velter resten
    await Promise.all(CORE.map(u =>
      c.add(new Request(u, { cache: 'reload' })).catch(() => {})
    ));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const navn = await caches.keys();
    await Promise.all(navn.filter(n => n !== CACHE).map(n => caches.delete(n)));
    await self.clients.claim();
  })());
});

async function si(melding) {
  const klienter = await self.clients.matchAll({ type: 'window' });
  klienter.forEach(k => k.postMessage(melding));
}

/* HTML: vis det vi har, hent nytt i bakgrunnen */
async function friskFraCache(req) {
  const c = await caches.open(CACHE);
  const lagret = await c.match(req, { ignoreSearch: true });

  const nettverk = fetch(req).then(async svar => {
    if (!svar || !svar.ok) return svar;
    const ny = svar.clone();
    if (lagret) {
      const [a, b] = await Promise.all([lagret.clone().text(), svar.clone().text()]);
      if (a !== b) si({ type: 'NY_VERSJON' });
    }
    await c.put(req, ny);
    return svar;
  }).catch(() => null);

  if (lagret) return lagret;
  const svar = await nettverk;
  if (svar) return svar;
  return caches.match('index.html');
}

/* Datasettet: ferskt nar vi har dekning */
async function nettForst(req) {
  const c = await caches.open(CACHE);
  let ctrl = null;
  try { ctrl = new AbortController(); } catch (e) {}
  const t = setTimeout(() => { try { ctrl && ctrl.abort(); } catch (e) {} }, 5000);
  try {
    const svar = await fetch(req, ctrl
      ? { cache: 'no-store', signal: ctrl.signal }
      : { cache: 'no-store' });
    if (svar && svar.ok) { await c.put(req, svar.clone()); return svar; }
    throw new Error('ikke ok');
  } catch (e) {
    const lagret = await c.match(req, { ignoreSearch: true });
    if (lagret) return lagret;
    throw e;
  } finally { clearTimeout(t); }
}

/* Ovrige filer: cache forst, fyll pa etter hvert */
async function cacheForst(req) {
  const c = await caches.open(CACHE);
  const lagret = await c.match(req, { ignoreSearch: true });
  if (lagret) return lagret;
  const svar = await fetch(req);
  if (svar && svar.ok && svar.type === 'basic') await c.put(req, svar.clone());
  return svar;
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;   // NVDB, kart, pdf.js

  if (req.mode === 'navigate' || /\.html$/i.test(url.pathname)) {
    e.respondWith(friskFraCache(req));
    return;
  }
  if (/harmonisering-data\.json$/i.test(url.pathname)) {
    e.respondWith(nettForst(req));
    return;
  }
  e.respondWith(cacheForst(req));
});

self.addEventListener('message', e => {
  if (e.data === 'OPPDATER_NA') self.skipWaiting();
});
