THE HIPPIE SCIENTIST — MINIMAL SEO/TRUST PACK
=============================================

What this adds (no code changes required):
- /robots.txt
- /sitemap.xml
- /about, /disclaimer, /privacy-policy, /contact (static pages)

How to install (GitHub mobile/web UI):
1) Open your repo → root folder.
2) Tap "Add file" → "Upload files".
3) Upload the *contents* of this zip (folders included), not the zip itself.
4) Commit directly to main.

Optional (recommended):
- Add this snippet to your site's <head> (e.g., index.html) to enable Google Analytics 4:
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXX');
  </script>

- Replace G-XXXXXXX with your GA4 Measurement ID.
- After deploy, visit Google Search Console, add property https://thehippiescientist.net/,
  and submit https://thehippiescientist.net/sitemap.xml

Notes:
- This pack is "zero-config": it won't break your React/SPA setup or a plain static site.
- If you already have pages at these paths, skip uploading those folders.
- You can edit the HTML files to match your site's styling later.
