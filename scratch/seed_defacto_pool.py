import json
import requests
import sys

API_KEY = "AIzaSyBjLc8L34Ok0s7Ml55iYjEHIy2-vLncl7E"
PROJECT_ID = "myth-card"
BASE_URL = f"https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/(default)/documents/myth_state"

def get_doc(doc_id):
    url = f"{BASE_URL}/{doc_id}?key={API_KEY}"
    r = requests.get(url, timeout=10)
    if r.status_code == 200:
        val = r.json().get('fields', {}).get('data', {}).get('stringValue', '')
        return json.loads(val)
    return None

def set_doc(doc_id, data):
    url = f"{BASE_URL}/{doc_id}?key={API_KEY}"
    payload = {
        "fields": {
            "data": {
                "stringValue": json.dumps(data)
            }
        }
    }
    r = requests.patch(url, json=payload, timeout=10)
    if r.status_code == 200:
        print(f"[OK] Saved {doc_id} to Firebase")
        return True
    else:
        print(f"[ERROR] Failed to save {doc_id}: {r.status_code} {r.text}")
        return False

def main():
    # 1. Load all DeFacto codes
    with open("scratch/defacto_codes.json", "r", encoding="utf-8") as f:
        data = json.load(f)
    all_codes = data.get("unassigned_codes", [])
    print(f"Total DeFacto codes available in list: {len(all_codes)}")

    # 2. Get registered users from Firebase
    users = get_doc("myth_users")
    if not users:
        print("Could not fetch myth_users from Firebase.")
        sys.exit(1)

    students = users.get("students", {})
    alumni = users.get("alumni", {})

    assigned_codes = set()
    for uid, s in students.items():
        if s.get("defactoCode"):
            assigned_codes.add(s["defactoCode"])
    for uid, a in alumni.items():
        if a.get("defactoCode"):
            assigned_codes.add(a["defactoCode"])

    print(f"Already assigned to users: {len(assigned_codes)}")
    
    # Pool candidates (unused codes)
    available_codes = [c for c in all_codes if c not in assigned_codes]
    print(f"Unused codes available for assignment / pool: {len(available_codes)}")

    # 3. Assign codes to existing registered students who don't have one
    assigned_count = 0
    for uid, s in students.items():
        if not s.get("defactoCode"):
            if available_codes:
                code = available_codes.pop(0)
                s["defactoCode"] = code
                assigned_codes.add(code)
                assigned_count += 1
                print(f"Assigned code to student {uid}: {code}")

    print(f"Assigned {assigned_count} codes to existing students.")

    # 4. Save updated users back to Firebase
    if assigned_count > 0:
        set_doc("myth_users", users)

    # 5. Save remaining available codes to myth_defacto_pool in Firebase
    print(f"Remaining codes for myth_defacto_pool: {len(available_codes)}")
    set_doc("myth_defacto_pool", available_codes)

    print("\nDONE! DeFacto pool successfully seeded to Firebase.")

if __name__ == "__main__":
    main()
