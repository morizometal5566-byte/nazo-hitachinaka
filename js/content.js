/* 十九年目のネガ — 完全版：共通の絵と S0・S1
   文章・資料・謎・ヒント・伏線は case_bible_final.md と puzzle_design_final.md に従う。
   人物・店・事件・警察署名はすべて架空（実在の地名・駅・公共の場所は背景としてだけ使う）。 */
(function () {
  'use strict';

  const PH = '';
  let uid = 0;

  /* ---------- 0-1 穴あき手紙：上＝手紙（穴7つ）／点線／下＝あんごう表＋手描き地図 ---------- */
  const W = 400, F = 640, TOT = 1460, CELL = 56, GX = 60, GY = F + 40, MAPY = 930;
  const GRID = ['さみのたこ', 'ねかすろふ', 'ゆえらうま', 'へちそきる'];
  const TARGETS = [[2, 3], [0, 1], [3, 0], [1, 4], [0, 3], [2, 1], [3, 3]]; // 読む順 1〜7 → う み へ ふ た え き
  const cx = (c) => GX + CELL * (c + 0.5), cy = (r) => GY + CELL * (r + 0.5);

  // 地図（ローカル座標 400×520）。文字は小さくしない（スマホ幅でそのまま読める大きさ）
  function mapInner() {
    const st = (x, y, name, yomi, lx, ly, o) => `<g class="st${o && o.main ? ' main' : ''}"><circle cx="${x}" cy="${y}" r="${o && o.main ? 10 : 7}"/><text x="${lx}" y="${ly}" class="st-n"${o && o.end ? ' text-anchor="end"' : ''}>${name}</text><text x="${lx}" y="${ly + 17}" class="st-y"${o && o.end ? ' text-anchor="end"' : ''}>${yomi}</text></g>`;
    return `
  <rect width="400" height="520" fill="#fbf7ec"/>
  <path d="M322 0 C 312 80, 340 150, 326 230 C 316 300, 346 350, 330 430 L330 520 L400 520 L400 0 Z" fill="#cfe3ef"/>
  <text x="352" y="120" class="sea">海</text>
  <g class="compass" transform="translate(372 40)"><circle r="17" fill="#fffdf6" stroke="#7a6f58" stroke-width="1.5"/><path d="M0 -13 L6 6 L0 2 L-6 6 Z" fill="#b3261e"/><text y="-19" text-anchor="middle" class="lg" font-weight="700">N</text></g>
  <path d="M0 452 C 90 440, 170 470, 250 452 C 290 444, 310 450, 330 446" stroke="#9cc3db" stroke-width="18" fill="none" stroke-linecap="round"/>
  <text x="18" y="440" class="hand blue">那珂川</text>
  <path d="M30 30 L60 110 L85 210 L120 330 L200 360 L270 320 L290 252 L298 150 L305 60" stroke="#2c2c2c" stroke-width="5" fill="none" stroke-linejoin="round"/>
  <text x="40" y="26" class="st-n">↖ 勝田へ</text>
  ${st(60, 110, '中根', 'なかね', 76, 114)}
  ${st(85, 210, '高田の鉄橋', 'たかだのてっきょう', 101, 214)}
  ${st(120, 330, '那珂湊', 'なかみなと', 106, 298, { main: true, end: true })}
  ${st(200, 360, '殿山', 'とのやま', 214, 392)}
  ${st(270, 320, '平磯', 'ひらいそ', 258, 300, { end: true })}
  ${st(290, 252, '美乃浜学園', 'みのはまがくえん', 278, 258, { end: true })}
  ${st(298, 150, '磯崎', 'いそざき', 286, 150, { end: true })}
  ${st(305, 60, '阿字ヶ浦', 'あじがうら', 293, 64, { end: true })}
  <g><text x="96" y="370" class="star">★</text><text x="20" y="392" class="hand red">写真館</text></g>
  <g><rect x="132" y="398" width="70" height="26" rx="5" fill="#d9ead3" stroke="#6a8f5f"/><text x="138" y="417" class="small">湊公園</text></g>
  <g class="house"><path d="M300 344 l13 -11 l13 11 v15 h-26z" fill="#fff" stroke="#b3261e" stroke-width="2.5"/><text x="296" y="380" class="hand red" text-anchor="end">うち</text></g>
  <g class="cam"><rect x="344" y="282" width="30" height="21" rx="4" fill="#fff" stroke="#3b6c8a" stroke-width="2.5"/><circle cx="359" cy="292.5" r="6" fill="none" stroke="#3b6c8a" stroke-width="2.5"/><rect x="349" y="278" width="9" height="5" fill="#3b6c8a"/><text x="359" y="325" class="small blue" text-anchor="middle">日の出</text></g>
  <g class="legend"><rect x="8" y="470" width="384" height="44" rx="6" fill="#fffdf6" stroke="#c9bfa6"/>
    <text x="18" y="489" class="lg">★＝写真館　<tspan fill="#b3261e">⌂</tspan>＝うち</text>
    <rect x="18" y="496" width="16" height="11" rx="2" fill="#fff" stroke="#3b6c8a" stroke-width="2"/><text x="40" y="507" class="lg">＝潮見さんの日の出ポイント（莉々香メモ）</text></g>`;
  }

  function letterSVG() {
    const id = 'lt' + (++uid);
    const cells = [];
    GRID.forEach((row, r) => [...row].forEach((ch, c) => cells.push(`<text x="${cx(c)}" y="${cy(r) + 11}" text-anchor="middle" class="grid-k">${ch}</text>`)));
    const front = TARGETS.map(([r, c]) => `<circle cx="${cx(c)}" cy="${2 * F - cy(r)}" r="15" class="hole"/>`).join('');
    const mask = TARGETS.map(([r, c]) => `<circle cx="${cx(c)}" cy="${cy(r)}" r="17" fill="#000"/>`).join('');
    const rim = TARGETS.map(([r, c], i) => `<circle cx="${cx(c)}" cy="${cy(r)}" r="17" class="hole-rim"/><text x="${cx(c) + 21}" y="${cy(r) - 12}" class="hole-no">${i + 1}</text>`).join('');
    const lines = ['あなたへ', '捜査から外されました。', 'お姉ちゃんが疑われてる。', '森山さんには内緒で、', '資料を送ります。', 'ロックは、お姉ちゃんが', '昔作ってくれた穴あき手紙。', 'スタートは、写真館に', 'いちばん近い駅。'];
    const text = lines.map((t, i) => `<text x="28" y="${44 + i * 31}">${t}</text>`).join('') +
      `<text x="372" y="${44 + 9 * 31}" text-anchor="end" class="sign">――風見莉々香</text>` +
      `<text x="28" y="${44 + 10 * 31 + 4}" class="ps">追伸　森山さん、なんで私を</text><text x="28" y="${44 + 11 * 31 + 4}" class="ps">相棒に選んだんだろう。</text>`;
    return `
<svg viewBox="0 0 ${W} ${TOT}" data-vb-full="0 0 ${W} ${TOT}" data-vb-folded="0 ${F - 10} ${W} 285" class="svg-letter" role="img" aria-labelledby="${id}-t">
  <title id="${id}-t">莉々香の手紙。上が手紙で、下のほうに小さな穴が7つ空いている。真ん中に赤い点線。点線の下は「あんごう表」（ひらがな5文字×4行。1行目 さみのたこ、2行目 ねかすろふ、3行目 ゆえらうま、4行目 へちそきる）と、手描きの地図。</title>
  <defs><mask id="${id}-m"><rect x="0" y="${F}" width="${W}" height="${F}" fill="#fff"/>${mask}</mask></defs>
  <rect width="${W}" height="${TOT}" class="desk"/>
  <g class="bottom">
    <rect x="0" y="${F}" width="${W}" height="${TOT - F}" fill="#fbf7ec"/>
    <rect x="${GX - 10}" y="${GY - 6}" width="${CELL * 5 + 20}" height="${CELL * 4 + 12}" rx="8" fill="#fffdf6" stroke="#b33" stroke-width="2" stroke-dasharray="6 4"/>
    <text x="${GX - 6}" y="${GY - 14}" class="grid-cap">あんごう表</text>
    ${cells.join('')}
    <g transform="translate(0 ${MAPY})" class="svg-map">${mapInner()}</g>
  </g>
  <g class="flap" style="transform-origin:200px ${F}px">
    <rect x="0" y="0" width="${W}" height="${F}" fill="#fffdf7"/>
    <g class="letter-text">${text}</g>
    ${front}
  </g>
  <g class="back" style="transform-origin:200px ${F}px">
    <rect x="0" y="${F}" width="${W}" height="${F}" fill="#efe6d1" mask="url(#${id}-m)"/>
    ${rim}
    <text x="200" y="${F + 26}" text-anchor="middle" class="back-note">（手紙のうら。穴のそばに、えんぴつの数字）</text>
  </g>
  <g class="foldline" aria-hidden="true">
    <line x1="8" y1="${F}" x2="392" y2="${F}" stroke="#b33" stroke-width="2.5" stroke-dasharray="11 7"/>
    <text x="200" y="${F - 8}" text-anchor="middle" class="fold-cap">✂ - - - - - - - - - ✂</text>
  </g>
</svg>`;
  }

  /* ---------- 写真（SVG） ---------- */
  function studioScene(o) {
    const d = o.dark;
    const sleeve = o.sleeve ? `<g class="dev-reveal" aria-hidden="true"><polygon points="292,352 344,344 349,368 297,376" fill="#f4efe2" stroke="#9a9384" stroke-width="1"/><text x="300" y="365" font-size="9" fill="#5d4037" font-family="sans-serif" font-weight="700" transform="rotate(-8 320 360)">潮見 No.08-03</text></g>` : '';
    return `
<svg viewBox="0 0 600 400" class="svg-photo" role="img" aria-label="${o.alt}">
  <rect width="600" height="400" fill="${d ? '#3a3d42' : '#d9d4c9'}"/>
  <rect y="290" width="600" height="110" fill="${d ? '#2b2c2f' : '#a89f8d'}"/>
  <rect x="150" y="20" width="300" height="14" fill="${d ? '#55595e' : '#9aa5ab'}"/>
  <path d="M160 34 H440 V330 C 400 350, 200 350, 160 330 Z" fill="${d ? '#6d7177' : '#eef0f1'}"/>
  ${sleeve}
  <g stroke="${d ? '#888' : '#333'}" stroke-width="3"><line x1="80" y1="90" x2="80" y2="320"/><line x1="80" y1="320" x2="55" y2="345"/><line x1="80" y1="320" x2="105" y2="345"/></g>
  <rect x="60" y="70" width="40" height="28" fill="${d ? '#777' : '#444'}"/>
  <rect x="126" y="356" width="34" height="18" rx="7" fill="${d ? '#6b5f50' : '#8a7356'}" transform="rotate(-18 143 365)"/>
  <g stroke="${d ? '#777' : '#555'}" stroke-width="2.5"><line x1="462" y1="120" x2="462" y2="300"/><line x1="462" y1="300" x2="440" y2="322"/><line x1="462" y1="300" x2="484" y2="322"/></g>
  <rect x="448" y="104" width="30" height="20" fill="${d ? '#666' : '#555'}"/>
  <rect x="448" y="316" width="30" height="14" rx="6" fill="${d ? '#6b5f50' : '#8a7356'}"/>
  <rect x="500" y="80" width="70" height="250" fill="${d ? '#4e4540' : '#8d6e63'}"/>
  <g fill="${d ? '#5d534d' : '#a1887f'}"><rect x="505" y="110" width="60" height="6"/><rect x="505" y="170" width="60" height="6"/><rect x="505" y="230" width="60" height="6"/></g>
  <g fill="none" stroke="${d ? '#bbb' : '#fff'}" stroke-width="3" stroke-dasharray="7 5">
    <ellipse cx="400" cy="352" rx="20" ry="13"/>
    <path d="M380 352 L260 360 M380 346 L290 330 M380 360 L300 385 M270 360 L230 352 M270 362 L230 372"/>
  </g>
  ${o.markers ? `<g font-family="sans-serif" font-size="12" font-weight="700"><polygon points="520,382 536,382 528,366" fill="#f6c343"/><text x="524" y="380">1</text></g>` : ''}
  ${d ? '<rect class="dark-veil" width="600" height="400" fill="#000" fill-opacity=".38"/>' : ''}
</svg>`;
  }

  // 数字のない文字盤＋店名（12時の側に店名）。h,m：針の時刻
  function clockFace(h, m, r) {
    const ticks = Array.from({ length: 12 }, (_, i) => `<line x1="0" y1="${-r * 0.9}" x2="0" y2="${-r * 0.76}" stroke="#222" stroke-width="${r * (i % 3 ? 0.035 : 0.06)}" transform="rotate(${i * 30})"/>`).join('');
    return `
    <circle r="${r * 1.13}" fill="#5d4037"/><circle r="${r}" fill="#fbfaf6"/>
    ${ticks}
    <text y="${-r * 0.42}" text-anchor="middle" font-size="${r * 0.2}" font-family="'Noto Serif CJK JP',serif" fill="#3e2723" font-weight="700">潮見写真館</text>
    <text y="${-r * 0.26}" text-anchor="middle" font-size="${r * 0.085}" font-family="serif" fill="#6d4c41" letter-spacing="1">SINCE 1953</text>
    <line x1="0" y1="${r * 0.1}" x2="0" y2="${-r * 0.5}" stroke="#111" stroke-width="${r * 0.075}" stroke-linecap="round" transform="rotate(${(h % 12 + m / 60) * 30})"/>
    <line x1="0" y1="${r * 0.14}" x2="0" y2="${-r * 0.84}" stroke="#111" stroke-width="${r * 0.04}" stroke-linecap="round" transform="rotate(${m * 6})"/>
    <circle r="${r * 0.05}" fill="#111"/>`;
  }

  const FLOOR_CLOCK_SVG = `
<svg viewBox="0 0 400 400" class="svg-photo sq" role="img" aria-label="床に落ちた壁掛け時計を真上から撮った写真。文字盤に数字はなく、店名「潮見写真館」の文字だけが入っている。写真の向きのまま見ると、店名は逆さまで、短い針は3のすこし先、長い針は8のあたりにある。そばに外れた電池と、鑑識の番号札「2」（写真の向きに合わせてまっすぐ置かれている）、物差し。">
  <rect width="400" height="400" fill="#9c9384"/>
  ${Array.from({ length: 7 }, (_, i) => `<line x1="0" y1="${i * 64 + 20}" x2="400" y2="${i * 64 + 20}" stroke="#8a8172" stroke-width="2"/>`).join('')}
  <g transform="translate(200 192) rotate(176)">${clockFace(9, 10, 124)}</g>
  <rect x="300" y="322" width="56" height="16" rx="7" fill="#c9c9c9" stroke="#666" transform="rotate(20 328 330)"/>
  <g font-family="sans-serif" font-size="15" font-weight="700"><polygon points="34,376 60,376 47,350" fill="#f6c343"/><text x="42" y="372">2</text></g>
  <g><rect x="90" y="374" width="200" height="14" fill="#f5f0e1" stroke="#777"/>${Array.from({ length: 11 }, (_, i) => `<line x1="${90 + i * 20}" y1="374" x2="${90 + i * 20}" y2="${i % 5 === 0 ? 384 : 380}" stroke="#555"/>`).join('')}<text x="294" y="386" font-size="10" fill="#333">10cm</text></g>
</svg>`;

  const ALBUM_SVG = `
<svg viewBox="0 0 600 400" class="svg-photo" role="img" aria-label="七五三の記念写真。左に赤い着物の女の子が千歳飴の袋を持って立っている。右側に大きな着付け用の鏡があり、鏡の中には、女の子の後ろ姿と、反対側の壁に掛かった時計が映っている。時計は数字のない文字盤で、店名が入っている。写真の右下にオレンジ色の写し込み「15 10:30」。">
  <rect width="600" height="400" fill="#e9dfcf"/>
  <rect y="310" width="600" height="90" fill="#b9a68b"/>
  <rect x="318" y="34" width="250" height="300" rx="6" fill="#6d4c41"/>
  <rect x="330" y="46" width="226" height="276" fill="#cfd8dc"/>
  <rect x="330" y="46" width="226" height="276" fill="#fff" fill-opacity=".18"/>
  <rect x="330" y="250" width="226" height="72" fill="#a9b5ba"/>
  <g transform="translate(462 122) scale(-1 1)">${clockFace(10, 36, 52)}</g>
  <g opacity=".85"><circle cx="372" cy="200" r="16" fill="#3e2723"/><path d="M354 216 h36 l8 70 h-52 z" fill="#c62828"/><rect x="354" y="240" width="36" height="12" fill="#f9a825"/></g>
  <line x1="330" y1="46" x2="556" y2="322" stroke="#fff" stroke-opacity=".22" stroke-width="10"/>
  <g><circle cx="170" cy="150" r="30" fill="#f1d3b3"/><path d="M140 140 q30 -50 60 0 q-6 -26 -30 -28 q-24 2 -30 28z" fill="#3e2723"/><circle cx="196" cy="128" r="9" fill="#ec407a"/>
  <circle cx="160" cy="152" r="3" fill="#333"/><circle cx="180" cy="152" r="3" fill="#333"/><path d="M162 166 q8 6 16 0" stroke="#c62828" stroke-width="2" fill="none"/>
  <path d="M130 182 h80 l18 140 h-116 z" fill="#c62828"/><rect x="130" y="214" width="80" height="22" fill="#f9a825"/>
  <circle cx="150" cy="270" r="6" fill="#fff" fill-opacity=".7"/><circle cx="190" cy="292" r="6" fill="#fff" fill-opacity=".7"/>
  <rect x="216" y="236" width="20" height="56" fill="#fff" stroke="#c62828"/><text x="226" y="268" font-size="9" text-anchor="middle" fill="#c62828" writing-mode="tb">千歳飴</text></g>
  <text x="582" y="388" text-anchor="end" font-size="20" font-family="monospace" font-weight="700" fill="#ff8f00" opacity=".92">15 10:30</text>
</svg>`;

  const PANEL_SVG = `
<svg viewBox="0 0 600 400" class="svg-photo" role="img" aria-label="スタジオの壁の展示パネル「湊の冬 ― 那珂湊駅にて 2008.1.10」。木造の駅舎の前に姉妹が立っている。背の高い姉は赤いマフラー、小さな妹は黄色いポンポン付きの毛糸の帽子。">
  <rect width="600" height="400" fill="#e7e1d4"/>
  <rect x="90" y="30" width="420" height="330" fill="#3e2723"/>
  <rect x="105" y="45" width="390" height="250" fill="#b0bec5"/>
  <rect x="130" y="120" width="340" height="150" fill="#8d6e63"/><polygon points="120,120 300,70 480,120" fill="#5d4037"/>
  <rect x="270" y="170" width="60" height="100" fill="#4e342e"/>
  <rect x="160" y="150" width="70" height="40" fill="#cfd8dc"/><rect x="370" y="150" width="70" height="40" fill="#cfd8dc"/>
  <g><circle cx="225" cy="190" r="16" fill="#f1d3b3"/><rect x="208" y="206" width="34" height="70" rx="6" fill="#455a64"/><rect x="204" y="204" width="42" height="12" rx="5" fill="#d32f2f"/><rect x="238" y="214" width="8" height="34" fill="#d32f2f"/></g>
  <g><circle cx="290" cy="230" r="13" fill="#f1d3b3"/><path d="M276 228 Q290 205 304 228 Z" fill="#fbc02d"/><circle cx="290" cy="206" r="6" fill="#fbc02d"/><rect x="278" y="243" width="24" height="40" rx="5" fill="#5d4037"/></g>
  <text x="300" y="326" text-anchor="middle" font-size="22" font-family="serif" fill="#f5f5f5">湊の冬 ― 那珂湊駅にて</text>
  <text x="300" y="350" text-anchor="middle" font-size="15" font-family="serif" fill="#d7d7d7">2008.1.10　撮影：潮見達郎</text>
</svg>`;

  // 写真の枠：↻ ⇋ の道具つき（どの写真にも同じ道具を出す。答えの写真にだけ出すとヒントになるため）
  function photo(id, svg, cap, opts) {
    opts = opts || {};
    return `
<figure class="ph" data-ph="${id}">
  ${PH}
  <div class="ph-frame${opts.sq ? ' sq' : ''}"><div class="ph-img">${svg}</div></div>
  <div class="ph-tools" role="group" aria-label="写真の道具">
    <button type="button" class="tool" data-tool="rot" aria-label="写真を右に90度回す">↻ 回す</button>
    <button type="button" class="tool" data-tool="flip" aria-label="写真を左右反転する">⇋ 反転</button>
    <button type="button" class="tool ghost" data-tool="reset" aria-label="写真の向きを元に戻す">元に戻す</button>
    <span class="ph-state" aria-live="polite"></span>
  </div>
  ${cap ? `<figcaption>${cap}</figcaption>` : ''}
</figure>`;
  }

  /* ---------- 資料（1ステージ5枚まで。文章は短く） ----------
     re: クリア後の「読み返し」で出る一言（伏線の回収） */
  const DOCS = {
    '0-1': {
      no: '0-1', stage: 0, icon: '✉', kind: '手紙', title: '莉々香の手紙', short: '穴の空いた手紙と、手描きの地図',
      re: '穴あき手紙は、姉の野々香が妹のために作った遊び。S6で、野々香の2008年のノートを読む鍵になった。パスワードの平磯は、19年前の現場。追伸の答えは――森山は、莉々香をそばで見守るために相棒に選んだ。',
      html: () => `
<article class="doc letter-doc" data-fold-doc="0-1">
  <div class="letter-wrap">${letterSVG()}<div class="fold-handle" role="button" tabindex="0" aria-label="点線で折る" style="top:calc(${(F / TOT * 100).toFixed(2)}% - 28px)"></div><p class="fold-live sr-only" aria-live="polite"></p></div>
  <div class="fold-bar">
    <button type="button" class="tool big" data-act="fold" aria-pressed="false">✂ 点線で折る</button>
    <span class="fold-help">点線を下へスワイプしても折れます</span>
  </div>
  <details class="sr-text"><summary>手紙を文字だけで読む</summary>
  <p>あなたへ。捜査から外されました。お姉ちゃんが疑われてる。森山さんには内緒で、資料を送ります。ロックは、お姉ちゃんが昔作ってくれた穴あき手紙。スタートは、写真館にいちばん近い駅。――風見莉々香</p>
  <p>追伸　森山さん、なんで私を相棒に選んだんだろう。</p>
  <p>穴：手紙の下のほうに7つ。点線で下へ折ると、あんごう表の7つのます目に重なる。手紙のうらには、穴のそばに1〜7の数字。1は3行目の4文字目、2は1行目の2文字目、3は4行目の1文字目、4は2行目の5文字目、5は1行目の4文字目、6は3行目の2文字目、7は4行目の4文字目に重なる。</p>
  <p>地図：右上に方位（Nが上）。湊線は「勝田へ」から、中根・高田の鉄橋・那珂湊・殿山・平磯・美乃浜学園・磯崎・阿字ヶ浦の順。海は地図の右（東）。★（写真館）は那珂湊駅のすぐ下。湊公園は写真館のとなり。うちは平磯駅の近くの海ぞい。カメラの印（潮見さんの日の出ポイント）は平磯の先の海岸。那珂川は地図の下。</p></details>
</article>`,
    },
    '1-1': {
      no: '1-1', stage: 1, icon: '📄', kind: '報告書', title: '初動報告と入退室記録', short: '交番の巡査の報告。時計のメモつき',
      re: '「外傷は見えない」はS2の決め手（傷は床の側）。22:04〜22:11、森山が1人で入った7分間に、ネガ袋が消えた（S5）。',
      html: () => `
<article class="doc paper form">
  <header class="form-head"><div class="form-org">那珂湊中央警察署（架空）</div><h3>初動捜査報告書（抜粋）</h3><div class="form-meta">2027年1月15日　湊交番 巡査</div></header>
  <dl class="kv">
    <dt>場所</dt><dd>潮見写真館（架空）の撮影スタジオ</dd>
    <dt>通報</dt><dd><b>21:41</b> 110番　第一発見者 風見野々香（31）</dd>
    <dt>到着</dt><dd>21:50</dd>
    <dt>所見</dt><dd>店主・潮見達郎（60）が仰向けに倒れ、呼吸なし。<u>外傷は見えない</u>。入口は鍵なし、こじ開けた跡なし。</dd>
    <dt>時計</dt><dd>壁の時計が床に落ちて止まっている。<span class="pen">針は3時40分ごろ？</span></dd>
    <dt>発見者</dt><dd>21:50からパトカー内で待機。22:15、署へ（事情聴取。翌朝まで署にいた）</dd>
  </dl>
  <h4>入退室記録</h4>
  <table class="log"><tbody>
    <tr><td>21:50</td><td>巡査 入室・確認（21:58 退室）</td></tr>
    <tr><td>22:02</td><td>森山浩行・風見莉々香 到着</td></tr>
    <tr><td>22:03</td><td>風見 入口から1枚撮影（入室せず）</td></tr>
    <tr><td>22:04〜22:11</td><td>森山 <b>1人で入室</b></td></tr>
    <tr><td>22:25</td><td>鑑識 到着。22:26 入口から全景を撮影（入室前）</td></tr>
    <tr><td>22:30〜</td><td>鑑識 入室・撮影</td></tr>
    <tr><td>22:40</td><td>風見 捜査から外れる（森山の指示）</td></tr>
  </tbody></table>
</article>`,
    },
    '1-2': {
      no: '1-2', stage: 1, icon: '📷', kind: '写真', title: '鑑識の現場写真（3枚）', short: '全景・床の時計・展示パネル',
      re: '写真①の外れた砂袋が凶器（S4）。写真③の黄色い帽子は、最後のネガと森山の机につながる。2008.1.10は、ネガ台帳の08-02（S5）。',
      html: () => `
<article class="doc paper photos">
  <header class="form-head"><div class="form-org">鑑識係</div><h3>現場写真</h3></header>
  <p class="note-box">ご遺体は白い点線の輪郭だけで表しています。</p>
  ${photo('1-2a', studioScene({ markers: true, alt: '撮影スタジオの全景。奥に白い背景紙が床まで垂れている。左右にライトスタンド。右に棚。床に白い点線で、仰向けのご遺体の輪郭。左のライトスタンドの重りの砂袋が外れて床に転がっている。背景紙のすその床には何もない。' }), '写真①　スタジオ全景（22:26、入口から。入室前）。背景紙のすそには何もない。ライトスタンド2本（左の1本は、重りの砂袋が外れて床にある）。')}
  ${photo('1-2b', FLOOR_CLOCK_SVG, '写真②　床に落ちた壁掛け時計（22:34）。<b>真上から撮影</b>。文字盤に数字はない。落ちたはずみで電池が外れ、止まった。', { sq: true })}
  ${photo('1-2c', PANEL_SVG, '写真③　スタジオの壁の展示パネル（22:40）。')}
</article>`,
    },
    '1-3': {
      no: '1-3', stage: 1, icon: '📱', kind: '写真', title: '莉々香のスマホ写真', short: '22:03、入口から撮った1枚',
      re: '暗い写真の背景紙のすそに、ネガ袋「08-03」が写っていた（S5で現像）。森山の「撮るな」は、これを写させないためだった。',
      html: () => `
<article class="doc paper">
  <div class="sticky">着いたら、まず1枚撮る。新人のくせ。暗くてごめん。（このあと森山さんに「撮るな」って言われた）</div>
  ${photo('1-3a', studioScene({ dark: true, sleeve: true, alt: '入口から撮ったスタジオ全体。とても暗い。奥に背景紙、左右にライトスタンド、右に棚、床にご遺体の輪郭。' }), 'IMG_0347.JPG　2027/01/15　22:03')}
</article>`,
    },
    '1-4': {
      no: '1-4', stage: 1, icon: '📒', kind: 'アルバム', title: '受付の見本アルバム', short: '七五三の見本写真と台紙のメモ',
      re: 'オレンジの写し込みは、潮見のフィルムカメラのくせ。S6の燃え残りでも同じオレンジの字が決め手になった。',
      html: () => `
<article class="doc album">
  <div class="sticky">受付にあった見本アルバム。鑑識さんが、このページを撮ってくれた。</div>
  <div class="album-page">
    ${photo('1-4a', ALBUM_SVG, '')}
    <p class="album-cap">R8.11.15　七五三（フィルム撮影）<br><small>オレンジの字は、カメラが写真に焼きこむ「写し込み」。潮見さんのカメラは、日付（'年 月 日）か、日と時刻（日 時:分）を選べる。潮見さんは、カメラの時計だけは毎朝、時報で合わせていた。</small></p>
  </div>
</article>`,
    },
    '1-5': {
      no: '1-5', stage: 1, icon: '📝', kind: 'メモ', title: '聞き込みと記録', short: '検視・菅谷さん・スマホ・110番',
      re: '「母は関係ないです」は、聞かれる前に母をかばった言葉（S2）。「妹に近づかないで」は、19年間妹を守ってきた姉の言葉。6チャンネルの「9時のニュース」は、母のアリバイを崩した（S3）。',
      html: () => `
<article class="doc notebook">
  <h3>聞き込みと記録 <small>（外される前に聞けた分。莉々香）</small></h3>
  <section><h4>検視（速報）</h4><p>頭を、鈍いもので殴られた（傷の場所は、くわしい図があとで届く）。死亡推定 <b>20:30〜22:00</b>。</p></section>
  <section><h4>菅谷典子さん（向かいの喫茶「みなと珈琲」）</h4>
    <ul><li>「2階で<b>6チャンネルの9時のニュース</b>を見てたの。始まって、まだ<b>最初の話題</b>のうちに、向かいから『ドン』って」</li>
    <li>「9時40分の少し前、野々香ちゃんが店から出てきて、一度、車に戻ったわ」</li>
    <li>「13日のお昼、野々香ちゃんが店で『<b>妹に近づかないで！</b>』って」</li>
    <li>「潮見さんは何でも“ちょっと早め”の人。約束の5分前には、もう待ってるの」</li></ul>
    <p class="aside">※その夜の9時のニュースの最初の話題＝大雪の中継。<b>21:00〜21:06</b>（放送局に確認ずみ）</p></section>
  <section><h4>潮見さんのスマホ</h4>
    <table class="log"><tbody>
    <tr><td>20:57</td><td>大津（元助手）「金払え」<br>→ 20:58 既読</td></tr>
    <tr><td>21:03</td><td>大津「さっきはすみません」<br>→ 未読</td></tr>
    <tr><td>21:12</td><td>野々香「今から写真取りに行きます」<br>→ 未読</td></tr></tbody></table></section>
  <section><h4>110番（21:41）</h4>
    <p class="transcript">「写真館の潮見さんが……倒れてて……<b>誰かに殴られたみたいで</b>……」<br>「母は家にいます。<b>母は関係ないです</b>」</p></section>
</article>`,
    },
  };

  /* ---------- 物語（莉々香のメッセージ＋短い場面転換）  who: 省略＝莉々香、'beat'＝場面の一行 ---------- */
  const CHAT = {
    's0.start': [
      { who: 'beat', t: '1月15日（金）23:48。知らないアドレスから、あなたにファイルが届いた。' },
      { t: '夜中にごめん。あなたが、このファイルを受け取ってくれた人？' },
      { t: '私は風見莉々香。那珂湊中央署の刑事。……まだ3か月の新米だけど。' },
      { t: '今夜、潮見写真館の店主が死んだ。第一発見者は、私のお姉ちゃん。' },
      { t: 'なのに私は捜査から外された。「身内の事件に刑事は入れん」って、森山さんに。' },
      { t: '資料は手紙でロックしてある。お姉ちゃんが昔作ってくれた『穴あき手紙』と同じ仕組み。あなたなら開けられる。', doc: '0-1' },
    ],
    's0.0A': [
      { t: 'そう、それ！ 小学生のころ、お姉ちゃんとこれで秘密の手紙を回してたの。お母さんに見つからないように。' },
      { t: '次は地図。「スタート」から、海へ、ふた駅。' },
    ],
    's0.0M': [
      { t: '開いた……！ ありがとう。' },
      { t: '平磯は、うちの駅。お父さんが死んだ海も、あそこの岩場。私が8歳の冬。' },
      { t: '3日前の1月12日が命日で、お姉ちゃんとお母さんと、平磯の海に花を投げてきたところ。' },
      { t: '私は家で寝てたから、その朝のことは何も覚えてない。……って、お母さんが言ってた。' },
      { t: 'ごめん、関係ない話。現場の資料を送るね。' },
    ],
    's1.start': [
      { who: 'beat', t: '1月16日（土）0:05。莉々香の部屋。' },
      { t: 'いちばん知りたいのは、潮見さんが何時に襲われたか。検視だと8時半から10時。幅がありすぎる。' },
      { t: '現場の時計は床に落ちて止まってた。でも交番の人のメモ、なんか変なの。', doc: '1-1' },
      { t: '写真は「↻ 回す」「⇋ 反転」で動かせる。指2本で拡大もできるよ。', doc: '1-2' },
    ],
    's1.1A': [
      { t: '9時10分……！ 交番の人、番号札につられて逆さまに読んでたんだ。' },
      { t: 'ねえ、写真③の展示パネル見た？ あれ、うちの姉妹なの。赤いマフラーがお姉ちゃん、小さいのが私。お姉ちゃん、今でも冬は赤いマフラー。' },
      { t: '黄色い帽子は、お母さんの手編み。……いつの間にか、なくしちゃったんだよね。' },
      { t: '話を戻すね。あの時計、そもそも合ってたのかな。受付の見本アルバムに、スタジオの写真があったよ。', doc: '1-4' },
    ],
    's1.1B': [
      { t: '6分も進めてたんだ。お客さんが慌てないように、かな。潮見さんらしい。' },
      { who: 'beat', t: '0:31。莉々香は、母に電話をかけた。' },
      { t: 'さっきお母さんに電話したの。私が何も聞いてないのに、「野々香とずっと家にいたよ」って。' },
      { t: '電話の向こうで、かまどがパチパチ鳴ってた。こんな夜中に、干し芋……？' },
      { t: 'とにかく。本当は何時だったのか、ちゃんと確かめたい。菅谷さんの話と、つじつまが合う時刻。', doc: '1-5' },
    ],
    's1.1M': [
      { t: '21時04分。お姉ちゃんが110番したのは、その37分あと……。' },
      { t: '待って。お姉ちゃんの「今から写真取りに行きます」は21:12。潮見さんが襲われた、8分もあと。' },
      { t: 'お姉ちゃん、昔から「莉々香は私がまもる」が口ぐせなの。私もう27なのにね。' },
      { t: '……そんな人が、嘘なんかつかない。つかないよね？' },
      { who: 'beat', t: '1:12。森山から莉々香へ、ひとことだけ届いた。' },
      { t: '森山さんから「寝ろ」だって。外したくせに。帰りぎわ、ぬるい缶コーヒーくれたくせに。' },
    ],
  };

  /* ---------- ステージと謎 ----------
     fields: {k, type: text|time|num|date|chip, label, ph, opts, suffix, half, clock, canon}
     答え（正解）は answers.js にハッシュで入っている。ここには「よくある間違い」への返事（miss）だけを書く。
     miss: [{eq:{k:そろえた値|[...]}, okf:[合っている欄], ngf:[違う欄], test:(c)=>bool, msg}] 上から順に最初に当たったもの */
  const STAGES = [
    {
      id: 0, label: 'S0 穴あき手紙', objective: '莉々香の手紙のロックを開ける', docs: ['0-1'], mins: 8,
      puzzles: [
        { id: '0A', kind: 'small', step: '①', name: '穴あき手紙', needFold: true,
          q: '手紙の穴から見える言葉は？',
          fields: [{ k: 'w', type: 'text', label: '見える言葉（ひらがな）', ph: '例：やまへいく' }],
          fact: '穴から「うみへ ふたえき」（海へ、二駅）',
          hint: [
            '「穴あき手紙」は、穴の空いた紙を、字の書かれた紙に重ねて読む仕組み。この手紙で、重ねられる場所は？',
            '点線で下へ折ると、穴が「あんごう表」に重なる（「✂ 点線で折る」か、点線を下へスワイプ）。穴のそばの数字の順に読もう。左上から順に読むと意味が通らない。'],
          miss: [
            { eq: { w: 'みたふえうへき' }, msg: '左上から順に読んだ？ 穴のそばに、えんぴつの数字があるよ。' },
            { test: (c) => /^[a-z]+$/.test(c.w), msg: 'ひらがなで入れてみて。' },
            { test: (c) => c.w.startsWith('うみへ'), msg: '「うみへ」までは合ってる。続きを数字の順に。' }],
          fb: '手紙を点線で折ると、穴から何が見える？' },
        { id: '0M', kind: 'mid', step: '★', name: 'ロック',
          q: 'スタートは［　］駅。そこから海へ二駅で、パスワードは［　］。',
          fields: [{ k: 'start', type: 'text', canon: 'station', label: 'スタートの駅', ph: '駅名' }, { k: 'pw', type: 'text', canon: 'station', label: 'パスワード（着いた駅）', ph: '駅名' }],
          fact: 'パスワードは平磯（風見家の駅）',
          hint: [
            '手紙には「スタートは、写真館にいちばん近い駅」。地図の下の記号の説明を見よう。',
            '★が写真館。カメラの印は「潮見さんの日の出ポイント」で、写真館ではない。★にいちばん近い駅から、海（地図の右）のほうへ2つ進もう。'],
          miss: [
            { eq: { start: 'ひらいそ' }, msg: '平磯は、カメラの印（潮見さんの日の出ポイント）のそば。手紙の「写真館」は、地図のどの記号？' },
            { okf: ['pw'], msg: '着いた駅は、つじつまが合ってる。スタートの駅をもう一度。' },
            { okf: ['start'], eq: { pw: ['なかね', 'たかだのてっきょう'] }, msg: '川と田んぼのほう（勝田のほう）へ行ってない？ 海は地図のどっち？' },
            { okf: ['start'], eq: { pw: 'とのやま' }, msg: '海へ、いくつ進むんだった？' },
            { okf: ['start'], msg: 'スタートは合ってそう。そこから海へ、ふた駅。' },
            { eq: { pw: ['いそざき', 'みのはまがくえん'] }, msg: 'スタートがずれてない？ 写真館は★の印。' },
            { eq: { pw: 'あじがうら' }, msg: '終点まで行っちゃった。' }],
          fb: '開かなかった。……手紙と地図を、もう一度。' },
      ],
    },
    {
      id: 1, label: 'S1 止まった時計', objective: '潮見さんが襲われた「本当の時刻」を突き止める', docs: ['1-1', '1-2', '1-3', '1-4', '1-5'], mins: 22,
      puzzles: [
        { id: '1A', kind: 'small', step: '①', name: '床の時計',
          q: '床に落ちた時計（1-2 写真②）。数字のない文字盤で、何を手がかりに上を決め、針は何時何分？',
          fields: [
            { k: 'key', type: 'chip', label: '［1］上を決める手がかり', opts: [['tag', '鑑識の番号札「2」'], ['name', '店名「潮見写真館」の文字'], ['batt', '外れた電池'], ['rule', '物差し']] },
            { k: 't', type: 'time', clock: true, label: '［2］針の時刻', ph: '例：12:30' }],
          fact: '床の時計は 9時10分 で止まっていた（巡査は逆さまに読んだ）',
          hint: [
            '巡査は「3時40分ごろ？」と書いた。でも数字のない時計で、どうやって「上」を決めたんだろう？ 時計そのものに書いてあるものは？',
            '番号札は、鑑識さんが写真の向きに合わせて置いたもの。時計とは関係ない。店名「潮見写真館」がまっすぐ読める向きが12時の側。写真②を「↻ 回す」で2回まわそう。'],
          miss: [
            { eq: { t: '220' }, msg: '交番の巡査と同じ読み方。……数字のない時計で、どうやって「上」を決めた？' },
            { test: (c) => +c.t >= 160 && +c.t <= 172, msg: '長い針と短い針、逆に読んでない？' },
            { okf: ['t'], msg: 'その手がかりで上を決めたら、その時刻にはならないはず。……本当は何で決めた？' },
            { eq: { key: 'tag' }, msg: '番号札は、鑑識さんが写真に合わせて置いたもの。時計の向きとは関係ないかも。' },
            { eq: { key: ['batt', 'rule'] }, msg: '電池や物差しは、落ちたあとで動いたかもしれない。時計そのものに書いてあるものは？' },
            { okf: ['key'], msg: '手がかりは合ってる。店名がまっすぐ読めるまで ↻ で回してから、短い針と長い針を読んでみて。' }],
          fb: '店名の向きにそろえた？ ↻ で回してから、短い針と長い針を読んでみて。' },
        { id: '1B', kind: 'small', step: '②', name: '鏡の中の時計',
          q: '店の時計は、正しい時刻からどれだけずれていた？',
          fields: [
            { k: 'm', type: 'time', clock: true, label: '［1］見本アルバムの鏡に映った時計の時刻', ph: '例：12:30' },
            { k: 'n', type: 'num', label: '［2］ずれ', ph: '例：3', suffix: '分', half: true },
            { k: 'dir', type: 'chip', label: '［3］', opts: [['fast', '進んでいた'], ['slow', '遅れていた']], half: true }],
          fact: '店の時計は 6分進んでいた（見本アルバムの鏡と、カメラの写し込み）',
          hint: [
            '店の時計は、現場の写真のほかにもう1か所写っている。1-4の見本アルバム、女の子のとなりの鏡を拡大しよう。',
            '鏡に映ったものは左右が逆。「⇋ 反転」で直してから針を読む。それを、写真のすみのオレンジの写し込み（カメラが記録した本当の時刻）と比べよう。'],
          miss: [
            { eq: { m: '84' }, msg: '鏡の中の時計を、そのまま読んでない？ 鏡の中の店名、読める？' },
            { okf: ['m', 'n'], msg: '時計の時刻と写し込みの時刻、どっちが先に行ってる？' },
            { okf: ['m'], msg: '時計は読めてる。何と比べればいい？ 写真のすみの、オレンジの字を見て。' },
            { okf: ['n', 'dir'], msg: 'ずれの答えと、時計の読みがかみ合ってない。もう一度、鏡を直して読んでみて。' }],
          fb: '鏡を ⇋ で直して、オレンジの写し込みと比べてみて。' },
        { id: '1M', kind: 'mid', step: '★', name: '本当の時刻',
          q: '潮見さんが襲われたのは［　］。野々香さんの110番の［　］分前。この時刻が正しいと裏づけるのは［　］。',
          fields: [
            { k: 'time', type: 'time', label: '［1］襲われた時刻', ph: '例：12:30', half: true },
            { k: 'gap', type: 'num', label: '［2］110番の何分前', ph: '例：15', suffix: '分前', half: true },
            { k: 'proof', type: 'chip', label: '［3］裏づけ', opts: [['otsu', '大津さんのメッセージが未読'], ['suga', '菅谷さんの「ドン」'], ['nono', '野々香さんの21:12のメッセージ'], ['patrol', '巡査の到着時刻']] }],
          fact: '襲われたのは 21:04。110番の37分前（菅谷さんの「ドン」と合う）',
          hint: [
            '①と②を組み合わせる。止まった時計は「6分進んだ時計」。それから、時計の見た目の時刻と本当の時刻のうち、どちらか一方にしか合わない証言を探そう。',
            '本当の時刻は 9時10分の6分前。110番の時刻は1-1。1-5の菅谷さんの「最初の話題」は21:00〜21:06。大津さんや野々香さんのメッセージは、どちらの時刻でも説明がつく。'],
          miss: [
            { eq: { time: '1270' }, msg: 'それは時計が「見せていた」時刻。……ずれてたよね？' },
            { eq: { time: '1276' }, msg: '進んでいる時計なら、本当の時刻はもっと前。' },
            { test: (c) => +c.time < 1230 || +c.time > 1320, msg: '検視の幅（20:30〜22:00）の外になってるよ。' },
            { okf: ['time'], ngf: ['gap'], msg: '時刻からの引き算をもう一度。110番は1-1に。' },
            { eq: { proof: ['otsu', 'nono'] }, msg: 'そのメッセージ、21:04でも21:10でも同じように説明できない？ どちらか一方にだけ合う証言は？' },
            { eq: { proof: 'patrol' }, msg: '巡査が着いたのは21:50。襲われた時刻とは関係なさそう。' }],
          fb: 'まだ合っていない。' },
      ],
    },
  ];

  window.CASE = { DOCS, CHAT, STAGES, GRID, TARGETS,
    art: { photo, studioScene, mapInner, clockFace, PANEL_SVG, cx, cy, CELL, GX, GY, F } };
})();
