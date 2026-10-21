/* 十九年目のネガ — 動画パート（VID）と暗室ミニゲーム（PLAY）
   動画は assets/video/<名前>.mp4。置いたら assets/video/manifest.js に名前を足す（無い動画は通信せず「準備中」の枠＋文字説明）。 */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const FILES = () => window.VIDEO_FILES || {};
  let ctx = null;
  const st = () => ctx.S();

  /* ---------- 動画 ---------- */
  const STORY = {
    story_opening: '雪の夜の那珂湊。1両の湊線が、オレンジの窓明かりで鉄橋を渡っていく。古い写真館の窓が明るい。店先で、白い猫が丸くなってしっぽをゆらす。',
    story_mid: '夜明け前の家の庭。干し芋の棚から湯気。青いシートに雪。台所の窓の明かりと、ストーブのやかん。母の手が、干し芋を1枚ずつ並べていく。',
    story_darkroom: '写真館の暗室。赤いセーフライト。ロープに吊られたフィルムがゆれ、現像バットの液面に赤い光。戸のすき間から、猫がのぞいている。',
    story_final: '夜の刑事課。誰もいない机と卓上ランプ。引き出しの奥から、茶封筒が少しのぞく。窓の外は雪。',
    story_ending: '平磯の岩場の日の出。波と海鳥。砂浜に、2人分の足あとが並んで続いていく。岩の上で、黄色い毛糸のポンポンが朝日に光る。',
  };
  function html(name, o) {
    o = o || {};
    const desc = o.desc || STORY[name] || '';
    const stamp = o.stamp ? ` data-stamp="${esc(o.stamp.join('|'))}"` : '';
    return `<figure class="vid vid-${o.frame || 'story'}" data-vid="${name}"${stamp}>
  <div class="vid-box">
    <video muted playsinline preload="none" aria-label="${esc(o.cap || '動画')}"></video>
    ${o.telop ? `<div class="vid-telop" aria-hidden="true">${esc(o.telop)}</div>` : ''}
    ${o.stamp ? `<div class="vid-stamp" aria-hidden="true">${esc(o.stamp[0])}</div><div class="vid-rec" aria-hidden="true">● P-REC</div>` : ''}
    <div class="vid-ph"><p class="vid-ph-h">🎬 映像（準備中）</p><p class="vid-ph-d">${esc(desc)}</p></div>
  </div>
  <div class="vid-ctl" role="group" aria-label="動画の操作">
    <button type="button" class="tool" data-vidt="play">▶ 再生</button>
    <button type="button" class="tool ghost" data-vidt="replay">↺ 最初から</button>
    <input type="range" class="vid-seek" min="0" max="1000" step="1" value="0" aria-label="コマ送り（場面を選ぶ）">
    <span class="vid-t" aria-hidden="true">0.0秒</span>
  </div>
  ${o.cap ? `<figcaption>${esc(o.cap)}</figcaption>` : ''}
  <details class="sr-text"><summary>映像を文字で読む</summary><p>${esc(desc)}</p></details>
</figure>`;
  }
  const hms = (s) => { const [h, m, x] = s.split(' ').pop().split(':').map(Number); return h * 3600 + m * 60 + (x || 0); };
  const fmt = (t) => { t = Math.round(t); const p = (n) => String(n).padStart(2, '0'); return `${p(Math.floor(t / 3600))}:${p(Math.floor(t / 60) % 60)}:${p(t % 60)}`; };
  function stampAt(fig, frac) {
    const s = fig.dataset.stamp; if (!s) return;
    const [a, b] = s.split('|'); const day = a.includes(' ') ? a.split(' ')[0] + ' ' : '';
    $('.vid-stamp', fig).textContent = day + fmt(hms(a) + (hms(b) - hms(a)) * Math.max(0, Math.min(1, frac)));
  }
  function vidUpdate(fig) {
    const v = $('video', fig); const d = v.duration || 0;
    const f = d ? v.currentTime / d : 0;
    $('.vid-seek', fig).value = String(Math.round(f * 1000));
    $('.vid-t', fig).textContent = `${v.currentTime.toFixed(1)}秒`;
    $('[data-vidt="play"]', fig).textContent = v.paused ? '▶ 再生' : '❚❚ 止める';
    stampAt(fig, f);
  }
  let io = null;
  function setup(fig) {
    if (fig.dataset.ready) return; fig.dataset.ready = '1';
    const name = fig.dataset.vid; const have = FILES()[name];
    const v = $('video', fig);
    if (!have) {
      fig.classList.add('missing');
      $$('.vid-ctl button, .vid-seek', fig).forEach((b) => { b.disabled = true; });
      return;
    }
    fig.classList.add('has-file');
    if (have && have.poster) v.poster = `assets/video/${name}.jpg`;
    v.addEventListener('timeupdate', () => vidUpdate(fig));
    v.addEventListener('play', () => vidUpdate(fig));
    v.addEventListener('pause', () => vidUpdate(fig));
    v.addEventListener('loadedmetadata', () => { fig.classList.add('loaded'); vidUpdate(fig); });
    v.addEventListener('error', () => { fig.classList.add('missing'); fig.classList.remove('has-file'); });
    if (io) io.observe(fig);
  }
  function load(fig) { const v = $('video', fig); if (!v.src) { v.src = `assets/video/${fig.dataset.vid}.mp4`; v.preload = 'auto'; } return v; }
  function scan(root) { $$('figure.vid', root || document).forEach(setup); }
  function onClick(e) {
    const b = e.target.closest('[data-vidt]'); if (!b) return;
    const fig = b.closest('figure.vid'); if (!fig || fig.classList.contains('missing')) return;
    const v = load(fig);
    if (b.dataset.vidt === 'replay') { v.currentTime = 0; v.play().catch(() => {}); }
    else if (v.paused) v.play().catch(() => {}); else v.pause();
  }
  function onSeek(e) {
    const r = e.target; if (!r.classList || !r.classList.contains('vid-seek')) return;
    const fig = r.closest('figure.vid'); const v = load(fig);
    v.pause();
    const go = () => { v.currentTime = (+r.value / 1000) * (v.duration || 0); vidUpdate(fig); };
    if (v.readyState >= 1) go(); else v.addEventListener('loadedmetadata', go, { once: true });
  }

  /* ---------- 暗室ミニゲーム：印画紙を現像液に入れ、ちょうどいい濃さで引き上げる ---------- */
  const MODES = {
    normal: { ms: 6000, lo: 0.58, hi: 0.74, label: 'ふつう' },
    slow: { ms: 12000, lo: 0.52, hi: 0.80, label: 'ゆっくり' },
  };
  const runs = {};
  function drState(id) { const S = st(); S.dr = S.dr || {}; if (!S.dr[id]) S.dr[id] = { won: false, fails: 0, mode: 'normal' }; return S.dr[id]; }
  function darkroom(id, o) {
    return `<figure class="darkroom" data-dr="${id}">
  <div class="dr-room">
    <div class="dr-tray"><div class="dr-print"><div class="dr-img">${o.print}</div><div class="dr-black"></div></div></div>
    <div class="dr-meter" aria-hidden="true"><div class="dr-zone"></div><div class="dr-needle"></div><span class="dr-l">うすい</span><span class="dr-r">こい</span></div>
  </div>
  <div class="dr-ctl" role="group" aria-label="暗室の操作">
    <button type="button" class="tool big" data-drt="start">▶ 現像液に入れる</button>
    <button type="button" class="tool big" data-drt="pull" disabled>✋ 引き上げる</button>
    <button type="button" class="tool" data-drt="mode" hidden>🐢 ゆっくりモードにする</button>
    <button type="button" class="tool ghost" data-drt="again" hidden>↺ もう1枚</button>
  </div>
  <label class="dr-manual" hidden><span>✋ 自分の手でゆらす（ゆっくり進める）</span><input type="range" min="0" max="100" step="1" value="0" aria-label="現像の進み具合"></label>
  <p class="dr-msg" aria-live="polite">赤いランプの下。印画紙を現像液に入れると、絵がだんだん浮かんでくる。<b>メーターの金色の帯</b>のあいだで引き上げよう。</p>
  ${o.cap ? `<figcaption>${o.cap}</figcaption>` : ''}
  <details class="sr-text dr-desc" hidden><summary>プリントを文字で読む</summary><p>${o.desc}</p></details>
</figure>`;
  }
  function drPaint(fig, p) {
    const img = $('.dr-img', fig), blk = $('.dr-black', fig);
    img.style.opacity = String(Math.min(1, Math.max(0, p / 0.62)));
    blk.style.opacity = String(Math.min(0.97, Math.max(0, (p - 0.74) / 0.22)));
    $('.dr-needle', fig).style.left = `${(p * 100).toFixed(1)}%`;
  }
  function drApply(fig) {
    const id = fig.dataset.dr; const d = drState(id); const m = MODES[d.mode];
    const z = $('.dr-zone', fig); z.style.left = `${m.lo * 100}%`; z.style.width = `${(m.hi - m.lo) * 100}%`;
    fig.classList.toggle('won', d.won);
    const start = $('[data-drt="start"]', fig), pull = $('[data-drt="pull"]', fig), mode = $('[data-drt="mode"]', fig), again = $('[data-drt="again"]', fig), man = $('.dr-manual', fig);
    if (d.won) {
      drPaint(fig, 0.66); start.hidden = true; pull.hidden = true; mode.hidden = true; again.hidden = true; man.hidden = true;
      $('.dr-desc', fig).hidden = false;
      if (fig.dataset.wonShown) return; fig.dataset.wonShown = '1';
      $('.dr-msg', fig).innerHTML = 'できた！ 停止液、定着液、水洗い。……潮見さんが焼こうとしていた写真の、<b>はしっこの一部</b>（テストプリント）が浮かんだ。';
      return;
    }
    if (!runs[id] && !fig.dataset.after) { drPaint(fig, 0); start.hidden = false; start.disabled = false; pull.disabled = true; }
    mode.hidden = !(d.fails >= 2 && d.mode === 'normal');
    man.hidden = d.fails < 4;
  }
  function drFinish(fig, p) {
    const id = fig.dataset.dr; const d = drState(id); const m = MODES[d.mode];
    const r = runs[id]; if (r) { cancelAnimationFrame(r.raf); delete runs[id]; }
    $('[data-drt="pull"]', fig).disabled = true;
    const msg = $('.dr-msg', fig);
    if (p >= m.lo && p <= m.hi) { d.won = true; ctx.save(); drApply(fig); return; }
    d.fails++; fig.dataset.after = '1'; ctx.save();
    msg.textContent = p < m.lo ? 'まだ早い。絵がうすくて、何も見えない。……ポジが「にゃ」と首をかしげた。' : 'こすぎた！ 真っ黒。……ポジがしっぽで顔をかくした。';
    if (d.fails >= 2 && d.mode === 'normal') msg.textContent += '　（むずかしければ「ゆっくりモード」もあるよ）';
    if (d.fails >= 4) msg.textContent += '　（下のつまみで、自分のペースでも進められる）';
    $('[data-drt="again"]', fig).hidden = false; $('[data-drt="start"]', fig).hidden = true;
    drApply(fig);
  }
  function drStart(fig) {
    const id = fig.dataset.dr; const d = drState(id); const m = MODES[d.mode];
    delete fig.dataset.after;
    $('[data-drt="start"]', fig).hidden = true; $('[data-drt="again"]', fig).hidden = true;
    $('[data-drt="pull"]', fig).disabled = false; $('[data-drt="pull"]', fig).focus();
    $('.dr-msg', fig).textContent = 'ちゃぷん。……絵が浮かんでくる。帯のあいだで「引き上げる」！';
    const t0 = performance.now();
    const r = runs[id] = { p: 0, raf: 0 };
    const tick = (t) => {
      r.p = Math.min(1, (t - t0) / m.ms); drPaint(fig, r.p);
      if (r.p >= 1) { drFinish(fig, 1); return; }
      r.raf = requestAnimationFrame(tick);
    };
    r.raf = requestAnimationFrame(tick);
  }
  function drClick(b) {
    const fig = b.closest('figure.darkroom'); const id = fig.dataset.dr; const d = drState(id); const t = b.dataset.drt;
    if (t === 'start' || t === 'again') { if (t === 'again') { drPaint(fig, 0); } drStart(fig); }
    else if (t === 'pull') { const r = runs[id]; drFinish(fig, r ? r.p : +$('.dr-manual input', fig).value / 100); }
    else if (t === 'mode') { d.mode = 'slow'; ctx.save(); $('.dr-msg', fig).textContent = 'ゆっくりモード。絵が浮かぶのがゆっくりになって、帯も広くなった。'; drApply(fig); }
  }
  function drManual(r) {
    const fig = r.closest('figure.darkroom'); const id = fig.dataset.dr;
    if (runs[id]) { cancelAnimationFrame(runs[id].raf); delete runs[id]; }
    fig.dataset.after = '1'; const p = +r.value / 100; drPaint(fig, p);
    $('[data-drt="pull"]', fig).disabled = false; $('[data-drt="start"]', fig).hidden = true;
  }

  function apply(root) { scan(root); $$('figure.darkroom', root || document).forEach(drApply); }
  function init(c) {
    ctx = c;
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver((es) => es.forEach((e) => {
        const fig = e.target; const v = $('video', fig);
        if (e.isIntersecting && e.intersectionRatio >= 0.5) {
          if (!fig.dataset.auto && !(ctx.reduced && ctx.reduced())) { fig.dataset.auto = '1'; load(fig); v.play().catch(() => {}); }
        } else if (v && !v.paused) v.pause();
      }), { threshold: [0, 0.5] });
    }
    new MutationObserver((ms) => { if (ms.some((m) => m.addedNodes.length)) apply(document); }).observe(document.body, { childList: true, subtree: true });
    document.addEventListener('click', (e) => {
      onClick(e);
      const b = e.target.closest('[data-drt]'); if (b) drClick(b);
    });
    document.addEventListener('input', (e) => {
      onSeek(e);
      if (e.target.closest && e.target.closest('.dr-manual')) drManual(e.target);
    });
    apply(document);
  }
  window.VID = { html, scan, STORY };
  window.PLAY = { darkroom, init, apply, won: (id) => !!(ctx && st().dr && st().dr[id] && st().dr[id].won) };
})();
