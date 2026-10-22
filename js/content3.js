/* 十九年目のネガ — S6（消えたネガ）・大謎・エンディング（S3・S7〜S9は content4.js） */
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

  const PRINT_SVG = `
<svg viewBox="0 0 400 260" class="svg-photo" role="img" aria-label="白黒のテストプリント（写真の右上のはしっこ）">
  <rect width="400" height="260" fill="#d9d4ca"/>
  <rect y="150" width="400" height="110" fill="#8e9296"/>
  <path d="M0 150 Q200 144 400 150" stroke="#c7c9cb" stroke-width="4" fill="none"/>
  <circle cx="300" cy="128" r="26" fill="#f6f3ec"/><rect x="250" y="150" width="100" height="6" fill="#e7e5df" opacity=".8"/>
  <path d="M0 196 L250 168 L262 176 L0 212 Z" fill="#5f5a55"/><path d="M0 212 L262 176 L262 184 L0 222 Z" fill="#45413d"/>
  <ellipse cx="330" cy="214" rx="34" ry="16" fill="#3f3b37"/><ellipse cx="372" cy="226" rx="22" ry="12" fill="#3a3632"/>
  <path d="M300 236 q20 -8 40 0 t40 0" stroke="#f0f0f0" stroke-width="3" fill="none" opacity=".7"/>
  <path d="M0 0 H400 V260 H0 Z" fill="none" stroke="#fff" stroke-width="10"/>
</svg>`;
  /* 大謎：森山の机（真上から）とネガ */
  const DESK_SVG = `
<svg viewBox="0 0 600 440" class="svg-photo" role="img" aria-label="スチールの机を真上から撮った写真。茶封筒に手書きで「H20.1.12 平磯 預かり」。そのとなりに、色あせた黄色い毛糸のポンポン帽。ネガ袋には「潮見写真館 No.08-03 H20.1.12 平磯 AM」。封筒のすみのメモに「足跡 19」。ぬるそうな缶コーヒーが1本。">
  <rect width="600" height="440" fill="#7f8c8d"/><rect x="0" y="0" width="600" height="440" fill="url(#deskg)"/>
  <defs><linearGradient id="deskg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#95a5a6"/><stop offset="1" stop-color="#6c7a7b"/></linearGradient></defs>
  <g transform="rotate(-6 200 200)"><rect x="60" y="70" width="300" height="210" rx="4" fill="#c8a165"/><path d="M60 70 L210 160 L360 70" fill="none" stroke="#a7834c" stroke-width="3"/>
    <text x="90" y="230" font-family="'Noto Serif CJK JP',serif" font-size="24" fill="#3e2723">H20.1.12 平磯　預かり</text>
    <text x="90" y="262" font-family="'Noto Serif CJK JP',serif" font-size="15" fill="#4e342e">足跡 19</text></g>
  <g transform="translate(450 150)"><path d="M-70 30 Q-70 -50 0 -52 Q70 -50 70 30 Z" fill="#e8c547"/><g stroke="#cfae35" stroke-width="3">${Array.from({ length: 9 }, (_, i) => `<line x1="${-60 + i * 15}" y1="25" x2="${-56 + i * 14}" y2="-40"/>`).join('')}</g><rect x="-74" y="18" width="148" height="20" rx="8" fill="#d9b43a"/><circle cx="0" cy="-58" r="20" fill="#efd060"/></g>
  <g transform="rotate(4 360 340)"><rect x="250" y="300" width="230" height="92" fill="#f3efe6" stroke="#b9b2a2"/><rect x="262" y="312" width="206" height="40" fill="#5b3a29" opacity=".85"/><text x="268" y="376" font-size="14" fill="#5d4037" font-family="sans-serif">潮見写真館 No.08-03　H20.1.12 平磯 AM</text></g>
  <g transform="translate(90 360)"><rect x="-22" y="-34" width="44" height="68" rx="8" fill="#6d4c41"/><rect x="-22" y="-10" width="44" height="22" fill="#d7ccc8"/><text x="0" y="6" text-anchor="middle" font-size="10" fill="#4e342e">COFFEE</text></g>
</svg>`;
  // 白黒フィルム。手前（大きく写る）：倒れた母・落ちる鳴海剛（作業着・顔は描かない）・押す子ども。奥（小さく写る）：堤防の上の少女
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
<figure class="neg" data-neg="10-2">
  <div class="neg-film"><div class="neg-frame"><svg viewBox="0 0 600 400" class="neg-svg" role="img" aria-label="白黒ネガの1コマ。日の出の岩場。人が4人写っている。ネガのままだと明るさが反対で、向きも違う。"><g class="neg-g">${NEG_SCENE}</g></svg></div></div>
  <div class="ov-tools" role="group" aria-label="ネガの道具">
    <button type="button" class="tool" data-negt="rot" aria-label="ネガを右に90度回す">↻ 回す</button>
    <button type="button" class="tool" data-negt="flip" aria-label="ネガを裏返す">⇋ 裏返す</button>
    <button type="button" class="tool ghost" data-negt="reset">元に戻す</button>
    <span class="ov-state neg-state" aria-live="polite"></span></div>
  <label class="dev-ctl"><span>☀ 現像（白黒ネガ → ポジ）</span><input type="range" min="0" max="100" step="1" value="0" aria-label="現像（ネガからポジへ）"><output class="dev-val">0</output></label>
  <p class="ov-ok" role="status" hidden>写し込みが正しく読める向き。白黒の写真になった。</p>
  <div class="sr-only sr-text neg-desc" hidden><p>白黒写真。日の出の直後の平磯の岩場。手前の岩に、女性が向こうを向いて倒れている。右手前の岩の端で、男性が後ろへ傾いて海へ落ちていく。そのすぐ前、同じ岩の上で、子どもが両手を前に突き出している。子どもの頭のてっぺんは、男性の腰の高さくらい。頭には毛糸の帽子で、てっぺんに丸い玉。ずっと奥、海の向こう側の堤防の上に、もう1人の少女。写真の中では、手前の子どもより小さく写っている。髪は長く、首に濃い色のマフラー、カゴをかかえて立っている。右下に写し込み「'08 1 12」。</p></div>
</figure>`;
  }

  Object.assign(C.DOCS, {
    '6-1': {
      no: '6-1', stage: 6, icon: '☀', kind: '写真', title: '1-3を現像する', short: '22:03の写真を明るく。22:26と比べる',
      re: 'S1からずっと、暗い写真の中に写っていた。',
      html: () => `
<article class="doc paper">
  <div class="sticky">私のスマホ写真（22:03）を、明るくできるようにした。下は鑑識さんの全景（22:26、入室前）。</div>
  ${develop('6-1a', A.studioScene({ dark: true, sleeve: true, alt: '1-3と同じ、暗いスタジオの写真。明るさを上げると細部が見えてくる。' }), '上：IMG_0347（22:03、莉々香）')}
  ${A.photo('6-1b', A.studioScene({ markers: true, alt: '鑑識の全景写真①と同じ。背景紙のすその床には何もない。' }), '下：1-2 写真①（22:26、鑑識・入室前）')}
  <div class="sr-only sr-text"><p>明るさを最大まで上げると、22:03の写真の背景紙のすそに、白い紙の袋のような四角い物が見える。字は読めない。22:26の写真の同じ場所には何もない。</p></div>
</article>`,
    },
    '6-2': {
      no: '6-2', stage: 6, icon: '🎞', kind: '台帳', title: '潮見のネガ台帳', short: '2008年1月のページ',
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
    '6-4': {
      no: '6-4', stage: 6, icon: '🧪', kind: '暗室', title: '暗室の焼きかけの印画紙', short: 'ミニゲーム：現像して浮かび上がらせる',
      re: '潮見は事件の夜、暗室でテストプリントを焼いていた。浮かんだのは、堤防と岩の向こうに昇る朝日。灯台はない＝磯崎ではなく平磯。',
      html: () => `
<article class="doc paper">
  <div class="sticky">写真館の暗室。引き伸ばし機の下に、<b>光を当てたまま現像していない印画紙</b>が残ってた。引き伸ばし機のネガを入れる枠は、空っぽ。……潮見さんは事件の夜、ここで何かを焼いていた。そのネガは、どこへ？<br>現像のやり方は、潮見さんの写真教室で習った。濃すぎても、うすすぎてもだめ。</div>
  ${window.PLAY.darkroom('6-4d', { print: PRINT_SVG, cap: '印画紙は、潮見さんの「試し焼き用」の細い紙。写真のはしっこの一部しか写らない。', desc: '白黒のテストプリント。写真の右上のはしっこ。水平線のすぐ上に、昇ったばかりの丸い太陽。手前の左から右へ、低くまっすぐな堤防がのびている。右下の海の中に、大きな岩が2つ。灯台や建物は写っていない。人も写っていない。' })}
</article>`,
    },
    '6-3': {
      no: '6-3', stage: 6, icon: '🌅', kind: 'ブログ', title: '日の出日記（2008年1月）', short: '潮見の写真ブログの記事一覧',
      re: '「誰にも見せられない」一枚は、19年後に脅しの道具になった。',
      html: () => `
<article class="doc paper blog">
  <header class="form-head"><div class="form-org">潮見達郎のブログ「日の出日記」（印刷）</div><h3>2008年1月の記事</h3></header>
  <ul class="blog-list">
    <li><time>1/3</time>初日の出は磯崎で。灯台と朝日。今年もいい年に。</li>
    <li><time>1/10</time>湊の冬。駅で、仲のいい姉妹を撮らせてもらった。</li>
    <li><time>1/11</time>雪。一日、店番。シャッターは一度も切らなかった。</li>
    <li><time>1/13</time>きのうの夜明け、一生に一度の一枚が撮れてしまった。でも、これは誰にも見せられない。今日は店を休んで、暗室で現像だけ。</li>
    <li><time>1/14</time>成人式の前撮り。晴れ着が映える。</li></ul>
  <p class="aside">※潮見さんの日の出ポイントは、0-1の地図のカメラの印。</p>
</article>`,
    },
    '6-5': {
      no: '6-5', stage: 6, icon: '📰', kind: '新聞', title: '2008年1月13日の地方面', short: '平磯の岩場で転落', after: '6M',
      re: '「釣り人」は、森山が書いた報告書のことば。鳴海剛は釣りざおを持っていなかった。名前が伏せられたのは、家族（妹の沙織）の希望。',
      html: () => `
<article class="doc paper newspaper">
  <header class="form-head"><div class="form-org">常陸みなと新報（架空）　2008年（平成20年）1月13日（日）</div><h3>平磯の岩場で男性転落死</h3></header>
  <p class="np-body">12日早朝、ひたちなか市平磯町の岩場で、市内の男性（43）が海に落ち、死亡した。那珂湊中央署によると、男性は<b>釣りに来ていて足を滑らせた</b>とみられる。沖の漁船から118番通報があった。署は事故とみて調べている。<br>男性の名前は、家族の希望で伏せる。</p>
  <p class="aside">※莉々香のメモ：この記事、うちには一度も置いてなかった。</p>
</article>`,
    },
    '10-1': {
      no: '10-1', stage: 10, icon: '🗄', kind: '写真', title: '森山の机', short: '封筒と、黄色い帽子',
      re: '「足跡19」。森山は19年前、子どもの足跡と帽子から、押したのが誰か分かっていた。',
      html: () => `
<article class="doc paper">
  <div class="sticky">誰もいない刑事課で撮った。森山さんの机の奥にあった封筒。</div>
  ${A.photo('10-1a', DESK_SVG, '封筒「H20.1.12 平磯 預かり」・黄色い毛糸の帽子・ネガ袋 No.08-03・メモ「足跡 19」')}
</article>`,
    },
    '10-2': {
      no: '10-2', stage: 10, icon: '🎞', kind: 'ネガ', title: 'ネガ No.08-03', short: '袋から出したままの1コマ',
      re: '白黒フィルムなので、色は決め手にならない。手前の子は大きく写っていただけで、鳴海の腰までしかない。てっぺんに玉のある帽子は、1-2③のパネルの莉々香と同じ。莉々香は、自分を見ていた。',
      html: () => `
<article class="doc paper">
  <div class="sticky">袋から出した1コマ。……これ、押してるの、お姉ちゃんだよね？</div>
  ${negHTML()}
</article>`,
    },
  });
  Object.assign(C.CHAT, {
    's6.start': [
      { video: 'story_darkroom', t: '写真館の暗室。赤いランプの下で、まだ何かが待っている。' },
      { who: 'beat', t: '1月17日（日）2:10。莉々香の部屋。' },
      { t: 'お母さん、認めたって。潮見さんを殴ったのは自分だって。' },
      { t: 'でも、どうしてお金を払ってたのかは言わない。「昔のことです」って、それだけ。' },
      { t: '潮見さんの金庫は空だった。お母さんが持ち帰った物のほかにも、何かあったはず。' },
      { t: '私の22:03の写真、明るくできるようにした。鑑識さんの22:26と比べてみて。', doc: '6-1' },
      { t: '潮見さんのネガ台帳。', doc: '6-2' },
      { t: 'ブログの印刷も。潮見さん、毎朝日の出を撮ってた。', doc: '6-3' },
      { t: 'それから、暗室。焼きかけの印画紙が残ってた。現像してみる。……写真教室、まじめに出ててよかった。', doc: '6-4' },
      { t: 'あの夜、誰がいつスタジオに入ったか。1-1の報告書は、交番の人が書いたもの。……私、自分が撮った写真のことしか覚えてない。' },
    ],
    's6.6M': [
      { t: '白い紙袋……。私が撮った22:03にはあって、鑑識さんの22:26にはない。台帳から消えた08-03。' },
      { t: '堤防と、岩が2つ。灯台はない。……平磯。うちの前の海。' },
      { t: '2008年1月12日。平磯の夜明け。……毎年、お母さんが海に花を投げに行く日。' },
      { t: '新聞のデータベースで、その日の記事を見つけた。平磯の岩場で、人がひとり落ちて死んでた。', doc: '6-5' },
      { t: '1-1の「上の人」。交番の人から見た「上の人」は、あの場に1人しかいない。森山さん。「撮るな」って言ったのは、これを写させないため。そのあと、1人で入った7分間に。' },
      { t: '追伸に書いたこと、覚えてる？ 「なんで私を相棒に選んだんだろう」。……答え、知るのが怖い。' },
      { who: 'beat', t: '9:40。森山は、莉々香の問いに「お前には関係ない」とだけ言った。' },
      { t: '関係ないわけ、ない。お母さんが払ってたお金と、19年前の写真。つながってる。' },
      { t: '……さおりさんが買いたがってた「古い写真」も、これ？' },
    ],
    's10.10M': [
      { t: '帽子はおそろいだった。白黒じゃ、色も分からない。……でも、大きさはごまかせない。' },
      { t: '手前にいるから大きく見えただけ。落ちていく男の人の腰までしかない、小さい子。お姉ちゃんは、奥の堤防の上。カゴを抱えて、立ってる。' },
      { t: '私だ。' },
      { t: '「寝てた」のは、お母さんがそう言っただけ。私の記憶じゃなかった。' },
      { who: 'beat', t: '1月18日（月）6:20。平磯の岩場。日の出の少し前。' },
      { who: 'mori', t: '……見たか。' },
      { who: 'mori', t: '足跡が19センチだった。お姉さんの靴は23。帽子は、岩のすき間に引っかかってた。鳴海がつかんで、離した帽子だ。' },
      { who: 'mori', t: '浜野さんは「子供がいた」と言った。俺はそれを書かなかった。' },
      { who: 'mori', t: '8歳の子が、母親を守ろうとした。俺はそれを事故と書いた。正しかったのかは、19年たっても分からん。' },
      { who: 'mori', t: '今朝、俺は自分のしたことを全部、上に話す。お母さんのことは、お母さんが自分で話す。' },
      { who: 'mori', t: 'ネガは、お前が決めろ。' },
      { t: '……相棒に選んだのは、そういうことだったんですね。' },
      { who: 'mori', t: '寝ろって言っただろ。' },
    ],
    's11.submit': [
      { video: 'story_ending', t: '1月18日、朝。平磯の海。' },
      { t: 'ネガは、証拠として出した。19年前のことは、もう誰も罪に問えない。でも、なかったことにはしない。' },
      { t: 'お姉ちゃんが19年ひとりで持っていたものを、半分持つために。' },
    ],
    's11.sea': [
      { video: 'story_ending', t: '1月18日、朝。平磯の海。' },
      { t: 'ネガは、平磯の海に返した。森山さんは何も言わなかった。' },
      { t: 'お姉ちゃんの嘘を、最後まで守る。それが正しかったのかは、あなたと私しか知らない。' },
    ],
  });

  C.STAGES.push(
    {
      id: 6, label: 'S6 消えたネガ', objective: '消えたネガは、いつ・どこで撮られたのか', docs: ['6-1', '6-2', '6-3', '6-4', '6-5'], mins: 20,
      puzzles: [
        { id: '6M', kind: 'mid', name: '7分間',
          q: '現場から消えたネガは、潮見さんの日の出ポイントのうち［　］で、［　］に撮られたもの。',
          fields: [
            { k: 'place', type: 'text', canon: 'kw', label: '［1］撮った場所', ph: '駅名で', half: true,
              kw: [['hiraiso', ['平磯', 'ひらいそ']], ['isozaki', ['磯崎', 'いそざき', '灯台']], ['other', ['那珂湊', 'なかみなと', '殿山', 'とのやま', '阿字ヶ浦', 'あじがうら', '美乃浜', 'みのはま', '中根', 'なかね', '高田', '勝田']]] },
            { k: 'date', type: 'date', label: '［2］撮った日', ph: '例：2008年1月1日', half: true }],
          fact: '消えた白い紙袋は台帳から抜けた08-03。潮見が事件の夜に焼いていたのも、そのネガ。テストプリントは堤防と岩の日の出＝平磯（磯崎なら灯台）。ブログ1/13の「きのうの夜明け」＝2008年1月12日',
          hint: [
            '1-3の付箋「暗くてごめん」。明るくした写真と22:26の写真で、変わったところは？ その形は、台帳のどこかに出てくる。',
            '暗室の印画紙は、何を焼いていた？ 浮かんだ景色を、0-1の地図のカメラの印と見比べて。日の出は1か所だけじゃない。',
            '台帳の決まりを、番号の並びと照らし合わせて。足りないものは、ない？ ブログの日付は、書いた日。'],
          miss: [
            { eq: { place: 'isozaki' }, msg: '初日の出は磯崎だった。……でも、そのプリントに灯台は写ってる？' },
            { eq: { place: 'other' }, msg: '0-1の地図で、潮見さんの日の出ポイント（カメラの印）はどこ？' },
            { eq: { date: ['2008-1-3', '?-1-3'] }, msg: '1/3の初日の出は、台帳の08-01。消えた番号は？' },
            { eq: { date: ['2008-1-10', '?-1-10'] }, msg: 'それは展示パネル（08-02）の日。' },
            { eq: { date: ['2008-1-14', '?-1-14'] }, msg: 'それは08-04の日。' },
            { eq: { date: ['2008-1-13', '?-1-13'] }, msg: 'その日付は、記事を書いた日。記事の中の「いつ」を、よく読んで。' },
            { eq: { date: ['2008-1-11', '?-1-11'] }, msg: 'その日、潮見さんはシャッターを切った？ ブログを見て。' }],
          fb: 'まだ合っていない。6-1・6-2・6-3と、1-1の手書きのメモを並べてみて。' },
      ],
    },
    {
      id: 10, label: '大謎 十九年目のネガ', objective: 'ネガを正しく見て、19年前に誰が押したのかを決める', docs: ['10-1', '10-2'], mins: 16, final: true,
      puzzles: [
        { id: '10M', kind: 'mid', name: '十九年目のネガ', final: true,
          q: '19年前、平磯の岩場で鳴海剛を押したのは［　］。そう決められる、ネガの中のしるしは［　］。',
          fields: [
            { k: 'push', type: 'text', canon: 'person', label: '［1］鳴海剛を押した人', ph: '名前' },
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
            { eq: { push: 'moriyama' }, msg: '森山さんは、あとで足跡と帽子を見た人。' },
            { eq: { push: ['goh', 'shiomi', 'hamano'] }, msg: 'その人は、ネガのどこにいる？ 押せる場所にいたのは？' },],
          fb: 'まだ合っていない。ネガを正しい向きの写真にしてから、10-1の机の上と見比べて。' },
      ],
    },
  );
})();
