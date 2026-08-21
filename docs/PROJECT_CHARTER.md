# Project Charter

**Status:** Authoritative
**Last updated:** 2026-08-21
**Owner:** Project control

## Mission

The Hippie Scientist exists to become the most trusted evidence-first supplement decision platform: helping people make better-informed choices while growing qualified organic traffic and sustainable revenue without compromising evidence quality, user safety, or editorial integrity.

## Audiences and user problems

The primary audience is an adult researching herbs, nutrients, supplements, or comparisons before deciding whether to use or buy something. Secondary audiences include readers learning how to interpret evidence and professionals checking cited context.

The product should help readers:

- understand what a substance is and which outcomes have actually been studied;
- distinguish mechanisms and adjacent evidence from direct human evidence;
- compare options, trade-offs, evidence strength, product forms, and safety considerations;
- find source citations and understand important evidence limitations;
- identify reasons to pause, avoid a product, or speak with a qualified clinician.

## Core value proposition

The site combines discoverable educational content with decision pages and detailed monographs. Its differentiator is not content volume: it is clear decision support with traceable evidence, explicit uncertainty, safety context, and commercially independent ranking logic.

## Business and growth model

The primary growth loop is:

> Qualified organic traffic → useful decision pages → trusted affiliate or revenue conversion

Organic search is the primary acquisition strategy. Email may support retention and repeat visits. Affiliate links are the current implemented monetization mechanism; additional revenue models require a documented decision and must preserve editorial independence.

Revenue is evidence of useful commercial journeys, not permission to weaken evidence or safety. Evidence order is set before product availability or commission. Commercial intent, sponsorship, and affiliate relationships must be disclosed clearly before or with the first relevant commercial link.

## Editorial, evidence, and safety principles

- Separate non-interchangeable outcomes such as acute attention, long-term memory, fatigue, sleep, deficiency correction, symptom scales, and biomarkers.
- State the studied population, comparator, product or extract, duration, and directness boundary when they materially affect interpretation.
- Include null, negative, contradictory, subgroup-only, and non-replicated findings.
- Treat study doses and timelines as context, not universal protocols.
- Do not convert mechanisms, observational associations, preclinical findings, or adjacent populations into direct treatment evidence.
- Disclose meaningful product funding, investigator conflicts, and missing independent replication when relevant.
- Do not diagnose, prescribe, or imply guaranteed outcomes.
- Preserve warnings, contraindications, interactions, pregnancy/lactation context, and escalation guidance. Uncertainty is stated, not silently filled.
- Evidence and safety requirements are release gates. A page that cannot meet them should be withheld, qualified, or `noindex` rather than overclaimed.

The detailed decision-page release standard is [content-quality/evidence-first-decision-page-standard.md](content-quality/evidence-first-decision-page-standard.md).

## Non-negotiable requirements

- Preserve stable URLs or add explicit redirects and regression coverage.
- Treat `data-sources/herb_monograph_master.xlsx` as the primary structured source and `public/data/` as a core generated publish target.
- Validate required fields, slugs, generated data, citations, evidence roles, and safety contracts before publication.
- Keep the static-export deployment constraint explicit; server features require a deployment-model decision first.
- Instrument measurement with consent and privacy controls, and never fabricate analytics, revenue, test, deployment, or completion evidence.
- Prefer upgrading existing pages with demonstrated demand or strategic relevance over speculative content expansion.
- Require a scoped ticket, acceptance criteria, proof, relevant tests, and a production build for implementation work.
- Limit concurrent work to three workstreams and one scoped ticket per agent.

## Explicit exclusions

The project is not:

- a substitute for individualized medical care;
- a diagnosis, prescribing, or universal dosing service;
- a mass programmatic-content operation optimized for page count;
- a product catalog whose rankings follow commission or inventory;
- a general lifestyle publication expanding into unrelated topics without evidence of user need;
- a reason to redesign or replace working architecture without a verified blocker or material benefit.

## Operating authority

When documents disagree, current code, configuration, tests, deployment behavior, and reproducible audit evidence establish implementation reality. The control-document reading order and authority levels are defined in [DOCS_INDEX.md](DOCS_INDEX.md). Unknowns remain unknown until measured.
