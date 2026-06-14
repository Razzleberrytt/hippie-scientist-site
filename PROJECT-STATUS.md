# The Hippie Scientist — Project Status
Last updated: June 14, 2026

## What This Project Is
The Hippie Scientist is an evidence-based herbalism and supplement research platform designed to replace restaurant income via affiliate revenue. The platform utilizes a two-zone content architecture: a discovery layer to capture broad search intent and funnel users into a depth layer of authoritative profiles (herbs, compounds, comparisons, and stacks).

## Tech Stack
- Next.js 15 static export (`output: 'export'`) deployed to Cloudflare Pages (no server-side dynamic features allowed).
- TypeScript 5.8, Tailwind CSS v4, React 18, Zustand v5.
- Data: Single Excel workbook `data-sources/herb_monograph_master.xlsx` compiled to `public/data/*` (`indexable-herbs.json` 287+ / `indexable-compounds.json` 594+).
- GA4: G-7DFJL2FC6F | Amazon Associates: razzleberry02-20 | Mailchimp: us19 server.

## Currently Live
- **Goal pages:** `/goals/sleep`, `/goals/anxiety`, `/goals/focus`, `/goals/stress`, `/goals/energy`, `/goals/inflammation`, `/goals/cognition`
- **SEO entry pages:** `/best-supplements-for-sleep`, `/best-supplements-for-stress`, `/best-supplements-for-focus`, `/best-supplements-for-gut-health`, `/best-supplements-for-joint-support`, `/best-supplements-for-blood-pressure`, `/best-supplements-for-fat-loss`, `/best-magnesium-supplements-for-adhd`
- **Comparison guides:** `/compare/sleep-herbs-vs-melatonin`, `/compare/ashwagandha-vs-l-theanine-vs-magnesium`, `/compare/l-theanine-vs-magnesium`, `/compare/magnesium-glycinate-vs-magnesium-oxide`, `/compare/berberine-vs-metformin`, `/compare/kanna-vs-ssris`, `/compare/kava-vs-alcohol`, `/compare/magnesium-glycinate-vs-l-threonate-for-sleep`, `/compare/melatonin-vs-valerian-vs-magnesium-for-sleep`, `/compare/rhodiola-vs-ashwagandha`, `/compare/caffeine-vs-l-theanine-vs-bacopa-for-focus`
- **Integrations:**
  - Hardened Cloudflare Pages integration endpoint (`functions/api/subscribe.ts`) with Mailchimp and Turnstile.
  - SchemaGraphScript structured data across herb, compound, goal, and compare pages.
  - Author credentials and review identity displayed on YMYL content pages.

## Active Workstreams
- **Goal Pages Expansion:** Add goal slugs beyond the current set, surface goals more prominently in the navigation, and cross-link from profiles.
- **Lead Magnet / Email Funnel:** Decide topic, produce downloadable guide, and configure Mailchimp welcome sequence.
- **Workbook Content Pass:** Resolve ExcelJS bug, run `npm run data:audit-gaps`, and fill missing dosing/interactions for top-gap profiles.
- **Stats Consistency Audit:** Write a scripted validator for evidence-tier vs summary language, and run human cross-check.

## Skill System
- **Status:** [UNVERIFIED — `ALL-14-SKILLS-COMPLETE.md` and related skill files (Skills 15, 16, 17) were not found in the codebase. Verify with Will.]
- **How to invoke:** "execute Skill #N" + context.

## Operating Principles
- Publish before perfecting — a commit is real, a local file is not.
- Satellite-first publishing.
- Track published commercial pages as the single execution metric during build phase.
- No new planning docs until publishing validates current approach.
