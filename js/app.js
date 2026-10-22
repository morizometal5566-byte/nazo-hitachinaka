/* 十九年目のネガ 完全版 — アプリ本体（素のJavaScript・サーバー不要・file:// でも動く）
   スマホ縦・片手が基本。上：見出し／まんなか：物語・資料・謎／下：答える（親指の届く場所） */
(function () {
  'use strict';
  const { DOCS, CHAT, STAGES } = window.CASE;
  const KEY = 'negative19.v9';
  const OLD_KEYS = ['negative19.v8', 'negative19.v7', 'negative19.v6'];
  const N = window.N19, ANS = window.ANS || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const mqDesk = window.matchMedia('(min-width: 900px)');
  const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ================= 保存 ================= */
  function fresh() {
    return {
      v: 9, phase: 'title', stage: 0, step: 0, solved: {}, chat: [], read: [],
      fold: {}, ph: {}, ov: {}, dev: {}, dr: {}, fr: {}, trace: {}, neg: null, flags: {}, choice: null,
      wrong: {}, hints: {}, drafts: {}, memo: '', pin: null, peek: false,
      settings: { font: 'm', contrast: false, motion: false, cb: false },
      view: { panes: [{ doc: null, zoom: 1 }, { doc: null, zoom: 1 }], compare: false, active: 0 },
      lastFb: null, savedAt: null,
    };
  }
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      const d = JSON.parse(raw);
      const f = fresh();
      if (d.v !== 9) return null;
      return Object.assign(f, d, { settings: Object.assign(f.settings, d.settings || {}), view: Object.assign(f.view, d.view || {}) });
    } catch (e) { return null; }
  }
  // 前の版（v8以前）のセーブは物語も章の数もちがうので使わない。消して、タイトルで一度だけお知らせする
  let oldSave = false;
  try { OLD_KEYS.forEach((k) => { if (localStorage.getItem(k)) { oldSave = true; localStorage.removeItem(k); } }); } catch (e) {}
  let S = load();
  const hadSave = !!(S && S.phase === 'game');
  if (!S) S = fresh();
  let resetting = false;
  function save() {
    if (resetting) return;
    S.savedAt = Date.now();
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* 容量不足など */ }
  }
  function wipe() { resetting = true; try { localStorage.removeItem(KEY); } catch (e) {} location.reload(); }
  const reduced = () => S.settings.motion || mqReduce.matches;
  const isPhone = () => !mqDesk.matches;

  /* ================= 判定（欄ごとに「そろえた形」にしてハッシュで照合。答えそのものはコードに置かない） ================= */
  const GENERIC = 'まだ合っていない。';
  const FORM_MSG = { time: '時刻の形で（例：21:30、2130、21時30分）', num: '数字で（例：3）', date: '日付の形で（例：2008年1月1日）', text: '文字で' };
  function judge(p, raw) {
    const c = {}, okk = {};
    for (const f of p.fields) {
      const v = N.canon(f, raw[f.k]);
      if (v === null) return { invalid: `${f.label.replace(/^［\d］/, (m) => m)}は${FORM_MSG[f.canon === 'digits' ? 'num' : f.type] || '正しい形で'}入れてね。` };
      c[f.k] = v;
    }
    let bad = 0;
    for (const f of p.fields) {
      const hs = (ANS[p.id] && ANS[p.id][f.k]) || [];
      okk[f.k] = hs.includes(N.hashField(p.id, f.k, c[f.k]));
      if (!okk[f.k]) bad++;
    }
    if (!bad) return { ok: true, bad: 0, c };
    const inSet = (k, v) => (Array.isArray(v) ? v : [v]).includes(c[k]);
    const rule = (p.miss || []).find((r) =>
      (!r.eq || Object.keys(r.eq).every((k) => inSet(k, r.eq[k]))) &&
      (!r.okf || r.okf.every((k) => okk[k])) &&
      (!r.ngf || r.ngf.every((k) => !okk[k])) &&
      (!r.test || (() => { try { return r.test(c); } catch (e) { return false; } })()));
    return { ok: false, bad, msg: rule ? rule.msg : (p.fb || GENERIC), flag: rule && rule.flag, c };
  }
  const hintsOf = (p) => p.hint; // ヒントは「考える向き」だけ。答えを見せる段はない

  /* ================= 便利なもの ================= */
  const stageObj = () => STAGES[Math.min(S.stage, STAGES.length - 1)];
  const isClear = () => S.stage >= STAGES.length;
  const curPuzzle = () => (isClear() ? null : STAGES[S.stage].puzzles[S.step]);
  const docsOfStage = (i) => (STAGES[i] ? STAGES[i].docs.filter((id) => !DOCS[id].after || S.solved[DOCS[id].after]) : []);
  const unlockedDocs = () => { const out = []; for (let i = 0; i <= Math.min(S.stage, STAGES.length - 1); i++) out.push(...docsOfStage(i)); return out; };
  const curDocs = () => docsOfStage(Math.min(S.stage, STAGES.length - 1));
  const rereadOn = () => isClear() && !!S.choice;
  const archivedDocs = () => { const out = []; const n = rereadOn() ? STAGES.length : Math.min(S.stage, STAGES.length - 1); for (let i = 0; i < n; i++) out.push(...docsOfStage(i)); return out; };
  const allPuzzles = () => STAGES.flatMap((s) => s.puzzles);
  const viewerOpen = () => document.body.classList.contains('viewer-open');

  let toastTimer = null;
  function toast(html, action, ms) {
    // 動画の再生中は出さない（終わってから出す）
    if (window.VID && window.VID.busy()) { window.VID.onIdle(() => toast(html, action, ms)); return; }
    const t = $('#toast');
    t.classList.toggle('low', isPhone() && viewerOpen());
    t.innerHTML = `<span class="toast-msg">${html}</span>${action ? `<button type="button" class="btn sm primary" id="toast-act">${action.label}</button>` : ''}<button type="button" class="iconbtn sm" id="toast-x" aria-label="通知を閉じる">✕</button>`;
    t.hidden = false; t.classList.remove('in'); void t.offsetWidth; t.classList.add('in');
    if (action) $('#toast-act').onclick = () => { t.hidden = true; action.fn(); };
    $('#toast-x').onclick = () => { t.hidden = true; };
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, ms || 5000);
  }
  function confirmDlg(msg, yes) {
    return new Promise((res) => {
      const d = $('#dlg-confirm');
      $('#cf-msg').textContent = msg;
      $('#cf-yes').textContent = yes || '見る';
      const done = (v) => { d.close(); res(v); };
      $('#cf-yes').onclick = () => done(true);
      $('#cf-no').onclick = () => done(false);
      d.oncancel = (e) => { e.preventDefault(); done(false); };
      d.showModal();
      $('#cf-no').focus();
    });
  }

  /* ================= 物語（メッセージ） ================= */
  const queue = [];
  let typing = false;
  function msgHTML(m) {
    if (m.video) return `<li class="vidmsg">${window.VID.html(m.video, { cap: m.t })}</li>`;
    if (m.who === 'beat') return `<li class="beat"><p>${esc(m.t)}</p></li>`;
    const chip = m.doc && DOCS[m.doc] ? `<button type="button" class="doc-chip" data-open="${m.doc}"><span aria-hidden="true">${DOCS[m.doc].icon}</span> ${m.doc} ${esc(DOCS[m.doc].title)}</button>` : '';
    if (m.who === 'mori') return `<li class="msg mori"><span class="who">森山</span><p>${esc(m.t)}</p></li>`;
    return `<li class="msg"><span class="who">莉々香</span><p>${esc(m.t)}</p>${chip}</li>`;
  }
  const shown = {};
  function feedCur() { return isClear() ? STAGES.length - 1 : S.stage; }
  const keyStage = (k) => +k.slice(1, k.indexOf('.'));
  function isNowKey(k) {
    const cur = feedCur(), st = keyStage(k);
    if (st >= cur) return true;
    const prev = S.chat.filter((x) => keyStage(x) === cur - 1);
    return st === cur - 1 && prev[prev.length - 1] === k;
  }
  let feedDeferred = false;
  function renderFeed() {
    // 動画を再生中（見せている途中）なら、物語の欄は描き直さない（動画が消えないように）。終わってから描き直す
    if (window.VID && window.VID.busy()) {
      if (!feedDeferred) { feedDeferred = true; window.VID.onIdle(() => { feedDeferred = false; renderFeed(); }); }
      return;
    }
    const old = [], now = [];
    S.chat.forEach((k) => {
      const msgs = k in shown ? CHAT[k].slice(0, shown[k]) : CHAT[k];
      (isNowKey(k) ? now : old).push(...msgs);
    });
    $('#feed').innerHTML = now.map(msgHTML).join('');
    $('#feed-old').innerHTML = old.map(msgHTML).join('');
    const b = $('#btn-older');
    b.hidden = !old.length;
    b.textContent = $('#feed-old').hidden ? `▸ 前の話（${old.length}）` : '▾ 前の話をたたむ';
    b.setAttribute('aria-expanded', String(!$('#feed-old').hidden));
  }
  function deliver(key, after) {
    if (S.chat.includes(key) || !CHAT[key]) { if (after) after(); return; }
    S.chat.push(key); shown[key] = 0; save();
    queue.push({ key, after });
    if (!typing) pump();
  }
  let quietFeed = false; // 動画を見ないまま先に進んだときは、画面を動かさずにバッジだけ
  function newBadge(on) {
    const b = $('#new-badge'); if (!b) return;
    b.hidden = !on;
  }
  function nearBottom() {
    const sc = $('#scroll'), last = $('#feed').lastElementChild; if (!sc || !last) return true;
    return last.getBoundingClientRect().bottom <= sc.getBoundingClientRect().bottom + 24;
  }
  function keepBottomVisible(force) {
    // 新しい話が出たら、物語の最後が見えるように（ただし、いまの謎を画面から追い出さない）
    const sc = $('#scroll'); const last = $('#feed').lastElementChild;
    if (!sc || !last || viewerOpen()) return;
    if (!force && (quietFeed || (window.VID && window.VID.busy()))) { if (!nearBottom()) newBadge(true); return; }
    const r = last.getBoundingClientRect(), sr = sc.getBoundingClientRect();
    if (r.bottom > sr.bottom - 8) sc.scrollTop += Math.min(r.bottom - sr.bottom + 16, r.top - sr.top - 8);
  }
  function pump() {
    const job = queue.shift();
    if (!job) { typing = false; return; }
    typing = true;
    const msgs = CHAT[job.key];
    const finish = () => { delete shown[job.key]; if (job.after) job.after(); pump(); };
    if (!isNowKey(job.key)) { delete shown[job.key]; renderFeed(); if (job.after) job.after(); pump(); return; }
    const afterMsg = (m) => { // 動画のメッセージなら、見終わるまで次を出さない
      if (!m.video) { next(); return; }
      const fig = $('#feed').lastElementChild && $('#feed').lastElementChild.querySelector('figure.vid');
      if (!fig) { next(); return; }
      window.VID.gate(fig, (quiet) => { if (quiet) quietFeed = true; next(); });
    };
    const next = () => {
      const i = shown[job.key];
      if (i >= msgs.length) { finish(); return; }
      if (window.VID && window.VID.busy()) { window.VID.onIdle(next); return; } // 別の動画を再生中
      if (msgs[i].video) quietFeed = false;
      if (reduced()) { shown[job.key] = i + 1; $('#feed').insertAdjacentHTML('beforeend', msgHTML(msgs[i])); keepBottomVisible(); afterMsg(msgs[i]); return; }
      const ty = document.createElement('li');
      ty.className = (msgs[i].who === 'beat' || msgs[i].video) ? 'beat typing' : 'msg typing'; ty.setAttribute('aria-hidden', 'true');
      ty.className += msgs[i].who === 'mori' ? ' mori' : '';
      ty.innerHTML = (msgs[i].who === 'beat' || msgs[i].video) ? '<p>…</p>' : '<span class="who">' + (msgs[i].who === 'mori' ? '森山' : '莉々香') + '</span><p><span class="dots"><i></i><i></i><i></i></span></p>';
      $('#feed').appendChild(ty); keepBottomVisible();
      setTimeout(() => {
        ty.remove(); shown[job.key] = i + 1;
        const f = $('#feed'); f.insertAdjacentHTML('beforeend', msgHTML(msgs[i])); f.lastElementChild.classList.add('in');
        keepBottomVisible();
        afterMsg(msgs[i]);
      }, Math.min(950, 380 + msgs[i].t.length * 12));
    };
    next();
  }

  /* ================= 資料カード ================= */
  function renderCards() {
    const ids = curDocs();
    const arch = archivedDocs();
    $('#cards-count').textContent = `（${ids.length}）`;
    $('#cards').innerHTML = ids.map((id) => {
      const d = DOCS[id];
      const isNew = !S.read.includes(id);
      const open = !isPhone() && S.view.panes.some((p, i) => p.doc === id && (i === 0 || S.view.compare));
      return `<li><button type="button" class="card${open ? ' is-open' : ''}" data-open="${id}" aria-label="${esc(`${d.no} ${d.title}（${d.kind}）${isNew ? '・新着' : ''}${S.pin === id ? '・ピン留め中' : ''}`)}">
        <span class="card-no">${d.no}</span><span class="card-ic" aria-hidden="true">${d.icon}</span>
        <span class="card-t">${esc(d.title)}</span><span class="card-s">${esc(d.short)}</span>
        ${isNew ? '<span class="badge-new" aria-hidden="true">NEW</span>' : ''}${S.pin === id ? '<span class="badge-pin" aria-hidden="true">📌</span>' : ''}</button></li>`;
    }).join('') + (arch.length ? `<li><button type="button" class="card drawer" data-menu="archive"><span class="card-ic" aria-hidden="true">🗂</span><span class="card-t">前の資料</span><span class="card-s">${arch.length}件（引き出し）</span></button></li>` : '');
  }

  /* ================= いまの謎 ================= */
  function stepsHTML() {
    const st = stageObj();
    if (st.puzzles.length < 2) return '';
    return `<ol class="steps" aria-label="このステージの謎">${st.puzzles.map((p, i) => {
      const done = !!S.solved[p.id], act = !isClear() && i === S.step;
      return `<li class="${done ? 'done' : act ? 'act' : 'lock'}" ${act ? 'aria-current="step"' : ''}><span class="st-mark">${done ? '✓' : p.step}</span><span class="st-name">${esc(p.name)}</span></li>`;
    }).join('')}</ol>`;
  }
  function factsHTML() {
    const f = allPuzzles().filter((p) => S.solved[p.id] && p.fact);
    if (!f.length) return '';
    return `<details class="facts" ${S.factsOpen === false ? '' : 'open'}><summary>わかったこと（${f.length}）</summary><ul>${f.map((p) => `<li>${esc(p.fact)}</li>`).join('')}</ul></details>`;
  }
  function fieldHTML(p, f, dr) {
    const id = `f-${f.k}`;
    if (f.type === 'chip') {
      return `<fieldset class="field chips${f.half ? ' half' : ''}"><legend class="f-label">${esc(f.label)}</legend><div class="chip-row">${f.opts.map(([v, l]) => `<label class="chip"><input type="radio" name="${f.k}" value="${v}" ${dr[f.k] === v ? 'checked' : ''}><span>${esc(l)}</span></label>`).join('')}</div></fieldset>`;
    }
    const im = f.type === 'num' ? 'numeric' : 'text';
    return `<label class="field${f.half ? ' half' : ''}" for="${id}"><span class="f-label">${esc(f.label)}</span>
      <span class="f-row"><input id="${id}" name="${f.k}" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="done" inputmode="${im}" placeholder="${esc(f.ph || '')}" value="${esc(dr[f.k] || '')}">${f.suffix ? `<span class="f-suf">${esc(f.suffix)}</span>` : ''}</span></label>`;
  }
  function sentenceWithBlanks(p) {
    return p.q.split('［　］').map(esc).reduce((acc, part, i) => acc + (i ? `<span class="blank">［${i}］</span>` : '') + part, '');
  }
  function renderPuzzle() {
    const box = $('#puzzle');
    if (isClear()) {
      if (!S.choice) {
        box.innerHTML = `${factsHTML()}<div class="clear-card choice-card" ${chatBusy() ? 'hidden' : ''}><p class="clear-stamp" aria-hidden="true">最後の選択</p>
          <h2 id="pz-name">ネガを、どうする？</h2>
          <p>19年前の写真。誰の罪にも、もう問えない。それでも、残すか。</p>
          <div class="clear-btns"><button type="button" class="btn primary" data-choice="submit">署に出す</button><button type="button" class="btn ghost" data-choice="sea">平磯の海に返す</button></div></div>`;
        $$('[data-choice]', box).forEach((b) => b.onclick = () => choose(b.dataset.choice));
      } else {
        box.innerHTML = `${factsHTML()}<div class="clear-card"><p class="clear-stamp" aria-hidden="true">完</p>
          <h2 id="pz-name">十九年目のネガ　解決</h2>
          <ul class="epi">
            <li><b>風見みゆき</b>：潮見達郎さんの殺害を認め、起訴された。「野々香を守るため」と信じて払い続けた19年のことも、自分の口で話した。</li>
            <li><b>風見野々香</b>：母をかばって嘘をついたことは、家族のための証拠隠しにあたるが、親族なので刑は免除された（刑法105条）。今も赤いマフラーで、干し芋を売っている。</li>
            <li><b>森山浩行</b>：現場からネガ袋を持ち去ったことを自ら報告し、警察を辞めた（証拠隠滅）。</li>
            <li><b>鳴海沙織</b>：19年目に、兄の最期を知った。莉々香に会いに来て「兄は、あの子たちを怖がらせていた。……知ってた。でも、兄だったの」と言った。しおさい食堂は、今日もあんこう鍋。</li>
            <li><b>浜野透</b>：「子供がいた、って言えてよかった」。春から、子ども無線教室をまた開くらしい。</li>
            <li><b>風見莉々香</b>：8歳のときのことは、罪に問われない（14歳未満・刑法41条）。刑事を続けている。黄色い帽子は、いま莉々香の机の引き出しにある。</li></ul>
          <p class="muted">${S.choice === 'submit' ? 'ネガは証拠として署に出した。' : 'ネガは平磯の海に返した。'}　遊んでくれて、ありがとう。</p>
          <p class="sm">🔁 <b>読み返しモード</b>：資料の引き出しに全部の資料が入りました。開くと、最初から置いてあった伏線の「本当の意味」が一行ずつ出ます。</p>
          <div class="clear-btns"><button type="button" class="btn primary" data-menu="archive">🔁 読み返す</button><button type="button" class="btn ghost" data-menu="memo">メモを見る</button><button type="button" class="btn ghost" id="btn-clear-reset">最初から遊ぶ</button></div></div>`;
        $('#btn-clear-reset').onclick = askReset;
      }
      renderBottom();
      return;
    }
    const p = curPuzzle();
    const kindLabel = p.id === '0M' ? 'ロック' : p.final ? '大謎　答えは1回でまとめて判定' : `${stageObj().label.split(' ')[0]} の謎　答えは1回でまとめて判定`;
    const dr = S.drafts[p.id] || {};
    const fb = S.lastFb && S.lastFb.id === p.id ? S.lastFb : null;
    const w = S.wrong[p.id] || 0;
    const openBtn = p.needFold && !S.fold['0-1'] ? '<button type="button" class="btn ghost sm open-doc" data-open="0-1">✉ 手紙を開く</button>' : '';
    box.innerHTML = `${stepsHTML()}${factsHTML()}
      <div class="pz-card${p.kind === 'mid' ? ' mid' : ''}">
        <p class="pz-kind">${kindLabel}</p>
        <h2 id="pz-name" class="pz-name">${esc(p.name)}</h2>
        <p class="pz-q">${p.kind === 'mid' ? sentenceWithBlanks(p) : esc(p.q)}</p>
        ${openBtn}
        <form class="pz-form" id="pz-form" novalidate>
          <div class="fields">${p.fields.map((f) => fieldHTML(p, f, dr)).join('')}</div>
          <button type="submit" class="sr-only" tabindex="-1">答える</button>
        </form>
        <p id="pz-fb" class="pz-fb${fb ? ' ' + fb.cls : ''}" role="status" aria-live="polite">${fb ? esc(fb.msg) : ''}</p>
        <div class="pz-foot">${w >= 5 ? '<span class="nudge">行き詰まったら、ヒント1だけ見てみる？（減点なし）</span>' : ''}${w ? `<span class="muted sm">間違えた回数 ${w}</span>` : ''}</div>
      </div>`;
    const form = $('#pz-form');
    form.onsubmit = (e) => { e.preventDefault(); submit(p); };
    const upd = (el) => { (S.drafts[p.id] = S.drafts[p.id] || {})[el.name] = el.value; save(); };
    $$('input[type="text"]', form).forEach((inp) => inp.addEventListener('input', () => upd(inp)));
    $$('input[type="radio"]', form).forEach((r) => r.addEventListener('change', () => upd(r)));
    renderBottom();
  }
  function renderBottom() {
    const b = $('#bb-main');
    const p = curPuzzle();
    b.disabled = false;
    if (isClear()) { b.textContent = 'メモを見る'; b.dataset.mode = 'memo'; }
    else { b.dataset.mode = 'submit'; b.textContent = '答える'; requestAnimationFrame(updateMainLabel); }
    $('#bb-hint .bb-t').textContent = p ? `ヒント ${S.hints[p.id] || 0}/3` : 'ヒント';
    const pk = $('#bb-peek');
    pk.hidden = !S.pin;
    if (S.pin) { $('#bb-peek-t').textContent = `${S.pin} を見る`; pk.setAttribute('aria-label', `ピン留めした資料 ${S.pin} を大きくひらく`); }
  }
  function formVisible() {
    const f = $('#pz-form'), sc = $('#scroll');
    if (!f || !sc) return false;
    const r = f.getBoundingClientRect(), sr = sc.getBoundingClientRect();
    return r.top < sr.bottom - 40 && r.bottom > sr.top + 20;
  }
  let bbT = null;
  function updateMainLabel() {
    const b = $('#bb-main');
    if (b.dataset.mode !== 'submit') return;
    b.textContent = formVisible() ? '答える' : '✏ いまの謎へ';
  }
  function submit(p) {
    const v = {};
    p.fields.forEach((f) => {
      if (f.type === 'chip') { const r = $(`#pz-form input[name="${f.k}"]:checked`); v[f.k] = r ? r.value : ''; }
      else v[f.k] = $('#f-' + f.k).value;
    });
    const empty = p.fields.find((f) => !String(v[f.k] || '').trim());
    const fb = $('#pz-fb');
    if (empty) {
      const msg = p.fields.length > 1 ? '空いている欄があるよ。全部そろえてから答えよう。' : '答えを入れてね。';
      S.lastFb = { id: p.id, msg, cls: 'info' }; save(); fb.className = 'pz-fb info'; fb.textContent = msg;
      const el = empty.type === 'chip' ? $(`#pz-form input[name="${empty.k}"]`) : $('#f-' + empty.k);
      if (el) el.focus();
      return;
    }
    const r = judge(p, v);
    if (r.invalid) { S.lastFb = { id: p.id, msg: r.invalid, cls: 'info' }; save(); fb.className = 'pz-fb info'; fb.textContent = r.invalid; return; }
    if (!r.ok) {
      S.wrong[p.id] = (S.wrong[p.id] || 0) + 1;
      if (r.flag) S.flags[r.flag] = true;
      let msg = r.msg;
      S.lastFb = { id: p.id, msg, cls: 'ng' }; save();
      renderPuzzle();
      const card = $('.pz-card'); if (card && !reduced()) { card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake'); }
      if (isPhone()) $('#pz-fb').scrollIntoView({ block: 'nearest' });
      return;
    }
    solve(p);
  }
  function solve(p) {
    S.solved[p.id] = true; S.lastFb = null;
    const stg = S.stage;
    const lastInStage = S.step >= STAGES[stg].puzzles.length - 1;
    const card = $('.pz-card');
    if (card) {
      card.insertAdjacentHTML('beforeend', `<div class="stamp${reduced() ? ' still' : ''}" aria-hidden="true">${p.kind === 'mid' ? (stg === 0 ? 'ロック解除' : '解決') : '正解'}</div>`);
      $$('input,button', card).forEach((b) => { b.disabled = true; });
      $('#pz-fb').className = 'pz-fb ok'; $('#pz-fb').textContent = '正解！';
    }
    $('#bb-main').disabled = true;
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); // スマホのキーボードを閉じる
    const chatKey = `s${stg}.${p.id}`;
    if (lastInStage) { S.stage = stg + 1; S.step = 0; }
    else S.step += 1;
    save();
    setTimeout(() => {
      if (drawerOpen()) { closeDrawer(); closeViewer(false); } // 正解したら、物語のつづきへ
      if (lastInStage) {
        if (isClear()) { deliver(chatKey, () => setTimeout(renderPuzzle, 0)); renderAll(); return; }
        renderAll();
        deliver(chatKey, () => {
          if (!isClear()) {
            deliver(`s${S.stage}.start`, () => {
              const n = curDocs().length;
              toast(`📨 莉々香から資料が届きました（${n}件）`, { label: '資料を見る', fn: () => { const c = $('#cards .card'); if (c) { c.scrollIntoView({ block: 'nearest', behavior: reduced() ? 'auto' : 'smooth' }); c.focus({ preventScroll: true }); } } });
            });
          } else renderPuzzle();
        });
      } else {
        renderPuzzle(); renderCards();
        deliver(chatKey);
      }
    }, reduced() ? 150 : 1100);
  }

  const chatBusy = () => typing || queue.length > 0;
  function choose(c) {
    if (S.choice) return;
    S.choice = c; save();
    const box = $('#puzzle .choice-card'); if (box) box.hidden = true;
    const then = () => { renderAll(); const h = $('#pz-name'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); } };
    deliver(`s${STAGES.length}.${c}`, () => { if (S.flags.yellow) deliver(`s${STAGES.length}.yellow`, then); else then(); });
  }

  /* ================= ビューア ================= */
  function paneCount() { return S.view.compare && !isPhone() ? 2 : 1; }
  function activePane() { return paneCount() === 2 ? S.view.active : 0; }
  const docView = {}; // 資料ごとの拡大率とスクロール位置（切り替えても戻ってこられる）
  function rememberView() {
    $$('#panes .pane').forEach((el) => {
      const pn = S.view.panes[+el.dataset.pane]; const sc = $('.pane-scroll', el);
      if (pn && pn.doc && sc && el.dataset.doc === pn.doc) docView[pn.doc] = { z: pn.zoom, t: sc.scrollTop, l: sc.scrollLeft };
    });
  }
  function renderPanes() {
    rememberView();
    const wrap = $('#panes');
    const n = paneCount();
    wrap.classList.toggle('two', n === 2);
    $('#btn-compare').setAttribute('aria-pressed', String(S.view.compare));
    $('#btn-compare').textContent = S.view.compare ? '✕ 並べるのをやめる' : '⇆ 並べて見る';
    let html = '';
    for (let i = 0; i < n; i++) {
      const pn = S.view.panes[i];
      const d = pn.doc && DOCS[pn.doc];
      const opts = unlockedDocs().map((id) => `<option value="${id}"${id === pn.doc ? ' selected' : ''}>${id} ${esc(DOCS[id].title)}</option>`).join('');
      html += `<section class="pane${n === 2 && S.view.active === i ? ' active' : ''}" data-pane="${i}" data-doc="${pn.doc || ''}" aria-label="${n === 2 ? (i ? '右' : '左') + 'の資料' : '資料'}">
        ${n === 2 ? `<div class="pane-head"><label class="sr-only" for="sel-${i}">表示する資料</label><select id="sel-${i}" class="pane-sel"><option value="">資料を選ぶ</option>${opts}</select></div>` : ''}
        <div class="pane-scroll" tabindex="0" aria-label="資料の本文。＋−キーで拡大縮小">${d ? `<div class="doc-zoom" style="zoom:${pn.zoom}">${rereadOn() && d.re ? `<p class="re-note"><b>🔁 読み返し</b>${esc(d.re)}</p>` : ''}${d.html()}</div>` : '<p class="pane-empty">資料カードを選ぶと、ここに表示されます。</p>'}</div>
      </section>`;
    }
    wrap.innerHTML = html;
    // 手紙の道具（折る・裏返す・図）は、拡大しない下の道具バーへ。シートは画面いっぱいに使う
    $$('.pane', wrap).forEach((el) => { const bar = $('.doc-zoom .fold-bar', el); if (bar) { bar.classList.add('pane-dock'); el.appendChild(bar); } });
    $$('.pane', wrap).forEach(bindPane);
    $$('.pane', wrap).forEach((el) => {
      const pn = S.view.panes[+el.dataset.pane]; const v = pn && docView[pn.doc]; const sc = $('.pane-scroll', el);
      if (v && sc) { sc.scrollTop = v.t; sc.scrollLeft = v.l; requestAnimationFrame(() => { sc.scrollTop = v.t; sc.scrollLeft = v.l; }); }
    });
    renderViewerBar();
    applyPhotos(); applyFolds(); window.TOOLS.apply(wrap);
  }
  function renderViewerBar() {
    const pn = S.view.panes[activePane()];
    const d = pn.doc && DOCS[pn.doc];
    $('#vw-title').textContent = paneCount() === 2 ? '資料を並べて見る' : d ? `${d.no} ${d.title}` : '資料';
    $('.vw-bar .zval').textContent = Math.round(pn.zoom * 100) + '%'; $('.zc-v').textContent = Math.round(pn.zoom * 100) + '%';
    const pin = $('#btn-pin');
    pin.hidden = !d;
    const pinned = d && S.pin === pn.doc;
    pin.setAttribute('aria-pressed', String(!!pinned));
    $('#btn-pin-t').textContent = pinned ? 'ピン中' : 'ピン';
    pin.setAttribute('aria-label', pinned ? `${pn.doc} のピンを外す` : `${pn.doc || ''} をピン留め（ほかの画面でちら見できる）`);
    const vp = $('#btn-vpeek');
    const target = !S.pin || !d ? null : S.pin !== pn.doc ? S.pin : (S.view.back && S.view.back !== S.pin && DOCS[S.view.back] ? S.view.back : null);
    vp.hidden = !target;
    if (target) { vp.dataset.target = target; vp.textContent = `⇄ ${target === S.pin ? '📌' : ''}${target}`; vp.setAttribute('aria-label', `${target} ${DOCS[target].title} に切り替える（拡大とスクロールはそのまま）`); }
    const dw = $('#btn-drawer'); if (dw) { dw.hidden = !isPhone() || isClear() || !d; dw.setAttribute('aria-expanded', String(drawerOpen())); dw.textContent = drawerOpen() ? '▾ しまう' : '✏ 答え'; }
  }
  function setZoom(i, z) {
    const pn = S.view.panes[i];
    pn.zoom = Math.round(Math.max(0.5, Math.min(3, z)) * 100) / 100;
    const el = $(`.pane[data-pane="${i}"]`);
    if (el) { const dz = $('.doc-zoom', el); if (dz) dz.style.zoom = pn.zoom; }
    if (i === activePane()) { $('.vw-bar .zval').textContent = Math.round(pn.zoom * 100) + '%'; $('.zc-v').textContent = Math.round(pn.zoom * 100) + '%'; }
    save();
  }
  function bindPane(el) {
    const i = +el.dataset.pane;
    const sc = $('.pane-scroll', el);
    el.addEventListener('pointerdown', () => { if (paneCount() === 2 && S.view.active !== i) { S.view.active = i; $$('.pane').forEach((p) => p.classList.toggle('active', +p.dataset.pane === i)); save(); renderViewerBar(); } }, true);
    const sel = $('.pane-sel', el);
    if (sel) sel.onchange = () => { if (sel.value) { S.view.panes[i].doc = sel.value; S.view.panes[i].zoom = 1; S.view.active = i; markRead(sel.value); save(); renderPanes(); renderCards(); renderPeek(); } };
    if (!sc) return;
    sc.addEventListener('wheel', (e) => { if (!e.ctrlKey) return; e.preventDefault(); setZoom(i, S.view.panes[i].zoom * Math.exp(-Math.max(-60, Math.min(60, e.deltaY)) * 0.004)); }, { passive: false });
    sc.addEventListener('keydown', (e) => {
      if (e.target !== sc) return;
      if (e.key === '+' || e.key === '=' || e.key === ';') { e.preventDefault(); setZoom(i, S.view.panes[i].zoom + 0.25); }
      else if (e.key === '-' || e.key === '_') { e.preventDefault(); setZoom(i, S.view.panes[i].zoom - 0.25); }
      else if (e.key === '0') { e.preventDefault(); setZoom(i, 1); }
    });
    const NOZOOM = 'button,.fold-handle,a,input,select,summary,label,textarea,.ov-sheet,.trace svg,[role="slider"],input[type=range]';
    // 指の位置（または点）を中心に拡大する
    const zoomAt = (z, cx, cy) => {
      const r = sc.getBoundingClientRect(); const z0 = S.view.panes[i].zoom;
      const px = (sc.scrollLeft + cx - r.left) / z0, py = (sc.scrollTop + cy - r.top) / z0;
      setZoom(i, z); const z1 = S.view.panes[i].zoom;
      sc.scrollLeft = px * z1 - (cx - r.left); sc.scrollTop = py * z1 - (cy - r.top);
    };
    let lastTouch = 0;
    sc.addEventListener('dblclick', (e) => { if (Date.now() - lastTouch < 900) return; if (e.target.closest(NOZOOM)) return; zoomAt(S.view.panes[i].zoom >= 1.5 ? 1 : 2, e.clientX, e.clientY); });
    // ピンチ（2本指）とダブルタップ
    const pts = new Map(); let startD = 0, startZ = 1, tap = null, moved = false;
    const dist = () => { const a = [...pts.values()]; return Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y); };
    const mid = () => { const a = [...pts.values()]; return [(a[0].x + a[1].x) / 2, (a[0].y + a[1].y) / 2]; };
    sc.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'touch') return; lastTouch = Date.now(); pts.set(e.pointerId, { x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY }); moved = pts.size > 1; if (pts.size === 2) { startD = dist(); startZ = S.view.panes[i].zoom; } });
    sc.addEventListener('pointermove', (e) => { if (!pts.has(e.pointerId)) return; const q = pts.get(e.pointerId); q.x = e.clientX; q.y = e.clientY; if (Math.hypot(q.x - q.x0, q.y - q.y0) > 10) moved = true; if (pts.size === 2 && startD > 0) { const [mx, my] = mid(); zoomAt(startZ * dist() / startD, mx, my); } });
    const up = (e) => {
      if (e.type === 'pointerup' && e.pointerType === 'touch' && pts.size === 1 && !moved && !e.target.closest(NOZOOM)) {
        const now = Date.now();
        if (tap && now - tap.t < 320 && Math.hypot(e.clientX - tap.x, e.clientY - tap.y) < 30) { zoomAt(S.view.panes[i].zoom >= 1.5 ? 1 : 2, e.clientX, e.clientY); tap = null; }
        else tap = { t: now, x: e.clientX, y: e.clientY };
      }
      pts.delete(e.pointerId); if (pts.size < 2) startD = 0;
    };
    sc.addEventListener('pointerup', up); sc.addEventListener('pointercancel', up);
  }
  function markRead(id) { if (!S.read.includes(id)) S.read.push(id); }
  function openDoc(id) {
    if (!DOCS[id] || !unlockedDocs().includes(id)) return;
    const v = S.view;
    const i = activePane();
    if (v.panes[i].doc !== id) { rememberView(); v.panes[i].doc = id; v.panes[i].zoom = docView[id] ? docView[id].z : 1; }
    markRead(id); save();
    renderPanes(); renderCards();
    if (isPhone()) {
      if (!viewerOpen()) {
        document.body.classList.add('viewer-open');
        if (pendingBack) wantPush = true; // 「もどる」の履歴処理が終わってから積む
        else { try { history.pushState({ vw: 1 }, ''); } catch (e) {} }
      }
      { const t = $('#toast'); if (t) t.hidden = true; } // 資料を開いたら、通知は閉じる（資料にかぶらない）
      $('#btn-viewer-close').focus({ preventScroll: true });
    } else {
      const sc = $(`.pane[data-pane="${i}"] .pane-scroll`); if (sc) sc.focus({ preventScroll: true });
    }
    renderPeek();
  }
  /* ================= 答えとメモの引き出し（スマホのビューアの下から。シートはそのまま） ================= */
  let pzHome = null;
  const drawerOpen = () => !$('#drawer').hidden;
  function drawerTab(t) {
    $$('#drawer [data-dw]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.dw === t)));
    $('#dw-pz').hidden = t !== 'pz'; $('#dw-memo').hidden = t !== 'memo'; $('#dw-foot').hidden = t !== 'pz';
    if (t === 'memo') $('#memo2').value = S.memo;
  }
  function openDrawer(tab) {
    if (drawerOpen()) { drawerTab(tab || 'pz'); return; }
    const pz = $('#puzzle');
    if (!pzHome) { pzHome = document.createComment('puzzle-home'); pz.before(pzHome); }
    $('#dw-pz').appendChild(pz);
    $('#drawer').hidden = false; document.body.classList.add('drawer-open');
    drawerTab(tab || 'pz'); renderViewerBar();
    const card = $('#dw-pz .pz-card'); if (card) card.scrollIntoView({ block: 'start' });
  }
  function closeDrawer() {
    if (!drawerOpen()) return;
    if (pzHome) { pzHome.replaceWith($('#puzzle')); pzHome = null; }
    $('#drawer').hidden = true; document.body.classList.remove('drawer-open');
    if (document.activeElement && document.activeElement.blur && $('#viewer').contains(document.activeElement) === false) document.activeElement.blur();
    renderViewerBar();
  }
  let pendingBack = false, wantPush = false;
  function closeViewer(fromPop) {
    closeDrawer();
    if (!viewerOpen()) return;
    rememberView();
    document.body.classList.remove('viewer-open');
    if (!fromPop && history.state && history.state.vw) { pendingBack = true; try { history.back(); } catch (e) { pendingBack = false; } }
    renderPeek();
    const id = S.view.panes[0].doc;
    const c = $(`#cards [data-open="${id}"]`) || $('#puzzle');
    if (c) c.focus({ preventScroll: true });
  }

  /* ================= ピン留め＋ちら見（スマホで2枚を見比べるかわり） ================= */
  function setPin(id) {
    S.pin = id; S.peek = false; save();
    renderViewerBar(); renderBottom(); renderCards(); renderPeek();
    if (id) toast(`📌 ${id} をピン留め。ほかの資料から「⇄」ですぐ切り替えられます`, null, 2500);
  }
  // ピン留めした資料は、小さな窓ではなく、大きなビューアでひらく（⇄ で行き来できる）
  function openPinned() {
    { const t = $('#toast'); if (t) t.hidden = true; }
    if (!S.pin) return;
    const cur = S.view.panes[activePane()].doc;
    if (cur && cur !== S.pin) S.view.back = cur;
    openDoc(S.pin);
  }
  function renderPeek() { const pk = $('#peek'); if (pk) pk.hidden = true; document.body.classList.remove('peek-open'); }

  /* ================= 写真の道具（回す・反転） ================= */
  function phLabel(st) {
    const a = [];
    if (st.r) a.push(`${st.r * 90}°回転`);
    if (st.f) a.push('左右反転');
    return a.length ? 'いま：' + a.join('・') : '';
  }
  function applyPhotos() {
    $$('figure.ph').forEach((fig) => {
      const st = S.ph[fig.dataset.ph] || { r: 0, f: false };
      const img = $('.ph-img', fig);
      const sq = $('.ph-frame', fig).classList.contains('sq');
      const k = st.r % 2 && !sq ? 0.66 : 1;
      img.style.transform = `rotate(${st.r * 90}deg) scale(${(st.f ? -1 : 1) * k}, ${k})`;
      $('.ph-state', fig).textContent = phLabel(st);
    });
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-tool]');
    if (!b) return;
    const fig = b.closest('figure.ph'); const id = fig.dataset.ph;
    const st = S.ph[id] = S.ph[id] || { r: 0, f: false };
    if (b.dataset.tool === 'rot') st.r = (st.r + 1) % 4;
    else if (b.dataset.tool === 'flip') st.f = !st.f;
    else { st.r = 0; st.f = false; }
    save(); applyPhotos();
  });

  /* ================= 折る（穴あき手紙） ================= */
  function applyFolds() {
    $$('[data-fold-doc]').forEach((doc0) => {
      const fid = doc0.dataset.foldDoc;
      const bars = $$(`[data-fold-bar="${fid}"]`);
      // 道具は、拡大しない「下の道具バー」に移していることがある。手紙本体と道具バーの両方から探す
      const doc = { querySelector: (q) => doc0.querySelector(q) || bars.map((b) => b.querySelector(q)).find(Boolean) || null, dataset: doc0.dataset };
      const f = !!S.fold[doc.dataset.foldDoc];
      const svg = doc.querySelector('svg.svg-letter'), wrap = doc.querySelector('.letter-wrap');
      if (svg) {
        clearTimeout(svg._t);
        if (f) {
          const compact = () => { svg.setAttribute('viewBox', svg.dataset.vbFolded); wrap.classList.add('compact'); };
          svg.classList.add('is-folded'); compact(); // すぐ切り替える（何度も見比べるので待たせない）
        } else {
          svg.setAttribute('viewBox', svg.dataset.vbFull); wrap.classList.remove('compact');
          void svg.getBoundingClientRect();
          svg.classList.remove('is-folded');
        }
        svg.dataset.init = '1';
      }
      const fl = f && !!S.fold[doc.dataset.foldDoc + ':flip'];
      const mir = doc.querySelector('svg.svg-letter g.mir'); if (mir) { mir.removeAttribute('transform'); mir.style.transform = fl ? 'scaleX(-1)' : ''; }
      if (svg) {
        svg.classList.toggle('is-flipped', fl);
        svg.classList.toggle('see', !S.fold[fid + ':nosee']);
        const um = svg.querySelector('g.umarks'); const ms = S.fold[fid + ':marks'] || [];
        if (um) um.innerHTML = ms.map((k, n) => { const [r, c] = k.split(',').map(Number); const x = 32 + 56 * (c + 0.5), y = 740 + 56 * (r + 0.5); return `<circle cx="${x}" cy="${y}" r="24" class="um-ring"/><circle cx="${x - 20}" cy="${y + 20}" r="10" class="um-dot"/><text x="${x - 20}" y="${y + 24}" text-anchor="middle" class="um-n">${n + 1}</text>`; }).join('');
      }
      $$(`[data-fold-bar="${fid}"] [data-act="fstate"]`).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === (!f ? 'open' : fl ? 'ura' : 'omote'))));
      $$(`[data-fold-bar="${fid}"] [data-act="fsee"]`).forEach((b) => { b.setAttribute('aria-pressed', String(!S.fold[fid + ':nosee'])); b.disabled = !f; });
      $$(`[data-fold-bar="${fid}"] [data-act="fmclear"]`).forEach((b) => { b.hidden = !(S.fold[fid + ':marks'] || []).length; });
      const fb = doc.querySelector('[data-act="lflip"]'); if (fb) { fb.setAttribute('aria-pressed', String(fl)); fb.textContent = fl ? '⇋ 表にもどす' : '⇋ 裏返す'; fb.setAttribute('aria-label', fl ? '裏返した紙を表にもどす（折ったまま）' : '上半分を切り取って、その紙だけ裏返す'); }
      const b = doc.querySelector('[data-act="fold"]'); if (b) { b.setAttribute('aria-pressed', String(f)); b.textContent = f ? '↺ ひらく' : '✂ 折る'; }
      const fsEl = doc.querySelector('.fold-state');
      if (fsEl) {
        const k = !f ? 'open' : fl ? 'ura' : 'omote';
        fsEl.dataset.state = k;
        fsEl.querySelector('.fs-chip').textContent = { open: 'いま：ひらいた手紙', omote: 'いま：表', ura: 'いま：裏' }[k];
        { const ft = doc.querySelector('.fs-t'); if (ft) ft.textContent = { open: '上が手紙、下があんごう表と地図。', omote: '上半分を点線で下へ折って、あんごう表に重ねた。見えているのは、えんぴつの字の面。', ura: '上半分を点線で切り取り、その紙だけ左右に裏返して重ねた。見えているのは手紙の文の面（逆さま）。えんぴつの字は、紙の裏から透けて左右反対。' }[k]; }
        const dg = doc.querySelector('.fold-diagram'); if (dg) dg.dataset.state = k;
      }
      const help = doc.querySelector('.fold-help'); if (help) help.textContent = f ? 'ひらくと、地図が見えます' : '点線を下へスワイプしても折れます';
      const h = doc.querySelector('.fold-handle'); if (h) h.setAttribute('aria-label', f ? '手紙をひらく' : '点線で折る');
      const live = doc.querySelector('.fold-live'); if (live) live.textContent = f ? (fl ? '上半分を切り取って裏返し、重ねました（裏）。' : '上半分を折って重ねました（表）。') + '穴から下の字が見えています。穴のそばに漢字があります。' : '';
    });
  }
  function setFold(id, v) {
    if (!!S.fold[id] === v) return;
    S.fold[id] = v; if (!v) S.fold[id + ':flip'] = false; save(); applyFolds();
    renderPuzzleSoft();
  }
  function renderPuzzleSoft() { // 入力中の文字を消さないよう、「手紙を開く」ボタンだけ出し入れする
    const b = $('#puzzle .open-doc'); const p = curPuzzle();
    if (b && p && p.needFold && S.fold['0-1']) b.remove();
  }
  document.addEventListener('click', (e) => {
    const lf = e.target.closest('[data-act="lflip"]');
    if (lf) { // 裏返すのは、切り取った上半分だけ。ひらいたままなら、先に重ねる
      const host = lf.closest('[data-fold-doc],[data-fold-bar]'); const id = host.dataset.foldDoc || host.dataset.foldBar;
      if (!S.fold[id]) { S.fold[id + ':flip'] = true; setFold(id, true); return; }
      S.fold[id + ':flip'] = !S.fold[id + ':flip']; save(); applyFolds(); return;
    }
    const fsb = e.target.closest('[data-act="fstate"]');
    if (fsb) { // ひらいた／表で重ねる／裏で重ねる を1回で切り替える
      const id = fsb.closest('[data-fold-bar]').dataset.foldBar; const v = fsb.dataset.v;
      S.fold[id + ':flip'] = v === 'ura';
      if (!!S.fold[id] !== (v !== 'open')) setFold(id, v !== 'open'); else { save(); applyFolds(); }
      return;
    }
    const see = e.target.closest('[data-act="fsee"]');
    if (see) { const id = see.closest('[data-fold-bar]').dataset.foldBar; S.fold[id + ':nosee'] = !S.fold[id + ':nosee']; save(); applyFolds(); return; }
    const mc = e.target.closest('[data-act="fmclear"]');
    if (mc) { const id = mc.closest('[data-fold-bar]').dataset.foldBar; S.fold[id + ':marks'] = []; save(); applyFolds(); return; }
    const lsvg = e.target.closest('svg.svg-letter');
    if (lsvg && !e.target.closest('.fold-handle')) { // ます目をタップ → 自分用の印（答えは出さない。どこに付けるかはプレイヤーが決める）
      const id = lsvg.closest('[data-fold-doc]').dataset.foldDoc;
      const pt = lsvg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
      const m = lsvg.getScreenCTM(); if (!m) return;
      const q = pt.matrixTransform(m.inverse());
      const c = Math.floor((q.x - 32) / 56), r = Math.floor((q.y - 740) / 56);
      if (c < 0 || c > 5 || r < 0 || r > 4) return;
      const k = `${r},${c}`; const ms = S.fold[id + ':marks'] = S.fold[id + ':marks'] || [];
      const at = ms.indexOf(k); if (at >= 0) ms.splice(at, 1); else ms.push(k);
      save(); applyFolds(); return;
    }
    const dg = e.target.closest('[data-act="fdiag"]');
    if (dg) { const more = dg.closest('.fold-bar').querySelector('.fb-more'); more.hidden = !more.hidden; dg.setAttribute('aria-expanded', String(!more.hidden)); return; }
    const b = e.target.closest('[data-act="fold"]');
    if (!b) return;
    const host = b.closest('[data-fold-doc],[data-fold-bar]'); const id = host.dataset.foldDoc || host.dataset.foldBar;
    setFold(id, !S.fold[id]);
  });
  let drag = null;
  document.addEventListener('pointerdown', (e) => {
    const h = e.target.closest('.fold-handle');
    if (!h) return;
    drag = { id: h.closest('[data-fold-doc]').dataset.foldDoc, y: e.clientY, moved: false };
    try { h.setPointerCapture(e.pointerId); } catch (er) {}
  });
  document.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const dy = e.clientY - drag.y;
    if (!S.fold[drag.id] && dy > 36) { drag.moved = true; setFold(drag.id, true); drag.y = e.clientY; }
    else if (S.fold[drag.id] && dy < -36) { drag.moved = true; setFold(drag.id, false); drag.y = e.clientY; }
  });
  document.addEventListener('pointerup', (e) => {
    if (!drag) return;
    const d = drag; drag = null;
    if (!d.moved && e.target.closest('.fold-handle')) setFold(d.id, !S.fold[d.id]);
  });
  document.addEventListener('pointercancel', () => { drag = null; });
  document.addEventListener('keydown', (e) => {
    const h = e.target.closest && e.target.closest('.fold-handle');
    if (h && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); const id = h.closest('[data-fold-doc]').dataset.foldDoc; setFold(id, !S.fold[id]); }
  });

  /* ================= メニュー ================= */
  let menuTab = 'hint';
  function openMenu(tab) {
    menuTab = tab || menuTab;
    renderMenu();
    const d = $('#dlg-menu');
    if (!d.open) d.showModal();
    const t = $(`[data-tab="${menuTab}"]`); if (t) t.focus();
  }
  function renderMenu() {
    $$('[role="tab"]').forEach((t) => { const on = t.dataset.tab === menuTab; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; });
    $$('[role="tabpanel"]').forEach((p) => { p.hidden = p.id !== 'mp-' + menuTab; });
    if (menuTab === 'hint') renderHints();
    if (menuTab === 'archive') {
      const a = archivedDocs();
      $('#archive-list').innerHTML = a.length ? a.map((id) => `<li><button type="button" class="arch-item" data-open="${id}"><span aria-hidden="true">${DOCS[id].icon}</span> ${id} ${esc(DOCS[id].title)}<span class="muted sm">${esc(DOCS[id].short)}</span></button></li>`).join('') : '<li class="muted">まだありません。ステージが進むと、前のステージの資料がここに入ります。</li>';
    }
    if (menuTab === 'memo') { $('#memo').value = S.memo; $('#memo-count').textContent = `${S.memo.length}文字`; }
    if (menuTab === 'settings') {
      $$('input[name="font"]').forEach((r) => { r.checked = r.value === S.settings.font; });
      $('#set-contrast').checked = S.settings.contrast; $('#set-motion').checked = S.settings.motion; $('#set-cb').checked = !!S.settings.cb;
    }
  }
  const HINT_ASK = ['ヒント1を見ますか？（どの資料を見ればいいか）', 'ヒント2を見ますか？（どこに目をつければいいか）', 'ヒント3を見ますか？（考え方の向き。答えは出ません）'];
  function renderHints() {
    const p = curPuzzle();
    const box = $('#hint-box');
    if (!p) { box.innerHTML = '<p class="muted">いまは解く謎がありません。</p>'; return; }
    const n = S.hints[p.id] || 0;
    const HS = hintsOf(p);
    box.innerHTML = `<p class="hint-for">いまの謎：<b>${esc(p.name)}</b></p>
      <ol class="hints">${HS.map((h, i) => i < n ? `<li class="open"><span class="h-lv">ヒント${i + 1}</span>${esc(h)}</li>` : i === n ? `<li><button type="button" class="btn ghost sm" id="btn-hint-next">ヒント${i + 1}を見る</button></li>` : `<li class="locked"><span class="h-lv">ヒント${i + 1}</span>ヒント${i}を見ると開けます</li>`).join('')}</ol>
      <p class="muted sm">ヒントは考える向きだけ。答えは出ません。</p>
      <p class="muted sm">ヒントは自分で開くまで見えません。見ても減点はありません。</p>`;
    const b = $('#btn-hint-next');
    if (b) b.onclick = async () => {
      const ok = await confirmDlg(HINT_ASK[n], '見る');
      if (!ok) { $('#btn-hint-next') && $('#btn-hint-next').focus(); return; }
      S.hints[p.id] = n + 1; save(); renderHints(); renderBottom();
      const opened = $$('#hint-box li.open'); if (opened.length) { opened[opened.length - 1].setAttribute('tabindex', '-1'); opened[opened.length - 1].focus(); }
    };
  }
  let memoTimer = null;
  function bindMenu() {
    $('#btn-menu').onclick = () => openMenu();
    $('#dlg-menu [data-close]').onclick = () => $('#dlg-menu').close();
    $('#dlg-menu').addEventListener('click', (e) => { if (e.target === $('#dlg-menu')) $('#dlg-menu').close(); });
    $$('[role="tab"]').forEach((t) => {
      t.onclick = () => { menuTab = t.dataset.tab; renderMenu(); };
      t.onkeydown = (e) => {
        const tabs = $$('[role="tab"]'); const i = tabs.indexOf(t);
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length]; menuTab = n.dataset.tab; renderMenu(); n.focus(); }
      };
    });
    $('#memo').addEventListener('input', () => {
      S.memo = $('#memo').value; $('#memo-count').textContent = `${S.memo.length}文字`;
      clearTimeout(memoTimer); $('#memo-saved').textContent = '';
      memoTimer = setTimeout(() => { save(); $('#memo-saved').textContent = '保存しました'; }, 400);
    });
    $$('input[name="font"]').forEach((r) => r.onchange = () => { S.settings.font = r.value; applySettings(); save(); });
    $('#set-contrast').onchange = (e) => { S.settings.contrast = e.target.checked; applySettings(); save(); };
    $('#set-motion').onchange = (e) => { S.settings.motion = e.target.checked; applySettings(); save(); };
    $('#set-cb').onchange = (e) => { S.settings.cb = e.target.checked; applySettings(); save(); window.TOOLS.apply(); };
    $('#btn-reset').onclick = askReset;
  }
  async function askReset() {
    const ok = await confirmDlg('最初からやり直しますか？ 進み具合とメモが消えます。', 'やり直す');
    if (ok) wipe();
  }
  function applySettings() {
    document.body.dataset.font = S.settings.font;
    document.body.classList.toggle('hc', !!S.settings.contrast);
    document.body.classList.toggle('reduce', reduced());
    document.body.classList.toggle('cb', !!S.settings.cb);
  }

  /* ================= 画面の高さ（キーボードが出ても、答える欄とボタンが隠れない） ================= */
  function fitViewport() {
    const vv = window.visualViewport;
    const h = vv ? vv.height : window.innerHeight;
    document.documentElement.style.setProperty('--app-h', Math.round(h) + 'px');
    document.documentElement.style.setProperty('--app-top', Math.round(vv ? vv.offsetTop : 0) + 'px');
    document.body.classList.toggle('kb-open', !!vv && window.innerHeight - vv.height > 120);
  }
  if (window.visualViewport) { visualViewport.addEventListener('resize', fitViewport); visualViewport.addEventListener('scroll', fitViewport); }
  window.addEventListener('resize', fitViewport);
  document.addEventListener('focusin', (e) => {
    const el = e.target;
    if (!el.matches || !el.matches('#puzzle input[type="text"]') || !isPhone()) return;
    setTimeout(() => { fitViewport(); el.scrollIntoView({ block: 'center', behavior: 'auto' }); updateMainLabel(); }, 260);
  });

  /* ================= 全体 ================= */
  function renderAll() {
    const st = stageObj();
    $('#stage-label').textContent = isClear() ? (S.choice ? 'エピローグ' : '夜明け') : st.label;
    $('#objective-text').textContent = isClear() ? (S.choice ? 'クリア。資料を読み返せます' : 'ネガをどうするか、決める') : st.objective;
    renderFeed(); renderCards(); renderPuzzle(); renderPanes(); renderPeek();
  }
  function startGame() {
    S.phase = 'game'; save();
    $('#screen-title').hidden = true; $('#screen-game').hidden = false;
    fitViewport();
    renderAll();
    if (!S.chat.includes('s0.start')) deliver('s0.start');
    if (!isClear() && S.stage > 0 && !S.chat.includes(`s${S.stage}.start`)) deliver(`s${S.stage}.start`);
    const lastKey = `s${STAGES.length - 1}.${STAGES[STAGES.length - 1].puzzles[0].id}`;
    if (isClear() && !S.chat.includes(lastKey)) deliver(lastKey, () => setTimeout(renderPuzzle, 0));
    if (isClear() && S.choice && !S.chat.includes(`s${STAGES.length}.${S.choice}`)) deliver(`s${STAGES.length}.${S.choice}`);
    $('#puzzle').focus({ preventScroll: true });
  }
  function bindGlobal() {
    document.addEventListener('click', (e) => {
      const o = e.target.closest('[data-open]');
      if (o && !o.disabled) {
        if (o.closest('#dlg-menu')) $('#dlg-menu').close();
        openDoc(o.dataset.open); return;
      }
      const m = e.target.closest('[data-menu]');
      if (m) openMenu(m.dataset.menu);
    });
    $('#bb-main').onclick = () => {
      if ($('#bb-main').dataset.mode === 'memo') { openMenu('memo'); return; }
      const f = $('#pz-form'); if (!f) return;
      if (!formVisible()) { // 謎が画面の外なら、まず謎まで連れていく（答えはまだ送らない）
        $('.pz-card').scrollIntoView({ block: 'end', behavior: reduced() ? 'auto' : 'smooth' });
        const first = $$('#pz-form input[type="text"]').find((i) => !i.value.trim());
        if (first) setTimeout(() => first.focus({ preventScroll: true }), reduced() ? 0 : 350);
        return;
      }
      f.requestSubmit ? f.requestSubmit() : f.dispatchEvent(new Event('submit', { cancelable: true }));
    };
    $('#scroll').addEventListener('scroll', () => { clearTimeout(bbT); bbT = setTimeout(updateMainLabel, 80); }, { passive: true });
    $('#scroll').addEventListener('scroll', () => { if (!$('#new-badge').hidden && nearBottom()) { newBadge(false); quietFeed = false; } }, { passive: true });
    $('#new-badge').addEventListener('click', () => { quietFeed = false; newBadge(false); const l = $('#feed').lastElementChild; if (l) l.scrollIntoView({ block: 'end', behavior: reduced() ? 'auto' : 'smooth' }); });
    $('#bb-peek').onclick = () => openPinned();
    $('#btn-vpeek').onclick = () => { const t = $('#btn-vpeek').dataset.target; const cur = S.view.panes[activePane()].doc; if (!t) return; S.view.back = cur; openDoc(t); };
    $('#btn-drawer').onclick = () => (drawerOpen() ? closeDrawer() : openDrawer());
    $('#dw-close').onclick = () => closeDrawer();
    $$('#drawer [data-dw]').forEach((b) => b.onclick = () => drawerTab(b.dataset.dw));
    $('#dw-submit').onclick = () => { const f = $('#pz-form'); if (f) f.requestSubmit ? f.requestSubmit() : f.dispatchEvent(new Event('submit', { cancelable: true })); };
    $('#memo2').addEventListener('input', () => { S.memo = $('#memo2').value; clearTimeout(memoTimer); memoTimer = setTimeout(save, 400); });
    $('#btn-pin').onclick = () => { const id = S.view.panes[activePane()].doc; if (!id) return; setPin(S.pin === id ? null : id); };
    $('#btn-zcycle').onclick = () => { const i = activePane(), z = S.view.panes[i].zoom; setZoom(i, z < 1.45 ? 1.5 : z < 1.95 ? 2 : 1); };
    $$('.vw-bar .zbtn').forEach((b) => b.onclick = () => { const i = activePane(); setZoom(i, S.view.panes[i].zoom + (b.dataset.z === '+' ? 0.25 : -0.25)); });
    $('#btn-older').onclick = () => { const o = $('#feed-old'); o.hidden = !o.hidden; renderFeed(); };
    $('#btn-viewer-close').onclick = () => closeViewer(false);
    $('#btn-compare').onclick = () => {
      const v = S.view; v.compare = !v.compare;
      if (v.compare && !v.panes[1].doc) { const other = unlockedDocs().find((id) => id !== v.panes[0].doc); v.panes[1].doc = other || null; if (other) markRead(other); }
      v.active = v.compare ? 1 : 0; save(); renderPanes(); renderCards();
    };
    document.addEventListener('toggle', (e) => { if (e.target.matches && e.target.matches('details.facts')) { S.factsOpen = e.target.open; save(); } }, true);
    window.addEventListener('popstate', () => {
      if (pendingBack) { pendingBack = false; if (wantPush) { wantPush = false; try { history.pushState({ vw: 1 }, ''); } catch (e) {} } return; }
      closeViewer(true);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && viewerOpen() && !$('dialog[open]')) { e.preventDefault(); closeViewer(false); }
    });
    mqDesk.addEventListener('change', () => { if (mqDesk.matches) document.body.classList.remove('viewer-open'); renderPanes(); renderCards(); renderPeek(); });
    window.addEventListener('beforeunload', save);
    window.addEventListener('pagehide', save);
  }

  /* ================= 起動 ================= */
  applySettings();
  bindMenu(); bindGlobal(); fitViewport();
  if (hadSave) {
    $('#btn-continue').hidden = false; $('#btn-new2').hidden = false; $('#btn-new').hidden = true;
    $('#btn-continue').textContent = `続きから（${isClear() ? (S.choice ? 'クリア・読み返し' : '夜明け') : STAGES[S.stage].label}）`;
  }
  if (oldSave && !hadSave) { const n = document.createElement('p'); n.className = 'title-old'; n.setAttribute('role', 'status'); n.textContent = '物語が新しくなりました（v9：新しい3人と、11の謎）。前のセーブデータは使えないため、はじめからになります。'; const tn = $('.title-note'); if (tn) tn.before(n); }
  $('#btn-continue').onclick = startGame;
  $('#btn-new').onclick = startGame;
  $('#btn-new2').onclick = async () => { const ok = await confirmDlg('はじめから遊びますか？ 今の進み具合とメモは消えます。', 'はじめから'); if (ok) wipe(); };

  window.TOOLS.init({ S: () => S, save, cb: () => !!S.settings.cb });
  window.PLAY.init({ S: () => S, save, reduced: () => reduced() });
  window.__proto = { state: () => JSON.parse(JSON.stringify(S)), judge: (id, v) => judge(allPuzzles().find((p) => p.id === id), v), N };
})();
