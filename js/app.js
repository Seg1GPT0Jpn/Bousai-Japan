// Bousai Japan — 画面と操作。
(() => {
  const view = document.getElementById('view');
  const srcHtml = (keys) => {
    const list = (Array.isArray(keys) ? keys : [keys]).map((k) => SRC[k]).filter(Boolean);
    return `<p class="src">出典：${list.map((s) => `<a href="${s.url}" target="_blank" rel="noopener">${esc(s.name)}</a>`).join('、')}</p>`;
  };
  const back = (h = '#/', t = 'ホーム') => `<a class="back" href="${h}">${icon('back')}${t}</a>`;
  const head = (ic, color, title, sub) => `<div class="ph"><div class="kick">${icon(ic)}${KICK[color] || 'Bousai Japan'}</div><h1>${title}</h1>${sub ? `<p>${sub}</p>` : ''}</div>`;
  const KICK = { 'c-red': '災害時', 'c-orange': '災害時', 'c-blue': '災害時', 'c-amber': '知っておくこと', 'c-green': 'ふだんのそなえ', 'c-violet': 'ふだんのそなえ' };
  const row = (href, ic, title, sub, end = '') => `<a class="row" href="${href}">${icon(ic)}<span class="t"><b>${title}</b>${sub ? `<small>${sub}</small>` : ''}</span><span class="end">${end}${icon('chevron')}</span></a>`;
  const steps = (items, big) => `<ol class="steps${big ? ' big' : ''}">${items.map((a) => `<li class="${a.strong ? 'key' : ''}"><b>${esc(a.t)}</b>${a.d ? `<p>${esc(a.d)}</p>` : ''}${a.link ? `<a href="${a.link}">くわしく${icon('chevron')}</a>` : ''}</li>`).join('')}</ol>`;
  const NOTICE = `<div class="note">${icon('info')}<span>このアプリは地震・津波の情報を受け取りません。実際の災害では、まわりの危険と、自治体・消防・警察・学校の指示、テレビ・ラジオの情報を最優先にしてください。</span></div>`;
  const hzName = (k) => { const h = HAZARDS.find((x) => x.k === k); return h ? (h.s || h.n) : ''; };

  function checkProgress() {
    const st = store.get('check', {}); let n = 0, d = 0;
    CHECK.forEach((g) => g.items.forEach(([k]) => { n++; if (st[k]) d++; }));
    return { n, d, p: Math.round(d / n * 100) };
  }
  function todayQuiz() { const d = Math.floor((Date.now() + 9 * 3600e3) / 86400e3); return d % QUIZ.length; }

  // ---------- ホーム ----------
  function home() {
    const p = checkProgress();
    const saved = Object.keys(SH.saved());
    const hz = store.get('hz', 'quake');
    return `
    <div class="sec" style="margin-top:4px">災害が起きたら</div>
    <a class="em red" href="#/shake">${icon('alert')}<div><b>いま揺れている</b><small>まず身を守る</small></div>${icon('chevron', 'go')}</a>
    <a class="em navy" href="#/after">${icon('after')}<div><b>揺れがおさまった</b><small>次にやること</small></div>${icon('chevron', 'go')}</a>
    <a class="em blue" href="#/tsunami">${icon('wave')}<div><b>津波のおそれ</b><small>より高いところへ</small></div>${icon('chevron', 'go')}</a>
    <div class="sec">避難場所</div>
    <div class="box accent"><h3>${icon('pin')}近くの避難場所を探す</h3>
      <p>${saved.length ? '保存したデータで、電波がなくても探せます。' : '都道府県のデータを先に保存しておくと、電波がなくても探せます。'}</p>
      <div class="seg">${['quake', 'tsunami', 'flood', 'landslide'].map((k) => `<button class="${k === hz ? 'on' : ''}" data-hz="${k}">${icon(HAZARDS.find((h) => h.k === k).icon)}${hzName(k)}</button>`).join('')}</div>
      <a class="btn" href="#/find/go" style="margin-bottom:0">${icon('locate')}${saved.length ? '現在地から探す' : 'データを保存して探す'}</a></div>
    <div class="sec">ふだんのそなえ</div>
    <a class="prep" href="#/check"><div class="h"><b>そなえチェック</b><span>${p.d} / ${p.n}</span></div><div class="bar"><i style="width:${p.p}%"></i></div><p>${saved.length ? '避難場所データ：保存済み' : '避難場所データ：まだ保存していません'}</p></a>
    <div class="list" style="margin-top:12px">
      ${row('#/learn', 'book', '今日の1問', esc(QUIZ[todayQuiz()].q))}
      ${row('#/family', 'users', '家族メモ', '集合場所・連絡先・防災カード')}
      ${row('#/rinji', 'megaphone', '南海トラフ地震臨時情報', '発表されたら何をするか')}
      ${row('#/tools', 'light', 'ツール', 'ライト・呼び笛・経過タイマー・171')}
    </div>
    ${NOTICE}
    <p class="foot"><a href="#/about">このアプリについて・ご利用上の注意</a></p>`;
  }

  // ---------- 災害時 ----------
  function shake(placeId) {
    const cur = SHAKING.find((p) => p.id === placeId);
    if (!cur) {
      return `${back()}${head('alert', 'c-red', 'いま揺れている', 'どこにいますか？')}
      <div class="alert red">${icon('alert')}<span>まわりに声をかけながら、あわてずに、まず身の安全を確保。</span></div>
      <div class="list">${SHAKING.map((p) => row(`#/shake/${p.id}`, p.icon, esc(p.place), '')).join('')}</div>
      ${srcHtml(['jmaEew', 'mext'])}`;
    }
    return `${back('#/shake', '場所をえらぶ')}${head(cur.icon, 'c-red', esc(cur.place), 'いま揺れているとき')}
    ${steps(cur.items.map((t) => ({ t })), true)}
    <a class="btn" href="#/after">揺れがおさまったら${icon('chevron')}</a>
    ${srcHtml(cur.src)}`;
  }
  function after() {
    return `${back()}${head('after', 'c-orange', '揺れがおさまったら', '次にやること')}
    ${steps(AFTER)}
    <a class="btn" href="#/find/go">${icon('pin')}近くの避難場所を探す</a>
    <a class="btn plain" href="#/timer">${icon('timer')}地震からの経過時間をはかる</a>
    ${srcHtml(['jmaEew', 'mext', 'ntt'])}`;
  }
  function tsunami() {
    return `${back()}${head('wave', 'c-blue', '津波のおそれ', 'より高いところへ')}
    <div class="alert">${icon('wave')}<span>${esc(TSUNAMI.lead)}</span></div>
    <a class="btn red" href="#/find/tsunami">${icon('pin')}津波に対応した避難場所を探す</a>
    ${steps(TSUNAMI.items)}
    <a class="btn plain" href="#/timer">${icon('timer')}地震からの経過時間をはかる</a>
    ${srcHtml(TSUNAMI.src)}`;
  }
  function rinji() {
    return `${back()}${head('megaphone', 'c-amber', '南海トラフ地震臨時情報', '発表されたら')}
    <p class="lead">${esc(RINJI.lead)}</p>
    ${RINJI.types.map((t) => `<div class="kind ${t.color}"><h3>${esc(t.k)}</h3><p class="when">${esc(t.when)}</p><p>${esc(t.act)}</p></div>`).join('')}
    <div class="alert red">${icon('alert')}<span>${esc(RINJI.note)}</span></div>
    <a class="btn" href="#/check">${icon('check')}1週間のそなえをチェック</a>
    ${srcHtml(RINJI.src)}`;
  }

  // ---------- 避難場所 ----------
  let lastPos = null; // 現在地は画面を離れたら忘れる（保存しない）
  async function find(mode) {
    const idx = await SH.loadIndex();
    const saved = SH.saved();
    const codes = Object.keys(saved);
    let hz = store.get('hz', 'quake');
    if (mode && HAZARDS.some((h) => h.k === mode)) { hz = mode; store.set('hz', hz); }
    const prefOpts = idx ? Object.entries(idx.prefs).map(([c, p]) => `<option value="${c}">${esc(p.name)}（${p.n.toLocaleString()}か所・${Math.round(p.bytes / 1024 / 1024 * 10) / 10 || 0.1}MB）</option>`).join('') : '';
    const savedList = codes.map((c) => `<div class="saved"><div class="t"><b>${esc(PREFS[+c - 1])}</b><small>${saved[c].n.toLocaleString()}か所・データ取得日 ${esc(saved[c].updated || '不明')}</small></div><button class="btn ghost sm" data-del="${c}">削除</button></div>`).join('');
    return `${back()}${head('pin', 'c-blue', '避難場所を探す', '指定緊急避難場所（命を守るために緊急に避難する場所）')}
    <div class="sec" style="margin-top:4px">災害の種類</div>
    <div class="seg">${HAZARDS.map((h) => `<button class="${h.k === hz ? 'on' : ''}" data-hz="${h.k}">${icon(h.icon)}${esc(h.s || h.n)}</button>`).join('')}</div>
    <div class="note">${icon('info')}<span>避難場所は災害の種類ごとに指定されています。選んだ災害に対応する場所だけを表示します。</span></div>
    ${codes.length ? `<button class="btn" id="go">${icon('locate')}現在地から近い順に探す</button>` : `<div class="alert">${icon('download')}<span>まず下で、自宅や学校のある都道府県のデータを保存してください（電波があるときに1回だけ）。</span></div>`}
    <div id="out" aria-live="polite"></div>
    ${codes.length ? `<div class="sec">名前・住所で探す</div><input type="search" id="q" placeholder="例：〇〇小学校、〇〇町" enterkeyhint="search"><div id="qout" class="list" style="margin-top:10px" hidden></div>` : ''}
    <div class="sec">データの保存（この端末）</div>
    <div class="box">
      ${savedList ? `<div class="list">${savedList}</div>` : '<p>まだ保存していません。</p>'}
      <label style="display:block;margin-top:10px;font-weight:700">都道府県を選んで保存</label>
      <select id="pref"><option value="">選んでください</option>${prefOpts}</select>
      <button class="btn" id="dl" disabled>${icon('download')}保存する</button>
      <p class="ok" id="dlmsg" aria-live="polite"></p>
      <p class="small" style="margin:0">家と学校の都道府県がちがう場合は、両方保存できます。</p></div>
    <div class="note">${icon('alert')}<span>距離は「直線距離」で、安全な道順ではありません。川・がけ・浸水しそうな場所を通らないか、自分の目で確認してください。施設が実際に開いているかはわかりません。</span></div>
    <p class="src">出典：<a href="https://hinanmap.gsi.go.jp/index.html" target="_blank" rel="noopener">国土地理院「指定緊急避難場所・指定避難所データ」</a>をもとに Bousai Japan が都道府県ごとに加工して作成（取得日 ${esc(idx ? idx.fetched : '不明')}）。データは市町村が登録したもので、最新でない場合や未掲載の場合があります。最新かつ詳しい状況は、必ずお住まいの市町村に確認してください。データは随時更新されるため、保存したデータはときどき保存し直してください。</p>`;
  }
  function resCard(x, hz) {
    const r = x.r;
    const dir = x.d != null ? `<div class="dir"><span class="arr" style="transform:rotate(${Math.round(x.b)}deg)">${icon('arrow')}</span><b>${SH.fmtDist(x.d)}</b><small>${SH.dirName(x.b)}</small></div>` : '';
    return `<div class="res">${dir}<div><h3>${esc(r[0])}</h3><p>${esc(r[1])}</p>
      <div class="hz">${HAZARDS.map((h, i) => (r[4] & (1 << i)) ? `<span class="${h.k === hz ? 'on' : ''}">${esc(h.s || h.n)}</span>` : '').join('')}</div>
      <a href="https://maps.gsi.go.jp/#17/${r[2]}/${r[3]}/" target="_blank" rel="noopener">${icon('map')}地図で見る（通信が必要）</a></div></div>`;
  }
  async function bindFind() {
    const out = document.getElementById('out');
    const go = document.getElementById('go');
    const hzNow = () => store.get('hz', 'quake');
    const show = async () => {
      if (!lastPos) return;
      const list = await SH.nearest(lastPos.latitude, lastPos.longitude, hzNow(), 10);
      out.innerHTML = `<div class="sec">「${esc(hzName(hzNow()))}」に対応する近い避難場所</div>
        <p class="small" style="margin:-4px 0 8px">矢印は北を上にした方角です（位置の誤差：約${Math.round(lastPos.accuracy)}m）</p>
        ${list.length ? `<div class="list">${list.map((x) => resCard(x, hzNow())).join('')}</div>` : '<div class="note">保存したデータに、この災害に対応する避難場所が見つかりませんでした。別の都道府県のデータが必要かもしれません。</div>'}`;
    };
    if (go) go.addEventListener('click', async () => {
      go.disabled = true; out.innerHTML = '<div class="note">現在地を調べています…（屋外や窓の近くのほうが早くわかります）</div>';
      try { lastPos = await SH.locate(); await show(); } catch (e) { out.innerHTML = `<div class="note">${esc(e.message)}</div>`; }
      go.disabled = false;
    });
    view.querySelectorAll('[data-hz]').forEach((b) => b.addEventListener('click', async () => {
      store.set('hz', b.dataset.hz); view.querySelectorAll('[data-hz]').forEach((x) => x.classList.toggle('on', x === b)); await show(); qrun();
    }));
    const q = document.getElementById('q'); const qout = document.getElementById('qout');
    const qrun = async () => { if (!q) return; const list = await SH.search(q.value, hzNow(), 30); const html = list.map((x) => resCard(x, hzNow())).join(''); qout.hidden = !q.value.trim(); qout.innerHTML = html || '<div class="res"><p>見つかりませんでした（選んでいる災害の種類も確認してください）。</p></div>'; };
    if (q) q.addEventListener('input', qrun);
    const sel = document.getElementById('pref'); const dl = document.getElementById('dl'); const msg = document.getElementById('dlmsg');
    sel.addEventListener('change', () => { dl.disabled = !sel.value; });
    dl.addEventListener('click', async () => {
      dl.disabled = true; msg.textContent = 'ダウンロード中…';
      try { const j = await SH.download(sel.value); msg.textContent = `${j.pref}の避難場所 ${j.rows.length.toLocaleString()}か所を保存しました。`; setTimeout(render, 900); } catch (e) { msg.textContent = e.message; dl.disabled = false; }
    });
    view.querySelectorAll('[data-del]').forEach((b) => b.addEventListener('click', async () => { if (confirm('この都道府県のデータを端末から削除しますか？')) { await SH.remove(b.dataset.del); render(); } }));
    if (lastPos) await show();
  }

  // ---------- 学ぶ ----------
  function learn(i) {
    const n = i == null ? todayQuiz() : (+i % QUIZ.length);
    const q = QUIZ[n];
    const st = store.get('quiz', {});
    const correct = Object.values(st).filter((v) => v === 1).length;
    return `${head('book', 'c-violet', '防災トレーニング', `正解した問題 ${correct} / ${QUIZ.length}`)}
    <div class="box"><p class="small" style="margin:0 0 4px">${i == null ? '今日の1問' : `問題 ${n + 1} / ${QUIZ.length}`}</p><p class="q">${esc(q.q)}</p>
      ${q.a.map((a, k) => `<button class="opt" data-k="${k}"><span class="k">${'ABC'[k]}</span><span>${esc(a)}</span></button>`).join('')}
      <div id="exp"></div></div>
    <a class="btn plain" href="#/learn/${(n + 1) % QUIZ.length}">次の問題${icon('chevron')}</a>
    <div class="sec">知っておくこと</div>
    <div class="list">
      ${row('#/shake', 'alert', '場所ごとの身の守り方', '教室・家・登下校・電車など')}
      ${row('#/tsunami', 'wave', '津波から逃げる', 'より高いところへ')}
      ${row('#/rinji', 'megaphone', '南海トラフ地震臨時情報', '発表されたら何をするか')}
      ${row('#/171', 'phone', '災害用伝言ダイヤル171', '録音と再生のしかた')}
    </div>`;
  }
  function bindLearn(i) {
    const n = i == null ? todayQuiz() : (+i % QUIZ.length); const q = QUIZ[n];
    view.querySelectorAll('.opt').forEach((b) => b.addEventListener('click', () => {
      const k = +b.dataset.k; const st = store.get('quiz', {}); if (st[n] == null) { st[n] = k === q.c ? 1 : 0; store.set('quiz', st); }
      view.querySelectorAll('.opt').forEach((x) => { x.disabled = true; const kk = +x.dataset.k; if (kk === q.c) x.classList.add('right'); else if (kk === k) x.classList.add('wrong'); });
      document.getElementById('exp').innerHTML = `<div class="exp"><b>${k === q.c ? '正解です' : '正解は ' + 'ABC'[q.c] + '「' + esc(q.a[q.c]) + '」'}</b><p style="margin:6px 0 0">${esc(q.e)}</p>${srcHtml(q.src)}</div>`;
    }));
  }

  // ---------- そなえ ----------
  function check() {
    const st = store.get('check', {}); const p = checkProgress();
    return `${back()}${head('check', 'c-green', 'そなえチェック', 'この端末に保存されます')}
    <div class="prep"><div class="h"><b id="ckn">${p.d} / ${p.n} 完了</b><span>${p.p}%</span></div><div class="bar"><i style="width:${p.p}%"></i></div></div>
    ${CHECK.map((g) => `<div class="list" style="margin-top:12px"><div class="gh">${esc(g.g)}</div>${g.items.map(([k, t]) => `<label class="ck"><input type="checkbox" data-ck="${k}"${st[k] ? ' checked' : ''}><span>${esc(t)}</span></label>`).join('')}</div>`).join('')}
    <p class="small">準備の状況を確かめるための表示で、安全を保証するものではありません。</p>
    ${srcHtml('check')}`;
  }

  // ---------- 家族 ----------
  function family() {
    const f = FAMILY.get();
    return `${head('users', 'c-violet', '家族メモ', '家族で話し合って書いておく')}
    <div class="note">${icon('shield')}<span>この端末の中だけに保存され、どこにも送られません。別の端末では見られないので、カード画像やQRコードで家族にも渡しておきましょう。</span></div>
    <form id="fam" class="list form" autocomplete="off">${FAMILY_FIELDS.map(([k, l, ph]) => `<label>${esc(l)}${k === 'contacts' || k === 'memo' || k === 'school' ? `<textarea name="${k}" rows="3" placeholder="${esc(ph)}">${esc(f[k] || '')}</textarea>` : `<input name="${k}" value="${esc(f[k] || '')}" placeholder="${esc(ph)}">`}</label>`).join('')}
    <p class="ok" id="saved" aria-live="polite"></p></form>
    <button class="btn" id="mkcard">${icon('card')}ロック画面用のカード画像をつくる</button>
    <button class="btn plain" id="mkqr">${icon('qr')}QRコードで家族のスマホに渡す</button>
    <div id="famout"></div>
    <a class="btn plain" href="https://disaportal.gsi.go.jp/" target="_blank" rel="noopener">${icon('map')}ハザードマップで避難場所を確認する（通信）</a>`;
  }
  function bindFamily() {
    const fam = document.getElementById('fam');
    fam.addEventListener('input', () => { const f = {}; new FormData(fam).forEach((v, k) => { f[k] = v; }); document.getElementById('saved').textContent = FAMILY.set(f) ? '保存しました' : '保存できませんでした'; });
    const out = document.getElementById('famout');
    document.getElementById('mkcard').addEventListener('click', () => {
      const c = FAMILY.card(FAMILY.get());
      c.toBlob((b) => {
        const url = URL.createObjectURL(b);
        out.innerHTML = `<div class="box"><h3>${icon('card')}家族の防災カード</h3><img src="${url}" alt="家族の防災カード" style="width:100%;border-radius:8px;border:1px solid var(--line)"><a class="btn" href="${url}" download="bousai-card.png">${icon('download')}画像を保存</a><p class="small">iPhoneは画像を長押しして「写真に保存」もできます。ロック画面の壁紙にすると、スマホを開けなくても見られます。</p></div>`;
      }, 'image/png');
    });
    document.getElementById('mkqr').addEventListener('click', () => {
      const url = FAMILY.shareUrl(FAMILY.get());
      if (url.length > 1800) { out.innerHTML = '<div class="note">内容が長すぎてQRコードにできません。メモを短くしてください。</div>'; return; }
      out.innerHTML = `<div class="box"><h3>${icon('qr')}家族のスマホのカメラで読み取る</h3><div class="qrbox">${FAMILY.qrSvg(url)}</div><p class="small">QRコードの中に内容が入っています（サーバーは通りません）。読み取った人が「保存する」を押すと、その人の端末にも保存されます。人に見せたくない内容が入っていないか確認してから使ってください。</p></div>`;
    });
  }
  function importView(token) {
    let f = null; try { f = FAMILY.decode(token); } catch (e) { /* 不正 */ }
    if (!f) return `${head('users', 'c-violet', '家族メモの受け取り', '')}<div class="note">読み取った内容をひらけませんでした。</div><a class="btn" href="#/">ホームへ</a>`;
    return `${head('users', 'c-violet', '家族メモの受け取り', '内容を確認してください')}
    <div class="box">${FAMILY_FIELDS.filter(([k]) => f[k]).map(([k, l]) => `<p><b>${esc(l)}</b><br>${esc(f[k]).replace(/\n/g, '<br>')}</p>`).join('') || '<p>空のメモです。</p>'}</div>
    <button class="btn" id="imp">${icon('download')}この端末に保存する</button><a class="btn plain" href="#/">保存しない</a>
    <p class="small">保存すると、この端末の家族メモが上書きされます。</p>`;
  }

  // ---------- ツール ----------
  function tools() {
    return `${back()}${head('light', 'c-blue', 'ツール', '')}
    <div class="list">
      <button class="row" id="btn-light">${icon('light')}<span class="t"><b>ライト</b><small>画面を白く光らせる</small></span></button>
      <button class="row" id="btn-whistle">${icon('whistle')}<span class="t"><b id="wl">呼び笛</b><small>音で助けを呼ぶ（もう一度押すと止まる）</small></span></button>
      ${row('#/timer', 'timer', '経過タイマー', '地震から何分たったか')}
      ${row('#/171', 'phone', '災害用伝言ダイヤル171', '録音と再生のしかた')}
    </div>
    <p class="small">ライトは画面の明かりで、懐中電灯の代わりにはなりません。呼び笛は、端末の音量やマナーモードによっては鳴りません。</p>
    <div class="sec">公式の情報（通信が必要）</div>
    <div class="list">${LINKS.map((l) => `<a class="row" href="${l.url}" target="_blank" rel="noopener">${icon('info')}<span class="t"><b style="font-size:15px">${esc(l.name)}</b></span><span class="end">${icon('chevron')}</span></a>`).join('')}</div>`;
  }
  let tick = null;
  function timer() {
    const start = store.get('quakeStart', null);
    return `${back('#/tools', 'ツール')}${head('timer', 'c-blue', '地震からの経過時間', '')}
    <p class="lead">揺れ始めたら押すと、何分たったかがわかります。津波は、早いところでは地震から数分で来ると想定されています。</p>
    <div class="clock" id="clock">${start ? '' : '--:--'}</div>
    <button class="btn red" id="t-start">${start ? 'いまからはかり直す' : '揺れ始めた（スタート）'}</button>
    ${start ? '<button class="btn plain" id="t-reset">リセット</button>' : ''}`;
  }
  function t171() {
    return `${back()}${head('phone', 'c-green', '災害用伝言ダイヤル「171」', '声の伝言板')}
    <p class="lead">大きな災害で電話がつながりにくいときに提供される、声の伝言板です。</p>
    <div class="sec" style="margin-top:0">伝言を録音する</div>
    ${steps([{ t: '171 に電話する' }, { t: '1 を押す' }, { t: '自分の家などの電話番号を、市外局番から入力' }, { t: '案内にしたがって録音する' }])}
    <div class="sec">伝言を聞く</div>
    ${steps([{ t: '171 に電話する' }, { t: '2 を押す' }, { t: '相手の電話番号を、市外局番から入力' }, { t: '案内にしたがって再生する' }])}
    <p class="small">どの番号を使うか、家族で決めておきましょう（家族メモに書けます）。インターネットの「web171」もあります。毎月1日・15日などに体験利用ができます。</p>
    <a class="btn" href="tel:171">${icon('phone')}171 に電話する</a>
    ${srcHtml('ntt')}`;
  }
  function about() {
    return `${back()}${head('info', 'c-blue', 'このアプリについて', 'ご利用上の注意')}
    <div class="box"><p>Bousai Japan は、防災の知識を身につけ、災害時に「次に何をするか」を判断するのを助ける、無料の防災Webアプリです。</p></div>
    <div class="box"><h3>${icon('alert')}ご利用上の注意</h3>
      <p>このアプリは、気象庁や自治体などの災害情報を受け取ったり配信したりするものではありません。</p>
      <p>防災情報や避難場所データは公式機関の資料をもとにしていますが、更新の時期などにより、実際の状況と異なる場合があります。避難場所が実際に開いているかどうかはわかりません。</p>
      <p>災害のときは、まわりの危険と、自治体・消防・警察・学校などの指示や最新の情報を最優先にしてください。</p>
      <p>表示される距離は直線距離で、安全な道順や所要時間を示すものではありません。GPSは屋内や地下で大きくずれることがあります。</p>
      <p>電波がなくても使えるのは、最後に保存した時点の情報です。チェック・家族メモ・保存した避難場所データはこの端末の中だけにあり、ブラウザのデータを消すと消えます。</p>
      <p>本アプリは行動を助けるための道具で、安全を保証するものではありません。日頃から地域のハザードマップや避難場所を確認し、家族や学校と避難方法を話し合っておきましょう。</p></div>
    <div class="box"><h3>${icon('shield')}プライバシー</h3><p>現在地・家族メモ・チェックの内容は外部に送信しません。現在地は避難場所の距離の計算にだけ使い、保存しません。「地図で見る」や公式サイトへのリンクを開くと、その先のサイトに通信が発生します。</p></div>
    <div class="box"><h3>${icon('book')}出典</h3>${Object.values(SRC).map((s) => `<p style="font-size:14px"><a href="${s.url}" target="_blank" rel="noopener">${esc(s.name)}</a></p>`).join('')}
      <p style="font-size:14px">避難場所データ：国土地理院「指定緊急避難場所・指定避難所データ」をもとに Bousai Japan が加工して作成（公共データ利用規約 第1.0版）。</p>
      <p style="font-size:14px">QRコード：QR Code Generator for JavaScript（Kazuhiko Arase, MIT License）。QRコードは株式会社デンソーウェーブの登録商標です。</p></div>
    <button class="btn plain" id="wipe">この端末の保存データを消す</button>`;
  }

  // ---------- ルーター ----------
  const NAV = [['', 'home', 'ホーム'], ['find', 'pin', '避難場所'], ['learn', 'book', '学ぶ'], ['family', 'users', '家族']];
  function nav(r) {
    const tab = ['find'].includes(r) ? 'find' : ['learn'].includes(r) ? 'learn' : ['family', 'import'].includes(r) ? 'family' : '';
    document.getElementById('nav').innerHTML = NAV.map(([h, ic, t]) => `<a href="#/${h}" class="${h === tab ? 'on' : ''}"${h === tab ? ' aria-current="page"' : ''}>${icon(ic)}${t}</a>`).join('');
  }
  function badge() {
    const b = document.getElementById('badge'); const s = Object.keys(SH.saved());
    b.className = 'badge' + (s.length ? '' : ' off');
    b.innerHTML = s.length ? `${icon('pin')}${esc(s.map((c) => PREFS[+c - 1]).join('・'))}` : `${icon('download')}避難場所 未保存`;
  }
  async function render() {
    clearInterval(tick);
    const h = (location.hash || '#/').slice(2).split('/');
    const r = h[0] || '';
    nav(r); badge();
    let html;
    switch (r) {
      case 'shake': html = shake(h[1]); break;
      case 'after': html = after(); break;
      case 'tsunami': html = tsunami(); break;
      case 'rinji': html = rinji(); break;
      case 'find': html = await find(h[1]); break;
      case 'learn': html = learn(h[1]); break;
      case 'check': html = check(); break;
      case 'family': html = family(); break;
      case 'import': html = importView(h[1] || ''); break;
      case 'tools': html = tools(); break;
      case 'timer': html = timer(); break;
      case '171': html = t171(); break;
      case 'about': html = about(); break;
      default: html = home();
    }
    view.innerHTML = html;
    window.scrollTo(0, 0);
    bind(r, h);
  }
  function bind(r, h) {
    view.querySelectorAll('[data-ck]').forEach((el) => el.addEventListener('change', () => { const st = store.get('check', {}); st[el.dataset.ck] = el.checked; store.set('check', st); const p = checkProgress(); const bar = view.querySelector('.bar i'); if (bar) bar.style.width = p.p + '%'; const b = document.getElementById('ckn'); if (b) { b.textContent = `${p.d} / ${p.n} 完了`; b.nextElementSibling.textContent = p.p + '%'; } }));
    if (r === '') view.querySelectorAll('[data-hz]').forEach((b) => b.addEventListener('click', () => { store.set('hz', b.dataset.hz); view.querySelectorAll('[data-hz]').forEach((x) => x.classList.toggle('on', x === b)); }));
    if (r === 'find') { bindFind().then(() => { if (h[1] === 'go' || HAZARDS.some((x) => x.k === h[1])) { const g = document.getElementById('go'); if (g && !lastPos) g.click(); } }); }
    if (r === 'learn') bindLearn(h[1]);
    if (r === 'family') bindFamily();
    if (r === 'import') { const b = document.getElementById('imp'); if (b) b.addEventListener('click', () => { FAMILY.set(FAMILY.decode(h[1])); location.hash = '#/family'; }); }
    const bl = document.getElementById('btn-light'); if (bl) bl.addEventListener('click', lightOn);
    const bw = document.getElementById('btn-whistle'); if (bw) bw.addEventListener('click', whistle);
    const ts = document.getElementById('t-start'); if (ts) ts.addEventListener('click', () => { store.set('quakeStart', Date.now()); render(); });
    const tr = document.getElementById('t-reset'); if (tr) tr.addEventListener('click', () => { store.set('quakeStart', null); render(); });
    const clock = document.getElementById('clock');
    if (clock && store.get('quakeStart', null)) {
      const upd = () => { const s = Math.max(0, Math.floor((Date.now() - store.get('quakeStart', Date.now())) / 1000)); const hh = Math.floor(s / 3600), mm = Math.floor(s % 3600 / 60), ss = s % 60; clock.textContent = (hh ? hh + ':' + String(mm).padStart(2, '0') : mm) + ':' + String(ss).padStart(2, '0'); };
      upd(); tick = setInterval(upd, 500);
    }
    const wipe = document.getElementById('wipe');
    if (wipe) wipe.addEventListener('click', async () => { if (confirm('チェック・家族メモ・トレーニング・タイマー・保存した避難場所データを、この端末から消します。よろしいですか？')) { for (const c of Object.keys(SH.saved())) await SH.remove(c); ['check', 'family', 'quakeStart', 'quiz', 'hz'].forEach((k) => store.del(k)); location.hash = '#/'; } });
  }

  // ---------- ライト・呼び笛 ----------
  const light = document.getElementById('light'); let wakeLock = null;
  async function lightOn() { light.hidden = false; try { if ('wakeLock' in navigator) wakeLock = await navigator.wakeLock.request('screen'); } catch (e) { /* 使えない端末 */ } }
  document.getElementById('light-off').addEventListener('click', () => { light.hidden = true; if (wakeLock) { wakeLock.release().catch(() => {}); wakeLock = null; } });
  let ac = null, osc = null;
  function whistle() {
    const lab = document.getElementById('wl');
    if (osc) { osc.stop(); osc = null; if (lab) lab.textContent = '呼び笛'; return; }
    ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume();
    osc = ac.createOscillator(); const g = ac.createGain(); osc.type = 'square'; osc.frequency.value = 3000;
    const t0 = ac.currentTime; g.gain.setValueAtTime(0, t0);
    for (let i = 0; i < 600; i++) { const b = t0 + Math.floor(i / 3) * 3 + (i % 3) * 0.5; g.gain.setValueAtTime(0.35, b); g.gain.setValueAtTime(0, b + 0.3); }
    osc.connect(g).connect(ac.destination); osc.start(); if (lab) lab.textContent = '止める';
  }

  const net = document.getElementById('net');
  const upd = () => { net.hidden = navigator.onLine; };
  window.addEventListener('online', upd); window.addEventListener('offline', upd); upd();
  if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  window.addEventListener('hashchange', render);
  render();
})();
