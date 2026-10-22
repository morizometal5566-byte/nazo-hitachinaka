/* 十九年目のネガ — 資料の道具：重ねる（ドラッグ・回す・裏返す）／なぞる／現像する／かけらを並べる／ネガ
   タッチ・マウス・キーボードのどれでも使える。状態は保存データ（S）に入れる。 */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  let ctx = null; // { S:()=>state, save:()=>void, cb:()=>bool }
  const st = () => ctx.S();

  /* ---------- 重ねる ---------- */
  const J = (el, k) => JSON.parse(el.dataset[k]);
  function ovState(fig) {
    const S = st(); S.ov = S.ov || {};
    const id = fig.dataset.ov;
    if (!S.ov[id]) S.ov[id] = Object.assign({}, J(fig, 'init'));
    return S.ov[id];
  }
  function ovSnapped(fig, o) {
    const sn = J(fig, 'snap');
    const rr = ((o.r % 360) + 360) % 360;
    return Math.abs(o.x - sn.x) <= sn.tol && Math.abs(o.y - sn.y) <= sn.tol && (sn.rs ? sn.rs.includes(rr) : rr === sn.r) && (sn.fs || !!o.f === !!sn.f);
  }
  function ovApply(fig) {
    const o = ovState(fig);
    const [px, py] = fig.dataset.pivot.split(',').map(Number);
    const sn = J(fig, 'snap');
    const ok = ovSnapped(fig, o);
    if (ok) { o.x = sn.x; o.y = sn.y; }
    const xf = $('.ov-xf', fig);
    xf.setAttribute('transform', `translate(${o.x} ${o.y}) rotate(${o.r} ${px} ${py})${o.f ? ` translate(${px} ${py}) scale(-1 1) translate(${-px} ${-py})` : ''}`);
    fig.classList.toggle('snapped', ok);
    const okEl = $('.ov-ok', fig); if (okEl) okEl.hidden = !ok;
    const a = [];
    const rr = ((o.r % 360) + 360) % 360; if (rr) a.push(`${rr}°`);
    a.unshift(o.f ? '裏（裏返した）' : '表');
    $('.ov-state', fig).textContent = 'いま：' + a.join('・') + (ok ? '　✓ ぴったり' : '');
    fig.classList.toggle('is-flipped', !!o.f);
    return ok;
  }
  function svgScale(svg) {
    const vb = svg.viewBox.baseVal; const r = svg.getBoundingClientRect();
    return r.width ? vb.width / r.width : 1;
  }
  let drag = null;
  function onDown(e) {
    const sh = e.target.closest('.ov-sheet');
    if (sh) {
      const fig = sh.closest('figure.ov'); const svg = sh.ownerSVGElement;
      const o = ovState(fig);
      drag = { fig, o, x0: e.clientX, y0: e.clientY, ox: o.x, oy: o.y, k: svgScale(svg), id: e.pointerId };
      try { sh.setPointerCapture(e.pointerId); } catch (er) {}
      fig.classList.add('dragging');
      e.preventDefault();
      return;
    }
    const tr = e.target.closest('figure.trace svg');
    if (tr) { traceAt(tr, e); tr._tracing = e.pointerId; try { tr.setPointerCapture(e.pointerId); } catch (er) {} }
  }
  function onMove(e) {
    if (drag && e.pointerId === drag.id) {
      drag.o.x = Math.round(drag.ox + (e.clientX - drag.x0) * drag.k);
      drag.o.y = Math.round(drag.oy + (e.clientY - drag.y0) * drag.k);
      // 位置は先にそろえてから、回転・裏返しが合っていればピタッと吸いつく
      ovApply(drag.fig);
      return;
    }
    const tr = e.target.closest && e.target.closest('figure.trace svg');
    const cap = $$('figure.trace svg').find((s) => s._tracing === e.pointerId);
    if (cap) traceAt(cap, e); else if (tr && e.pointerType === 'mouse') traceAt(tr, e);
  }
  function onUp(e) {
    if (drag && e.pointerId === drag.id) { drag.fig.classList.remove('dragging'); ovApply(drag.fig); drag = null; ctx.save(); }
    $$('figure.trace svg').forEach((s) => { if (s._tracing === e.pointerId) s._tracing = null; });
  }
  function ovTool(b) {
    const fig = b.closest('figure.ov'); const o = ovState(fig); const sn = J(fig, 'snap');
    const t = b.dataset.ovt;
    if (t === 'rr') o.r = (o.r + 90) % 360;
    else if (t === 'rl') o.r = (o.r + 270) % 360;
    else if (t === 'flip') { o.f = !o.f; fig.classList.remove('flipanim'); void fig.getBoundingClientRect(); fig.classList.add('flipanim'); clearTimeout(fig._fa); fig._fa = setTimeout(() => fig.classList.remove('flipanim'), 600); }
    else if (t === 'align') { o.x = sn.x; o.y = sn.y; }
    else Object.assign(o, J(fig, 'init'));
    ovApply(fig); ctx.save();
  }
  function ovKey(e) {
    const sh = e.target.closest && e.target.closest('.ov-sheet');
    if (!sh) return;
    const d = { ArrowLeft: [-6, 0], ArrowRight: [6, 0], ArrowUp: [0, -6], ArrowDown: [0, 6] }[e.key];
    const fig = sh.closest('figure.ov');
    if (d) { e.preventDefault(); const o = ovState(fig); o.x += d[0]; o.y += d[1]; ovApply(fig); ctx.save(); }
    else if (e.key === 'r' || e.key === 'R') { e.preventDefault(); const o = ovState(fig); o.r = (o.r + 90) % 360; ovApply(fig); ctx.save(); }
  }

  /* ---------- なぞる（ダイヤ図） ---------- */
  function traceSel(svg, g) {
    $$('.trn', svg).forEach((x) => x.classList.toggle('on', x === g));
    const fig = svg.closest('figure.trace');
    const out = $('.trace-out', fig);
    if (g) { out.textContent = g.dataset.info; const S = st(); S.trace = S.trace || {}; S.trace[fig.dataset.trace] = g.dataset.trn; }
  }
  function traceAt(svg, e) {
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const g = el && el.closest && el.closest('.trn');
    const dot = $('.trn-dot', svg);
    const r = svg.getBoundingClientRect(), k = svgScale(svg);
    if (dot) { dot.setAttribute('transform', `translate(${(e.clientX - r.left) * k} ${(e.clientY - r.top) * k})`); dot.setAttribute('visibility', g ? 'visible' : 'hidden'); }
    if (g) traceSel(svg, g);
  }

  /* ---------- 現像（明るさ） ---------- */
  function devApply(fig, v) {
    const S = st(); S.dev = S.dev || {};
    if (v != null) S.dev[fig.dataset.dev] = v;
    const d = (S.dev[fig.dataset.dev] || 0) / 100;
    fig.style.setProperty('--d', d);
    $('input[type=range]', fig).value = Math.round(d * 100);
    $('.dev-val', fig).textContent = Math.round(d * 100);
  }

  /* ---------- かけら ---------- */
  const FR0 = { order: [2, 0, 1], rot: [1, 2, 3] };
  let swapSel = null, swapMode = false;
  function frState(fig) { const S = st(); S.fr = S.fr || {}; const id = fig.dataset.frags; if (!S.fr[id]) S.fr[id] = JSON.parse(JSON.stringify(FR0)); return S.fr[id]; }
  const frOk = (f) => f.order.join() === '0,1,2' && f.rot.every((r) => r % 4 === 0);
  function frApply(fig) {
    const f = frState(fig);
    $$('.frag', fig).forEach((b) => {
      const i = +b.dataset.fi;
      b.style.order = f.order.indexOf(i);
      $('svg', b).style.transform = `rotate(${(f.rot[i] % 4) * 90}deg)`;
      b.classList.toggle('sel', swapSel === i);
      b.setAttribute('aria-label', `かけら${i + 1}（${f.order.indexOf(i) + 1}番目・${(f.rot[i] % 4) * 90}°）`);
    });
    const ok = frOk(f);
    fig.classList.toggle('snapped', ok);
    $('.ov-ok', fig).hidden = !ok;
    const sb = $('[data-fragt="swap"]', fig); sb.setAttribute('aria-pressed', String(swapMode));
    $('.frag-state', fig).textContent = ok ? '✓ つながった' : swapMode ? (swapSel == null ? '入れかえる1つ目をタップ' : '2つ目をタップ') : '';
  }
  function fragClick(b) {
    const fig = b.closest('figure.frags'); const f = frState(fig);
    if (frOk(f)) return;
    const i = +b.dataset.fi;
    if (swapMode) {
      if (swapSel == null) swapSel = i;
      else if (swapSel === i) swapSel = null;
      else { const a = f.order.indexOf(swapSel), c = f.order.indexOf(i); [f.order[a], f.order[c]] = [f.order[c], f.order[a]]; swapSel = null; swapMode = false; }
    } else f.rot[i] = (f.rot[i] + 1) % 4;
    frApply(fig); ctx.save();
  }
  function fragTool(b) {
    const fig = b.closest('figure.frags');
    if (b.dataset.fragt === 'swap') { swapMode = !swapMode; swapSel = null; }
    else { const S = st(); S.fr[fig.dataset.frags] = JSON.parse(JSON.stringify(FR0)); swapMode = false; swapSel = null; }
    frApply(fig); ctx.save();
  }

  /* ---------- ネガ ---------- */
  function negState() { const S = st(); if (!S.neg) S.neg = { r: 2, f: true, d: 0 }; return S.neg; }
  const negOk = (n) => n.r % 4 === 0 && !n.f && n.d >= 85;
  function negApply(fig) {
    const n = negState();
    const g = $('.neg-g', fig);
    g.setAttribute('transform', `rotate(${(n.r % 4) * 90} 300 200)${n.f ? ' translate(600 0) scale(-1 1)' : ''}`);
    $('.neg-frame', fig).style.filter = `grayscale(1) invert(${(1 - n.d / 100).toFixed(2)})`; // 白黒フィルム：色は出ない
    $('input[type=range]', fig).value = n.d; $('.dev-val', fig).textContent = n.d;
    const ok = negOk(n);
    fig.classList.toggle('snapped', ok);
        $('.ov-ok', fig).hidden = !ok;
    const desc = $('.neg-desc', fig); if (desc) desc.hidden = !ok;
    const a = []; if (n.r % 4) a.push(`${(n.r % 4) * 90}°`); if (n.f) a.push('裏返し'); a.push(n.d < 15 ? 'ネガ' : n.d < 85 ? '現像中' : 'ポジ');
    $('.neg-state', fig).textContent = 'いま：' + a.join('・') + (ok ? '　✓' : '');
  }
  function negTool(b) {
    const fig = b.closest('figure.neg'); const n = negState();
    const t = b.dataset.negt;
    if (t === 'rot') n.r = (n.r + 1) % 4; else if (t === 'flip') n.f = !n.f; else { n.r = 2; n.f = true; n.d = 0; }
    negApply(fig); ctx.save();
  }

  /* ---------- まとめ ---------- */
  function apply(root) {
    root = root || document;
    $$('figure.ov', root).forEach(ovApply);
    $$('figure.dev', root).forEach((f) => devApply(f));
    $$('figure.frags', root).forEach(frApply);
    $$('figure.neg', root).forEach(negApply);
    $$('figure.trace', root).forEach((fig) => {
      const svg = $('svg', fig);
      $$('.trn', svg).forEach((g) => { g.setAttribute('tabindex', '0'); g.setAttribute('role', 'button'); g.setAttribute('aria-label', g.dataset.info); });
      const S = st(); const sel = S.trace && S.trace[fig.dataset.trace];
      if (sel) traceSel(svg, $(`.trn[data-trn="${sel}"]`, svg));
    });
  }
  function init(c) {
    ctx = c;
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    document.addEventListener('pointercancel', onUp);
    document.addEventListener('keydown', (e) => {
      ovKey(e);
      const g = e.target.closest && e.target.closest('figure.trace .trn');
      if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); traceSel(g.ownerSVGElement, g); ctx.save(); }
    });
    document.addEventListener('focusin', (e) => { const g = e.target.closest && e.target.closest('figure.trace .trn'); if (g) traceSel(g.ownerSVGElement, g); });
    document.addEventListener('click', (e) => {
      let b;
      if ((b = e.target.closest('[data-ovt]'))) return ovTool(b);
      if ((b = e.target.closest('[data-fragt]'))) return fragTool(b);
      if ((b = e.target.closest('.frag'))) return fragClick(b);
      if ((b = e.target.closest('[data-negt]'))) return negTool(b);
      if (e.target.closest('figure.trace')) ctx.save();
    });
    document.addEventListener('input', (e) => {
      const r = e.target;
      if (r.type !== 'range') return;
      const dv = r.closest('figure.dev'); if (dv) { devApply(dv, +r.value); return; }
      const ng = r.closest('figure.neg'); if (ng) { negState().d = +r.value; negApply(ng); }
    });
    document.addEventListener('change', (e) => { if (e.target.type === 'range') ctx.save(); });
  }
  window.TOOLS = { init, apply, ovSnapped: (id) => { const f = $(`figure.ov[data-ov="${id}"]`); return f ? ovSnapped(f, ovState(f)) : false; } };
})();
