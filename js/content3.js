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

  /* S6：野々香のノート（穴あき手紙を重ねる） */
  const NOTE_GRID = ['なりおすい', 'ちてにみま', 'くそるかほ', 'りにきもさ']; // 穴の位置（読む順）→ り り か を ま も る
  function noteBase() {
    const { CELL } = A;
    const gx = 60, gy = 120;
    const NG = NOTE_GRID.map((r) => [...r]);
    // 読む順（S0と同じ穴）：(2,3)(0,1)(3,0)(1,4)(0,3)(2,1)(3,3) に り り か を ま も る を置く
    const want = ['り', 'り', 'か', 'を', 'ま', 'も', 'る'];
    C.TARGETS.forEach(([r, c], i) => { NG[r][c] = want[i]; });
    const cells = NG.map((row, r) => row.map((ch, c) => `<text x="${gx + CELL * (c + 0.5)}" y="${gy + CELL * (r + 0.5) + 11}" text-anchor="middle" class="grid-k note-k">${ch}</text>`).join('')).join('');
    return `
      <rect width="400" height="420" fill="#fdfbf4"/>
      ${Array.from({ length: 14 }, (_, i) => `<line x1="0" y1="${30 + i * 28}" x2="400" y2="${30 + i * 28}" stroke="#c8d7e8" stroke-width="1"/>`).join('')}
      <line x1="40" y1="0" x2="40" y2="420" stroke="#f2a7a7" stroke-width="1.5"/>
      <text x="52" y="52" class="kid">2008.1.13（日）</text>
      <text x="52" y="82" class="kid">きのうのことは、ぜったい言わない。</text>
      <rect x="${gx - 10}" y="${gy - 6}" width="${CELL * 5 + 20}" height="${CELL * 4 + 12}" rx="8" fill="none" stroke="#b33" stroke-width="2" stroke-dasharray="6 4"/>
      ${cells}
      <text x="52" y="${gy + CELL * 4 + 44}" class="kid">おかあさんを、こまらせない。</text>`;
  }
  function grilleSheet() {
    const { CELL } = A;
    const gx = 60, gy = 120, x0 = gx - 10, y0 = gy - 6, w = CELL * 5 + 20, h = CELL * 4 + 12;
    const holes = C.TARGETS.map(([r, c]) => `<circle cx="${gx + CELL * (c + 0.5)}" cy="${gy + CELL * (r + 0.5)}" r="17" fill="#000"/>`).join('');
    const nums = C.TARGETS.map(([r, c], i) => `<circle cx="${gx + CELL * (c + 0.5)}" cy="${gy + CELL * (r + 0.5)}" r="17" fill="none" stroke="#8d6e63" stroke-width="2"/><text x="${gx + CELL * (c + 0.5) + 21}" y="${gy + CELL * (r + 0.5) - 12}" class="hole-no">${i + 1}</text>`).join('');
    return `
      <defs><mask id="gr-m"><rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="#fff"/>${holes}</mask></defs>
      <rect x="${x0}" y="${y0}" width="${w}" height="${h}" rx="6" fill="#e9dcc0" mask="url(#gr-m)"/>
      <rect x="${x0}" y="${y0}" width="${w}" height="${h}" rx="6" fill="none" stroke="#a1887f" stroke-width="2"/>
      ${nums}
      <text x="${x0 + 6}" y="${y0 + h - 8}" class="back-note">0-1の手紙（穴の部分）</text>`;
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
  const NEG_SCENE = `
    <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6b26b"/><stop offset=".6" stop-color="#fbe3b1"/><stop offset="1" stop-color="#cfe2f3"/></linearGradient></defs>
    <rect width="600" height="400" fill="url(#sky)"/>
    <circle cx="540" cy="120" r="34" fill="#ffd966"/>
    <rect y="150" width="600" height="250" fill="#6fa8dc"/>
    <path d="M0 150 Q300 140 600 150" stroke="#9fc5e8" stroke-width="6" fill="none"/>
    <path d="M0 168 L250 158 L250 182 L0 194 Z" fill="#9e9e9e"/><path d="M0 194 L250 182 L250 196 L0 210 Z" fill="#757575"/>
    <g transform="translate(120 158)">
      <rect x="-9" y="-30" width="8" height="30" fill="#263238"/><rect x="2" y="-30" width="8" height="30" fill="#263238"/>
      <rect x="-14" y="-78" width="28" height="50" rx="6" fill="#3d5a80"/>
      <circle cy="-92" r="14" fill="#f1d3b3"/><path d="M-14 -96 Q0 -112 14 -96 Z" fill="#3e2723"/>
      <rect x="-16" y="-80" width="32" height="10" rx="4" fill="#d32f2f"/><rect x="8" y="-76" width="9" height="28" rx="3" fill="#d32f2f"/>
      <path d="M-26 -60 h44 l-7 20 h-30 z" fill="#a1887f" stroke="#6d4c41" stroke-width="2"/></g>
    <path d="M0 400 L0 270 Q90 236 200 252 Q300 262 380 238 Q450 220 500 236 L516 400 Z" fill="#5d4c3f"/>
    <path d="M0 300 Q100 280 220 296 Q320 306 400 286 L500 290 L512 400 H0 Z" fill="#4a3c31"/>
    <g transform="translate(170 270)"><ellipse rx="92" ry="15" fill="#3c3128" opacity=".6"/><circle cx="-66" cy="-14" r="15" fill="#5d4037"/><rect x="-52" y="-26" width="104" height="24" rx="10" fill="#7b1f1f"/><rect x="50" y="-22" width="42" height="12" rx="4" fill="#33691e"/></g>
    <g transform="translate(506 226) rotate(-30)">
      <rect x="-15" y="16" width="13" height="58" fill="#263238"/><rect x="3" y="16" width="13" height="58" fill="#263238"/>
      <rect x="-19" y="-62" width="38" height="80" rx="7" fill="#455a64"/>
      <circle cy="-80" r="17" fill="#f1d3b3"/>
      <path d="M-18 -50 l-30 26 M18 -50 l26 -34" stroke="#455a64" stroke-width="11" stroke-linecap="round"/></g>
    <g transform="translate(436 250)">
      <rect x="-11" y="-6" width="9" height="30" fill="#5d4037"/><rect x="2" y="-6" width="9" height="30" fill="#5d4037"/>
      <rect x="-13" y="-42" width="26" height="38" rx="6" fill="#8d6e63"/>
      <circle cy="-54" r="13" fill="#f1d3b3"/>
      <path d="M-15 -56 Q0 -80 15 -56 Z" fill="#f4c20d"/><circle cy="-76" r="7" fill="#f4c20d"/>
      <path d="M12 -36 l36 -16 M12 -26 l36 -6" stroke="#8d6e63" stroke-width="8" stroke-linecap="round"/></g>
    <path d="M490 310 q20 -10 40 0 t40 0" stroke="#fff" stroke-width="3" fill="none" opacity=".7"/>
    <text x="586" y="388" text-anchor="end" font-family="monospace" font-weight="700" font-size="26" fill="#ff8f00">'08 1 12</text>`;
  function negHTML() {
    return `
<figure class="neg" data-neg="7-2">
  <div class="neg-film"><div class="neg-frame"><svg viewBox="0 0 600 400" class="neg-svg" role="img" aria-label="ネガの1コマ。日の出の岩場。人が4人写っている。ネガのままだと色が反対で、向きも違う。"><g class="neg-g">${NEG_SCENE}</g><g class="neg-labels" aria-hidden="true"><text x="404" y="176" class="cb">黄</text><text x="150" y="80" class="cb">赤</text></g></svg></div></div>
  <div class="ov-tools" role="group" aria-label="ネガの道具">
    <button type="button" class="tool" data-negt="rot" aria-label="ネガを右に90度回す">↻ 回す</button>
    <button type="button" class="tool" data-negt="flip" aria-label="ネガを裏返す">⇋ 裏返す</button>
    <button type="button" class="tool ghost" data-negt="reset">元に戻す</button>
    <span class="ov-state neg-state" aria-live="polite"></span></div>
  <label class="dev-ctl"><span>☀ 現像（ネガ → ポジ）</span><input type="range" min="0" max="100" step="1" value="0" aria-label="現像（ネガからポジへ）"><output class="dev-val">0</output></label>
  <p class="ov-ok" role="status" hidden>日付が正しく読める向き。本当の色。</p>
  <details class="sr-text neg-desc" hidden><summary>写真を文字で読む</summary><p>日の出の直後の平磯の岩場。手前の岩に、女性（母）が向こうを向いて倒れている。右の岩の端で、男性（父）が後ろへ傾いて海へ落ちていく。その前で、小さな子どもが両手を前に突き出している。背は男性の腰くらい。黄色いポンポン帽をかぶっている。奥の堤防の上に、背の高い少女。赤いマフラーで、カゴをかかえて立ちすくんでいる。右下にオレンジの字「'08 1 12」。</p></details>
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
  <details class="sr-text"><summary>写真の違いを文字で</summary><p>明るさを最大まで上げると、22:03の写真の背景紙のすそに、白い紙の袋が見える。袋には「潮見 No.08-03」。22:26の写真の同じ場所には何もない。</p></details>
</article>`,
    },
    '5-2': {
      no: '5-2', stage: 5, icon: '🎞', kind: '台帳', title: '潮見のネガ台帳', short: '2008年1月のページ',
      re: '欠番の08-03は、潮見が19年間金庫に入れていた1本。',
      html: () => `
<article class="doc paper form">
  <header class="form-head"><div class="form-org">潮見写真館（架空）</div><h3>ネガ台帳　2008年（平成20年）</h3></header>
  <p class="pen">表紙の書き込み：「撮った日の順に番号。欠番は作らない」</p>
  <table class="log"><thead><tr><th>No.</th><th>日付</th><th>内容</th></tr></thead><tbody>
    <tr><td>08-01</td><td>1/3</td><td>初日の出・磯崎</td></tr>
    <tr><td>08-02</td><td>1/10</td><td>湊の冬・那珂湊駅（展示パネル）</td></tr>
    <tr><td>08-03</td><td></td><td class="muted">（空欄）</td></tr>
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
    <li><time>1/12</time><b>今朝の平磯。</b>一生に一度の一枚が撮れてしまった。でも、これは誰にも見せられない。</li>
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
  <section><h4>2008年2月20日</h4><p>手紙が来た。お嬢さん――野々香のことだ。払うしかない。</p></section>
  <section><h4>2027年1月14日</h4><p>潮見さんが「刑事になった妹さんに、あの写真を見せる」と。それだけは。</p></section>
</article>`,
    },
    '6-4': {
      no: '6-4', stage: 6, icon: '📓', kind: 'ノート', title: '野々香の2008年のノート', short: '12歳のお姉ちゃんの日記',
      re: '「りりかをまもる」。12歳の野々香は、あの日から妹を守ると決めていた。守っていたのは、妹の罪と、妹の記憶。',
      html: () => `
<article class="doc paper">
  <div class="sticky">お姉ちゃんが小学生のころのノート。なぜか私の机に、ずっとあった。</div>
  ${A.overlay('6-4s', { w: 400, h: 420, base: noteBase(), sheet: grilleSheet(), init: { x: 30, y: 168, r: 0, f: 0 }, snap: { x: 0, y: 0, r: 0, f: 0, tol: 22 }, pivot: [200, 210],
    label: '0-1の穴あき手紙（穴の部分）', alt: '野々香のノートのページ。1行目「2008.1.13（日）」、2行目「きのうのことは、ぜったい だれにも 言わない。」その下に、赤い点線で囲んだひらがなのます目（5文字×4行）。最後の行「おかあさんを、こまらせない。」その上に、0-1の手紙の穴の部分が少しずれて重なっている。',
    okmsg: 'ピタッ。穴が、ます目に重なった。',
    cap: 'ノートのページ（下）と、0-1の手紙の穴（上）' })}
  <details class="sr-text"><summary>ます目を文字で読む</summary><p>1行目 ${noteRows()[0]}、2行目 ${noteRows()[1]}、3行目 ${noteRows()[2]}、4行目 ${noteRows()[3]}。0-1の手紙の穴は、数字の順に、3行目の4文字目、1行目の2文字目、4行目の1文字目、2行目の5文字目、1行目の4文字目、3行目の2文字目、4行目の4文字目に重なる。</p></details>
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
      re: 'ネガのままだと、黄色い帽子は青く、赤いマフラーは水色に見える。莉々香は、自分を見ていた。',
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
    ],
    's5.5A': [
      { t: 'ネガ袋……。私が撮った22:03にはあって、鑑識さんの22:26にはない。' },
      { t: 'ネガの台帳と、潮見さんのブログも送る。08-03が何なのか知りたい。', doc: '5-2' },
    ],
    's5.5B': [
      { t: '2008年1月12日。平磯。……お父さんが死んだ日の、朝。' },
    ],
    's5.5M': [
      { t: '森山さん……。' },
      { t: '「撮るな」って言ったのは、これを写させないため。そのあと、1人で入った7分間に。' },
      { t: '追伸に書いたこと、覚えてる？ 「なんで私を相棒に選んだんだろう」。……答え、知るのが怖い。' },
      { who: 'beat', t: '9:40。森山は、莉々香の問いに「お前には関係ない」とだけ言った。' },
      { t: '関係ないわけ、ない。お母さんが払ってたお金と、19年前の写真。つながってる。' },
    ],
    's6.start': [
      { who: 'beat', t: '1月17日（日）10:00。風見家。誰もいない母の部屋。' },
      { t: '潮見さんの帳簿。2008年3月から、毎月15日に「K」から10万円。', doc: '6-1' },
      { t: 'お母さんの引き出しから、手紙と日記。', doc: '6-2' },
      { t: '加工場のかまどからは、写真の燃え残り。', doc: '6-5' },
      { t: 'それと、お姉ちゃんが小学生のころのノート。なぜか、ずっと私の机にあったやつ。', doc: '6-4' },
    ],
    's6.6A': [
      { t: 'お母さんが燃やしたのは、2008年1月12日の写真。……あの夜、0:31の電話のパチパチは、これだったんだ。' },
    ],
    's6.6B': [
      { t: 'りりかを、まもる。' },
      { t: 'お姉ちゃん、12歳で、これを書いたんだ。「きのうのことは、ぜったい言わない」の次の日に。' },
    ],
    's6.6M': [
      { t: 'お母さんは、お姉ちゃんが押したと信じてた。だから19年、払い続けた。お姉ちゃんを守るために。' },
      { t: 'でも、お母さんは見てない。「気がついたら」って書いてある。' },
      { t: 'お姉ちゃんが「わたしが押した」って言って、お母さんはそれを信じた。……そしてお姉ちゃんは、「りりかをまもる」。' },
      { who: 'beat', t: '23:50。署。誰もいない刑事課。' },
      { t: '森山さんの机の奥に、うちの名前の封筒があった。中に、ネガと……黄色い帽子。', doc: '7-1' },
      { t: 'ネガも見て。押してるの、お姉ちゃんだよね？ ネガだから色が逆なだけで、きっと赤いマフラーで――', doc: '7-2' },
    ],
    's7.7M': [
      { t: '……黄色。' },
      { t: '押してるのは、黄色い帽子の、小さい子。お姉ちゃんは、奥の堤防の上。カゴを抱えて、立ってる。' },
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
    's8.yellow': [
      { t: '……ねえ。S6で、あなたは一度「莉々香」って入れたよね。最初から、あなたには見えてたんだね。' },
    ],
  });

  C.STAGES.push(
    {
      id: 5, label: 'S5 消えたネガ', objective: '現場から消えた物と、消した人', docs: ['5-1', '5-2', '5-3'], mins: 18,
      puzzles: [
        { id: '5A', kind: 'small', step: '①', name: '暗い写真',
          q: '22:03の写真にはあって、22:26の鑑識写真にはない物は？ そこに書いてある番号は？',
          fields: [
            { k: 'obj', type: 'chip', label: '［1］消えた物', opts: [['sleeve', 'ネガ袋'], ['wallet', '財布'], ['sand', '砂袋の重り'], ['letter', '手紙']] },
            { k: 'no', type: 'text', canon: 'digits', label: '［2］番号', ph: '例：12-34' }],
          fact: '22:03にあったネガ袋「No.08-03」が、22:26には消えていた',
          hint: [
            '1-3の付箋「暗くてごめん」。5-1で明るさ（現像）を上げて、22:26の写真と同じ場所を見比べよう。',
            'スライダーを右いっぱいまで。背景紙のすそ（右下のほう）に白い袋が出てくる。22:26の写真の同じ場所には何もない。拡大すると番号が読める。'],
          miss: [
            { eq: { obj: 'sand' }, msg: '砂袋の重りは、どちらの写真にも写っている。' },
            { okf: ['obj'], msg: '物は合ってる。拡大して、番号を読んで。' },
            { okf: ['no'], msg: '番号は合ってる。それが書いてある物は？' }],
          fb: '明るさを上げて、2枚を見比べて。' },
        { id: '5B', kind: 'small', step: '②', name: '欠番',
          q: 'ネガ08-03は、いつ、どこで撮られた？',
          fields: [
            { k: 'date', type: 'date', label: '［1］撮った日', ph: '例：2008年1月1日' },
            { k: 'place', type: 'text', canon: 'station', label: '［2］撮った場所', ph: '地名' }],
          fact: '08-03は2008年1月12日の朝、平磯で撮られた',
          hint: [
            '台帳は「撮った日の順に番号。欠番は作らない」。08-02と08-04の日付のあいだに入る日は？',
            '1/10と1/14のあいだ。ブログの記事一覧で、その間の日にある記事は1つだけ。'],
          miss: [
            { eq: { date: '2008-1-14' }, msg: 'それは08-04の日。08-03は、その前。' },
            { eq: { date: '2008-1-10' }, msg: 'それは08-02（展示パネル）の日。' },
            { test: (c) => /^\?/.test(c.date), msg: '年も入れてね（例：2008年1月1日）。' },
            { okf: ['date'], msg: '日は合ってる。その日の記事に、場所が書いてある。' },
            { okf: ['place'], msg: '場所は合ってる。日付をもう一度。' }],
          fb: '台帳の08-02と08-04のあいだ。ブログと並べてみて。' },
        { id: '5M', kind: 'mid', step: '★', name: '7分間',
          q: 'ネガ袋を持ち去れたのは［　］。その人が「撮るな」と言ったのは［　］。2008年1月12日は［　］。',
          fields: [
            { k: 'who', type: 'chip', label: '［1］持ち去れた人', opts: [['mori', '森山浩行'], ['kanshiki', '鑑識'], ['patrol', '湊交番の巡査'], ['nono', '風見野々香']] },
            { k: 'why', type: 'chip', label: '［2］「撮るな」の理由', opts: [['hide', 'ネガ袋が写るのを防ぐため'], ['rule', '新人は撮影しない決まり'], ['dark', '写真が暗すぎたから'], ['rest', '莉々香を休ませるため']] },
            { k: 'day', type: 'chip', label: '［3］2008年1月12日は', opts: [['dad', '父が亡くなった日'], ['birth', '野々香の誕生日'], ['open', '写真館の開店日'], ['shichi', '莉々香の七五三']] }],
          fact: 'ネガ袋を持ち去れたのは森山（22:04〜22:11）。08-03は父の命日の朝の写真',
          hint: [
            '1-1の入退室記録で、22:03から22:26のあいだに中へ入った人は？ 野々香さんと巡査がどこにいたかも1-1に。',
            '22:04〜22:11、森山さんが1人で入室。1-3の付箋「このあと森山さんに『撮るな』」。1月12日はS0で莉々香が言った日。'],
          miss: [
            { eq: { who: 'kanshiki' }, msg: '鑑識の22:26の写真は、入室する前に入口から撮ったもの。もうなかった。' },
            { eq: { who: 'patrol' }, msg: '巡査は21:58に退室している。22:03にはまだ袋があった。' },
            { eq: { who: 'nono' }, msg: '野々香さんは21:50からパトカー、22:15に署へ。' },
            { eq: { day: ['birth', 'open', 'shichi'] }, msg: 'S0の最後に、莉々香がその日のことを話していたよ。' }],
          fb: '1-1の入退室記録と、1-3の付箋を読み直して。' },
      ],
    },
    {
      id: 6, label: 'S6 母が信じていたこと', objective: '母が19年払い続けた理由', docs: ['6-1', '6-2', '6-3', '6-4', '6-5'], mins: 20,
      puzzles: [
        { id: '6A', kind: 'small', step: '①', name: '燃え残り',
          q: 'かまどで燃やされた写真の写し込みの日付は？ 燃やしたのは誰？',
          fields: [
            { k: 'date', type: 'date', label: '［1］写し込みの日付', ph: '例：2008年1月1日' },
            { k: 'who', type: 'chip', label: '［2］燃やした人', opts: [['mom', '風見みゆき'], ['nono', '風見野々香'], ['shiomi', '潮見達郎'], ['mori', '森山浩行']] }],
          fact: '母は事件の夜、2008年1月12日の写真をかまどで燃やした',
          hint: [
            'かけらは回せるし、入れかえられる。破れ目と、海の線・岩の線がつながるように。オレンジの字は1-4と同じ「写し込み」。',
            '正しくつなぐと右下に「\'08 1 12」（\'年 月 日）。かまどは風見家の加工場。野々香さんはその夜、署にいた（1-1）。S1で莉々香が電話したとき、何の音がした？'],
          miss: [
            { eq: { who: 'nono' }, msg: '野々香さんは、その夜ずっと署にいた（1-1）。' },
            { eq: { who: ['shiomi', 'mori'] }, msg: 'かまどは風見家の加工場。0:31の電話の向こうの音を思い出して。' },
            { test: (c) => /^\?/.test(c.date), msg: '年も入れてね。写し込みの最初の数字が年。' },
            { okf: ['who'], msg: '人は合ってる。日付は、かけらをつないで読んで。' }],
          fb: 'かけらを回して、つないでみて。' },
        { id: '6B', kind: 'small', step: '②', name: 'もう一度、穴あき手紙',
          q: '野々香さんのノートに隠された言葉は？',
          fields: [{ k: 'w', type: 'text', label: '隠された言葉（ひらがな）', ph: '例：やまへいく' }],
          fact: 'ノートに隠された言葉は「りりかをまもる」',
          hint: [
            'このます目、どこかで見たことない？ 穴あき手紙を作ったのは、お姉ちゃん。',
            '0-1の手紙の穴の部分を、ノートのます目に重ねる（シートを動かす）。穴のそばの数字の順に読む。'],
          miss: [
            { test: (c) => c.w.startsWith('りりか') && c.w.length < 7, msg: 'あと少し。7つの穴、全部読んだ？' }],
          fb: '0-1の手紙の穴を、ます目にぴったり重ねて。数字の順に。' },
        { id: '6M', kind: 'mid', step: '★', name: '母が信じていたこと',
          q: 'みゆきさんは、夫を押したのは［　］だと信じていた。みゆきさんは押すところを［　］。その朝、莉々香は［　］ことになっていた。',
          fields: [
            { k: 'who', type: 'chip', label: '［1］みゆきさんが信じていた人', opts: [['nono', '野々香'], ['riri', '莉々香'], ['self', 'みゆき自身'], ['shiomi', '潮見']] },
            { k: 'saw', type: 'chip', label: '［2］押すところを', opts: [['yes', '見た'], ['no', '見ていない']] },
            { k: 'riri', type: 'chip', label: '［3］莉々香は', opts: [['home', '家で寝ていた'], ['rock', '岩場にいた'], ['wall', '堤防にいた'], ['school', '学校にいた']] }],
          fact: '母は野々香が押したと信じていた。でも母は見ていない。莉々香は「家で寝ていた」ことになっていた',
          hint: [
            '6-2の手紙は「お嬢さん」としか書いていない。6-3の日記の2008年1月12日と2月20日を読もう。',
            '「気がついたら」＝殴られて気を失っていた。野々香さんが「わたしが押した」と言った。「莉々香は家で寝ていた。それでいい」――ここは、みゆきさんが信じた（決めた）こと。'],
          miss: [
            { eq: { who: 'riri' }, flag: 'yellow', msg: 'それは、みゆきさんが「信じていた」こと？ 日記と手紙を読み直して。……でも、その名前、覚えておいて。' },
            { eq: { saw: 'yes' }, msg: '日記の「気がついたら」。その前、みゆきさんはどうなっていた？' },
            { eq: { riri: ['rock', 'wall'] }, msg: 'いまの問いは、「ことになっていた」こと。日記と、S0の莉々香の話では？' }],
          fb: '6-2の「お嬢さん」と、6-3の日記を並べてみて。' },
      ],
    },
    {
      id: 7, label: '大謎 十九年目のネガ', objective: 'ネガを正しく見て、誰が誰を守ったのかを書く', docs: ['7-1', '7-2'], mins: 15, final: true,
      puzzles: [
        { id: '7M', kind: 'mid', step: '★', name: '十九年目のネガ',
          q: '19年前、父を押したのは［　］。「わたしが押した」と嘘をついたのは［　］。その嘘を信じて潮見さんを殺したのは［　］。19年前から気づいていて、証拠を隠したのは［　］。',
          fields: [
            { k: 'push', type: 'chip', label: '［1］父を押した', opts: [['riri', '風見莉々香'], ['nono', '風見野々香'], ['mom', '風見みゆき'], ['mori', '森山浩行']] },
            { k: 'lie', type: 'chip', label: '［2］嘘をついた', opts: [['riri', '風見莉々香'], ['nono', '風見野々香'], ['mom', '風見みゆき'], ['mori', '森山浩行']] },
            { k: 'kill', type: 'chip', label: '［3］潮見さんを殺した', opts: [['riri', '風見莉々香'], ['nono', '風見野々香'], ['mom', '風見みゆき'], ['mori', '森山浩行']] },
            { k: 'hid', type: 'chip', label: '［4］気づいて隠した', opts: [['riri', '風見莉々香'], ['nono', '風見野々香'], ['mom', '風見みゆき'], ['mori', '森山浩行']] }],
          fact: '押したのは8歳の莉々香。全員が莉々香を守っていた',
          hint: [
            'ネガは、そのままだと向きも裏表も色も違う。S1で覚えた道具を全部。オレンジの写し込み（1-4・6-5）が正しく読める向きにして、現像する。',
            '本当の色にすると、両手を突き出している小さな子の帽子は何色？ 机の上の帽子、1-2③の展示パネルと比べて。森山のメモ「足跡19／長女23」も、色を使わずに同じことを示している。'],
          miss: [
            { eq: { push: 'nono' }, msg: '赤いマフラーの子は、どこにいる？ ネガを本当の色・本当の向きにしてから、もう一度。' },
            { eq: { push: 'mom' }, msg: '手前で倒れているのは誰？ 日記の「気がついたら」。' }],
          fb: 'ネガを正しく見てから、4つをそろえて。' },
      ],
    },
  );
})();
