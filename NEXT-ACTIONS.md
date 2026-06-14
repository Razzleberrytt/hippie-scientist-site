# Next Actions
Last updated: June 14, 2026

This is a flat, prioritized task list containing all pending operational and verification items.

---

## 1. Blocking & Critical (Integration & Environment Setup)

### Cloudflare Environment Variable Verification
Verify the following environment variables are correctly set in the **Cloudflare Pages Dashboard** (under Settings > Environment Variables for both Preview and Production):
- [ ] **Mailchimp API Key:** `MAILCHIMP_API_KEY` (The private API key generated in Mailchimp)
- [ ] **Mailchimp Server Prefix:** `MAILCHIMP_SERVER_PREFIX` (e.g., `us19` — check the prefix in your Mailchimp URL)
  - *Note: Stale documentation referred to this as `MAILCHIMP_API_SERVER`.*
- [ ] **Mailchimp Audience ID:** `MAILCHIMP_AUDIENCE_ID` (The audience list ID where subscribers are sent)
  - *Note: Stale documentation referred to this as `MAILCHIMP_LIST_ID`.*
- [ ] **Cloudflare Turnstile Key:** `TURNSTILE_SECRET_KEY` (Required for API subscription form anti-bot validation)

### Cloudflare KV Binding
- [ ] **Rate Limiter Namespace:** Ensure a KV Namespace is bound to the worker runtime named `RATE_LIMIT_KV` to prevent subscription abuse.

---

## 2. High Priority (Workbook & Quality Verification)

### ExcelJS Workbook Audits
- [ ] **Resolve ExcelJS Bug:** Identify why the local `exceljs` library throws errors on workbook parses.
- [ ] **Run Content Gap Audits:**
  - Once resolved, run the content auditor:
    ```bash
    npm run data:audit
    ```
  - Fill missing dosing/interaction monograph gaps for the top-gap profiles in the master workbook (`data-sources/herb_monograph_master.xlsx`):
    - Lion's Mane (dosing + interactions)
    - Ashwagandha extract KSM-66 (interactions)
    - Turmeric (interactions)
    - Elderberry (dosing)
    - St. John's Wort (dosing + interactions)

### Stats & Claims Consistency Audit
- [ ] **Run Stats Validator:** Create a scripted check to cross-reference quantitative evidence tiers in the workbook against the descriptive summaries. Run and review mismatches:
  ```bash
  npm run validate:evidence-language
  ```

### Affiliate Sourcing Foundation
- [ ] **Formally join secondary affiliate networks:** Register on iHerb and Nootropics Depot.
- [ ] **Inject affiliate links into core templates:** Populate the `config/revenue-products.ts` catalog config with iHerb and Nootropics Depot product links once approved.

---

## 3. Medium Priority (Funnels & Landing Expansion)

### Goal Landing Pages & Cross-Linking
- [ ] **Expand Goal Slugs:** Add goal landing pages beyond the initial set.
- [ ] **Increase Goal Page Prominence:** Add clear navigation links on the homepage/header directing users to the goal decision guides, and add cross-links from individual herb/compound detail pages back to their related goals.

### Lead Magnet & Welcome Sequence
- [ ] **Create Lead Magnet PDF:** Draft the 1-2 page "Supplement Safety Checklist" PDF and upload it to the public directory.
- [ ] **Welcome Sequence Config:** Write a 5-part email sequence in Mailchimp delivering the lead magnet, introducing form differences (e.g., Magnesium Glycinate vs Oxide), and highlighting interaction warnings.
- [ ] **Subscription Placement:** Add the `FooterEmailCapture` or Turnstile inline form to the homepage, footer, and post-quiz completion page.

---

## 4. Verification Needed (Live Site Checks)

- [ ] **Robots & Sitemap Verification:** Confirm `robots.txt` and `sitemap.xml` are active on the live domain and registered in Google Search Console.
- [ ] **GA4 Custom Events Test:** Trigger user events on the staging/live site and verify the following events are registering in the GA4 real-time debugger:
  - `affiliate_click` (triggers when outbound product links are clicked)
  - `email_signup` (triggers when subscription form completes successfully)
  - `guide_view` (tracks reading progress on topic/symptom guides)
