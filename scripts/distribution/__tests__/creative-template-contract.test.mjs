import { describe, expect, it } from 'vitest'
import {
  buildCreativeTemplateCatalog,
  CREATIVE_TEMPLATE_IDS,
  selectCreativeTemplate,
  validateCreativeTemplateCatalog,
} from '../creative-template-contract.mjs'

const exportProfiles = [
  { id: 'vertical-video', width: 1080, height: 1920 },
  { id: 'portrait-carousel', width: 1080, height: 1350 },
  { id: 'square-social', width: 1080, height: 1080 },
  { id: 'pinterest', width: 1000, height: 1500 },
]

const evidenceSnapshotInput = {
  finding: 'A governed finding.',
  evidenceGrade: 'B',
  limitation: 'A governed limitation.',
  sourceUrl: 'https://thehippiescientist.net/herbs/ashwagandha/',
}

describe('creative template contract', () => {
  it('covers every required reusable creative template with stable platform profiles', () => {
    const catalog = buildCreativeTemplateCatalog(evidenceSnapshotInput, { exportProfiles })
    expect(validateCreativeTemplateCatalog(catalog)).toEqual([])
    expect(catalog.templates.map((template) => template.id)).toEqual(CREATIVE_TEMPLATE_IDS)
    for (const template of catalog.templates) {
      expect(template.supportedExportProfiles).toEqual(exportProfiles.map((profile) => profile.id))
      expect(template.citationRequiredOnFactualPanels).toBe(true)
      expect(template.disclosureRequired).toBe(true)
      expect(template.sourceRequired).toBe(true)
      expect(template.rewriteAllowed).toBe(false)
      expect(template.truncationAllowed).toBe(false)
      expect(template.generativeImageryPolicy).toBe('decorative-only-no-factual-authority')
    }
  })

  it('makes evidence snapshot ready without inventing content for other templates', () => {
    const catalog = buildCreativeTemplateCatalog(evidenceSnapshotInput, { exportProfiles })
    expect(catalog.readyTemplateIds).toEqual(['evidence-snapshot'])
    expect(selectCreativeTemplate(catalog, 'evidence-snapshot').status).toBe('ready')
    expect(() => selectCreativeTemplate(catalog, 'myth-vs-evidence')).toThrow(/missing governed fields/i)
    expect(() => selectCreativeTemplate(catalog, 'study-breakdown')).toThrow(/missing governed fields/i)
    expect(() => selectCreativeTemplate(catalog, 'comparison')).toThrow(/missing governed fields/i)
    expect(() => selectCreativeTemplate(catalog, 'safety-card')).toThrow(/missing governed fields/i)
  })

  it('unblocks richer templates only when their required governed content is present', () => {
    const input = {
      ...evidenceSnapshotInput,
      mythStatement: 'A governed myth statement.',
      evidenceCorrection: 'A governed correction.',
      studyDesign: 'Randomized controlled trial',
      studyPopulation: 'Adults in the governed study population',
      studyFinding: 'A governed study finding.',
      studyLimitation: 'A governed study limitation.',
      primarySourceUrl: 'https://example.org/primary-study',
      comparisonLabelA: 'Option A',
      comparisonLabelB: 'Option B',
      comparisonFindingA: 'Governed finding A.',
      comparisonFindingB: 'Governed finding B.',
      comparisonLimitation: 'A governed comparison limitation.',
      safetyWarnings: ['A governed safety warning.'],
    }
    const catalog = buildCreativeTemplateCatalog(input, { exportProfiles })
    expect(validateCreativeTemplateCatalog(catalog)).toEqual([])
    expect(catalog.readyTemplateIds).toEqual(CREATIVE_TEMPLATE_IDS)
  })

  it('fails validation if trust or factual-authority guardrails drift', () => {
    const catalog = buildCreativeTemplateCatalog(evidenceSnapshotInput, { exportProfiles })
    const unsafe = structuredClone(catalog)
    unsafe.templates[0].generativeImageryPolicy = 'may-summarize-facts'
    unsafe.templates[0].rewriteAllowed = true
    expect(validateCreativeTemplateCatalog(unsafe)).toEqual(expect.arrayContaining([
      expect.stringMatching(/decorative-only/),
      expect.stringMatching(/rewrite or truncate/),
    ]))
  })
})
