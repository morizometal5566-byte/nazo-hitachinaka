/* 入力のゆれをそろえる関数と、答え合わせ用のハッシュ（SHA-256）。ブラウザとビルド（node）の両方で使う。 */
(function (root) {
  'use strict';
  const KANJI = { '〇': 0, '零': 0, '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9 };
  function kanjiToNum(str) {
    return str.replace(/[〇零一二三四五六七八九十]+/g, (m) => {
      let total = 0, cur = 0;
      for (const ch of m) { if (ch === '十') { total += (cur || 1) * 10; cur = 0; } else cur = cur * 10 + KANJI[ch]; }
      return String(total + cur);
    });
  }
  const kataToHira = (s) => s.replace(/[\u30a1-\u30f6]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));
  const soft = (s) => kataToHira(String(s == null ? '' : s).normalize('NFKC').toLowerCase()).trim();
  const PUNCT = /[\s　「」『』。、．，,.!！?？・"'`ー〜~（）()\-_]/g;
  const norm = (s) => soft(s).replace(PUNCT, '').replace(/(駅|えき|さん)$/g, '');
  function parseTime(input) {
    let x = soft(input).replace(/\s/g, '');
    if (!x) return null;
    x = kanjiToNum(x).replace(/(ごろ|頃|くらい|ぐらい|ころ|ちょうど)$/g, '');
    const pm = /(午後|pm|p\.m\.|夜)/.test(x), am = /(午前|am|a\.m\.|朝)/.test(x);
    x = x.replace(/(午後|午前|pm|am|p\.m\.|a\.m\.|夜|朝)/g, '').replace(/発$|着$/, '');
    let h, m, mt;
    if ((mt = x.match(/^(\d{1,2})[:：.時](\d{1,2})分?$/))) { h = +mt[1]; m = +mt[2]; }
    else if ((mt = x.match(/^(\d{1,2})時(半)?$/))) { h = +mt[1]; m = mt[2] ? 30 : 0; }
    else if ((mt = x.match(/^(\d{3,4})$/))) { h = Math.floor(+mt[1] / 100); m = +mt[1] % 100; }
    else return null;
    if (h > 24 || m > 59) return null;
    if (pm && h < 12) h += 12;
    else if (!am && h < 12) h += 12; // 事件は夜。午前と書いていなければ夜とみなす
    return h * 60 + m;
  }
  function parseNum(input) {
    const x = kanjiToNum(soft(input).replace(/[\s,]/g, ''));
    const mt = x.match(/^(\d{1,5})(分|分前|分後|ふん|ぷん|cm|センチ|万円|円|回|つ)?$/);
    return mt ? +mt[1] : null;
  }
  // 日付：2008年1月12日／2008/1/12／'08 1 12／20080112／H20.1.12／平成20年1月12日 → "2008-1-12"
  function parseDate(input) {
    let x = kanjiToNum(soft(input)).replace(/[’'‘`]/g, "'");
    let mt;
    const heisei = x.match(/^(?:h|平成)\s*(\d{1,2})[.\/年\s]+(\d{1,2})[.\/月\s]+(\d{1,2})日?$/);
    if (heisei) return `${1988 + +heisei[1]}-${+heisei[2]}-${+heisei[3]}`;
    if ((mt = x.match(/^(\d{4})[.\/年\-\s]+(\d{1,2})[.\/月\-\s]+(\d{1,2})日?$/))) return `${+mt[1]}-${+mt[2]}-${+mt[3]}`;
    if ((mt = x.match(/^'?(\d{2})[.\/\s\-年]+(\d{1,2})[.\/\s\-月]+(\d{1,2})日?$/))) return `${2000 + +mt[1]}-${+mt[2]}-${+mt[3]}`;
    if ((mt = x.match(/^(\d{4})(\d{2})(\d{2})$/))) return `${+mt[1]}-${+mt[2]}-${+mt[3]}`;
    if ((mt = x.match(/^(\d{1,2})月(\d{1,2})日$/))) return `?-${+mt[1]}-${+mt[2]}`;
    return null;
  }
  const STATION = {};
  [['なかみなと', '那珂湊', 'nakaminato'], ['とのやま', '殿山', 'tonoyama'], ['ひらいそ', '平磯', 'hiraiso'], ['なかね', '中根', 'nakane'],
   ['たかだのてっきょう', '高田の鉄橋', '高田鉄橋', 'たかだてっきょう'], ['みのはまがくえん', '美乃浜学園', 'みのはま'], ['いそざき', '磯崎', 'isozaki'],
   ['あじがうら', '阿字ヶ浦', '阿字ケ浦', '阿字が浦', 'ajigaura'], ['かつた', '勝田', 'katsuta'], ['こうきまえ', '工機前'], ['かねあげ', '金上']]
    .forEach((a) => a.forEach((n) => { STATION[norm(n)] = a[0]; }));
  const station = (v) => { const n = norm(v); return n ? (STATION[n] || n) : ''; };
  const kana = (v) => norm(v);
  const digits = (v) => kanjiToNum(soft(v)).replace(/\D/g, '');

  // 欄の種類ごとに「そろえた形」にする。null＝形がおかしい（間違いの回数に数えない）
  function canon(f, raw) {
    const s = String(raw == null ? '' : raw);
    if (!s.trim()) return '';
    switch (f.type) {
      case 'chip': return s;
      case 'time': { const t = parseTime(s); return t === null ? null : String(f.clock ? t % 720 : t); }
      case 'num': { const n = parseNum(s); return n === null ? null : String(n); }
      case 'date': { const d = parseDate(s); return d === null ? null : d; }
      default:
        if (f.canon === 'station') return station(s);
        if (f.canon === 'digits') { const d = digits(s); return d || null; }
        return kana(s);
    }
  }

  /* SHA-256（小さな実装。file:// でも動くように同期で計算） */
  function sha256(str) {
    const K = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];
    const bytes = unescape(encodeURIComponent(str)).split('').map((c) => c.charCodeAt(0));
    const l = bytes.length * 8;
    bytes.push(0x80);
    while (bytes.length % 64 !== 56) bytes.push(0);
    for (let i = 7; i >= 0; i--) bytes.push(i >= 4 ? 0 : (l >>> (i * 8)) & 0xff);
    let H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
    const r = (x, n) => (x >>> n) | (x << (32 - n));
    for (let o = 0; o < bytes.length; o += 64) {
      const w = new Array(64);
      for (let i = 0; i < 16; i++) w[i] = (bytes[o + i * 4] << 24) | (bytes[o + i * 4 + 1] << 16) | (bytes[o + i * 4 + 2] << 8) | bytes[o + i * 4 + 3];
      for (let i = 16; i < 64; i++) {
        const s0 = r(w[i - 15], 7) ^ r(w[i - 15], 18) ^ (w[i - 15] >>> 3), s1 = r(w[i - 2], 17) ^ r(w[i - 2], 19) ^ (w[i - 2] >>> 10);
        w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
      }
      let [a, b, c, d, e, f, g, h] = H;
      for (let i = 0; i < 64; i++) {
        const t1 = (h + (r(e, 6) ^ r(e, 11) ^ r(e, 25)) + ((e & f) ^ (~e & g)) + K[i] + w[i]) | 0;
        const t2 = ((r(a, 2) ^ r(a, 13) ^ r(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) | 0;
        h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
      }
      H = H.map((x, i) => (x + [a, b, c, d, e, f, g, h][i]) | 0);
    }
    return H.map((x) => (x >>> 0).toString(16).padStart(8, '0')).join('');
  }
  const hashField = (pid, k, c) => sha256(`n19|${pid}|${k}|${c}`).slice(0, 24);
  // ヒントの答え（3段目）は、ソースを見ても一目では読めないように軽く隠す（暗号ではない）
  function unveil(s) {
    const b = typeof atob === 'function' ? atob(s) : Buffer.from(s, 'base64').toString('binary');
    const u = b.split('').map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ ((i * 7 + 19) & 0x3f))).join('');
    return decodeURIComponent(escape(u));
  }
  function veil(s) {
    const u = unescape(encodeURIComponent(s)).split('').map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ ((i * 7 + 19) & 0x3f))).join('');
    return typeof btoa === 'function' ? btoa(u) : Buffer.from(u, 'binary').toString('base64');
  }
  const api = { soft, norm, kana, station, digits, parseTime, parseNum, parseDate, canon, sha256, hashField, veil, unveil, PUNCT };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.N19 = api;
})(typeof window !== 'undefined' ? window : globalThis);
