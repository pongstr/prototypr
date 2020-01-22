/* eslint-disable */
importScripts('https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js')

if (workbox) {
  workbox.routing.registerRoute(
    'https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js',
    new workbox.strategies.StaleWhileRevalidate({ cacheName: 'phaseout-workbox' })
  )

  workbox.routing.registerRoute(
    /^(https:\/\/cdn\.jsdelivr\.net\/.*)[.js|.css]$/,
    new workbox.strategies.StaleWhileRevalidate({ cacheName:"phaseout-jsdelivr" })
  )

  // Cache Application Scripts and Styles
  workbox.routing.registerRoute(
    /\.(?:js|css)$/,
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'phaseout-static-assets',
    })
  )
}

self.addEventListener('install', function(event) {
  var offlineRequest = new Request('offline.html')
  event.waitUntil(
    fetch(offlineRequest).then(function(response) {
      return caches.open('offline').then(function(cache) {
        console.log('[oninstall] Cached offline page', response.url)
        return cache.put(offlineRequest, response)
      })
    })
  )
})

self.addEventListener('fetch', function(event) {
  var request = event.request;
  if (request.method === 'GET') {
    event.respondWith(
      fetch(request).catch(function(error) {
        console.error('[onfetch] Failed. Serving cached offline fallback ' + error)
        return caches.open('offline').then(function(cache) {
          return cache.match('offline.html')
        })
      })
    )
  }
})
