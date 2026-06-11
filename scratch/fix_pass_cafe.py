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

def save_state(key, data_obj):
    url = f"https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/(default)/documents/myth_state/{key}?key={API_KEY}"
    json_str = json.dumps(data_obj, ensure_ascii=False)
    payload = {
        "fields": {
            "data": {
                "stringValue": json_str
            }
        }
    }
    payload_bytes = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=payload_bytes, method="PATCH", headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as response:
        print(f"Successfully saved {key} to Firestore.")

def main():
    venues = get_state("myth_venues")
    print(f"Loaded {len(venues)} venues.")
    
    found = False
    for v in venues:
        if v.get('id') == 1014 or 'pass cafe' in v.get('name', '').lower():
            print(f"Found venue: ID {v.get('id')}, Name: '{v.get('name')}'")
            print(f"Old coords: lat={v.get('lat')}, lng={v.get('lng')}")
            # Update coordinates to Abay Kunanbay Cd. No:6
            v['lat'] = 39.903663
            v['lng'] = 32.861146
            print(f"New coords: lat={v.get('lat')}, lng={v.get('lng')}")
            found = True
            
    if found:
        save_state("myth_venues", venues)
        
        local_path = "c:\\Users\\stj.sahra.berk\\Desktop\\work\\myth_venues_backup_final.json"
        with open(local_path, "w", encoding="utf-8") as f:
            json.dump(venues, f, ensure_ascii=False, indent=4)
        print("Updated both Firebase and local backup JSON.")
    else:
        print("Could not find Pass Cafe in venues list.")

if __name__ == "__main__":
    main()
