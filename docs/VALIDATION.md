# Validation Checklist

- [ ] Direct-load `/blog`, `/about`, and `/privacy-policy`; confirm each path redirects to the appropriate hash-based route.
- [ ] Verify the `dist/` output contains the blog HTML, `blogdata/index.json`, `feed.xml`, and a sitemap that lists the blog URLs.
- [ ] Ensure no Google Analytics network requests fire before the user provides consent.
- [ ] Create a local draft blog post with a basic XSS probe and confirm it does not execute when rendered.
- [ ] Measure the initial JavaScript bundle size and record the reduction relative to the baseline (document the measurement method used).
