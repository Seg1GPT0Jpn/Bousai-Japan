// 言語の切りかえ。
// 日本語（原文）・やさしい日本語・English は js/i18n-dict.js、そのほかの言語は js/lang/{code}.js。
// 画面を作ったあと、文字（テキスト）と一部の属性を辞書で置きかえる。辞書にない文字は日本語のまま表示する。
const I18N_LANGS = {};
const I18N_LIST = [
  ['ja', '日本語', 'Japanese'], ['ez', 'やさしい にほんご', 'Easy Japanese'], ['en', 'English', '英語'],
  ['zh', '中文（简体）', '中国語'], ['ko', '한국어', '韓国語'], ['vi', 'Tiếng Việt', 'ベトナム語'], ['pt', 'Português', 'ポルトガル語'],
  ['tl', 'Filipino', 'フィリピノ語'], ['ne', 'नेपाली', 'ネパール語'], ['id', 'Bahasa Indonesia', 'インドネシア語'],
];
const I18N = {
  lang: (() => { try { const l = JSON.parse(localStorage.getItem('bousai.lang')) || 'ja'; return I18N_LIST.some((x) => x[0] === l) ? l : 'ja'; } catch (e) { return 'ja'; } })(),
  ext() { return ['ja', 'ez', 'en'].includes(this.lang) ? null : this.lang; },
  set(l) { this.lang = l; try { localStorage.setItem('bousai.lang', JSON.stringify(l)); } catch (e) { /* なし */ } },
  // そのほかの言語の辞書を読みこむ（index.html から、ほかの script より先に呼ぶ）
  load() { const x = this.ext(); if (x) document.write(`<script src="js/lang/${x}.js"><\/script>`); },
  pack() { const x = this.ext(); return x ? I18N_LANGS[x] : null; },
  idx() { return this.lang === 'ez' ? 0 : this.lang === 'en' ? 1 : -1; },
  active() { return this.lang !== 'ja' && (this.idx() >= 0 || !!this.pack()); },
  look(s) { const p = this.pack(); if (p) return p.dict[s]; const h = I18N_DICT[s]; return h && h[this.idx()]; },
  pats() { const p = this.pack(); return p ? (p.patterns || []) : I18N_PATTERNS.map(([re, o]) => [re, o[this.idx()]]); },
  w(s) { if (!this.active() || !s) return s; return this.look(s) || s; }, // 単語だけを置きかえる（パターンの中で使う）
  tr(s) {
    if (!this.active() || !s) return s;
    const key = s.trim(); if (!key) return s;
    const hit = this.look(key);
    if (hit) return s.replace(key, hit);
    for (const [re, out] of this.pats()) { const m = key.match(re); if (m && out) return s.replace(key, typeof out === 'function' ? out(m) : key.replace(re, out)); }
    return s;
  },
  run(root) {
    if (!this.active() || !root) return;
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.parentNode && /^(SCRIPT|STYLE|TEXTAREA)$/.test(n.parentNode.nodeName) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT) });
    const nodes = []; while (w.nextNode()) nodes.push(w.currentNode);
    nodes.forEach((n) => { if (n.parentNode && n.parentNode.closest && n.parentNode.closest('[data-notr]')) return; const t = this.tr(n.nodeValue); if (t !== n.nodeValue) n.nodeValue = t; });
    const els = root.querySelectorAll ? [root, ...root.querySelectorAll('[placeholder],[aria-label],[title]')] : [];
    els.forEach((el) => el.getAttribute && ['placeholder', 'aria-label', 'title'].forEach((a) => { const v = el.getAttribute(a); if (v) { const t = this.tr(v); if (t !== v) el.setAttribute(a, t); } }));
  },
  watch() {
    const p = this.pack();
    document.documentElement.lang = p ? p.htmlLang : this.lang === 'en' ? 'en' : 'ja';
    const obs = new MutationObserver((ms) => {
      if (!this.active()) return;
      obs.disconnect();
      ms.forEach((m) => {
        if (m.type === 'characterData') { const t = this.tr(m.target.nodeValue); if (t !== m.target.nodeValue) m.target.nodeValue = t; }
        m.addedNodes.forEach((n) => { if (n.nodeType === 3) { if (n.parentNode && n.parentNode.closest && n.parentNode.closest('[data-notr]')) return; const t = this.tr(n.nodeValue); if (t !== n.nodeValue) n.nodeValue = t; } else if (n.nodeType === 1) this.run(n); });
      });
      obs.observe(document.body, { childList: true, subtree: true, characterData: true });
    });
    obs.observe(document.body, { childList: true, subtree: true, characterData: true });
    this.run(document.body);
  },
};
I18N.load();
