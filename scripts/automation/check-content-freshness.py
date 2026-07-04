"""
Content freshness checker for thehippiescientist.net
Flags pages not updated in 6+ months by checking sitemap lastmod dates.
"""
import requests
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta
import sys

SITEMAP_URL = "https://thehippiescientist.net/sitemap.xml"
TIMEOUT = 15
STALE_MONTHS = 6

def main():
    print(f"[{datetime.now().isoformat()}] Checking content freshness...")
    
    try:
        resp = requests.get(SITEMAP_URL, timeout=TIMEOUT, headers={"User-Agent": "HippieScientistBot/1.0"})
        resp.raise_for_status()
        root = ET.fromstring(resp.content)
        
        ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
        entries = root.findall("sm:url", ns)
        
        cutoff = datetime.now() - timedelta(days=STALE_MONTHS * 30)
        stale = []
        
        for entry in entries:
            loc = entry.find("sm:loc", ns)
            lastmod = entry.find("sm:lastmod", ns)
            if loc is None:
                continue
            url = loc.text
            if lastmod is not None:
                try:
                    dt = datetime.fromisoformat(lastmod.text.replace("Z", "+00:00").replace("+00:00", ""))
                    if dt.replace(tzinfo=None) < cutoff:
                        stale.append((url, dt.strftime("%Y-%m-%d")))
                except:
                    pass
        
        stale.sort(key=lambda x: x[1])
        
        if stale:
            print(f"\n📅 {len(stale)} pages not updated in {STALE_MONTHS}+ months:")
            for url, date in stale[:20]:
                print(f"  {date}: {url}")
            if len(stale) > 20:
                print(f"  ... and {len(stale) - 20} more")
            print(f"\nConsider reviewing these pages for accuracy.")
        else:
            print("✅ All pages updated within 6 months")
            
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
