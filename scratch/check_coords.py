import json
import urllib.request

API_KEY = "AIzaSyBjLc8L34Ok0s7Ml55iYjEHIy2-vLncl7E"
PROJECT_ID = "myth-card"

def get_state(key):
    url = f"https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/(default)/documents/myth_state/{key}?key={API_KEY}"
    req = urllib.request.Request(url, method="GET")
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode("utf-8"))
        if 'fields' in data and 'data' in data['fields'] and 'stringValue' in data['fields']['data']:
            return json.loads(data['fields']['data']['stringValue'])
    return []

venues = get_state("myth_venues")
print(f"Toplam mekan sayisi: {len(venues)}")
print()

# Ankara sinirlari disinda olabilecek koordinatlar
# Ankara yaklasik: lat 39.6 - 40.3, lng 32.4 - 33.1
print("=== ANKARA DIŞINDAKİ veya ŞÜPHELİ KOORDİNATLI MEKANLAR ===")
suspicious = []
for v in venues:
    lat = v.get('lat')
    lng = v.get('lng')
    name = v.get('name','')
    if lat is None or lng is None:
        print(f"KOORDİNAT YOK — ID:{v.get('id')} {name} ({v.get('region')})")
        suspicious.append(v)
        continue
    try:
        lat = float(lat)
        lng = float(lng)
    except:
        print(f"HATALI KOORDİNAT — ID:{v.get('id')} {name} lat={v.get('lat')} lng={v.get('lng')}")
        suspicious.append(v)
        continue
    # Ankara dışı
    if not (39.5 <= lat <= 40.4 and 32.3 <= lng <= 33.2):
        print(f"ANKARA DIŞI — ID:{v.get('id')} {name} ({v.get('region')}) lat={lat} lng={lng}")
        suspicious.append(v)

if not suspicious:
    print("Tüm mekanlar Ankara sınırları içinde, koordinat sorunu yok.")

print()
# Eryaman bölgesi mekanları - koordinat kontrolü
# Eryaman yaklaşık lat: 39.97-40.02, lng: 32.60-32.70
print("=== TÜM ERYAMAN MEKANLAR (koordinat doğrulama) ===")
for v in venues:
    if v.get('region','').lower() in ['eryaman', 'etimesgut', 'gazi mah.', 'gazi']:
        print(f"ID: {v.get('id')}, Ad: {v.get('name')}, Bölge: {v.get('region')}, lat={v.get('lat')}, lng={v.get('lng')}")

print()
print("=== TÜM MEKANLAR BÖLGEYE GÖRE (sayım) ===")
region_counts = {}
for v in venues:
    r = v.get('region', 'BELİRSİZ')
    region_counts[r] = region_counts.get(r, 0) + 1
for r, c in sorted(region_counts.items()):
    print(f"  {r}: {c} mekan")
