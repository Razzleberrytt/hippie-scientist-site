import fs from 'node:fs/promises'
import path from 'node:path'

const SCHEMA_VERSION = 'ai-entity-enrichment-v1'
const SITE_URL = 'https://thehippiescientist.net'
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

function safeText(value) {
  return typeof value === 'string' || typeof value === 'number' ? String(value).trim() : ''
}

function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function parseObject(value) {
  if (isRecord(value)) return value
  if (typeof value !== 'string' || !value.trim()) return null
  try {
    const parsed = JSON.parse(value)
    return isRecord(parsed) ? parsed : null
  } catch {
    return null
  }
}

function unique(values) {
  const seen = new Set()
  const output = []
  for (const value of values) {
    const text = safeText(value)
    if (!text) continue
    const key = text.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    output.push(text)
  }
  return output
}

function toList(value, limit = 100) {
  const values = Array.isArray(value) ? value : [value]
  return unique(
    values.flatMap((entry) => {
      if (Array.isArray(entry)) return entry
      if (typeof entry === 'string') return entry.split(/[|;\n]+/)
      return []
    }),
  ).slice(0, limit)
}

function firstText(record, keys) {
  if (!isRecord(record)) return ''
  for (const key of keys) {
    const value = safeText(record[key])
    if (value) return value
  }
  return ''
}

function firstValue(record, keys) {
  if (!isRecord(record)) return undefined
  for (const key of keys) {
    const value = record[key]
    if (value !== undefined && value !== null && safeText(value)) return value
  }
  return undefined
}

function slugToLabel(slug) {
  return safeText(slug)
    .split('-')
    .filter(Boolean)
    .map((part) => part.length <= 3 ? part.toUpperCase() : `${part[0].toUpperCase()}${part.slice(1)}`)
    .join(' ')
}

function stableClone(value) {
  if (Array.isArray(value)) return value.map(stableClone)
  if (isRecord(value)) {
    return Object.keys(value)
      .sort((a, b) => a.localeCompare(b))
      .reduce((acc, key) => {
        acc[key] = stableClone(value[key])
        return acc
      }, {})
  }
  return value
}

function stableJson(value) {
  return `${JSON.stringify(stableClone(value))}\n`
}

function compactObject(value) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => {
      if (entry === undefined || entry === null || entry === '') return false
      if (Array.isArray(entry)) return entry.length > 0
      if (isRecord(entry)) return Object.keys(entry).length > 0
      return true
    }),
  )
}

function propertyValue(propertyID, value, name) {
  return compactObject({
    '@type': 'PropertyValue',
    propertyID,
    value,
    ...(name ? { name } : {}),
  })
}

function normalizePmid(value) {
  const match = safeText(value).match(/\b(\d{7,8})\b/)
  return match?.[1] || ''
}

function normalizeDoi(value) {
  const cleaned = safeText(value).replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, '')
  const match = cleaned.match(/\b(10\.\d{4,9}\/[-._;()/:A-Z0-9]+)\b/i)
  return match?.[1]?.replace(/[.,;)]$/, '') || ''
}

function normalizeExternalId(value, prefix) {
  const text = safeText(value)
  if (!text) return ''
  return prefix && !text.toUpperCase().startsWith(`${prefix}:`)
    ? `${prefix}:${text.replace(new RegExp(`^${prefix}`, 'i'), '')}`
    : text
}

function normalizeIdentity(record, kind, slug, name) {
  const scientificName = firstText(record, ['scientific', 'scientific_name', 'scientificName', 'latinName'])
  const aliases = unique([
    ...toList(record.aliases),
    ...toList(record.synonyms),
    ...toList(record.alternate_names),
    ...toList(record.alternateNames),
    ...toList(record.commonnames),
    ...toList(record.commonNames),
    ...toList(record.abbreviations),
    firstText(record, ['common', 'commonName']),
    scientificName,
  ]).filter((alias) => alias.toLowerCase() !== name.toLowerCase())

  const identifiers = compactObject({
    pubchemCid: firstText(record, ['pubchem_cid', 'pubchemCid']),
    casNumber: firstText(record, ['cas_number', 'casNumber']),
    wikidataId: firstText(record, ['wikidata_id', 'wikidataId']),
    chebiId: normalizeExternalId(firstText(record, ['chebi_id', 'chebiId']), 'CHEBI'),
    chemblId: firstText(record, ['chembl_id', 'chemblId']).toUpperCase(),
    drugbankId: firstText(record, ['drugbank_id', 'drugbankId']).toUpperCase(),
    inchiKey: firstText(record, ['inchikey', 'inchi_key', 'inchiKey']),
    molecularFormula: firstText(record, ['molecular_formula', 'molecularFormula']),
    canonicalSmiles: firstText(record, ['canonical_smiles', 'canonicalSmiles']),
  })

  const sameAs = []
  if (identifiers.pubchemCid) sameAs.push(`https://pubchem.ncbi.nlm.nih.gov/compound/${identifiers.pubchemCid}`)
  if (/^Q\d+$/i.test(identifiers.wikidataId || '')) sameAs.push(`https://www.wikidata.org/wiki/${identifiers.wikidataId.toUpperCase()}`)
  if (identifiers.chebiId) sameAs.push(`https://www.ebi.ac.uk/chebi/searchId.do?chebiId=${encodeURIComponent(identifiers.chebiId)}`)
  if (/^CHEMBL\d+$/i.test(identifiers.chemblId || '')) sameAs.push(`https://www.ebi.ac.uk/chembl/explore/compound/${identifiers.chemblId}`)
  if (/^DB\d+$/i.test(identifiers.drugbankId || '')) sameAs.push(`https://go.drugbank.com/drugs/${identifiers.drugbankId}`)

  return {
    id: `ths:${kind}:${slug}`,
    name,
    scientificName,
    aliases,
    category: firstText(record, ['category', 'category_label', 'compoundClass', 'class', 'subcategory']),
    identifiers,
    sameAs: unique(sameAs),
  }
}

function getEnrichment(record) {
  return parseObject(record.researchEnrichment) || parseObject(record.research_enrichment)
}

function isPublishableEnrichment(record, enrichment) {
  const summary = parseObject(record.researchEnrichmentSummary)
  if (summary?.enrichedAndReviewed === true) return true
  const status = safeText(enrichment?.editorialStatus).toLowerCase()
  if (!REVIEWED_STATUSES.has(status)) return false
  if (enrichment?.editorialReadiness?.publishable === false) return false
  return true
}

function sourceTypeToSchemaType(sourceType) {
  if (['rct', 'systematic-review', 'observational', 'preclinical'].includes(sourceType)) return 'ScholarlyArticle'
  if (['regulatory', 'monograph'].includes(sourceType)) return 'Report'
  return 'CreativeWork'
}

function sourceIdFromRecord(source, fallback) {
  const doi = normalizeDoi(source.doi || source.url || source.citation || source.title)
  if (doi) return `doi:${doi.toLowerCase()}`
  const pmid = normalizePmid(source.pmid || source.url || source.citation || source.title)
  if (pmid) return `pmid:${pmid}`
  const sourceId = safeText(source.sourceId || source.id || source.citationKey)
  if (sourceId) return `source:${sourceId.toLowerCase()}`
  const url = safeText(source.url || source.href)
  if (url) return `url:${url.toLowerCase()}`
  return `source:${fallback}`
}

function normalizeSource(source, fallbackIndex) {
  const row = isRecord(source) ? source : { title: safeText(source) }
  const title = firstText(row, ['title', 'citation', 'ref']) || `Source ${fallbackIndex + 1}`
  const doi = normalizeDoi(row.doi || row.url || row.citation || title)
  const pmid = normalizePmid(row.pmid || row.url || row.citation || title)
  const url = firstText(row, ['url', 'href']) || (doi ? `https://doi.org/${doi}` : pmid ? `https://pubmed.ncbi.nlm.nih.gov/${pmid}/` : '')
  const sourceType = firstText(row, ['sourceType', 'studyType', 'study_type', 'type']).toLowerCase() || 'other'
  const sourceId = sourceIdFromRecord(row, fallbackIndex)

  return compactObject({
    sourceId,
    originalSourceId: firstText(row, ['sourceId', 'id', 'citationKey']),
    title,
    sourceType,
    schemaType: sourceTypeToSchemaType(sourceType),
    url,
    doi,
    pmid,
    publicationYear: Number.isInteger(Number(row.publicationYear || row.year)) ? Number(row.publicationYear || row.year) : undefined,
    authors: firstText(row, ['authors', 'author', 'author_or_label']),
    organization: firstText(row, ['organization', 'journal', 'publisher']),
    evidenceClass: firstText(row, ['evidenceClass', 'evidence_class']),
    extractConfidence: firstText(row, ['extractConfidence', 'confidence']),
    reviewer: firstText(row, ['reviewer']),
    sampleSize: firstText(row, ['sampleSize', 'sample_size', 'n']),
  })
}

function collectSources(record, enrichment, claims) {
  const raw = []
  if (Array.isArray(enrichment?.sourceRefs)) raw.push(...enrichment.sourceRefs)
  if (Array.isArray(record.sources)) raw.push(...record.sources)
  if (Array.isArray(record.references)) raw.push(...record.references)
  if (Array.isArray(record.pmids)) raw.push(...record.pmids.map((pmid) => ({ pmid, title: `PubMed ${pmid}` })))

  for (const claim of claims) {
    for (const pmid of claim.primaryPmids || []) raw.push({ pmid, title: `PubMed ${pmid}` })
  }

  const normalized = raw.map((source, index) => normalizeSource(source, index))
  const seen = new Set()
  return normalized.filter((source) => {
    const key = source.doi ? `doi:${source.doi.toLowerCase()}` : source.pmid ? `pmid:${source.pmid}` : source.url ? `url:${source.url.toLowerCase()}` : source.sourceId
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function collectClaims(enrichment, publishable) {
  if (!publishable || !isRecord(enrichment)) return []
  const claims = []
  for (const [key, label] of CLAIM_GROUPS) {
    const rows = Array.isArray(enrichment[key]) ? enrichment[key] : []
    rows.forEach((row, index) => {
      if (!isRecord(row)) return
      const claim = safeText(row.claim)
      if (!claim) return
      claims.push(compactObject({
        id: `${key}:${index + 1}`,
        category: key,
        categoryLabel: label,
        claim,
        evidenceClass: safeText(row.evidenceClass),
        evidenceGrade: safeText(row.evidenceGrade || row.evidence_grade),
        strengthNote: safeText(row.strengthNote),
        population: safeText(row.population),
        sourceRefIds: unique(Array.isArray(row.sourceRefIds) ? row.sourceRefIds : []),
        primaryPmids: unique(Array.isArray(row.primaryPmids || row.primary_pmids) ? (row.primaryPmids || row.primary_pmids) : []),
      }))
    })
  }
  return claims
}

function collectRelationships(record, enrichment) {
  const relationships = []
  const push = (entityType, slug, relationshipType = 'related-to', notes = '') => {
    const cleanSlug = safeText(slug).replace(/^\/(?:herbs|compounds)\//, '').replace(/\/$/, '')
    if (!cleanSlug) return
    relationships.push(compactObject({
      entityType,
      slug: cleanSlug,
      name: slugToLabel(cleanSlug),
      canonicalUrl: `${SITE_URL}/${entityType === 'herb' ? 'herbs' : 'compounds'}/${cleanSlug}/`,
      relationshipType,
      notes,
    }))
  }

  if (Array.isArray(enrichment?.relatedEntities)) {
    for (const relation of enrichment.relatedEntities) {
      if (!isRecord(relation)) continue
      const entityType = safeText(relation.entityType)
      if (entityType !== 'herb' && entityType !== 'compound') continue
      push(entityType, relation.slug, safeText(relation.relationshipType) || 'related-to', safeText(relation.notes))
    }
  }

  for (const slug of toList(record.relatedHerbs)) push('herb', slug)
  for (const slug of toList(record.relatedCompounds)) push('compound', slug)

  if (Array.isArray(record.relatedEntities)) {
    for (const relation of record.relatedEntities) {
      if (isRecord(relation)) {
        const entityType = safeText(relation.entityType)
        if (entityType === 'herb' || entityType === 'compound') push(entityType, relation.slug, safeText(relation.relationshipType) || 'related-to', safeText(relation.notes))
      }
    }
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
  const judgment = isRecord(enrichment?.pageEvidenceJudgment) ? enrichment.pageEvidenceJudgment : null
  const grading = isRecord(judgment?.grading) ? judgment.grading : null
  return compactObject({
    summary: publishable ? safeText(enrichment?.evidenceSummary) : firstText(record, ['evidence_summary', 'evidenceSummary', 'summary']),
    tier: publishable ? safeText(enrichment?.evidenceTier) : firstText(record, ['evidence_tier', 'evidenceTier', 'evidenceLevel']),
    label: publishable ? safeText(judgment?.evidenceLabel) : firstText(record, ['evidence_label', 'evidenceLabel', 'evidence_grade']),
    evidenceClasses: publishable && Array.isArray(enrichment?.evidenceClassesPresent) ? unique(enrichment.evidenceClassesPresent) : [],
    confidenceIndex: grading && Number.isFinite(Number(grading.confidenceIndex)) ? Number(grading.confidenceIndex) : undefined,
    conflictState: grading ? safeText(grading.conflictState) : '',
    uncertaintyNotes: publishable && Array.isArray(judgment?.uncertaintyNotes) ? unique(judgment.uncertaintyNotes) : [],
    reviewedBy: publishable ? safeText(enrichment?.reviewedBy) : firstText(record, ['reviewedBy', 'reviewed_by']),
    lastReviewedAt: publishable ? safeText(enrichment?.lastReviewedAt) : firstText(record, ['lastReviewedAt', 'last_reviewed_at', 'lastReviewed', 'last_reviewed']),
    editorialStatus: publishable ? safeText(enrichment?.editorialStatus) : firstText(record, ['editorialStatus', 'editorial_status', 'review_status']),
  })
}

function buildSafety(record, claims) {
  const claimText = (category) => claims.filter((claim) => claim.category === category).map((claim) => claim.claim)
  return compactObject({
    summary: firstText(record, ['safetyNotes', 'safety_notes', 'safety', 'safetyProfile', 'safety_profile']),
    level: firstText(record, ['safety_level', 'safetyLevel', 'safety_rating', 'safetyrating']),
    interactions: unique([...claimText('interactions'), ...toList(record.interactions), ...toList(record.drugInteractions)]).slice(0, 20),
    contraindications: unique([...claimText('contraindications'), ...toList(record.contraindications)]).slice(0, 20),
    adverseEffects: unique([...claimText('adverseEffects'), ...toList(record.sideEffects), ...toList(record.sideeffects)]).slice(0, 20),
  })
}

function scoreEntity(entity) {
  const score = {
    identity: 0,
    evidence: 0,
    citations: 0,
    relationships: 0,
    safety: 0,
    freshness: 0,
  }
  const missing = []

  score.identity += entity.name && entity.slug ? 4 : 0
  if (entity.identity.aliases.length || entity.identity.scientificName) score.identity += 4
  else missing.push('identity.aliases_or_scientific_name')
  const identifierCount = Object.keys(entity.identity.identifiers).length
  if (identifierCount >= 2) score.identity += 8
  else if (identifierCount === 1) score.identity += 4
  else missing.push('identity.external_identifiers')
  if (entity.identity.category) score.identity += 4
  else missing.push('identity.category_or_class')

  if (entity.evidence.summary) score.evidence += 5
  else missing.push('evidence.summary')
  if (entity.evidence.tier || entity.evidence.label) score.evidence += 5
  else missing.push('evidence.grade_or_label')
  if (entity.claims.length >= 4) score.evidence += 8
  else if (entity.claims.length > 0) score.evidence += 4
  else missing.push('evidence.atomic_claims')
  if (entity.claims.some((claim) => claim.category === 'mechanisms')) score.evidence += 4
  else missing.push('evidence.mechanism_claim')
  if (entity.claims.some((claim) => claim.category === 'conflictNotes' || claim.category === 'researchGaps') || entity.evidence.conflictState) score.evidence += 3
  else missing.push('evidence.conflicts_or_research_gaps')

  if (entity.citations.length >= 3) score.citations += 10
  else if (entity.citations.length > 0) score.citations += 6
  else missing.push('citations.sources')
  if (entity.citations.some((source) => source.doi || source.pmid)) score.citations += 5
  else missing.push('citations.persistent_ids')
  if (entity.claims.some((claim) => claim.sourceRefIds.length || claim.primaryPmids.length)) score.citations += 5
  else missing.push('citations.claim_source_links')

  if (entity.relationships.length >= 3) score.relationships += 10
  else if (entity.relationships.length > 0) score.relationships += 5
  else missing.push('relationships.typed_entities')
  if (entity.claims.some((claim) => claim.category === 'interactions' || claim.category === 'constituents')) score.relationships += 5
  else missing.push('relationships.interactions_or_constituents')

  if (entity.safety.summary || entity.safety.level) score.safety += 4
  else missing.push('safety.summary_or_level')
  if (entity.safety.interactions.length) score.safety += 3
  else missing.push('safety.interactions')
  if (entity.safety.contraindications.length) score.safety += 3
  else missing.push('safety.contraindications')

  if (entity.evidence.lastReviewedAt) score.freshness += 4
  else missing.push('freshness.last_reviewed_at')
  if (entity.evidence.reviewedBy) score.freshness += 3
  else missing.push('freshness.reviewer')
  if (REVIEWED_STATUSES.has(safeText(entity.evidence.editorialStatus).toLowerCase())) score.freshness += 3
  else missing.push('freshness.reviewed_status')

  return {
    total: Object.values(score).reduce((sum, value) => sum + value, 0),
    breakdown: score,
    missing,
  }
}

function makeEntity(record, kind) {
  const slug = firstText(record, ['slug', 'id'])
  const name = firstText(record, ['name', 'displayName', 'common', 'commonName']) || slugToLabel(slug)
  if (!slug || !name) return null
  const canonicalUrl = `${SITE_URL}/${kind === 'herb' ? 'herbs' : 'compounds'}/${slug}/`
  const enrichment = getEnrichment(record)
  const publishable = isPublishableEnrichment(record, enrichment)
  const claims = collectClaims(enrichment, publishable)
  const citations = collectSources(record, enrichment, claims)
  const relationships = collectRelationships(record, enrichment)
  const identity = normalizeIdentity(record, kind, slug, name)
  const evidence = buildEvidence(record, enrichment, publishable)
  const safety = buildSafety(record, claims)

  const entity = {
    schemaVersion: SCHEMA_VERSION,
    id: identity.id,
    kind,
    slug,
    name,
    canonicalUrl,
    description: firstText(record, ['summary', 'description', 'evidence_summary']),
    identity,
    evidence,
    claims,
    citations,
    relationships,
    safety,
    publishableResearchEnrichment: publishable,
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
  const identifiers = []
  if (source.doi) identifiers.push(propertyValue('DOI', source.doi))
  if (source.pmid) identifiers.push(propertyValue('PMID', source.pmid))

  return compactObject({
    '@type': source.schemaType,
    '@id': id,
    name: source.title,
    url: source.url,
    identifier: identifiers,
    datePublished: source.publicationYear ? String(source.publicationYear) : undefined,
    author: source.authors ? { '@type': 'Organization', name: source.authors } : undefined,
    publisher: source.organization ? { '@type': 'Organization', name: source.organization } : undefined,
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
  const sourceNodes = entity.citations.map((source) => sourceNode(source, entity.canonicalUrl, entityId))
  const sourceByOriginalId = new Map()
  entity.citations.forEach((source, index) => {
    const nodeId = sourceNodes[index]['@id']
    if (source.originalSourceId) sourceByOriginalId.set(source.originalSourceId, nodeId)
    if (source.sourceId) sourceByOriginalId.set(source.sourceId.replace(/^source:/, ''), nodeId)
    if (source.pmid) sourceByOriginalId.set(source.pmid, nodeId)
  })

  const identifierNodes = [
    propertyValue('THS entity id', entity.id),
    propertyValue('THS slug', entity.slug),
  ]
  for (const [key, value] of Object.entries(entity.identity.identifiers)) identifierNodes.push(propertyValue(key, value))

  const mentions = entity.relationships.map((relation) => ({
    '@type': relation.entityType === 'herb' ? ['MedicalSubstance', 'Thing'] : ['ChemicalSubstance', 'Thing'],
    '@id': `${relation.canonicalUrl}#entity`,
    name: relation.name,
    url: relation.canonicalUrl,
    additionalProperty: [
      propertyValue('relationship type', relation.relationshipType),
      relation.notes ? propertyValue('relationship notes', relation.notes) : null,
    ].filter(Boolean),
  }))

  const claimNodes = entity.claims.map((claim, index) => {
    const citations = []
    for (const sourceRefId of claim.sourceRefIds) {
      const sourceId = sourceByOriginalId.get(sourceRefId) || sourceByOriginalId.get(`source:${sourceRefId}`)
      if (sourceId) citations.push({ '@id': sourceId })
    }
    for (const pmid of claim.primaryPmids) citations.push({ '@id': `https://pubmed.ncbi.nlm.nih.gov/${pmid}/` })

    return compactObject({
      '@type': 'Claim',
      '@id': `${entity.canonicalUrl}#claim-${claim.category}-${index + 1}`,
      name: `${entity.name}: ${claim.categoryLabel}`,
      text: claim.claim,
      about: { '@id': entityId },
      isPartOf: { '@id': articleId },
      citation: citations,
      audience: claim.population ? { '@type': 'Audience', audienceType: claim.population } : undefined,
      additionalProperty: [
        propertyValue('claim category', claim.category),
        claim.evidenceClass ? propertyValue('evidence class', claim.evidenceClass) : null,
        claim.evidenceGrade ? propertyValue('evidence grade', claim.evidenceGrade) : null,
        claim.strengthNote ? propertyValue('strength note', claim.strengthNote) : null,
      ].filter(Boolean),
    })
  })

  const entityNode = compactObject({
    '@type': entity.kind === 'herb' ? ['MedicalSubstance', 'Thing'] : ['ChemicalSubstance', 'MolecularEntity'],
    '@id': entityId,
    name: entity.name,
    alternateName: entity.identity.aliases,
    description: entity.description,
    url: entity.canonicalUrl,
    identifier: identifierNodes,
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

  const articleNode = compactObject({
    '@type': 'Article',
    '@id': articleId,
    headline: `${entity.name} evidence, safety, and entity data`,
    description: entity.evidence.summary || entity.description,
    url: entity.canonicalUrl,
    mainEntity: { '@id': entityId },
    about: { '@id': entityId },
    author: { '@type': 'Organization', name: 'The Hippie Scientist', url: SITE_URL },
    publisher: { '@type': 'Organization', name: 'The Hippie Scientist', url: SITE_URL },
    dateModified: entity.evidence.lastReviewedAt,
    dateReviewed: entity.evidence.lastReviewedAt,
    reviewedBy: entity.evidence.reviewedBy ? { '@type': 'Organization', name: entity.evidence.reviewedBy } : undefined,
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
  const lines = [
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
  ]

  for (const row of report.priorities.slice(0, 100)) {
    lines.push(`| ${row.score} | ${row.name.replace(/\|/g, '\\|')} | ${row.kind} | ${row.missing.slice(0, 5).join(', ')} |`)
  }

  lines.push('', '## Scoring weights', '', '- Identity: 20', '- Evidence and atomic claims: 25', '- Citations and claim-source links: 20', '- Typed relationships: 15', '- Safety: 10', '- Review freshness: 10', '')
  return `${lines.join('\n')}\n`
}

export async function buildAiEntityArtifacts({ dataDir = 'public/data', herbs = [], compounds = [] }) {
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
  ].filter(Boolean).sort((a, b) => a.name.localeCompare(b.name))

  await Promise.all(
    entities.map((entity) => fs.writeFile(
      path.join(outputDir, entity.kind, `${entity.slug}.json`),
      stableJson(buildJsonLd(entity)),
      'utf8',
    )),
  )

  const priorities = [...entities]
    .sort((a, b) => a.completeness.total - b.completeness.total || a.name.localeCompare(b.name))
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
    ? Math.round(entities.reduce((sum, entity) => sum + entity.completeness.total, 0) / entities.length)
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
    fs.writeFile(path.join(outputDir, 'manifest.json'), stableJson(manifest), 'utf8'),
    fs.writeFile(path.join(reportDir, 'ai-entity-completeness.json'), stableJson(report), 'utf8'),
    fs.writeFile(path.join(reportDir, 'ai-entity-completeness.md'), markdownReport(report), 'utf8'),
  ])

  return report
}
