"""
GitHub API Push Script - MYTh Kart
Terminalde calistir: python scratch/github_push.py

Token olustur: https://github.com/settings/tokens/new
Permissions: repo (full control)
"""

import urllib.request, urllib.error, json, base64, os, sys

GITHUB_TOKEN = ""        # <-- Buraya tokenini yapistir
REPO_OWNER   = "shrygmr"
REPO_NAME    = "MYTH_card"
BRANCH       = "main"
COMMIT_MSG   = "fix: student panel layout + DeFacto campaign banner with 597 codes"

FILES_TO_PUSH = {
    r"c:\Users\stj.sahra.berk\Desktop\work\css\admin.css": "css/admin.css",
    r"c:\Users\stj.sahra.berk\Desktop\work\profile.html":  "profile.html",
}

BASE_URL = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}"
HEADERS  = {
    "Authorization": f"token {GITHUB_TOKEN}",
    "Accept":        "application/vnd.github.v3+json",
    "Content-Type":  "application/json",
    "User-Agent":    "MYThKart-Deploy/1.0"
}

def api_req(url, method="GET", data=None):
    body = json.dumps(data).encode() if data else None
    req  = urllib.request.Request(url, data=body, headers=HEADERS, method=method)
    try:
        with urllib.request.urlopen(req) as r:
            return json.loads(r.read()), r.status
    except urllib.error.HTTPError as e:
        print("  HTTP", e.code, e.read().decode()[:200])
        return None, e.code

def get_sha(path):
    r, _ = api_req(f"{BASE_URL}/contents/{path}?ref={BRANCH}")
    return r.get("sha") if r else None

def push(local, remote):
    print(f"\nPushing {remote} ...")
    with open(local, "rb") as f:
        content = base64.b64encode(f.read()).decode()
    sha = get_sha(remote)
    payload = {"message": COMMIT_MSG, "content": content, "branch": BRANCH}
    if sha:
        payload["sha"] = sha
    _, status = api_req(f"{BASE_URL}/contents/{remote}", "PUT", payload)
    ok = status in (200, 201)
    print("  " + ("[OK]" if ok else "[FAIL]") + f" {status}")
    return ok

if __name__ == "__main__":
    if not GITHUB_TOKEN:
        print("[HATA] GITHUB_TOKEN bos! Dosyayi ac ve tokeni gir.")
        print("Token: https://github.com/settings/tokens/new  (repo scope)")
        sys.exit(1)

    print(f"Deploy: {REPO_OWNER}/{REPO_NAME} [{BRANCH}]")
    ok = sum(push(lp, rp) for lp, rp in FILES_TO_PUSH.items() if os.path.exists(lp))
    print(f"\n{ok}/{len(FILES_TO_PUSH)} dosya push edildi.")
    if ok == len(FILES_TO_PUSH):
        print("Site: https://mythcard.com.tr (birkaç dakika içinde aktif)")
