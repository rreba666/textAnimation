// 儿戏的日常手记 - Service Worker（PWA 离线缓存）
// 缓存策略：App Shell 优先缓存，数据走网络

const CACHE_NAME = 'dashboard-v1.0.0'

// 需要预缓存的静态资源（App Shell）
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/icon-192.svg',
  '/icon-512.svg',
  '/manifest.json',
]

// ---- 安装：预缓存 App Shell ----
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS)
    }).catch(() => {
      // 单个资源失败不影响整体安装
      console.log('SW: 部分资源预缓存失败，将在首次访问时缓存')
    })
  )
  // 立即激活，不等待旧 SW
  self.skipWaiting()
})

// ---- 激活：清理旧缓存 ----
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(
        names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      )
    })
  )
  // 立即接管所有页面
  self.clients.claim()
})

// ---- 请求拦截：缓存优先（Assets）+ 网络优先（API） ----
self.addEventListener('fetch', (event) => {
  const { request } = event

  // 跳过非 GET 请求
  if (request.method !== 'GET') return

  // 跳过 chrome-extension 等非 http 请求
  if (!request.url.startsWith('http')) return

  // 策略：静态资源走缓存优先，其他走网络
  const isAsset = /\.(js|css|svg|png|jpg|woff2?|ttf)$/i.test(new URL(request.url).pathname)
    || PRECACHE_URLS.includes(new URL(request.url).pathname)

  if (isAsset) {
    // 缓存优先：命中缓存直接返回，同时后台更新缓存
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          }
          return response
        }).catch(() => cached)
        return cached || fetchPromise
      })
    )
  } else {
    // 其他请求（API、页面导航）走网络
    event.respondWith(fetch(request).catch(() => {
      // 离线时返回 index.html（SPA 回退）
      return caches.match('/index.html')
    }))
  }
})
