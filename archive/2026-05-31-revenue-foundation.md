# Revenue Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add reusable affiliate recommendation, disclosure, email capture, and founder-trust surfaces without changing site architecture.

**Architecture:** Reuse the existing top-level `components/` convention for app-facing shared components. Keep product recommendation data as a small config module so herb and compound pages can import it later without data pipeline changes.

**Tech Stack:** Next.js App Router, React server components, Tailwind utility classes, existing affiliate tag config.

---

### Task 1: Shared Monetization Components

**Files:**
- Modify: `components/AffiliateProductCard.tsx`
- Create: `components/AffiliateDisclosure.tsx`
- Create: `components/EmailCapture.tsx`
- Create: `components/RecommendationSection.tsx`

- [ ] Replace the existing affiliate card with a prop-driven card that supports image, title, rationale, CTA, and affiliate URL.
- [ ] Add a reusable disclosure component with compact and full variants.
- [ ] Add a static email capture form component that can post to a caller-provided action later.
- [ ] Add a three-slot recommendation section for budget, best overall, and premium picks.

### Task 2: Placeholder Product Config

**Files:**
- Create: `config/revenue-products.ts`

- [ ] Add placeholder recommendation slots for `ashwagandha`, `magnesium`, `l-theanine`, `rhodiola`, and `lions-mane`.
- [ ] Build Amazon search URLs using `AFFILIATE_TAGS.amazon`, not hardcoded tags.
- [ ] Export a lookup helper for later herb and compound page integration.

### Task 3: About Page Trust Update

**Files:**
- Modify: `app/about/page.tsx`

- [ ] Preserve the existing `/about` route.
- [ ] Add founder story, methodology, affiliate disclosure, and evidence philosophy sections.
- [ ] Use existing warm light theme classes and avoid a visual redesign.
- [ ] Add email capture as a trust-oriented subscriber surface.

### Task 4: Validation

**Files:**
- No source edits.

- [ ] Run `npm run lint`.
- [ ] Run `npx tsc --noEmit --incremental false`.
- [ ] Run `npm run validate:static-export`.
- [ ] Run `npm run validate:route-seo`.
