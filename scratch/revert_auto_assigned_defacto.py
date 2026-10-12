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

# The 39 students that were auto-assigned:
STUDENTS_TO_REVERT = [
    "211401016", "211701034", "212121212", "221404032", "231510080",
    "233101043", "234601025", "241101009", "241101016", "241101078",
    "241201078", "241301063", "241401019", "241501004", "241501014",
    "241501027", "241501040", "241501073", "241801005", "243201026",
    "244601010", "244601016", "245101002", "245101028", "245101059",
    "245201005", "251101032", "251101053", "251201021", "251201035",
    "251201077", "251301007", "251401036", "251501056", "251501072",
    "251701047", "253101026", "256501007", "999999999"
]

def main():
    users = get_doc("myth_users")
    pool = get_doc("myth_defacto_pool") or []

    students = users.get("students", {})
    recovered_codes = []

    for uid in STUDENTS_TO_REVERT:
        if uid in students and "defactoCode" in students[uid]:
            code = students[uid].pop("defactoCode")
            if "defactoClaimedAt" in students[uid]:
                students[uid].pop("defactoClaimedAt")
            recovered_codes.append(code)
            print(f"Removed code {code} from {uid}")

    print(f"Recovered {len(recovered_codes)} codes.")
    
    # Prepend recovered codes back to pool
    updated_pool = recovered_codes + pool
    # Deduplicate while preserving order
    seen = set()
    deduped_pool = []
    for c in updated_pool:
        if c not in seen:
            seen.add(c)
            deduped_pool.append(c)

    print(f"Pool size before: {len(pool)}, now: {len(deduped_pool)}")

    set_doc("myth_users", users)
    set_doc("myth_defacto_pool", deduped_pool)
    print("Done! Reverted auto-assigned students. All 544 codes are in myth_defacto_pool.")

if __name__ == "__main__":
    main()
