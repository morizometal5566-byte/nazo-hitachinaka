/* 十九年目のネガ — 完全版：S5・S6・大謎・エンディング */
(function () {
  'use strict';
  const C = window.CASE, A = C.art;

  /* 現像（明るさのスライダー）。1-3の暗い写真を明るくする */
  function develop(id, svg, cap) {
    return `
<figure class="dev" data-dev="${id}">
  <div class="ph-frame"><div class="dev-img">${svg}</div></div>
  <label class="dev-ctl"><span>☀ 現像（明るさ）</span><input type="range" min="0" max="100" step="1" value="0" aria-label="明るさ（現像）"><output class="dev-val">0</output></label>
  ${cap ? `<figcaption>${cap}</figcaption>` : ''}
</figure>`;
  }

  /* S6：燃え残り（3つのかけら。タップで回す／2つ選んで入れかえる） */
  const FRAG_FULL = `
    <rect width="300" height="200" fill="#c9b79c"/>
    <path d="M0 140 Q60 120 110 138 T220 132 T300 140 V200 H0Z" fill="#6d5c4b"/>
    <path d="M0 160 Q80 150 150 165 T300 158 V200 H0Z" fill="#4e4036"/>
    <circle cx="240" cy="56" r="20" fill="#f4d58d"/>
    <path d="M0 110 Q150 96 300 108" stroke="#a7c4d8" stroke-width="8" fill="none" opacity=".7"/>
    <text x="214" y="188" text-anchor="middle" font-family="monospace" font-weight="700" font-size="24" fill="#ff8f00">'08 1 12</text>`;
  const FRAGS = [
    { clip: 'M0 0 H120 L104 70 L126 120 L96 200 H0 Z', vb: '0 0 126 200' },
    { clip: 'M120 0 H210 L196 64 L224 118 L190 200 H96 L126 120 L104 70 Z', vb: '96 0 128 200' },
    { clip: 'M210 0 H300 V200 H190 L224 118 L196 64 Z', vb: '190 0 110 200' },
  ];
  function fragsHTML() {
    return `
<figure class="frags" data-frags="6-5">
  <div class="frag-row">${FRAGS.map((fr, i) => `<button type="button" class="frag" data-fi="${i}" aria-label="かけら${i + 1}"><svg viewBox="${fr.vb}" style="aspect-ratio:${fr.vb.split(' ')[2]}/200" aria-hidden="true"><defs><clipPath id="fc${i}"><path d="${fr.clip}"/></clipPath></defs><g clip-path="url(#fc${i})" class="frag-g"><g class="frag-burn">${FRAG_FULL}</g></g><path d="${fr.clip}" fill="none" stroke="#2b1d12" stroke-width="5" stroke-linejoin="round" opacity=".75"/></svg></button>`).join('')}</div>
  <div class="frag-joined" aria-hidden="true"><svg viewBox="0 0 300 200">${FRAG_FULL}${FRAGS.map((fr) => `<path d="${fr.clip}" fill="none" stroke="#2b1d12" stroke-width="2" opacity=".5"/>`).join('')}<path d="M0 0 H300 V200 H0Z" fill="none" stroke="#2b1d12" stroke-width="3"/></svg></div>
  <p class="frag-help">かけらをタップ＝回す（90°）。「入れかえ」を押してから2つタップ＝場所を入れかえる。</p>
  <div class="ov-tools"><button type="button" class="tool" data-fragt="swap" aria-pressed="false">⇄ 入れかえ</button><button type="button" class="tool ghost" data-fragt="reset">元に戻す</button><span class="ov-state frag-state" aria-live="polite"></span></div>
  <p class="ov-ok" role="status" hidden>ピタッ。破れ目がつながった。</p>
</figure>`;
  }

  /* S6：野々香のノート（ます目は 横4×縦5。0-1の穴あき手紙は 横5×縦4 なので、回さないと重ならない） */
  const NOTE5 = ['ししたゃ', 'なくるた', 'まふねみ', 'たわいわ', 'しじがお'];
  const NG = { x: 88, y: 130 }, SH = { x: 60, y: 158 }; // ノートのます目の左上／シートの穴の左上（どちらも中心は 200,270）
  function noteBase() {
    const { CELL } = A;
    const cells = NOTE5.map((row, r) => [...row].map((ch, c) => `<text x="${NG.x + CELL * (c + 0.5)}" y="${NG.y + CELL * (r + 0.5) + 11}" text-anchor="middle" class="grid-k note-k">${ch}</text>`).join('')).join('');
    return `
      <rect width="400" height="480" fill="#fdfbf4"/>
      ${Array.from({ length: 16 }, (_, i) => `<line x1="0" y1="${30 + i * 28}" x2="400" y2="${30 + i * 28}" stroke="#c8d7e8" stroke-width="1"/>`).join('')}
      <line x1="40" y1="0" x2="40" y2="480" stroke="#f2a7a7" stroke-width="1.5"/>
      <text x="52" y="52" class="kid">2008.1.13（日）</text>
      <text x="52" y="82" class="kid">きのうのことは、ぜったい言わない。</text>
      <rect x="${NG.x - 10}" y="${NG.y - 6}" width="${CELL * 4 + 20}" height="${CELL * 5 + 12}" rx="8" fill="none" stroke="#b33" stroke-width="2" stroke-dasharray="6 4"/>
      ${cells}
      <text x="52" y="${NG.y + CELL * 5 + 40}" class="kid">おかあさんを、こまらせない。</text>`;
  }
  function noteSr() { // 重なる4通り（表／裏 × 右90°／左90°）の、穴とます目の対応
    const P = [['表のまま右に90°回すと', (r, c) => [c, 3 - r]], ['表のまま左に90°回すと', (r, c) => [4 - c, r]], ['裏返して右に90°回すと', (r, c) => [4 - c, 3 - r]], ['裏返して左に90°回すと', (r, c) => [c, r]]];
    return P.map(([lb, f]) => lb + '、' + C.TARGETS.map(([r, c], i) => { const [R, K] = f(r, c); return `「${C.MARKS[i]}」${R + 1}行目の${K + 1}文字目`; }).join('、') + '。').join('');
  }
  function grilleSheet() {
    const { CELL } = A;
    const x0 = SH.x - 10, y0 = SH.y - 6, w = CELL * 5 + 20, h = CELL * 4 + 12;
    const holes = C.TARGETS.map(([r, c]) => `<circle cx="${SH.x + CELL * (c + 0.5)}" cy="${SH.y + CELL * (r + 0.5)}" r="17" fill="#000"/>`).join('');
    const marks = C.TARGETS.map(([r, c], i) => `<circle cx="${SH.x + CELL * (c + 0.5)}" cy="${SH.y + CELL * (r + 0.5)}" r="17" fill="none" stroke="#8d6e63" stroke-width="2"/><text x="${SH.x + CELL * (c + 0.5) + 21}" y="${SH.y + CELL * (r + 0.5) - 12}" class="hole-no">${C.MARKS[i]}</text>`).join('');
    return `
      <defs><mask id="gr-m"><rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="#fff"/>${holes}</mask></defs>
      <rect x="${x0}" y="${y0}" width="${w}" height="${h}" rx="6" fill="#e9dcc0" mask="url(#gr-m)"/>
      <rect x="${x0}" y="${y0}" width="${w}" height="${h}" rx="6" fill="none" stroke="#a1887f" stroke-width="2"/>
      ${marks}
      <text x="${x0 + 6}" y="${y0 + h - 8}" class="back-note">0-1の手紙（穴の部分・うら）</text>`;
  }

  /* 大謎：森山の机（真上から）とネガ */
  const DESK_SVG = `
<svg viewBox="0 0 600 440" class="svg-photo" role="img" aria-label="スチールの机を真上から撮った写真。茶封筒に手書きで「H20.1.12 平磯 預かり」。そのとなりに、色あせた黄色い毛糸のポンポン帽。ネガ袋には「潮見写真館 No.08-03 H20.1.12 平磯 AM」。封筒のすみのメモに「足跡 19 ／ 長女 23」。ぬるそうな缶コーヒーが1本。">
  <rect width="600" height="440" fill="#7f8c8d"/><rect x="0" y="0" width="600" height="440" fill="url(#deskg)"/>
  <defs><linearGradient id="deskg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#95a5a6"/><stop offset="1" stop-color="#6c7a7b"/></linearGradient></defs>
  <g transform="rotate(-6 200 200)"><rect x="60" y="70" width="300" height="210" rx="4" fill="#c8a165"/><path d="M60 70 L210 160 L360 70" fill="none" stroke="#a7834c" stroke-width="3"/>
    <text x="90" y="230" font-family="'Noto Serif CJK JP',serif" font-size="24" fill="#3e2723">H20.1.12 平磯　預かり</text>
    <text x="90" y="262" font-family="'Noto Serif CJK JP',serif" font-size="15" fill="#4e342e">足跡 19 ／ 長女 23</text></g>
  <g transform="translate(450 150)"><path d="M-70 30 Q-70 -50 0 -52 Q70 -50 70 30 Z" fill="#e8c547"/><g stroke="#cfae35" stroke-width="3">${Array.from({ length: 9 }, (_, i) => `<line x1="${-60 + i * 15}" y1="25" x2="${-56 + i * 14}" y2="-40"/>`).join('')}</g><rect x="-74" y="18" width="148" height="20" rx="8" fill="#d9b43a"/><circle cx="0" cy="-58" r="20" fill="#efd060"/></g>
  <g transform="rotate(4 360 340)"><rect x="250" y="300" width="230" height="92" fill="#f3efe6" stroke="#b9b2a2"/><rect x="262" y="312" width="206" height="40" fill="#5b3a29" opacity=".85"/><text x="268" y="376" font-size="14" fill="#5d4037" font-family="sans-serif">潮見写真館 No.08-03　H20.1.12 平磯 AM</text></g>
  <g transform="translate(90 360)"><rect x="-22" y="-34" width="44" height="68" rx="8" fill="#6d4c41"/><rect x="-22" y="-10" width="44" height="22" fill="#d7ccc8"/><text x="0" y="6" text-anchor="middle" font-size="10" fill="#4e342e">COFFEE</text></g>
</svg>`;
  // 白黒フィルム。手前（大きく写る）：倒れた母・落ちる父・押す子ども。奥（小さく写る）：堤防の上の少女
  const NEG_SCENE = `
    <rect width="600" height="400" fill="#e4dccb"/>
    <circle cx="540" cy="110" r="30" fill="#fbf6e9"/>
    <rect y="150" width="600" height="250" fill="#8d9aa3"/>
    <path d="M0 150 Q300 140 600 150" stroke="#b9c3c9" stroke-width="5" fill="none"/>
    <path d="M0 166 L230 158 L230 174 L0 184 Z" fill="#9a9a9a"/><path d="M0 184 L230 174 L230 182 L0 194 Z" fill="#767676"/>
    <g transform="translate(110 158) scale(.62)">
      <rect x="-9" y="-30" width="8" height="30" fill="#2a2a2a"/><rect x="2" y="-30" width="8" height="30" fill="#2a2a2a"/>
      <rect x="-14" y="-78" width="28" height="50" rx="6" fill="#5a5a5a"/>
      <circle cy="-92" r="14" fill="#d8d0c4"/><path d="M-14 -96 Q0 -114 14 -96 Z" fill="#2e2e2e"/><path d="M-14 -94 q-4 14 0 24 M14 -94 q4 14 0 24" stroke="#2e2e2e" stroke-width="5" fill="none"/>
      <rect x="-16" y="-80" width="32" height="10" rx="4" fill="#3a3a3a"/><rect x="8" y="-76" width="9" height="28" rx="3" fill="#3a3a3a"/>
      <path d="M-26 -60 h44 l-7 20 h-30 z" fill="#9c9488" stroke="#555" stroke-width="2"/></g>
    <path d="M0 400 L0 270 Q90 236 200 252 Q300 262 380 238 Q450 220 520 232 L540 400 Z" fill="#544c45"/>
    <path d="M0 300 Q100 280 220 296 Q320 306 400 286 L520 290 L536 400 H0 Z" fill="#433c36"/>
    <g transform="translate(170 272)"><ellipse rx="92" ry="15" fill="#2d2925" opacity=".6"/><circle cx="-66" cy="-14" r="15" fill="#3d3d3d"/><rect x="-52" y="-26" width="104" height="24" rx="10" fill="#4a4a4a"/><rect x="50" y="-22" width="42" height="12" rx="4" fill="#383838"/></g>
    <g transform="translate(512 236) rotate(-24)">
      <rect x="-15" y="16" width="14" height="74" fill="#262626"/><rect x="3" y="16" width="14" height="74" fill="#262626"/>
      <rect x="-20" y="-70" width="40" height="90" rx="7" fill="#4b4b4b"/>
      <circle cy="-90" r="18" fill="#d8d0c4"/>
      <path d="M-18 -56 l-32 26 M18 -56 l28 -36" stroke="#4b4b4b" stroke-width="12" stroke-linecap="round"/></g>
    <g transform="translate(446 268)">
      <rect x="-11" y="-4" width="9" height="40" fill="#3b3b3b"/><rect x="2" y="-4" width="9" height="40" fill="#3b3b3b"/>
      <rect x="-14" y="-46" width="28" height="44" rx="6" fill="#6a6a6a"/>
      <circle cy="-60" r="14" fill="#d8d0c4"/>
      <path d="M-16 -62 Q0 -88 16 -62 Z" fill="#bdbdbd"/><circle cy="-84" r="8" fill="#c9c9c9"/>
      <path d="M12 -38 l40 -18 M12 -28 l40 -8" stroke="#6a6a6a" stroke-width="8" stroke-linecap="round"/></g>
    <path d="M490 330 q20 -10 40 0 t40 0" stroke="#f0f0f0" stroke-width="3" fill="none" opacity=".7"/>
    <text x="586" y="388" text-anchor="end" font-family="monospace" font-weight="700" font-size="26" fill="#f2f2f2">'08 1 12</text>`;
  function negHTML() {
    return `
<figure class="neg" data-neg="7-2">
  <div class="neg-film"><div class="neg-frame"><svg viewBox="0 0 600 400" class="neg-svg" role="img" aria-label="白黒ネガの1コマ。日の出の岩場。人が4人写っている。ネガのままだと明るさが反対で、向きも違う。"><g class="neg-g">${NEG_SCENE}</g></svg></div></div>
  <div class="ov-tools" role="group" aria-label="ネガの道具">
    <button type="button" class="tool" data-negt="rot" aria-label="ネガを右に90度回す">↻ 回す</button>
    <button type="button" class="tool" data-negt="flip" aria-label="ネガを裏返す">⇋ 裏返す</button>
    <button type="button" class="tool ghost" data-negt="reset">元に戻す</button>
    <span class="ov-state neg-state" aria-live="polite"></span></div>
  <label class="dev-ctl"><span>☀ 現像（白黒ネガ → ポジ）</span><input type="range" min="0" max="100" step="1" value="0" aria-label="現像（ネガからポジへ）"><output class="dev-val">0</output></label>
  <p class="ov-ok" role="status" hidden>写し込みが正しく読める向き。白黒の写真になった。</p>
  <details class="sr-text neg-desc" hidden><summary>写真を文字で読む</summary><p>白黒写真。日の出の直後の平磯の岩場。手前の岩に、女性が向こうを向いて倒れている。右手前の岩の端で、男性が後ろへ傾いて海へ落ちていく。そのすぐ前、同じ岩の上で、子どもが両手を前に突き出している。子どもの頭のてっぺんは、男性の腰の高さくらい。頭には毛糸の帽子で、てっぺんに丸い玉。ずっと奥、海の向こう側の堤防の上に、もう1人の少女。写真の中では、手前の子どもより小さく写っている。髪は長く、首に濃い色のマフラー、カゴをかかえて立っている。右下に写し込み「'08 1 12」。</p></details>
</figure>`;
  }

  Object.assign(C.DOCS, {
    '5-1': {
      no: '5-1', stage: 5, icon: '☀', kind: '写真', title: '1-3を現像する', short: '22:03の写真を明るく。22:26と比べる',
      re: 'S1からずっと、暗い写真の中に写っていた。',
      html: () => `
<article class="doc paper">
  <div class="sticky">私のスマホ写真（22:03）を、明るくできるようにした。下は鑑識さんの全景（22:26、入室前）。</div>
  ${develop('5-1a', A.studioScene({ dark: true, sleeve: true, alt: '1-3と同じ、暗いスタジオの写真。明るさを上げると細部が見えてくる。' }), '上：IMG_0347（22:03、莉々香）')}
  ${A.photo('5-1b', A.studioScene({ markers: true, alt: '鑑識の全景写真①と同じ。背景紙のすその床には何もない。' }), '下：1-2 写真①（22:26、鑑識・入室前）')}
  <details class="sr-text"><summary>写真の違いを文字で</summary><p>明るさを最大まで上げると、22:03の写真の背景紙のすそに、白い紙の袋のような四角い物が見える。字は読めない。22:26の写真の同じ場所には何もない。</p></details>
</article>`,
    },
    '5-2': {
      no: '5-2', stage: 5, icon: '🎞', kind: '台帳', title: '潮見のネガ台帳', short: '2008年1月のページ',
      re: '台帳から消えた08-03は、潮見が19年間金庫に入れていた1本。現場の白い紙袋がそれだった。',
      html: () => `
<article class="doc paper form">
  <header class="form-head"><div class="form-org">潮見写真館（架空）</div><h3>ネガ台帳　2008年（平成20年）</h3></header>
  <p class="pen">表紙の書き込み：「ネガは白い紙袋に入れて番号を書く。撮った日の順に番号。欠番は作らない」</p>
  <table class="log"><thead><tr><th>No.</th><th>日付</th><th>内容</th></tr></thead><tbody>
    <tr><td>08-01</td><td>1/3</td><td>初日の出・磯崎</td></tr>
    <tr><td>08-02</td><td>1/10</td><td>湊の冬・那珂湊駅（展示パネル）</td></tr>
    <tr><td>08-04</td><td>1/14</td><td>成人式の前撮り</td></tr>
    <tr><td>08-05</td><td>1/19</td><td>七五三の焼き増し</td></tr></tbody></table>
</article>`,
    },
    '5-3': {
      no: '5-3', stage: 5, icon: '🌅', kind: 'ブログ', title: '日の出日記（2008年1月）', short: '潮見の写真ブログの記事一覧',
      re: '「誰にも見せられない」一枚は、19年後に脅しの道具になった。',
      html: () => `
<article class="doc paper blog">
  <header class="form-head"><div class="form-org">潮見達郎のブログ「日の出日記」（印刷）</div><h3>2008年1月の記事</h3></header>
  <ul class="blog-list">
    <li><time>1/3</time>初日の出は磯崎で。今年もいい年に。</li>
    <li><time>1/10</time>湊の冬。駅で、仲のいい姉妹を撮らせてもらった。</li>
    <li><time>1/11</time>雪。一日、店番。シャッターは一度も切らなかった。</li>
    <li><time>1/13</time>きのうの朝の平磯で、一生に一度の一枚が撮れてしまった。でも、これは誰にも見せられない。今日は店を休んで、暗室で現像だけ。</li>
    <li><time>1/14</time>成人式の前撮り。晴れ着が映える。</li></ul>
  <p class="aside">※平磯の日の出ポイントは、0-1の地図のカメラの印。</p>
</article>`,
    },
    '6-1': {
      no: '6-1', stage: 6, icon: '📕', kind: '帳簿', title: '潮見の帳簿', short: '毎月15日の「K」',
      re: 'Kは風見。19年、毎月10万円。',
      html: () => `
<article class="doc paper form">
  <header class="form-head"><div class="form-org">潮見写真館（架空）</div><h3>私用の帳簿（抜粋）</h3></header>
  <table class="log"><thead><tr><th>年月</th><th>記号</th><th>金額（万円）</th></tr></thead><tbody>
    <tr><td>2008.3〜 毎月15日</td><td>K</td><td>＋10</td></tr>
    <tr><td>2015.4〜 毎月</td><td>M（真紀へ仕送り）</td><td>−5</td></tr>
    <tr><td>2026.12</td><td>K</td><td>＋10 <span class="pen">→ 1月から 500？「妹さんに見せる」</span></td></tr>
    <tr><td>2027.1.15</td><td>K</td><td class="pen">（記入なし）</td></tr></tbody></table>
  <p class="aside">※1月15日、野々香の車にあった茶封筒（風見ほしいもの判子）には10万円。</p>
</article>`,
    },
    '6-2': {
      no: '6-2', stage: 6, icon: '✉', kind: '手紙', title: '匿名の手紙（2008年2月）', short: '母の部屋の引き出しから',
      re: '「お嬢さん」とだけ書いてあった。どちらの娘かは書いていない。',
      html: () => `
<article class="doc paper letter">
  <p class="typed">風見みゆき様</p>
  <p class="typed">あの朝、平磯の岩場で、お嬢さんがご主人を押すところを撮りました。<br>写真は誰にも見せません。毎月15日に、10万円を写真館へ。</p>
  <p class="aside">消印：2008年2月18日　那珂湊</p>
</article>`,
    },
    '6-3': {
      no: '6-3', stage: 6, icon: '📔', kind: '日記', title: 'みゆきの日記', short: '2008年と、事件の前日',
      re: '「気がついたら」――みゆきは何も見ていなかった。',
      html: () => `
<article class="doc notebook">
  <h3>みゆきの日記（抜粋）</h3>
  <section><h4>2008年1月12日</h4><p>岩場で、あの人にまた殴られた。<b>気がついたら</b>、あの人は海の中で、野々香がそばで泣いていた。「わたしが押した」と。<br>この子を一生守る。事故で通す。莉々香は家で寝ていた。それでいい。</p></section>
  <section><h4>2008年1月13日</h4><p>莉々香の黄色い帽子が、どこにもない。</p></section>
  <section><h4>2008年2月20日</h4><p>手紙が来た。「お嬢さん」。……あの子のことだ。払うしかない。</p></section>
  <section><h4>2027年1月14日</h4><p>潮見さんが「刑事になった妹さんに、あの写真を見せる」と。それだけは。</p></section>
</article>`,
    },
    '6-4': {
      no: '6-4', stage: 6, icon: '📓', kind: 'ノート', title: '野々香の2008年のノート', short: '12歳のお姉ちゃんの日記',
      re: '表で読めるのは「わたしがおした」――母に言ったおとりの言葉。帰りに裏で読む本当の言葉は「わたしじゃない」。12歳の野々香は、押していないのに「押した」と言って、妹の罪と記憶を守った。',
      html: () => `
<article class="doc paper">
  <div class="sticky">お姉ちゃんが小学生のころのノート。なぜか私の机に、ずっとあった。0-1の手紙の穴の部分を写したシートも作った。</div>
  ${A.overlay('6-4s', { w: 400, h: 480, base: noteBase(), sheet: grilleSheet(), init: { x: 0, y: 90, r: 0, f: 0 }, snap: { x: 0, y: 0, rs: [90, 270], fs: true, tol: 22 }, pivot: [200, 270],
    label: '0-1の穴あき手紙（穴の部分）', alt: '野々香のノートのページ。1行目「2008.1.13（日）」、2行目「きのうのことは、ぜったい言わない。」その下に、赤い点線で囲んだひらがなのます目（横4文字×縦5行）。最後の行「おかあさんを、こまらせない。」その上に、0-1の手紙の穴の部分（横5×縦4、穴のそばに漢字1文字ずつ）が、ずれて重なっている。',
    okmsg: 'ピタッ。穴が、ます目に重なった。',
    cap: 'ノートのページ（下）と、0-1の手紙の穴（上）' })}
  <details class="sr-text"><summary>ます目を文字で読む</summary><p>ます目は横4文字×縦5行。1行目 ${NOTE5[0]}、2行目 ${NOTE5[1]}、3行目 ${NOTE5[2]}、4行目 ${NOTE5[3]}、5行目 ${NOTE5[4]}。シートは横5×縦4なので、そのままでは重ならない。${noteSr()}</p></details>
</article>`,
    },
    '6-5': {
      no: '6-5', stage: 6, icon: '🔥', kind: '証拠', title: 'かまどの燃え残り', short: '風見ほしいもの加工場から',
      re: 'みゆきは事件の夜、持ち帰ったプリントを加工場のかまどで燃やした。0:31の電話のパチパチは、その音。',
      html: () => `
<article class="doc paper">
  <div class="sticky">加工場のかまどの灰から、鑑識さんが写真の燃え残りを3つ見つけた。人が写っていたところは、焼けてなくなってる。</div>
  ${fragsHTML()}
  <details class="sr-text"><summary>かけらを文字で読む</summary><p>3つのかけらは写真の左・まん中・右。正しくつなぐと、岩場と海と朝日の風景になり、右下にオレンジの写し込み「'08 1 12」が読める。</p></details>
</article>`,
    },
    '7-1': {
      no: '7-1', stage: 7, icon: '🗄', kind: '写真', title: '森山の机', short: '封筒と、黄色い帽子',
      re: '「足跡19／長女23」。森山は19年前、子どもの足跡と帽子から、押したのが誰か分かっていた。',
      html: () => `
<article class="doc paper">
  <div class="sticky">誰もいない刑事課で撮った。森山さんの机の奥にあった封筒。</div>
  ${A.photo('7-1a', DESK_SVG, '封筒「H20.1.12 平磯 預かり」・黄色い毛糸の帽子・ネガ袋 No.08-03・メモ「足跡 19 ／ 長女 23」')}
</article>`,
    },
    '7-2': {
      no: '7-2', stage: 7, icon: '🎞', kind: 'ネガ', title: 'ネガ No.08-03', short: '袋から出したままの1コマ',
      re: '白黒フィルムなので、色は決め手にならない。手前の子は大きく写っていただけで、父の腰までしかない。てっぺんに玉のある帽子は、1-2③のパネルの莉々香と同じ。莉々香は、自分を見ていた。',
      html: () => `
<article class="doc paper">
  <div class="sticky">袋から出した1コマ。……これ、押してるの、お姉ちゃんだよね？</div>
  ${negHTML()}
</article>`,
    },
  });
  function noteRows() {
    const NG = NOTE_GRID.map((r) => [...r]);
    const want = ['り', 'り', 'か', 'を', 'ま', 'も', 'る'];
    C.TARGETS.forEach(([r, c], i) => { NG[r][c] = want[i]; });
    return NG.map((r) => r.join(''));
  }

  Object.assign(C.CHAT, {
    's5.start': [
      { who: 'beat', t: '1月17日（日）2:10。莉々香の部屋。' },
      { t: 'お母さん、認めたって。潮見さんを殴ったのは自分だって。' },
      { t: 'でも、どうしてお金を払ってたのかは言わない。「昔のことです」って、それだけ。' },
      { t: '潮見さんの金庫は空だった。お母さんが持ち帰った物のほかにも、何かあったはず。' },
      { t: '私の22:03の写真、明るくできるようにした。鑑識さんの22:26と比べてみて。', doc: '5-1' },
      { t: '潮見さんのネガ台帳。', doc: '5-2' },
      { t: 'ブログの印刷も。潮見さん、毎朝日の出を撮ってた。', doc: '5-3' },
      { t: 'あの夜、誰がいつスタジオに入ったか。1-1の報告書は、交番の人が書いたもの。……私、自分が撮った写真のことしか覚えてない。' },
    ],
    's5.5M': [
      { t: '白い紙袋……。私が撮った22:03にはあって、鑑識さんの22:26にはない。台帳から消えた08-03。' },
      { t: '2008年1月12日。平磯の朝。……お父さんが死んだ日の、朝。' },
      { t: '「上の人」。交番の人から見た「上の人」は、あの場に1人しかいない。森山さん。' },
      { t: '「撮るな」って言ったのは、これを写させないため。そのあと、1人で入った7分間に。' },
      { t: '追伸に書いたこと、覚えてる？ 「なんで私を相棒に選んだんだろう」。……答え、知るのが怖い。' },
      { who: 'beat', t: '9:40。森山は、莉々香の問いに「お前には関係ない」とだけ言った。' },
      { t: '関係ないわけ、ない。お母さんが払ってたお金と、19年前の写真。つながってる。' },
    ],
    's6.start': [
      { who: 'beat', t: '1月17日（日）10:00。風見家。誰もいない母の部屋。' },
      { t: '潮見さんの帳簿。2008年3月から、毎月15日に「K」から10万円。', doc: '6-1' },
      { t: 'お母さんの引き出しから、手紙と日記。', doc: '6-2' },
      { t: '加工場のかまどからは、写真の燃え残り。……0:31の電話のパチパチは、これだったんだ。', doc: '6-5' },
      { t: 'それと、お姉ちゃんが小学生のころのノート。なぜか、ずっと私の机にあったやつ。', doc: '6-4' },
    ],
    's6.6M': [
      { t: '表で読むと「わたしがおした」。……でも、お姉ちゃんの手紙は、行きはおとり。' },
      { t: '帰りに、裏で。「わたしじゃない」。' },
      { t: 'お姉ちゃん、12歳で、これを書いたんだ。「きのうのことは、ぜったい言わない」の次の日に。' },
      { t: 'お母さんは、お姉ちゃんが押したと信じてた。だから19年、払い続けた。お姉ちゃんを守るために。' },
      { t: 'でも、お母さんは見てない。「気がついたら」って書いてある。' },
      { t: 'お姉ちゃんが「わたしが押した」って言って、お母さんはそれを信じた。……なのに、お姉ちゃん本人は「わたしじゃない」。じゃあ、誰が。' },
      { who: 'beat', t: '23:50。署。誰もいない刑事課。' },
      { t: '森山さんの机の奥に、うちの名前の封筒があった。中に、ネガと……黄色い帽子。', doc: '7-1' },
      { t: 'ネガも見て。押してるの、手前の大きいほう。……あの帽子、お姉ちゃんとおそろいの。どっち――', doc: '7-2' },
    ],
    's7.7M': [
      { t: '帽子はおそろいだった。白黒じゃ、色も分からない。……でも、大きさはごまかせない。' },
      { t: '手前にいるから大きく見えただけ。お父さんの腰までしかない、小さい子。お姉ちゃんは、奥の堤防の上。カゴを抱えて、立ってる。' },
      { t: '私だ。' },
      { t: '「寝てた」のは、お母さんがそう言っただけ。私の記憶じゃなかった。' },
      { who: 'beat', t: '1月18日（月）6:20。平磯の岩場。日の出の少し前。' },
      { who: 'mori', t: '……見たか。' },
      { who: 'mori', t: '足跡が19センチだった。お姉さんの靴は23。帽子は、岩のすき間に引っかかってた。' },
      { who: 'mori', t: '8歳の子が、母親を守ろうとした。俺はそれを事故と書いた。正しかったのかは、19年たっても分からん。' },
      { who: 'mori', t: '今朝、俺は自分のしたことを全部、上に話す。お母さんのことは、お母さんが自分で話す。' },
      { who: 'mori', t: 'ネガは、お前が決めろ。' },
      { t: '……相棒に選んだのは、そういうことだったんですね。' },
      { who: 'mori', t: '寝ろって言っただろ。' },
    ],
    's8.submit': [
      { t: 'ネガは、証拠として出した。19年前のことは、もう誰も罪に問えない。でも、なかったことにはしない。' },
      { t: 'お姉ちゃんが19年ひとりで持っていたものを、半分持つために。' },
    ],
    's8.sea': [
      { t: 'ネガは、平磯の海に返した。森山さんは何も言わなかった。' },
      { t: 'お姉ちゃんの嘘を、最後まで守る。それが正しかったのかは、あなたと私しか知らない。' },
    ],
  });

  C.STAGES.push(
    {
      id: 5, label: 'S5 消えたネガ', objective: '現場から消えた物と、消した人', docs: ['5-1', '5-2', '5-3'], mins: 20,
      puzzles: [
        { id: '5M', kind: 'mid', name: '7分間',
          q: '現場から消えた物を持ち出したのは［　］。それは［　］に撮られたネガ。',
          fields: [
            { k: 'who', type: 'text', canon: 'person', label: '［1］持ち出した人', ph: '名前', half: true },
            { k: 'date', type: 'date', label: '［2］撮った日', ph: '例：2008年1月1日', half: true }],
          fact: '22:04〜22:11に森山が持ち出したネガ（台帳から消えた08-03）は、2008年1月12日・平磯の朝の写真',
          hint: [
            '1-3の付箋「暗くてごめん」。明るくした写真と22:26の写真で、変わったところは？ その形は、台帳のどこかに出てくる。',
            '台帳の決まりを、番号の並びと照らし合わせて。足りないものは、ない？ ブログの日付は、書いた日。',
            '1-1の手書きのメモは、交番の巡査が書いたもの。巡査から見て「上の人」は？ その時刻、ほかの人はどこにいた？'],
          miss: [
            { eq: { who: 'kanshiki' }, msg: '鑑識の22:26の写真は、入室する前に入口から撮ったもの。そのとき、もう……？' },
            { eq: { who: 'patrol' }, msg: '巡査は21:58に退室している。22:03の写真には、まだ写っていた。' },
            { eq: { who: 'nonoka' }, msg: '野々香さんは21:50からパトカー、22:15に署へ（1-1）。' },
            { eq: { who: 'ririka' }, msg: '莉々香は「入口から1枚撮影（入室せず）」。' },
            { eq: { who: '上の人' }, msg: '「上の人」って、誰のこと？ 名前で。' },
            { eq: { date: ['2008-1-10', '?-1-10'] }, msg: 'それは展示パネル（08-02）の日。' },
            { eq: { date: ['2008-1-14', '?-1-14'] }, msg: 'それは08-04の日。' },
            { eq: { date: ['2008-1-13', '?-1-13'] }, msg: 'その日付は、記事を書いた日。記事の中の「いつ」を、よく読んで。' },
            { eq: { date: ['2008-1-11', '?-1-11'] }, msg: 'その日、潮見さんはシャッターを切った？ ブログを見て。' }],
          fb: 'まだ合っていない。5-1・5-2・5-3と、1-1の手書きのメモを並べてみて。' },
      ],
    },
    {
      id: 6, label: 'S6 母が信じていたこと', objective: '母が19年払い続けた理由と、姉が隠した言葉', docs: ['6-1', '6-2', '6-3', '6-4', '6-5'], mins: 20,
      puzzles: [
        { id: '6M', kind: 'mid', name: 'もう一度、湊線に乗って',
          q: '野々香さんがノートに隠した、本当の言葉は［　］。',
          fields: [{ k: 'w', type: 'text', label: '［1］隠された言葉（ひらがな）', ph: 'ひらがなで' }],
          fact: '野々香のノート（2008.1.13）。表で読めるのは「わたしがおした」（おとり）、0-1の決まりで帰りに裏で読むと「わたしじゃない」。押したのは野々香ではなかった',
          hint: [
            'このます目、どこかで見た形と字の数が近い。6-4のシートは何の写し？',
            'シートとます目は、たてと横の数がちがう。重なる向きは1つとはかぎらない。どちらの向きでも、穴は7つ全部ます目に入る。',
            '読めた言葉が、そのまま本当とはかぎらない。0-1の手紙は、どう読む決まりだった？'],
          miss: [
            { eq: { w: ['わたしがおした'] }, msg: 'お母さんの日記にも、同じ言葉。……それは、どの向きで読んだ言葉？ 0-1の手紙の決まりは、それで全部？' },
            { eq: { w: ['いなゃじしたわ'] }, msg: '裏にはした。順番は？' },
            { eq: { w: ['たしおがしたわ'] }, msg: '順番は変えた。……向きは？' },
            { test: (c) => /^[わたしじゃないがお]{7}$/.test(c.w), msg: '7文字はそろってる？ 0-1の手紙の決まりどおりに、もう一度。' },
            { test: (c) => c.w.length === 7 && !/^[わたしじゃないがお]{7}$/.test(c.w), msg: '意味のある言葉になった？ シートの向きと、裏表を考えて。' },
            { test: (c) => /^[a-z]+$/.test(c.w), msg: 'ひらがなで入れてみて。' }],
          fb: 'まだ合っていない。0-1の手紙の穴と、うらの字、手紙の本文を思い出して。' },
      ],
    },
    {
      id: 7, label: '大謎 十九年目のネガ', objective: 'ネガを正しく見て、19年前に誰が押したのかを決める', docs: ['7-1', '7-2'], mins: 18, final: true,
      puzzles: [
        { id: '7M', kind: 'mid', name: '十九年目のネガ', final: true,
          q: '19年前、平磯の岩場で父を押したのは［　］。そう決められる、ネガの中のしるしは［　］。',
          fields: [
            { k: 'push', type: 'text', canon: 'person', label: '［1］父を押した人', ph: '名前' },
            { k: 'sign', type: 'text', canon: 'kw', label: '［2］決め手のしるし', ph: '短く',
              kw: [['size', ['腰', '背', '身長', '大きさ', '足跡', '19', '体格', '小さ', '大き', 'サイズ', '高さ', '背たけ', '背丈']], ['hat', ['帽子', 'ぼうし', 'ポンポン', 'ぽんぽん', 'ニット帽', '毛糸']], ['scarf', ['マフラー', 'まふらー']], ['color', ['色', '赤', '黄']], ['basket', ['カゴ', 'かご']]] }],
          fact: '押したのは8歳の莉々香。全員が莉々香を守っていた',
          hint: [
            'ネガは、向き・裏表・明るさが全部ちがう。写し込みがまっすぐ読める向きに。',
            'これは白黒フィルム。色では誰か決められない。大きさで比べるなら、カメラから「同じ距離」にいる人どうしで。',
            '森山さんの机には、ネガのほかに2つの物がある。19年前、森山さんは何と何を比べた？'],
          miss: [
            { test: (c) => c.push === 'nonoka' && c.sign === 'scarf', msg: 'マフラーの子は、どこにいる？ その子は、押せる場所にいる？' },
            { test: (c) => ['color'].includes(c.sign), msg: '白黒のネガで、色は見えない。ネガの中で見えるのは？' },
            { test: (c) => c.push === 'ririka' && c.sign === 'hat', msg: '帽子は、姉妹おそろいの手編み（S1の写真③）。白黒のネガで、どっちの帽子か決められる？ 帽子なら、誰でもかぶれる。' },
            { test: (c) => c.push === 'ririka' && c.sign === 'scarf', msg: 'マフラーは誰でも巻ける。白黒で色も見えない。ネガの中で、かぶったり巻いたりできない「しるし」は？' },
            { test: (c) => c.push === 'nonoka', msg: '手前の子は大きく見える。……でも、カメラに近いだけかも。すぐそばの大人と比べると？' },
            { eq: { push: 'miyuki' }, msg: '手前で倒れているのは誰？ 日記の「気がついたら」。' },
            { eq: { push: 'moriyama' }, msg: '森山さんは、あとで足跡と帽子を見た人。' },],
          fb: 'まだ合っていない。ネガを正しい向きの写真にしてから、7-1の机の上と見比べて。' },
      ],
    },
  );
})();
