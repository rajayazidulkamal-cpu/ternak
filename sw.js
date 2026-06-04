const CACHE = 'ternakku-v2';
const ASSETS = ['/', '/index.html', '/manifest.json'];

// BUG FIX SW-2: skipWaiting dipindah ke dalam waitUntil agar cache pasti
// selesai diisi sebelum SW aktif dan mulai melayani fetch
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

// ── Activate: hapus cache lama ────────────────────────────────────────
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

// ── Fetch: offline-first ──────────────────────────────────────────────
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).catch(() => caches.match('/index.html')))
  );
});

// BUG FIX SW-3: Lacak timer per taskId agar tidak ada notifikasi duplikat
// saat scheduleTaskNotifs() dipanggil berulang kali dalam satu hari
const scheduledTimers = {};

// ── Notifikasi: terima pesan dari halaman utama ───────────────────────
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SCHEDULE_NOTIF') {
    const { taskId, taskName, taskMeta, delayMs } = e.data;

    // FIX ISU #5: Validasi delayMs di sisi SW agar tidak bisa diexploit via postMessage manual
    if (typeof delayMs !== 'number' || delayMs < 0 || delayMs > 86400000) return;

    // BUG FIX SW-3: batalkan timer lama untuk taskId yang sama sebelum set baru
    if (scheduledTimers[taskId]) {
      clearTimeout(scheduledTimers[taskId]);
      delete scheduledTimers[taskId];
    }

    // BUG FIX SW-1: SW bisa di-terminate browser sebelum setTimeout habis.
    // Gunakan e.waitUntil dengan Promise yang resolve setelah notif ditampilkan
    // agar browser tahu SW masih punya pekerjaan dan tidak langsung di-kill.
    // Catatan: ini tetap tidak 100% guaranteed jika delayMs sangat lama (jam),
    // tapi jauh lebih reliable dari setTimeout tanpa waitUntil.
    const notifPromise = new Promise(resolve => {
      scheduledTimers[taskId] = setTimeout(() => {
        delete scheduledTimers[taskId];
        self.registration.showNotification('⏰ ' + taskName, {
          body: taskMeta || 'Saatnya mengerjakan tugas peternakan kamu!',
          icon: '/icons/icon-192.png',
          badge: '/icons/icon-192.png',
          tag: taskId,
          renotify: true,
          requireInteraction: false,
          data: { taskId }
        }).then(resolve).catch(resolve);
      }, delayMs);
    });
    e.waitUntil(notifPromise);
  }

  if (e.data && e.data.type === 'SHOW_NOTIF') {
    // Notifikasi langsung (test atau triggered)
    e.waitUntil(
      self.registration.showNotification('⏰ ' + e.data.taskName, {
        body: e.data.taskMeta || 'Saatnya mengerjakan tugas peternakan kamu!',
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        tag: e.data.taskId,
        renotify: true,
        data: { taskId: e.data.taskId }
      })
    );
  }
});

// ── Klik notifikasi: buka app ─────────────────────────────────────────
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes('index.html') || client.url.endsWith('/')) {
          // BUG FIX SW-4: await focus() dulu sebelum postMessage agar pesan
          // tidak hilang karena dikirim ke window yang belum terfokus
          return client.focus().then(() => {
            client.postMessage({ type: 'OPEN_JADWAL' });
          });
        }
      }
      return clients.openWindow('/index.html');
    })
  );
});
