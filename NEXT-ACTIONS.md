# Next Actions
Last updated: June 14, 2026

## Blocking / Critical
- [ ] Set Mailchimp Environment Variables in Cloudflare Pages dashboard — source: [PROGRESS.md](file:///c:/Users/Will/Documents/hippie-scientist-site/PROGRESS.md)
  - `MAILCHIMP_API_KEY`
  - `MAILCHIMP_SERVER_PREFIX` (Note: old docs called this `MAILCHIMP_API_SERVER`)
  - `MAILCHIMP_AUDIENCE_ID` (Note: old docs called this `MAILCHIMP_LIST_ID`)
  - `MAILCHIMP_ADHD_TAG` (Optional tag for ADHD subscribers)
  - `TURNSTILE_SECRET_KEY` (Required for Cloudflare Turnstile verification)
- [ ] Confirm Cloudflare KV binding `RATE_LIMIT_KV` is configured for subscription rate limiting — source: [functions/api/subscribe.ts](file:///c:/Users/Will/Documents/hippie-scientist-site/functions/api/subscribe.ts)

## High Priority
- [ ] Resolve ExcelJS bug blocking workbook audits — source: [PROGRESS.md](file:///c:/Users/Will/Documents/hippie-scientist-site/PROGRESS.md)
- [ ] Run `npm run data:audit-gaps` and fill missing dosing/interactions for top-gap profiles: lion's-mane, ashwagandha-extract-ksm-66, turmeric, elderberry, st-johns-wort — source: [PROGRESS.md](file:///c:/Users/Will/Documents/hippie-scientist-site/PROGRESS.md)
- [ ] Write scripted validator for evidence-tier vs summary language to run stats consistency audit — source: [PROGRESS.md](file:///c:/Users/Will/Documents/hippie-scientist-site/PROGRESS.md)
- [ ] Join iHerb and Nootropics Depot affiliate programs — source: [hippie-scientist-execution-roadmap.md](file:///c:/Users/Will/Documents/hippie-scientist-site/docs/strategy/hippie-scientist-execution-roadmap.md)
- [ ] Add product affiliate links to active goal paths, top 10 ingredient profiles, and product quality guide — source: [hippie-scientist-execution-roadmap.md](file:///c:/Users/Will/Documents/hippie-scientist-site/docs/strategy/hippie-scientist-execution-roadmap.md)

## Medium Priority
- [ ] Expand goal-focused landing pages with new slugs, surface goals in main navigation, and cross-link from profiles — source: [PROGRESS.md](file:///c:/Users/Will/Documents/hippie-scientist-site/PROGRESS.md)
- [ ] Create lead magnet PDF ("Supplement Safety Checklist") and design welcome email sequence — source: [PROGRESS.md](file:///c:/Users/Will/Documents/hippie-scientist-site/PROGRESS.md) & [hippie-scientist-execution-roadmap.md](file:///c:/Users/Will/Documents/hippie-scientist-site/docs/strategy/hippie-scientist-execution-roadmap.md)
- [ ] Add email signup popup to homepage, footer, and post-quiz page — source: [hippie-scientist-execution-roadmap.md](file:///c:/Users/Will/Documents/hippie-scientist-site/docs/strategy/hippie-scientist-execution-roadmap.md)
- [ ] Verify affiliate tag performance periodically in Cloudflare Pages — source: [PROGRESS.md](file:///c:/Users/Will/Documents/hippie-scientist-site/PROGRESS.md)

## Verification Needed (status unknown, needs a human or live check)
- [ ] Robots.txt deployed and confirmed in Google Search Console
- [ ] GA4 custom events (`affiliate_click`, `email_signup`, `guide_view`) confirmed firing in Google Analytics dashboard
