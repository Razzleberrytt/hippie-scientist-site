# Validation

This project validates clean URLs and crawler-visible HTML from the built static export output (`out/`).

## Canonical validation commands

1. `npm run check`
2. `npm run build`
3. `npm run verify:build`

## Output expectations

- `out/` exists after build.
- `out/sitemap.xml` and `out/robots.txt` exist.
- Route and redirect checks pass through `npm run verify:build`.

## Notes

- Validation relies on generated runtime data from workbook-driven pipeline.
- Do not manually edit `public/data/**` to force validation passes.
