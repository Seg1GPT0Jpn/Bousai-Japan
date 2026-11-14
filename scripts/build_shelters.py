#!/usr/bin/env python3
"""国土地理院「指定緊急避難場所データ」（全国CSV）を、都道府県ごとの軽いJSONに変換する。

使い方:
  python3 scripts/build_shelters.py                 # 公式サイトから全国CSVをダウンロードして変換
  python3 scripts/build_shelters.py path/to.csv     # 手元のCSVを変換

出力: data/shelters/01.json 〜 47.json と data/shelters/index.json
各行は [施設・場所名, 住所, 緯度, 経度, 対応災害のビット]。
ビットの順番は js/content.js の HAZARDS と同じ
（地震, 津波, 洪水, 崖崩れ・土石流・地滑り, 高潮, 大規模な火事, 内水氾濫, 火山現象）。

データの出典と利用条件:
  国土地理院「指定緊急避難場所・指定避難所データ」 https://hinanmap.gsi.go.jp/index.html
  公共データ利用規約（第1.0版）（PDL1.0）。加工したことを明記して利用する。
"""
import csv, datetime, io, json, os, sys, urllib.request

URL = 'https://hinanmap.gsi.go.jp/hinanjocp/defaultFtpData/csv/mergeFromCity_2.csv'
PREFS = ['北海道','青森県','岩手県','宮城県','秋田県','山形県','福島県','茨城県','栃木県','群馬県','埼玉県','千葉県','東京都','神奈川県','新潟県','富山県','石川県','福井県','山梨県','長野県','岐阜県','静岡県','愛知県','三重県','滋賀県','京都府','大阪府','兵庫県','奈良県','和歌山県','鳥取県','島根県','岡山県','広島県','山口県','徳島県','香川県','愛媛県','高知県','福岡県','佐賀県','長崎県','熊本県','大分県','宮崎県','鹿児島県','沖縄県']
# HAZARDS（js/content.js）の順番に対応するCSVの列名
COLS = ['地震', '津波', '洪水', '崖崩れ、土石流及び地滑り', '高潮', '大規模な火事', '内水氾濫', '火山現象']

def main():
    root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
    out_dir = os.path.join(root, 'data', 'shelters')
    os.makedirs(out_dir, exist_ok=True)
    if len(sys.argv) > 1:
        raw = open(sys.argv[1], 'rb').read()
        fetched = datetime.date.fromtimestamp(os.path.getmtime(sys.argv[1])).isoformat()
    else:
        with urllib.request.urlopen(URL, timeout=120) as r:
            raw = r.read()
        fetched = datetime.date.today().isoformat()
    text = raw.decode('utf-8-sig')
    rows = list(csv.DictReader(io.StringIO(text)))
    missing = [c for c in COLS + ['施設・場所名', '住所', '緯度', '経度', '都道府県名及び市町村名'] if c not in rows[0]]
    if missing:
        sys.exit(f'CSVの列が想定とちがいます: {missing}')
    by = {i: [] for i in range(47)}
    skipped = 0
    for r in rows:
        city = r['都道府県名及び市町村名'] or r['住所']
        pi = next((i for i, p in enumerate(PREFS) if city.startswith(p)), None)
        try:
            lat, lng = round(float(r['緯度']), 6), round(float(r['経度']), 6)
        except ValueError:
            pi = None
        if pi is None or not (20 < lat < 46.5 and 122 < lng < 154.5):
            skipped += 1
            continue
        flags = 0
        for b, c in enumerate(COLS):
            if (r[c] or '').strip() == '1':
                flags |= 1 << b
        if not flags:
            skipped += 1
            continue
        name = (r['施設・場所名'] or '').strip()
        addr = (r['住所'] or '').strip()
        by[pi].append([name, addr, lat, lng, flags])
    index = {'source': '国土地理院「指定緊急避難場所・指定避難所データ」（指定緊急避難場所）', 'url': 'https://hinanmap.gsi.go.jp/index.html',
             'license': '公共データ利用規約（第1.0版）', 'fetched': fetched, 'prefs': {}}
    for i, items in by.items():
        code = f'{i + 1:02d}'
        items.sort(key=lambda x: x[1])
        data = {'v': 1, 'pref': PREFS[i], 'updated': fetched, 'rows': items}
        path = os.path.join(out_dir, f'{code}.json')
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, separators=(',', ':'))
        index['prefs'][code] = {'name': PREFS[i], 'n': len(items), 'bytes': os.path.getsize(path)}
    with open(os.path.join(out_dir, 'index.json'), 'w', encoding='utf-8') as f:
        json.dump(index, f, ensure_ascii=False, indent=1)
    total = sum(len(v) for v in by.values())
    print(f'{total} 件を変換（除外 {skipped} 件）。取得日 {fetched}')

if __name__ == '__main__':
    main()
