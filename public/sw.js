/* ======================== PWA START ======================== */

const cacheName = 'Sample App';
const staticAssets = [
    './',
    './index.html',
    './app.js',
]

self.addEventListener('install', event => {
    console.log('[ServiceWorker] Install');
    self.skipWaiting();
    event.waitUntil(
        caches.open(cacheName).then(function(cache) {
            console.log('[ServiceWorker] Caching app shell');
            return cache.addAll(staticAssets);
        })
    );
})

self.addEventListener('activate', function(e) {
    console.log('[ServiceWorker] Activate');
    e.waitUntil(
        caches.keys().then(function(keyList) {
            return Promise.all(keyList.map(function(key) {
                if (key !== cacheName) {
                    console.log('[ServiceWorker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    return self.clients.claim();
});

async function cacheFirst(req) {
    const cacheResponse = await caches.match(req);
    return cacheResponse || fetch(req);
}

async function networkFirst(req) {
    const cache = await caches.open(cacheName);
    try {
        const res = await fetch(req);
        cache.put(req, res.clone())
        return res
    } catch (error) {
        return await cache.match(req)
    }
}

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request).then(function(response) {
            if (response) {
                return response;
            }
            return fetch(event.request)
        }).catch(function(error) {
            console.log(error)
        }).then(function(response) {
            return caches.open(cacheName).then(function(cache) {
                if (event.request.url.indexOf('test') < 0) {
                    cache.put(event.request.url, response.clone());
                }
                return response;
            })
        })
    );
});

/* ======================== PWA END ======================== */

/* ****************************************************************************************************************** */
/* ****************************************************************************************************************** */

/* ======================== PUSH NOTIFICATION ======================== */
/* ============================== START ============================== */

importScripts('https://www.gstatic.com/firebasejs/5.8.2/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/5.8.2/firebase-messaging.js');
// Initialize the Firebase app in the service worker by passing in the
importScripts('/__/firebase/init.js');
// firebase.initializeApp({
//     messagingSenderId: '174271760047'
// });

// messagingSenderId.
// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();


/* ======================== PUSH NOTIFICATION ======================== */
/* =============================== END =============================== */