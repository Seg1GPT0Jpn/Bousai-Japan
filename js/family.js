// 家族メモ：防災カード画像（端末内で描画）と、QRコードでの受け渡し（サーバーを通らない）
const FAMILY_FIELDS = [
  ['meet', '家族の集合場所', '例：〇〇公園の入口'],
  ['shelter', '近くの避難場所（地震）', '例：〇〇小学校'],
  ['tsunami', '津波・水害のときの避難場所（高いところ）', '例：〇〇台・津波避難ビル'],
  ['school', '学校にいるときの避難先・決まりごと', '例：学校で待つ／迎えはだれが行く'],
  ['phone171', '171で使う電話番号', '例：0XX-XXX-XXXX'],
  ['contacts', '家族の連絡先', '例：母 090-…'],
  ['memo', 'メモ（持病・アレルギー・薬など）', ''],
];
const FAMILY = {
  get() { return store.get('family', {}); },
  set(f) { return store.set('family', f); },
  // URL の # 以降に入れる（# 以降はサーバーに送られない）
  encode(f) {
    const json = JSON.stringify(f);
    const b = new TextEncoder().encode(json);
    let s = ''; b.forEach((x) => { s += String.fromCharCode(x); });
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  },
  decode(t) {
    const s = atob(t.replace(/-/g, '+').replace(/_/g, '/'));
    const b = Uint8Array.from(s, (c) => c.charCodeAt(0));
    const o = JSON.parse(new TextDecoder().decode(b));
    const f = {}; FAMILY_FIELDS.forEach(([k]) => { if (typeof o[k] === 'string') f[k] = o[k].slice(0, 400); });
    return f;
  },
  shareUrl(f) { return location.origin + location.pathname + '#/import/' + this.encode(f); },
  qrSvg(text) {
    const qr = qrcode(0, 'M'); qr.addData(text); qr.make();
    return qr.createSvgTag({ cellSize: 4, margin: 2, scalable: true });
  },
  // 1080×1920 のロック画面用カード
  card(f) {
    const c = document.createElement('canvas'); c.width = 1080; c.height = 1920; const g = c.getContext('2d');
    const F = '"Hiragino Sans","Noto Sans JP","Yu Gothic UI",Meiryo,sans-serif';
    g.fillStyle = '#0F172A'; g.fillRect(0, 0, 1080, 1920);
    g.fillStyle = '#DC2626'; g.fillRect(0, 0, 1080, 300);
    g.fillStyle = '#fff'; g.font = `900 72px ${F}`; g.fillText(I18N.w('家族の防災カード'), 80, 170);
    g.font = `700 34px ${F}`; g.fillText(I18N.w('いざという時はこれを見て行動する'), 80, 240);
    let y = 400;
    const wrap = (text, x, maxW, lh) => {
      let line = ''; const out = [];
      for (const ch of String(text)) { if (ch === '\n' || g.measureText(line + ch).width > maxW) { out.push(line); line = ch === '\n' ? '' : ch; } else line += ch; }
      if (line) out.push(line);
      out.slice(0, 4).forEach((l) => { g.fillText(l, x, y); y += lh; });
    };
    FAMILY_FIELDS.forEach(([k, label]) => {
      if (!f[k]) return;
      if (y > 1700) return;
      g.fillStyle = '#93A4BD'; g.font = `700 32px ${F}`; g.fillText(I18N.w(label), 80, y); y += 58;
      g.fillStyle = '#fff'; g.font = `900 46px ${F}`; wrap(f[k], 80, 920, 62); y += 30;
    });
    g.fillStyle = '#93A4BD'; g.font = `700 28px ${F}`; g.fillText(I18N.w('災害用伝言ダイヤル 171（録音 171→1 ／ 再生 171→2）'), 80, 1820);
    return c;
  },
};
