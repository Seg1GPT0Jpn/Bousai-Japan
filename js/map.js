// 地図（通信があるときだけ）。地図の画像は国土地理院の地理院タイルを使う。
// 現在地は地図の上に表示するだけで、外へは送らない（地図の画像を取りにいく通信は発生する）。
const MAP = {
  ok() { return typeof L !== 'undefined' && navigator.onLine; },
  make(el, lat, lng, z = 15) {
    const m = L.map(el, { zoomControl: true, attributionControl: true }).setView([lat, lng], z);
    L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png', {
      maxZoom: 18, minZoom: 5,
      attribution: '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank" rel="noopener">地理院タイル</a>',
    }).addTo(m);
    return m;
  },
  dot(color, label) {
    return L.divIcon({ className: 'mk', html: `<span style="background:${color}">${label || ''}</span>`, iconSize: [28, 28], iconAnchor: [14, 14] });
  },
  // Googleマップで「歩いて行く」ルートを開く（APIキー不要の公式のURL形式）
  gmapsWalk(lat, lng) { return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`; },
  // ハザードマップポータルサイトのオープンデータ（浸水・土砂など）を重ねる
  HAZ: {
    flood: ['洪水（想定最大規模）', ['01_flood_l2_shinsuishin_data']],
    tsunami: ['津波', ['04_tsunami_newlegend_data']],
    landslide: ['土砂災害警戒区域', ['05_dosekiryukeikaikuiki', '05_kyukeishakeikaikuiki', '05_jisuberikeikaikuiki']],
    storm: ['高潮', ['03_hightide_l2_shinsuishin_data']],
  },
  hazLayers(m, initial) {
    const attr = '<a href="https://disaportal.gsi.go.jp/hazardmapportal/hazardmap/copyright/opendata.html" target="_blank" rel="noopener">ハザードマップポータルサイト</a>';
    const over = {};
    for (const [k, [name, ids]] of Object.entries(this.HAZ)) {
      const g = L.layerGroup(ids.map((id) => L.tileLayer(`https://disaportaldata.gsi.go.jp/raster/${id}/{z}/{x}/{y}.png`, { opacity: 0.65, maxNativeZoom: 17, maxZoom: 18, minZoom: 2, errorTileUrl: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==', attribution: attr })));
      over[name] = g; if (k === initial) g.addTo(m);
    }
    L.control.layers(null, over, { collapsed: false, position: 'bottomleft' }).addTo(m);
    return over;
  },
  hazPortal(lat, lng, z = 16) { return lat != null ? `https://disaportal.gsi.go.jp/maps/?ll=${lat},${lng}&z=${z}&base=pale&vs=c1j0l0u0t0h0z0` : 'https://disaportal.gsi.go.jp/maps/'; },
  gsiMap(lat, lng, z = 17) { return `https://maps.gsi.go.jp/#${z}/${lat}/${lng}/`; },
};
