// 言語の切りかえ（日本語・やさしい日本語・English）。
// 画面を作ったあと、文字（テキスト）と一部の属性を辞書で置きかえる。辞書にない文字は日本語のまま表示する。
// 辞書は js/i18n-dict.js（キーは日本語の原文。値は [やさしい日本語, English]）。
const I18N = {
  lang: (() => { try { return JSON.parse(localStorage.getItem('bousai.lang')) || 'ja'; } catch (e) { return 'ja'; } })(),
  set(l) { this.lang = l; try { localStorage.setItem('bousai.lang', JSON.stringify(l)); } catch (e) { /* なし */ } document.documentElement.lang = l === 'en' ? 'en' : 'ja'; },
  idx() { return this.lang === 'ez' ? 0 : this.lang === 'en' ? 1 : -1; },
  w(s) { const i = this.idx(); if (i < 0 || !s) return s; const h = I18N_DICT[s]; return (h && h[i]) || s; }, // 単語だけを置きかえる（パターンの中で使う）
  tr(s) {
    const i = this.idx(); if (i < 0 || !s) return s;
    const key = s.trim(); if (!key) return s;
    const hit = I18N_DICT[key];
    if (hit && hit[i]) return s.replace(key, hit[i]);
    for (const [re, outs] of I18N_PATTERNS) { const m = key.match(re); if (m && outs[i]) return s.replace(key, typeof outs[i] === 'function' ? outs[i](m) : key.replace(re, outs[i])); }
    return s;
  },
  run(root) {
    if (this.idx() < 0 || !root) return;
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.parentNode && /^(SCRIPT|STYLE|TEXTAREA)$/.test(n.parentNode.nodeName) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT) });
    const nodes = []; while (w.nextNode()) nodes.push(w.currentNode);
    nodes.forEach((n) => { const t = this.tr(n.nodeValue); if (t !== n.nodeValue) n.nodeValue = t; });
    const els = root.querySelectorAll ? [root, ...root.querySelectorAll('[placeholder],[aria-label],[title]')] : [];
    els.forEach((el) => el.getAttribute && ['placeholder', 'aria-label', 'title'].forEach((a) => { const v = el.getAttribute(a); if (v) { const t = this.tr(v); if (t !== v) el.setAttribute(a, t); } }));
  },
  watch() {
    const obs = new MutationObserver((ms) => {
      if (this.idx() < 0) return;
      obs.disconnect();
      ms.forEach((m) => {
        if (m.type === 'characterData') { const t = this.tr(m.target.nodeValue); if (t !== m.target.nodeValue) m.target.nodeValue = t; }
        m.addedNodes.forEach((n) => { if (n.nodeType === 3) { const t = this.tr(n.nodeValue); if (t !== n.nodeValue) n.nodeValue = t; } else if (n.nodeType === 1) this.run(n); });
      });
      obs.observe(document.body, { childList: true, subtree: true, characterData: true });
    });
    obs.observe(document.body, { childList: true, subtree: true, characterData: true });
    document.documentElement.lang = this.lang === 'en' ? 'en' : 'ja';
    this.run(document.body);
  },
};
