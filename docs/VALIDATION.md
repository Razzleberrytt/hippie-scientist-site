# Validation — Clean URLs (BrowserRouter)

## Routing

- Direct-load these in a clean session: /blog/, /about, /privacy-policy, /disclaimer, /contact, /herb-index
  - Expect HTTP 200 and the app to render (no 404 from the host).
- Click all footer/nav links: expect clean URLs (no "#").

## Blog & SEO

- GET /blog/index.html returns a static HTML list with links to posts.
- GET /feed.xml returns valid RSS; link rel="alternate" present in index.html.
- GET /sitemap.xml lists top pages + each post (clean URLs, no hashes).
- robots.txt references the sitemap URL.

## Privacy & Security

- No GA/GTM network requests before consent.
- Basic XSS probe in a draft post does not execute (DOMPurify sanitizes).

## Performance

- Initial JS bundle size reduced vs pre-change baseline (note measurement).
- App icons optimized and referenced correctly in manifest.
