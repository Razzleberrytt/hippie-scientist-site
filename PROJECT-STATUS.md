# The Hippie Scientist — Project Status
Last updated: June 14, 2026

## What This Project Is
The Hippie Scientist is an evidence-based herbalism and supplement research platform designed to replace restaurant income via affiliate revenue. The platform utilizes a two-zone content architecture:
1. **Discovery Layer:** Captures broad search intent and funnels users into conversion or detail pages. Includes goal paths (`/goals/*`), structured guides (`/guides/*`), comparisons (`/compare/*`), and search entry pages.
2. **Depth Layer:** Authoritative monographs for individual ingredients (`/herbs/*`, `/compounds/*`) and pre-built supplement formulation guides (`/stacks/*`).

## Tech Stack
- **Framework & Deployment:** Next.js 15 static export (`output: 'export'`) deployed to Cloudflare Pages. Fully static out-directory, meaning no runtime Next.js server, API routes, or server actions.
- **Languages & Libraries:** TypeScript 5.8, Tailwind CSS v4, React 18, Zustand v5.
- **Data Model:** Single canonical Excel workbook `data-sources/herb_monograph_master.xlsx` compiled into build-time JSON assets under `public/data/*` (indexing 287+ herbs and 595+ compounds).
- **Integrations:**
  - GA4: `G-7DFJL2FC6F` (tracks event actions site-wide).
  - Amazon Associates Tag: `razzleberry02-20` (active default product link code).
  - Mailchimp: `us19` server configuration (powers the subscription form).
  - Cloudflare Turnstile: Bot protection for forms.

## Currently Live

### Goal Pages (7 routes)
- `/goals/sleep`
- `/goals/anxiety`
- `/goals/focus`
- `/goals/stress`
- `/goals/energy`
- `/goals/inflammation`
- `/goals/cognition`

### SEO Entry Pages (8 routes)
- `/best-supplements-for-sleep`
- `/best-supplements-for-stress`
- `/best-supplements-for-focus`
- `/best-supplements-for-gut-health`
- `/best-supplements-for-joint-support`
- `/best-supplements-for-blood-pressure`
- `/best-supplements-for-fat-loss`
- `/best-magnesium-supplements-for-adhd`

### Comparison Guides (12 routes)
- `/compare/curcumin-vs-boswellia-vs-omega-3`
- `/compare/sleep-herbs-vs-melatonin`
- `/compare/ashwagandha-vs-l-theanine-vs-magnesium`
- `/compare/l-theanine-vs-magnesium`
- `/compare/magnesium-glycinate-vs-magnesium-oxide`
- `/compare/berberine-vs-metformin`
- `/compare/kanna-vs-ssris`
- `/compare/kava-vs-alcohol`
- `/compare/magnesium-glycinate-vs-l-threonate-for-sleep`
- `/compare/melatonin-vs-valerian-vs-magnesium-for-sleep`
- `/compare/rhodiola-vs-ashwagandha`
- `/compare/caffeine-vs-l-theanine-vs-bacopa-for-focus`

### Topic & Symptom Guides (15 routes)
- `/guides/turmeric-curcumin`
- `/guides/adhd-supplements`
- `/guides/best-herbs-for-stress-and-anxiety-at-night`
- `/guides/best-natural-sleep-aids-that-work`
- `/guides/best-supplements-for-overthinking`
- `/guides/focus-without-caffeine-crash`
- `/guides/how-to-lower-cortisol-naturally`
- `/guides/kratom-7oh-withdrawal-management`
- `/guides/magnesium-for-sleep`
- `/guides/magnesium-vs-melatonin`
- `/guides/natural-alternatives-to-anxiety-medication`
- `/guides/natural-anxiolytics-beyond-ashwagandha`
- `/guides/psychedelic-adjacent-herbs`
- `/guides/sleep-herbs-vs-melatonin`
- `/guides/supplements-for-brain-fog-and-fatigue`

### Core Integrations & Page Features
- **Subscription API:** Cloudflare Pages subscription endpoint `functions/api/subscribe.ts` with server-side Turnstile verification and Mailchimp integration.
- **Product Catalog:** Recommendations config `config/revenue-products.ts` containing the active product details.
- **Guide Layout UI Blocks:** Reusable components (`AffiliateProductBox`, `ComparisonTable`, `DosageBox`, `EvidenceSummaryBox`, `FAQAccordion`, `MechanismBox`, `SafetyBox`).
- **Structured Data:** Built-in `SchemaGraphScript` automatically generates compliant JSON-LD structured data on herb, compound, goal, and compare pages.
- **YMYL Compliance:** Author credentials and clinical review attributes mapped across content pages with details linked to `/author`.

## Revenue Stack & Monetization Strategy

### 1. Primary Affiliate Programs
- **Amazon Associates:** 1-5% commission (high volume, proven customer trust, low conversion friction).
- **iHerb:** 3-5% commission (excellent international coverage, 30-day cookie window).
- **Nootropics Depot:** 8-12% commission (premium pricing, cult following for quality, aligned nootropics audience).

### 2. Year 1 Targets & Revenue Mix
- **Month 1:** $50-100 (Affiliate launch on goal paths and top monographs).
- **Month 2:** $200-400 (Affiliate expansion + first email newsletter captures).
- **Month 3:** $550-900 (Affiliate + newsletter sponsorships + first digital products).
- **Months 4-6:** $1,000-1,700/mo (Blog SEO traffic ramp-up + list monetization).
- **Months 7-12:** $1,800-3,300/mo (Compounding organic search traffic + sponsorships).

## Active Workstreams
- **Goal Pages Expansion:** Add goal slugs beyond the current set, surface goals more prominently in the navigation, and cross-link from profiles.
- **Lead Magnet / Email Funnel:** Decide topic, produce downloadable guide, and configure Mailchimp welcome sequence.
- **Workbook Content Pass:** Resolve ExcelJS bug, run `npm run data:audit-gaps`, and fill missing dosing/interactions for top-gap profiles.
- **Stats Consistency Audit:** Write a scripted validator for evidence-tier vs summary language, and run human cross-check.

## Skill System
- **Status:** [UNVERIFIED — `ALL-14-SKILLS-COMPLETE.md` and related skill files (Skills 15, 16, 17) were not found in the codebase. Verify with Will.]
- **How to invoke:** "execute Skill #N" + context.

## Operating Principles
- **Publish before perfecting:** A commit is real; a local file is not. Ship changes frequently to get real-world traffic data.
- **Satellite-first publishing:** Focus on SEO entry pages and comparison guides to capture organic intent before scaling depth records.
- **Metrics-driven build phase:** Track published commercial pages as the single execution metric during the static compilation phase.
- **No speculative planning:** Avoid writing new planning documentation until real user publishing validates the current approach.
