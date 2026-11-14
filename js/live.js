// 気象庁などの最新情報。サーバーを使わず、ブラウザから直接取りにいく（気象庁の防災情報のデータは他サイトからの読みこみが許可されている）。
// このアプリが警報を「出す」ことはなく、気象庁が発表した内容をそのまま表示する。
const JMA = 'https://www.jma.go.jp/bosai';
const LIVE = {
  // 都道府県 → 気象庁の府県予報区（office）。北海道・鹿児島・沖縄は複数
  officesOf(pi) {
    const code = String(pi + 1).padStart(2, '0');
    const multi = {
      '01': [['011000', '宗谷地方'], ['012000', '上川・留萌地方'], ['013000', '網走・北見・紋別地方'], ['014030', '十勝地方'], ['014100', '釧路・根室地方'], ['015000', '胆振・日高地方'], ['016000', '石狩・空知・後志地方'], ['017000', '渡島・檜山地方']],
      '46': [['460100', '鹿児島県（奄美地方除く）'], ['460040', '奄美地方']],
      '47': [['471000', '沖縄本島地方'], ['472000', '大東島地方'], ['473000', '宮古島地方'], ['474000', '八重山地方']],
    };
    return multi[code] || [[code + '0000', PREFS[pi]]];
  },
  area() { return store.get('area', null); }, // {office, officeName, c20, c20Name}
  async getJson(url) {
    const r = await fetch(url, { cache: 'no-cache' });
    if (!r.ok) throw new Error(`取得できませんでした（${r.status}）`);
    return r.json();
  },
  areaConst: null,
  async municipalities(office) {
    this.areaConst = this.areaConst || await this.getJson(`${JMA}/common/const/area.json`);
    const A = this.areaConst; const out = [];
    for (const [c, v] of Object.entries(A.class20s)) {
      const c15 = A.class15s[v.parent]; const c10 = c15 && A.class10s[c15.parent];
      if (c10 && c10.parent === office) out.push([c, v.name]);
    }
    return out;
  },
  // ---------- 警報・注意報（2026年5月29日からの新しい形式） ----------
  WCODE: (() => {
    const t = {}; const add = (codes, elem, names) => codes.forEach((c, i) => { if (c) t[c] = { elem, level: [50, 40, 30, 20][i], name: names[i] }; });
    add(['33', '43', '03', '10'], 'rain', ['レベル５大雨特別警報', 'レベル４大雨危険警報', 'レベル３大雨警報', 'レベル２大雨注意報']);
    add(['39', '49', '09', '29'], 'landslide', ['レベル５土砂災害特別警報', 'レベル４土砂災害危険警報', 'レベル３土砂災害警報', 'レベル２土砂災害注意報']);
    add(['38', '48', '08', '19'], 'tide', ['レベル５高潮特別警報', 'レベル４高潮危険警報', 'レベル３高潮警報', 'レベル２高潮注意報']);
    add(['35', null, '05', '15'], 'wind', ['暴風特別警報', null, '暴風警報', '強風注意報']);
    add(['32', null, '02', '13'], 'wind_snow', ['暴風雪特別警報', null, '暴風雪警報', '風雪注意報']);
    add(['36', null, '06', '12'], 'snow', ['大雪特別警報', null, '大雪警報', '大雪注意報']);
    add(['37', null, '07', '16'], 'wave', ['波浪特別警報', null, '波浪警報', '波浪注意報']);
    [['14', '雷注意報'], ['17', '融雪注意報'], ['20', '濃霧注意報'], ['21', '乾燥注意報'], ['22', 'なだれ注意報'], ['23', '低温注意報'], ['24', '霜注意報'], ['25', '着氷注意報'], ['26', '着雪注意報']].forEach(([c, n]) => { t[c] = { elem: 'other', level: 20, name: n }; });
    return t;
  })(),
  async warnings(a) {
    const reports = await this.getJson(`${JMA}/warning/data/r8/${a.office}.json`);
    if (!Array.isArray(reports) || (reports.length && !reports[0].warning)) throw new Error('データの形式が変わった可能性があります');
    const found = new Map(); let latest = '';
    for (const rep of reports) {
      if (rep.reportDatetime > latest) latest = rep.reportDatetime;
      const items = a.c20 ? (rep.warning?.class20Items || []).filter((x) => x.areaCode === a.c20) : (rep.warning?.class10Items || []);
      for (const it of items) for (const k of it.kinds || []) {
        if (!k.code || k.status === '解除' || !this.WCODE[k.code]) continue;
        const w = this.WCODE[k.code]; const prev = found.get(k.code);
        if (!prev) found.set(k.code, { ...w, code: k.code, status: k.status });
      }
    }
    const headline = reports.map((r) => r.headlineText).filter(Boolean)[0] || '';
    return { list: [...found.values()].sort((x, y) => y.level - x.level), latest, headline };
  },
  // ---------- 地震 ----------
  INT: { '7': ['#B40068', '#fff', '7'], '6+': ['#A50021', '#fff', '6強'], '6-': ['#FF2800', '#fff', '6弱'], '5+': ['#FF9900', '#000', '5強'], '5-': ['#FFE600', '#000', '5弱'], '4': ['#FAE696', '#000', '4'], '3': ['#0041FF', '#fff', '3'], '2': ['#00AAFF', '#000', '2'], '1': ['#F2F2FF', '#000', '1'] },
  async quakes(n = 10) {
    const list = await this.getJson(`${JMA}/quake/data/list.json`);
    const seen = new Set(); const out = [];
    for (const q of list) {
      if (q.ift === '取消' || !['震源・震度情報', '震度速報', '震源に関する情報'].includes(q.ttl)) continue;
      if (seen.has(q.eid)) continue; seen.add(q.eid);
      const m = /^([+-][\d.]+)([+-][\d.]+)([+-]\d+)?/.exec(q.cod || '');
      out.push({ at: q.at, anm: q.anm, mag: q.mag, maxi: q.maxi, ttl: q.ttl, lat: m ? +m[1] : null, lng: m ? +m[2] : null, depth: m && m[3] ? Math.abs(+m[3]) / 1000 : null });
      if (out.length >= n) break;
    }
    return out;
  },
  // ---------- 津波 ----------
  async tsunami() {
    const list = await this.getJson(`${JMA}/tsunami/data/list.json`);
    const t = list.find((x) => (x.json || '').includes('VTSE41'));
    if (!t || t.ift === '取消') return { level: 0 };
    const d = await this.getJson(`${JMA}/tsunami/data/${t.json}`);
    const items = d?.Body?.Tsunami?.Forecast?.Item || [];
    const rank = (n) => (/^大津波警報/.test(n) ? 3 : n === '津波警報' ? 2 : n === '津波注意報' ? 1 : 0);
    const valid = d?.Head?.ValidDateTime ? new Date(d.Head.ValidDateTime) > new Date() : true;
    const areas = items.map((it) => ({ name: it.Area?.Name, kind: it.Category?.Kind?.Name || '', r: rank(it.Category?.Kind?.Name || '') }));
    const top = Math.max(0, ...areas.map((a) => a.r));
    const forecast = !top && valid && areas.some((a) => /津波予報/.test(a.kind));
    return { level: top, forecast, at: t.rdt, anm: t.anm, areas: areas.filter((a) => a.r === top && top > 0) };
  },
  // ---------- 火山（噴火警報が出ている火山：レベル２以上など） ----------
  VCODE: { '12': 'レベル２（火口周辺規制）', '13': 'レベル３（入山規制）', '14': 'レベル４（高齢者等避難）', '15': 'レベル５（避難）', '22': '火口周辺危険', '23': '入山危険', '24': '山麓厳重警戒', '25': '居住地域厳重警戒', '36': '周辺海域警戒' },
  async volcanoes() {
    const list = await this.getJson(`${JMA}/volcano/data/warning.json`);
    const out = [];
    for (const r of list) for (const vi of r.volcanoInfos || []) {
      if (vi.type !== '噴火警報・予報（対象火山）') continue;
      for (const it of vi.items || []) if (this.VCODE[it.code]) for (const a of it.areas || []) out.push({ name: a.name, code: it.code, label: this.VCODE[it.code], at: r.reportDatetime, id: a.code });
    }
    const sev = { '15': 5, '25': 5, '14': 4, '24': 4, '13': 3, '23': 3, '36': 3, '12': 2, '22': 2 };
    return out.sort((x, y) => sev[y.code] - sev[x.code] || (y.at > x.at ? 1 : -1));
  },

  // ---------- データの点検：形式が変わったり、更新が止まったりしていないか ----------
  health: null,
  async check() {
    const issues = [];
    try {
      const mt = await this.getJson(`${JMA}/warning/data/r8/map_time.json`);
      const t = new Date(mt.latestControlDatetime);
      if (isNaN(t)) issues.push('警報・注意報のデータの形式が変わった可能性があります');
      else if (Date.now() - t > 2 * 86400e3) issues.push('警報・注意報のデータが2日以上更新されていません');
    } catch (e) { issues.push('警報・注意報のデータを読みこめません'); }
    try {
      const q = await this.getJson(`${JMA}/quake/data/list.json`);
      if (!Array.isArray(q) || !q.length || !('maxi' in q[0])) issues.push('地震情報のデータの形式が変わった可能性があります');
      else if (Date.now() - new Date(q[0].rdt) > 4 * 86400e3) issues.push('地震情報のデータがしばらく更新されていません');
    } catch (e) { issues.push('地震情報のデータを読みこめません'); }
    this.health = { ok: !issues.length, issues, at: Date.now() };
    return this.health;
  },
  // ---------- 緊急地震速報（警報）：P2P地震情報 API を中継（アプリを開いている間だけ） ----------
  ws: null, wsTry: 0, onEew: null, seen: new Set(), wsState: 'off',
  startEew(cb) {
    this.onEew = cb;
    if (this.ws && this.ws.readyState <= 1) return;
    try {
      this.ws = new WebSocket('wss://api.p2pquake.net/v2/ws');
      this.wsState = 'connecting';
      this.ws.onopen = () => { this.wsState = 'on'; this.wsTry = 0; document.dispatchEvent(new Event('eewstate')); };
      this.ws.onmessage = (ev) => {
        let m; try { m = JSON.parse(ev.data); } catch (e) { return; }
        if (m.code !== 556 || m.test || this.seen.has(m.id)) return;
        this.seen.add(m.id);
        if (this.onEew) this.onEew(m);
      };
      this.ws.onclose = () => {
        this.wsState = 'off'; document.dispatchEvent(new Event('eewstate'));
        if (document.visibilityState === 'visible') setTimeout(() => this.startEew(this.onEew), Math.min(60000, 3000 * 2 ** this.wsTry++));
      };
      this.ws.onerror = () => { try { this.ws.close(); } catch (e) { /* なし */ } };
    } catch (e) { this.wsState = 'off'; }
  },

  // ---------- 天気（アメダスの観測値・天気予報） ----------
  amTable: null,
  async amedasNear(lat, lng) {
    this.amTable = this.amTable || await this.getJson(`${JMA}/amedas/const/amedastable.json`);
    const t = (await (await fetch(`${JMA}/amedas/data/latest_time.txt`, { cache: 'no-cache' })).text()).trim();
    const d = new Date(t); const p2 = (n) => String(n).padStart(2, '0');
    const key = `${d.getFullYear()}${p2(d.getMonth() + 1)}${p2(d.getDate())}${p2(d.getHours())}${p2(d.getMinutes())}00`;
    const obs = await this.getJson(`${JMA}/amedas/data/map/${key}.json`);
    const st = Object.entries(this.amTable).map(([id, v]) => ({ id, name: v.kjName, lat: v.lat[0] + v.lat[1] / 60, lng: v.lon[0] + v.lon[1] / 60, o: obs[id] })).filter((x) => x.o)
      .map((x) => ({ ...x, d: SH.dist(lat, lng, x.lat, x.lng) })).sort((a, b) => a.d - b.d);
    const pick = (k) => st.find((x) => x.o[k] && x.o[k][0] != null && x.o[k][1] === 0);
    const val = (k) => { const x = pick(k); return x ? { v: x.o[k][0], name: x.name, d: x.d } : null; };
    return { time: t, temp: val('temp'), humidity: val('humidity'), rain: val('precipitation1h'), wind: val('wind'), windDir: (pick('wind') || {}).o?.windDirection?.[0] };
  },
  DIR16: ['静穏', '北北東', '北東', '東北東', '東', '東南東', '南東', '南南東', '南', '南南西', '南西', '西南西', '西', '西北西', '北西', '北北西', '北'],
  async forecast(a) {
    const f = await this.getJson(`${JMA}/forecast/data/forecast/${a.office}.json`);
    const s0 = f[0].timeSeries;
    let c10 = null;
    if (a.c20 && this.areaConst) { const v = this.areaConst.class20s[a.c20]; const c15 = v && this.areaConst.class15s[v.parent]; c10 = c15 && c15.parent; }
    const ar = s0[0].areas.find((x) => x.area.code === c10) || s0[0].areas[0];
    const pop = (s0[1].areas.find((x) => x.area.code === ar.area.code) || s0[1].areas[0]);
    const tmp = s0[2].areas[0];
    return { at: f[0].reportDatetime, area: ar.area.name, days: s0[0].timeDefines.map((t, i) => ({ t, w: (ar.weathers || [])[i] })).slice(0, 2),
      pops: s0[1].timeDefines.map((t, i) => ({ t, p: pop.pops[i] })).slice(0, 4), temps: { name: tmp.area.name, v: tmp.temps } };
  },
  // ---------- 雨雲レーダー（高解像度降水ナウキャスト） ----------
  async radarTimes() {
    const past = await this.getJson(`${JMA}/jmatile/data/nowc/targetTimes_N1.json`);
    const fut = await this.getJson(`${JMA}/jmatile/data/nowc/targetTimes_N2.json`);
    const p = past.slice(0, 13).reverse().map((x) => ({ ...x, f: false }));
    const f = fut.slice().reverse().filter((x, i) => i % 1 === 0).map((x) => ({ ...x, f: true }));
    return [...p, ...f];
  },
  radarUrl(x) { return `${JMA}/jmatile/data/nowc/${x.basetime}/none/${x.validtime}/surf/hrpns/{z}/{x}/{y}.png`; },
  utcToLocal(s) { return new Date(Date.UTC(+s.slice(0, 4), +s.slice(4, 6) - 1, +s.slice(6, 8), +s.slice(8, 10), +s.slice(10, 12))); },
  SCALE: { 45: '震度5弱', 50: '震度5強', 55: '震度6弱', 60: '震度6強', 70: '震度7', 99: '' },
  fmtTime(s) { const d = new Date(typeof s === 'string' ? s.replace(/\//g, '-').replace(' ', 'T') : s); if (isNaN(d)) return ''; const y = d.getFullYear() !== new Date().getFullYear() ? `${d.getFullYear()}年` : ''; return `${y}${d.getMonth() + 1}月${d.getDate()}日 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; },
  links: {
    warning: (office) => `${JMA}/warning/#area_type=offices&area_code=${office}`,
    quake: `${JMA}/map.html#contents=earthquake_map`,
    tsunami: `${JMA}/map.html#contents=tsunami&elem=warn`,
    volcano: `${JMA}/map.html#contents=volcano`,
    risk: `${JMA}/risk/`,
    rain: `${JMA}/nowc/`,
    timeline: `${JMA}/warning_timeline/`,
    kmoni: 'http://www.kmoni.bosai.go.jp/',
  },
};
