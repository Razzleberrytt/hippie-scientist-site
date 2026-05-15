# Security Header Configuration References

This project ships Cloudflare Pages-compatible header configuration via `public/_headers`. If you deploy to other platforms, adapt the following snippets to keep equivalent security and caching behavior.

## Current CSP posture

The current deployment model is a static Next.js export hosted behind static headers.

Current CSP goals:

- restrict all origins to `self` by default
- permit only the analytics and runtime behavior currently observed in the repo
- preserve JSON-LD structured data support for SEO
- avoid runtime nonce/hash logic incompatible with static export hosting

Current allowed third-party origins:

| Directive | Allowed origin | Reason |
| --- | --- | --- |
| `script-src` | `https://www.googletagmanager.com` | Used by the consent-gated analytics loader in `src/lib/loadAnalytics.ts` to load Google Analytics gtag scripts. |
| `connect-src` | `https://www.google-analytics.com` | Google Analytics collection endpoint. |
| `connect-src` | `https://region1.google-analytics.com` | Regional Google Analytics collection endpoint. |

No clearly unused third-party script domains were identified during this audit.

## Inline script posture

`script-src 'unsafe-inline'` remains intentionally enabled.

Reason:

- the app renders multiple inline JSON-LD `<script type="application/ld+json">` tags through Next.js routes/components using `dangerouslySetInnerHTML`
- examples include:
  - `app/layout.tsx`
  - `components/seo/FaqJsonLd.tsx`
  - `components/seo/AuthorityJsonLd.tsx`
  - additional route-level SEO components/pages

Because this is a static export deployment, nonce-based runtime CSP approaches are intentionally avoided in the current architecture.

`style-src 'unsafe-inline'` also remains intentionally enabled because the current React/Tailwind runtime stack still relies on inline/runtime style injection patterns.

## Form endpoint posture

The active browser form submission utility is:

- `src/lib/formSubmission.ts`

The endpoint is configured through:

- `NEXT_PUBLIC_FORM_ENDPOINT`

The repository currently documents only a placeholder endpoint:

- `https://example.invalid/forms`

Because deployment-specific form origins are not committed to the repository, this audit intentionally does not guess or hardcode additional `connect-src` origins.

If production deployments use a cross-origin form endpoint, that exact host must be added to `connect-src` before enforcing a stricter CSP.

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

## Remaining risks and future hardening

Current residual risks/limitations:

- `script-src 'unsafe-inline'` weakens CSP protection against inline script injection.
- `style-src 'unsafe-inline'` weakens CSP protection against style injection.
- static export hosting limits nonce-based runtime CSP strategies.

Potential future hardening steps:

1. Move JSON-LD generation toward CSP hash-based allowances where practical.
2. Reduce runtime inline style injection dependencies.
3. Consider a stricter analytics abstraction that conditionally injects scripts only when analytics is enabled at build/runtime.
4. Explicitly enumerate deployed cross-origin form endpoints in `connect-src` once production infrastructure is finalized.
5. Periodically audit CSP origins against actual runtime usage before adding additional third-party services.
