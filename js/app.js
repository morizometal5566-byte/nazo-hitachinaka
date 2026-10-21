/* 十九年目のネガ 体験版 v4 — アプリ本体（素のJavaScript・サーバー不要・file:// でも動く）
   スマホ縦・片手が基本。上：見出し／まんなか：物語・資料・謎／下：答える（親指の届く場所） */
(function () {
  'use strict';
  const { DOCS, CHAT, STAGES } = window.CASE;
  const KEY = 'negative19.proto.v4';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const mqDesk = window.matchMedia('(min-width: 900px)');
  const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ================= 保存 ================= */
  function fresh() {
    return {
      v: 4, phase: 'title', stage: 0, step: 0, solved: {}, chat: [], read: [],
      fold: {}, ph: {}, wrong: {}, hints: {}, drafts: {}, memo: '', pin: null, peek: false,
      settings: { font: 'm', contrast: false, motion: false },
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
      return Object.assign(f, d, { settings: Object.assign(f.settings, d.settings || {}), view: Object.assign(f.view, d.view || {}) });
    } catch (e) { return null; }
  }
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

  /* ================= 入力のゆれをそろえる ================= */
  const KANJI = { '〇': 0, '零': 0, '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9 };
  function kanjiToNum(str) {
    return str.replace(/[〇零一二三四五六七八九十]+/g, (m) => {
      let total = 0, cur = 0;
      for (const ch of m) { if (ch === '十') { total += (cur || 1) * 10; cur = 0; } else cur = cur * 10 + KANJI[ch]; }
      return String(total + cur);
    });
  }
  const kataToHira = (s) => s.replace(/[\u30a1-\u30f6]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));
  const soft = (s) => kataToHira(String(s || '').normalize('NFKC').toLowerCase()).trim();
  const PUNCT = /[\s　「」『』。、．，,.!！?？・"'`ー〜~]/g;
  const norm = (s) => soft(s).replace(PUNCT, '').replace(/(駅|えき|さん)$/g, '');
  function parseTime(input) {
    let x = soft(input).replace(/\s/g, '');
    if (!x) return null;
    x = kanjiToNum(x).replace(/(ごろ|頃|くらい|ぐらい|ころ|ちょうど)$/g, '');
    const pm = /(午後|pm|p\.m\.|夜)/.test(x), am = /(午前|am|a\.m\.|朝)/.test(x);
    x = x.replace(/(午後|午前|pm|am|p\.m\.|a\.m\.|夜|朝)/g, '');
    let h, m, mt;
    if ((mt = x.match(/^(\d{1,2})[:：.時](\d{1,2})分?$/))) { h = +mt[1]; m = +mt[2]; }
    else if ((mt = x.match(/^(\d{1,2})時(半)?$/))) { h = +mt[1]; m = mt[2] ? 30 : 0; }
    else if ((mt = x.match(/^(\d{3,4})$/))) { h = Math.floor(+mt[1] / 100); m = +mt[1] % 100; }
    else return null;
    if (h > 24 || m > 59) return null;
    if (pm && h < 12) h += 12;
    else if (!am && h < 12) h += 12; // 事件は夜なので、午前と書いていなければ夜とみなす
    return h * 60 + m;
  }
  const clock = (t) => (t === null ? null : t % 720); // 文字盤の読み（12時間）
  function parseNum(input) {
    const x = kanjiToNum(soft(input).replace(/\s/g, ''));
    const mt = x.match(/^(\d{1,4})(分|分前|ふん|ぷん)?$/);
    return mt ? +mt[1] : null;
  }
  const STATION = {};
  [['なかみなと', '那珂湊', 'nakaminato'], ['とのやま', '殿山', 'tonoyama'], ['ひらいそ', '平磯', 'hiraiso'], ['なかね', '中根', 'nakane'],
   ['たかだのてっきょう', '高田の鉄橋', '高田鉄橋', 'たかだてっきょう'], ['みのはまがくえん', '美乃浜学園', 'みのはま'], ['いそざき', '磯崎', 'isozaki'],
   ['あじがうら', '阿字ヶ浦', '阿字ケ浦', '阿字が浦', 'ajigaura'], ['かつた', '勝田', 'katsuta'], ['こうきまえ', '工機前'], ['かねあげ', '金上']]
    .forEach((a) => a.forEach((n) => { STATION[norm(n)] = a[0]; }));
  const station = (v) => { const n = norm(v); return n ? (STATION[n] || n) : ''; };

  /* ================= 判定（欄をまとめて判定。どの欄が違うかは、よくある間違いのときだけ教える） ================= */
  const GENERIC = 'まだ合っていない。';
  const JUDGE = {
    '0A'(v) {
      const a = soft(v.w).replace(PUNCT, '').replace(/海/g, 'うみ').replace(/[二2]/g, 'ふた').replace(/駅/g, 'えき');
      if (!a) return { invalid: '見えた言葉を入れてね。' };
      if (a === 'うみへふたえき') return { ok: true };
      if (a === 'みたふえうへき') return { ok: false, msg: '左上から順に読んだ？ 穴のそばに、えんぴつの数字があるよ。' };
      if (/^[a-z]+$/.test(a)) return { ok: false, msg: 'ひらがなで入れてみて。' };
      if (a.startsWith('うみへ')) return { ok: false, msg: '「うみへ」までは合ってる。続きを数字の順に。' };
      return { ok: false, msg: GENERIC + '手紙を点線で折ると、穴から何が見える？' };
    },
    '0M'(v) {
      const s = station(v.start), p = station(v.pw);
      if (!s || !p) return { invalid: '2つの欄を、どちらも駅名で入れてね。' };
      if (s === 'なかみなと' && p === 'ひらいそ') return { ok: true };
      let msg = '開かなかった。……手紙と地図を、もう一度。';
      if (s === 'ひらいそ') msg = '平磯は、カメラの印（潮見さんの日の出ポイント）のそば。手紙の「写真館」は、地図のどの記号？';
      else if (p === 'ひらいそ') msg = '着いた駅は、つじつまが合ってる。スタートの駅をもう一度。';
      else if (s === 'なかみなと' && (p === 'なかね' || p === 'たかだのてっきょう')) msg = '那珂湊から、川と田んぼのほう（勝田のほう）へ行ってない？ 海は地図のどっち？';
      else if (s === 'なかみなと' && p === 'とのやま') msg = '海へ、いくつ進むんだった？';
      else if (s === 'なかみなと') msg = 'スタートは合ってそう。そこから海へ、ふた駅。';
      else if (p === 'いそざき' || p === 'みのはまがくえん') msg = 'スタートがずれてない？ 写真館は★の印。';
      else if (p === 'あじがうら') msg = '終点まで行っちゃった。';
      return { ok: false, msg };
    },
    '1A'(v) {
      if (!v.key) return { invalid: '［1］の手がかりを選んでね。' };
      const t = parseTime(v.t);
      if (t === null) return { invalid: '［2］は時刻の形で（例：12:30、1230、12時30分）。' };
      const c = clock(t);
      if (v.key === 'name' && c === 550) return { ok: true };
      if (c === 220) return { ok: false, msg: '交番の巡査と同じ読み方。……数字のない時計で、どうやって「上」を決めた？' };
      if (c >= 160 && c <= 172) return { ok: false, msg: '長い針と短い針、逆に読んでない？' };
      if (c === 550) return { ok: false, msg: 'その手がかりで上を決めたら、9時10分にはならないはず。……本当は何で決めた？' };
      if (v.key === 'tag') return { ok: false, msg: '番号札は、鑑識さんが写真に合わせて置いたもの。時計の向きとは関係ないかも。' };
      if (v.key === 'batt' || v.key === 'rule') return { ok: false, msg: '電池や物差しは、落ちたあとで動いたかもしれない。時計そのものに書いてあるものは？' };
      return { ok: false, msg: '店名の向きにそろえた？ ↻ で回してから、短い針と長い針を読んでみて。' };
    },
    '1B'(v) {
      const t = parseTime(v.m), n = parseNum(v.n);
      if (t === null) return { invalid: '［1］は時刻の形で（例：12:30）。' };
      if (n === null) return { invalid: '［2］は数字で（例：3）。' };
      if (!v.dir) return { invalid: '［3］進んでいた／遅れていた、を選んでね。' };
      const c = clock(t);
      if (c === 636 && n === 6 && v.dir === 'fast') return { ok: true };
      if (c === 84) return { ok: false, msg: '鏡の中の時計を、そのまま読んでない？ 鏡の中の店名、読める？' };
      if (c === 636 && n === 6) return { ok: false, msg: '10:30に撮ったのに、時計は10:36。時計のほうが先に行ってない？' };
      if (c === 636) return { ok: false, msg: '時計は読めてる。何と比べればいい？ 台紙を見て。' };
      if (n === 6 && v.dir === 'fast') return { ok: false, msg: 'ずれの答えと、時計の読みがかみ合ってない。もう一度、鏡を直して読んでみて。' };
      return { ok: false, msg: GENERIC + '鏡を ⇋ で直して、台紙の時刻と比べてみて。' };
    },
    '1M'(v) {
      const t = parseTime(v.time), g = parseNum(v.gap);
      if (t === null) return { invalid: '［1］は時刻の形で（例：12:30）。' };
      if (g === null) return { invalid: '［2］は数字で（例：15）。' };
      if (!v.proof) return { invalid: '［3］の裏づけを選んでね。' };
      const bad = (t !== 1264 ? 1 : 0) + (g !== 37 ? 1 : 0) + (v.proof !== 'suga' ? 1 : 0);
      if (!bad) return { ok: true, bad };
      let msg = GENERIC;
      if (t === 1270) msg = 'それは時計が「見せていた」時刻。……ずれてたよね？';
      else if (t === 1276) msg = '進んでいる時計なら、本当の時刻はもっと前。';
      else if (t < 1230 || t > 1320) msg = '検視の幅（20:30〜22:00）の外になってるよ。';
      else if (t === 1264 && g !== 37) msg = '時刻からの引き算をもう一度。110番は1-1に。';
      else if (v.proof === 'otsu' || v.proof === 'nono') msg = 'そのメッセージ、21:04でも21:10でも同じように説明できない？ どちらか一方にだけ合う証言は？';
      else if (v.proof === 'patrol') msg = '巡査が着いたのは21:50。襲われた時刻とは関係なさそう。';
      return { ok: false, bad, msg };
    },
  };

  /* ================= 便利なもの ================= */
  const stageObj = () => STAGES[Math.min(S.stage, STAGES.length - 1)];
  const isClear = () => S.stage >= STAGES.length;
  const curPuzzle = () => (isClear() ? null : STAGES[S.stage].puzzles[S.step]);
  const docsOfStage = (i) => (STAGES[i] ? STAGES[i].docs : []);
  const unlockedDocs = () => { const out = []; for (let i = 0; i <= Math.min(S.stage, STAGES.length - 1); i++) out.push(...docsOfStage(i)); return out; };
  const curDocs = () => docsOfStage(Math.min(S.stage, STAGES.length - 1));
  const archivedDocs = () => { const out = []; for (let i = 0; i < Math.min(S.stage, STAGES.length - 1); i++) out.push(...docsOfStage(i)); return out; };
  const allPuzzles = () => STAGES.flatMap((s) => s.puzzles);
  const viewerOpen = () => document.body.classList.contains('viewer-open');

  let toastTimer = null;
  function toast(html, action, ms) {
    const t = $('#toast');
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
    if (m.who === 'beat') return `<li class="beat"><p>${esc(m.t)}</p></li>`;
    const chip = m.doc && DOCS[m.doc] ? `<button type="button" class="doc-chip" data-open="${m.doc}"><span aria-hidden="true">${DOCS[m.doc].icon}</span> ${m.doc} ${esc(DOCS[m.doc].title)}</button>` : '';
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
  function renderFeed() {
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
  function keepBottomVisible() {
    // 新しい話が出たら、物語の最後が見えるように（ただし、いまの謎を画面から追い出さない）
    const sc = $('#scroll'); const last = $('#feed').lastElementChild;
    if (!sc || !last || viewerOpen()) return;
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
    const next = () => {
      const i = shown[job.key];
      if (i >= msgs.length) { finish(); return; }
      if (reduced()) { shown[job.key] = i + 1; $('#feed').insertAdjacentHTML('beforeend', msgHTML(msgs[i])); keepBottomVisible(); next(); return; }
      const ty = document.createElement('li');
      ty.className = msgs[i].who === 'beat' ? 'beat typing' : 'msg typing'; ty.setAttribute('aria-hidden', 'true');
      ty.innerHTML = msgs[i].who === 'beat' ? '<p>…</p>' : '<span class="who">莉々香</span><p><span class="dots"><i></i><i></i><i></i></span></p>';
      $('#feed').appendChild(ty); keepBottomVisible();
      setTimeout(() => {
        ty.remove(); shown[job.key] = i + 1;
        const f = $('#feed'); f.insertAdjacentHTML('beforeend', msgHTML(msgs[i])); f.lastElementChild.classList.add('in');
        keepBottomVisible();
        next();
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
      box.innerHTML = `${stepsHTML()}${factsHTML()}<div class="clear-card"><p class="clear-stamp" aria-hidden="true">体験版クリア</p>
        <h2 id="pz-name">S1「止まった時計」解決</h2>
        <p>潮見さんが襲われたのは <b>21時04分</b>。止まった時計は6分進んでいた。野々香さんの110番は、その37分あと。そして「今から行きます」は、襲われた8分あとに送られていた。</p>
        <p class="muted">次のS2「第一発見者の3つのおかしさ」は制作中。新しい道具「重ねる」「並べる」が増えます。<br>体験版の中に、この先で意味が変わる言葉や物が、いくつも置いてあります。メモに残しておくと、あとで「あっ」となるかも。</p>
        <div class="clear-btns"><button type="button" class="btn ghost" data-menu="memo">メモを見る</button><button type="button" class="btn ghost" id="btn-clear-reset">最初から遊ぶ</button></div></div>`;
      $('#btn-clear-reset').onclick = askReset;
      renderBottom();
      return;
    }
    const p = curPuzzle();
    const kindLabel = { small: '小謎', mid: p.id === '0M' ? '中謎（ロック）' : '中謎（全部そろえて判定）' }[p.kind];
    const dr = S.drafts[p.id] || {};
    const fb = S.lastFb && S.lastFb.id === p.id ? S.lastFb : null;
    const w = S.wrong[p.id] || 0;
    const openBtn = p.needFold && !S.fold['0-1'] ? '<button type="button" class="btn ghost sm open-doc" data-open="0-1">✉ 手紙を開く</button>' : '';
    box.innerHTML = `${stepsHTML()}${factsHTML()}
      <div class="pz-card${p.kind === 'mid' ? ' mid' : ''}">
        <p class="pz-kind">${kindLabel}</p>
        <h2 id="pz-name" class="pz-name">${esc(p.step)} ${esc(p.name)}</h2>
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
    if (S.pin) { $('#bb-peek-t').textContent = `${S.pin} ちら見`; pk.setAttribute('aria-pressed', String(!!S.peek)); pk.setAttribute('aria-label', `ピン留めした資料 ${S.pin} をちら見${S.peek ? '（表示中）' : ''}`); }
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
    const r = JUDGE[p.id](v);
    if (r.invalid) { S.lastFb = { id: p.id, msg: r.invalid, cls: 'info' }; save(); fb.className = 'pz-fb info'; fb.textContent = r.invalid; return; }
    if (!r.ok) {
      S.wrong[p.id] = (S.wrong[p.id] || 0) + 1;
      let msg = r.msg;
      if (r.bad && S.wrong[p.id] >= 3) msg = `間違いは${r.bad}つ。` + msg.replace(GENERIC, '');
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
      if (lastInStage) {
        renderAll();
        deliver(chatKey, () => {
          if (!isClear()) {
            deliver(`s${S.stage}.start`, () => {
              const n = curDocs().length;
              toast(`📨 莉々香から資料が届きました（${n}件）`, { label: '資料を見る', fn: () => { const c = $('#cards .card'); if (c) { c.scrollIntoView({ block: 'nearest', behavior: reduced() ? 'auto' : 'smooth' }); c.focus({ preventScroll: true }); } } });
            });
          } else toast('🎉 体験版クリア。遊んでくれてありがとう。');
        });
      } else {
        renderPuzzle();
        deliver(chatKey);
      }
    }, reduced() ? 150 : 1100);
  }

  /* ================= ビューア ================= */
  function paneCount() { return S.view.compare && !isPhone() ? 2 : 1; }
  function activePane() { return paneCount() === 2 ? S.view.active : 0; }
  function renderPanes() {
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
      html += `<section class="pane${n === 2 && S.view.active === i ? ' active' : ''}" data-pane="${i}" aria-label="${n === 2 ? (i ? '右' : '左') + 'の資料' : '資料'}">
        ${n === 2 ? `<div class="pane-head"><label class="sr-only" for="sel-${i}">表示する資料</label><select id="sel-${i}" class="pane-sel"><option value="">資料を選ぶ</option>${opts}</select></div>` : ''}
        <div class="pane-scroll" tabindex="0" aria-label="資料の本文。＋−キーで拡大縮小">${d ? `<div class="doc-zoom" style="zoom:${pn.zoom}">${d.html()}</div>` : '<p class="pane-empty">資料カードを選ぶと、ここに表示されます。</p>'}</div>
      </section>`;
    }
    wrap.innerHTML = html;
    $$('.pane', wrap).forEach(bindPane);
    renderViewerBar();
    applyPhotos(); applyFolds();
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
    vp.hidden = !(S.pin && d && S.pin !== pn.doc);
    if (!vp.hidden) { vp.textContent = `⧉ ${S.pin}`; vp.setAttribute('aria-pressed', String(!!S.peek)); vp.setAttribute('aria-label', `ピン留めした ${S.pin} をちら見`); }
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
    sc.addEventListener('dblclick', (e) => { if (e.target.closest('button,.fold-handle,a,input,select,summary,label')) return; setZoom(i, S.view.panes[i].zoom >= 1.5 ? 1 : 2); });
    // ピンチ（2本指）
    const pts = new Map(); let startD = 0, startZ = 1;
    const dist = () => { const a = [...pts.values()]; return Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y); };
    sc.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'touch') return; pts.set(e.pointerId, { x: e.clientX, y: e.clientY }); if (pts.size === 2) { startD = dist(); startZ = S.view.panes[i].zoom; } });
    sc.addEventListener('pointermove', (e) => { if (!pts.has(e.pointerId)) return; pts.set(e.pointerId, { x: e.clientX, y: e.clientY }); if (pts.size === 2 && startD > 0) setZoom(i, startZ * dist() / startD); });
    const up = (e) => { pts.delete(e.pointerId); if (pts.size < 2) startD = 0; };
    sc.addEventListener('pointerup', up); sc.addEventListener('pointercancel', up);
  }
  function markRead(id) { if (!S.read.includes(id)) S.read.push(id); }
  function openDoc(id) {
    if (!DOCS[id] || !unlockedDocs().includes(id)) return;
    const v = S.view;
    const i = activePane();
    if (v.panes[i].doc !== id) { v.panes[i].doc = id; v.panes[i].zoom = 1; }
    markRead(id); save();
    renderPanes(); renderCards();
    if (isPhone()) {
      if (!viewerOpen()) {
        document.body.classList.add('viewer-open');
        try { history.pushState({ vw: 1 }, ''); } catch (e) {}
      }
      $('#btn-viewer-close').focus({ preventScroll: true });
    } else {
      const sc = $(`.pane[data-pane="${i}"] .pane-scroll`); if (sc) sc.focus({ preventScroll: true });
    }
    renderPeek();
  }
  function closeViewer(fromPop) {
    if (!viewerOpen()) return;
    document.body.classList.remove('viewer-open');
    if (!fromPop && history.state && history.state.vw) { try { history.back(); } catch (e) {} }
    renderPeek();
    const id = S.view.panes[0].doc;
    const c = $(`#cards [data-open="${id}"]`) || $('#puzzle');
    if (c) c.focus({ preventScroll: true });
  }

  /* ================= ピン留め＋ちら見（スマホで2枚を見比べるかわり） ================= */
  function setPin(id) {
    S.pin = id; S.peek = false; save();
    renderViewerBar(); renderBottom(); renderCards(); renderPeek();
    if (id) toast(`📌 ${id} をピン留め。ほかの画面で「ちら見」できます`, null, 2500);
  }
  function togglePeek(v) {
    { const t = $('#toast'); if (t) t.hidden = true; }
    S.peek = typeof v === 'boolean' ? v : !S.peek; save();
    renderPeek(); renderBottom(); renderViewerBar();
  }
  function renderPeek() {
    const pk = $('#peek');
    const curViewerDoc = S.view.panes[activePane()].doc;
    const inViewer = isPhone() && viewerOpen();
    const show = !!(S.pin && S.peek && DOCS[S.pin] && !(inViewer && curViewerDoc === S.pin));
    document.body.classList.toggle('peek-open', show);
    if (!show) { pk.hidden = true; return; }
    const slot = inViewer ? $('#peek-slot-viewer') : $('#peek-slot-main');
    if (pk.parentElement !== slot) slot.appendChild(pk);
    if (pk.dataset.doc !== S.pin) { $('#peek-body').innerHTML = `<div class="doc-zoom">${DOCS[S.pin].html()}</div>`; pk.dataset.doc = S.pin; applyPhotos(); applyFolds(); }
    $('#peek-title').textContent = `📌 ${S.pin} ${DOCS[S.pin].title}`;
    pk.hidden = false;
  }

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
    $$('[data-fold-doc]').forEach((doc) => {
      const f = !!S.fold[doc.dataset.foldDoc];
      const svg = $('svg.svg-letter', doc), wrap = $('.letter-wrap', doc);
      if (svg) {
        clearTimeout(svg._t);
        if (f) {
          const compact = () => { svg.setAttribute('viewBox', svg.dataset.vbFolded); wrap.classList.add('compact'); };
          if (svg.classList.contains('is-folded') || reduced() || !svg.dataset.init) { svg.classList.add('is-folded'); compact(); }
          else { svg.classList.add('is-folded'); svg._t = setTimeout(compact, 950); }
        } else {
          svg.setAttribute('viewBox', svg.dataset.vbFull); wrap.classList.remove('compact');
          void svg.getBoundingClientRect();
          svg.classList.remove('is-folded');
        }
        svg.dataset.init = '1';
      }
      const b = $('[data-act="fold"]', doc); if (b) { b.setAttribute('aria-pressed', String(f)); b.textContent = f ? '↺ 手紙をひらく' : '✂ 点線で折る'; }
      const help = $('.fold-help', doc); if (help) help.textContent = f ? 'ひらくと、地図が見えます' : '点線を下へスワイプしても折れます';
      const h = $('.fold-handle', doc); if (h) h.setAttribute('aria-label', f ? '手紙をひらく' : '点線で折る');
      const live = $('.fold-live', doc); if (live) live.textContent = f ? '手紙を折りました。穴から下の字が見えています。穴のそばに数字があります。' : '';
    });
  }
  function setFold(id, v) {
    if (!!S.fold[id] === v) return;
    S.fold[id] = v; save(); applyFolds();
    renderPuzzleSoft();
  }
  function renderPuzzleSoft() { // 入力中の文字を消さないよう、「手紙を開く」ボタンだけ出し入れする
    const b = $('#puzzle .open-doc'); const p = curPuzzle();
    if (b && p && p.needFold && S.fold['0-1']) b.remove();
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-act="fold"]');
    if (!b) return;
    const id = b.closest('[data-fold-doc]').dataset.foldDoc;
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
      $('#set-contrast').checked = S.settings.contrast; $('#set-motion').checked = S.settings.motion;
    }
  }
  const HINT_ASK = ['ヒント1を見ますか？（どこを見ればいいかが分かります）', 'ヒント2を見ますか？（何をすればいいかが分かります）', 'ヒント3は「答え」です。見ますか？'];
  function renderHints() {
    const p = curPuzzle();
    const box = $('#hint-box');
    if (!p) { box.innerHTML = '<p class="muted">いまは解く謎がありません。</p>'; return; }
    const n = S.hints[p.id] || 0;
    box.innerHTML = `<p class="hint-for">いまの謎：<b>${esc(p.step)} ${esc(p.name)}</b></p>
      <ol class="hints">${p.hint.map((h, i) => i < n ? `<li class="open"><span class="h-lv">${i === 2 ? '答え' : 'ヒント' + (i + 1)}</span>${esc(h)}</li>` : i === n ? `<li><button type="button" class="btn ${i === 2 ? 'danger' : 'ghost'} sm" id="btn-hint-next">${i === 2 ? '答えを見る' : `ヒント${i + 1}を見る`}</button></li>` : `<li class="locked"><span class="h-lv">${i === 2 ? '答え' : 'ヒント' + (i + 1)}</span>ヒント${i}を見ると開けます</li>`).join('')}</ol>
      <p class="muted sm">ヒントは自分で開くまで見えません。見ても減点はありません。</p>`;
    const b = $('#btn-hint-next');
    if (b) b.onclick = async () => {
      const ok = await confirmDlg(HINT_ASK[n], n === 2 ? '答えを見る' : '見る');
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
    setTimeout(() => { fitViewport(); el.scrollIntoView({ block: 'center', behavior: 'auto' }); }, 260);
  });

  /* ================= 全体 ================= */
  function renderAll() {
    const st = stageObj();
    $('#stage-label').textContent = isClear() ? '体験版クリア' : st.label;
    $('#objective-text').textContent = isClear() ? '続き（S2）は制作中' : st.objective;
    renderFeed(); renderCards(); renderPuzzle(); renderPanes(); renderPeek();
  }
  function startGame() {
    S.phase = 'game'; save();
    $('#screen-title').hidden = true; $('#screen-game').hidden = false;
    fitViewport();
    renderAll();
    if (!S.chat.includes('s0.start')) deliver('s0.start');
    if (!isClear() && S.stage > 0 && !S.chat.includes(`s${S.stage}.start`)) deliver(`s${S.stage}.start`);
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
    $('#bb-peek').onclick = () => togglePeek();
    $('#btn-vpeek').onclick = () => togglePeek();
    $('#peek-close').onclick = () => togglePeek(false);
    $('#peek-unpin').onclick = () => setPin(null);
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
    window.addEventListener('popstate', () => closeViewer(true));
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
    $('#btn-continue').textContent = `続きから（${isClear() ? '体験版クリア' : STAGES[S.stage].label}）`;
  }
  $('#btn-continue').onclick = startGame;
  $('#btn-new').onclick = startGame;
  $('#btn-new2').onclick = async () => { const ok = await confirmDlg('はじめから遊びますか？ 今の進み具合とメモは消えます。', 'はじめから'); if (ok) wipe(); };

  window.__proto = { state: () => JSON.parse(JSON.stringify(S)), parseTime, parseNum, norm, station, judge: (id, v) => JUDGE[id](v) };
})();
