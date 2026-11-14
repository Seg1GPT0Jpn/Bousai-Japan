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
    <section class="emb" aria-labelledby="emh"><h2 id="emh">${icon('alert')}災害が起きたら</h2>
    <a class="em red" href="#/shake">${icon('alert')}<div><b>いま揺れている</b><small>まず身を守る</small></div>${icon('chevron', 'go')}</a>
    <a class="em navy" href="#/after">${icon('after')}<div><b>揺れがおさまった</b><small>次にやること</small></div>${icon('chevron', 'go')}</a>
    <a class="em blue" href="#/tsunami">${icon('wave')}<div><b>津波のおそれ</b><small>より高いところへ</small></div>${icon('chevron', 'go')}</a>
    </section>
    ${setupLeft() ? `<a class="box accent" href="#/start" style="display:block;text-decoration:none;border-top-color:var(--orange)"><h3>${icon('check')}はじめての準備（あと${setupLeft()}つ）</h3><p style="margin:0">電波があるうちに、避難場所データの保存などをすませておきましょう。</p></a>` : ''}
    <div class="sec">いまの状況<a href="#/info">くわしく${icon('chevron')}</a></div>
    <div id="hb"></div><div id="live">${liveSkeleton()}</div>
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
      ${row('#/weather', 'wave', '天気と雨雲レーダー', '近くの気温・湿度・雨、天気予報')}
      ${row('#/rain', 'flood', '大雨・台風のとき', '警戒レベルと、とるべき行動')}
      ${row('#/rinji', 'megaphone', '南海トラフ地震臨時情報', '発表されたら何をするか')}
      ${row('#/g/kitaku', 'train', '帰れなくなったとき', '外出先で大きな地震にあったら')}
      ${row('#/g/fire', 'fire', '地震のあとの火事', 'ブレーカー・電気の火事を防ぐ')}
      ${row('#/g/health', 'users', '避難所での健康', 'エコノミークラス症候群・熱中症・トイレ')}
      ${row('#/tools', 'phone', 'いざという時の道具', '家族に無事を知らせる・居場所を伝える・助けを呼ぶ')}
    </div>
    ${NOTICE}
    <p class="foot"><a href="#/start">はじめての準備</a>　｜　<a href="#/lang">Language・言語</a>　｜　<a href="#/about">このアプリについて・文字の大きさ</a>　｜　<a href="#/privacy">プライバシーポリシー</a></p>`;
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

  function guide(k) {
    const g = GUIDES[k]; if (!g) return home();
    return `${back()}${head(g.icon, g.color, g.title, g.sub)}
    <p class="lead">${esc(g.lead)}</p>
    ${g.alert ? `<div class="alert">${icon('alert')}<span>${esc(g.alert)}</span></div>` : ''}
    ${g.parts.map((p) => `<div class="sec">${esc(p.h)}</div>${steps(p.items)}`).join('')}
    ${g.after || ''}
    ${srcHtml(g.src)}`;
  }

  function rain() {
    return `${back()}${head('flood', 'c-blue', '大雨・台風のとき', '洪水・土砂災害・高潮')}
    <p class="lead">${esc(RAIN.lead)}</p>
    <div class="sec" style="margin-top:0">警戒レベルと、とるべき行動</div>
    <div class="list">${LEVELS.map((l) => `${l.lv === 4 ? '<div class="lvsep">～～ 警戒レベル４までに必ず避難！ ～～</div>' : ''}<div class="lvrow${l.lv === 4 || l.lv === 3 ? ' em3' : ''}"><span class="lvn" style="background:${l.color};color:${l.fg}">警戒<br>レベル<b>${l.lv}</b></span><div><b>${esc(l.act)}</b><p>${esc(l.info)}（${esc(l.by)}）${l.jma ? `<br><span class="small">気象庁の情報：${esc(l.jma)}</span>` : ''}</p>${l.note ? `<p class="small">${esc(l.note)}</p>` : ''}</div></div>`).join('')}</div>
    <p class="small">警戒レベルに相当する気象情報が出ても、同じ時刻に同じレベルの避難情報が出るとは限りません。</p>
    <ol class="steps">${RAIN.points.map((a) => `<li><b>${esc(a.t)}</b><p>${esc(a.d)}</p>${a.link ? `<a href="${a.link}">避難場所とハザードマップを確認${icon('chevron')}</a>` : ''}</li>`).join('')}</ol>
    <div class="list">
      <a class="row" href="${LIVE.links.risk}" target="_blank" rel="noopener">${icon('map')}<span class="t"><b>キキクル（大雨の危険度分布）</b><small>気象庁</small></span><span class="end">${icon('chevron')}</span></a>
      <a class="row" href="${MAP.hazPortal()}" target="_blank" rel="noopener">${icon('flood')}<span class="t"><b>重ねるハザードマップ</b><small>家や学校が危険な区域か確かめる</small></span><span class="end">${icon('chevron')}</span></a>
      ${row('#/info', 'bell', 'いまの警報・注意報', '自分の地域の情報')}
    </div>
    ${srcHtml(RAIN.src)}`;
  }

  function weather() {
    const a = LIVE.area();
    return `${back()}${head('wave', 'c-amber', '天気と雨雲レーダー', '避難所で過ごすときや、雨の様子を知りたいときに')}
    <div class="sec" style="margin-top:0">いまの気温・湿度（近くの観測所）</div>
    <div class="box" id="wnow"><button class="btn" id="wgo" style="margin:0">${icon('locate')}現在地の近くの観測値を見る</button>
      <p class="small" style="margin:8px 0 0">気象庁のアメダス（全国の観測所）のうち、現在地に近いところの最新の値を出します。現在地は計算にだけ使い、送りません。</p></div>
    <div class="sec">天気予報${a ? `（${esc(a.officeName)}）` : ''}</div>
    <div class="box" id="wfc">${a ? '読みこみ中…' : `地域を設定すると表示します。<a class="btn plain" href="#/info" style="margin-bottom:0">地域を設定する</a>`}</div>
    <div class="sec">雨雲レーダー<a href="${LIVE.links.rain}" target="_blank" rel="noopener">気象庁で見る${icon('chevron')}</a></div>
    <div id="radar" class="map" style="height:380px" role="img" aria-label="雨雲レーダーの地図"></div>
    <div class="box" style="padding:12px 16px">
      <div style="display:flex;align-items:center;gap:10px"><button class="btn sm" id="rplay">${icon('timer')}再生</button><b id="rtime" style="font-variant-numeric:tabular-nums">…</b></div>
      <input type="range" id="rslider" min="0" max="0" value="0" style="width:100%;margin:10px 0 4px" aria-label="時刻">
      <div class="small" style="display:flex;justify-content:space-between"><span>1時間前</span><span>現在</span><span>1時間後（予測）</span></div>
      <div style="display:flex;align-items:center;gap:8px;margin-top:8px"><span class="small">弱い雨</span><span style="flex:1;height:10px;border-radius:5px;background:linear-gradient(90deg,#A0D2FF,#218CFF,#0041FF,#FAF500,#FF9900,#FF2800,#B40068)"></span><span class="small">猛烈な雨</span></div>
    </div>
    <div class="list">
      <a class="row" href="https://www.wbgt.env.go.jp/" target="_blank" rel="noopener">${icon('info')}<span class="t"><b>熱中症予防情報（暑さ指数）</b><small>環境省</small></span><span class="end">${icon('chevron')}</span></a>
      <a class="row" href="${LIVE.links.risk}" target="_blank" rel="noopener">${icon('map')}<span class="t"><b>キキクル（大雨の危険度分布）</b><small>気象庁</small></span><span class="end">${icon('chevron')}</span></a>
    </div>
    <p class="src">出典：<a href="https://www.jma.go.jp/bosai/" target="_blank" rel="noopener">気象庁ホームページ</a>（アメダス・天気予報・高解像度降水ナウキャスト）のデータをもとに Bousai Japan が加工して表示。観測所の値は、現在地の値と同じとは限りません。</p>`;
  }
  let rmap = null;
  async function bindWeather() {
    const $ = (id) => document.getElementById(id); const a = LIVE.area(); rmap = null;
    $('wgo').addEventListener('click', async () => {
      $('wnow').innerHTML = '<p>現在地と観測値を調べています…</p>';
      try {
        const p = await SH.locate(); lastPos = p; if (rmap) rmap.setView([p.latitude, p.longitude], 9); const w = await LIVE.amedasNear(p.latitude, p.longitude);
        const cell = (lab, x, unit, extra = '') => `<div class="wc"><span class="small">${lab}</span><b>${x ? `${x.v}<small>${unit}</small>` : '－'}</b>${extra}${x ? `<span class="small">${esc(x.name)}（約${SH.fmtDist(x.d)}）</span>` : ''}</div>`;
        $('wnow').innerHTML = `<div class="wgrid">${cell('気温', w.temp, '℃')}${cell('湿度', w.humidity, '%')}${cell('1時間の雨', w.rain, 'mm')}${cell('風', w.wind, 'm/s', w.windDir != null ? `<span class="small">${LIVE.DIR16[w.windDir] || ''}の風</span>` : '')}</div><p class="small" style="margin:8px 0 0">${LIVE.fmtTime(w.time)} の観測</p>`;
      } catch (e) { $('wnow').innerHTML = `<p>${esc(e.message || '取得できませんでした')}</p>`; }
    });
    if (a) {
      try { await LIVE.municipalities(a.office); } catch (e) { /* 市区町村の表がなくても予報は出せる */ }
      LIVE.forecast(a).then((f) => {
        const hh = (t) => new Date(t).getHours();
        $('wfc').innerHTML = `<p class="small" style="margin:0 0 6px">${esc(f.area)}　${LIVE.fmtTime(f.at)} 発表</p>
          ${f.days.map((d, i) => `<p style="margin:4px 0"><b>${i ? '明日' : '今日'}</b>　${esc((d.w || '').replace(/　/g, ' '))}</p>`).join('')}
          <p style="margin:8px 0 4px"><b>降水確率</b>　${f.pops.map((x) => `${hh(x.t)}時〜 ${x.p}%`).join('　')}</p>
          <p style="margin:4px 0 0"><b>気温（${esc(f.temps.name)}）</b>　${f.temps.v.map((v, i) => `${i % 2 ? '日中の最高' : '朝の最低'} ${v}℃`).join('　')}</p>`;
      }).catch(() => { $('wfc').textContent = '取得できませんでした（通信を確認してください）'; });
    }
    if (!MAP.ok()) { $('radar').outerHTML = '<div class="note">雨雲レーダーは通信があるときだけ見られます。</div>'; return; }
    const ctr = lastPos ? [lastPos.latitude, lastPos.longitude] : [36.2, 138.3];
    const m = L.map('radar', { zoomControl: true }).setView(ctr, lastPos ? 9 : 5); rmap = m;
    L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png', { maxZoom: 14, attribution: '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank" rel="noopener">地理院タイル</a>' }).addTo(m);
    let times = []; try { times = await LIVE.radarTimes(); } catch (e) { $('rtime').textContent = '取得できませんでした'; return; }
    const nowIdx = times.findIndex((x) => x.f) - 1;
    const layers = times.map((x) => L.tileLayer(LIVE.radarUrl(x), { opacity: 0, maxNativeZoom: 10, maxZoom: 14, minZoom: 4, attribution: '気象庁 高解像度降水ナウキャスト' }));
    layers.forEach((l) => l.addTo(m));
    const sl = $('rslider'); sl.max = times.length - 1; sl.value = nowIdx;
    const show = (i) => { layers.forEach((l, k) => l.setOpacity(k === +i ? 0.75 : 0)); const t = LIVE.utcToLocal(times[i].validtime); $('rtime').textContent = `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}${times[i].f ? '（予測）' : (+i === nowIdx ? '（現在）' : '')}`; };
    sl.addEventListener('input', () => show(sl.value)); show(nowIdx);
    let play = null;
    $('rplay').addEventListener('click', () => { if (play) { clearInterval(play); play = null; return; } let i = 0; play = setInterval(() => { sl.value = i; show(i); i = (i + 1) % times.length; }, 700); });
    window.addEventListener('hashchange', () => { if (play) clearInterval(play); }, { once: true });
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
    const jo = store.get('kind', 'basho') === 'jo';
    const savedList = codes.map((c) => `<div class="saved"><div class="t"><b>${esc(PREFS[+c - 1])}</b><small>避難場所 ${saved[c].n.toLocaleString()}・避難所 ${saved[c].nJo != null ? saved[c].nJo.toLocaleString() : '未保存（保存し直してください）'}・取得日 ${esc(saved[c].updated || '不明')}</small></div><button class="btn ghost sm" data-del="${c}">削除</button></div>`).join('');
    return `${back()}${head('pin', 'c-blue', jo ? '避難所を探す' : '避難場所を探す', jo ? '指定避難所（危険がなくなるまで、しばらく過ごす施設）' : '指定緊急避難場所（命を守るために緊急に避難する場所）')}
    <div class="seg" role="group" aria-label="探すもの"><button data-kind="basho" class="${jo ? '' : 'on'}">${icon('alert')}避難場所（まず逃げる）</button><button data-kind="jo" class="${jo ? 'on' : ''}">${icon('home')}避難所（しばらく過ごす）</button></div>
    ${jo ? `<div class="alert red">${icon('alert')}<span>災害が起きたときは、避難所ではなく、その災害に対応した「避難場所」へ逃げてください。避難所は、危険がなくなるまで一時的に過ごす施設です。</span></div>
    <div class="list"><a class="row" href="https://vacan.com/map" target="_blank" rel="noopener">${icon('users')}<span class="t"><b>避難所の混雑状況を見る（VACAN Maps）</b><small>導入している自治体の避難所は、職員が「空いています・やや混雑・混雑・満」を更新しています</small></span><span class="end">${icon('chevron')}</span></a></div>
    <p class="small" style="margin:-4px 0 12px">すべての自治体・避難所がのっているわけではありません。お住まいの自治体の防災ページや、防災無線・広報の情報も確認してください。</p>`
    : `<div class="sec" style="margin-top:4px">災害の種類</div>
    <div class="seg">${HAZARDS.map((h) => `<button class="${h.k === hz ? 'on' : ''}" data-hz="${h.k}">${icon(h.icon)}${esc(h.s || h.n)}</button>`).join('')}</div>
    <div class="note">${icon('info')}<span>避難場所は災害の種類ごとに指定されています。選んだ災害に対応する場所だけを表示します。</span></div>`}
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
      <p class="small" style="margin:0">避難場所と避難所のデータを一緒に保存します。家と学校の都道府県がちがう場合は、両方保存できます。</p></div>
    <div class="note">${icon('alert')}<span>距離は「直線距離」で、安全な道順ではありません。川・がけ・浸水しそうな場所を通らないか、自分の目で確認してください。施設が実際に開いているかはわかりません。</span></div>
    <p class="src">出典：<a href="https://hinanmap.gsi.go.jp/index.html" target="_blank" rel="noopener">国土地理院「指定緊急避難場所・指定避難所データ」</a>をもとに Bousai Japan が都道府県ごとに加工して作成（取得日 ${esc(idx ? idx.fetched : '不明')}）。データは市町村が登録したもので、最新でない場合や未掲載の場合があります。最新かつ詳しい状況は、必ずお住まいの市町村に確認してください。データは随時更新されるため、保存したデータはときどき保存し直してください。</p>`;
  }
  function resCard(x, hz, jo) {
    const r = x.r;
    const dir = x.d != null ? `<div class="dir"><span class="arr" style="transform:rotate(${Math.round(x.b)}deg)">${icon('arrow')}</span><b>${SH.fmtDist(x.d)}</b><small>${SH.dirName(x.b)}</small></div>` : '';
    return `<div class="res">${dir}<div><h3>${x.i != null ? `${x.i + 1}. ` : ''}${esc(r[0])}</h3><p>${esc(r[1])}</p>
      <div class="hz">${jo ? `${r[4] ? '<span>指定緊急避難場所と同じ住所</span>' : ''}${r[5] ? `<span>受入対象：${esc(r[5])}</span>` : ''}` : HAZARDS.map((h, i) => (r[4] & (1 << i)) ? `<span class="${h.k === hz ? 'on' : ''}">${esc(h.s || h.n)}</span>` : '').join('')}</div>
      <div class="links2"><a href="${MAP.gmapsWalk(r[2], r[3])}" target="_blank" rel="noopener">${icon('route')}Googleマップで歩くルート</a><a href="${MAP.gsiMap(r[2], r[3])}" target="_blank" rel="noopener">${icon('map')}地理院地図</a></div></div></div>`;
  }
  async function bindFind() {
    const out = document.getElementById('out');
    const go = document.getElementById('go');
    const hzNow = () => store.get('hz', 'quake');
    const jo = store.get('kind', 'basho') === 'jo';
    view.querySelectorAll('[data-kind]').forEach((b) => b.addEventListener('click', () => { store.set('kind', b.dataset.kind); render(); }));
    const show = async () => {
      if (!lastPos) return;
      const list = await SH.nearest(lastPos.latitude, lastPos.longitude, hzNow(), 10, jo);
      out.innerHTML = `<div class="sec">${jo ? '近い避難所' : `「${esc(hzName(hzNow()))}」に対応する近い避難場所`}</div>
        <p class="small" style="margin:-4px 0 8px">矢印は北を上にした方角です（位置の誤差：約${Math.round(lastPos.accuracy)}m）</p>
        ${list.length && MAP.ok() ? '<div id="fmap" class="map" role="img" aria-label="現在地と近くの避難場所の地図"></div>' : ''}
        ${list.length ? `<div class="list">${list.map((x, i) => resCard({ ...x, i }, hzNow(), jo)).join('')}</div>` : `<div class="note">${jo ? '保存したデータに避難所が見つかりませんでした。データを保存し直すか、別の都道府県のデータが必要かもしれません。' : '保存したデータに、この災害に対応する避難場所が見つかりませんでした。別の都道府県のデータが必要かもしれません。'}</div>`}
        ${list.length && MAP.ok() && !jo ? `<p class="small" style="margin:-4px 0 12px">地図の左下で、浸水や土砂災害の危険がある区域を重ねて表示できます（色が濃いほど深い浸水が想定されています）。<a href="https://disaportal.gsi.go.jp/hazardmapportal/hazardmap/copyright/img/shinsui_legend3.png" target="_blank" rel="noopener">浸水の深さの凡例</a>・<a href="${MAP.hazPortal(lastPos.latitude.toFixed(5), lastPos.longitude.toFixed(5))}" target="_blank" rel="noopener">重ねるハザードマップで現在地を見る</a></p>` : ''}
        <div class="note">${icon('route')}<span>「Googleマップで歩くルート」は、Googleマップが道順を出します。ルートは浸水・がけ・通行止めなどの危険を考えていません。周りの状況を自分の目で確かめて、危ない道は避けてください。開くと、目的地と現在地がGoogleに送られます。</span></div>`;
      const el = document.getElementById('fmap');
      if (el) {
        const m = MAP.make(el, lastPos.latitude, lastPos.longitude, 15);
        if (!jo) MAP.hazLayers(m, ['flood', 'tsunami', 'landslide', 'storm'].includes(hzNow()) ? hzNow() : (hzNow() === 'inland' ? 'flood' : null));
        L.marker([lastPos.latitude, lastPos.longitude], { icon: MAP.dot('#0017C1', '') }).addTo(m).bindPopup('現在地（およそ）');
        const pts = [[lastPos.latitude, lastPos.longitude]];
        list.forEach((x, i) => { const r = x.r; pts.push([r[2], r[3]]); L.marker([r[2], r[3]], { icon: MAP.dot('#197A4B', i + 1) }).addTo(m).bindPopup(`<b>${esc(r[0])}</b><br>${SH.fmtDist(x.d)}（直線）<br><a href="${MAP.gmapsWalk(r[2], r[3])}" target="_blank" rel="noopener">Googleマップで歩くルート</a>`); });
        m.fitBounds(pts, { padding: [24, 24], maxZoom: 16 });
      }
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
    const qrun = async () => { if (!q) return; const list = await SH.search(q.value, hzNow(), 30, jo); const html = list.map((x) => resCard(x, hzNow(), jo)).join(''); qout.hidden = !q.value.trim(); qout.innerHTML = html || '<div class="res"><p>見つかりませんでした（選んでいる災害の種類も確認してください）。</p></div>'; };
    if (q) q.addEventListener('input', qrun);
    const sel = document.getElementById('pref'); const dl = document.getElementById('dl'); const msg = document.getElementById('dlmsg');
    sel.addEventListener('change', () => { dl.disabled = !sel.value; });
    dl.addEventListener('click', async () => {
      dl.disabled = true; msg.textContent = 'ダウンロード中…';
      try { const j = await SH.download(sel.value); msg.textContent = `${j.pref}の避難場所 ${j.rows.length.toLocaleString()}か所を保存しました。`; setTimeout(render, 900); } catch (e) { msg.textContent = e.message; dl.disabled = false; }
    });
    view.querySelectorAll('[data-del]').forEach((b) => b.addEventListener('click', async () => { if (confirm(I18N.tr('この都道府県のデータを端末から削除しますか？'))) { await SH.remove(b.dataset.del); render(); } }));
    if (lastPos) await show();
  }

  // ---------- いまの状況（気象庁） ----------
  const SRC_JMA = `<p class="src">出典：<a href="https://www.jma.go.jp/bosai/" target="_blank" rel="noopener">気象庁ホームページ</a>のデータをもとに Bousai Japan が加工して表示。気象庁が発表した内容を表示しているもので、このアプリが警報を出すものではありません。通信の状況により最新でない場合があるので、発表時刻を確かめ、気象庁や自治体の情報も確認してください。</p>`;
  function liveSkeleton() {
    const a = LIVE.area();
    if (!a) return `<a class="live" href="#/info" style="display:block;text-decoration:none"><div class="lh">${icon('bell')}<b>地域を設定すると、警報・注意報がここに出ます</b>${icon('chevron')}</div></a>`;
    return `<div class="live"><div class="lh">${icon('pin')}<b>${esc(a.c20Name || a.officeName)}</b><small id="lt">読みこみ中…</small></div>
      <a class="lr" href="#/info">${''}<span class="lab">警報・注意報</span><span class="val" id="lw">…</span>${icon('chevron')}</a>
      <a class="lr" href="#/info"><span class="lab">津波</span><span class="val" id="lts">…</span>${icon('chevron')}</a>
      <a class="lr" href="#/info"><span class="lab">最新の地震</span><span class="val" id="lq">…</span>${icon('chevron')}</a>
      <div class="lr"><span class="lab">緊急地震速報</span><span class="val" id="le"></span></div></div>`;
  }
  const wChips = (list) => list.length ? list.map((w) => `<span class="lv lv${w.level}">${esc(w.name)}</span>`).join('') : '<span>発表されている警報・注意報はありません</span>';
  const intBadge = (mx) => { const c = LIVE.INT[mx]; return c ? `<span class="si" style="background:${c[0]};color:${c[1]}" aria-label="最大震度${c[2]}">${c[2]}</span>` : '<span class="si" aria-label="震度なし">－</span>'; };
  const eewState = () => LIVE.wsState === 'on' ? '<span class="dot on"></span>受信待機中（このアプリを開いている間だけ）' : '<span class="dot"></span>接続していません（通信を確認）';
  async function healthBanner(el) {
    if (!el || !navigator.onLine) return;
    if (!LIVE.health || Date.now() - LIVE.health.at > 600000) await LIVE.check();
    if (!LIVE.health.ok && document.body.contains(el)) el.innerHTML = `<div class="alert red">${icon('alert')}<span>${esc(LIVE.health.issues.join('。'))}。気象庁のデータの形式が変わったか、更新が止まっている可能性があります。最新の情報は<a href="https://www.jma.go.jp/bosai/" target="_blank" rel="noopener" style="color:inherit">気象庁のページ</a>で確認してください。</span></div>`;
  }
  async function fillLive() {
    healthBanner(document.getElementById('hb'));
    const a = LIVE.area(); const $ = (id) => document.getElementById(id);
    if (!a || !$('lw')) return;
    $('le').innerHTML = eewState();
    if (!navigator.onLine) { $('lt').textContent = 'オフライン'; ['lw', 'lts', 'lq'].forEach((k) => { $(k).textContent = '通信がないため表示できません'; }); return; }
    try { const w = await LIVE.warnings(a); if ($('lw')) { $('lw').innerHTML = wChips(w.list); $('lt').textContent = w.latest ? LIVE.fmtTime(w.latest) + ' 発表' : ''; } } catch (e) { if ($('lw')) $('lw').textContent = '取得できませんでした'; }
    try { const t = await LIVE.tsunami(); if ($('lts')) $('lts').innerHTML = t.level ? `<span class="lv lv${t.level === 3 ? 50 : t.level === 2 ? 30 : 20}">${['', '津波注意報', '津波警報', '大津波警報'][t.level]}</span>` : (t.forecast ? '津波予報（若干の海面変動）' : '発表されている津波警報・注意報はありません'); } catch (e) { if ($('lts')) $('lts').textContent = '取得できませんでした'; }
    try { const q = (await LIVE.quakes(1))[0]; if ($('lq') && q) $('lq').innerHTML = `${intBadge(q.maxi)}<span>${esc(q.anm || '（震源調査中）')}${q.mag ? ` M${esc(q.mag)}` : ''}<br><small style="color:var(--muted)">${LIVE.fmtTime(q.at)}</small></span>`; } catch (e) { if ($('lq')) $('lq').textContent = '取得できませんでした'; }
  }
  function info() {
    const a = LIVE.area();
    const opts = PREFS.map((p, i) => `<option value="${i}"${a && a.pi === i ? ' selected' : ''}>${p}</option>`).join('');
    return `${head('bell', 'c-blue', '災害の情報', '気象庁の発表を表示します')}
    <div class="box"><h3>${icon('pin')}地域</h3>
      <label class="small" for="ipref">都道府県</label><select id="ipref"><option value="">選んでください</option>${opts}</select>
      <div id="ioff" style="margin-top:8px"></div><div id="ic20" style="margin-top:8px"></div>
      <p class="small" style="margin:8px 0 0">市区町村まで選ぶと、その地域の警報・注意報だけを表示します。地域はこの端末にだけ保存します。</p></div>
    <div id="hb"></div><div id="eewbox"></div>
    <div class="list">${row('#/weather', 'wave', '天気と雨雲レーダー', '近くの気温・湿度・雨、天気予報、雨雲の動き')}</div>
    <div id="tsubox"></div>
    <div class="sec">警報・注意報${a ? `<a href="${LIVE.links.warning(a.office)}" target="_blank" rel="noopener">気象庁で見る${icon('chevron')}</a>` : ''}</div>
    <div class="box" id="wbox">${a ? '読みこみ中…' : '地域を選ぶと表示します。'}</div>
    <a class="row" href="#/rain" style="border:1px solid var(--line);border-radius:8px;background:var(--surface);margin-bottom:12px">${icon('flood')}<span class="t"><b>警戒レベルと、とるべき行動</b><small>レベル４で危険な場所から全員避難</small></span><span class="end">${icon('chevron')}</span></a>
    <div class="sec">地震情報<a href="${LIVE.links.quake}" target="_blank" rel="noopener">気象庁で見る${icon('chevron')}</a></div>
    <div id="qmapw"></div><div class="list" id="qbox"><div class="qrow">読みこみ中…</div></div>
    <div class="sec">火山（噴火警報が出ている火山）<a href="${LIVE.links.volcano}" target="_blank" rel="noopener">気象庁で見る${icon('chevron')}</a></div>
    <div class="list" id="vbox"><div class="qrow">読みこみ中…</div></div>
    <div class="sec">気象庁などのページ</div>
    <div class="list">
      ${[['キキクル（大雨による危険度分布）', 'map', LIVE.links.risk], ['雨雲の動き', 'wave', LIVE.links.rain], ['津波警報・注意報', 'wave', LIVE.links.tsunami], ['時系列で見る警報・注意報', 'timer', LIVE.links.timeline], ['リアルタイム震度（Yahoo!天気・災害）', 'quake', 'https://typhoon.yahoo.co.jp/weather/jp/earthquake/kyoshin/'], ['強震モニタ（防災科学技術研究所・リアルタイムの揺れ）', 'quake', LIVE.links.kmoni], ['重ねるハザードマップ（ハザードマップポータルサイト）', 'map', 'https://disaportal.gsi.go.jp/maps/']].map(([t, ic, u]) => `<a class="row" href="${u}" target="_blank" rel="noopener">${icon(ic)}<span class="t"><b style="font-size:16px">${t}</b></span><span class="end">${icon('chevron')}</span></a>`).join('')}
    </div>
    ${SRC_JMA}
    <p class="src">緊急地震速報：<a href="https://www.p2pquake.net/" target="_blank" rel="noopener">P2P地震情報</a> のAPIで受け取った、気象庁の緊急地震速報（警報）の内容をそのまま表示します。配信は無保証で、届かない・遅れることがあります。このアプリを開いている間しか受け取れないので、スマホ本体の緊急速報（エリアメール等）を必ずオンにしてください。</p>`;
  }
  async function bindInfo() {
    const $ = (id) => document.getElementById(id); let a = LIVE.area();
    const sel = $('ipref');
    const showOff = (pi) => {
      const offs = LIVE.officesOf(pi);
      $('ioff').innerHTML = offs.length > 1 ? `<label class="small" for="ioffs">地方</label><select id="ioffs">${offs.map(([c, n]) => `<option value="${c}"${a && a.office === c ? ' selected' : ''}>${n}</option>`).join('')}</select>` : '';
      const pick = () => { const c = offs.length > 1 ? $('ioffs').value : offs[0][0]; const n = offs.find((o) => o[0] === c)[1]; showC20(pi, c, n); };
      if ($('ioffs')) $('ioffs').addEventListener('change', () => { a = { pi, office: $('ioffs').value, officeName: offs.find((o) => o[0] === $('ioffs').value)[1] }; store.set('area', a); pick(); load(); });
      pick();
    };
    const showC20 = async (pi, office, officeName) => {
      $('ic20').innerHTML = '<p class="small">市区町村を読みこみ中…</p>';
      try {
        const ms = await LIVE.municipalities(office);
        $('ic20').innerHTML = `<label class="small" for="ic20s">市区町村（任意）</label><select id="ic20s"><option value="">${esc(officeName)}全体</option>${ms.map(([c, n]) => `<option value="${c}"${a && a.c20 === c ? ' selected' : ''}>${esc(n)}</option>`).join('')}</select>`;
        $('ic20s').addEventListener('change', () => { const v = $('ic20s').value; a = { pi, office, officeName, c20: v || null, c20Name: v ? ms.find((m) => m[0] === v)[1] : null }; store.set('area', a); load(); });
      } catch (e) { $('ic20').innerHTML = '<p class="small">市区町村の一覧を読みこめませんでした（通信を確認してください）。</p>'; }
    };
    sel.addEventListener('change', () => { if (sel.value === '') return; const pi = +sel.value; const o = LIVE.officesOf(pi)[0]; a = { pi, office: o[0], officeName: o[1] }; store.set('area', a); showOff(pi); load(); });
    if (a) showOff(a.pi);
    const load = async () => {
      if (!navigator.onLine) { ['wbox', 'qbox', 'vbox'].forEach((k) => { $(k).innerHTML = '<div class="qrow">通信がないため表示できません</div>'; }); return; }
      // 緊急地震速報の状態
      $('eewbox').innerHTML = `<div class="note">${icon('alert')}<span>緊急地震速報：${eewState()}</span></div>`;
      // 津波
      LIVE.tsunami().then((t) => { $('tsubox').innerHTML = t.level ? `<div class="tsu l${t.level}"><h3>${['', '津波注意報', '津波警報', '大津波警報'][t.level]}が発表されています</h3><p>${esc(t.areas.map((x) => x.name).join('、'))}</p><p class="small">${LIVE.fmtTime(t.at)} 発表　${esc(t.anm || '')}</p><a class="btn red" href="#/tsunami">津波から逃げる${icon('chevron')}</a></div>` : ''; }).catch(() => {});
      // 警報
      if (a) LIVE.warnings(a).then((w) => { $('wbox').innerHTML = `<p style="margin:0 0 8px"><b>${esc(a.c20Name || a.officeName)}</b>　<span class="small">${w.latest ? LIVE.fmtTime(w.latest) + ' 発表' : ''}</span></p><div class="val" style="display:flex;flex-wrap:wrap;gap:6px">${wChips(w.list)}</div>${w.headline ? `<p class="small" style="margin:10px 0 0">${esc(w.headline)}</p>` : ''}`; }).catch((e) => { $('wbox').textContent = '取得できませんでした。' + e.message; });
      // 地震
      LIVE.quakes(10).then((qs) => {
        $('qbox').innerHTML = qs.map((q) => `<div class="qrow">${intBadge(q.maxi)}<span class="t"><b>${esc(q.anm || '（震源調査中）')}${q.mag ? `　M${esc(q.mag)}` : ''}</b><small>${LIVE.fmtTime(q.at)}${q.depth != null ? `　深さ約${Math.round(q.depth)}km` : ''}　${esc(q.ttl)}</small></span></div>`).join('') || '<div class="qrow">情報がありません</div>';
        if (MAP.ok() && qs.some((q) => q.lat != null)) {
          $('qmapw').innerHTML = '<div id="qmap" class="map" style="height:260px" role="img" aria-label="最近の地震の震央の地図"></div>';
          const m = MAP.make($('qmap'), 36.5, 137.5, 4); const pts = [];
          qs.filter((q) => q.lat != null).forEach((q) => { const c = LIVE.INT[q.maxi] || ['#777', '#fff', '－']; pts.push([q.lat, q.lng]); L.marker([q.lat, q.lng], { icon: L.divIcon({ className: 'mk', html: `<span style="background:${c[0]};color:${c[1]};border-color:#333">${c[2]}</span>`, iconSize: [28, 28], iconAnchor: [14, 14] }) }).addTo(m).bindPopup(`<b>${esc(q.anm)}</b> M${esc(q.mag)}<br>${LIVE.fmtTime(q.at)}<br>最大震度 ${c[2]}`); });
          if (pts.length > 1) m.fitBounds(pts, { padding: [20, 20], maxZoom: 7 });
        }
      }).catch(() => { $('qbox').innerHTML = '<div class="qrow">取得できませんでした</div>'; });
      // 火山
      LIVE.volcanoes().then((vs) => { $('vbox').innerHTML = vs.map((v) => `<a class="row" href="https://www.jma.go.jp/bosai/volcano/#type=warning&event_id=${esc(v.id)}" target="_blank" rel="noopener">${icon('volcano')}<span class="t"><b>${esc(v.name)}</b><small>${esc(v.label)}　${LIVE.fmtTime(v.at)}</small></span><span class="end">${icon('chevron')}</span></a>`).join('') || '<div class="qrow">噴火警報が出ている火山はありません</div>'; }).catch(() => { $('vbox').innerHTML = '<div class="qrow">取得できませんでした</div>'; });
    };
    load();
    healthBanner(document.getElementById('hb'));
    clearInterval(tick); tick = setInterval(load, 60000);
  }

  // ---------- 緊急地震速報（全画面表示） ----------
  function showEew(m) {
    const e = m.earthquake || {}; const hy = e.hypocenter || {};
    let box = document.getElementById('eew'); if (!box) { box = document.createElement('div'); box.id = 'eew'; box.setAttribute('role', 'alertdialog'); box.setAttribute('aria-live', 'assertive'); document.body.appendChild(box); }
    if (m.cancelled) { box.innerHTML = `<h2>緊急地震速報は取り消されました</h2><button id="eewx">閉じる</button>`; document.getElementById('eewx').onclick = () => box.remove(); return; }
    const areas = (m.areas || []).map((x) => x.name).filter(Boolean);
    box.innerHTML = `<h2>緊急地震速報（警報）</h2><p class="sm">気象庁の発表を中継しています</p>
      <div class="big">強い揺れに警戒してください</div>
      <p>${esc(hy.name || '')}で地震　${hy.magnitude > 0 ? 'M' + hy.magnitude : ''}</p>
      ${areas.length ? `<p class="sm">強い揺れが予想される地域：</p><div class="areas">${esc(areas.slice(0, 30).join('、'))}</div>` : ''}
      <a href="#/shake" id="eewgo">いますぐ身を守る</a><button id="eewx">閉じる</button>
      <p class="sm">${LIVE.fmtTime(m.time)}　配信は無保証です。テレビ・ラジオ・スマホ本体の速報も確認してください。</p>`;
    document.getElementById('eewx').onclick = () => box.remove();
    document.getElementById('eewgo').onclick = () => box.remove();
    beep();
    if (navigator.vibrate) navigator.vibrate([400, 200, 400, 200, 400]);
  }
  function beep() { try { const ctx = new (window.AudioContext || window.webkitAudioContext)(); const o = ctx.createOscillator(); const g = ctx.createGain(); o.type = 'square'; o.frequency.value = 1100; const t = ctx.currentTime; g.gain.setValueAtTime(0, t); for (let i = 0; i < 6; i++) { g.gain.setValueAtTime(0.25, t + i * 0.5); g.gain.setValueAtTime(0, t + i * 0.5 + 0.25); } o.connect(g).connect(ctx.destination); o.start(); o.stop(t + 3.2); } catch (e) { /* 音が出せない端末 */ } }
  document.addEventListener('eewstate', () => { const el = document.getElementById('le'); if (el) el.innerHTML = eewState(); const eb = document.getElementById('eewbox'); if (eb) eb.innerHTML = `<div class="note">${icon('alert')}<span>緊急地震速報：${eewState()}</span></div>`; });
  window.__showEew = showEew; // 表示の確認用

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
      ${row('#/rain', 'flood', '大雨・台風のとき', '警戒レベル')}
      ${row('#/rinji', 'megaphone', '南海トラフ地震臨時情報', '発表されたら何をするか')}
      ${row('#/g/kitaku', 'train', '帰れなくなったとき', '外出先で大きな地震にあったら')}
      ${row('#/g/fire', 'fire', '地震のあとの火事', 'ブレーカー・電気の火事を防ぐ')}
      ${row('#/g/health', 'users', '避難所での健康', 'エコノミークラス症候群・熱中症・トイレ')}
      ${row('#/171', 'phone', '災害用伝言ダイヤル171', '録音と再生のしかた')}
    </div>`;
  }
  function bindLearn(i) {
    const n = i == null ? todayQuiz() : (+i % QUIZ.length); const q = QUIZ[n];
    view.querySelectorAll('.opt').forEach((b) => b.addEventListener('click', () => {
      const k = +b.dataset.k; const st = store.get('quiz', {}); if (st[n] == null) { st[n] = k === q.c ? 1 : 0; store.set('quiz', st); }
      view.querySelectorAll('.opt').forEach((x) => { x.disabled = true; const kk = +x.dataset.k; if (kk === q.c) { x.classList.add('right'); x.insertAdjacentHTML('beforeend', '<span class="mk">正解</span>'); } else if (kk === k) { x.classList.add('wrong'); x.insertAdjacentHTML('beforeend', '<span class="mk">あなたの答え</span>'); } });
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
    const f = FAMILY.get(); const st = store.get('safeMsg', { state: '無事です', place: '' });
    return `${back()}${head('phone', 'c-blue', 'いざという時の道具', '連絡する・居場所を伝える・助けを呼ぶ')}
    <div class="sec" style="margin-top:0">1. 家族に無事を知らせる</div>
    <div class="box">
      <div class="seg" role="group" aria-label="いまの状態">${['無事です', '避難しています', 'けがをしています', '助けが必要です'].map((t) => `<button data-st="${t}" class="${st.state === t ? 'on' : ''}">${t}</button>`).join('')}</div>
      <label class="small" for="splace">いる場所（例：学校の体育館、〇〇小学校）</label>
      <input type="search" id="splace" value="${esc(st.place || f.meet || '')}" style="margin:4px 0 10px">
      <label class="ck" style="padding:6px 0;border:0"><input type="checkbox" id="sloc"><span>現在地の地図リンクもつける（送る相手に位置が伝わります）</span></label>
      <p class="small" style="margin:6px 0 4px">送る文面</p>
      <div class="note" id="smsg" style="margin:0;color:var(--fg);font-size:16px;white-space:pre-line;overflow-wrap:anywhere"></div>
      <button class="btn" id="sshare">${icon('route')}送る（メッセージ・メールなど）</button>
      <a class="btn plain" id="sline" target="_blank" rel="noopener">LINEで送る</a>
      <button class="btn plain" id="scopy">文面をコピー</button>
      <p class="small" id="sres" aria-live="polite"></p>
    </div>
    <div class="sec">2. 自分のいる場所を伝える</div>
    <div class="box"><p style="margin:0 0 8px;font-size:15px;color:var(--sub)">迷ったとき・救助を呼ぶときに、緯度・経度（位置の数字）と地図のリンクを伝えられます。</p>
      <button class="btn" id="whereb">${icon('locate')}現在地を調べる</button><div id="where"></div></div>
    <div class="sec">3. 助けを呼ぶ</div>
    <div class="list">
      <button class="row danger" id="btn-whistle">${icon('whistle')}<span class="t"><b id="wl">助けを呼ぶ音を鳴らす</b><small>閉じこめられたときなどに。もう一度押すと止まる</small></span></button>
      <a class="row danger" href="tel:119">${icon('phone')}<span class="t"><b>119（火事・救急）</b><small>大きな災害の直後はつながりにくいことがあります</small></span><span class="end">${icon('chevron')}</span></a>
      <a class="row" href="tel:110">${icon('phone')}<span class="t"><b>110（事件・事故）</b></span><span class="end">${icon('chevron')}</span></a>
    </div>
    <div class="sec">4. 通信がつながらないとき</div>
    <div class="list">
      ${row('#/171', 'phone', '災害用伝言ダイヤル「171」', '声で伝言を残す・聞く')}
      <a class="row" href="https://www.web171.jp/" target="_blank" rel="noopener">${icon('card')}<span class="t"><b>災害用伝言板「web171」</b><small>インターネットで伝言を残す・見る</small></span><span class="end">${icon('chevron')}</span></a>
      <div class="row" style="cursor:default">${icon('info')}<span class="t"><b>無料Wi-Fi「00000JAPAN」</b><small>大きな災害のとき、Wi-Fiの一覧に出たら、パスワードなしで使えます。暗号化されていないので、安否の確認や情報集めにとどめ、パスワードや個人情報は入力しないでください。</small></span></div>
    </div>
    <p class="src">出典：<a href="https://www.soumu.go.jp/menu_seisaku/ictseisaku/public_wi-fi/freewifi_00000japan.html" target="_blank" rel="noopener">総務省「災害用統一SSID『00000JAPAN』」</a>、${esc(SRC.ntt.name)}</p>
    <div class="sec">5. そのほか</div>
    <div class="list">
      ${row('#/timer', 'timer', '地震からの経過時間', '津波は数分で来ることがある')}
      <button class="row" id="btn-light">${icon('light')}<span class="t"><b>画面ライト</b><small>画面を白く光らせる（懐中電灯の代わりにはなりません）</small></span></button>
    </div>
    <p class="small">音は、端末の音量やマナーモードによっては鳴りません。</p>`;
  }
  function bindTools() {
    const $ = (id) => document.getElementById(id); if (!$('smsg')) return;
    let st = store.get('safeMsg', { state: '無事です', place: '' }); let pos = null;
    const msg = () => {
      const d = new Date(); const tm = `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      const pl = $('splace').value.trim();
      const T = (x) => I18N.w(x);
      return `【${T(st.state)}】\n${pl ? `${T('いる場所：')}${pl}\n` : ''}${pos ? `${T('現在地：')}${MAP.gsiMap(pos.latitude.toFixed(5), pos.longitude.toFixed(5), 17)}\n` : ''}（${tm}）`;
    };
    const upd = () => { const m = msg(); $('smsg').textContent = m; $('sline').href = 'https://line.me/R/share?text=' + encodeURIComponent(m); store.set('safeMsg', { state: st.state, place: $('splace').value }); };
    view.querySelectorAll('[data-st]').forEach((b) => b.addEventListener('click', () => { st.state = b.dataset.st; view.querySelectorAll('[data-st]').forEach((x) => x.classList.toggle('on', x === b)); upd(); }));
    $('splace').addEventListener('input', upd);
    $('sloc').addEventListener('change', async () => { if ($('sloc').checked) { $('sres').textContent = '現在地を調べています…'; try { pos = await SH.locate(); $('sres').textContent = ''; } catch (e) { $('sres').textContent = e.message; $('sloc').checked = false; pos = null; } } else pos = null; upd(); });
    $('sshare').addEventListener('click', async () => { const m = msg(); if (navigator.share) { try { await navigator.share({ text: m }); } catch (e) { /* 閉じた */ } } else { location.href = 'sms:?&body=' + encodeURIComponent(m); } });
    $('scopy').addEventListener('click', async () => { try { await navigator.clipboard.writeText(msg()); $('sres').textContent = 'コピーしました。メッセージやメールに貼りつけて送ってください。'; } catch (e) { $('sres').textContent = 'コピーできませんでした。文面を長押しして選んでください。'; } });
    upd();
    $('whereb').addEventListener('click', async () => {
      $('where').innerHTML = '<p class="small">現在地を調べています…</p>';
      try {
        const p = await SH.locate(); const la = p.latitude.toFixed(5), ln = p.longitude.toFixed(5);
        const txt = `北緯 ${la}　東経 ${ln}（誤差 約${Math.round(p.accuracy)}m）`;
        $('where').innerHTML = `<p style="font-size:22px;font-weight:700;margin:10px 0 4px;font-variant-numeric:tabular-nums">北緯 ${la}<br>東経 ${ln}</p><p class="small">誤差 約${Math.round(p.accuracy)}m</p>
          <div class="links2"><a class="btn sm" href="${MAP.gsiMap(la, ln, 17)}" target="_blank" rel="noopener">${icon('map')}地図で見る</a><a class="btn sm plain" href="${MAP.hazPortal(la, ln)}" target="_blank" rel="noopener">${icon('flood')}ハザードマップ</a><button class="btn sm plain" id="wshare">${icon('route')}送る</button></div>`;
        $('wshare').addEventListener('click', async () => { const t = `${I18N.w('いまここにいます')}\n${I18N.tr(txt)}\n${MAP.gsiMap(la, ln, 17)}`; if (navigator.share) { try { await navigator.share({ text: t }); } catch (e) { /* 閉じた */ } } else { try { await navigator.clipboard.writeText(t); $('wshare').textContent = 'コピーしました'; } catch (e) { /* なし */ } } });
      } catch (e) { $('where').innerHTML = `<p class="small">${esc(e.message)}</p>`; }
    });
  }
  let tick = null;
  function timer() {
    const start = store.get('quakeStart', null);
    return `${back('#/tools', 'いざという時の道具')}${head('timer', 'c-blue', '地震からの経過時間', '')}
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
  // ---------- はじめての準備 ----------
  function setupLeft() { let n = 0; if (!Object.keys(SH.saved()).length) n++; if (!LIVE.area()) n++; if (!store.get('eewChecked', false)) n++; if (!store.get('installed', false) && !matchMedia('(display-mode: standalone)').matches) n++; return n; }
  let deferredInstall = null;
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredInstall = e; });
  function start() {
    const saved = Object.keys(SH.saved()); const a = LIVE.area(); const ios = /iPhone|iPad|iPod/.test(navigator.userAgent);
    const AND = '<li><b>Android（Chrome）</b>：右上の︙メニュー →「インストールしてショートカットを作成」または「ホーム画面に追加」</li>';
    const done = (ok) => ok ? `<span class="lv" style="background:var(--green);color:#fff">完了</span>` : `<span class="lv" style="border:1px solid var(--line)">まだ</span>`;
    return `${head('check', 'c-green', 'はじめての準備', '電波があるうちに、1回だけやっておくこと')}
    <div class="box"><h3>${icon('info')}言語・Language</h3><div class="sizes">${[['ja', '日本語'], ['ez', 'やさしい にほんご'], ['en', 'English']].map(([k, t]) => `<button data-lang="${k}" class="${I18N.lang === k ? 'on' : ''}">${t}</button>`).join('')}</div></div>
    <div class="box"><h3>${icon('download')}1. 避難場所のデータを保存する ${done(saved.length)}</h3><p>家や学校のある都道府県のデータを保存すると、電波がなくても近くの避難場所・避難所を探せます。</p><a class="btn ${saved.length ? 'plain' : ''}" href="#/find" style="margin-bottom:0">${saved.length ? '保存したデータを見る' : 'データを保存する'}</a></div>
    <div class="box"><h3>${icon('bell')}2. 地域を設定する ${done(a)}</h3><p>自分の地域の警報・注意報や天気予報が、ホームに出るようになります。</p><a class="btn ${a ? 'plain' : ''}" href="#/info" style="margin-bottom:0">${a ? '地域を変える' : '地域を設定する'}</a></div>
    <div class="box"><h3>${icon('phone')}3. スマホ本体の「緊急速報」をオンにする ${done(store.get('eewChecked', false))}</h3>
      <p>緊急地震速報や津波警報は、スマホ本体の機能（緊急速報メール・エリアメール）で届きます。このアプリは、開いている間しか緊急地震速報を受け取れません。</p>
      <ul class="dots" style="margin:0 0 8px;padding-left:1.2em"><li><b>iPhone</b>：「設定」→「通知」→ いちばん下の「緊急速報」をオン</li><li><b>Android</b>：設定アプリの検索で「緊急速報メール」と調べ、「緊急速報メールを許可」をオン（機種やOSによってメニューの名前がちがいます）</li></ul><p class="small">対応したSIMを使っている場合に受け取れます。くわしくは、使っている携帯電話会社の案内を確認してください。</p>
      <button class="btn ${store.get('eewChecked', false) ? 'plain' : ''}" id="eewok" style="margin-bottom:0">確認した</button></div>
    <div class="box"><h3>${icon('home')}4. ホーム画面に追加する ${done(store.get('installed', false) || matchMedia('(display-mode: standalone)').matches)}</h3>
      <p>アプリのようにすぐ開けて、電波がなくても使いやすくなります。</p>
      ${deferredInstall ? `<button class="btn" id="inst">ホーム画面に追加する</button>` : ''}
      <ul class="dots" style="margin:0 0 8px;padding-left:1.2em">${ios ? '' : AND}<li><b>iPhone（Safari）</b>：「共有」ボタン（「…」の中にある場合もあります）→ 下にスクロールして「ホーム画面に追加」→「追加」</li>${ios ? AND : ''}</ul>
      <button class="btn plain" id="instok" style="margin-bottom:0">追加した</button></div>
    <a class="btn" href="#/">ホームへ</a>`;
  }
  function bindStart() {
    view.querySelectorAll('[data-lang]').forEach((b) => b.addEventListener('click', () => { I18N.set(b.dataset.lang); location.reload(); }));
    const e = document.getElementById('eewok'); if (e) e.addEventListener('click', () => { store.set('eewChecked', true); render(); });
    const i = document.getElementById('instok'); if (i) i.addEventListener('click', () => { store.set('installed', true); render(); });
    const p = document.getElementById('inst'); if (p) p.addEventListener('click', async () => { deferredInstall.prompt(); const r = await deferredInstall.userChoice; if (r.outcome === 'accepted') store.set('installed', true); deferredInstall = null; render(); });
  }
  function langPage() {
    return `${back()}${head('info', 'c-blue', 'Language・言語', '')}
    <div class="list">${[['ja', '日本語', 'Japanese'], ['ez', 'やさしい にほんご', 'Easy Japanese'], ['en', 'English', '英語']].map(([k, t, sub]) => `<button class="row" data-lang="${k}">${icon(I18N.lang === k ? 'check' : 'chevron')}<span class="t"><b>${t}</b><small>${sub}</small></span></button>`).join('')}</div>
    <p class="small">やさしい日本語・英語は、画面の説明を言いかえたものです。地名・施設名・気象庁の情報は日本語のまま表示されます。正式な内容は日本語の表示と出典を確認してください。</p>
    <p class="small">Easy Japanese and English are translations of this app's explanations. Place names, facility names and Japan Meteorological Agency (JMA) data are shown in Japanese. For official wording, check the Japanese text and the sources.</p>`;
  }
  // ---------- プライバシーポリシー ----------
  function privacy() {
    return `${back()}${head('shield', 'c-blue', 'プライバシーポリシー', '2026年11月 制定')}
    <div class="box"><h3>1. 集めない情報</h3><p>Bousai Japan は、利用者の情報を集めるサーバーを持っていません。現在地、家族メモ、そなえチェック、トレーニングの結果、設定した地域などを、開発者が受け取ることはありません。アクセス解析や広告のしくみも使っていません。</p></div>
    <div class="box"><h3>2. 端末の中に保存する情報</h3><p>家族メモ、チェック、設定（地域・言語・文字の大きさ）、保存した避難場所データは、お使いの端末のブラウザの中（localStorage・Cache Storage）にだけ保存します。ブラウザのデータを消すか、「このアプリについて」の画面の「保存データを消す」で消せます。</p></div>
    <div class="box"><h3>3. 現在地（位置情報）</h3><p>避難場所までの距離の計算、地図の表示、近くの観測所の天気の表示、無事を知らせる文面への地図リンクの追加（選んだときだけ）に使います。端末の中で計算し、保存せず、開発者には送りません。</p></div>
    <div class="box"><h3>4. 外部のサイトとの通信</h3><p>次の情報を取りにいくとき、その提供元に通信が発生します（通常のウェブサイトと同じく、IPアドレスなどの通信情報が相手に届きます）。現在地や家族メモを送ることはありません。</p>
      <ul class="dots" style="padding-left:1.2em;margin:0"><li>気象庁（警報・注意報、地震、津波、火山、天気、雨雲レーダー）</li><li>P2P地震情報（緊急地震速報の中継）</li><li>国土地理院（地図の画像）、ハザードマップポータルサイト（浸水想定などの画像）</li></ul>
      <p>「Googleマップで歩くルート」や外部サイトへのリンクを開いた場合は、その先のサービスのプライバシーポリシーが適用されます。Googleマップでは、目的地と現在地がGoogleに送られます。</p></div>
    <div class="box"><h3>5. QRコードでの受け渡し</h3><p>家族メモをQRコードで渡す機能は、内容をQRコード（URLの#以降）に入れて渡すもので、サーバーを通りません。QRコードを見せた相手には内容が伝わるので、見せる相手に注意してください。</p></div>
    <div class="box"><h3>6. お問い合わせ</h3><p>ご意見・不具合の報告は、GitHub の問い合わせ欄（Issues）で受け付けています。書きこんだ内容は公開されるので、個人情報は書かないでください。</p><a class="btn plain" href="https://github.com/Seg1GPT0Jpn/Bousai-Japan/issues" target="_blank" rel="noopener" style="margin-bottom:0">問い合わせ欄を開く（GitHub）</a></div>
    <div class="box"><h3>7. 変更</h3><p>このポリシーを変えるときは、この画面でお知らせします。</p></div>`;
  }
  function about() {
    return `${back()}${head('info', 'c-blue', 'このアプリについて', 'ご利用上の注意')}
    <div class="box"><p>Bousai Japan は、防災の知識を身につけ、災害時に「次に何をするか」を判断するのを助ける、無料の防災Webアプリです。</p></div>
    <div class="box"><h3>${icon('alert')}ご利用上の注意</h3>
      <p>「情報」画面では、気象庁が発表した警報・注意報・地震・津波・火山の情報と、緊急地震速報（警報）の内容をそのまま表示します。このアプリが独自に警報や予報を出すことはありません。通信の状況により遅れたり届かなかったりすることがあり、緊急地震速報はアプリを開いている間しか受け取れません。スマホ本体の緊急速報（エリアメール等）を必ずオンにしてください。</p>
      <p>防災情報や避難場所データは公式機関の資料をもとにしていますが、更新の時期などにより、実際の状況と異なる場合があります。避難場所が実際に開いているかどうかはわかりません。</p>
      <p>災害のときは、まわりの危険と、自治体・消防・警察・学校などの指示や最新の情報を最優先にしてください。</p>
      <p>表示される距離は直線距離で、安全な道順や所要時間を示すものではありません。GPSは屋内や地下で大きくずれることがあります。</p>
      <p>電波がなくても使えるのは、最後に保存した時点の情報です。チェック・家族メモ・保存した避難場所データはこの端末の中だけにあり、ブラウザのデータを消すと消えます。</p>
      <p>本アプリは行動を助けるための道具で、安全を保証するものではありません。日頃から地域のハザードマップや避難場所を確認し、家族や学校と避難方法を話し合っておきましょう。</p></div>
    <div class="box"><h3>${icon('shield')}プライバシー</h3><p>現在地・家族メモ・チェックの内容は外部に送信しません。現在地は避難場所の距離の計算と地図の表示にだけ使い、保存しません。「情報」画面の地域はこの端末にだけ保存します。気象庁のデータ、P2P地震情報（緊急地震速報）、地図の画像（地理院タイル）を取りにいく通信が発生しますが、現在地や家族メモは送りません。「Googleマップで歩くルート」を開くと、目的地と（Googleマップが使う）現在地がGoogleに送られます。</p></div>
    <div class="box"><h3>${icon('book')}出典</h3>${Object.values(SRC).map((s) => `<p style="font-size:14px"><a href="${s.url}" target="_blank" rel="noopener">${esc(s.name)}</a></p>`).join('')}
      <p style="font-size:14px">避難場所データ：国土地理院「指定緊急避難場所・指定避難所データ」をもとに Bousai Japan が加工して作成（公共データ利用規約 第1.0版）。</p>
      <p style="font-size:14px">QRコード：QR Code Generator for JavaScript（Kazuhiko Arase, MIT License）。QRコードは株式会社デンソーウェーブの登録商標です。</p></div>
    <div class="list">${row('#/privacy', 'shield', 'プライバシーポリシー', '集めない情報・端末に保存する情報')}${row('#/lang', 'info', 'Language・言語', '日本語・やさしい日本語・English')}${row('#/start', 'check', 'はじめての準備', 'データの保存・地域・緊急速報・ホーム画面')}</div>
    <div class="sec">文字の大きさ</div>
    <div class="sizes">${[['m', '標準'], ['l', '大'], ['xl', '特大']].map(([k, t]) => `<button data-size="${k}" class="${(store.get('size', 'm')) === k ? 'on' : ''}">${t}</button>`).join('')}</div>
    <button class="btn plain" id="wipe">この端末の保存データを消す</button>`;
  }

  // ---------- ルーター ----------
  const NAV = [['', 'home', 'ホーム'], ['info', 'bell', '情報'], ['find', 'pin', '避難場所'], ['learn', 'book', '学ぶ'], ['family', 'users', '家族']];
  function nav(r) {
    const tab = r === 'info' ? 'info' : ['find'].includes(r) ? 'find' : ['learn'].includes(r) ? 'learn' : ['family', 'import'].includes(r) ? 'family' : '';
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
      case 'info': html = info(); break;
      case 'rain': html = rain(); break;
      case 'g': html = guide(h[1]); break;
      case 'weather': html = weather(); break;
      case 'learn': html = learn(h[1]); break;
      case 'check': html = check(); break;
      case 'family': html = family(); break;
      case 'import': html = importView(h[1] || ''); break;
      case 'tools': html = tools(); break;
      case 'timer': html = timer(); break;
      case '171': html = t171(); break;
      case 'about': html = about(); break;
      case 'start': html = start(); break;
      case 'lang': html = langPage(); break;
      case 'privacy': html = privacy(); break;
      default: html = home();
    }
    view.innerHTML = html;
    window.scrollTo(0, 0);
    bind(r, h);
  }
  function bind(r, h) {
    view.querySelectorAll('[data-ck]').forEach((el) => el.addEventListener('change', () => { const st = store.get('check', {}); st[el.dataset.ck] = el.checked; store.set('check', st); const p = checkProgress(); const bar = view.querySelector('.bar i'); if (bar) bar.style.width = p.p + '%'; const b = document.getElementById('ckn'); if (b) { b.textContent = `${p.d} / ${p.n} 完了`; b.nextElementSibling.textContent = p.p + '%'; } }));
    if (r === '') view.querySelectorAll('[data-hz]').forEach((b) => b.addEventListener('click', () => { store.set('hz', b.dataset.hz); view.querySelectorAll('[data-hz]').forEach((x) => x.classList.toggle('on', x === b)); }));
    if (r === 'info') bindInfo();
    if (r === 'start') bindStart();
    if (r === 'lang') view.querySelectorAll('[data-lang]').forEach((b) => b.addEventListener('click', () => { I18N.set(b.dataset.lang); location.reload(); }));
    if (r === 'weather') bindWeather();
    if (r === '') { fillLive(); tick = setInterval(fillLive, 60000); }
    if (r === 'find') { bindFind().then(() => { if (h[1] === 'go' || HAZARDS.some((x) => x.k === h[1])) { const g = document.getElementById('go'); if (g && !lastPos) g.click(); } }); }
    if (r === 'learn') bindLearn(h[1]);
    if (r === 'family') bindFamily();
    if (r === 'import') { const b = document.getElementById('imp'); if (b) b.addEventListener('click', () => { FAMILY.set(FAMILY.decode(h[1])); location.hash = '#/family'; }); }
    if (r === 'tools') bindTools();
    const bl = document.getElementById('btn-light'); if (bl) bl.addEventListener('click', lightOn);
    const bw = document.getElementById('btn-whistle'); if (bw) bw.addEventListener('click', whistle);
    const ts = document.getElementById('t-start'); if (ts) ts.addEventListener('click', () => { store.set('quakeStart', Date.now()); render(); });
    const tr = document.getElementById('t-reset'); if (tr) tr.addEventListener('click', () => { store.set('quakeStart', null); render(); });
    const clock = document.getElementById('clock');
    if (clock && store.get('quakeStart', null)) {
      const upd = () => { const s = Math.max(0, Math.floor((Date.now() - store.get('quakeStart', Date.now())) / 1000)); const hh = Math.floor(s / 3600), mm = Math.floor(s % 3600 / 60), ss = s % 60; clock.textContent = (hh ? hh + ':' + String(mm).padStart(2, '0') : mm) + ':' + String(ss).padStart(2, '0'); };
      upd(); tick = setInterval(upd, 500);
    }
    view.querySelectorAll('[data-size]').forEach((b) => b.addEventListener('click', () => { store.set('size', b.dataset.size); document.documentElement.dataset.size = b.dataset.size; view.querySelectorAll('[data-size]').forEach((x) => x.classList.toggle('on', x === b)); }));
    const wipe = document.getElementById('wipe');
    if (wipe) wipe.addEventListener('click', async () => { if (confirm(I18N.tr('チェック・家族メモ・トレーニング・タイマー・保存した避難場所データを、この端末から消します。よろしいですか？'))) { for (const c of Object.keys(SH.saved())) await SH.remove(c); ['check', 'family', 'quakeStart', 'quiz', 'hz'].forEach((k) => store.del(k)); location.hash = '#/'; } });
  }

  // ---------- ライト・呼び笛 ----------
  const light = document.getElementById('light'); let wakeLock = null;
  async function lightOn() { light.hidden = false; try { if ('wakeLock' in navigator) wakeLock = await navigator.wakeLock.request('screen'); } catch (e) { /* 使えない端末 */ } }
  document.getElementById('light-off').addEventListener('click', () => { light.hidden = true; if (wakeLock) { wakeLock.release().catch(() => {}); wakeLock = null; } });
  let ac = null, osc = null;
  function whistle() {
    const lab = document.getElementById('wl');
    if (osc) { osc.stop(); osc = null; if (lab) lab.textContent = '助けを呼ぶ音を鳴らす'; return; }
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
  document.documentElement.dataset.size = store.get('size', 'm');
  if (!store.get('seenStart', false) && (location.hash || '#/') === '#/') { store.set('seenStart', true); location.hash = '#/start'; }
  LIVE.startEew(showEew);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') LIVE.startEew(showEew); });
  window.addEventListener('hashchange', render);
  render();
})();
