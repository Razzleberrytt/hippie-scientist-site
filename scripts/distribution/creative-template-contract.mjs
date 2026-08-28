const clean = (value) => String(value ?? '').trim().replace(/\s+/g, ' ')

export const CREATIVE_TEMPLATE_IDS = Object.freeze([
  'evidence-snapshot',
  'myth-vs-evidence',
  'study-breakdown',
  'comparison',
  'safety-card',
])

const TEMPLATE_DEFINITIONS = Object.freeze({
  'evidence-snapshot': {
    label: 'Evidence snapshot',
    requiredGovernedFields: ['finding', 'evidenceGrade', 'limitation', 'sourceUrl'],
    hierarchy: ['hook', 'finding', 'evidence-grade', 'limitation', 'source', 'disclosure'],
  },
  'myth-vs-evidence': {
    label: 'Myth vs evidence',
    requiredGovernedFields: ['mythStatement', 'evidenceCorrection', 'limitation', 'sourceUrl'],
    hierarchy: ['hook', 'myth', 'evidence-correction', 'limitation', 'source', 'disclosure'],
  },
  'study-breakdown': {
    label: 'Study breakdown',
    requiredGovernedFields: ['studyDesign', 'studyPopulation', 'studyFinding', 'studyLimitation', 'primarySourceUrl'],
    hierarchy: ['hook', 'study-design', 'population', 'finding', 'limitation', 'source', 'disclosure'],
  },
  comparison: {
    label: 'Comparison',
    requiredGovernedFields: ['comparisonLabelA', 'comparisonLabelB', 'comparisonFindingA', 'comparisonFindingB', 'comparisonLimitation', 'sourceUrl'],
    hierarchy: ['hook', 'comparison-a', 'comparison-b', 'limitation', 'source', 'disclosure'],
  },
  'safety-card': {
    label: 'Safety card',
    requiredGovernedFields: ['safetyWarnings', 'limitation', 'sourceUrl'],
    hierarchy: ['hook', 'safety-warning', 'limitation', 'source', 'disclosure'],
  },
})

function fieldPresent(input, field) {
  const value = input?.[field]
  if (Array.isArray(value)) return value.some((item) => clean(item))
  return Boolean(clean(value))
}

function supportedProfileIds(exportProfiles) {
  return (exportProfiles ?? [])
    .filter((profile) => Number(profile?.width) > 0 && Number(profile?.height) > 0)
    .map((profile) => clean(profile.id))
    .filter(Boolean)
}

export function buildCreativeTemplateCatalog(input, { exportProfiles = [] } = {}) {
  const profiles = supportedProfileIds(exportProfiles)
  const templates = CREATIVE_TEMPLATE_IDS.map((id) => {
    const definition = TEMPLATE_DEFINITIONS[id]
    const missingGovernedFields = definition.requiredGovernedFields.filter((field) => !fieldPresent(input, field))
    return {
      id,
      label: definition.label,
      status: missingGovernedFields.length ? 'blocked-missing-governed-content' : 'ready',
      requiredGovernedFields: [...definition.requiredGovernedFields],
      missingGovernedFields,
      supportedExportProfiles: [...profiles],
      hierarchy: [...definition.hierarchy],
      citationRequiredOnFactualPanels: true,
      disclosureRequired: true,
      sourceRequired: true,
      rewriteAllowed: false,
      truncationAllowed: false,
      generativeImageryPolicy: 'decorative-only-no-factual-authority',
      factualAuthority: 'governed-input-only',
    }
  })

  return {
    version: 1,
    templates,
    readyTemplateIds: templates.filter((template) => template.status === 'ready').map((template) => template.id),
    guardrails: {
      requiredTemplateCoverage: [...CREATIVE_TEMPLATE_IDS],
      missingGovernedContentMustFailClosed: true,
      templatesMayNotInferMissingFacts: true,
      templatesMayNotParaphraseGovernedFacts: true,
      templatesMayNotTruncateGovernedFacts: true,
      citationsRequiredOnFactualPanels: true,
      disclosureRequired: true,
      generativeImageryMayNotDefineFactualAuthority: true,
    },
  }
}

export function validateCreativeTemplateCatalog(catalog) {
  const errors = []
  if (catalog?.version !== 1) errors.push('template catalog version must be 1')
  const templates = Array.isArray(catalog?.templates) ? catalog.templates : []
  const ids = templates.map((template) => template?.id)
  for (const requiredId of CREATIVE_TEMPLATE_IDS) {
    if (!ids.includes(requiredId)) errors.push(`template catalog missing ${requiredId}`)
  }
  if (new Set(ids).size !== ids.length) errors.push('template ids must be unique')

  for (const template of templates) {
    if (!['ready', 'blocked-missing-governed-content'].includes(template?.status)) errors.push(`${template?.id} has invalid status`)
    if (!Array.isArray(template?.requiredGovernedFields) || template.requiredGovernedFields.length === 0) errors.push(`${template?.id} must declare governed field requirements`)
    if (!Array.isArray(template?.hierarchy) || !template.hierarchy.includes('source') || !template.hierarchy.includes('disclosure')) errors.push(`${template?.id} must preserve source/disclosure hierarchy`)
    if (template?.citationRequiredOnFactualPanels !== true) errors.push(`${template?.id} must require citations on factual panels`)
    if (template?.disclosureRequired !== true || template?.sourceRequired !== true) errors.push(`${template?.id} must require source and disclosure treatment`)
    if (template?.rewriteAllowed !== false || template?.truncationAllowed !== false) errors.push(`${template?.id} may not rewrite or truncate governed facts`)
    if (template?.generativeImageryPolicy !== 'decorative-only-no-factual-authority') errors.push(`${template?.id} must keep generative imagery decorative-only`)
    if (template?.factualAuthority !== 'governed-input-only') errors.push(`${template?.id} factual authority must remain governed-input-only`)
    const missing = Array.isArray(template?.missingGovernedFields) ? template.missingGovernedFields : []
    if (template?.status === 'ready' && missing.length) errors.push(`${template?.id} cannot be ready with missing governed content`)
    if (template?.status === 'blocked-missing-governed-content' && !missing.length) errors.push(`${template?.id} cannot be blocked without a missing governed field`)
  }

  if (catalog?.guardrails?.missingGovernedContentMustFailClosed !== true) errors.push('missing governed content must fail closed')
  if (catalog?.guardrails?.templatesMayNotInferMissingFacts !== true) errors.push('templates may not infer missing facts')
  if (catalog?.guardrails?.generativeImageryMayNotDefineFactualAuthority !== true) errors.push('generative imagery may not define factual authority')
  return errors
}

export function selectCreativeTemplate(catalog, templateId) {
  const template = catalog?.templates?.find((candidate) => candidate.id === templateId)
  if (!template) throw new Error(`Unknown creative template: ${templateId}`)
  if (template.status !== 'ready') {
    throw new Error(`Creative template ${templateId} is blocked; missing governed fields: ${template.missingGovernedFields.join(', ')}`)
  }
  return template
}
