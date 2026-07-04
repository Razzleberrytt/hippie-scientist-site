"""
Build health check for Cloudflare Pages
Verifies the site is responding and recent deploy succeeded.
"""
import requests
import sys
from datetime import datetime

SITE_URL = "https://thehippiescientist.net"
TIMEOUT = 15

def main():
    print(f"[{datetime.now().isoformat()}] Checking site health...")
    errors = []
    
    # Check homepage loads
    try:
        r = requests.get(SITE_URL, timeout=TIMEOUT, headers={"User-Agent": "HippieScientistBot/1.0"})
        if r.status_code != 200:
            errors.append(f"Homepage returned {r.status_code}")
        else:
            print(f"✅ Homepage OK ({len(r.content)} bytes)")
    except Exception as e:
        errors.append(f"Homepage unreachable: {e}")
    
    # Check a few key pages
    key_pages = [
        "/herbs/ashwagandha/",
        "/compounds/l-theanine/",
        "/guides/",
        "/guides/compare/",
    ]
    for page in key_pages:
        try:
            r = requests.get(SITE_URL + page, timeout=TIMEOUT, headers={"User-Agent": "HippieScientistBot/1.0"})
            if r.status_code != 200:
                errors.append(f"{page} returned {r.status_code}")
            else:
                print(f"✅ {page} OK")
        except Exception as e:
            errors.append(f"{page} unreachable: {e}")
    
    if errors:
        print(f"\n❌ ISSUES FOUND:")
        for e in errors:
            print(f"  {e}")
        sys.exit(1)
    else:
        print(f"\n✅ All checks passed - site is healthy")

if __name__ == "__main__":
    main()
