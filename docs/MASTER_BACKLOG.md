# THE HIPPIE SCIENTIST — MASTER BACKLOG

Last Updated: 2026-06-17

Purpose:

This document is the single source of truth for all work on The Hippie Scientist.

Every work session starts here.

Never ask:

> What should I work on today?

Open this file and execute the highest unfinished priority.

---

# 🎯 NORTH STAR

Build the most useful evidence-based herbal and supplement resource on the internet.

Primary objectives:

1. Improve existing content
2. Build topical authority
3. Publish consistently
4. Maintain technical health
5. Grow organic traffic
6. Build sustainable affiliate revenue

Execution > complexity

Consistency > perfection

---

# 🛑 FROZEN SYSTEMS

Infrastructure is considered COMPLETE.

Do NOT work on:

- architecture redesigns
- route restructuring
- navigation redesigns
- folder reorganizations
- additional infrastructure phases
- unnecessary refactors

Only modify infrastructure if something is broken.

---

# 📚 DATA ARCHITECTURE RULES

Source of truth:

```text
herb_monograph_master.xlsx
```

Data flow:

```text
Workbook
↓
npm run data:build
↓
public/data/*
↓
Site pages
```

Rules:

- Never manually edit generated JSON
- Never manually create herb pages
- Never manually create compound pages
- Preserve stable URLs
- Add redirects if routes ever change

---

# 🔥 ACTIVE SPRINT — ONLY WORK HERE

Priority order:

1. Audit issues
2. Thin pages
3. Authority clusters
4. New content
5. Revenue improvements

Never skip ahead.

---

# 📋 TECHNICAL HEALTH

Run weekly:

```bash
npm run audit:content
npm run audit:links
npm run build
```

Resolve:

- broken links
- metadata issues
- duplicate slugs
- orphaned pages
- thin pages

Goal:

Zero regressions.

---

# 📈 CONTENT UPGRADE QUEUE — HIGHEST ROI

Before creating a new page ask:

> Can I improve an existing page instead?

If yes:

Improve the existing page.

Every upgraded page should include:

## Required sections

- Introduction
- Quick Answer
- Evidence Overview
- Benefits
- Risks & Safety
- Who Should Use It
- Who Should Avoid It
- FAQs
- Related Guides
- Related Comparisons

Targets:

- 1,500–2,500 words
- evidence-based
- easy to scan
- internal links

---

# 🧠 AUTHORITY CLUSTERS

Current focus:

## 😴 Sleep

Priority: ⭐⭐⭐⭐⭐

Core work:

- Best Supplements for Sleep
- Magnesium for Sleep
- Magnesium vs Melatonin
- Ashwagandha vs Magnesium
- Best Herbs for Staying Asleep

---

## 😌 Stress

Priority: ⭐⭐⭐⭐⭐

Core work:

- Best Supplements for Stress
- Signs of High Cortisol
- Best Adaptogens for Stress
- How to Lower Cortisol Naturally
- Ashwagandha Alternatives

---

## 😟 Anxiety

Priority: ⭐⭐⭐⭐

Core work:

- Best Herbs for Anxiety
- Natural Anxiolytics
- Kava vs L-Theanine
- Fast-Acting Herbs for Anxiety

---

## 🧠 Focus

Priority: ⭐⭐⭐⭐

Core work:

- Best Supplements for Focus
- Citicoline vs Alpha-GPC
- Caffeine Alternatives
- Brain Fog Supplements

---

## Future clusters

Do not expand into these until the current clusters are strong.

- Gut Health
- Longevity
- Women's Health
- Men's Health
- Metabolic Health

---

# 📰 CONTENT RULES

Every page must belong to ONE category.

## Goals

Outcome pages.

Examples:

- Best Supplements for Sleep
- Best Herbs for Anxiety

## Guides

Decision pages.

Examples:

- Ashwagandha for Stress
- Magnesium for Sleep

## Articles

Question pages.

Examples:

- Can You Take Magnesium Every Night?
- How Long Does Ashwagandha Take to Work?

## Compare

Head-to-head pages.

Examples:

- Magnesium vs Melatonin
- Rhodiola vs Ashwagandha

## Herbs

Workbook only.

Never manually create.

## Compounds

Workbook only.

Never manually create.

---

# 🔄 DAILY WORKFLOW

1. Open `docs/MASTER_BACKLOG.md`
2. Check Active Sprint
3. Run audits if necessary
4. Upgrade one existing page
5. Publish one new page only if existing issues are under control
6. Build
7. Push

---

# 🔁 WEEKLY WORKFLOW

Run:

```bash
npm run audit:content
npm run audit:links
npm run build
```

Review:

- broken links
- metadata
- duplicate slugs
- orphaned pages
- thin pages

---

# 🚀 PUBLISHING PIPELINE

```text
Choose topic
↓
npm run create:page
↓
1st Builder
↓
2nd Gatekeeper
↓
3rd Publisher
↓
npm run audit:content
↓
npm run audit:links
↓
npm run build
↓
Commit
↓
Push
↓
Cloudflare deploys
```

---

# 💰 REVENUE TASKS

Review monthly:

- Affiliate placements
- Product cards
- Email capture opportunities
- Comparison pages
- Buyer's guides

---

# 📊 SCOREBOARD

Technical Health

- [ ] 0 broken links
- [ ] 0 metadata issues
- [ ] 0 duplicate slugs
- [ ] 0 orphaned pages

Content Health

- [ ] 0 thin pages

Authority

- [ ] Sleep established
- [ ] Stress established
- [ ] Anxiety established
- [ ] Focus established

Business

- [ ] Affiliate optimization complete
- [ ] Email capture system optimized

---

# GOLDEN RULE

Never ask:

> What should I build?

Ask:

> What is the highest ROI unfinished task?

Do that.

Then stop.

Repeat tomorrow.
