# Expanded Master Task List for Grok Build
**Phased Implementation Roadmap**

**Status: Historical (early June 2026; post 2026-06-05 pull/fixes).** This is old granular spec. Vast majority of items (hero, goals, design, trust features, tech/perf, UX/conversion, sitemap, schema, a11y, pipeline, 404 legacies, build hygiene, data issues) completed or superseded by conversation phases + recent audit fixes (guard, orchestrate, structured-data, redirects, merges). Current focus: maintain build pass (verifies green, data determinism), doc hygiene, issues. See updated validation-report.md, PLAN.md (post-audit activation), NAVIGATION_UPGRADE_SUMMARY.md (0-6 complete), recent commits (cadd761c determinism, 7fcdafc8 merge). Do not use unchecked [ ] below for active planning without re-validation against AGENTS.md + current code.

This document serves as the comprehensive, granular specification of every section of the roadmap to guide phased implementation in subsequent build sessions.

---

## 1. Hero Section (Highest Priority – First Impression)
- [ ] Audit current hero section (screenshot + code review)
- [ ] Write 3-5 headline options (primary: “Evidence-Based Guidance on Plant Medicines & Supplements”)
- [ ] Write 4-6 subheadline variations emphasizing science, safety, and cutting through hype
- [ ] Design 2-3 CTA button text options (primary: “Explore the Research” / secondary: “Browse Evidence”)
- [ ] Create professional background image or gradient (clean botanical + scientific aesthetic)
- [ ] Add subtle supporting visuals (microscope icon, peer-reviewed badge, leaf + DNA motif)
- [ ] Implement responsive hero (desktop, tablet, mobile)
- [ ] Add scroll indicator or smooth scroll to next section
- [ ] A/B test headline + subheadline combinations
- [ ] Ensure fast loading (optimize hero image < 150kb)
- [ ] Add schema markup for Organization + WebSite
- [ ] Implement dark/light mode compatibility for hero

## 2. Goals / Mission Section (Major Content Overhaul)
- [ ] Extract and analyze all current 15 goals
- [ ] Consolidate into exactly 4 core goals (as previously recommended)
- [ ] Write polished versions of each goal in:
  - Short bullet format (homepage)
  - Medium paragraph format (dedicated page)
  - Detailed explanatory version
- [ ] Design custom icons for each of the 4 goals
- [ ] Create visual layout options (grid, timeline, cards, horizontal scroll)
- [ ] Write introductory paragraph for the section
- [ ] Add metrics or “Why These Goals Matter” explanations
- [ ] Ensure tone is professional, authoritative, and approachable
- [ ] Add internal links from goals to relevant site sections
- [ ] Create dedicated /goals or /mission page
- [ ] Optimize for SEO (target keywords: evidence-based plant medicine, supplement research)

## 3. About Section & Author Bio (Critical Trust Builder)
- [ ] Create new /about page from scratch
- [ ] Write professional bio (150-250 words) covering:
  - Scientific/educational background
  - Professional experience
  - Journey into plant medicines research
  - Core philosophy (evidence-first, safety-first)
- [ ] Write shorter “About the Founder” blurb for homepage
- [ ] Source or take professional headshot (consistent lighting, neutral background)
- [ ] List credentials, certifications, publications (if any)
- [ ] Add “Why This Site Exists” personal story section
- [ ] Include values statement
- [ ] Add contact form or email on About page
- [ ] Link About page prominently in main navigation and footer
- [ ] Add author schema markup
- [ ] Create author profile card component for reuse

## 4. Navigation & Overall Site Architecture
- [ ] Redesign main navigation menu (larger, clearer labels)
- [ ] Finalize main nav items:
  - Home
  - Research / Evidence
  - Plants
  - Supplements
  - Goals
  - About
  - Blog
  - Resources
  - Contact
- [ ] Improve mobile hamburger menu (larger touch targets, clear hierarchy)
- [ ] Add sticky navigation on scroll
- [ ] Implement breadcrumb navigation
- [ ] Create clear URL structure (/plants/turmeric, /evidence/rating-system, etc.)
- [ ] Add search bar in header
- [ ] Design footer with links, disclaimers, copyright, socials
- [ ] Add quick links / secondary nav in sidebar (on blog & profile pages)

## 5. Content Strategy & New Pages
- [ ] Plant Profile Template:
  - Evidence rating table
  - Traditional uses vs scientific evidence
  - Safety profile & interactions
  - Dosage guidelines (with disclaimers)
  - References section
- [ ] Supplement Database Template (similar structure)
- [ ] Evidence Rating System page (methodology, scales used)
- [ ] Safety & Medical Disclaimer page (prominent, detailed)
- [ ] Glossary of scientific & botanical terms
- [ ] Resources page (databases, PubMed links, books)
- [ ] Blog/Article Template with:
  - Reading time
  - Author box
  - Citation system
  - Related articles
- [ ] Content brief template for future articles
- [ ] Myth-busting template

## 6. Design System & Visual Identity Refresh
- [ ] Define new color palette (professional greens, deep blues, warm neutrals, accents)
- [ ] Select modern typography stack (heading + body fonts)
- [ ] Create consistent card, button, and component library
- [ ] Define scientific icon set (use Lucide, Heroicons, or custom)
- [ ] Update all imagery to high-quality, relevant, non-psychedelic
- [ ] Establish spacing, shadow, and border-radius system
- [ ] Implement light/dark mode with preference detection
- [ ] Create style guide documentation page
- [ ] Ensure full WCAG 2.1 AA accessibility compliance

## 7. Trust & Credibility Features
- [ ] Implement citation system (numbered or author-date)
- [ ] Add prominent “Not medical advice” banner on every page
- [ ] Create Sources & Methodology page
- [ ] Add author attribution on all content
- [ ] Professional footer with legal links
- [ ] Implement review dates on articles (“Last reviewed: June 2026”)
- [ ] Add external validation badges (if earned)
- [ ] Build transparency report section

## 8. Technical & Performance Improvements
- [ ] Full SEO audit & meta optimization
- [ ] Implement proper heading hierarchy
- [ ] Add structured data (Schema.org)
- [ ] Image optimization pipeline (Next.js Image)
- [ ] Core Web Vitals optimization
- [ ] Google Analytics & email capture verification
- [ ] Sitemap & robots.txt optimization
- [ ] Implement search functionality (pagefind or Algolia)
- [ ] Accessibility audit + fixes
- [ ] Performance budget enforcement
- [ ] Error monitoring setup

## 9. User Experience & Conversion Optimization
- [ ] Map all user journeys (new visitor → researcher → subscriber)
- [ ] Add newsletter signup forms (multiple placements)
- [ ] Create content recommendation engine (related plants/articles)
- [ ] Add bookmark / “Save for later” functionality
- [ ] Implement interactive filters for plant/supplement lists
- [ ] Add comparison tables
- [ ] Reading progress indicator on long articles
- [ ] Print/PDF export for key guides

## 10. Advanced Features (Phase 2+)
- [ ] Interactive evidence filter tool
- [ ] Supplement interaction checker
- [ ] Advanced search with filters
- [ ] User accounts (saved profiles, preferences)
- [ ] Community guidelines page
- [ ] RSS feed for blog
- [ ] Podcast/video embed section (future)

## 11. Content Tone & Style Guide
- [ ] Full written style guide document
- [ ] Update all existing pages to new tone
- [ ] Create editorial checklist
- [ ] Define forbidden language (woo-woo, miracle, cure, etc.)
- [ ] Training examples of good vs bad copy

## 12. Testing, QA & Launch
- [ ] Cross-browser & device testing
- [ ] Usability testing (5 users)
- [ ] Speed & performance testing
- [ ] SEO technical audit
- [ ] Content proofreading pass
- [ ] Backup current production version
- [ ] Git branching strategy (feature branches)
- [ ] Staging environment setup
- [ ] Post-launch monitoring plan
