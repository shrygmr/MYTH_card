import json
import requests

API_KEY = "AIzaSyBjLc8L34Ok0s7Ml55iYjEHIy2-vLncl7E"
PROJECT_ID = "myth-card"
URL = f"https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/(default)/documents/myth_state/myth_venues?key={API_KEY}"

def get_current_venues():
    resp = requests.get(URL)
    if resp.status_code == 200:
        data = resp.json()
        venues_str = data['fields']['data']['stringValue']
        return json.loads(venues_str)
    else:
        print(f"Error fetching venues: {resp.status_code}")
        return []

def save_venues(venues):
    payload = {
        "fields": {
            "data": {
                "stringValue": json.dumps(venues)
            }
        }
    }
    resp = requests.patch(URL, json=payload)
    if resp.status_code == 200:
        print("Successfully updated venues in Firebase!")
    else:
        print(f"Error saving venues: {resp.status_code}")

if __name__ == "__main__":
    current_venues = get_current_venues()
    
    with open('scratch/new_kocatepe_venues.json', 'r') as f:
        new_venues = json.load(f)
    
    current_names = {v['name'] for v in current_venues}
    added_count = 0
    for nv in new_venues:
        if nv['name'] not in current_names:
            current_venues.append(nv)
            added_count += 1
    
    if added_count > 0:
        print(f"Adding {added_count} new Kruvasante branches...")
        save_venues(current_venues)
    else:
        print("All branches already exist.")
