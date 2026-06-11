import json
import requests

API_KEY = "AIzaSyBjLc8L34Ok0s7Ml55iYjEHIy2-vLncl7E"
PROJECT_ID = "myth-card"

def get_state(key):
    url = f"https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/(default)/documents/myth_state/{key}?key={API_KEY}"
    resp = requests.get(url)
    if resp.status_code == 200:
        data = resp.json()
        if 'fields' in data and 'data' in data['fields'] and 'stringValue' in data['fields']['data']:
            return json.loads(data['fields']['data']['stringValue'])
    print(f"Failed to fetch {key}: {resp.status_code}")
    return []

def main():
    venues = get_state("myth_venues")
    deals = get_state("myth_deals")
    reviews = get_state("myth_reviews")

    print(f"Total venues: {len(venues)}")
    print(f"Total deals: {len(deals)}")
    print(f"Total reviews: {len(reviews)}")

    # Check for duplicate IDs in venues
    id_map = {}
    for v in venues:
        vid = v.get('id')
        name = v.get('name')
        region = v.get('region')
        if vid not in id_map:
            id_map[vid] = []
        id_map[vid].append((name, region))

    duplicates = {k: v for k, v in id_map.items() if len(v) > 1}
    if duplicates:
        print("\nDuplicate Venue IDs found:")
        for vid, occurrences in sorted(duplicates.items()):
            print(f"ID {vid}:")
            for idx, (name, region) in enumerate(occurrences):
                print(f"  [{idx}] {name} ({region})")
    else:
        print("\nNo duplicate Venue IDs found.")

    # Check references in deals
    print("\nDeals references:")
    for d in deals:
        venue_id = d.get('venueId')
        title = d.get('title')
        matching_venues = [v for v in venues if v.get('id') == venue_id]
        if len(matching_venues) == 0:
            print(f"  Deal '{title}' references non-existent venue ID: {venue_id}")
        elif len(matching_venues) > 1:
            print(f"  Deal '{title}' references duplicated venue ID: {venue_id} (matches: {[v.get('name') for v in matching_venues]})")

    # Check references in reviews
    print("\nReviews references:")
    for r in reviews:
        venue_id = r.get('venueId')
        text = r.get('text', '')[:30]
        matching_venues = [v for v in venues if v.get('id') == venue_id]
        if len(matching_venues) == 0:
            print(f"  Review '{text}...' references non-existent venue ID: {venue_id}")
        elif len(matching_venues) > 1:
            print(f"  Review '{text}...' references duplicated venue ID: {venue_id} (matches: {[v.get('name') for v in matching_venues]})")

if __name__ == "__main__":
    main()
