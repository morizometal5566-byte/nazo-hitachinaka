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
  // 検視の人体図（背中側から見た図）。字は入れない：背骨の線・つむじ・顔なし、腕時計の印は左右反対
  const BODY_SHEET = `
    <rect x="0" y="0" width="400" height="480" fill="#bfe3ff" fill-opacity=".28" stroke="#4f8fc0" stroke-width="2" stroke-dasharray="3 3"/>
    <circle cx="200" cy="88" r="32" fill="#4f8fc0" fill-opacity=".18" stroke="#1e5f8f" stroke-width="2.5"/>
    <path d="M196 70 q8 -4 10 4 q2 8 -8 8 q-8 -2 -4 -10" fill="none" stroke="#1e5f8f" stroke-width="1.5"/>
    <path d="${BODY}" fill="#4f8fc0" fill-opacity=".12" stroke="#1e5f8f" stroke-width="2.5"/>
    <path d="M200 132 V300" stroke="#1e5f8f" stroke-width="1.5" stroke-dasharray="5 4"/>
    <path d="M172 160 q-8 22 4 34 M228 160 q8 22 -4 34" fill="none" stroke="#1e5f8f" stroke-width="1.5"/>
    <path d="M186 74 L214 102 M214 74 L186 102" stroke="#c62828" stroke-width="5" stroke-linecap="round"/>
    <rect x="116" y="262" width="18" height="11" rx="2" fill="none" stroke="#1e5f8f" stroke-width="2"/>
    <text x="16" y="470" font-size="13" fill="#1e5f8f">検視 図2</text>`;

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
  <path d="M287 180 Q302 194 318 180 L322 200 Q302 210 284 198 Z" fill="#d32f2f" opacity=".85"/><text x="326" y="196" class="cbl">赤</text>
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
  // 3つの扇形（120°ずつ）。番号は書かない。1本の線のはしに「0°」。決まりはシートの下の字だけ
  const ray = (deg, r) => { const a = (deg - 90) * Math.PI / 180; return [120 + r * Math.cos(a), 330 + r * Math.sin(a)]; };
  const SECTOR_SHEET = (() => {
    const R = 230;
    const rays = [0, 120, 240].map((d) => { const [x, y] = ray(d, R); return `<line x1="120" y1="330" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="#e65100" stroke-width="2.5"/>`; }).join('');
    const [zx, zy] = ray(0, 78);
    return `
    <rect x="-140" y="40" width="520" height="560" fill="#ffe9b0" fill-opacity=".12" stroke="#c77700" stroke-width="2" stroke-dasharray="3 3"/>
    <circle cx="120" cy="330" r="${R}" fill="#ff9800" fill-opacity=".10" stroke="#e65100" stroke-width="2" stroke-dasharray="8 5"/>
    ${rays}
    <text x="${zx + 6}" y="${zy}" font-size="16" font-weight="700" fill="#bf360c" stroke="#fff" stroke-width="3" paint-order="stroke">0°</text>
    <g stroke="#e65100" stroke-width="2"><line x1="104" y1="330" x2="136" y2="330"/><line x1="120" y1="314" x2="120" y2="346"/></g>
    <circle cx="120" cy="330" r="5" fill="#e65100"/>
    <text x="128" y="350" font-size="13" fill="#bf360c" font-weight="700">＋＝湊中央局</text>`;
  })();

  /* ---------- S4：ダイヤ図（なぞる） ---------- */
  const ST4 = [['那珂湊', 40], ['殿山', 80], ['平磯', 120], ['美乃浜学園', 160], ['磯崎', 200], ['阿字ヶ浦', 240]];
  const tx = (h, m) => 92 + ((h * 60 + m) - (20 * 60 + 50)) * 4.6; // 20:50〜21:50
  // 実際の湊線と同じく全線単線で、すれちがえるのは那珂湊・阿字ヶ浦（と金上）だけ。ダイヤそのものは作中の架空
  const TRAINS = [
    { id: 'd1', dir: '下り', pts: [[20, 55, 0], [20, 57, 1], [20, 59, 2], [21, 2, 3], [21, 4, 4], [21, 7, 5]] },
    { id: 'u2', dir: '上り', pts: [[21, 19, 5], [21, 22, 4], [21, 24, 3], [21, 27, 2], [21, 29, 1], [21, 31, 0]] },
    { id: 'd2', dir: '下り', pts: [[21, 26, 0], [21, 32, 0], [21, 34, 1], [21, 36, 2], [21, 39, 3], [21, 42, 4], [21, 45, 5]] },
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
      : `<g><circle cx="330" cy="210" r="12" fill="#d7ccc8"/><path d="M320 200 q10 -10 20 0" fill="#3e2723"/><path d="M318 222 h26 v8 h-26z" fill="#e53935"/><rect x="336" y="228" width="7" height="22" fill="#e53935"/><text x="350" y="222" class="cbl">赤</text><rect x="320" y="230" width="22" height="38" rx="5" fill="#455a64"/><rect x="321" y="266" width="9" height="20" fill="#263238"/><rect x="333" y="266" width="9" height="20" fill="#263238"/><path d="M342 240 l26 -14" stroke="#455a64" stroke-width="6"/></g>`;
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
      re: '背骨の線とつむじ、顔のない図＝背中側から見た図。裏返さないと重ならない。傷は後頭部＝床の側。見えない傷を「殴られた」と言えたのは、21:08に写真館の電話から母に聞いていたから。',
      html: () => `
<article class="doc paper">
  <div class="sticky">検視の人体図は、透明シート。鑑識さんの「写真④ ご遺体の位置（真上から）」に重ねて使うんだって。×が傷の場所。<br>検視の先生：「打たれてすぐに気を失ったはず。そこから動いた跡はない」。写真館の電話は、入口のカウンター（スタジオの奥から十数歩）。</div>
  ${overlay('2-2s', { w: 400, h: 480, base: FLOOR_TOP, sheet: BODY_SHEET, init: { x: 48, y: 36, r: 0, f: 0 }, snap: { x: 0, y: 0, r: 0, f: 1, tol: 26 }, pivot: [200, 240],
    label: '検視の人体図の透明シート', alt: '鑑識の写真④。床を真上から撮ったもの。白い点線で、仰向けのご遺体の輪郭（頭が上）。輪郭の右手首に腕時計。その上に、青い線の透明シート（人の形、頭のまん中に赤い×）が少しずれて重なっている。',
    okmsg: 'ピタッ。輪郭も腕時計も重なった。',
    cap: '写真④ ご遺体の位置（22:36、真上から）。下：鑑識写真／上：検視の透明シート' })}
  <div class="sr-only sr-text"><p>写真④：仰向けのご遺体。頭が写真の上。腕時計は、写真の右側の手首。透明シート：人の形の線画。顔は描かれていない。頭に、渦のような小さな印（つむじ）。体のまん中に、首から腰まで縦の点線。肩のあたりに左右対称の弧が2つ。頭のまん中に赤い×。腕時計の印は、シートの左側の手首にある。シートのすみに「検視 図2」。</p></div>
</article>`,
    },
    '2-3': {
      no: '2-3', stage: 2, icon: '✏', kind: 'スケッチ', title: '菅谷さんのスケッチ', short: '21:39、窓から見た野々香',
      re: '手もとの青白い光はスマホ（④「車に忘れた」は嘘）。わきの平たい物は、母の店の茶封筒（S4）。赤いマフラーは、S4のドラレコでも決め手になった。',
      html: () => `
<article class="doc paper">
  <div class="sticky">菅谷さんは元・美術の先生。「見たまま描いたわよ」って。</div>
  ${A.photo('2-3a', SKETCH_SVG, '「手もとが、四角く青白く光ってたの。わきには、何か平たい物」――菅谷')}
</article>`,
    },
    '2-4': {
      no: '2-4', stage: 2, icon: '☎', kind: '記録', title: '野々香のスマホの履歴', short: '1/15 夜の電話（任意提出）',
      re: '21:08の「潮見写真館」からの電話は、潮見本人ではない（21:04から気を失っていた）。写真館にいた母が、店の電話でかけてきた。21:13は、逃げた先の湊公園から母の携帯で。',
      html: () => `
<article class="doc paper form">
  <header class="form-head"><div class="form-org">那珂湊中央警察署（架空）</div><h3>通話履歴（任意提出・抜粋）</h3><div class="form-meta">風見野々香のスマホ　2027年1月15日</div></header>
  <table class="log"><thead><tr><th>時刻</th><th>相手</th><th>種類</th><th>時間</th></tr></thead><tbody>
    <tr><td>20:31</td><td>莉々香</td><td>発信</td><td>3分05秒</td></tr>
    <tr><td>20:48</td><td>潮見写真館</td><td>着信（出ず）</td><td>0秒</td></tr>
    <tr><td>21:06</td><td>みなと珈琲（固定）</td><td>着信（出ず）</td><td>0秒</td></tr>
    <tr><td>21:08</td><td>潮見写真館（固定）</td><td>着信</td><td>0分48秒</td></tr>
    <tr><td>21:13</td><td>お母さん（携帯）</td><td>着信</td><td>2分05秒</td></tr>
    <tr><td>21:16</td><td>菅谷さん（携帯）</td><td>着信</td><td>0分40秒</td></tr>
    <tr><td>21:41</td><td>110</td><td>発信</td><td>2分30秒</td></tr>
    <tr><td>21:47</td><td>莉々香</td><td>着信（出ず）</td><td>0秒</td></tr></tbody></table>
  <p class="aside">※メッセージの送信（21:12 潮見さんあて）は1-5。</p>
</article>`,
    },
    '3-1': {
      no: '3-1', stage: 3, icon: '🗒', kind: '調書', title: 'みゆきの供述', short: '母の話。「ずっと家でテレビ」',
      re: '②は本当（テレビ欄はドラマでも、実際はニュース）。でも③の「漁港の船」は、テレビには映っていない＝ラジオで聞いた話。⑤はS2の履歴（21:13のお母さん）で崩れる。',
      html: () => `
<article class="doc paper form">
  <header class="form-head"><div class="form-org">那珂湊中央警察署（架空）</div><h3>供述調書（要旨）</h3><div class="form-meta">1月15日 23:10〜　風見みゆき（58）</div></header>
  <ol class="stmts">
    <li><b>①</b> 夜はずっと、家から一歩も出ていません。</li>
    <li><b>②</b> 9時の<b>6チャンネル</b>は、ドラマじゃなくて、大雪の臨時ニュースになりました。</li>
    <li><b>③</b> テレビの画面いっぱいに、雪の那珂湊漁港。船がみんな真っ白になっていて。</li>
    <li><b>④</b> 9時20分ごろ、野々香が写真を取りに出かけました。</li>
    <li><b>⑤</b> その晩、野々香に電話なんてしていません。ずっと一緒にいたんですから。</li>
  </ol>
</article>`,
    },
    '3-2': {
      no: '3-2', stage: 3, icon: '📶', kind: '記録', title: '通話記録と基地局シート', short: '21:13の電話。どこからかけた？',
      re: 'シートの「0°」を地図の真北にそろえ、時計回りに数えると、第2セクターは南：写真館と湊公園。家は第1セクター。みゆきは21:13、湊公園の軽トラの中から娘に電話していた。',
      html: () => `
<article class="doc paper">
  <header class="form-head"><div class="form-org">通信会社の回答（令状による）</div><h3>通話記録（抜粋）</h3></header>
  <table class="log"><tbody>
    <tr><td>21:13</td><td>発信：風見みゆき（携帯）　（通話の相手は、この回答の範囲外）</td></tr>
    <tr><td>発信の場所</td><td>湊中央局 <b>第2セクター</b></td></tr>
    <tr><td>セクターの決まり</td><td>局のアンテナから見て、<b>真北を0°とし、時計回りに120°ずつ</b>、第1・第2・第3セクター。</td></tr>
    <tr><td>局の場所</td><td>那珂湊駅の駅舎の屋上</td></tr></tbody></table>
  <div class="sticky">範囲のシートは会社の書式のまま（番号は書いてない）。うちの地図（0-1の下半分）を写したものに重ねられるようにした。</div>
  ${overlay('3-2s', { w: 400, h: 520, base: A.mapInner(), sheet: SECTOR_SHEET, init: { x: 18, y: -24, r: 270, f: 0 }, snap: { x: 0, y: 0, r: 0, f: 0, tol: 22 }, pivot: [120, 330],
    label: '基地局の範囲を示す透明シート', alt: '莉々香の手描き地図（0-1の下半分と同じ。右上に方位：Nが上）。その上に透明シートが少しずれて重なっている。シートには「＋＝湊中央局」の印と、＋から3本の線（120°ずつ）で3つに分けた円。1本の線のはしに「0°」。番号は書いていない。',
    okmsg: 'ピタッ。＋が那珂湊駅に、「0°」の線がまっすぐ上にそろった。',
    cap: '下：0-1の地図／上：基地局シート' })}
  <div class="sr-only sr-text"><p>シートは、＋（局）から3本の線で円を3つに分けたもの。最初の向きでは「0°」の線がシートの左（地図の西）を向いている。地図のNは上。＋を那珂湊駅に置いたとき、地図の上で、＋から見た向き（真北から時計回り）はおよそ：写真館（★）210°、湊公園 150°、殿山 110°、うち（平磯）95°、中根 345°、高田の鉄橋 345°、磯崎 45°。</p></div>
</article>`,
    },
    '3-3': {
      no: '3-3', stage: 3, icon: '📰', kind: '新聞', title: 'テレビ欄（1/15 朝刊）', short: '常陸みなと新報のテレビ欄',
      re: '朝刊は前の日に作られる。夜の大雪の臨時ニュースは、まだ載っていない。だから母の②は本当。母はニュースを知っていた――でも、見てはいなかった。',
      html: () => `
<article class="doc paper newspaper">
  <header class="form-head"><div class="form-org">常陸みなと新報（架空）</div><h3>1月15日（金）朝刊　テレビ欄（夜）</h3></header>
  <table class="tv"><thead><tr><th></th><th>6ch 常陸テレビ</th><th>8ch みなと放送</th></tr></thead><tbody>
    <tr><td>20:00</td><td>歌の祭典</td><td>映画「港の灯」</td></tr>
    <tr><td>21:00</td><td><b>ドラマ『潮騒の駅』最終回</b><br><small>駅のホームで、ふたりが最後に交わすのは――</small></td><td>（映画のつづき）</td></tr>
    <tr><td>21:54</td><td>ニュース・天気</td><td>スポーツ</td></tr></tbody></table>
  
</article>`,
    },
    '3-4': {
      no: '3-4', stage: 3, icon: '📺', kind: '映像', title: '6chの臨時ニュース（映像）', short: '21:00〜21:06の放送そのもの',
      re: '6分間、画面に映っていたのは雪の踏切と止まった列車だけ。海も船も映っていない。',
      html: () => `
<article class="doc paper">
  <div class="sticky">放送局にお願いして、1月15日21:00〜21:06の放送を、そのままもらえた。局の人いわく「この6分間、画面はずっとこの中継1カットだけ。スタジオも他の映像も出していない」。<b>動画は何度でも見られて、止めてコマ送りもできる。</b></div>
  ${window.VID.html('clue_news', { frame: 'tv', telop: '臨時ニュース　大雪', cap: '6ch 常陸テレビ　1/15 21:00〜21:06（中継）', desc: '雪の降る夜の踏切。赤い警報灯が左右交互に点滅し、遮断機が下りている。踏切の手前に、1両だけの小さな列車がライトをつけて止まっている（雪で立ち往生）。海・港・船は、6分間いちども映らない。' })}
</article>`,
    },
    '3-5': {
      no: '3-5', stage: 3, icon: '📻', kind: '記録', title: '湊FMの放送記録', short: '同じ夜のラジオ（台本の抜粋）',
      re: '「漁港の船が真っ白」はラジオだけの言葉。21:20の交通情報は、S4で大津の列車の時刻を変えた。',
      html: () => `
<article class="doc paper form">
  <header class="form-head"><div class="form-org">湊FM（架空のコミュニティラジオ）</div><h3>放送記録（台本の抜粋）　1月15日（金）夜</h3></header>
  <table class="log"><tbody>
    <tr><td>21:00</td><td>ニュース「大雪です。<b>那珂湊漁港では、停泊中の漁船が雪で真っ白に</b>なっています。車の運転は控えて……」</td></tr>
    <tr><td>21:20</td><td>交通情報「湊線は、<b>阿字ヶ浦21時19分発の上り列車が、雪のため10分遅れて</b>運転しています。ほかの列車は、ほぼ時刻表どおりです」</td></tr>
    <tr><td>21:30</td><td>ニュース（21:00と同じ内容のくりかえし）</td></tr></tbody></table>
  <p class="aside">※湊FMはテレビとは別の番組。家のラジオでも、車のラジオでも聞ける。</p>
</article>`,
    },
    '2-5': {
      no: '2-5', stage: 2, icon: '🧾', kind: '伝票', title: '写真館の受付票', short: '野々香の注文。お渡し日',
      re: '写真のお渡しは20日。「今夜受け取る約束」も、21:12の「今から取りに行きます」も、行く理由を残すための嘘（S2）。',
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
    <li><b>③</b> 車内はガラガラ。乗ってから、<b>那珂湊駅で反対から来る列車が着くのを待って</b>、しばらく止まってました。</li>
    <li><b>④</b> 阿字ヶ浦に着いて、まっすぐ家に帰りました。</li>
  </ol>
  <h4>阿字ヶ浦の近所の人</h4>
  <p>「10時ちょっと前かな、駅のほうから大津くんが歩いてきたよ。うつむいて」</p>
</article>`,
    },
    '4-2': {
      no: '4-2', stage: 4, icon: '🚃', kind: '図', title: '湊線の夜のダイヤ図', short: '指でなぞると時刻が出る',
      re: '湊線は実際に全線単線で、すれちがえる駅は那珂湊・阿字ヶ浦・金上だけ（2021年開業の美乃浜学園も交換できない）。那珂湊で反対の列車を待ったのは21:32発の列車だけ。その夜は上りが10分遅れたので、実際の発車は21:42。',
      html: () => `
<article class="doc paper">
  <header class="form-head"><div class="form-org">作中の資料（実際のダイヤではありません）</div><h3>湊線 1月15日 夜のダイヤ</h3></header>
  <p class="note-box">これは<b>時刻表どおり</b>のダイヤ。湊線は全線単線。上りと下りがすれちがえる駅は、那珂湊・阿字ヶ浦（と勝田側の金上）だけ。横にのびた線は、駅で止まっているところ。斜めの線を指でなぞると、その列車の時刻が出ます。</p>
  <figure class="trace" data-trace="4-2">${diagramSVG()}<p class="trace-out" aria-live="polite">線をなぞってみて</p></figure>
  <div class="sr-only sr-text"><ul>${TRAINS.map((t) => `<li>${t.dir}：${t.pts.map(([h, m, s]) => `${ST4[s][0]} ${fmt(h, m)}`).join(' → ')}</li>`).join('')}</ul></div>
</article>`,
    },
    '4-3': {
      no: '4-3', stage: 4, icon: '🎥', kind: '映像', title: '野々香の車のドラレコ', short: '風見家の庭。駐車中の録画（動画2本＋1コマ）',
      re: '赤いマフラーは、昔から変わらない野々香のしるし。母は砂袋を網の上に下ろしてから、空の荷台で出かけた＝浜の砂袋は写真館に行っていない。',
      html: () => `
<article class="doc paper">
  <div class="sticky">お姉ちゃんの青い車は、家の庭に停めると、駐車中も録画する。庭の干し場が映ってる。<br>※家から写真館までは車で約10分（私が走って確かめた）。<br>※干し網が風で飛ばないように、軽トラの荷台には重しの砂袋（家の前の浜の砂を詰めた、丸く平たい布袋）をいつも積んでる。<br><b>動画は何度でも見られて、止めてコマ送りもできる。</b></div>
  ${window.VID.html('clue_dashcam_a', { frame: 'dash', stamp: ['2027/01/15 20:41:02', '2027/01/15 20:43:40'], cap: '駐車監視の録画①　20:41〜', desc: '夜の庭。右に干し芋の干し場（木の棚3段、網がかかっている）。手前に白い軽トラ。荷台に丸く平たい白っぽい布の砂袋がいくつか。頭に手ぬぐい、緑の長靴の人が後ろ姿で、砂袋を荷台から1つずつ下ろして、干し場の網の上に置いていく。最後には荷台は空。' })}
  ${window.VID.html('clue_dashcam_b', { frame: 'dash', stamp: ['2027/01/15 20:48:10', '2027/01/15 20:48:40'], cap: '駐車監視の録画②　20:48〜', desc: '同じ庭。人が軽トラに乗り、ライトをつけて画面の外へ走り去る。走り去るとき、荷台は空。干し場の網の上には、砂袋が載ったまま。雪がちらつく。' })}
  ${A.photo('4-3b', dashcam({ ts: '2027/01/15 21:03:40', truck: false, who: 'nono', sheet: true, alt: '夜の庭。左に家。右の干し場に、青いシートをかけている人がいる。首に赤いマフラー。手前の駐車場所は空で、タイヤのあとだけが残っている。' }), 'コマ②　21:03')}
</article>`,
    },
    '4-4': {
      no: '4-4', stage: 4, icon: '🔬', kind: '報告書', title: '鑑識の追加報告', short: '傷の形と、肩についていたもの',
      re: '丸く平たい傷はカメラのレンズにも、軽トラの浜砂の袋にも合う。砂粒でレンズは消え、ドラレコで軽トラの砂袋は家に残ったと分かる。残るのはライトスタンドの重り（写真①で外れていた）。母は凶器を持って行ったのではない＝その場の出来事だった。干し網の繊維と芋の糖は、干し芋を作る人がそこにいたしるし。',
      html: () => `
<article class="doc paper form">
  <header class="form-head"><div class="form-org">鑑識係</div><h3>追加報告</h3></header>
  <dl class="kv">
    <dt>傷</dt><dd>後頭部に、直径約8cmの<b>丸く平たい</b>打撲。傷の中に<b>細かい砂粒</b>。</dd>
    <dt>肩</dt><dd>ナイロンの<b>網の繊維</b>（干し芋の干し網と同じ種類）と、<b>さつまいもの糖</b>の結晶。</dd>
    <dt>凶器</dt><dd>現場から見つかっていない物の可能性もある。</dd>
  </dl>
  <h4>スタジオの備品（1kg以上）</h4>
  <ul><li>ライトスタンドの重り（厚い布の丸い袋・約2kg・中は砂）×2</li><li>壁掛け時計（直径30cmの丸い木の枠・床に落ちていた）</li><li>フィルムカメラ（大きなレンズ。先は直径8cmの丸い金属）</li><li>三脚（金属・脚は細い棒）</li></ul>
</article>`,
    },
    '4-5': {
      no: '4-5', stage: 4, icon: '🗒', kind: '調書', title: '大津の供述（2回目）', short: '本当に見たこと', after: '4M',
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
      { t: '向かいの菅谷さんが、ゆうべ窓から見たところを絵にしてくれた。元・美術の先生なんだって。', doc: '2-3' },
      { t: 'お姉ちゃん、スマホの履歴も自分から出したって。「何も隠すことないから」。', doc: '2-4' },
      { t: 'お姉ちゃんが頼んでた写真の受付票も、写真館のカウンターにあった。', doc: '2-5' },
      { t: 'お姉ちゃんの話に、変なところがないか。……ないって、証明したい。' },
    ],
    's2.2M': [
      { t: '傷は後頭部。仰向けだったから、床の側。……着いてすぐ見ても、分かるわけない。さわってもいないのに。' },
      { t: 'なのにお姉ちゃんは、110番で「殴られたみたい」って言った。菅谷さんは「何か落ちた音」としか言ってない。' },
      { t: '「今から写真取りに行きます」は21:12。でも写真のお渡しは20日。行く理由を、あとから作ったんだ。……そのときにはもう、知ってた。' },
      { t: '21:08、「潮見写真館」からの48秒。……でも潮見さんは、21:04から気を失ってた。じゃあ、店の電話でかけたのは誰？' },
      { t: '「母は関係ないです」。21:13には、お母さんの携帯から2分。……お母さん、あの店にいたの？' },
      { t: 'スケッチの手もとの光も、スマホ。最初から持ってた。「車に忘れた」も嘘。じゃあ、何のために車に戻ったの？ わきに抱えてた、平たい物……。' },
      { t: '誰も聞いてないのに、お母さんをかばってる。' },
      { t: 'でも待って。お母さんは「野々香とずっと家にいた」って言った。一緒にいたなら、なんで携帯から電話するの？' },
      { who: 'beat', t: '11:05。取調室の前。' },
      { t: 'お姉ちゃんとすれちがった。「莉々香、ちゃんとご飯食べてる？」だって。こんなときに。' },
      { t: '森山さんが、お母さんの通話記録を取り寄せてる。私には見せてくれない。……でも、コピーは取れた。' },
    ],
    's3.start': [
      { who: 'beat', t: '1月16日（土）13:40。署の資料室。' },
      { t: 'お母さんの供述。「ずっと家で、お姉ちゃんとテレビ」。', doc: '3-1' },
      { t: 'お母さんの携帯の記録。かけた場所の範囲は透明シートでもらえた。うちの地図に重ねられる。', doc: '3-2' },
      { t: 'その日の朝刊のテレビ欄。', doc: '3-3' },
      { t: '放送局から、9時の6チャンネルの映像をもらえた。動画だよ。止めて見られる。', doc: '3-4' },
      { t: 'ついでに、地元のラジオ局の放送記録も。うちのお母さん、湊FMのファンなの。', doc: '3-5' },
      { t: 'お母さんの話、どこまで本当か。……資料で言い切れるところだけで、判断したい。前の資料も、引き出しにあるよ。' },
    ],
    's3.3M': [
      { t: '第2セクターは、写真館と湊公園のあたり。うちは第1。……お母さん、家にいなかった。潮見さんが倒れた、4分後に。' },
      { t: '6チャンネルは、本当に9時から大雪のニュース。そこはお母さんの言うとおり。' },
      { t: 'でも画面は、ずっと雪の踏切。漁港も船も映ってない。「船が真っ白」は、湊FMのニュースの言葉。……お母さんは、テレビじゃなくてラジオで聞いたんだ。たぶん、車の中で。' },
      { t: '「電話なんてしていません」。お姉ちゃんのスマホには、21:13にお母さんの携帯から。' },
      { t: '「9時20分ごろ野々香が出かけた」だけは、嘘だと言える資料がない。……お姉ちゃんの話とも合ってる。' },
      { t: '21:08は写真館の電話から、21:13は湊公園から。お母さんが、潮見さんが倒れてることを伝えた。だからお姉ちゃんは「殴られた」って知ってた。' },
      { who: 'beat', t: '16:20。' },
      { t: '森山さんが、大津さんを呼んだ。元助手で、前に傷害で捕まったことがある人。みんな、大津さんが犯人だと思ってる。' },
      { t: 'でも……大津さんの話にも、嘘がある気がする。' },
    ],
    's4.start': [
      { who: 'beat', t: '1月16日（土）17:30。' },
      { t: '大津さんの1回目の供述。「20:55の列車で帰った」って。', doc: '4-1' },
      { t: '湊線のダイヤ図。線を指でなぞると、その列車の時刻が出る。湊線は単線だよ。', doc: '4-2' },
      { t: 'お姉ちゃんの車のドラレコ。', doc: '4-3' },
      { t: '鑑識の追加報告も来た。', doc: '4-4' },
      { t: '前の資料は、引き出しにぜんぶあるよ。' },
    ],
    's4.4M': [
      { t: '20:55の列車は、どこでも誰ともすれちがわない。反対の列車を待ったのは、時刻表なら21:32。でもその夜は上りが10分遅れてた。だから発車は21:42。大津さん、9時40分ごろまで写真館の近くにいたんだ。' },
      { t: '問い詰めたら、全部話してくれた。2回目の供述を送る。', doc: '4-5' },
      { t: '大津さんは、犯人じゃなかった。……見ていた人だった。' },
      { t: '21:03、庭にいたのは赤いマフラーのお姉ちゃん。うちから写真館まで車で10分。21:04に殴れるわけない。' },
      { t: 'そして、白い軽トラがない。荷台に網。長靴。肩についてた干し網の繊維と、芋の糖。……お母さん。' },
      { t: '凶器は、外れて転がってたライトスタンドの重り。軽トラの砂袋は、出かける前に網の上へ下ろしてた。……お母さんは、殴るつもりで行ったんじゃなかった。' },
      { t: '…………。' },
      { t: 'お母さんのアリバイは、お母さん自身を守るためのものだった。お姉ちゃんは、お母さんを守るために、第一発見者のふりをした。' },
      { who: 'beat', t: '21:10。署の駐車場。莉々香は、しばらく車から降りられなかった。' },
      { t: 'お姉ちゃんの車の中のカメラに、お母さんのお店の茶封筒が映ってた。中に10万円。' },
      { t: 'お母さん、潮見さんにお金を払ってたの？ 何のために？' },
      { t: '森山さんが、お母さんを呼んだ。……私は、まだ外されたまま。' },
      { video: 'story_mid', t: '夜明け前の、うちの庭。お母さんの干し芋の湯気。' },
    ],
  });

  const WEAPON_KW = [
    ['stand', ['ライトスタンド', 'スタンド', 'スタンドの重り', 'スタンドの砂', '照明', '撮影用', 'スタジオの重り', 'スタジオの砂', 'ふるった砂', 'ライトの重り']],
    ['truck', ['荷台', '軽トラ', '浜の砂', '浜砂', '干し網の重し', '網の重し', '重し']],
    ['bag', ['砂袋', '砂', 'すなぶくろ', '重り', 'おもり', '錘', 'ウエイト', 'ウェイト', '布の袋']],
    ['clock', ['時計', 'とけい']],
    ['camera', ['カメラ', 'レンズ']],
    ['tripod', ['三脚', 'さんきゃく']],
  ];
  C.STAGES.push(
    {
      id: 2, label: 'S2 第一発見者', objective: '野々香の供述と110番を確かめる', docs: ['2-1', '2-2', '2-3', '2-4', '2-5'], mins: 23,
      puzzles: [
        { id: '2M', kind: 'mid', name: '知るはずのない傷',
          q: '野々香さんが「潮見さんが殴られた」と知ったのは［　］。それを知らせた人は［　］（いなければ「なし」）。',
          fields: [
            { k: 'when', type: 'time', label: '［1］知った時刻', ph: '例：20:45', half: true },
            { k: 'who', type: 'text', canon: 'person', label: '［2］知らせた人', ph: '名前 か なし', half: true }],
          fact: '傷は後頭部（床の側）で見えない。21:12のメッセージは嘘の用事。野々香は21:08、写真館の電話からの48秒で知った。潮見は21:04から気を失っていた＝かけたのは写真館にいた別の人＝野々香がかばう母',
          hint: [
            '「殴られたみたい」。着いたばかりの人に、それが分かる？ 2-2のシートを、ちゃんと重なるまで動かして、絵をよく見よう。',
            '野々香さん自身が送ったもの（1-5）の中身を、受付票と比べて。「いつまでに知っていた」が決まる。',
            '電話の「相手の名前」が、かけた人とはかぎらない。その時刻、その名前の人は電話に出られた？ そして野々香さんは、聞かれてもいないのに誰をかばった？'],
          miss: [
            { eq: { who: 'none' }, msg: '中に入って見たら分かった……？ 傷の場所を、2-2で確かめて。仰向けの人の、その場所は見える？' },
            { eq: { who: 'shiomi' }, msg: '21:08、潮見さんは電話のところまで行けた？ S1の答えと、2-2の付箋。' },
            { eq: { who: 'sugaya' }, msg: '菅谷さんが電話で言えたのは何だった？ 1-5の言葉をそのまま読んで。' },
            { eq: { who: 'otsu' }, msg: '野々香さんが110番で、聞かれる前にかばったのは誰？' },
            { eq: { who: 'nonoka' }, msg: '2-4は野々香さんのスマホ。21:08の電話を「受けた」のが野々香さん。かけたのは？ 野々香さんが110番で、聞かれる前にかばったのは誰？' },
            { test: (c) => +c.when === 1266, msg: '21:06の電話は、つながってない（0秒）。' },
            { test: (c) => +c.when === 1276, msg: '21:16の菅谷さんは「何か落ちたみたいな音」と言っただけ。' },
            { test: (c) => [1272, 1273, 552, 553].includes(+c.when), msg: '21:12、野々香さんは潮見さんに何と送った？ その用事は本当にあった？' },
            { eq: { who: ['ririka', 'moriyama'] }, msg: '2-4の履歴に、その人と話した記録はある？' }],
          fb: 'まだ合っていない。2-2のシートと付箋、1-5の110番と菅谷さんとメッセージ、2-4の履歴、2-5の受付票を並べてみて。' },
      ],
    },
    {
      id: 3, label: 'S3 母のアリバイ', objective: '「ずっと家にいた」母の話を確かめる', docs: ['3-1', '3-2', '3-3', '3-4', '3-5'], mins: 24,
      puzzles: [
        { id: '3M', kind: 'mid', name: '第2セクター',
          q: '3-1の母の供述①〜⑤のうち、資料で嘘だと言い切れるのは［　］（番号をすべて）。母がその夜のニュースの中身を知ったのは、［　］から。',
          fields: [
            { k: 'lies', type: 'text', canon: 'set', label: '［1］嘘と言い切れる番号（すべて）', ph: '例：1,4', half: true },
            { k: 'src', type: 'text', canon: 'kw', label: '［2］ニュースを知ったもの', ph: '短く', half: true,
              kw: [['radio', ['ラジオ', 'らじお', '湊FM', 'FM', 'エフエム', 'カーラジオ']], ['tv', ['テレビ', 'てれび', 'TV', '6ch', '6チャンネル', '常陸テレビ']], ['phone', ['電話', 'スマホ', 'ネット', 'メール']], ['person', ['人', '野々香', '菅谷', '近所', 'うわさ']], ['paper', ['新聞', 'テレビ欄', '朝刊']]] }],
          fact: '母の21:13の電話は第2セクター（写真館と湊公園）から。6chは9時から本当に大雪のニュース（②は本当）。でも画面は踏切の中継だけで、漁港の船は湊FMのラジオの言葉。母はラジオで聞いた。嘘は①③⑤',
          hint: [
            '3-2の「セクターの決まり」を読もう。シートには番号が書いていない。番号を決めるのは、シートではなく決まりのほう。',
            'テレビ欄は朝刊。その夜、9時の6チャンネルで本当に流れていたものは、別のステージに書いてある。……そして、その画面には何が映っていた？',
            '「言い切れる」のは、資料で打ち消せるものだけ。いまのステージの資料だけとはかぎらない。あやしいだけの番号は入れない。本当のことを言っている番号もある。'],
          miss: [
            { eq: { src: 'tv' }, msg: 'テレビで見たなら、画面に映っていたのは？ 3-4の映像と、③を比べて。' },
            { eq: { src: 'paper' }, msg: '朝刊のテレビ欄に、そのニュースは載っていた？' },
            { test: (c) => !c.lies.includes('1'), msg: '①は？ シートの「0°」は、いま地図のどっちを向いている？ 決まりは「真北を0°」。' },
            { test: (c) => c.lies.includes('2'), msg: '②は本当に嘘？ テレビ欄は朝刊。その夜9時の6チャンネルについては、1-5にも書いてある。' },
            { test: (c) => c.lies.includes('4'), msg: '④を打ち消す資料はある？ あやしい、だけでは言い切れない。' },
            { test: (c) => !c.lies.includes('5'), msg: '⑤「電話なんてしていません」。それを確かめられる資料は、前のステージにもある。' },
            { test: (c) => !c.lies.includes('3'), msg: '③の画面。3-4の映像を、最後まで見た？' }],
          fb: 'まだ合っていない。3-2の決まり、地図、3-3〜3-5、そして1-5を並べてみて。' },
      ],
    },
    {
      id: 4, label: 'S4 夜の再構成', objective: '21:04、写真館にいたのは誰か', docs: ['4-1', '4-2', '4-3', '4-4', '4-5'], mins: 26,
      puzzles: [
        { id: '4M', kind: 'mid', name: '夜の再構成',
          q: '21:04、潮見さんを殴った凶器は［　］。大津さんが本当に乗った列車が、その夜、実際に那珂湊を出た時刻は［　］。',
          fields: [
            { k: 'weapon', type: 'text', canon: 'kw', kw: WEAPON_KW, label: '［1］凶器', ph: 'できるだけくわしく' },
            { k: 'dep', type: 'time', label: '［2］那珂湊を出た時刻', ph: '例：21:00' }],
          fact: '凶器はライトスタンドの重り（軽トラの浜砂の袋は、ドラレコで家の網の上に残っている）。大津が乗ったのは那珂湊で反対の列車を待つ下り。その夜は上りが10分遅れ、発車は21:42。それまで大津は路地にいた',
          hint: [
            '大津さんの話で、嘘をつく理由がない細かいところはどこ？ そして、湊線はどんな線路？ そのダイヤは「いつ」のもの？',
            '傷の形に合う物は1つではない。傷の「中」にあった物で消せるものと、映像で消せるものがある。',
            'その夜の湊線のようすは、前のステージの資料にもある。反対の列車が遅れたら、待っている列車は？'],
          miss: [
            { eq: { weapon: 'bag' }, msg: '砂袋は、スタジオにも軽トラにもある。どっちの砂袋？' },
            { eq: { weapon: 'truck' }, msg: '軽トラの砂袋は、その夜どこにあった？ ドラレコの映像を最後まで見て。' },
            { eq: { weapon: 'clock' }, msg: '時計は落ちて止まった物。傷は「丸く平たい・直径8cm・中に砂粒」。時計の枠は？' },
            { eq: { weapon: 'camera' }, msg: 'レンズの先は形が合う。でも、傷の中の砂粒は？' },
            { eq: { weapon: 'tripod' }, msg: '細い棒で、丸く平たい傷になる？' },
            { test: (c) => +c.dep === 1255 || +c.dep === 535, msg: '20:55の列車は、反対から来る列車を待つ？ ダイヤ図をなぞってみて。' },
            { test: (c) => +c.dep === 1292 || +c.dep === 572, msg: 'それは時刻表どおりの時刻。その夜の湊線は、時刻表どおりだった？' },
            { test: (c) => +c.dep === 1286, msg: '21:26は、那珂湊に着いた時刻。出たのは？' }],
          fb: 'まだ合っていない。4-1〜4-4と、S1の写真①を並べてみて。' },
      ],
    },
  );
})();
