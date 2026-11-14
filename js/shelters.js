// オフライン避難場所検索。
// - 都道府県ごとのデータ（data/shelters/XX.json）を、ボタンを押したときだけダウンロードして Cache Storage に保存
// - 現在地（GPS）はこの端末の中だけで使い、外へは送らない。距離と方角も端末内で計算する
const SH_CACHE = 'bousai-shelters-v1';
const SH = {
  index: null,
  async loadIndex() {
    if (this.index) return this.index;
    const res = await this.fetchData('data/shelters/index.json');
    this.index = res ? await res.json() : null;
    return this.index;
  },
  // 保存済みならそれを使い、なければネット（オンラインのときだけ）
  async fetchData(url, save) {
    let cache = null;
    try { cache = await caches.open(SH_CACHE); } catch (e) { /* 使えないブラウザ */ }
    if (cache && !save) { const hit = await cache.match(url); if (hit) return hit; }
    try {
      const res = await fetch(url, { cache: 'no-cache' });
      if (!res.ok) return null;
      if (cache && (save || url.endsWith('index.json'))) await cache.put(url, res.clone());
      return res;
    } catch (e) { return cache ? cache.match(url) : null; }
  },
  saved() { return store.get('prefsSaved', {}); },
  // 避難場所（命を守るために逃げる場所）と避難所（しばらく過ごす場所）の両方を保存する
  async download(code) {
    const res = await this.fetchData(`data/shelters/${code}.json`, true);
    const res2 = await this.fetchData(`data/hinanjo/${code}.json`, true);
    if (!res || !res2) throw new Error('ダウンロードできませんでした。インターネットにつながっているか確認してください。');
    const j = await res.clone().json(); const j2 = await res2.clone().json();
    const s = this.saved(); s[code] = { at: Date.now(), updated: j.updated, n: j.rows.length, nJo: j2.rows.length }; store.set('prefsSaved', s);
    delete this.mem[code]; delete this.mem['jo' + code];
    return j;
  },
  async remove(code) {
    try { const c = await caches.open(SH_CACHE); await c.delete(`data/shelters/${code}.json`); await c.delete(`data/hinanjo/${code}.json`); } catch (e) { /* なし */ }
    const s = this.saved(); delete s[code]; store.set('prefsSaved', s); delete this.mem[code]; delete this.mem['jo' + code];
  },
  mem: {},
  async rows(code, jo) {
    const key = (jo ? 'jo' : '') + code;
    if (this.mem[key]) return this.mem[key];
    let res = null;
    try { const c = await caches.open(SH_CACHE); res = await c.match(`data/${jo ? 'hinanjo' : 'shelters'}/${code}.json`); } catch (e) { /* なし */ }
    if (!res) return [];
    const j = await res.json();
    this.mem[key] = j.rows;
    return j.rows;
  },
  async all(jo) {
    const out = [];
    for (const code of Object.keys(this.saved())) (await this.rows(code, jo)).forEach((r) => out.push(r));
    return out;
  },
  // 2点間の距離（m）と方角（度：北=0、時計回り）
  dist(lat1, lng1, lat2, lng2) {
    const R = 6371000, rad = Math.PI / 180;
    const dLat = (lat2 - lat1) * rad, dLng = (lng2 - lng1) * rad;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  },
  bearing(lat1, lng1, lat2, lng2) {
    const rad = Math.PI / 180;
    const y = Math.sin((lng2 - lng1) * rad) * Math.cos(lat2 * rad);
    const x = Math.cos(lat1 * rad) * Math.sin(lat2 * rad) - Math.sin(lat1 * rad) * Math.cos(lat2 * rad) * Math.cos((lng2 - lng1) * rad);
    return (Math.atan2(y, x) / rad + 360) % 360;
  },
  dirName(deg) { return ['北', '北北東', '北東', '東北東', '東', '東南東', '南東', '南南東', '南', '南南西', '南西', '西南西', '西', '西北西', '北西', '北北西'][Math.round(deg / 22.5) % 16]; },
  fmtDist(m) { return m < 1000 ? `${Math.round(m / 10) * 10}m` : `${(m / 1000).toFixed(m < 10000 ? 1 : 0)}km`; },
  // rows: [name, addr, lat, lng, flags]  flags: HAZARDS の順のビット
  has(r, hz) { const i = HAZARDS.findIndex((h) => h.k === hz); return i >= 0 && (r[4] & (1 << i)) !== 0; },
  async nearest(lat, lng, hz, n = 10, jo) {
    const rows = await this.all(jo);
    return rows.filter((r) => jo || this.has(r, hz)).map((r) => ({ r, d: this.dist(lat, lng, r[2], r[3]), b: this.bearing(lat, lng, r[2], r[3]) }))
      .sort((a, b) => a.d - b.d).slice(0, n);
  },
  async search(text, hz, n = 30, jo) {
    const t = text.trim(); if (!t) return [];
    const rows = await this.all(jo);
    return rows.filter((r) => (jo || !hz || this.has(r, hz)) && (r[0].includes(t) || r[1].includes(t))).slice(0, n).map((r) => ({ r }));
  },
  locate() {
    return new Promise((resolve, reject) => {
      if (!('geolocation' in navigator)) return reject(new Error('この端末では現在地を取得できません。'));
      navigator.geolocation.getCurrentPosition((p) => resolve(p.coords), (e) => {
        reject(new Error(e.code === 1 ? '位置情報の利用が許可されていません。端末の設定で許可するか、下の「名前・住所で探す」を使ってください。'
          : '現在地を取得できませんでした。屋外や窓の近くで試すか、「名前・住所で探す」を使ってください。'));
      }, { enableHighAccuracy: true, timeout: 20000, maximumAge: 60000 });
    });
  },
};
