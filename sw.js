// ============================================================
// Service Worker — OneApp (Nilai & Absensi Siswa)
// ============================================================
// Catatan penting: aplikasi ini BUTUH internet untuk berfungsi
// (login & data disimpan di Firebase). Service worker ini HANYA
// men-cache kerangka UI statis (HTML/CSS/JS lokal) supaya halaman
// tampil lebih cepat saat dibuka ulang — bukan untuk mode offline
// penuh. Semua request ke Firebase/Google selalu lewat network.
// ============================================================

const CACHE_NAME = 'oneapp-shell-v4';
const SHELL_FILES = [
  './index.html',
  './input-nilai.html',
  './absensi-siswa.html',
  './siswa.html',
  './rekap-nilai.html',
  './assets/firebase-config.js',
  './assets/auth.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Hanya tangani GET request ke origin sendiri (file-file shell).
  // Request ke Firebase, Google Fonts, CDN, dll dibiarkan langsung ke network.
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
