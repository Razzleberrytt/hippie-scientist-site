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
  - Fill missing dosing/interaction monograph gaps in the master workbook (`data-sources/herb_monograph_master.xlsx`):
    - [ ] **Lion's Mane:** Fill missing standard dosing + drug interactions.
    - [ ] **Ashwagandha Extract KSM-66:** Add drug and herb interaction exclusions.
    - [ ] **Turmeric:** Detail bio-availability constraints and drug interactions.
    - [ ] **Elderberry:** Audit and add daily active dosing metrics.
    - [ ] **St. John's Wort:** Map all CYP3A4 pathway interactions.

### Stats & Claims Consistency Audit
- [ ] **Run Stats Validator:** Create a scripted check to cross-reference quantitative evidence tiers in the workbook against the descriptive summaries. Run and review mismatches:
  ```bash
  npm run validate:evidence-language
  ```

### Affiliate Sourcing Foundation
- [ ] **Register for Affiliate Accounts:** Sign up for accounts on iHerb and Nootropics Depot.
- [ ] **Verify Amazon Associates Tag:** Confirm links are generated using the tag `razzleberry02-20`.
- [ ] **Map Config Catalog:** Update `config/revenue-products.ts` with target iHerb and Nootropics Depot product links once approved.

---

## 3. Affiliate Link Rollout (Weeks 1-4 Schedule)

- [ ] **Week 1: High-Volume Conversion Foundations**
  - Add product recommendations with Amazon affiliate links to the 7 core goal paths (`/goals/*`).
  - Add affiliate product boxes to the top 10 ingredient profiles (Magnesium, L-Theanine, Ashwagandha, Melatonin, Lion's Mane, Rhodiola, Bacopa, Citicoline, Kava, Valerian).
  - Inject product CTAs into the *Product Quality Guide*.
- [ ] **Week 2: Comparison & High-Intent Target Rollout**
  - Add affiliate links to the 12 active comparison pages (`/compare/*`) downstream of comparison tables.
  - Add affiliate boxes to the next 20 ingredient profiles.
  - Set up and run a manual Click-Through-Rate (CTR) assessment on the CTA buttons.
- [ ] **Week 3: Premium Sourcing Integration**
  - Integrate Nootropics Depot links for premium herb extracts and nootropics.
  - Expand affiliate links to all remaining ingredient profiles (50+).
- [ ] **Week 4: Full Library Monetization**
  - Audit and ensure affiliate links are live across the entire comparison library.
  - Add goal-aware category product grids to category landing pages.

---

## 4. Email Lead Magnet & Welcome Sequence Setup

- [ ] **Produce Lead Magnet PDF ("Supplement Safety Checklist"):**
  - Draft a 1-2 page PDF guide including basic safety steps, high-risk interactions (e.g., SSRIs + Ashwagandha/St. John's Wort), and quality markers (NSF, USP).
  - Place the PDF file at `public/downloads/supplement-safety-checklist.pdf`.
- [ ] **Draft 5-Part Welcome Sequence in Mailchimp:**
  - [ ] **Email 1 (Immediate):** Subject: *"Your supplement safety checklist + 3 things to avoid"* (delivers the PDF, sets expectations).
  - [ ] **Email 2 (24h later):** Subject: *"The supplement that works for 60% of people (but not everyone)"* (educates on Magnesium Glycinate vs Oxide vs Threonate).
  - [ ] **Email 3 (48h later):** Subject: *"The supplement interaction 90% of people don't know about"* (drives users to the Safety Checker).
  - [ ] **Email 4 (72h later):** Subject: *"3 supplements with surprising side effects"* (highlights evidence-based warnings).
  - [ ] **Email 5 (120h later):** Subject: *"Here are the supplements we actually recommend (and why)"* (sells top affiliate recommendations).
- [ ] **Integrate Signup Form Placements:**
  - Configure exit-intent popup triggering on desktop mouse-out.
  - Embed inline subscription cards on the Homepage and Footer.
  - Wire a custom newsletter sign-up CTA after the Start Here onboarding quiz.

---

## 5. SEO Content Calendar (Weeks 1-8 Calendar)

Write and publish high-commercial-intent blog articles according to the following schedule (2,000+ words, detailed comparison tables, and outbound affiliate links):

- [ ] **Week 1-2: Sleep Foundations**
  - *Article 1:* "Best Magnesium Supplement for Sleep" (Target: Magnesium Glycinate vs. L-Threonate).
  - *Article 2:* "L-Theanine vs Magnesium for Sleep" (Leverages Article 1).
- [ ] **Week 3-4: Stress & Trust Pillars**
  - *Article 3:* "Best Ashwagandha Supplement Brands" (High volume product review).
  - *Article 4:* "How to Choose Supplements: Complete Guide" (Focuses on purity, testing, and third-party certifications).
- [ ] **Week 5-6: Anxiety & Comparison Bridges**
  - *Article 5:* "Best Sleep Supplements (Natural Alternatives)" (Compilation guide).
  - *Article 6:* "Ashwagandha vs Rhodiola for Stress" (Head-to-head adaptogen compare).
- [ ] **Week 7-8: Focus & Ingredient Depth**
  - *Article 7:* "L-Theanine Benefits (Dosage, Side Effects)" (Depth monograph article).
  - *Article 8:* "Best Nootropics for Focus (2026 Guide)" (High intent focus stack review).

---

## 6. Verification Needed (Live Site Checks)

- [ ] **Robots & Sitemap Verification:** Confirm `robots.txt` and `sitemap.xml` are active on the live domain and registered in Google Search Console.
- [ ] **GA4 Custom Events Test:** Trigger user events on the staging/live site and verify the following events are registering in the GA4 real-time debugger:
  - `affiliate_click` (triggers when outbound product links are clicked)
  - `email_signup` (triggers when subscription form completes successfully)
  - `guide_view` (tracks reading progress on topic/symptom guides)
