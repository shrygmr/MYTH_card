"""
DeFacto Kodlarini Firebase Kullanicilarina Ata
Calistir: python scratch/assign_defacto_to_firebase.py

Firebase REST API kullanir - kurulum gerektirmez.
Baslamadan once: FIREBASE_API_KEY dogru mu kontrol et.
"""

import json, urllib.request, urllib.error, urllib.parse, random, sys

# ─── FIREBASE CONFIG ──────────────────────────────────────────
FIREBASE_API_KEY  = "AIzaSyBjLc8L34Ok0s7Ml55iYjEHIy2-vLncl7E"
PROJECT_ID        = "myth-card"
FIRESTORE_BASE    = f"https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/(default)/documents"
# ─────────────────────────────────────────────────────────────

def firestore_get(collection, doc_id):
    url = f"{FIRESTORE_BASE}/{collection}/{doc_id}?key={FIREBASE_API_KEY}"
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        print(f"  GET error {e.code}: {e.read().decode()[:200]}")
        return None

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
    except urllib.error.HTTPError as e:
        print(f"  PATCH error {e.code}: {e.read().decode()[:300]}")
        return None

def wrap_string(val):
    return {"stringValue": val}

def get_myth_users():
    """myth_state/myth_users doc'undan kullanicilari getir"""
    print("Firebase'den kullaniciler yukleniyor...")
    doc = firestore_get("myth_state", "myth_users")
    if not doc or "fields" not in doc:
        print("HATA: myth_users bulunamadi!")
        sys.exit(1)
    
    raw = doc["fields"].get("data", {}).get("stringValue", "{}")
    users = json.loads(raw)
    return users

def save_myth_users(users):
    """Guncellenmis kullanicilari Firebase'e yaz"""
    fields = {"data": wrap_string(json.dumps(users, ensure_ascii=False))}
    result = firestore_patch("myth_state", "myth_users", fields)
    return result is not None

# ─── TUM KODLAR ───────────────────────────────────────────────
# (save_defacto_codes.py calistirildiktan sonra buradan okunur)
try:
    with open("scratch/defacto_codes.json", "r", encoding="utf-8-sig") as f:
        codes_data = json.load(f)
    ALL_CODES = codes_data["unassigned_codes"]
except FileNotFoundError:
    print("HATA: once 'python scratch/save_defacto_codes.py' calistir!")
    sys.exit(1)

print(f"Toplam {len(ALL_CODES)} kod hazir.")

# ─── KULLANICILARI YUKLE ──────────────────────────────────────
users = get_myth_users()
students = users.get("students", {})
alumni   = users.get("alumni", {})

all_user_ids = list(students.keys()) + [f"ALU:{k}" for k in alumni.keys()]
print(f"Toplam {len(students)} ogrenci, {len(alumni)} mezun bulundu.")

# Kod atanmamis kullanicilari bul
needs_code = []
for uid in students:
    if not students[uid].get("defactoCode"):
        needs_code.append(("students", uid))
for uid in alumni:
    if not alumni[uid].get("defactoCode"):
        needs_code.append(("alumni", uid))

print(f"Kod atanmamis kullanici: {len(needs_code)}")

if len(needs_code) > len(ALL_CODES):
    print(f"UYARI: Kullanici ({len(needs_code)}) > Kod ({len(ALL_CODES)})")
    print("Mevcut kodlar yeterli olmayabilir, her kullaniciya yine de atanacak.")

# Kodlari karistir
random.shuffle(ALL_CODES)

# ─── KOD ATA ──────────────────────────────────────────────────
assigned = 0
for i, (group, uid) in enumerate(needs_code):
    code = ALL_CODES[i % len(ALL_CODES)]
    if group == "students":
        users["students"][uid]["defactoCode"] = code
    else:
        users["alumni"][uid]["defactoCode"] = code
    assigned += 1
    print(f"  [{i+1}/{len(needs_code)}] {uid} -> {code}")

print(f"\n{assigned} kullaniciya kod atandi.")
print("Firebase'e kaydediliyor...")

if save_myth_users(users):
    print("[OK] Basarili! Tum kodlar Firebase'e yazildi.")
    print("Kullanicilar profil sayfasini yenilediklerinde kodlarini gorecekler.")
else:
    print("[HATA] Firebase yazma BASARISIZ! Yukaridaki hatalara bak.")

# Sonuclari kaydet
with open("scratch/defacto_assigned.json", "w", encoding="utf-8") as f:
    summary = {uid: users[g][uid].get("defactoCode") 
               for g, uid in needs_code 
               if g in ("students",)}
    json.dump(summary, f, ensure_ascii=False, indent=2)
print(f"Atama ozeti: scratch/defacto_assigned.json")
