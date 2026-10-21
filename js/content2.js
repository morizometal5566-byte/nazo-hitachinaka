/* 十九年目のネガ — 完全版：S2〜S4（第一発見者・母のアリバイ・夜の再構成） */
(function () {
  'use strict';
  const C = window.CASE, A = C.art;

  /* 透明シートを重ねる道具。シートはドラッグ（指・マウス）／矢印キーで動かし、↺↻⇋で向きを変える。
     向きと位置が合うと「ピタッ」と止まる。 */
  function overlay(id, o) {
    return `
<figure class="ov" data-ov="${id}" data-init='${JSON.stringify(o.init)}' data-snap='${JSON.stringify(o.snap)}' data-pivot="${o.pivot.join(',')}">
  <div class="ov-frame"><svg viewBox="0 0 ${o.w} ${o.h}" class="ov-svg" role="img" aria-label="${o.alt}">
    <g class="ov-base">${o.base}</g>
    <g class="ov-sheet" tabindex="0" role="group" aria-label="${o.label}。ドラッグか矢印キーで動かせます"><g class="ov-xf">${o.sheet}</g></g>
  </svg></div>
  <div class="ov-tools" role="group" aria-label="シートの道具">
    <button type="button" class="tool" data-ovt="rl" aria-label="シートを左に回す">↺</button>
    <button type="button" class="tool" data-ovt="rr" aria-label="シートを右に回す">↻</button>
    <button type="button" class="tool" data-ovt="flip" aria-label="シートを裏返す">⇋ 裏返す</button>
    <button type="button" class="tool" data-ovt="align" aria-label="シートの位置だけ合わせる（向きはそのまま）">⌖ 位置</button>
    <button type="button" class="tool ghost" data-ovt="reset">元に戻す</button>
    <span class="ov-state" aria-live="polite"></span>
  </div>
  <p class="ov-ok" role="status" hidden>${o.okmsg}</p>
  ${o.cap ? `<figcaption>${o.cap}</figcaption>` : ''}
</figure>`;
  }
  A.overlay = overlay;

  /* ---------- S2 ---------- */
  const BODY = 'M168 128 Q200 118 232 128 L262 150 L282 280 L268 284 L246 176 L244 300 L238 440 L214 440 L205 312 L195 312 L186 440 L162 440 L156 300 L154 176 L132 284 L118 280 L138 150 Z';
  const FLOOR_TOP = `
    <rect width="400" height="480" fill="#a89f8d"/>
    ${Array.from({ length: 9 }, (_, i) => `<line x1="${i * 50 + 10}" y1="0" x2="${i * 50 + 10}" y2="480" stroke="#978d7a" stroke-width="2"/>`).join('')}
    <rect x="0" y="0" width="400" height="40" fill="#eef0f1"/><text x="200" y="26" text-anchor="middle" font-size="14" fill="#666">（奥）背景紙</text>
    <circle cx="200" cy="88" r="32" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="7 5"/>
    <path d="${BODY}" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="7 5"/>
    <rect x="266" y="262" width="18" height="11" rx="2" fill="#37474f" stroke="#fff" stroke-width="1.5"/>
    <text x="300" y="262" font-size="13" fill="#fff">腕時計</text>
    <g font-family="sans-serif" font-size="12" font-weight="700"><polygon points="20,462 36,462 28,446" fill="#f6c343"/><text x="24" y="460">4</text></g>`;
  const BODY_SHEET = `
    <rect x="0" y="0" width="400" height="480" fill="#bfe3ff" fill-opacity=".28" stroke="#4f8fc0" stroke-width="2" stroke-dasharray="3 3"/>
    <circle cx="200" cy="88" r="32" fill="#4f8fc0" fill-opacity=".18" stroke="#1e5f8f" stroke-width="2.5"/>
    <path d="${BODY}" fill="#4f8fc0" fill-opacity=".12" stroke="#1e5f8f" stroke-width="2.5"/>
    <path d="M186 74 L214 102 M214 74 L186 102" stroke="#c62828" stroke-width="5" stroke-linecap="round"/>
    <rect x="116" y="262" width="18" height="11" rx="2" fill="none" stroke="#1e5f8f" stroke-width="2"/>
    <g transform="translate(400 0) scale(-1 1)" font-family="'Noto Sans CJK JP',sans-serif" fill="#1e5f8f">
      <text x="200" y="168" text-anchor="middle" font-size="17" font-weight="700">背中側から見た図</text>
      <text x="200" y="190" text-anchor="middle" font-size="14">× ＝ 頭の傷（後頭部）</text>
      <text x="300" y="300" text-anchor="middle" font-size="12">腕時計（左手首）</text></g>`;

  const SKETCH_SVG = `
<svg viewBox="0 0 600 420" class="svg-photo sketch" role="img" aria-label="鉛筆のスケッチ。夜の通り。左に写真館の入口、右に小さな車。若い女性が、写真館から車へ歩いている。首に赤いマフラー（そこだけ赤鉛筆）。片方の手は胸の前にあり、手もとに小さな四角い光が描かれ、顔の下がほんのり明るい。もう片方のわきに、平たい四角い物をかかえている。">
  <rect width="600" height="420" fill="#f7f3ea"/>
  <g fill="none" stroke="#555" stroke-width="2" stroke-linecap="round" opacity=".9">
    <path d="M30 60 H200 V380 H30 Z"/><path d="M50 120 H180 V380"/><path d="M40 92 H190"/>
    <path d="M60 140 H160 V250 H60 Z" stroke-dasharray="4 4"/>
    <path d="M0 380 H600" stroke-width="3"/><path d="M0 396 H600" stroke-dasharray="10 12"/>
    <path d="M420 300 Q430 250 480 248 H540 Q570 250 575 300 V350 H415 Z"/><circle cx="445" cy="360" r="20"/><circle cx="550" cy="360" r="20"/>
    <path d="M450 262 H540 V298 H440 Z"/>
    <path d="M300 182 Q292 214 296 260 L288 330 M306 260 L318 330"/>
    <circle cx="302" cy="160" r="17"/>
  </g>
  <text x="68" y="110" font-size="18" fill="#555" font-family="serif">潮見写真館</text>
  <path d="M287 180 Q302 194 318 180 L322 200 Q302 210 284 198 Z" fill="#d32f2f" opacity=".85"/>
  <path d="M316 214 L336 214 L334 270 L314 270 Z" fill="#a1887f" stroke="#5d4037" stroke-width="1.5"/>
  <g><path d="M296 214 Q286 220 290 232" stroke="#555" stroke-width="2" fill="none"/>
    <rect x="284" y="226" width="12" height="16" rx="2" fill="#e3f2fd" stroke="#1565c0" stroke-width="1.2"/>
    <circle cx="290" cy="234" r="16" fill="#bbdefb" opacity=".45"/>
    <path d="M276 222 l-6 -4 M276 246 l-6 4 M304 222 l6 -4" stroke="#90caf9" stroke-width="1.5"/></g>
  <path d="M294 168 Q302 176 310 168" stroke="#90caf9" stroke-width="1.2" fill="none"/>
  <text x="360" y="60" font-size="15" fill="#666" font-family="'Noto Serif CJK JP',serif">1/15 21:39ごろ　2階の窓から</text>
  <text x="360" y="84" font-size="15" fill="#666" font-family="'Noto Serif CJK JP',serif">――菅谷</text>
</svg>`;

  /* ---------- S3：基地局シート（地図に重ねる） ---------- */
  const WEDGE = 'M120 330 L273.2 201.4 A200 200 0 0 1 273.2 458.6 Z';
  const SECTOR_SHEET = `
    <rect x="0" y="0" width="400" height="520" fill="#ffe9b0" fill-opacity=".14" stroke="#c77700" stroke-width="2" stroke-dasharray="3 3"/>
    <path d="${WEDGE}" fill="#ff9800" fill-opacity=".30" stroke="#e65100" stroke-width="2.5"/>
    <g stroke="#e65100" stroke-width="2"><line x1="104" y1="330" x2="136" y2="330"/><line x1="120" y1="314" x2="120" y2="346"/></g>
    <circle cx="120" cy="330" r="5" fill="#e65100"/>
    <text x="128" y="352" font-size="13" fill="#bf360c" font-weight="700">＋＝那珂湊駅</text>
    <g transform="translate(60 330)"><circle r="17" fill="#fff7e6" stroke="#e65100" stroke-width="1.5"/><path d="M-13 0 L6 -6 L2 0 L6 6 Z" fill="#e65100"/><text x="-27" y="5" text-anchor="middle" font-size="14" font-weight="700" fill="#bf360c">N</text></g>
    <text x="200" y="500" text-anchor="middle" font-size="14" fill="#bf360c">湊中央局 第2セクター（電波の届く範囲）</text>`;

  /* ---------- S4：ダイヤ図（なぞる） ---------- */
  const ST4 = [['那珂湊', 40], ['殿山', 80], ['平磯', 120], ['美乃浜学園', 160], ['磯崎', 200], ['阿字ヶ浦', 240]];
  const tx = (h, m) => 92 + ((h * 60 + m) - (20 * 60 + 50)) * 4.6; // 20:50〜21:50
  const TRAINS = [
    { id: 'd1', dir: '下り', pts: [[20, 55, 0], [20, 57, 1], [21, 0, 2], [21, 2, 3], [21, 5, 4], [21, 7, 5]] },
    { id: 'u1', dir: '上り', pts: [[21, 12, 5], [21, 14, 4], [21, 17, 3], [21, 19, 2], [21, 22, 1], [21, 24, 0]] },
    { id: 'd2', dir: '下り', pts: [[21, 32, 0], [21, 35, 1], [21, 37, 2], [21, 39, 2], [21, 41, 3], [21, 43, 4], [21, 45, 5]] },
    { id: 'u2', dir: '上り', pts: [[21, 30, 5], [21, 32, 4], [21, 34, 3], [21, 37, 2], [21, 38, 2], [21, 40, 1], [21, 43, 0]] },
  ];
  const fmt = (h, m) => `${h}:${String(m).padStart(2, '0')}`;
  function diagramSVG() {
    const grid = [];
    for (let k = 0; k <= 60; k += 10) { const m = 50 + k, h = 20 + Math.floor(m / 60), mm = m % 60, x = tx(h, mm); grid.push(`<line x1="${x}" y1="28" x2="${x}" y2="252" stroke="#cfc6b0" stroke-width="${k % 30 === 10 ? 1.6 : 1}"/><text x="${x}" y="272" text-anchor="middle" font-size="13" fill="#5d4037">${fmt(h, mm)}</text>`); }
    for (let k = 5; k < 60; k += 10) { const m = 50 + k, h = 20 + Math.floor(m / 60), x = tx(h, m % 60); grid.push(`<line x1="${x}" y1="28" x2="${x}" y2="252" stroke="#e5dfcf" stroke-width="1" stroke-dasharray="2 3"/>`); }
    const st = ST4.map(([n, y]) => `<line x1="88" y1="${y}" x2="372" y2="${y}" stroke="#bdb39b" stroke-width="1"/><text x="84" y="${y + 5}" text-anchor="end" font-size="13" fill="#3e2723">${n}</text>`).join('');
    const tr = TRAINS.map((t) => {
      const p = t.pts.map(([h, m, s]) => `${tx(h, m).toFixed(1)},${ST4[s][1]}`).join(' ');
      const a = t.pts[0], b = t.pts[t.pts.length - 1];
      return `<g class="trn" data-trn="${t.id}" data-info="${ST4[a[2]][0]} ${fmt(a[0], a[1])}発 → ${ST4[b[2]][0]} ${fmt(b[0], b[1])}着（${t.dir}）"><polyline points="${p}" class="trn-hit"/><polyline points="${p}" class="trn-line"/></g>`;
    }).join('');
    return `<svg viewBox="0 0 394 290" class="svg-diagram" role="img" aria-label="夜の湊線のダイヤ図。横が時刻（20:50〜21:50）、縦が駅（上から那珂湊・殿山・平磯・美乃浜学園・磯崎・阿字ヶ浦）。斜めの線が1本ずつ列車を表す。線を指でなぞると、その列車の時刻が出る。">
      <rect width="394" height="290" fill="#fffdf6"/>${grid.join('')}${st}${tr}
      <g class="trn-dot" visibility="hidden"><circle r="7" fill="#c62828" fill-opacity=".85"/></g></svg>`;
  }
  A.diagramSVG = diagramSVG;

  /* ---------- S4：ドラレコ ---------- */
  function dashcam(o) {
    const truck = o.truck ? `<g><rect x="70" y="232" width="120" height="44" rx="4" fill="#f5f5f5" stroke="#999"/><rect x="150" y="206" width="48" height="40" rx="5" fill="#fafafa" stroke="#999"/><rect x="158" y="212" width="30" height="18" fill="#90a4ae"/><circle cx="96" cy="280" r="12" fill="#333"/><circle cx="178" cy="280" r="12" fill="#333"/><path d="M74 232 l20 -14 l20 14 l20 -14 l20 14 l20 -14" stroke="#795548" stroke-width="2" fill="none"/><text x="92" y="258" font-size="12" fill="#888">軽トラ</text></g>`
      : `<g opacity=".7"><path d="M66 286 q60 -6 140 0" stroke="#6d6d6d" stroke-width="5" fill="none"/><path d="M66 296 q60 -6 140 0" stroke="#6d6d6d" stroke-width="5" fill="none"/></g>`;
    const person = o.who === 'mom'
      ? `<g><circle cx="230" cy="214" r="12" fill="#d7ccc8"/><path d="M218 210 q12 -16 24 0 v6 h-24z" fill="#8d6e63"/><rect x="220" y="226" width="22" height="38" rx="5" fill="#5d4037"/><rect x="221" y="262" width="9" height="22" fill="#2e7d32"/><rect x="233" y="262" width="9" height="22" fill="#2e7d32"/><path d="M220 238 l-24 10" stroke="#5d4037" stroke-width="6"/></g>`
      : `<g><circle cx="330" cy="210" r="12" fill="#d7ccc8"/><path d="M320 200 q10 -10 20 0" fill="#3e2723"/><path d="M318 222 h26 v8 h-26z" fill="#e53935"/><rect x="336" y="228" width="7" height="22" fill="#e53935"/><rect x="320" y="230" width="22" height="38" rx="5" fill="#455a64"/><rect x="321" y="266" width="9" height="20" fill="#263238"/><rect x="333" y="266" width="9" height="20" fill="#263238"/><path d="M342 240 l26 -14" stroke="#455a64" stroke-width="6"/></g>`;
    return `<svg viewBox="0 0 480 320" class="svg-photo dash" role="img" aria-label="${o.alt}">
      <rect width="480" height="320" fill="#1c2430"/><rect y="250" width="480" height="70" fill="#2a2f36"/>
      <path d="M0 120 L120 70 L240 120 V250 H0 Z" fill="#283241"/><rect x="40" y="150" width="40" height="34" fill="#f2c14e" fill-opacity=".55"/>
      <g stroke="#6b6b6b" stroke-width="3">${[0, 1, 2].map((i) => `<line x1="270" y1="${170 + i * 26}" x2="460" y2="${170 + i * 26}"/>`).join('')}<line x1="270" y1="160" x2="270" y2="250"/><line x1="460" y1="160" x2="460" y2="250"/></g>
      <g fill="#e39b52">${[0, 1, 2].map((i) => Array.from({ length: 7 }, (_, j) => `<rect x="${280 + j * 26}" y="${172 + i * 26}" width="16" height="7" rx="2"/>`).join('')).join('')}</g>
      ${o.sheet ? '<path d="M268 160 Q360 150 462 162 L462 205 Q360 196 268 206 Z" fill="#1e88e5" fill-opacity=".75"/>' : ''}
      ${truck}${person}
      <rect width="480" height="320" fill="#0d1b2a" fill-opacity=".18"/>
      <text x="12" y="22" font-family="monospace" font-size="15" fill="#e8f5e9">${o.ts}</text><text x="468" y="22" text-anchor="end" font-family="monospace" font-size="15" fill="#ff5252">● P-REC</text>
    </svg>`;
  }

  Object.assign(C.DOCS, {
    '2-1': {
      no: '2-1', stage: 2, icon: '🗒', kind: '調書', title: '野々香の供述', short: '第一発見者の話（5つの文）',
      re: '①〜⑤のほとんどは、母を守るための嘘。でも野々香が本当に守っていたものは、19年前から変わっていなかった。',
      html: () => `
<article class="doc paper form">
  <header class="form-head"><div class="form-org">那珂湊中央警察署（架空）</div><h3>供述調書（要旨）</h3><div class="form-meta">1月15日 22:40〜　風見野々香（31）</div></header>
  <ol class="stmts">
    <li><b>①</b> 9時20分ごろ、家を出ました。</li>
    <li><b>②</b> 潮見さんに頼んでいた商品写真を、今夜受け取る約束でした。</li>
    <li><b>③</b> 店に入ると、潮見さんが倒れていました。怖くて、体には<b>さわっていません</b>。</li>
    <li><b>④</b> スマホを車に忘れたので、<b>取りに戻ってから</b>110番しました。</li>
    <li><b>⑤</b> 母はずっと家にいました。</li>
  </ol>
  <p class="aside">※110番の言葉は1-5、入退室は1-1。</p>
</article>`,
    },
    '2-2': {
      no: '2-2', stage: 2, icon: '🩻', kind: '透明シート', title: '検視の人体図（透明シート）', short: '鑑識の真上写真に重ねる',
      re: 'シートは裏返しで届いていた。表に直すと、傷は後頭部＝床の側。見えない傷を「殴られた」と言えたのは、先に聞いていたから。',
      html: () => `
<article class="doc paper">
  <div class="sticky">検視の人体図は、透明シート。鑑識さんの「写真④ ご遺体の位置（真上から）」に重ねて使うんだって。</div>
  ${overlay('2-2s', { w: 400, h: 480, base: FLOOR_TOP, sheet: BODY_SHEET, init: { x: 48, y: 36, r: 0, f: 0 }, snap: { x: 0, y: 0, r: 0, f: 1, tol: 26 }, pivot: [200, 240],
    label: '検視の人体図の透明シート', alt: '鑑識の写真④。床を真上から撮ったもの。白い点線で、仰向けのご遺体の輪郭（頭が上）。輪郭の右手首に腕時計。その上に、青い線の透明シート（人の形、頭に赤い×、左右反対の字）が少しずれて重なっている。',
    okmsg: 'ピタッ。輪郭も腕時計も重なった。シートの字が読める。',
    cap: '写真④ ご遺体の位置（22:36、真上から）。下：鑑識写真／上：検視の透明シート' })}
  <details class="sr-text"><summary>図を文字で読む</summary><p>写真④：仰向けのご遺体。頭が写真の上。腕時計は、写真の右側の手首。透明シート：人の形の線画。頭のまん中に赤い×。字は左右が反対になっていて、腕時計の印は、シートの左側の手首にある。シートを裏返すと字が読める。</p></details>
</article>`,
    },
    '2-3': {
      no: '2-3', stage: 2, icon: '✏', kind: 'スケッチ', title: '菅谷さんのスケッチ', short: '21:39、窓から見た野々香',
      re: '手もとの青白い光はスマホ。わきの平たい物は、母の店の茶封筒（S4）。赤いマフラーは、S4のドラレコでも決め手になった。',
      html: () => `
<article class="doc paper">
  <div class="sticky">菅谷さんは元・美術の先生。「見たまま描いたわよ」って。</div>
  ${A.photo('2-3a', SKETCH_SVG, '「手もとが、四角く青白く光ってたの。わきには、何か平たい物」――菅谷')}
</article>`,
    },
    '3-1': {
      no: '3-1', stage: 3, icon: '🗒', kind: '調書', title: 'みゆきの供述', short: '母の話。「ずっと家でテレビ」',
      re: 'ドラマの結末は、テレビ欄の紹介文をなぞっただけ。家にいたという嘘は、自分が写真館にいたことを隠すためだった。',
      html: () => `
<article class="doc paper form">
  <header class="form-head"><div class="form-org">那珂湊中央警察署（架空）</div><h3>供述調書（要旨）</h3><div class="form-meta">1月15日 23:10〜　風見みゆき（58）</div></header>
  <ol class="stmts">
    <li><b>①</b> 夜はずっと、家から一歩も出ていません。</li>
    <li><b>②</b> 9時から、野々香と2人で、<b>6チャンネル</b>のドラマ『潮騒の駅』の最終回を見ていました。</li>
    <li><b>③</b> 最後、駅のホームで2人が手を振るところで、泣いてしまって。</li>
    <li><b>④</b> 9時20分ごろ、野々香が写真を取りに出かけました。</li>
  </ol>
</article>`,
    },
    '3-2': {
      no: '3-2', stage: 3, icon: '📶', kind: '記録', title: '通話記録と基地局シート', short: '21:08の電話。どこからかけた？',
      re: 'シートの北と地図の北をそろえると、電波の範囲は写真館と湊公園。みゆきは潮見が倒れた4分後、軽トラの中から娘に電話していた。',
      html: () => `
<article class="doc paper">
  <header class="form-head"><div class="form-org">通信会社の回答（令状による）</div><h3>通話記録（抜粋）</h3></header>
  <table class="log"><tbody>
    <tr><td>21:08</td><td>発信：風見みゆき（携帯）→ 風見野々香　<b>1分12秒</b></td></tr>
    <tr><td>発信の場所</td><td>湊中央局 第2セクター（範囲は透明シートのとおり）</td></tr></tbody></table>
  <div class="sticky">シートは会社の書式のまま。うちの地図（0-1の下半分）を写したものに重ねられるようにした。</div>
  ${overlay('3-2s', { w: 400, h: 520, base: A.mapInner(), sheet: SECTOR_SHEET, init: { x: 18, y: -24, r: 0, f: 0 }, snap: { x: 0, y: 0, r: 90, f: 0, tol: 22 }, pivot: [120, 330],
    label: '基地局の範囲を示す透明シート', alt: '莉々香の手描き地図（0-1の下半分と同じ。右上に方位：Nが上）。その上に、オレンジの扇形をかいた透明シートが少しずれて重なっている。シートには「＋＝那珂湊駅」の印と、Nの矢印（シートの左を向いている）。',
    okmsg: 'ピタッ。＋が那珂湊駅に、シートのNが地図のNと同じ向きにそろった。',
    cap: '下：0-1の地図／上：基地局シート' })}
  <details class="sr-text"><summary>図を文字で読む</summary><p>シートの扇形は、＋（那珂湊駅）から、シートの右の方向へ広がっている。シートのN（北）の矢印は、シートの左を向いている。地図のNは上。</p></details>
</article>`,
    },
    '3-3': {
      no: '3-3', stage: 3, icon: '📰', kind: '新聞', title: 'テレビ欄（1/15 朝刊）', short: '常陸みなと新報のテレビ欄',
      re: '朝刊は前の日に作られる。夜の大雪の特番は、まだ載っていない。',
      html: () => `
<article class="doc paper newspaper">
  <header class="form-head"><div class="form-org">常陸みなと新報（架空）</div><h3>1月15日（金）朝刊　テレビ欄（夜）</h3></header>
  <table class="tv"><thead><tr><th></th><th>6ch 常陸テレビ</th><th>8ch みなと放送</th></tr></thead><tbody>
    <tr><td>20:00</td><td>歌の祭典</td><td>映画「港の灯」</td></tr>
    <tr><td>21:00</td><td><b>ドラマ『潮騒の駅』最終回</b><br><small>駅のホームで、ふたりが最後に交わすのは――</small></td><td>（映画のつづき）</td></tr>
    <tr><td>21:54</td><td>ニュース・天気</td><td>スポーツ</td></tr></tbody></table>
  <p class="aside">※6chは、ふだん「9時のニュース」がない（ニュースは21:54から）。</p>
</article>`,
    },
    '3-4': {
      no: '3-4', stage: 3, icon: '🧾', kind: '伝票', title: '写真館の受付票', short: '野々香の注文。お渡し日',
      re: '写真のお渡しは20日。「今夜受け取る約束」も、21:12の「今から取りに行きます」も、行く理由を残すための嘘。',
      html: () => `
<article class="doc paper slip">
  <header class="form-head"><div class="form-org">潮見写真館（架空）</div><h3>受付票 No.0112</h3></header>
  <dl class="kv"><dt>お名前</dt><dd>風見野々香 様（風見ほしいも）</dd><dt>ご注文</dt><dd>商品写真（干し芋）20カット</dd><dt>受付</dt><dd>1/10</dd><dt>お渡し</dt><dd><b>1/20（火）午後</b>　仕上がりは前日にご連絡します</dd></dl>
  <p class="pen">※14日 現像中</p>
</article>`,
    },
    '4-1': {
      no: '4-1', stage: 4, icon: '🗒', kind: '調書', title: '大津の供述（1回目）', short: '元助手。「20:55の列車で帰った」',
      re: '大津が本当のことを言っていたのは「途中で待ち合わせた」だけ。嘘をついたのは、前科のせいで疑われるのが怖かったから。',
      html: () => `
<article class="doc paper form">
  <header class="form-head"><div class="form-org">那珂湊中央警察署（架空）</div><h3>供述調書（要旨）</h3><div class="form-meta">1月16日 16:30〜　大津航（34）元助手</div></header>
  <ol class="stmts">
    <li><b>①</b> 20:30から、未払いの給料のことで潮見さんと口論しました。20:50に店を出ました。</li>
    <li><b>②</b> 那珂湊駅から、<b>20:55の列車</b>に乗って帰りました。</li>
    <li><b>③</b> 車内はガラガラ。<b>途中の駅で、反対から来る列車と待ち合わせ</b>て、しばらく止まってました。</li>
    <li><b>④</b> 阿字ヶ浦に着いて、まっすぐ家に帰りました。</li>
  </ol>
  <h4>阿字ヶ浦の近所の人</h4>
  <p>「9時45分すぎかな、駅のほうから大津くんが歩いてきたよ。うつむいて」</p>
</article>`,
    },
    '4-2': {
      no: '4-2', stage: 4, icon: '🚃', kind: '図', title: '湊線の夜のダイヤ図', short: '指でなぞると時刻が出る',
      re: '単線の湊線では、上りと下りは駅でしかすれちがえない。線と線が交わる駅が「待ち合わせ」。',
      html: () => `
<article class="doc paper">
  <header class="form-head"><div class="form-org">作中の資料（実際のダイヤではありません）</div><h3>湊線 1月15日 夜のダイヤ</h3></header>
  <p class="note-box">湊線は単線。上りと下りは、駅でだけすれちがう（待ち合わせ）。斜めの線を指でなぞると、その列車の時刻が出ます。</p>
  <figure class="trace" data-trace="4-2">${diagramSVG()}<p class="trace-out" aria-live="polite">線をなぞってみて</p></figure>
  <details class="sr-text"><summary>ダイヤを文字で読む</summary><ul>${TRAINS.map((t) => `<li>${t.dir}：${t.pts.map(([h, m, s]) => `${ST4[s][0]} ${fmt(h, m)}`).join(' → ')}</li>`).join('')}</ul></details>
</article>`,
    },
    '4-3': {
      no: '4-3', stage: 4, icon: '🎥', kind: '映像', title: '野々香の車のドラレコ', short: '風見家の庭。駐車中の録画2コマ',
      re: '赤いマフラーは、30年前から変わらない野々香のしるし。白い軽トラがない＝母は出かけていた。',
      html: () => `
<article class="doc paper">
  <div class="sticky">お姉ちゃんの青い車は、家の庭に停めると、駐車中も録画する。庭の干し場が映ってる。<br>※家から写真館までは車で約10分（私が走って確かめた）。</div>
  ${A.photo('4-3a', dashcam({ ts: '2027/01/15 20:40:12', truck: true, who: 'mom', alt: '夜の庭。左に家。右に干し芋の干し場（3段）。手前に白い軽トラが停まり、荷台に網。頭に手ぬぐいをかぶり、緑の長靴の人が、荷台に網を積んでいる。' }), 'コマ①　20:40')}
  ${A.photo('4-3b', dashcam({ ts: '2027/01/15 21:03:40', truck: false, who: 'nono', sheet: true, alt: '夜の庭。左に家。右の干し場に、青いシートをかけている人がいる。首に赤いマフラー。手前の駐車場所は空で、タイヤのあとだけが残っている。' }), 'コマ②　21:03')}
</article>`,
    },
    '4-4': {
      no: '4-4', stage: 4, icon: '🔬', kind: '報告書', title: '鑑識の追加報告', short: '傷の形と、肩についていたもの',
      re: '丸い傷と砂粒＝ライトスタンドの砂袋。干し網の繊維と芋の糖は、干し芋を作る人がそこにいたしるし。',
      html: () => `
<article class="doc paper form">
  <header class="form-head"><div class="form-org">鑑識係</div><h3>追加報告</h3></header>
  <dl class="kv">
    <dt>傷</dt><dd>後頭部に、直径約8cmの<b>丸く平たい</b>打撲。傷の中に<b>細かい砂粒</b>。</dd>
    <dt>肩</dt><dd>ナイロンの<b>網の繊維</b>（干し芋の干し網と同じ種類）と、<b>さつまいもの糖</b>の結晶。</dd>
    <dt>凶器</dt><dd>持ち去られた物はない。凶器は<b>スタジオにある物</b>と考えられる。</dd>
  </dl>
  <h4>スタジオの備品（1kg以上）</h4>
  <ul><li>ライトスタンドの重り（布の袋）×2</li><li>壁掛け時計（木の枠）</li><li>フィルムカメラ</li><li>三脚（金属）</li></ul>
</article>`,
    },
    '4-5': {
      no: '4-5', stage: 4, icon: '🗒', kind: '調書', title: '大津の供述（2回目）', short: '本当に見たこと', after: '4A',
      re: '容疑者だと思われていた大津は、決め手の目撃者だった。',
      html: () => `
<article class="doc paper form">
  <header class="form-head"><div class="form-org">那珂湊中央警察署（架空）</div><h3>供述調書（要旨）</h3><div class="form-meta">1月16日 19:20〜　大津航（34）2回目</div></header>
  <ol class="stmts">
    <li><b>①</b> すみません。本当は20:55には乗っていません。前に捕まったことがあるから、疑われると思って。</li>
    <li><b>②</b> 店を出たあと、謝るきっかけがほしくて、向かいの路地の暗がりにいました。21:03に「さっきはすみません」と送りました。</li>
    <li><b>③</b> 少しして、<b>長靴の女の人</b>が店から走って出てきて、湊公園のほうへ行きました。顔は見えません。</li>
    <li><b>④</b> 21:15ごろ、湊公園のわきに<b>白い軽トラ</b>（荷台に網）が停まっていて、女の人がハンドルに突っ伏していました。怖くなって、駅へ行きました。</li>
  </ol>
</article>`,
    },
  });

  Object.assign(C.CHAT, {
    's2.start': [
      { who: 'beat', t: '1月16日（土）9:20。署の廊下。' },
      { t: 'おはよう。……寝てない。お姉ちゃんの供述調書、こっそり見せてもらえた。', doc: '2-1' },
      { t: '検視のくわしい図も届いた。透明なシートになってて、鑑識さんの真上の写真に重ねられる。', doc: '2-2' },
      { t: 'あと、向かいの菅谷さんが、ゆうべ窓から見たところを絵にしてくれた。元・美術の先生なんだって。', doc: '2-3' },
      { t: 'お姉ちゃんの話に、変なところがないか。……ないって、証明したい。' },
    ],
    's2.2A': [
      { t: '傷は後頭部。仰向けだったから、床の側。……見えるわけない。さわってもいないのに。' },
      { t: 'なのにお姉ちゃんは、110番で「殴られたみたい」って言った。' },
    ],
    's2.2B': [
      { t: 'スマホ、最初から持ってた。じゃあ、何のために車に戻ったの？' },
      { t: 'わきに抱えてた、平たい物……。' },
    ],
    's2.2M': [
      { t: 'お姉ちゃんは、写真館に着く前から、潮見さんが殴られたことを知ってた。' },
      { t: '「母は関係ないです」。誰も聞いてないのに。……お母さんを、かばってる。' },
      { who: 'beat', t: '11:05。取調室の前。' },
      { t: 'お姉ちゃんとすれちがった。「莉々香、ちゃんとご飯食べてる？」だって。こんなときに。' },
      { t: '森山さんが、お母さんの通話記録を取り寄せてる。私には見せてくれない。……でも、コピーは取れた。' },
    ],
    's3.start': [
      { who: 'beat', t: '1月16日（土）13:40。署の資料室。' },
      { t: 'お母さんの供述。「ずっと家で、お姉ちゃんとテレビ」。', doc: '3-1' },
      { t: '通話記録。21:08に、お母さんからお姉ちゃんへ電話。かけた場所の範囲は透明シートでもらえた。うちの地図に重ねてみて。', doc: '3-2' },
      { t: 'その日の朝刊のテレビ欄と、写真館の受付票も。', doc: '3-3' },
    ],
    's3.3A': [
      { t: '写真館と、湊公園のあたり……。潮見さんが襲われた、4分後に。' },
      { t: 'お母さん、家にいなかったの？' },
    ],
    's3.3B': [
      { t: '6チャンネルは、9時から大雪のニュースになってた。ドラマなんて、流れてない。' },
      { t: 'お母さんは、見てもいないドラマの話をした。泣いた、なんて言って。' },
    ],
    's3.3M': [
      { t: 'お母さんが電話で、潮見さんが倒れてることを伝えた。だからお姉ちゃんは「殴られた」って知ってた。' },
      { t: 'そしてお姉ちゃんは、行く理由を残すために、あのメッセージを送った。あとで警察が見るって分かってて。' },
      { who: 'beat', t: '16:20。' },
      { t: '森山さんが、大津さんを呼んだ。元助手で、前に傷害で捕まったことがある人。みんな、大津さんが犯人だと思ってる。' },
      { t: 'でも……大津さんの話にも、嘘がある気がする。' },
    ],
    's4.start': [
      { who: 'beat', t: '1月16日（土）17:30。' },
      { t: '大津さんの1回目の供述。「20:55の列車で帰った」って。', doc: '4-1' },
      { t: '湊線のダイヤ図。線を指でなぞると、その列車の時刻が出る。', doc: '4-2' },
      { t: 'お姉ちゃんの車のドラレコと、鑑識の追加報告も来た。', doc: '4-3' },
    ],
    's4.4A': [
      { t: '21:32の列車……。大津さん、9時半まで写真館の近くにいたんだ。' },
      { t: '問い詰めたら、全部話してくれた。2回目の供述を送る。', doc: '4-5' },
      { t: '大津さんは、犯人じゃなかった。……見ていた人だった。' },
    ],
    's4.4B': [
      { t: '21:03、庭にいたのはお姉ちゃん。うちから写真館まで車で10分。21:04に殴れるわけない。' },
      { t: 'そして、白い軽トラがない。あれは、お母さんの車。' },
    ],
    's4.4M': [
      { t: '…………。' },
      { t: 'お母さんのアリバイは、お母さん自身を守るためのものだった。お姉ちゃんは、お母さんを守るために、第一発見者のふりをした。' },
      { who: 'beat', t: '21:10。署の駐車場。莉々香は、しばらく車から降りられなかった。' },
      { t: 'お姉ちゃんの車の中のカメラに、お母さんのお店の茶封筒が映ってた。中に10万円。' },
      { t: 'お母さん、潮見さんにお金を払ってたの？ 何のために？' },
      { t: '森山さんが、お母さんを呼んだ。……私は、まだ外されたまま。' },
    ],
  });

  C.STAGES.push(
    {
      id: 2, label: 'S2 第一発見者', objective: '野々香の供述の嘘を見つける', docs: ['2-1', '2-2', '2-3'], mins: 18,
      puzzles: [
        { id: '2A', kind: 'small', step: '①', name: '見えない傷',
          q: '潮見さんの傷はどこ？ その傷を、着いたばかりの野々香さんは見られた？ それを踏まえて、おかしい言葉は？',
          fields: [
            { k: 'wound', type: 'chip', label: '［1］傷の場所', opts: [['face', '顔（額）'], ['back', '後頭部'], ['chest', '胸'], ['wrist', '右の手首']] },
            { k: 'line', type: 'chip', label: '［2］おかしい言葉', opts: [['hit', '110番「誰かに殴られたみたいで」'], ['touch', '③「体にはさわっていません」'], ['left', '①「9時20分ごろ家を出ました」'], ['mom', '⑤「母はずっと家にいました」']] }],
          fact: '傷は後頭部（仰向けなので床の側）。見えない傷を「殴られた」と言った',
          hint: [
            '透明シートを写真④に重ねてみよう。形は重なるのに、どこか合わないところがない？ シートの字も読めるかな。',
            'シートは裏返しで届いている（字が左右反対、腕時計の印も反対の手）。「⇋ 裏返す」で直すと、×は後頭部。仰向けなら、後頭部は床に接している。1-1「外傷は見えない」、③「さわっていない」と合わせよう。'],
          miss: [
            { eq: { wound: 'face' }, msg: 'シートの×は顔の位置に見えるね。……でもそのシート、表向き？ 字や腕時計の位置を見て。' },
            { okf: ['wound'], eq: { line: 'touch' }, msg: 'さわっていないのは、たぶん本当。だからこそ、知るはずのないことを言っている。' },
            { okf: ['wound'], msg: '傷は合ってる。その傷が見えないなら、どの言葉がおかしい？' },
            { okf: ['line'], msg: '言葉は合ってる。傷の場所をシートで確かめて。' }],
          fb: 'シートを重ねて、向きまでそろえてみて。' },
        { id: '2B', kind: 'small', step: '②', name: '窓からのスケッチ',
          q: '菅谷さんのスケッチと合わない供述はどれ？ スケッチのどこが証拠？',
          fields: [
            { k: 'st', type: 'chip', label: '［1］合わない供述', opts: [['s1', '①'], ['s2', '②'], ['s3', '③'], ['s4', '④'], ['s5', '⑤']] },
            { k: 'ev', type: 'chip', label: '［2］スケッチの証拠', opts: [['glow', '手もとの四角い光'], ['flat', 'わきの平たい物'], ['scarf', '赤いマフラー'], ['car', '車']] }],
          fact: '野々香は車へ戻るとき、もうスマホを持っていた（④は嘘）',
          hint: [
            'スケッチは21:39ごろ。1-5の菅谷さんの話では、このあと野々香さんは店に戻って、21:41に110番している。供述④を読もう。',
            '手もとの「四角く青白い光」は何？ 夜道で、顔の下まで明るくなる四角い物。……それを持っているなら、④の「取りに戻った」はおかしい。'],
          miss: [
            { eq: { ev: 'flat' }, msg: 'あやしいね。でも「平たい物」と、はっきり食い違う供述はある？ 先に、もっとはっきりした食い違いを。' },
            { okf: ['ev'], msg: '証拠は合ってる。その光と食い違う供述は？' },
            { okf: ['st'], msg: '供述は合ってる。スケッチのどこが、それを崩す？' }],
          fb: 'スケッチの手もとを拡大してみて。' },
        { id: '2M', kind: 'mid', step: '★', name: 'つきつけ',
          q: '野々香さんが事件を知ったのは［　］。かばっている相手は［　］。車に戻った本当の理由は［　］。',
          fields: [
            { k: 'when', type: 'chip', label: '［1］事件を知ったのは', opts: [['before', '写真館に着く前'], ['inside', '中に入って倒れているのを見て'], ['call', '110番をしながら']] },
            { k: 'who', type: 'chip', label: '［2］かばっている相手', opts: [['mom', '母'], ['otsu', '大津'], ['riri', '莉々香'], ['self', '自分']] },
            { k: 'why', type: 'chip', label: '［3］車に戻った理由', opts: [['phone', 'スマホを取りに'], ['hide', '何かを車に隠すため'], ['call', '外で110番するため'], ['light', '懐中電灯を取りに']] }],
          fact: '野々香は着く前に事件を知っていて、母をかばっている',
          hint: [
            '①②の答えを並べよう。見えない傷を知っていた。スマホは持っていたのに車へ戻った。110番の2つ目の言葉（1-5）も読み直して。',
            '着いてから見ても分からないことを知っていた＝着く前に知っていた。聞かれてもいないのに「母は関係ないです」。わきに抱えていた平たい物は？'],
          miss: [
            { eq: { when: 'inside' }, msg: '中で見ても、傷は見えなかったはず。' },
            { eq: { why: 'phone' }, msg: 'スマホは、もう持っていた（②）。' },
            { eq: { who: 'riri' }, msg: '妹をかばう理由は、いまの資料にはまだない。110番の2つ目の言葉は？' },
            { eq: { who: 'otsu' }, msg: '野々香さんは大津さんのことを一言も言っていない。110番で、聞かれる前に口にした人は？' }],
          fb: '①②と、1-5の110番を並べてみて。' },
      ],
    },
    {
      id: 3, label: 'S3 母のアリバイ', objective: '「ずっと家にいた」母の話を確かめる', docs: ['3-1', '3-2', '3-3', '3-4'], mins: 20,
      puzzles: [
        { id: '3A', kind: 'small', step: '①', name: '電話はどこから',
          q: '21:08の電話は、どこからかけられた？ それは、潮見さんが襲われてから何分後？',
          fields: [
            { k: 'place', type: 'chip', label: '［1］かけた場所', opts: [['home', '平磯の家のあたり'], ['tono', '殿山のあたり'], ['studio', '写真館と湊公園のあたり'], ['nakane', '中根のあたり']] },
            { k: 'after', type: 'num', label: '［2］襲われてから', ph: '例：10', suffix: '分後' }],
          fact: '21:08の電話は、写真館と湊公園のあたりから（襲われた4分後）',
          hint: [
            'シートの＋（那珂湊駅）を、地図の那珂湊駅に重ねよう。それだけで終わり？ シートの「N」と、地図の「N」を見比べて。',
            'シートのNは左、地図のNは上。シートを「↻」で回して、Nを地図と同じ向きにそろえる。扇形が地図のどこにかかるか。時刻はS1の21:04と比べよう。'],
          miss: [
            { eq: { place: 'home' }, msg: '扇形が家にかかって見える？ ……そのシート、地図と同じ向き？ 「N」の矢印を見比べて。' },
            { eq: { place: ['tono', 'nakane'] }, msg: 'シートの＋を那珂湊駅に、Nを地図のNにそろえた？' },
            { okf: ['place'], msg: '場所は合ってる。襲われた時刻（S1）と比べて。' },
            { okf: ['after'], msg: '時間は合ってる。シートの向きを確かめて。' }],
          fb: 'シートの＋と N を、地図にそろえてみて。' },
        { id: '3B', kind: 'small', step: '②', name: '見ていないドラマ',
          q: '1月15日の夜9時、6チャンネルで本当に流れていたのは？ それが分かる証言は？',
          fields: [
            { k: 'aired', type: 'chip', label: '［1］本当に流れていたもの', opts: [['drama', 'ドラマ『潮騒の駅』最終回'], ['snow', '大雪のニュース'], ['song', '歌の祭典'], ['movie', '映画「港の灯」']] },
            { k: 'by', type: 'chip', label: '［2］それが分かる証言', opts: [['suga', '菅谷さん（1-5）'], ['nono', '野々香さん（2-1）'], ['otsu', '大津さん'], ['patrol', '巡査（1-1）']] }],
          fact: '6chは9時から大雪のニュース。ドラマは流れていない（菅谷さんの証言）',
          hint: [
            'テレビ欄は朝刊。その日の朝に刷られたもの。1-5で、9時に6チャンネルを見ていた人がいる。',
            '菅谷さんは「6チャンネルの9時のニュース」の最初の話題（大雪の中継）を見ていた。でもテレビ欄の6chに、9時のニュースはない。つまり、ドラマの時間が大雪のニュースに変わっていた。'],
          miss: [
            { eq: { aired: 'drama' }, msg: 'テレビ欄にはそう書いてある。でもテレビ欄は朝刊、その夜に何か起きていたら？ 1-5を見て。' },
            { okf: ['aired'], msg: '流れていたものは合ってる。そう言える人は？' },
            { okf: ['by'], msg: 'その人が見ていたものは、何だった？' }],
          fb: 'テレビ欄と、1-5の菅谷さんの話を並べてみて。' },
        { id: '3M', kind: 'mid', step: '★', name: '母の電話',
          q: '21:08、母は野々香さんに［　］と伝えた。21:12の「今から写真取りに行きます」は［　］ためのもの。母のドラマの話は［　］をなぞったもの。',
          fields: [
            { k: 'told', type: 'chip', label: '［1］母が電話で伝えたこと', opts: [['down', '潮見さんが殴られて倒れている'], ['late', '帰りが遅くなる'], ['drama', 'ドラマが終わった'], ['otsu', '大津が店に来ている']] },
            { k: 'msg', type: 'chip', label: '［2］21:12のメッセージは', opts: [['shiomi', '潮見さんに知らせる'], ['police', 'あとで警察に「行く理由」を見せる'], ['mom', '母に合図する'], ['otsu', '大津に返事をする']] },
            { k: 'src', type: 'chip', label: '［3］ドラマの話のもと', opts: [['blurb', 'テレビ欄の紹介文'], ['rec', '録画'], ['nono', '野々香の話'], ['prev', '前の週の放送']] }],
          fact: '母は写真館のそばから「潮見さんが倒れている」と電話した。21:12のメッセージは警察に見せるため',
          hint: [
            '野々香さんは着く前に知っていた（S2）。その前にかかってきたのは21:08の母の電話だけ。受付票（3-4）で、写真のお渡し日も見て。',
            '写真は20日渡しで、まだ現像中。「今から取りに行きます」は、潮見さんに読んでもらうためではない（もう倒れていると知っていた）。ドラマは放送されていないのに、母は「駅のホームで2人が手を振る」と言った。テレビ欄の小さい字と比べて。'],
          miss: [
            { eq: { msg: 'shiomi' }, msg: '野々香さんは、もう潮見さんが倒れていると知っていた。誰に読ませるため？' },
            { eq: { src: 'rec' }, msg: 'ドラマは放送されていない。録画はできない。' },
            { eq: { told: 'drama' }, msg: 'ドラマは流れていなかった。' }],
          fb: 'S2で分かったことと、3-3・3-4を並べてみて。' },
      ],
    },
    {
      id: 4, label: 'S4 夜の再構成', objective: '21:04、写真館にいたのは誰か', docs: ['4-1', '4-2', '4-3', '4-4', '4-5'], mins: 22,
      puzzles: [
        { id: '4A', kind: 'small', step: '①', name: '待ち合わせ',
          q: '大津さんが本当に乗ったのは、那珂湊を何時に出る列車？ 待ち合わせたのはどの駅？',
          fields: [
            { k: 'dep', type: 'time', label: '［1］那珂湊を出た時刻', ph: '例：21:00', half: true },
            { k: 'stn', type: 'text', canon: 'station', label: '［2］待ち合わせた駅', ph: '駅名', half: true }],
          fact: '大津は21:32の列車に乗った（平磯で待ち合わせ）。21:04には写真館の近くにいた',
          hint: [
            '大津さんの話で、嘘をつく理由がない細かいところはどこ？ 「途中の駅で、反対から来る列車と待ち合わせた」。',
            '単線では、上りと下りの線が交わる駅が待ち合わせ。20:55の線をなぞって、交わる線があるか見よう。交わる下りの列車はどれ？ 近所の人の「9時45分すぎ」とも合う？'],
          miss: [
            { eq: { dep: '1255' }, msg: '20:55の線をなぞってみて。反対から来る列車と、どこかで交わってる？' },
            { okf: ['dep'], msg: '列車は合ってる。線が交わる駅は？' },
            { okf: ['stn'], msg: '駅は合ってる。その駅で待ち合わせた下りの列車は、那珂湊を何時に出た？' }],
          fb: 'ダイヤの線をなぞって、交わるところを探して。' },
        { id: '4B', kind: 'small', step: '②', name: '21:03の庭',
          q: 'ドラレコの21:03、庭にいたのは誰？ 20:40にあって、21:03にないものは？',
          fields: [
            { k: 'who', type: 'chip', label: '［1］21:03に庭にいた人', opts: [['nono', '野々香'], ['mom', 'みゆき'], ['otsu', '大津'], ['riri', '莉々香']] },
            { k: 'gone', type: 'chip', label: '［2］なくなっているもの', opts: [['truck', '白い軽トラ'], ['rack', '干し場'], ['house', '家の明かり'], ['bluecar', '青い車']] }],
          fact: '21:03、野々香は家の庭にいた。母の白い軽トラは出かけていた',
          hint: [
            '顔は見えない。でも、この人のしるしは前にも見た。1-2③の展示パネル、2-3のスケッチ。',
            '赤いマフラーは野々香さん（S1で莉々香が「今でも冬は赤いマフラー」と言った）。2コマを見比べると、手前の駐車場所が空。青い車は、このカメラがついている車。'],
          miss: [
            { eq: { who: 'mom' }, msg: '長靴の人は20:40のコマ。21:03のコマの人の首もとを見て。' },
            { eq: { gone: 'bluecar' }, msg: '青い車は、このドラレコがついている車そのもの。' },
            { okf: ['who'], msg: '人は合ってる。2コマを見比べて、消えたものは？' },
            { okf: ['gone'], msg: 'なくなったものは合ってる。21:03の人は、誰のしるしをつけている？' }],
          fb: '2つのコマを見比べてみて。' },
        { id: '4M', kind: 'mid', step: '★', name: '夜の再構成',
          q: '21:04、潮見さんを［　］で殴ったのは［　］。それを見ていたのは［　］。',
          fields: [
            { k: 'weapon', type: 'chip', label: '［1］凶器', opts: [['sand', 'ライトスタンドの重り（砂袋）'], ['clock', '壁掛け時計'], ['camera', 'フィルムカメラ'], ['tripod', '三脚']] },
            { k: 'who', type: 'chip', label: '［2］殴った人', opts: [['mom', '風見みゆき'], ['nono', '風見野々香'], ['otsu', '大津航'], ['maki', '潮見真紀']] },
            { k: 'saw', type: 'chip', label: '［3］見ていた人', opts: [['otsu', '大津航'], ['suga', '菅谷典子'], ['nono', '風見野々香'], ['mori', '森山浩行']] }],
          fact: '21:04、母みゆきが砂袋の重りで殴った。大津が見ていた',
          hint: [
            '凶器は4-4の傷の形（丸く平たい・砂粒）。S1の写真①に、外れて転がっていた物がある。殴った人は、肩の繊維と、4-5の「長靴」「白い軽トラ」。',
            '野々香さんは21:03に家（車で10分）。大津さんは路地から「長靴の女の人」を見ていた。長靴と白い軽トラと干し網は、20:40のコマの人。'],
          miss: [
            { eq: { who: 'nono' }, msg: '21:03に家の庭にいた人が、21:04に10分先の写真館で殴れる？' },
            { eq: { who: 'otsu' }, msg: '大津さんは、店から走って出てくる「長靴の女の人」を見ていた。' },
            { eq: { weapon: ['clock', 'tripod', 'camera'] }, msg: '傷は丸く平たく、中に砂粒があった。' },
            { eq: { saw: 'suga' }, msg: '菅谷さんが聞いたのは「ドン」という音だけ。' }],
          fb: '4-4・4-5と、S1の写真①を並べてみて。' },
      ],
    },
  );
})();
