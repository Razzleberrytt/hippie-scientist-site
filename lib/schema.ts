/**
 * Schema.org type system — cluster layer.
 *
 * Complements src/lib/seo.ts (per-page JSON-LD builders) and
 * src/lib/schema-graph.ts (@graph assembly). This file adds:
 *  - ClusterDefinition / SeeAlsoEntry types (shared with lib/cluster-linking.ts)
 *  - Drug / Thing node builders not in the existing files
 *  - relatedLink + ItemList helpers for cluster interlinking
 */

import { SITE_URL, toAbsoluteUrl } from '../src/lib/seo'

// ─────────────────────────────────────────────────────────────────────────────
// Cluster types — consumed by lib/cluster-linking.ts and components
// ─────────────────────────────────────────────────────────────────────────────

export type ClusterId =
  | 'adhd-focus'
  | 'sleep'
  | 'stress-anxiety'
  | 'energy'
  | 'neuroprotection'

export type EntityKind = 'herb' | 'compound'

export type EvidenceTier = 'high' | 'moderate' | 'low'

export type ClusterMember = {
  slug: string
  kind: EntityKind
  label: string
  /** Primary roles this entity plays within the cluster */
  primaryRoles: string[]
  evidenceTier: EvidenceTier
}

export type ClusterDefinition = {
  id: ClusterId
  label: string
  /** Canonical goal page slug that anchors this cluster */
  goalSlug: string
  description: string
  members: ClusterMember[]
}

export type SeeAlsoEntry = {
  slug: string
  kind: EntityKind
  label: string
  href: string
  /** Human-readable reason for the relationship */
  reason: string
  cluster: ClusterId
  clusterLabel: string
  clusterGoalHref: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Schema.org node arg types (strict — no `any` or generic unknown values)
// ─────────────────────────────────────────────────────────────────────────────

export type SchemaNode = Record<string, unknown>

export type WorkbookLinkedProfile = Record<string, unknown> & {
  slug?: unknown
  name?: unknown
  common?: unknown
  commonName?: unknown
  scientific?: unknown
  scientific_name?: unknown
  latinName?: unknown
  category?: unknown
  compoundClass?: unknown
  class?: unknown
  pubchem_cid?: unknown
  pubchemCid?: unknown
  cas_number?: unknown
  casNumber?: unknown
  molecular_formula?: unknown
  molecularFormula?: unknown
  safetyNotes?: unknown
  safety_notes?: unknown
  safety?: unknown
  evidenceLevel?: unknown
  evidence_level?: unknown
  evidence_tier?: unknown
  evidenceTier?: unknown
  primary_effects?: unknown
  primaryEffects?: unknown
  mechanisms?: unknown
  primary_mechanisms?: unknown
  pathways?: unknown
}

export type ProfileEntitySchemaArgs = {
  kind: 'herb' | 'compound'
  slug: string
  name: string
  url: string
  description?: string
  record?: WorkbookLinkedProfile
  evidenceGrade?: string
  safetyNotes?: string
  primaryEffects?: string[]
}

export type ComparisonFaqRow = {
  question?: string
  answer?: string
  need?: string
  option?: string
  name?: string
  bestFor?: string
  evidence?: string
  risk?: string
  safety?: string
  profileHref?: string
}

export type FocusClusterLink = {
  title: string
  href: string
  description: string
}

export type DrugSchemaArgs = {
  name: string
  slug: string
  description?: string
  /** ATC drug class if available */
  drugClass?: string
  legalStatus?: string
  relatedDrugs?: Array<{ name: string; url: string }>
}

export type ThingSchemaArgs = {
  name: string
  url: string
  description?: string
  sameAs?: string[]
}

const WORKBOOK_SOURCE_ID = 'data-sources/herb_monograph_master.xlsx'

const FOCUS_CLUSTER_ENTITY_SLUGS = new Set([
  'alpha-gpc',
  'ashwagandha',
  'bacopa',
  'caffeine',
  'citicoline',
  'l-theanine',
  'magnesium',
  'omega-3',
  'rhodiola',
  'tyrosine',
])

const FOCUS_CLUSTER_KEYWORDS = /\b(adhd|attention|focus|concentration|cognition|cognitive)\b/i

export const focusClusterSeeAlsoLinks: FocusClusterLink[] = [
  {
    title: 'Best Supplements for ADHD',
    href: '/guides/adhd/best-supplements-for-adhd/',
    description: 'Cluster overview for ADHD-adjacent supplement questions.',
  },
  {
    title: 'Omega-3 for ADHD',
    href: '/guides/adhd/omega-3-and-adhd/',
    description: 'EPA/DHA context for attention-support research.',
  },
  {
    title: 'Magnesium for ADHD',
    href: '/guides/adhd/magnesium-for-adhd/',
    description: 'Magnesium status, sleep, and focus-adjacent framing.',
  },
  {
    title: 'L-Theanine for ADHD',
    href: '/guides/adhd/l-theanine-for-adhd/',
    description: 'Calm-focus positioning without stimulant claims.',
  },
  {
    title: 'Citicoline vs Alpha-GPC',
    href: '/guides/adhd/citicoline-vs-alpha-gpc/',
    description: 'Choline donor comparison for focus stacks.',
  },
  {
    title: 'Best Supplements for Focus Without Caffeine',
    href: '/guides/focus/focus-without-caffeine-crash/',
    description: 'Non-caffeine focus options and tradeoffs.',
  },
]

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function text(value: unknown): string {
  return typeof value === 'string' || typeof value === 'number' ? String(value).trim() : ''
}

function optionalText(value: unknown): string | undefined {
  const cleaned = text(value)
  return cleaned || undefined
}

function textList(value: unknown, limit = 8): string[] {
  const values = Array.isArray(value) ? value : [value]
  return values
    .flatMap((entry) => {
      if (Array.isArray(entry)) return entry
      if (typeof entry === 'string') return entry.split(/[|;,]/)
      return entry
    })
    .map((entry) => text(entry))
    .filter(Boolean)
    .filter((entry, index, list) => list.findIndex((candidate) => candidate.toLowerCase() === entry.toLowerCase()) === index)
    .slice(0, limit)
}

function firstText(record: Record<string, unknown> | undefined, keys: string[]): string | undefined {
  if (!record) return undefined
  for (const key of keys) {
    const value = optionalText(record[key])
    if (value) return value
  }
  return undefined
}

function compactObject(value: Record<string, unknown>): SchemaNode {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => {
      if (entry === undefined || entry === null) return false
      if (Array.isArray(entry)) return entry.length > 0
      if (typeof entry === 'object') return Object.keys(entry).length > 0
      return true
    }),
  )
}

function propertyValue(propertyID: string, value: string, name?: string): SchemaNode {
  return compactObject({
    '@type': 'PropertyValue',
    ...(name ? { name } : {}),
    propertyID,
    value,
  })
}

function normalizeCanonical(urlOrPath: string): string {
  const absolute = /^https?:\/\//i.test(urlOrPath) ? urlOrPath : toAbsoluteUrl(urlOrPath)
  return absolute.endsWith('/') ? absolute : `${absolute}/`
}

// ─────────────────────────────────────────────────────────────────────────────
// Schema.org node builders
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Builds a Schema.org Drug node.
 * Use for compound profiles that have a defined pharmacological identity.
 */
export function buildDrugNode(args: DrugSchemaArgs): SchemaNode {
  const url = `${SITE_URL}/compounds/${args.slug}/`
  return {
    '@type': 'Drug',
    name: args.name,
    url,
    ...(args.description ? { description: args.description } : {}),
    ...(args.drugClass
      ? { drugClass: { '@type': 'DrugClass', name: args.drugClass } }
      : {}),
    ...(args.legalStatus ? { legalStatus: args.legalStatus } : {}),
    ...(args.relatedDrugs?.length
      ? {
          relatedDrug: args.relatedDrugs.map((d) => ({
            '@type': 'Drug',
            name: d.name,
            url: d.url,
          })),
        }
      : {}),
  }
}

/**
 * Builds a Schema.org Thing node.
 * Use for generic entity cross-linking (e.g., cluster anchors, goal pages).
 */
export function buildThingNode(args: ThingSchemaArgs): SchemaNode {
  return {
    '@type': 'Thing',
    name: args.name,
    url: args.url,
    ...(args.description ? { description: args.description } : {}),
    ...(args.sameAs?.length ? { sameAs: args.sameAs } : {}),
  }
}

/**
 * Builds the `relatedLink` URL array for a MedicalWebPage schema node.
 *
 * Google uses relatedLink to understand topical cluster membership.
 * Each value must be an absolute canonical URL.
 */
export function buildRelatedLinksSchema(entries: SeeAlsoEntry[]): string[] {
  return entries.map((e) => {
    const raw = `${SITE_URL}${e.href}/`
    return raw.replace(/\/{2,}$/, '/')
  })
}

/**
 * Builds a Schema.org ItemList representing a cluster.
 * Embed as `mentions` or `hasPart` on CollectionPage / MedicalWebPage.
 */
export function buildClusterItemListNode(cluster: ClusterDefinition): SchemaNode {
  const goalUrl = `${SITE_URL}/goals/${cluster.goalSlug}/`
  return {
    '@type': 'ItemList',
    name: cluster.label,
    description: cluster.description,
    url: goalUrl,
    numberOfItems: cluster.members.length,
    itemListElement: cluster.members.map((member, index) => {
      const base = member.kind === 'herb' ? 'herbs' : 'compounds'
      const profileUrl = `${SITE_URL}/${base}/${member.slug}/`
      return {
        '@type': 'ListItem',
        position: index + 1,
        name: member.label,
        url: profileUrl,
      }
    }),
  }
}

/**
 * Builds a Schema.org DefinedTermSet formally declaring a cluster as a semantic group.
 * Can be embedded as `specialty` on MedicalWebPage or stand-alone in a @graph.
 */
export function buildClusterDefinedTermSet(cluster: ClusterDefinition): SchemaNode {
  const goalUrl = `${SITE_URL}/goals/${cluster.goalSlug}/`
  const termSetId = `${goalUrl}#cluster-${cluster.id}`
  return {
    '@type': 'DefinedTermSet',
    '@id': termSetId,
    name: cluster.label,
    description: cluster.description,
    url: goalUrl,
    hasDefinedTerm: cluster.members.map((member) => {
      const base = member.kind === 'herb' ? 'herbs' : 'compounds'
      const profileUrl = `${SITE_URL}/${base}/${member.slug}/`
      return {
        '@type': 'DefinedTerm',
        name: member.label,
        url: profileUrl,
        description: member.primaryRoles.join(', '),
        inDefinedTermSet: { '@id': termSetId },
      }
    }),
  }
}

function buildWorkbookIdentifiers(args: {
  kind: 'herb' | 'compound'
  slug: string
  record?: WorkbookLinkedProfile
}): SchemaNode[] {
  const record = args.record
  const identifiers = [
    propertyValue('THS slug', args.slug, 'The Hippie Scientist slug'),
    propertyValue('THS entity type', args.kind, 'The Hippie Scientist entity type'),
    propertyValue('source workbook', WORKBOOK_SOURCE_ID, 'Workbook source'),
  ]

  const workbookRowId = firstText(record, ['id', 'workbook_id', 'row_id', 'source_id'])
  if (workbookRowId) identifiers.push(propertyValue('workbook row', workbookRowId, 'Workbook row id'))

  const pubchemCid = firstText(record, ['pubchem_cid', 'pubchemCid'])
  if (pubchemCid) identifiers.push(propertyValue('PubChem CID', pubchemCid))

  const casNumber = firstText(record, ['cas_number', 'casNumber'])
  if (casNumber) identifiers.push(propertyValue('CAS', casNumber))

  return identifiers
}

export function buildWorkbookEntitySchema(args: ProfileEntitySchemaArgs): SchemaNode {
  const record = isRecord(args.record) ? args.record : undefined
  const canonical = normalizeCanonical(args.url)
  const scientificName = firstText(record, ['scientific', 'scientific_name', 'latinName'])
  const category = firstText(record, ['category', 'compoundClass', 'class'])
  const molecularFormula = firstText(record, ['molecular_formula', 'molecularFormula'])
  const pubchemCid = firstText(record, ['pubchem_cid', 'pubchemCid'])
  const sameAs = pubchemCid ? [`https://pubchem.ncbi.nlm.nih.gov/compound/${pubchemCid}`] : []
  const safetyNotes = args.safetyNotes || firstText(record, ['safetyNotes', 'safety_notes', 'safety'])
  const evidenceLevel = args.evidenceGrade || firstText(record, ['evidenceLevel', 'evidence_level', 'evidence_tier', 'evidenceTier'])
  const knownUse = textList(args.primaryEffects?.length ? args.primaryEffects : record?.primary_effects || record?.primaryEffects, 8)
  const mechanisms = textList(record?.mechanisms || record?.primary_mechanisms || record?.pathways, 8)
  const entityTypes =
    args.kind === 'herb'
      ? ['MedicalSubstance', 'Thing']
      : molecularFormula || pubchemCid
        ? ['MolecularEntity', 'ChemicalSubstance']
        : ['ChemicalSubstance', 'Thing']

  return compactObject({
    '@type': entityTypes,
    '@id': `${canonical}#entity`,
    name: args.name,
    url: canonical,
    description: args.description,
    mainEntityOfPage: { '@id': `${canonical}#webpage` },
    identifier: buildWorkbookIdentifiers({ kind: args.kind, slug: args.slug, record }),
    ...(scientificName ? { alternateName: scientificName } : {}),
    ...(category ? { category } : {}),
    ...(mechanisms.length ? { mechanismOfAction: mechanisms.join('; ') } : {}),
    ...(molecularFormula ? { molecularFormula } : {}),
    ...(sameAs.length ? { sameAs } : {}),
    // `evidenceLevel`, `knownUse`, and `safetyWarnings` are NOT schema.org properties.
    // On the herb entity's medical types (DietarySupplement / MedicalSubstance) the
    // structured-data validator rejects them as invalid, so this data lives in
    // `additionalProperty` (valid on any Thing) instead — no information is lost.
    additionalProperty: [
      propertyValue('workbook source', WORKBOOK_SOURCE_ID),
      propertyValue('static route', canonical),
      ...(evidenceLevel ? [propertyValue('evidence level', String(evidenceLevel))] : []),
      ...(safetyNotes ? [propertyValue('safety notes', String(safetyNotes))] : []),
      ...(mechanisms.length ? [propertyValue('mechanism summary', mechanisms.join('; '))] : []),
      ...(knownUse.length ? [propertyValue('profile use contexts', knownUse.join('; '))] : []),
    ],
  })
}

function normalizeFaqEntries(rows: ComparisonFaqRow[]): Array<{ question: string; answer: string }> {
  const entries = rows.flatMap((row) => {
    if (row.question && row.answer) {
      return [{ question: row.question, answer: row.answer }]
    }

    if (row.need && row.option) {
      return [{
        question: `What is a common option to compare for ${row.need.toLowerCase()}?`,
        answer: `${row.option} is listed as a comparison starting point for ${row.need.toLowerCase()}. Review the full profile for evidence, safety, timing, and fit before making a decision.`,
      }]
    }

    if (row.name && row.bestFor) {
      const evidence = row.evidence ? ` Evidence context: ${row.evidence}.` : ''
      const risk = row.risk || row.safety
      const safety = risk ? ` Safety context: ${risk}.` : ''
      return [{
        question: `What is ${row.name} best for in this comparison?`,
        answer: `${row.name} is listed for ${row.bestFor}.${evidence}${safety}`,
      }]
    }

    return []
  })

  const seen = new Set<string>()
  return entries.filter((entry) => {
    const key = entry.question.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return entry.question.length > 0 && entry.answer.length > 0
  })
}

export function buildFAQPageFromComparisonRows(args: {
  pagePath: string
  rows: ComparisonFaqRow[]
  fallbackQuestions?: Array<{ question: string; answer: string }>
}): SchemaNode | null {
  const questions = normalizeFaqEntries([
    ...(args.fallbackQuestions ?? []),
    ...args.rows,
  ])

  if (!questions.length) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.slice(0, 8).map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
    url: normalizeCanonical(args.pagePath),
  }
}

export function isFocusClusterRecord(recordOrSlug: string | Record<string, unknown>): boolean {
  if (typeof recordOrSlug === 'string') {
    return FOCUS_CLUSTER_ENTITY_SLUGS.has(recordOrSlug)
  }

  const slug = text(recordOrSlug.slug).toLowerCase()
  if (slug && FOCUS_CLUSTER_ENTITY_SLUGS.has(slug)) return true

  const searchable = [
    recordOrSlug.name,
    recordOrSlug.displayName,
    recordOrSlug.summary,
    recordOrSlug.description,
    recordOrSlug.category,
    recordOrSlug.primary_effects,
    recordOrSlug.effects,
    recordOrSlug.tags,
  ]
    .flat()
    .map((value) => text(value))
    .join(' ')

  return FOCUS_CLUSTER_KEYWORDS.test(searchable)
}

export function buildFocusClusterBreadcrumb(args: {
  currentName: string
  currentUrl: string
}): SchemaNode {
  const currentUrl = normalizeCanonical(args.currentUrl)
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${currentUrl}#focus-cluster-breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Goals', item: `${SITE_URL}/goals/` },
      { '@type': 'ListItem', position: 3, name: 'Focus', item: `${SITE_URL}/guides/focus/` },
      { '@type': 'ListItem', position: 4, name: 'Focus & ADHD cluster', item: `${SITE_URL}/guides/adhd/best-supplements-for-adhd/` },
      { '@type': 'ListItem', position: 5, name: args.currentName, item: currentUrl },
    ],
  }
}
