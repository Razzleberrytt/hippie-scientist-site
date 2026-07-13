import fs from 'node:fs/promises'
import path from 'node:path'

const SITE_URL = 'https://thehippiescientist.net'
const SCHEMA_VERSION = 'ai-entity-enrichment-v1'
const REVIEWED_STATUSES = new Set(['reviewed', 'approved', 'published'])

const CLAIM_GROUPS = [
  ['supportedUses', 'Supported use'],
  ['unsupportedOrUnclearUses', 'Unsupported or unclear use'],
  ['mechanisms', 'Mechanism'],
  ['constituents', 'Constituent'],
  ['interactions', 'Interaction'],
  ['contraindications', 'Contraindication'],
  ['adverseEffects', 'Adverse effect'],
  ['dosageContextNotes', 'Dosage context'],
  ['populationSpecificNotes', 'Population note'],
  ['conflictNotes', 'Evidence conflict'],
  ['researchGaps', 'Research gap'],
]

function text(value) {
  return typeof value === 'string' || typeof value === 'number'
    ? String(value).trim()
    : ''
}

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function parseObject(value) {
  if (isObject(value)) return value
  if (typeof value !== 'string' || !value.trim()) return null
  try {
    const parsed = JSON.parse(value)
    return isObject(parsed) ? parsed : null
  } catch {
    return null
  }
}

function unique(values) {
  const seen = new Set()
  const output = []
  for (const value of values) {
    const normalized = text(value)
    if (!normalized) continue
    const key = normalized.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    output.push(normalized)
  }
  return output
}

function list(value, limit = 100) {
  const input = Array.isArray(value) ? value : [value]
  return unique(
    input.flatMap((entry) => {
      if (Array.isArray(entry)) return entry
      if (typeof entry === 'string') return entry.split(/[|;\n]+/)
      return []
    }),
  ).slice(0, limit)
}

function pick(record, keys) {
  if (!isObject(record)) return ''
  for (const key of keys) {
    const value = text(record[key])
    if (value) return value
  }
  return ''
}

function slugLabel(slug) {
  return text(slug)
    .split('-')
    .filter(Boolean)
    .map((part) => part.length <= 3
      ? part.toUpperCase()
      : `${part[0].toUpperCase()}${part.slice(1)}`)
    .join(' ')
}

function compact(value) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => {
      if (entry === undefined || entry === null || entry === '') return false
      if (Array.isArray(entry)) return entry.length > 0
      if (isObject(entry)) return Object.keys(entry).length > 0
      return true
    }),
  )
}

function stableClone(value) {
  if (Array.isArray(value)) return value.map(stableClone)
  if (isObject(value)) {
    return Object.keys(value)
      .sort((a, b) => a.localeCompare(b))
      .reduce((result, key) => {
        result[key] = stableClone(value[key])
        return result
      }, {})
  }
  return value
}

function stableJson(value) {
  return `${JSON.stringify(stableClone(value))}\n`
}

function propertyValue(propertyID, value) {
  return {
    '@type': 'PropertyValue',
    propertyID,
    value,
  }
}

function pmid(value) {
  return text(value).match(/\b(\d{7,8})\b/)?.[1] || ''
}

function doi(value) {
  const cleaned = text(value).replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, '')
  return cleaned.match(/\b(10\.\d{4,9}\/[-._;()/:A-Z0-9]+)\b/i)?.[1]
    ?.replace(/[.,;)]$/, '') || ''
}

function getEnrichment(record) {
  return parseObject(record.researchEnrichment)
    || parseObject(record.research_enrichment)
}

function enrichmentIsPublishable(record, enrichment) {
  const summary = parseObject(record.researchEnrichmentSummary)
  if (summary?.enrichedAndReviewed === true) return true
  const status = text(enrichment?.editorialStatus).toLowerCase()
  if (!REVIEWED_STATUSES.has(status)) return false
  return enrichment?.editorialReadiness?.publishable !== false
}

function normalizeIdentity(record, kind, slug, name) {
  const scientificName = pick(record, [
    'scientific',
    'scientific_name',
    'scientificName',
    'latinName',
  ])

  const aliases = unique([
    ...list(record.aliases),
    ...list(record.synonyms),
    ...list(record.alternate_names),
    ...list(record.alternateNames),
    ...list(record.commonnames),
    ...list(record.commonNames),
    ...list(record.abbreviations),
    pick(record, ['common', 'commonName']),
    scientificName,
  ]).filter((alias) => alias.toLowerCase() !== name.toLowerCase())

  const identifiers = compact({
    pubchemCid: pick(record, ['pubchem_cid', 'pubchemCid']),
    casNumber: pick(record, ['cas_number', 'casNumber']),
    wikidataId: pick(record, ['wikidata_id', 'wikidataId']).toUpperCase(),
    chebiId: pick(record, ['chebi_id', 'chebiId']).replace(/^CHEBI:?/i, 'CHEBI:'),
    chemblId: pick(record, ['chembl_id', 'chemblId']).toUpperCase(),
    drugbankId: pick(record, ['drugbank_id', 'drugbankId']).toUpperCase(),
    inchiKey: pick(record, ['inchikey', 'inchi_key', 'inchiKey']),
    molecularFormula: pick(record, ['molecular_formula', 'molecularFormula']),
    canonicalSmiles: pick(record, ['canonical_smiles', 'canonicalSmiles']),
  })

  const sameAs = []
  if (identifiers.pubchemCid) {
    sameAs.push(`https://pubchem.ncbi.nlm.nih.gov/compound/${identifiers.pubchemCid}`)
  }
  if (/^Q\d+$/.test(identifiers.wikidataId || '')) {
    sameAs.push(`https://www.wikidata.org/wiki/${identifiers.wikidataId}`)
  }
  if (/^CHEBI:\d+$/i.test(identifiers.chebiId || '')) {
    sameAs.push(`https://www.ebi.ac.uk/chebi/searchId.do?chebiId=${encodeURIComponent(identifiers.chebiId)}`)
  }
  if (/^CHEMBL\d+$/i.test(identifiers.chemblId || '')) {
    sameAs.push(`https://www.ebi.ac.uk/chembl/explore/compound/${identifiers.chemblId}`)
  }
  if (/^DB\d+$/i.test(identifiers.drugbankId || '')) {
    sameAs.push(`https://go.drugbank.com/drugs/${identifiers.drugbankId}`)
  }

  return {
    id: `ths:${kind}:${slug}`,
    scientificName,
    aliases,
    category: pick(record, [
      'category',
      'category_label',
      'compoundClass',
      'class',
      'subcategory',
    ]),
    identifiers,
    sameAs: unique(sameAs),
  }
}

function collectClaims(enrichment, publishable) {
  if (!publishable || !isObject(enrichment)) return []

  const claims = []
  for (const [category, categoryLabel] of CLAIM_GROUPS) {
    const rows = Array.isArray(enrichment[category])
      ? enrichment[category]
      : []

    rows.forEach((row, index) => {
      if (!isObject(row)) return
      const claim = text(row.claim)
      if (!claim) return

      claims.push({
        id: `${category}:${index + 1}`,
        category,
        categoryLabel,
        claim,
        evidenceClass: text(row.evidenceClass),
        evidenceGrade: text(row.evidenceGrade || row.evidence_grade),
        strengthNote: text(row.strengthNote),
        population: text(row.population),
        sourceRefIds: unique(Array.isArray(row.sourceRefIds) ? row.sourceRefIds : []),
        primaryPmids: unique(Array.isArray(row.primaryPmids || row.primary_pmids)
          ? row.primaryPmids || row.primary_pmids
          : []),
      })
    })
  }
  return claims
}

function sourceSchemaType(sourceType) {
  if (['rct', 'systematic-review', 'observational', 'preclinical'].includes(sourceType)) {
    return 'ScholarlyArticle'
  }
  if (['regulatory', 'monograph'].includes(sourceType)) return 'Report'
  return 'CreativeWork'
}

function normalizeSource(source, index) {
  const row = isObject(source) ? source : { title: text(source) }
  const title = pick(row, ['title', 'citation', 'ref']) || `Source ${index + 1}`
  const normalizedDoi = doi(row.doi || row.url || row.citation || title)
  const normalizedPmid = pmid(row.pmid || row.url || row.citation || title)
  const url = pick(row, ['url', 'href'])
    || (normalizedDoi ? `https://doi.org/${normalizedDoi}` : '')
    || (normalizedPmid ? `https://pubmed.ncbi.nlm.nih.gov/${normalizedPmid}/` : '')
  const sourceType = pick(row, ['sourceType', 'studyType', 'study_type', 'type'])
    .toLowerCase() || 'other'
  const originalSourceId = pick(row, ['sourceId', 'id', 'citationKey'])
  const sourceId = normalizedDoi
    ? `doi:${normalizedDoi.toLowerCase()}`
    : normalizedPmid
      ? `pmid:${normalizedPmid}`
      : originalSourceId
        ? `source:${originalSourceId.toLowerCase()}`
        : url
          ? `url:${url.toLowerCase()}`
          : `source:${index + 1}`

  return {
    sourceId,
    originalSourceId,
    title,
    sourceType,
    schemaType: sourceSchemaType(sourceType),
    url,
    doi: normalizedDoi,
    pmid: normalizedPmid,
    publicationYear: Number.isInteger(Number(row.publicationYear || row.year))
      ? Number(row.publicationYear || row.year)
      : undefined,
    authors: pick(row, ['authors', 'author', 'author_or_label']),
    organization: pick(row, ['organization', 'journal', 'publisher']),
    evidenceClass: pick(row, ['evidenceClass', 'evidence_class']),
    extractConfidence: pick(row, ['extractConfidence', 'confidence']),
    reviewer: pick(row, ['reviewer']),
    sampleSize: pick(row, ['sampleSize', 'sample_size', 'n']),
  }
}

function collectSources(record, enrichment, claims) {
  const raw = []
  if (Array.isArray(enrichment?.sourceRefs)) raw.push(...enrichment.sourceRefs)
  if (Array.isArray(record.sources)) raw.push(...record.sources)
  if (Array.isArray(record.references)) raw.push(...record.references)
  if (Array.isArray(record.pmids)) {
    raw.push(...record.pmids.map((value) => ({
      pmid: value,
      title: `PubMed ${value}`,
    })))
  }
  for (const claim of claims) {
    raw.push(...claim.primaryPmids.map((value) => ({
      pmid: value,
      title: `PubMed ${value}`,
    })))
  }

  const seen = new Set()
  return raw
    .map(normalizeSource)
    .filter((source) => {
      const key = source.doi
        ? `doi:${source.doi.toLowerCase()}`
        : source.pmid
          ? `pmid:${source.pmid}`
          : source.url
            ? `url:${source.url.toLowerCase()}`
            : source.sourceId
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
}

function collectRelationships(record, enrichment) {
  const relationships = []

  function add(entityType, rawSlug, relationshipType = 'related-to', notes = '') {
    const slug = text(rawSlug)
      .replace(/^\/(?:herbs|compounds)\//, '')
      .replace(/\/$/, '')
    if (!slug || !['herb', 'compound'].includes(entityType)) return
    relationships.push({
      entityType,
      slug,
      name: slugLabel(slug),
      canonicalUrl: `${SITE_URL}/${entityType === 'herb' ? 'herbs' : 'compounds'}/${slug}/`,
      relationshipType: text(relationshipType) || 'related-to',
      notes: text(notes),
    })
  }

  for (const relation of Array.isArray(enrichment?.relatedEntities)
    ? enrichment.relatedEntities
    : []) {
    if (!isObject(relation)) continue
    add(relation.entityType, relation.slug, relation.relationshipType, relation.notes)
  }
  for (const slug of list(record.relatedHerbs)) add('herb', slug)
  for (const slug of list(record.relatedCompounds)) add('compound', slug)
  for (const relation of Array.isArray(record.relatedEntities)
    ? record.relatedEntities
    : []) {
    if (!isObject(relation)) continue
    add(relation.entityType, relation.slug, relation.relationshipType, relation.notes)
  }

  const seen = new Set()
  return relationships.filter((relation) => {
    const key = `${relation.entityType}:${relation.slug}:${relation.relationshipType}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function buildEvidence(record, enrichment, publishable) {
  const judgment = isObject(enrichment?.pageEvidenceJudgment)
    ? enrichment.pageEvidenceJudgment
    : {}
  const grading = isObject(judgment.grading) ? judgment.grading : {}

  return {
    summary: publishable
      ? text(enrichment?.evidenceSummary)
      : pick(record, ['evidence_summary', 'evidenceSummary', 'summary']),
    tier: publishable
      ? text(enrichment?.evidenceTier)
      : pick(record, ['evidence_tier', 'evidenceTier', 'evidenceLevel']),
    label: publishable
      ? text(judgment.evidenceLabel)
      : pick(record, ['evidence_label', 'evidenceLabel', 'evidence_grade']),
    evidenceClasses: publishable && Array.isArray(enrichment?.evidenceClassesPresent)
      ? unique(enrichment.evidenceClassesPresent)
      : [],
    confidenceIndex: Number.isFinite(Number(grading.confidenceIndex))
      ? Number(grading.confidenceIndex)
      : undefined,
    conflictState: text(grading.conflictState),
    uncertaintyNotes: publishable && Array.isArray(judgment.uncertaintyNotes)
      ? unique(judgment.uncertaintyNotes)
      : [],
    reviewedBy: publishable
      ? text(enrichment?.reviewedBy)
      : pick(record, ['reviewedBy', 'reviewed_by']),
    lastReviewedAt: publishable
      ? text(enrichment?.lastReviewedAt)
      : pick(record, ['lastReviewedAt', 'last_reviewed_at', 'lastReviewed', 'last_reviewed']),
    editorialStatus: publishable
      ? text(enrichment?.editorialStatus)
      : pick(record, ['editorialStatus', 'editorial_status', 'review_status']),
  }
}

function buildSafety(record, claims) {
  const claimTexts = (category) => claims
    .filter((claim) => claim.category === category)
    .map((claim) => claim.claim)

  return {
    summary: pick(record, [
      'safetyNotes',
      'safety_notes',
      'safety',
      'safetyProfile',
      'safety_profile',
    ]),
    level: pick(record, [
      'safety_level',
      'safetyLevel',
      'safety_rating',
      'safetyrating',
    ]),
    interactions: unique([
      ...claimTexts('interactions'),
      ...list(record.interactions),
      ...list(record.drugInteractions),
    ]).slice(0, 20),
    contraindications: unique([
      ...claimTexts('contraindications'),
      ...list(record.contraindications),
    ]).slice(0, 20),
    adverseEffects: unique([
      ...claimTexts('adverseEffects'),
      ...list(record.sideEffects),
      ...list(record.sideeffects),
    ]).slice(0, 20),
  }
}

function scoreEntity(entity) {
  const breakdown = {
    identity: 0,
    evidence: 0,
    citations: 0,
    relationships: 0,
    safety: 0,
    freshness: 0,
  }
  const missing = []

  breakdown.identity += entity.name && entity.slug ? 4 : 0
  if (entity.identity.aliases.length || entity.identity.scientificName) breakdown.identity += 4
  else missing.push('identity.aliases_or_scientific_name')
  const identifierCount = Object.keys(entity.identity.identifiers).length
  if (identifierCount >= 2) breakdown.identity += 8
  else if (identifierCount === 1) breakdown.identity += 4
  else missing.push('identity.external_identifiers')
  if (entity.identity.category) breakdown.identity += 4
  else missing.push('identity.category_or_class')

  if (entity.evidence.summary) breakdown.evidence += 5
  else missing.push('evidence.summary')
  if (entity.evidence.tier || entity.evidence.label) breakdown.evidence += 5
  else missing.push('evidence.grade_or_label')
  if (entity.claims.length >= 4) breakdown.evidence += 8
  else if (entity.claims.length) breakdown.evidence += 4
  else missing.push('evidence.atomic_claims')
  if (entity.claims.some((claim) => claim.category === 'mechanisms')) breakdown.evidence += 4
  else missing.push('evidence.mechanism_claim')
  if (entity.claims.some((claim) => ['conflictNotes', 'researchGaps'].includes(claim.category))
      || entity.evidence.conflictState) {
    breakdown.evidence += 3
  } else missing.push('evidence.conflicts_or_research_gaps')

  if (entity.citations.length >= 3) breakdown.citations += 10
  else if (entity.citations.length) breakdown.citations += 6
  else missing.push('citations.sources')
  if (entity.citations.some((source) => source.doi || source.pmid)) breakdown.citations += 5
  else missing.push('citations.persistent_ids')
  if (entity.claims.some((claim) => claim.sourceRefIds.length || claim.primaryPmids.length)) {
    breakdown.citations += 5
  } else missing.push('citations.claim_source_links')

  if (entity.relationships.length >= 3) breakdown.relationships += 10
  else if (entity.relationships.length) breakdown.relationships += 5
  else missing.push('relationships.typed_entities')
  if (entity.claims.some((claim) => ['interactions', 'constituents'].includes(claim.category))) {
    breakdown.relationships += 5
  } else missing.push('relationships.interactions_or_constituents')

  if (entity.safety.summary || entity.safety.level) breakdown.safety += 4
  else missing.push('safety.summary_or_level')
  if (entity.safety.interactions.length) breakdown.safety += 3
  else missing.push('safety.interactions')
  if (entity.safety.contraindications.length) breakdown.safety += 3
  else missing.push('safety.contraindications')

  if (entity.evidence.lastReviewedAt) breakdown.freshness += 4
  else missing.push('freshness.last_reviewed_at')
  if (entity.evidence.reviewedBy) breakdown.freshness += 3
  else missing.push('freshness.reviewer')
  if (REVIEWED_STATUSES.has(entity.evidence.editorialStatus.toLowerCase())) {
    breakdown.freshness += 3
  } else missing.push('freshness.reviewed_status')

  return {
    total: Object.values(breakdown).reduce((sum, value) => sum + value, 0),
    breakdown,
    missing,
  }
}

function makeEntity(record, kind) {
  const slug = pick(record, ['slug', 'id'])
  const name = pick(record, ['name', 'displayName', 'common', 'commonName'])
    || slugLabel(slug)
  if (!slug || !name) return null

  const enrichment = getEnrichment(record)
  const publishableResearchEnrichment = enrichmentIsPublishable(record, enrichment)
  const claims = collectClaims(enrichment, publishableResearchEnrichment)
  const canonicalUrl = `${SITE_URL}/${kind === 'herb' ? 'herbs' : 'compounds'}/${slug}/`

  const entity = {
    schemaVersion: SCHEMA_VERSION,
    id: `ths:${kind}:${slug}`,
    kind,
    slug,
    name,
    canonicalUrl,
    description: pick(record, ['summary', 'description', 'evidence_summary']),
    identity: normalizeIdentity(record, kind, slug, name),
    evidence: buildEvidence(record, enrichment, publishableResearchEnrichment),
    claims,
    citations: collectSources(record, enrichment, claims),
    relationships: collectRelationships(record, enrichment),
    safety: buildSafety(record, claims),
    publishableResearchEnrichment,
  }

  entity.completeness = scoreEntity(entity)
  return entity
}

function sourceNode(source, canonicalUrl, entityId) {
  const id = source.doi
    ? `https://doi.org/${source.doi}`
    : source.pmid
      ? `https://pubmed.ncbi.nlm.nih.gov/${source.pmid}/`
      : source.url || `${canonicalUrl}#${source.sourceId.replace(/[^a-z0-9-]+/gi, '-')}`

  return compact({
    '@type': source.schemaType,
    '@id': id,
    name: source.title,
    url: source.url,
    identifier: [
      source.doi ? propertyValue('DOI', source.doi) : null,
      source.pmid ? propertyValue('PMID', source.pmid) : null,
    ].filter(Boolean),
    datePublished: source.publicationYear ? String(source.publicationYear) : undefined,
    author: source.authors
      ? { '@type': 'Organization', name: source.authors }
      : undefined,
    publisher: source.organization
      ? { '@type': 'Organization', name: source.organization }
      : undefined,
    about: { '@id': entityId },
    additionalProperty: [
      source.sourceType ? propertyValue('study type', source.sourceType) : null,
      source.evidenceClass ? propertyValue('evidence class', source.evidenceClass) : null,
      source.extractConfidence ? propertyValue('extract confidence', source.extractConfidence) : null,
      source.reviewer ? propertyValue('source reviewer', source.reviewer) : null,
      source.sampleSize ? propertyValue('sample size', source.sampleSize) : null,
    ].filter(Boolean),
  })
}

function buildJsonLd(entity) {
  const entityId = `${entity.canonicalUrl}#entity`
  const articleId = `${entity.canonicalUrl}#evidence-data`
  const sourceNodes = entity.citations.map((source) => sourceNode(
    source,
    entity.canonicalUrl,
    entityId,
  ))

  const sourceMap = new Map()
  entity.citations.forEach((source, index) => {
    const nodeId = sourceNodes[index]['@id']
    if (source.originalSourceId) sourceMap.set(source.originalSourceId, nodeId)
    sourceMap.set(source.sourceId, nodeId)
    sourceMap.set(source.sourceId.replace(/^source:/, ''), nodeId)
    if (source.pmid) sourceMap.set(source.pmid, nodeId)
  })

  const mentions = entity.relationships.map((relation) => compact({
    '@type': relation.entityType === 'herb'
      ? ['MedicalSubstance', 'Thing']
      : ['ChemicalSubstance', 'Thing'],
    '@id': `${relation.canonicalUrl}#entity`,
    name: relation.name,
    url: relation.canonicalUrl,
    additionalProperty: [
      propertyValue('relationship type', relation.relationshipType),
      relation.notes ? propertyValue('relationship notes', relation.notes) : null,
    ].filter(Boolean),
  }))

  const claimNodes = entity.claims.map((claim, index) => {
    const citationIds = unique([
      ...claim.sourceRefIds.map((sourceRefId) => sourceMap.get(sourceRefId) || ''),
      ...claim.primaryPmids.map((value) => `https://pubmed.ncbi.nlm.nih.gov/${value}/`),
    ])

    return compact({
      '@type': 'Claim',
      '@id': `${entity.canonicalUrl}#claim-${claim.category}-${index + 1}`,
      name: `${entity.name}: ${claim.categoryLabel}`,
      text: claim.claim,
      about: { '@id': entityId },
      isPartOf: { '@id': articleId },
      citation: citationIds.map((id) => ({ '@id': id })),
      audience: claim.population
        ? { '@type': 'Audience', audienceType: claim.population }
        : undefined,
      additionalProperty: [
        propertyValue('claim category', claim.category),
        claim.evidenceClass ? propertyValue('evidence class', claim.evidenceClass) : null,
        claim.evidenceGrade ? propertyValue('evidence grade', claim.evidenceGrade) : null,
        claim.strengthNote ? propertyValue('strength note', claim.strengthNote) : null,
      ].filter(Boolean),
    })
  })

  const identifiers = [
    propertyValue('THS entity id', entity.id),
    propertyValue('THS slug', entity.slug),
    ...Object.entries(entity.identity.identifiers)
      .map(([key, value]) => propertyValue(key, value)),
  ]

  const entityNode = compact({
    '@type': entity.kind === 'herb'
      ? ['MedicalSubstance', 'Thing']
      : ['ChemicalSubstance', 'MolecularEntity'],
    '@id': entityId,
    name: entity.name,
    alternateName: entity.identity.aliases,
    description: entity.description,
    url: entity.canonicalUrl,
    identifier: identifiers,
    sameAs: entity.identity.sameAs,
    category: entity.identity.category,
    molecularFormula: entity.identity.identifiers.molecularFormula,
    mentions,
    subjectOf: { '@id': articleId },
    additionalProperty: [
      entity.evidence.tier ? propertyValue('evidence tier', entity.evidence.tier) : null,
      entity.evidence.label ? propertyValue('evidence label', entity.evidence.label) : null,
      entity.safety.level ? propertyValue('safety level', entity.safety.level) : null,
      propertyValue('AI entity completeness score', entity.completeness.total),
    ].filter(Boolean),
  })

  const articleNode = compact({
    '@type': 'Article',
    '@id': articleId,
    headline: `${entity.name} evidence, safety, and entity data`,
    description: entity.evidence.summary || entity.description,
    url: entity.canonicalUrl,
    mainEntity: { '@id': entityId },
    about: { '@id': entityId },
    author: {
      '@type': 'Organization',
      name: 'The Hippie Scientist',
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'The Hippie Scientist',
      url: SITE_URL,
    },
    dateModified: entity.evidence.lastReviewedAt,
    dateReviewed: entity.evidence.lastReviewedAt,
    reviewedBy: entity.evidence.reviewedBy
      ? { '@type': 'Organization', name: entity.evidence.reviewedBy }
      : undefined,
    citation: sourceNodes.map((node) => ({ '@id': node['@id'] })),
    hasPart: claimNodes.map((node) => ({ '@id': node['@id'] })),
    mentions,
  })

  return {
    '@context': 'https://schema.org',
    '@graph': [entityNode, articleNode, ...claimNodes, ...sourceNodes],
  }
}

function markdownReport(report) {
  const rows = report.priorities.slice(0, 100).map((row) => (
    `| ${row.score} | ${row.name.replace(/\|/g, '\\|')} | ${row.kind} | ${row.missing.slice(0, 5).join(', ')} |`
  ))

  return [
    '# AI Entity Completeness Report',
    '',
    `Schema version: \`${report.schemaVersion}\``,
    '',
    `- Entities evaluated: **${report.summary.entities}**`,
    `- Average completeness: **${report.summary.averageScore}/100**`,
    `- Profiles scoring 80+: **${report.summary.strongProfiles}**`,
    `- Profiles below 50: **${report.summary.weakProfiles}**`,
    '',
    '## Highest-priority enrichment gaps',
    '',
    '| Score | Entity | Type | Primary gaps |',
    '| ---: | --- | --- | --- |',
    ...rows,
    '',
    '## Scoring weights',
    '',
    '- Identity: 20',
    '- Evidence and atomic claims: 25',
    '- Citations and claim-source links: 20',
    '- Typed relationships: 15',
    '- Safety: 10',
    '- Review freshness: 10',
    '',
  ].join('\n')
}

export async function buildAiEntityArtifacts({
  dataDir = 'public/data',
  herbs = [],
  compounds = [],
}) {
  const absoluteDataDir = path.resolve(process.cwd(), dataDir)
  const outputDir = path.join(absoluteDataDir, 'ai-entities')
  const reportDir = path.join(process.cwd(), 'ops', 'reports')

  await fs.rm(outputDir, { recursive: true, force: true })
  await fs.mkdir(path.join(outputDir, 'herb'), { recursive: true })
  await fs.mkdir(path.join(outputDir, 'compound'), { recursive: true })
  await fs.mkdir(reportDir, { recursive: true })

  const entities = [
    ...herbs.map((record) => makeEntity(record, 'herb')),
    ...compounds.map((record) => makeEntity(record, 'compound')),
  ]
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name))

  await Promise.all(entities.map((entity) => fs.writeFile(
    path.join(outputDir, entity.kind, `${entity.slug}.json`),
    stableJson(buildJsonLd(entity)),
    'utf8',
  )))

  const priorities = [...entities]
    .sort((a, b) => a.completeness.total - b.completeness.total
      || a.name.localeCompare(b.name))
    .map((entity) => ({
      id: entity.id,
      name: entity.name,
      kind: entity.kind,
      slug: entity.slug,
      canonicalUrl: entity.canonicalUrl,
      dataUrl: `/data/ai-entities/${entity.kind}/${entity.slug}.json`,
      score: entity.completeness.total,
      breakdown: entity.completeness.breakdown,
      missing: entity.completeness.missing,
      evidenceLabel: entity.evidence.label || entity.evidence.tier || '',
      lastReviewedAt: entity.evidence.lastReviewedAt || '',
    }))

  const averageScore = entities.length
    ? Math.round(entities.reduce(
      (sum, entity) => sum + entity.completeness.total,
      0,
    ) / entities.length)
    : 0

  const manifest = {
    schemaVersion: SCHEMA_VERSION,
    purpose: 'Machine-readable identity, evidence claims, citations, relationships, safety, and review provenance for canonical herb and compound profiles.',
    citationPolicy: 'Use the canonical HTML profile as the user-facing citation target. This dataset supports entity resolution and claim verification.',
    entities: priorities.map(({ missing, breakdown, ...entry }) => entry),
  }

  const report = {
    schemaVersion: SCHEMA_VERSION,
    summary: {
      entities: entities.length,
      herbs: entities.filter((entity) => entity.kind === 'herb').length,
      compounds: entities.filter((entity) => entity.kind === 'compound').length,
      averageScore,
      strongProfiles: entities.filter((entity) => entity.completeness.total >= 80).length,
      weakProfiles: entities.filter((entity) => entity.completeness.total < 50).length,
    },
    priorities,
  }

  await Promise.all([
    fs.writeFile(
      path.join(outputDir, 'manifest.json'),
      stableJson(manifest),
      'utf8',
    ),
    fs.writeFile(
      path.join(reportDir, 'ai-entity-completeness.json'),
      stableJson(report),
      'utf8',
    ),
    fs.writeFile(
      path.join(reportDir, 'ai-entity-completeness.md'),
      `${markdownReport(report)}\n`,
      'utf8',
    ),
  ])

  return report
}
