# Validation — Clean URLs & Crawlability

## Routing (server-side)

- Direct-load (new tab/private): /blog/, /about, /privacy-policy, /disclaimer, /contact, /herb-index
  Expect HTTP 200 (not 404) + app content.

## Blog

- GET /blog/ returns static HTML list with links to /blog/{slug}/ (view source: contains <ul> items).
- GET /blog/{slug}/ returns HTTP 200; page renders.

## SEO

- GET /sitemap.xml lists top pages and each post (clean URLs).
- GET /robots.txt includes Sitemap: line.
- View-source on a blog post contains title/description/canonical + OG/Twitter tags.
- GET /feed.xml is accessible; <link rel="alternate" ...> exists on root.

## Privacy/Security

- No GA/GTM requests before consent accept.
- DOMPurify present; simple "<script>alert(1)</script>" in a draft post does not execute.
