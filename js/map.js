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
  gsiMap(lat, lng, z = 17) { return `https://maps.gsi.go.jp/#${z}/${lat}/${lng}/`; },
};
