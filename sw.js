// 十九年目のネガ：オフライン用の service worker（build/release.js が作る）。版 65d86c8f246b
const CACHE = "nazo-65d86c8f246b";
const PRECACHE = ["index.html","manifest.webmanifest","credits.txt","js/app.dbba088382.js","css/app.1d10b04edb.css","css/fonts.fb7e05091a.css","assets/audio/list.json","assets/audio/drip.mp3","assets/audio/page.mp3","assets/audio/page_long.mp3","assets/audio/peel.mp3","assets/audio/sea.mp3","assets/audio/shutter.mp3","assets/audio/stamp.mp3","assets/fonts/bizudmincho-400.woff2","assets/fonts/bizudmincho-700.woff2","assets/fonts/bizudpgothic-400.woff2","assets/fonts/bizudpgothic-700.woff2","assets/fonts/kleeone-400.woff2","assets/fonts/OFL.txt","assets/fonts/shipporiminchob1-800.woff2","assets/fonts/title-shippori-800.woff2","assets/fonts/ui-bizudpgothic-400.woff2","assets/fonts/ui-bizudpgothic-700.woff2","assets/icons/apple-touch-icon.png","assets/icons/favicon-32.png","assets/icons/favicon.svg","assets/icons/icon-192.png","assets/icons/icon-512.png","assets/icons/icon-maskable-512.png","assets/icons/icon.svg","assets/img/contact_sheet.webp","assets/img/grain.webp","assets/img/ogp_1200x630.jpg","assets/img/paper.png","assets/img/posi_ink.svg","assets/img/posi_line.svg","assets/video/clue_dashcam_a.jpg","assets/video/clue_dashcam_a.mp4","assets/video/clue_dashcam_b.jpg","assets/video/clue_dashcam_b.mp4","assets/video/clue_news.jpg","assets/video/clue_news.mp4","assets/video/story_darkroom.jpg","assets/video/story_darkroom.mp4","assets/video/story_ending.jpg","assets/video/story_ending.mp4","assets/video/story_final.jpg","assets/video/story_final.mp4","assets/video/story_mid.jpg","assets/video/story_mid.mp4","assets/video/story_opening.jpg","assets/video/story_opening.mp4"];
const INDEX = new URL("index.html", self.registration.scope).href;
self.addEventListener("install", (e) => {
  // 新しい版は、古い版を使っている画面が閉じられてから入れ替わる（skipWaiting はしない）
  e.waitUntil(caches.open(CACHE).then((c) => Promise.all(PRECACHE.map((p) => c.add(new Request(p, { cache: "reload" }))))));
});
self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    const old = (await caches.keys()).filter((k) => k.startsWith("nazo-") && k !== CACHE);
    await Promise.all(old.map((k) => caches.delete(k)));
    if (!old.length) await self.clients.claim(); // 初めての版だけ、開いている画面を制御する
  })());
});
self.addEventListener("fetch", (e) => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== self.location.origin) return;
  e.respondWith(serve(req, url));
});
async function serve(req, url) {
  const cache = await caches.open(CACHE);
  const key = req.mode === "navigate" ? INDEX : url.origin + url.pathname;
  const res = await cache.match(key);
  if (!res) {
    try { return await fetch(req); }
    catch (err) { return new Response("オフラインです。この部分は、まだ保存されていません。", { status: 504, headers: { "Content-Type": "text/plain; charset=utf-8" } }); }
  }
  return req.headers.has("range") ? ranged(req, res) : res;
}
// 動画は Range で読まれる。保存してあるのは全体なので、範囲だけ切って 206 で返す
async function ranged(req, res) {
  const m = /bytes=(\d*)-(\d*)/.exec(req.headers.get("range") || "");
  if (!m) return res;
  const buf = await res.arrayBuffer(), n = buf.byteLength;
  let s, e;
  if (m[1] === "") { s = Math.max(0, n - Number(m[2])); e = n - 1; }
  else { s = Number(m[1]); e = m[2] === "" ? n - 1 : Math.min(Number(m[2]), n - 1); }
  if (s > e || s >= n) return new Response(null, { status: 416, headers: { "Content-Range": "bytes */" + n } });
  const h = new Headers(res.headers);
  h.set("Content-Range", "bytes " + s + "-" + e + "/" + n); h.set("Content-Length", String(e - s + 1)); h.set("Accept-Ranges", "bytes");
  return new Response(buf.slice(s, e + 1), { status: 206, statusText: "Partial Content", headers: h });
}
