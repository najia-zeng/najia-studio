/* 娜家视觉工具 · PWA 安装用透明 Service Worker
   注意：故意不做任何缓存，所有请求直接走网络，避免以后页面更新了客户看到旧版。
   它的唯一作用是满足浏览器「安装到桌面」的条件。 */
self.addEventListener('install', function (e) {
  self.skipWaiting();
});
self.addEventListener('activate', function (e) {
  e.waitUntil(self.clients.claim());
});
self.addEventListener('fetch', function (e) {
  /* pass-through：直接放行，不接管 */
});
