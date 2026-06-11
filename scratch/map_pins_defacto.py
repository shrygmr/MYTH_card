"""
DeFacto Kodlarini Ilk 597 PIN'e Baglama Scripti
"""

import json, urllib.request

# ─── FIREBASE CONFIG ──────────────────────────────────────────
FIREBASE_API_KEY  = "AIzaSyBjLc8L34Ok0s7Ml55iYjEHIy2-vLncl7E"
PROJECT_ID        = "myth-card"
FIRESTORE_BASE    = f"https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/(default)/documents"

def firestore_patch(collection, doc_id, fields_dict):
    """Update specific fields using PATCH with updateMask"""
    field_paths = list(fields_dict.keys())
    mask_params = "&".join(f"updateMask.fieldPaths={f}" for f in field_paths)
    url = f"{FIRESTORE_BASE}/{collection}/{doc_id}?key={FIREBASE_API_KEY}&{mask_params}"
    
    body = json.dumps({"fields": fields_dict}).encode()
    req = urllib.request.Request(url, data=body, method="PATCH",
                                  headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req) as r:
            return json.loads(r.read())
    except Exception as e:
        print(f"PATCH error: {e}")
        return None

def wrap_string(val):
    return {"stringValue": val}

def main():
    # 1. Kodlari Oku
    with open("scratch/defacto_codes.json", "r", encoding="utf-8") as f:
        data = json.load(f)
    codes = data.get("unassigned_codes", []) + list(data.get("assigned_codes", {}).values())
    codes = list(set(codes)) # benzersizleri al
    print(f"Toplam kod: {len(codes)}")

    # 2. PIN'leri Oku
    with open("student_pins.json", "r", encoding="utf-8") as f:
        pins = json.load(f)
    print(f"Toplam PIN: {len(pins)}")

    # 3. Eslestirme
    mapping = {}
    for i in range(min(len(codes), len(pins))):
        mapping[pins[i]] = codes[i]
    
    print(f"Eslestirilen miktar: {len(mapping)}")
    
    # 4. JSON Olarak Kaydet
    with open("scratch/defacto_pin_map.json", "w", encoding="utf-8") as f:
        json.dump(mapping, f, ensure_ascii=False, indent=2)

    # 5. Firebase'e gonder
    fields = {"data": wrap_string(json.dumps(mapping, ensure_ascii=False))}
    res = firestore_patch("myth_state", "myth_defacto_map", fields)
    if res:
        print("[OK] Firebase'e basariyla myth_defacto_map doc eklendi!")
    else:
        print("[FAIL] Firebase guncellemesi basarisiz.")

if __name__ == "__main__":
    main()
