const CACHE_NAME = 'yusri-helper-v1';
const ASSETS_TO_CACHE = [
    './yusri.html',
    './styles/yusri.css',
    './scripts/yusri.js',
    './scripts/howler.min.js',
    './assets/fall.wav',
    './assets/win.wav',
    './assets/yay.wav',
    './assets/minotaur.wav',
    './assets/ping.wav',
    './assets/treasure.wav',
	'./assets/coin-heads.png',
	'./assets/coin-tails.png',
	'./assets/yusri-icon-256.png',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(ASSETS_TO_CACHE))
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => response || fetch(event.request))
    );
});
