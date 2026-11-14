// Bousai Japan — 画面の切りかえと操作。データはこの端末（localStorage）の中だけに保存します。
(() => {
  const view = document.getElementById('view');
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const store = {
    get(k, d) { try { const v = localStorage.getItem('bousai.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('bousai.' + k, JSON.stringify(v)); return true; } catch (e) { return false; } },
  };
  const srcHtml = (keys) => {
    const list = (Array.isArray(keys) ? keys : [keys]).map((k) => SRC[k]).filter(Boolean);
    return `<p class="src">出典：${list.map((s) => `<a href="${s.url}" target="_blank" rel="noopener">${esc(s.name)}</a>`).join('、')}</p>`;
  };
  const back = '<a class="back" href="#/">← ホーム</a>';
  const NOTICE = '<p class="notice">このアプリは、地震や津波の情報を受け取る機能はありません。テレビ・ラジオ・自治体・気象庁の情報を必ず確認してください。</p>';

  // ---------- 画面 ----------
  function home() {
    const done = checkProgress();
    return `
    <section class="hero">
      <h1>いざという時、<br>まず開く。</h1>
      <p>地震・津波のとき「いま何をするか」がすぐわかります。一度開けば、電波がなくても使えます。</p>
    </section>
    <nav class="grid">
      <a class="tile red big" href="#/shaking"><span class="ic">⚠️</span><b>いま揺れている</b><small>身を守る</small></a>
      <a class="tile orange big" href="#/after"><span class="ic">🧭</span><b>揺れがおさまった</b><small>次にやること</small></a>
      <a class="tile blue big" href="#/tsunami"><span class="ic">🌊</span><b>津波のおそれ</b><small>より高いところへ</small></a>
      <a class="tile yellow" href="#/rinji"><span class="ic">📢</span><b>臨時情報が出た</b><small>南海トラフ</small></a>
      <a class="tile green" href="#/check"><span class="ic">✅</span><b>そなえチェック</b><small>${done.d} / ${done.n}</small></a>
      <a class="tile purple" href="#/family"><span class="ic">👪</span><b>家族メモ</b><small>集合場所・連絡先</small></a>
      <a class="tile gray" href="#/tools"><span class="ic">🔦</span><b>ツール</b><small>ライト・笛・タイマー</small></a>
    </nav>
    ${NOTICE}
    <p class="foot"><a href="#/about">このアプリについて</a></p>`;
  }

  function shaking(placeId) {
    const cur = SHAKING.find((p) => p.id === placeId) || SHAKING[0];
    return `${back}
    <h2 class="hd red">いま揺れている</h2>
    <p class="lead">まわりの人に声をかけながら、<b>あわてずに、まず身の安全を確保</b>する。</p>
    <div class="chips">${SHAKING.map((p) => `<a href="#/shaking/${p.id}" class="chip${p.id === cur.id ? ' on' : ''}">${p.icon} ${esc(p.place)}</a>`).join('')}</div>
    <div class="card big-list"><h3>${cur.icon} ${esc(cur.place)}では</h3><ol>${cur.items.map((t) => `<li>${esc(t)}</li>`).join('')}</ol></div>
    <a class="btn" href="#/after">揺れがおさまったら →</a>
    ${srcHtml(cur.src)}`;
  }

  function after() {
    return `${back}
    <h2 class="hd orange">揺れがおさまったら</h2>
    <div class="steps">${AFTER.map((a, i) => `<div class="step${a.strong ? ' strong' : ''}"><span class="n">${i + 1}</span><div><b>${esc(a.t)}</b><p>${esc(a.d)}</p>${a.link ? `<a href="${a.link}">くわしく →</a>` : ''}</div></div>`).join('')}</div>
    <a class="btn" href="#/tools/timer">地震からの経過時間をはかる</a>
    ${srcHtml(['jmaEew', 'mext', 'ntt'])}`;
  }

  function tsunami() {
    return `${back}
    <h2 class="hd blue">津波のおそれ</h2>
    <div class="alert">${esc(TSUNAMI.lead)}</div>
    <div class="steps">${TSUNAMI.items.map((a, i) => `<div class="step"><span class="n">${i + 1}</span><div><b>${esc(a.t)}</b>${a.d ? `<p>${esc(a.d)}</p>` : ''}</div></div>`).join('')}</div>
    <a class="btn" href="#/family">自分の避難場所を確認する</a>
    <a class="btn ghost" href="#/tools/timer">地震からの経過時間をはかる</a>
    ${srcHtml(TSUNAMI.src)}`;
  }

  function rinji() {
    return `${back}
    <h2 class="hd yellow">南海トラフ地震臨時情報</h2>
    <p class="lead">${esc(RINJI.lead)}</p>
    ${RINJI.types.map((t) => `<div class="card kind ${t.color}"><h3>${esc(t.k)}</h3><p class="when">${esc(t.when)}</p><p>${esc(t.act)}</p></div>`).join('')}
    <div class="alert">${esc(RINJI.note)}</div>
    <a class="btn" href="#/check">1週間のそなえをチェック</a>
    ${srcHtml(RINJI.src)}`;
  }

  function checkProgress() {
    const st = store.get('check', {});
    let n = 0, d = 0;
    CHECK.forEach((g) => g.items.forEach(([k]) => { n++; if (st[k]) d++; }));
    return { n, d };
  }
  function check() {
    const st = store.get('check', {});
    const p = checkProgress();
    return `${back}
    <h2 class="hd green">そなえチェック</h2>
    <div class="bar"><i style="width:${Math.round(p.d / p.n * 100)}%"></i></div><p class="muted">${p.d} / ${p.n} 完了（この端末に保存）</p>
    ${CHECK.map((g) => `<div class="card"><h3>${esc(g.g)}</h3>${g.items.map(([k, t]) => `<label class="ck"><input type="checkbox" data-ck="${k}"${st[k] ? ' checked' : ''}><span>${esc(t)}</span></label>`).join('')}</div>`).join('')}
    ${srcHtml('check')}`;
  }

  const FAMILY_FIELDS = [
    ['meet', '家族の集合場所', '例：〇〇公園の入口'],
    ['shelter', '近くの避難場所（地震）', '例：〇〇小学校'],
    ['tsunami', '津波のときの避難場所（高いところ）', '例：〇〇台・津波避難ビル'],
    ['phone171', '171で使う電話番号（家の番号など）', '例：0XX-XXX-XXXX'],
    ['contacts', '家族の連絡先', '例：お母さん 090-…'],
    ['memo', 'メモ（持病・アレルギー・薬など）', ''],
  ];
  function family() {
    const f = store.get('family', {});
    return `${back}
    <h2 class="hd purple">家族メモ</h2>
    <p class="lead">家族で話し合って書いておきましょう。<b>この端末の中だけ</b>に保存され、どこにも送られません。</p>
    <form id="fam" class="card form">${FAMILY_FIELDS.map(([k, l, ph]) => `<label>${esc(l)}${k === 'contacts' || k === 'memo' ? `<textarea name="${k}" rows="3" placeholder="${esc(ph)}">${esc(f[k] || '')}</textarea>` : `<input name="${k}" value="${esc(f[k] || '')}" placeholder="${esc(ph)}">`}</label>`).join('')}
    <p class="saved" id="saved" aria-live="polite"></p></form>
    <p class="muted">スマホが使えない時に備えて、紙にも書いておくと安心です。</p>
    <a class="btn ghost" href="https://disaportal.gsi.go.jp/" target="_blank" rel="noopener">ハザードマップで避難場所を調べる ↗</a>`;
  }

  function tools(sub) {
    if (sub === 'timer') return timer();
    if (sub === '171') return t171();
    return `${back}
    <h2 class="hd gray">ツール</h2>
    <div class="grid">
      <button class="tile gray" id="btn-light"><span class="ic">🔦</span><b>ライト</b><small>画面を白く光らせる</small></button>
      <button class="tile gray" id="btn-whistle"><span class="ic">📣</span><b>呼び笛</b><small>音で助けを呼ぶ</small></button>
      <a class="tile gray" href="#/tools/timer"><span class="ic">⏱️</span><b>経過タイマー</b><small>地震から何分？</small></a>
      <a class="tile gray" href="#/tools/171"><span class="ic">☎️</span><b>171の使い方</b><small>災害用伝言ダイヤル</small></a>
    </div>
    <div class="card"><h3>公式の情報</h3><ul class="links">${LINKS.map((l) => `<li><a href="${l.url}" target="_blank" rel="noopener">${esc(l.name)} ↗</a></li>`).join('')}</ul><p class="muted">リンク先を見るにはインターネット接続が必要です。</p></div>`;
  }

  function timer() {
    const start = store.get('quakeStart', null);
    return `<a class="back" href="#/tools">← ツール</a>
    <h2 class="hd gray">地震からの経過時間</h2>
    <p class="lead">揺れ始めたら押すと、どれくらい時間がたったかがわかります。津波は、早い所では数分で来ると想定されています。</p>
    <div class="clock" id="clock">${start ? '' : '--:--'}</div>
    <button class="btn red" id="t-start">${start ? 'いまからはかり直す' : '揺れ始めた（スタート）'}</button>
    ${start ? '<button class="btn ghost" id="t-reset">リセット</button>' : ''}`;
  }

  function t171() {
    return `<a class="back" href="#/tools">← ツール</a>
    <h2 class="hd gray">災害用伝言ダイヤル「171」</h2>
    <p class="lead">大きな災害で電話がつながりにくいときに使える、声の伝言板です（災害時などに提供されます）。</p>
    <div class="card big-list"><h3>伝言を録音する</h3><ol><li><b>171</b> に電話</li><li><b>1</b> を押す</li><li>自分の家などの電話番号を<b>市外局番から</b>入力</li><li>案内にしたがって録音</li></ol></div>
    <div class="card big-list"><h3>伝言を聞く</h3><ol><li><b>171</b> に電話</li><li><b>2</b> を押す</li><li>相手の電話番号を<b>市外局番から</b>入力</li><li>案内にしたがって再生</li></ol></div>
    <p class="muted">どの電話番号を使うか、家族で決めておきましょう（家族メモに書けます）。インターネットの「web171」もあります。毎月1日・15日などに体験利用ができます。</p>
    <a class="btn" href="tel:171">171 に電話する</a>
    ${srcHtml('ntt')}`;
  }

  function about() {
    return `${back}
    <h2 class="hd gray">このアプリについて</h2>
    <div class="card"><p>Bousai Japan は、地震・津波のときに「いま何をするか」をすぐ確認できるように作った、無料の防災アプリです。</p>
    <ul class="dots"><li>内容は、気象庁・防災庁・文部科学省などの公式資料をもとにしています（各画面の下に出典があります）。</li>
    <li>地震や津波の情報を受け取る機能はありません。テレビ・ラジオ・自治体・気象庁の情報を確認してください。</li>
    <li>チェックや家族メモは、この端末の中だけに保存され、どこにも送られません。</li>
    <li>一度開くと、電波がなくても使えます。ホーム画面に追加すると、アプリのように開けます。</li></ul></div>
    <button class="btn ghost" id="wipe">この端末の保存データを消す</button>`;
  }

  // ---------- ルーター ----------
  let tick = null;
  function render() {
    clearInterval(tick);
    const h = (location.hash || '#/').slice(2).split('/');
    const r = h[0] || '';
    const pages = { '': home, shaking: () => shaking(h[1]), after, tsunami, rinji, check, family, tools: () => tools(h[1]), about };
    view.innerHTML = (pages[r] || home)();
    window.scrollTo(0, 0);
    bind();
  }

  function bind() {
    view.querySelectorAll('[data-ck]').forEach((el) => el.addEventListener('change', () => {
      const st = store.get('check', {}); st[el.dataset.ck] = el.checked; store.set('check', st);
      const p = checkProgress(); const bar = view.querySelector('.bar i'); if (bar) bar.style.width = Math.round(p.d / p.n * 100) + '%';
      const m = view.querySelector('.bar + .muted'); if (m) m.textContent = `${p.d} / ${p.n} 完了（この端末に保存）`;
    }));
    const fam = document.getElementById('fam');
    if (fam) fam.addEventListener('input', () => {
      const f = {}; new FormData(fam).forEach((v, k) => { f[k] = v; });
      document.getElementById('saved').textContent = store.set('family', f) ? '保存しました' : '保存できませんでした（ブラウザの設定を確認してください）';
    });
    const bl = document.getElementById('btn-light'); if (bl) bl.addEventListener('click', lightOn);
    const bw = document.getElementById('btn-whistle'); if (bw) bw.addEventListener('click', whistle);
    const ts = document.getElementById('t-start'); if (ts) ts.addEventListener('click', () => { store.set('quakeStart', Date.now()); render(); });
    const tr = document.getElementById('t-reset'); if (tr) tr.addEventListener('click', () => { store.set('quakeStart', null); render(); });
    const clock = document.getElementById('clock');
    if (clock && store.get('quakeStart', null)) {
      const upd = () => { const s = Math.max(0, Math.floor((Date.now() - store.get('quakeStart', Date.now())) / 1000)); const hh = Math.floor(s / 3600), mm = Math.floor(s % 3600 / 60), ss = s % 60;
        clock.textContent = (hh ? hh + ':' + String(mm).padStart(2, '0') : mm) + ':' + String(ss).padStart(2, '0'); };
      upd(); tick = setInterval(upd, 500);
    }
    const wipe = document.getElementById('wipe');
    if (wipe) wipe.addEventListener('click', () => { if (confirm('チェック・家族メモ・タイマーの記録を消します。よろしいですか？')) { ['check', 'family', 'quakeStart'].forEach((k) => { try { localStorage.removeItem('bousai.' + k); } catch (e) { /* なし */ } }); location.hash = '#/'; render(); } });
  }

  // ---------- ライト・呼び笛 ----------
  const light = document.getElementById('light');
  let wakeLock = null;
  async function lightOn() {
    light.hidden = false;
    try { if ('wakeLock' in navigator) wakeLock = await navigator.wakeLock.request('screen'); } catch (e) { /* 使えない端末 */ }
  }
  document.getElementById('light-off').addEventListener('click', () => { light.hidden = true; if (wakeLock) { wakeLock.release().catch(() => {}); wakeLock = null; } });

  let ac = null, osc = null;
  function whistle(e) {
    const btn = e.currentTarget;
    if (osc) { osc.stop(); osc = null; btn.querySelector('b').textContent = '呼び笛'; return; }
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    if (ac.state === 'suspended') ac.resume();
    osc = ac.createOscillator(); const g = ac.createGain();
    osc.type = 'square'; osc.frequency.value = 3000;
    // ピッ・ピッ・ピッ と鳴らす（3秒ごとに3回）
    const t0 = ac.currentTime; g.gain.setValueAtTime(0, t0);
    for (let i = 0; i < 400; i++) { const b = t0 + Math.floor(i / 3) * 3 + (i % 3) * 0.5; g.gain.setValueAtTime(0.35, b); g.gain.setValueAtTime(0, b + 0.3); }
    osc.connect(g).connect(ac.destination); osc.start();
    btn.querySelector('b').textContent = '止める';
  }

  // ---------- オンライン表示・オフライン対応 ----------
  const net = document.getElementById('net');
  const upd = () => { net.hidden = navigator.onLine; };
  window.addEventListener('online', upd); window.addEventListener('offline', upd); upd();
  if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));

  window.addEventListener('hashchange', render);
  render();
})();
