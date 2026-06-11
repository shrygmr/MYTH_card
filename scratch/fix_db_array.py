import json
import urllib.request

API_KEY = "AIzaSyBjLc8L34Ok0s7Ml55iYjEHIy2-vLncl7E"
PROJECT_ID = "myth-card"

def get_state(key):
    url = f"https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/(default)/documents/myth_state/{key}?key={API_KEY}"
    try:
        req = urllib.request.Request(url, method="GET")
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode("utf-8"))
            if 'fields' in data and 'data' in data['fields'] and 'stringValue' in data['fields']['data']:
                return json.loads(data['fields']['data']['stringValue'])
    except Exception as e:
        print(f"Error fetching {key}: {e}")
    return None

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
    try:
        req = urllib.request.Request(url, data=payload_bytes, method="PATCH", headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req) as response:
            print(f"Successfully saved {key} to Firestore.")
    except Exception as e:
        print(f"Error saving {key}: {e}")

def main():
    venues_data = get_state("myth_venues")
    if venues_data is None:
        print("Could not fetch venues.")
        return
        
    print("Fetched venues data type:", type(venues_data))
    
    clean_venues = None
    if isinstance(venues_data, dict):
        if "value" in venues_data:
            clean_venues = venues_data["value"]
            print("Extracted venues list from 'value' wrapper. Length:", len(clean_venues))
        else:
            print("Venues data is a dict but doesn't have 'value' key. Keys:", list(venues_data.keys()))
    elif isinstance(venues_data, list):
        clean_venues = venues_data
        print("Venues data is already a list. Length:", len(clean_venues))
        
    if clean_venues is not None:
        save_state("myth_venues", clean_venues)
        
        local_path = "c:\\Users\\stj.sahra.berk\\Desktop\\work\\myth_venues_backup_final.json"
        with open(local_path, "w", encoding="utf-8") as f:
            json.dump(clean_venues, f, ensure_ascii=False, indent=4)
        print(f"Successfully saved clean list locally to {local_path}")
    else:
        print("Could not identify clean venues array.")

if __name__ == "__main__":
    main()
