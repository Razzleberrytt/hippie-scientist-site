"""
Broken link checker for thehippiescientist.net
Scans the sitemap for links and checks HTTP status.
"""
import requests
import xml.etree.ElementTree as ET
import sys
from datetime import datetime

SITEMAP_URL = "https://thehippiescientist.net/sitemap.xml"
TIMEOUT = 15
MAX_LINKS = 200  # Limit per run to stay within time

def main():
    print(f"[{datetime.now().isoformat()}] Starting broken link check...")
    
    try:
        resp = requests.get(SITEMAP_URL, timeout=TIMEOUT, headers={"User-Agent": "HippieScientistBot/1.0"})
        resp.raise_for_status()
        root = ET.fromstring(resp.content)
        
        # Parse sitemap URLs
        ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
        urls = [el[0].text for el in root.findall("sm:url", ns) if el[0].text]
        
        if not urls:
            urls = [el.text for el in root.findall(".//{http://www.sitemaps.org/schemas/sitemap/0.9}loc")]
        
        urls = urls[:MAX_LINKS]
        print(f"Checking {len(urls)} URLs...")
        
        broken = []
        for i, url in enumerate(urls):
            try:
                r = requests.head(url, timeout=TIMEOUT, allow_redirects=True, headers={"User-Agent": "HippieScientistBot/1.0"})
                if r.status_code >= 400:
                    broken.append((url, r.status_code))
            except Exception as e:
                broken.append((url, str(e)))
            
            if (i + 1) % 50 == 0:
                print(f"  {i+1}/{len(urls)} checked, {len(broken)} broken")
        
        if broken:
            print(f"\n❌ FOUND {len(broken)} BROKEN LINKS:")
            for url, status in broken:
                print(f"  {status}: {url}")
            sys.exit(1)
        else:
            print(f"\n✅ All {len(urls)} links OK")
            
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(2)

if __name__ == "__main__":
    main()
