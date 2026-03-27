# Security Header Configuration References

This project ships ready-to-use configuration for Netlify via `public/_headers`. If you deploy to other platforms, adapt the following snippets to keep equivalent security and caching behavior.

## Nginx

```
add_header X-Content-Type-Options nosniff always;
add_header X-Frame-Options DENY always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=(), usb=()" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header Cross-Origin-Opener-Policy "same-origin" always;
add_header Cross-Origin-Resource-Policy "same-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' https://www.googletagmanager.com 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' https: data:; font-src 'self' https: data:; connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com; frame-src 'self'; frame-ancestors 'none'" always;

location ~* \.(?:js|css)$ { add_header Cache-Control "public, max-age=31536000, immutable"; }
location ^~ /assets/     { add_header Cache-Control "public, max-age=31536000, immutable"; }
location = /robots.txt   { add_header Cache-Control "public, max-age=86400"; }
location = /sitemap.xml  { add_header Cache-Control "public, max-age=86400"; }
```

## Apache (.htaccess)

```
<IfModule mod_headers.c>
Header always set X-Content-Type-Options "nosniff"
Header always set X-Frame-Options "DENY"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
Header always set Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=(), usb=()"
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
Header always set Cross-Origin-Opener-Policy "same-origin"
Header always set Cross-Origin-Resource-Policy "same-origin"
Header always set Content-Security-Policy "default-src 'self'; script-src 'self' https://www.googletagmanager.com 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' https: data:; font-src 'self' https: data:; connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com; frame-src 'self'; frame-ancestors 'none'"
</IfModule>

# Caching
<FilesMatch "\.(js|css)$">
  Header set Cache-Control "public, max-age=31536000, immutable"
</FilesMatch>
<IfModule mod_headers.c>
  <Files "robots.txt">
    Header set Cache-Control "public, max-age=86400"
  </Files>
  <Files "sitemap.xml">
    Header set Cache-Control "public, max-age=86400"
  </Files>
</IfModule>
```


## Remaining CSP exceptions

- `script-src 'unsafe-inline'` is still required because the app renders structured data (`<script type='application/ld+json'>`) via `react-helmet-async` in `src/components/Meta.tsx`.
- `style-src 'unsafe-inline'` is still required for current runtime style injection patterns used by the React/Tailwind stack.
- `connect-src` is intentionally limited to same-origin plus GA collection endpoints. If forms are pointed at a cross-origin endpoint via `VITE_FORM_ENDPOINT`, that origin must be explicitly added before deploying with a stricter CSP.
