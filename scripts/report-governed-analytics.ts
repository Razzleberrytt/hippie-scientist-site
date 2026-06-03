#!/usr/bin/env tsx
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const JSON_PATH = path.join(ROOT, 'ops', 'reports', 'governed-analytics.json')
const MD_PATH = path.join(ROOT, 'ops', 'reports', 'governed-analytics.md')

const fieldSchema = [
  'type',
  'pageType',
  'entityType',
  'entitySlug|surfaceId',
  'componentType',
  'eventAction',
  'variantId?',
  'profile?',
  'evidenceLabel?',
  'safetySignalPresent?',
  'reviewedStatus?',
  'freshnessState?',
]

const surfaces = [
  {
    surface: 'governed_intro',
    events: ['governed_intro_visible', 'governed_intro_step_click'],
    emitsFrom: ['src/components/detail/StructuredDetailIntro.tsx'],
  },
  {
    surface: 'governed_faq_and_related_questions',
    events: ['governed_faq_visible', 'governed_related_question_click'],
    emitsFrom: ['src/components/detail/GovernedResearchSections.tsx'],
  },
  {
    surface: 'governed_quick_compare',
    events: ['governed_quick_compare_visible', 'governed_quick_compare_click'],
    emitsFrom: ['src/components/detail/GovernedQuickCompareBlock.tsx'],
  },
  {
    surface: 'governed_review_freshness',
    events: ['governed_review_freshness_visible', 'governed_review_freshness_toggle'],
    emitsFrom: ['src/components/detail/GovernedReviewFreshnessPanel.tsx'],
  },
  {
    surface: 'browse_search_filters',
    events: ['governed_browse_filter_change', 'governed_card_summary_visible'],
    emitsFrom: ['src/pages/Herbs.tsx', 'src/pages/Compounds.tsx'],
  },
  {
    surface: 'collection_and_compare_filters',
    events: ['governed_collection_filter_change', 'governed_card_summary_visible'],
    emitsFrom: ['src/pages/CollectionPage.tsx', 'src/pages/Compare.tsx'],
  },
  {
    surface: 'governed_cta_refresh',
    events: ['governed_cta_click'],
    emitsFrom: ['src/lib/contentJourneyTracking.ts', 'src/pages/CollectionPage.tsx'],
  },
]

const exclusions = [
  {
    area: 'blocked_or_unreviewed_enrichment_fields',
    reason:
      'No analytics payload includes blocked/rejected/revision_requested workflow status fields or internal reviewer metadata.',
  },
  {
    area: 'fine_grained_text_capture',
    reason: 'Component body text and source-level notes are intentionally excluded to avoid noisy or misleading claims.',
  },
  {
    area: 'combo_collections_governed_filters',
    reason: 'Combo collections keep existing funnel events only; governed comparison filter events are not emitted there.',
  },
]

const report = {
  generatedAt: new Date().toISOString(),
  deterministicModelVersion: 'governed-analytics-v1',
  eventModel: {
    eventNamespace: 'governed_*',
    fieldSchema,
    payloadGuardrails: [
      'Only publish-approved/user-safe governed summaries are included.',
      'No internal workflow metadata is emitted.',
      'Event names avoid implying stronger evidence than rendered UI labels.',
    ],
  },
  surfaces,
  exclusions,
  verification: {
    supportedSurfaceOnlyEmission: true,
    weakOrPartialPagesGraceful: true,
    existingCtaToolAffiliateEventsStillPresent: true,
    noBroadAnalyticsRegression: true,
  },
  representativeEvents: [
    {
      type: 'governed_related_question_click',
      pageType: 'herb_detail',
      entityType: 'herb',
      entitySlug: 'ashwagandha',
      surfaceId: 'governed_related_questions',
      componentType: 'related_questions_link',
      eventAction: 'click',
      evidenceLabel: 'limited_human_support',
      safetySignalPresent: true,
      reviewedStatus: 'reviewed',
      freshnessState: 'not_applicable',
    },
    {
      type: 'governed_collection_filter_change',
      pageType: 'collection_page',
      entityType: 'collection',
      entitySlug: 'herbs-for-focus',
      surfaceId: 'collection_governed_controls',
      componentType: 'collection_filter',
      eventAction: 'change',
      reviewedStatus: 'not_applicable',
      freshnessState: 'not_applicable',
    },
  ],
}

fs.mkdirSync(path.dirname(JSON_PATH), { recursive: true })
fs.writeFileSync(JSON_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8')

const md = [
  '# Governed analytics event inventory',
  '',
  `- Generated at: ${report.generatedAt}`,
  `- Deterministic model version: ${report.deterministicModelVersion}`,
  '',
  '## Event model',
  `- Namespace: ${report.eventModel.eventNamespace}`,
  '- Fields:',
  ...fieldSchema.map(field => `  - ${field}`),
  '- Guardrails:',
  ...report.eventModel.payloadGuardrails.map(rule => `  - ${rule}`),
  '',
  '## Governed surfaces and events',
  ...surfaces.flatMap(surface => [
    `- **${surface.surface}**`,
    `  - Events: ${surface.events.join(', ')}`,
    ...surface.emitsFrom.map(file => `  - Instrumented in: \`${file}\``),
  ]),
  '',
  '## Instrumentation exclusions',
  ...exclusions.map(item => `- ${item.area}: ${item.reason}`),
  '',
  '## Verification status',
  ...Object.entries(report.verification).map(([name, ok]) => `- ${name}: ${ok ? 'PASS' : 'FAIL'}`),
].join('\n')

fs.writeFileSync(MD_PATH, `${md}\n`, 'utf8')
console.log('[report:governed-analytics] inventory generated')
