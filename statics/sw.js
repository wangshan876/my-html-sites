var APP_PREFIX = 'ApplicationName_'     // Identifier for this app (this needs to be consistent across every cache update)
var VERSION = 'version_04'              // Version of the off-line cache (change this value everytime you want to update cache)
var CACHE_NAME = APP_PREFIX + VERSION
var URLS = [                            // Add URL you want to cache in this list.
  '/homepage1/',                     // If you have separate JS/CSS files,
  '/homepage1/index.html',            // add path to those files here
  '/homepage1/js/index.js',            // add path to those files here
  '/homepage1/js/dexie.js',            // add path to those files here
  '/homepage1/favicon.ico',            // add path to those files here
  '/homepage1/js/iframe.js',            // add path to those files here
  '/homepage1/js/notedatas.js',            // add path to those files here
  '/homepage1/js/styles.js',            // add path to those files here
  '/homepage1/js/init.js',            // add path to those files here
  '/homepage1/js/db.js',            // add path to those files here
  '/homepage1/js/ielts_words.js',            // add path to those files here
  '/homepage1/styles/grids-responsive-min.css',            // add path to those files here
  '/homepage1/styles/index.css',            // add path to those files here
  '/homepage1/styles/menus.css',            // add path to those files here
  '/homepage1/styles/pure-min.css',            // add path to those files here
  '/homepage1/homepage.html'   ,         // add path to those files here
  '/homepage1/startpage.html'            // add path to those files here
]

// Respond with cached resources
self.addEventListener('fetch', function (e) {
  console.log('fetch request : ' + e.request.url)
  e.respondWith(
    caches.match(e.request).then(function (request) {
      if (request) { // if cache is available, respond with cache
        return request
      } else {       // if there are no cache, try fetching request
        console.log( e.request.url + "is not cached")
        return fetch(e.request)
      }

      // You can omit if/else for console.log & put one line below like this too.
      // return request || fetch(e.request)
    }).catch(e=>{
      console.warn(e)
      return fetch(e.request)
    })
  )
})

// Cache resources
self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(URLS)
    })
  )
})

// Delete outdated caches
self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keyList) {
      // `keyList` contains all cache names under your username.github.io
      // filter out ones that has this app prefix to create white list
      var cacheWhitelist = keyList.filter(function (key) {
        return key.indexOf(APP_PREFIX)
      })
      // add current cache name to white list
      cacheWhitelist.push(CACHE_NAME)

      return Promise.all(keyList.map(function (key, i) {
        if (cacheWhitelist.indexOf(key) === -1) {
          console.log('deleting cache : ' + keyList[i] )
          return caches.delete(keyList[i])
        }
      }))
    })
  )
})