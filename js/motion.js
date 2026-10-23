/* 十九年目のネガ v9.4 — 動き（短く・タップで飛ばせる・「動きを減らす」では出さない）
   transform と opacity だけを動かす（スマホでもカクつかない）。動きは答えを見せない：いま画面にある状態を、気持ちよく見せるだけ。 */
(function () {
  'use strict';
  let red = () => false;
  const live = new Set();
  const can = () => typeof Element !== 'undefined' && typeof Element.prototype.animate === 'function';
  const on = () => can() && !red() && !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const EASE = 'cubic-bezier(.2,.75,.25,1)';
  function play(el, kf, o) {
    if (!el || !on()) return null;
    let a;
    try { a = el.animate(kf, Object.assign({ duration: 300, easing: EASE }, o)); } catch (e) { return null; }
    live.add(a);
    const done = () => live.delete(a);
    a.finished.then(done, done);
    return a;
  }
  function skip() { live.forEach((a) => { try { a.finish(); } catch (e) { try { a.cancel(); } catch (er) {} } }); }
  const skipFns = new Set();
  // 動いている途中にどこかをタップしたら、すぐ終わりの形にする（待たせない）
  document.addEventListener('pointerdown', () => { if (live.size) skip(); skipFns.forEach((f) => f()); }, true);
  // Esc：動いている途中なら、とばすだけ（資料は閉じない）。止まっているときは、いつもの Esc
  document.addEventListener('keydown', (e) => { if (e.key !== 'Escape') return; const busy = !!document.querySelector('.fold-stage, .ch-card'); skip(); skipFns.forEach((f) => f()); if (busy) { e.preventDefault(); e.stopImmediatePropagation(); } }, true);

  const K = {
    // 紙がすべりこむ（机に置く）
    paper: [{ transform: 'translate3d(0,22px,0) rotate(-1.4deg)', opacity: 0 }, { transform: 'none', opacity: 1 }],
    // 紙をめくる（次の資料・前の資料）
    turnL: [{ transform: 'translate3d(34px,0,0) rotate(1.2deg)', opacity: 0 }, { transform: 'none', opacity: 1 }],
    turnR: [{ transform: 'translate3d(-34px,0,0) rotate(-1.2deg)', opacity: 0 }, { transform: 'none', opacity: 1 }],
    // 届いたカードが、机に落ちてくる
    drop: [{ transform: 'translate3d(0,-16px,0) rotate(3deg) scale(1.05)', opacity: 0 }, { transform: 'translate3d(0,2px,0) rotate(-.6deg)', opacity: 1, offset: 0.72 }, { transform: 'none', opacity: 1 }],
    // メモがひらく（上から下へ）
    unfold: [{ transform: 'perspective(600px) rotateX(-70deg)', opacity: 0 }, { transform: 'perspective(600px) rotateX(8deg)', opacity: 1, offset: 0.7 }, { transform: 'none', opacity: 1 }],
    pop: [{ transform: 'scale(.92)', opacity: 0 }, { transform: 'scale(1.02)', opacity: 1, offset: 0.7 }, { transform: 'none', opacity: 1 }],
    fadeUp: [{ transform: 'translate3d(0,10px,0)', opacity: 0 }, { transform: 'none', opacity: 1 }],
    // 紙をはじく（まちがい）
    shake: [{ transform: 'none' }, { transform: 'translate3d(-7px,0,0) rotate(-.5deg)' }, { transform: 'translate3d(6px,0,0) rotate(.4deg)' }, { transform: 'translate3d(-4px,0,0)' }, { transform: 'translate3d(2px,0,0)' }, { transform: 'none' }],
    // ハンコを押す
    stamp: [{ transform: 'rotate(-12deg) scale(2.1)', opacity: 0 }, { transform: 'rotate(-12deg) scale(.94)', opacity: 1, offset: 0.62 }, { transform: 'rotate(-12deg) scale(1.03)', opacity: 1, offset: 0.82 }, { transform: 'rotate(-12deg) scale(1)', opacity: 1 }],
    thump: [{ transform: 'none' }, { transform: 'translate3d(0,2px,0) scale(.992)', offset: 0.35 }, { transform: 'none' }],
  };
  function enter(el, kind, o) { return play(el, K[kind] || K.paper, Object.assign({ duration: 280 }, o)); }
  function stagger(els, kind, gap, o) { const d0 = (o && o.delay) || 0; (els || []).filter(Boolean).forEach((el, i) => enter(el, kind, Object.assign({ fill: 'backwards' }, o, { delay: d0 + i * (gap || 50) }))); }
  const stampAt = (deg) => [{ transform: `rotate(${deg}deg) scale(2.1)`, opacity: 0 }, { transform: `rotate(${deg}deg) scale(.94)`, opacity: 1, offset: 0.62 }, { transform: `rotate(${deg}deg) scale(1.03)`, opacity: 1, offset: 0.82 }, { transform: `rotate(${deg}deg) scale(1)`, opacity: 1 }];

  /* 章の扉（タイトルカード）。1秒ほどで消える。タップで飛ばせる。操作はさまたげない */
  function titleCard(no, title, sub) {
    if (!on()) return null;
    const old = document.querySelector('.ch-card'); if (old) old.remove();
    const el = document.createElement('div');
    el.className = 'ch-card'; el.setAttribute('aria-hidden', 'true');
    el.innerHTML = `<div class="ch-in"><span class="ch-no">${no}</span><span class="ch-t">${title}</span>${sub ? `<span class="ch-s">${sub}</span>` : ''}</div>`;
    document.body.appendChild(el);
    const inner = el.firstChild;
    const end = () => { skipFns.delete(end); if (el.isConnected) el.remove(); };
    skipFns.add(end);
    const a = play(el, [{ opacity: 0 }, { opacity: 1, offset: 0.16 }, { opacity: 1, offset: 0.8 }, { opacity: 0 }], { duration: 1500, easing: 'linear' });
    play(inner, [{ transform: 'translate3d(0,18px,0) rotate(-2deg)', opacity: 0 }, { transform: 'rotate(-1deg)', opacity: 1, offset: 0.2 }, { transform: 'rotate(-1deg)', opacity: 1, offset: 0.8 }, { transform: 'translate3d(0,-8px,0) rotate(-1deg)', opacity: 0 }], { duration: 1500, easing: 'ease-out' });
    if (a) a.finished.then(end, end); else end();
    return el;
  }

  /* 赤えんぴつの印（まちがい）：線をさっと引く */
  function pencil(host) {
    if (!host || !on()) return;
    const old = host.querySelector('.red-pencil'); if (old) old.remove();
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 120 30'); s.setAttribute('class', 'red-pencil'); s.setAttribute('aria-hidden', 'true');
    s.innerHTML = '<path d="M4 20 C 22 12, 40 24, 58 15 S 96 10, 116 17" pathLength="1"/><path d="M14 26 C 40 20, 70 27, 104 21" pathLength="1"/>';
    host.appendChild(s);
    const ps = s.querySelectorAll('path');
    ps.forEach((p, i) => play(p, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 220, delay: 60 + i * 120, easing: 'ease-out', fill: 'backwards' }));
    const a = play(s, [{ opacity: 1 }, { opacity: 1, offset: 0.75 }, { opacity: 0 }], { duration: 1400, easing: 'linear' });
    const rm = () => s.remove();
    if (a) a.finished.then(rm, rm); else rm();
  }

  window.MO = { stampAt, init: (c) => { if (c && c.reduced) red = c.reduced; }, on, play, skip, enter, stagger, titleCard, pencil, K, onSkip: (f) => skipFns.add(f), offSkip: (f) => skipFns.delete(f) };
})();
