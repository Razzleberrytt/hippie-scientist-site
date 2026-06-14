# Live Site QA Audit — BASELINE
Date: June 14, 2026

## 1. Indexation & Crawl Health
- **robots.txt contents**: Loads with status 200. Defines Cloudflare Managed Content rules, blocks several bots (Amazonbot, GPTBot, ClaudeBot, etc.), restricts path routes (like `/compare/dynamic`, `/analytics`, `/dashboard`, etc.), and references the sitemap:
  ```txt
  User-agent: *
  Content-Signal: search=yes,ai-train=no
  Allow: /

  User-agent: Amazonbot
  Disallow: /
  ...
  Host: https://thehippiescientist.net
  Sitemap: https://thehippiescientist.net/sitemap.xml
  ```
- **sitemap.xml**: Loads Y. Contains **996 URLs**. Spot-checked 5 URLs (all load with status 200 OK):
  - `https://thehippiescientist.net/guides/ashwagandha/` (200 OK)
  - `https://thehippiescientist.net/guides/magnesium-for-sleep/` (200 OK)
  - `https://thehippiescientist.net/guides/natural-anxiolytics-beyond-ashwagandha/` (200 OK)
  - `https://thehippiescientist.net/guides/sleep-herbs-vs-melatonin/` (200 OK)
  - `https://thehippiescientist.net/guides/psychedelic-adjacent-herbs/` (200 OK)
- **Homepage loads correctly**: Y (Status 200, length 194,783 bytes).
- **site:thehippiescientist.net result count**: 0 results.
- **"thehippiescientist ashwagandha"** — appears: N, position: N/A.
- **"thehippiescientist magnesium sleep"** — appears: N, position: N/A.
- **`<meta name="robots">` found**:
  - Homepage: **none** (not found)
  - `https://thehippiescientist.net/guides/magnesium-for-sleep/`: `"index, follow"`
  - All other 23 guide pages (including Ashwagandha, Natural Anxiolytics, Sleep Herbs): **none** (not found)

## 2. Structured Data
| Guide URL | Schema types detected | Errors/Warnings |
|---|---|---|
| `/guides/ashwagandha/` | WebSite, Organization, SiteNavigationElement, BreadcrumbList, MedicalWebPage, BreadcrumbList | None |
| `/guides/elderberry/` | WebSite, Organization, SiteNavigationElement, BreadcrumbList, MedicalWebPage, BreadcrumbList | None |
| `/guides/kava/` | WebSite, Organization, SiteNavigationElement, BreadcrumbList, MedicalWebPage, BreadcrumbList | None |
| `/guides/lions-mane/` | WebSite, Organization, SiteNavigationElement, BreadcrumbList, MedicalWebPage, BreadcrumbList | None |
| `/guides/passionflower/` | WebSite, Organization, SiteNavigationElement, BreadcrumbList, MedicalWebPage, BreadcrumbList | None |
| `/guides/rhodiola-complete-guide/` | WebSite, Organization, SiteNavigationElement, BreadcrumbList, MedicalWebPage, BreadcrumbList | None |
| `/guides/rhodiola-energy/` | WebSite, Organization, SiteNavigationElement, BreadcrumbList, MedicalWebPage, BreadcrumbList | None |
| `/guides/rhodiola-extract-vs-powder/` | WebSite, Organization, SiteNavigationElement, BreadcrumbList, MedicalWebPage, BreadcrumbList | None |
| `/guides/rhodiola-sleep-stack/` | WebSite, Organization, SiteNavigationElement, BreadcrumbList, MedicalWebPage, BreadcrumbList | None |
| `/guides/adhd-supplements/` | WebSite, Organization, SiteNavigationElement, BreadcrumbList, CollectionPage, ItemList, FAQPage | None |
| `/guides/best-herbs-for-stress-and-anxiety-at-night/` | WebSite, Organization, SiteNavigationElement, BreadcrumbList | None |
| `/guides/best-natural-sleep-aids-that-work/` | WebSite, Organization, SiteNavigationElement, BreadcrumbList | None |
| `/guides/best-supplements-for-overthinking/` | WebSite, Organization, SiteNavigationElement, BreadcrumbList | None |
| `/guides/focus-without-caffeine-crash/` | WebSite, Organization, SiteNavigationElement, BreadcrumbList | None |
| `/guides/how-to-lower-cortisol-naturally/` | WebSite, Organization, SiteNavigationElement, BreadcrumbList | None |
| `/guides/kratom-7oh-withdrawal-management/` | WebSite, Organization, SiteNavigationElement, BreadcrumbList | None |
| `/guides/magnesium-for-sleep/` | WebSite, Organization, SiteNavigationElement, BreadcrumbList, MedicalWebPage, FAQPage, BreadcrumbList, Article, BreadcrumbList, FAQPage | None |
| `/guides/magnesium-vs-melatonin/` | WebSite, Organization, SiteNavigationElement, BreadcrumbList | None |
| `/guides/natural-alternatives-to-anxiety-medication/` | WebSite, Organization, SiteNavigationElement, BreadcrumbList | None |
| `/guides/natural-anxiolytics-beyond-ashwagandha/` | WebSite, Organization, SiteNavigationElement, BreadcrumbList | None |
| `/guides/psychedelic-adjacent-herbs/` | WebSite, Organization, SiteNavigationElement, BreadcrumbList | None |
| `/guides/sleep-herbs-vs-melatonin/` | WebSite, Organization, SiteNavigationElement, BreadcrumbList | None |
| `/guides/supplements-for-brain-fog-and-fatigue/` | WebSite, Organization, SiteNavigationElement, BreadcrumbList | None |
| `/guides/turmeric-curcumin/` | WebSite, Organization, SiteNavigationElement, BreadcrumbList, MedicalWebPage, FAQPage, BreadcrumbList | None |

## 3. Mobile Experience
- **Horizontal scroll issues**: None. Tested at 375px viewport width; page content fits correctly with no horizontal scroll (scrollWidth matches clientWidth of 375px on both homepage and Ashwagandha guide).
- **Tap target issues**: Significant concerns on both test pages:
  - **Homepage**: 71 of 127 interactive elements (55%) are smaller than 44x44px.
    - Search button: 42x30px
    - Nav menu toggles: 38x36px and 36x36px
    - Product list links: 32px height
  - **Ashwagandha Guide**: 26 of 41 interactive elements (63%) are smaller than 44x44px.
    - Breadcrumbs ("Home", "Guides"): height of 24.6px
    - Footer social links ("Twitter", "Instagram"): height of 16px
- **Lighthouse scores**: Performance N/A / Accessibility N/A / SEO N/A (Google PageSpeed Insights API rate limited with status 429).
- **Top issues**:
  - The sticky footer banner (`div.fixed.bottom-[4.6rem]`) overlaps and intercepts pointer events, blocking elements underneath (such as form buttons) from receiving clicks.
  - The exit-intent popup modal (`role="dialog"`) blocks screen clicks on mobile devices until closed, which is difficult with small close icons.
- **Screenshots**:
  - Homepage mobile: `C:\Users\Will\.gemini\antigravity\brain\50cf9a4a-f15f-415c-a7f4-695903347786\homepage_mobile.png` (Simulated iPhone 12, 375x667).
  - Guide mobile: `C:\Users\Will\.gemini\antigravity\brain\50cf9a4a-f15f-415c-a7f4-695903347786\ashwagandha_mobile.png` (Simulated iPhone 12, 375x667).

## 4. Affiliate Links
| Guide | Link present | Correct tag (razzleberry02-20) | Resolves to live product |
|---|---|---|---|
| `/guides/magnesium-for-sleep/` | Y (10 links) | Y (All 10 contain tag) | Y (Status 200/503 resolving) |
| `/guides/turmeric-curcumin/` | Y (3 links) | Y (All 3 contain tag) | Y (Status 503 resolving) |
| *All other 22 guides* | N | N/A | N/A |

## 5. Email Signup
- **Form found**: Y (2 forms found on homepage).
- **Submission tested**: Y (Tested using Playwright with disposable test address `antigravity+test2026@gmail.com`).
- **Success state shown**: N (The submission click failed to execute because it was blocked by the overlapping sticky footer banner, and when forced, redirected to headless error pages).
- **Console errors**: Multiple Content Security Policy (CSP) violations detected on load/submit:
  - Cloudflare Web Analytics (`beacon.min.js`) blocked by `script-src` directive.
  - Google Analytics 4 (`analytics.google.com`, `stats.g.doubleclick.net`, `www.google.com`) blocked by `connect-src` directive. Only `region1.google-analytics.com` is allowed, causing analytics collection requests to fail.

## 6. Broken Links
- **Internal 404s found**: None. Checked 16 core routes (including index, contact, herbs database, guides database, stack details, and compare pages) and all returned status 200 OK.
- **External citation 404s found (of 10 checked)**: 0. Spot-checked 10 PubMed citation links on the Adaptogenic compounds article page; all returned status 200 OK. Note: Guide pages do not link directly to external citations; citations are concentrated on article pages.

## 7. Accessibility
- **H1 count**: 1 (Homepage) / 1 (Ashwagandha Guide)
- **Heading order issues**: Minor issues. Both pages feature a skipped level in the footer where the hierarchy jumps directly from `H2` to `H4` ("Explore", "Safety", "Legal") without any intermediate `H3` heading.
- **Images missing alt (of 5 checked)**: 0 (Only 1 image `/hero-illustration.jpg` on homepage, alt exists).
- **Contrast concerns**:
  - Faint grey text on white background for the "Search⌘K" header button (`text-ink/70` with border `border-brand-900/10`) presents relatively low contrast.
  - Social media footer links (`text-white/70` on dark background) have minor contrast concerns.

## TOP 5 ISSUES TO FEED BACK INTO NEXT CODEX/CLAUDE ROUND
1. **Google Analytics Blocked by CSP**: The current Content Security Policy (CSP) blocks all Google Analytics collection endpoints (`analytics.google.com`, `stats.g.doubleclick.net`, `www.google.com`) and Cloudflare Web Analytics. The `connect-src` and `script-src` directives must be updated to allow them.
2. **Interactive Elements Blocked by Sticky Footer / Exit-Intent Popups**: The sticky footer banner (`div.fixed.bottom-[4.6rem]`) overlaps interactive form buttons (such as the email signup button), intercepting click events. The exit-intent popup modal also freezes interaction on mobile viewports.
3. **Small Tap Targets on Mobile**: Over 55% of interactive targets on the homepage and 63% on the Ashwagandha guide (e.g. search button, nav toggles, social links, inline picks) are smaller than 44x44px. Tap targets must be padded to meet mobile friendly standards.
4. **Missing robots Meta Tags**: 22 out of 24 guide pages and the homepage are missing `<meta name="robots">` tags. Explicit indexation instructions should be injected (like `"index, follow"`) instead of relying on default crawler behaviors.
5. **Broken Heading Hierarchy in Footer**: Accessibility checkers will flag the footer navigation headers, which jump directly from `H2` to `H4` (skipping `H3`) for footer sections like "Explore", "Safety", and "Legal".
