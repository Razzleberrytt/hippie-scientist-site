# THE HIPPIE SCIENTIST — MASTER BACKLOG (v3)

**Purpose**

This document is the operating system for The Hippie Scientist.

Every work session starts here.

Do not create new projects.

Do not create new systems.

Do not redesign architecture.

Execute the highest unfinished priority.

---

# NORTH STAR

The Hippie Scientist is an evidence-based supplement publishing platform.

The goals are:

1. Build topical authority
2. Improve existing content
3. Publish consistently
4. Maintain technical health

Complexity is no longer the objective.

Consistency is the objective.

---

# TIER 0 — PROTECT THE FOUNDATION

Infrastructure is COMPLETE.

Do not work on:

- architecture
- navigation
- route restructuring
- folder organization
- additional infrastructure phases
- unnecessary refactors

Only touch these if something breaks.

---

# TIER 1 — FIX EXISTING PROBLEMS (ALWAYS FIRST)

## Priority order

### 1. Broken internal links

Goal:

0

---

### 2. Metadata issues

Goal:

0

Verify:

- title
- description
- canonical URL

---

### 3. Duplicate slugs

Goal:

0

Resolve:

- keep one
- redirect one if necessary

---

### 4. Orphaned pages

Goal:

0

---

### 5. Thin pages

Goal:

0

These become content expansion projects.

---

# TIER 2 — THIN PAGE EXPANSION (HIGHEST ROI)

Before creating a new page:

Ask:

> Can I improve an existing page instead?

If yes:

Improve the existing page.

Every upgraded page should contain:

## Structure

- Introduction
- Quick answer
- Evidence section
- Benefits
- Risks and safety
- Who should use it
- Who should avoid it
- FAQs
- Internal links
- Related comparisons

Target:

- 1,500–2,500 words
- Evidence-based
- Human-readable

Work in batches of 3–5 pages.

Never attempt everything at once.

---

# TIER 3 — AUTHORITY CLUSTERS

Only build these four topics until they're strong.

## 😴 Sleep

Core pages:

- Best Supplements for Sleep
- Magnesium for Sleep
- Magnesium vs Melatonin
- Ashwagandha vs Magnesium

---

## 😌 Stress

Core pages:

- Best Supplements for Stress
- Signs of High Cortisol
- Best Adaptogens for Stress
- Ashwagandha Alternatives

---

## 😟 Anxiety

Core pages:

- Best Herbs for Anxiety
- Natural Anxiolytics
- Kava vs L-Theanine
- Fast-Acting Herbs for Anxiety

---

## 🧠 Focus

Core pages:

- Best Supplements for Focus
- Citicoline vs Alpha-GPC
- Caffeine Alternatives
- Brain Fog Supplements

---

# TIER 4 — CONTENT CREATION RULES

Every new page must satisfy one of these:

## Guide

Goal-based decision page

Examples:

- Best Supplements for Sleep
- Best Herbs for Anxiety

---

## Article

Specific question page

Examples:

- How Long Does Ashwagandha Take to Work?
- Can You Take Magnesium Every Night?

---

## Compare

Head-to-head comparison

Examples:

- Rhodiola vs Ashwagandha
- Magnesium vs Melatonin

---

## Herb

Workbook only

Never manually create.

---

## Compound

Workbook only

Never manually create.

---

# DAILY WORKFLOW

## If you have 30 minutes

Fix:

- broken links
- metadata
- duplicate slugs

---

## If you have 60 minutes

Upgrade one thin page.

---

## If you have 2 hours

Upgrade two thin pages.

---

## If you have 3+ hours

Upgrade three thin pages.

Then publish one new page.

---

# WEEKLY WORKFLOW

Run:

```bash
npm run audit:content

npm run audit:links

npm run build
```

Review:

- regressions
- broken links
- thin pages
- duplicate slugs
- metadata issues

---

# NEW PAGE PIPELINE

```text
Choose keyword

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

# SCOREBOARD

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

---

# RULE OF THUMB

Never ask:

> What should I build?

Ask:

> What is the highest ROI unfinished task?

Do that.

Then stop.

Repeat tomorrow.
