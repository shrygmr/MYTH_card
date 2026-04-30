
import json

def update_venues():
    try:
        with open('/Users/apple/Desktop/481/myth_website/scratch/venues_v2.json', 'r') as f:
            venues = json.load(f)
    except:
        return "File not found"

    # Region base coordinates (Approximate centers of streets/areas)
    # Bahçelievler (7. Cadde focus): 39.9213, 32.8225
    # Tunalı (Tunalı Hilmi focus): 39.9048, 32.8601
    # Emek (Bişkek Cad focus): 39.9168, 32.8213
    # Bilkent (Center): 39.8665, 32.7485
    # Kızılay (Karanfil focus): 39.9192, 32.8546
    # Çayyolu (Merkez): 39.8885, 32.6955
    # Beytepe (Angora focus): 39.8655, 32.7355

    for i, v in enumerate(venues):
        # Fix discount
        v['discount'] = v['discount'].replace('%', '').strip()
        
        # Add slight jitter so markers don't overlap perfectly
        offset_lat = (i % 10) * 0.0005
        offset_lng = (i // 10) * 0.0005
        
        if v['region'] == "Bahçelievler":
            v['lat'] = 39.9213 + offset_lat
            v['lng'] = 32.8225 + offset_lng
        elif v['region'] == "Tunalı":
            v['lat'] = 39.9048 + offset_lat
            v['lng'] = 32.8601 + offset_lng
        elif v['region'] == "Emek":
            v['lat'] = 39.9168 + offset_lat
            v['lng'] = 32.8213 + offset_lng
        elif v['region'] == "Bilkent":
            v['lat'] = 39.8665 + offset_lat
            v['lng'] = 32.7485 + offset_lng
        elif v['region'] == "Kızılay":
            v['lat'] = 39.9192 + offset_lat
            v['lng'] = 32.8546 + offset_lng
        elif v['region'] == "Çayyolu":
            v['lat'] = 39.8885 + offset_lat
            v['lng'] = 32.6955 + offset_lng
        elif v['region'] == "Beytepe":
            v['lat'] = 39.8655 + offset_lat
            v['lng'] = 32.7355 + offset_lng

    with open('/Users/apple/Desktop/481/myth_website/scratch/venues_v3.json', 'w', encoding='utf-8') as f:
        json.dump(venues, f, ensure_ascii=False)

    payload = {'fields': {'data': {'stringValue': json.dumps(venues, ensure_ascii=False)}}}
    with open('/Users/apple/Desktop/481/myth_website/scratch/payload_v3.json', 'w', encoding='utf-8') as f:
        json.dump(payload, f, ensure_ascii=False)

update_venues()
