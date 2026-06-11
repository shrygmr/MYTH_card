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
print(f"Toplam mekan sayısı: {len(venues)}")
print()

# Kaşmir ve Eryaman içeren mekanları listele
print("=== KAŞMİR ve ERYAMAN mekanlari ===")
for v in venues:
    name = v.get('name', '')
    if 'kaşmir' in name.lower() or 'kasmir' in name.lower() or v.get('region','').lower() == 'eryaman':
        print(f"ID: {v.get('id')}, Adı: {name}, Bölge: {v.get('region')}, Lat: {v.get('lat')}, Lng: {v.get('lng')}, Adres: {v.get('address','')}")

print()

# İsme göre duplikatlari bul
print("=== İSME GÖRE TEKRAR EDENLER ===")
name_map = {}
for v in venues:
    name = v.get('name', '').strip().lower()
    if name not in name_map:
        name_map[name] = []
    name_map[name].append(v)

for name, group in sorted(name_map.items()):
    if len(group) > 1:
        print(f"\nMekan: '{group[0].get('name')}'")
        for g in group:
            print(f"  ID: {g.get('id')}, Bölge: {g.get('region')}, Lat: {g.get('lat')}, Lng: {g.get('lng')}, Adres: {g.get('address','')}")
