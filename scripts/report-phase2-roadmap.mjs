#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const REPORT_DIR = path.join(ROOT, 'ops', 'reports')

function readJson(relativePath, fallback = null) {
  const full = path.join(ROOT, relativePath)
  if (!fs.existsSync(full)) return fallback
  return JSON.parse(fs.readFileSync(full, 'utf8'))
}

function roundPct(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return null
  return Number((value * 100).toFixed(2))
}

const conversion = readJson('ops/reports/conversion-scorecard.json', {})
const affiliate = readJson('ops/reports/affiliate-inventory.json', {})
const ctaVariants = readJson('public/data/cta-variants.json', {})
const structured = readJson('ops/reports/structured-data-inventory.json', {})
const publishing = readJson('ops/reports/publishing-regression-report.json', {})
const quality = readJson('public/data/quality-report.json', {})
const seoPriority = readJson('public/data/seo-priority-report.json', {})
const optimizationTargets = readJson('ops/reports/optimization-targets.json', {})

const collectionTargets = (optimizationTargets.targets || []).filter(t => t.pageType === 'collection_page')
const affiliateTargets = (optimizationTargets.targets || []).filter(t => t.strategy?.includes('affiliate_cta_copy_clarify'))

const publishChecks = publishing.summary?.failuresByCheck || {}
const publicationStable = Object.values(publishChecks).every(value => value === 0)
const structuredStable = (structured.failures || []).length === 0

const summary = {
  generatedAt: new Date().toISOString(),
  scope: 'phase-2a',
  evidenceWindow: {
    reports: {
      conversionScorecardGeneratedAt: conversion.generatedAt || null,
      affiliateInventoryGeneratedAt: affiliate.generatedAt || null,
      ctaVariantsGeneratedAt: ctaVariants.generatedAt || null,
      structuredDataInventoryGeneratedAt: structured.generatedAt || null,
      publishingRegressionGeneratedAt: publishing.generatedAt || null,
      qualityReportGeneratedAt: quality.generatedAt || null,
      seoPriorityGeneratedAt: seoPriority.generatedAt || null,
      optimizationTargetsGeneratedAt: optimizationTargets.generatedAt || null,
    },
  },
}

const classification = {
  provenWinnersToStandardize: [
    {
      id: 'publish-verification-gate',
      type: 'technical_hardening',
      pageTypes: ['sitewide'],
      decision: 'standardize_now',
      evidence: {
        publishingFailureCount: publishing.summary?.failureCount ?? null,
        structuredDataFailures: (structured.failures || []).length,
      },
      rollout: {
        scripts: ['verify:publishing', 'verify:structured-data'],
        expectation: 'Required on every content/data release before publish.',
      },
      expectedValue: {
        trust: 'high',
        toolUsage: 'low',
        affiliateCtr: 'low',
        seoQuality: 'high',
      },
    },
    {
      id: 'curated-affiliate-safety-policy',
      type: 'affiliate_operations',
      pageTypes: ['herb_detail', 'compound_detail'],
      decision: 'standardize_now',
      evidence: {
        totalRecommendations: affiliate.summary?.totalRecommendations ?? null,
        healthyRecommendations: affiliate.summary?.liveHealthy ?? null,
        blockedRecommendations: affiliate.summary?.blocked ?? null,
      },
      rollout: {
        policy: 'Keep readiness checks + disclosure/rationale requirements enforced before module render.',
        scripts: ['verify:affiliate-products', 'report:affiliate-inventory'],
      },
      expectedValue: {
        trust: 'high',
        toolUsage: 'low',
        affiliateCtr: 'medium',
        seoQuality: 'low',
      },
    },
  ],
  promisingExperimentsToContinue: [
    {
      id: 'collection-tool-first-variant-a-overrides',
      type: 'conversion_optimization',
      pageTypes: ['collection_page'],
      routes: collectionTargets.map(target => target.route),
      decision: 'continue_experiment',
      evidence: {
        targetCount: collectionTargets.length,
        conversionStatusInsufficient: conversion.summary?.statuses?.insufficientData ?? null,
        analyticsAvailable: conversion.dataSources?.analyticsEventsAvailable ?? false,
      },
      rollout: {
        keepExperimental: true,
        notes: 'Do not globalize variant A for all collections until event volume supports scorecard status changes.',
      },
      expectedValue: {
        trust: 'medium',
        toolUsage: 'medium',
        affiliateCtr: 'low',
        seoQuality: 'low',
      },
    },
    {
      id: 'affiliate-cta-copy-and-ordering',
      type: 'conversion_optimization',
      pageTypes: ['herb_detail', 'compound_detail'],
      routes: affiliateTargets.map(target => target.route),
      decision: 'continue_experiment',
      evidence: {
        analyticsAvailable: affiliate.analytics?.available ?? false,
        mappedTargets: affiliateTargets.length,
      },
      rollout: {
        keepExperimental: true,
        notes: 'Keep trust-first ordering while collecting click/impression deltas after copy updates.',
      },
      expectedValue: {
        trust: 'medium',
        toolUsage: 'low',
        affiliateCtr: 'medium',
        seoQuality: 'low',
      },
    },
  ],
  weakOrLowValueToStopOrDefer: [
    {
      id: 'broad-affiliate-expansion-before-confidence-upgrade',
      type: 'affiliate_operations',
      pageTypes: ['herb_detail', 'compound_detail'],
      decision: 'stop_for_now',
      evidence: {
        pagesMissingCuratedProducts: affiliate.summary?.pagesMissingCuratedProducts ?? null,
        lowConfidenceRequirementCount:
          (affiliate.entries || []).filter(row => row.pageConfidenceTier === 'low').length,
      },
      rationale: 'Current inventory is tiny and confidence is mostly low; scaling breadth before quality/confidence gains increases review load without proof of conversion lift.',
    },
    {
      id: 'compound-index-expansion-before-quality-remediation',
      type: 'content_quality',
      pageTypes: ['compound_detail'],
      decision: 'defer',
      evidence: {
        compoundsTotal: quality.compounds?.total ?? null,
        compoundsIndexable: quality.compounds?.indexable ?? null,
        weakDescription: quality.compounds?.excludedByReason?.weakDescription ?? null,
      },
      rationale: 'Compound publication expansion is blocked by quality gates (0 indexable compounds in latest run).',
    },
  ],
}

const rolloutPlan = {
  pageTypesAffected: {
    herb_detail: {
      standardize: ['affiliate readiness verification policy', 'trust-first guard variant default B'],
      experimental: ['affiliate CTA copy/order adjustments on selected pages'],
    },
    compound_detail: {
      standardize: ['affiliate readiness verification policy', 'trust-first guard variant default B'],
      experimental: ['affiliate CTA copy/order adjustments on selected pages'],
    },
    collection_page: {
      standardize: ['structured data + publishing verification gates'],
      experimental: ['variant A tool-first override on priority collections'],
    },
    sitewide: {
      standardize: ['verify:publishing', 'verify:structured-data', 'verify:affiliate-products'],
      experimental: [],
    },
  },
  blockersAndDependencies: [
    {
      blocker: 'Missing analytics events for CTA and affiliate performance decisions',
      evidence: {
        conversionAnalyticsAvailable: conversion.dataSources?.analyticsEventsAvailable ?? false,
        affiliateAnalyticsAvailable: affiliate.analytics?.available ?? false,
      },
      dependency: 'Reliable export of content-journey + affiliate-product event logs into ops/reports or public/data.',
    },
    {
      blocker: 'Data quality gates exclude most herb and all compound pages from indexable set',
      evidence: {
        herbsIndexableRate: roundPct((quality.herbs?.indexable || 0) / Math.max(1, quality.herbs?.total || 1)),
        compoundsIndexableRate: roundPct((quality.compounds?.indexable || 0) / Math.max(1, quality.compounds?.total || 1)),
      },
      dependency: 'Field-level remediation (description quality, placeholder cleanup, evidence depth).',
    },
  ],
  expectedValueSummary: {
    trust: publicationStable && structuredStable ? 'high confidence in current technical trust floor' : 'at risk',
    toolUsage: 'potential upside from collection tool-first experiments; not yet measured',
    affiliateCtr: 'potential upside from trust-first affiliate copy/order experiment; not yet measured',
    seoQuality: 'technical quality checks pass, but content quality gates constrain indexable depth',
  },
}

const roadmap = {
  nextQuarterWorkstreams: [
    {
      name: 'content quality',
      objective: 'Increase indexable entity pool without weakening quality gates.',
      tasks: [
        'Remediate high-frequency herb exclusion causes (weakDescription, placeholderText, nanArtifacts).',
        'Run compound description/evidence upgrades to move compounds from 0 indexable baseline.',
        'Prioritize editorial upgrades for top SEO-priority herbs that are currently non-indexable.',
      ],
      kpis: ['indexable herbs count', 'indexable compounds count', 'quality-gate exclusion counts by reason'],
    },
    {
      name: 'conversion optimization',
      objective: 'Turn current CTA hypotheses into measurable winners.',
      tasks: [
        'Keep collection variant A overrides limited to existing target pages until event volume is sufficient.',
        'Retain trust-first variant B on detail pages with caution-driven trust guard behavior.',
        'Define promotion criteria: only promote variants after non-insufficient scorecard status.',
      ],
      kpis: ['pages with non-insufficient status', 'tool CTR by page type', 'related-click rate'],
    },
    {
      name: 'affiliate operations',
      objective: 'Protect trust quality while growing curated inventory deliberately.',
      tasks: [
        'Maintain confidence-tier + disclosure/rationale policy gates as hard requirements.',
        'Expand curated modules only to pages meeting confidence + freshness policy.',
        'Instrument and ingest affiliate click/impression exports as a release prerequisite for optimization decisions.',
      ],
      kpis: ['healthy recommendation count', 'blocked/warning recommendation count', 'affiliate CTR with valid sample size'],
    },
    {
      name: 'technical hardening',
      objective: 'Keep publication and schema regressions near zero.',
      tasks: [
        'Continue running publishing regression and structured-data inventory checks per release.',
        'Fail release candidates on parity/head-tag/schema regressions.',
        'Track route parity and excluded-route leakage as weekly checks.',
      ],
      kpis: ['publishing failure count', 'structured-data failure count', 'route parity mismatch count'],
    },
    {
      name: 'analytics and reporting',
      objective: 'Close the evidence gap blocking winner decisions.',
      tasks: [
        'Automate event export ingestion to ops/reports for both CTA and affiliate events.',
        'Promote conversion scorecard + affiliate inventory + phase2 roadmap reports to weekly cadence.',
        'Add sample-size guardrails to roadmap decisions to prevent overfitting on thin data.',
      ],
      kpis: ['analytics source availability', 'event volume per report', 'count of decisions backed by sufficient data'],
    },
  ],
  prioritizedBacklog: {
    doNow: [
      'Standardize verify:publishing + verify:structured-data + verify:affiliate-products as mandatory release checks.',
      'Keep trust-first variant B defaults on herb/compound detail pages.',
      'Maintain curated affiliate policy gating (review recency, disclosure, rationale, confidence tier).',
    ],
    nextSprint: [
      'Collect and ingest analytics event exports so conversion scorecard no longer reports all pages as insufficient data.',
      'Re-evaluate five collection Variant A overrides with fresh event data before expanding scope.',
      'Start targeted remediation of top herb quality-gate failures from SEO-priority list.',
    ],
    later: [
      'Expand curated affiliate footprint beyond current three products only after confidence tiers improve.',
      'Scale compound detail publication only after description/evidence quality thresholds are met.',
    ],
    stopDoing: [
      'Stop broad rollout claims for CTA or affiliate experiments while analytics availability remains false.',
      'Stop proposing compound index expansion without addressing zero-indexable compound baseline.',
    ],
  },
  explicitRecommendations: {
    ctaVariantsToKeep: {
      keepNow: [
        {
          variantId: 'B',
          pageTypes: ['herb_detail', 'compound_detail'],
          reason: 'Aligned with trust-first guard policy and current caution-sensitive detail-page posture.',
        },
      ],
      keepExperimental: [
        {
          variantId: 'A',
          pageTypes: ['collection_page'],
          routes: collectionTargets.map(target => target.route),
          reason: 'Configured optimization target set exists but performance outcomes are still insufficient-data.',
        },
      ],
      deferOrLimit: [
        {
          variantId: 'C',
          pageTypes: ['collection_page'],
          reason: 'Default editorial path remains fallback; defer additional investment until instrumentation closes evidence gaps.',
        },
      ],
    },
    editorialInvestmentPageTypes: [
      {
        pageType: 'herb_detail',
        recommendation: 'Increase editorial investment on high SEO-priority herbs (especially non-indexable candidates with stronger source depth).',
      },
      {
        pageType: 'collection_page',
        recommendation: 'Maintain investment on the 7 currently published collections and improve conversion instrumentation before scaling new ones.',
      },
      {
        pageType: 'compound_detail',
        recommendation: 'Defer broad editorial scaling until quality gates produce indexable compounds.',
      },
    ],
    collectionPolicy: {
      expand: (structured.pageTypeInventory?.collections || []).map(entry => entry.route),
      leaveNoindex: [
        'Any collection not present in the current index-approved/published set until quality + route-manifest approval is met.',
      ],
    },
    affiliateModulePolicyByConfidenceTier: {
      high: 'Eligible for expansion when readiness checks are healthy and analytics sample is sufficient.',
      medium: 'Eligible with stricter review cadence and explicit rationale/disclosure checks.',
      low: 'Keep limited and trust-first; require manual review and avoid broad rollout claims.',
    },
    essentialReportingScripts: [
      'npm run report:conversion-scorecard',
      'npm run report:affiliate-inventory',
      'npm run verify:affiliate-products',
      'npm run verify:publishing',
      'npm run verify:structured-data',
      'npm run report:phase2-roadmap',
    ],
  },
}

const output = {
  ...summary,
  classification,
  rolloutPlan,
  roadmap,
  sourceFiles: {
    conversionScorecard: 'ops/reports/conversion-scorecard.json',
    affiliateInventory: 'ops/reports/affiliate-inventory.json',
    ctaVariants: 'public/data/cta-variants.json',
    structuredDataInventory: 'ops/reports/structured-data-inventory.json',
    publishingRegression: 'ops/reports/publishing-regression-report.json',
    qualityReport: 'public/data/quality-report.json',
    seoPriorityReport: 'public/data/seo-priority-report.json',
    optimizationTargets: 'ops/reports/optimization-targets.json',
  },
}

fs.mkdirSync(REPORT_DIR, { recursive: true })
const jsonPath = path.join(REPORT_DIR, 'phase2-winner-rollout.json')
fs.writeFileSync(jsonPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8')

const md = `# Phase 2A Winner Rollout + Next-Quarter Roadmap

Generated: ${new Date().toISOString()}

## Evidence snapshot
- Conversion analytics available: **${conversion.dataSources?.analyticsEventsAvailable ? 'yes' : 'no'}**
- Affiliate analytics available: **${affiliate.analytics?.available ? 'yes' : 'no'}**
- Publishing regression failures: **${publishing.summary?.failureCount ?? 'n/a'}**
- Structured-data failures: **${(structured.failures || []).length}**
- Indexable herbs: **${quality.herbs?.indexable ?? 'n/a'} / ${quality.herbs?.total ?? 'n/a'}**
- Indexable compounds: **${quality.compounds?.indexable ?? 'n/a'} / ${quality.compounds?.total ?? 'n/a'}**

## 1) Standardize broadly now (proven winners)
1. Keep publication hardening checks mandatory (publishing + structured-data verification).
2. Keep curated affiliate readiness policy as a hard gate before rendering.
3. Keep trust-first detail-page CTA posture (Variant B default + trust guard behavior).

## 2) Keep limited / experimental
1. Collection Variant A overrides for current five targeted collections only.
2. Trust-first affiliate module copy/order updates on current three mapped pages only.
3. Any broader CTA or affiliate rollout until scorecard status moves beyond \`insufficient data\`.

## 3) Stop or defer
1. Defer broad compound publication expansion (current indexable compounds = 0).
2. Stop broad affiliate footprint expansion until confidence tiers and analytics coverage improve.
3. Stop making winner claims without event-backed sample size.

## Next-quarter workstreams
### Content quality
- Raise indexable coverage by fixing high-frequency exclusion reasons first (weakDescription, placeholderText, nanArtifacts).
- Prioritize non-indexable but SEO-priority herbs for evidence/editorial upgrades.

### Conversion optimization
- Re-test collection Variant A targets once analytics exports are available.
- Maintain trust-first B on detail pages unless scorecard signals justify change.

### Affiliate operations
- Keep confidence-tier + disclosure/rationale policy strict.
- Expand only where confidence and review recency pass.

### Technical hardening
- Keep publishing + structured-data checks release-blocking.
- Track parity/head-tag/schema regressions weekly.

### Analytics/reporting
- Implement reliable event export ingestion.
- Run scorecard, affiliate inventory, and phase2 roadmap reports weekly.

## Prioritized backlog
### Do now
- Standardize verification scripts on every release.
- Preserve trust-first detail-page CTA defaults.
- Preserve affiliate readiness policy gates.

### Next sprint
- Fix analytics ingestion so scorecards can classify winners/losers.
- Re-score the five collection CTA overrides using fresh events.
- Start highest-impact herb quality remediation.

### Later
- Expand affiliate coverage to additional pages only after confidence tiers improve.
- Resume compound SEO expansion only after compounds clear quality gates.

### Stop doing
- Stop broad rollout assertions for experiments with insufficient data.
- Stop compound expansion proposals disconnected from quality-gate outcomes.

## Explicit recommendations
- **CTA variants worth keeping:** Keep Variant B as standard on detail pages; keep Variant A limited to current collection experiment set.
- **Editorial investment focus:** Herb detail pages first, then collection pages; compound expansion deferred.
- **Collections policy:** Expand only within currently approved/indexable collection routes; keep unapproved collections noindex.
- **Affiliate confidence-tier policy:** High/medium can scale with healthy readiness; low confidence remains tightly controlled.
- **Essential scripts:** \`report:conversion-scorecard\`, \`report:affiliate-inventory\`, \`verify:affiliate-products\`, \`verify:publishing\`, \`verify:structured-data\`, \`report:phase2-roadmap\`.

## Machine-readable artifact
- \`ops/reports/phase2-winner-rollout.json\`
`

const mdPath = path.join(REPORT_DIR, 'phase2-roadmap.md')
fs.writeFileSync(mdPath, md, 'utf8')

console.log(`[report:phase2-roadmap] wrote ${path.relative(ROOT, jsonPath)}`)
console.log(`[report:phase2-roadmap] wrote ${path.relative(ROOT, mdPath)}`)
