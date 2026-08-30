#!/usr/bin/env node
/**
 * Pre-fill the bibliographic half of a source attestation, so review is a
 * judgment call rather than a transcription job.
 *
 * Why this exists
 * ---------------
 * 387 profiles are held from publication because their sources are not in the
 * registry. Only 64 of those have any source signal at all, 25 are already
 * registered, and what actually remains is 39 candidates — of which 30 carry a
 * valid PMID. So the queue is small; it is the per-source effort that is large.
 *
 * Registering one source means hand-copying a title, an author list, a journal,
 * a year, a DOI and a canonical URL out of PubMed, then making four judgment
 * calls about how good the evidence is. The transcription is most of the work
 * and none of the value, and it is the part a human is worst at: a mistyped
 * PMID silently attaches the wrong paper to a health claim.
 *
 * Every bibliographic field here is copied from the NCBI E-utilities response
 * for that exact PMID, already fetched by `citations:fetch-pubmed` and cached
 * in ops/cache/pubmed-metadata.json. Nothing is inferred from the surrounding
 * profile, and a PMID PubMed does not recognise is reported as a gap rather
 * than filled in.
 *
 * What this deliberately does NOT do
 * ----------------------------------
 * It does not write to the registry, and it cannot. `reviewer`, `reviewedAt`
 * and `reliabilityTier` are required by source-registry.schema.json, and none
 * of the three is a fact PubMed can supply — they are the attestation itself:
 * a named person saying, on a date, how far this source can be trusted. A
 * draft is therefore never schema-valid on purpose. Output goes to ops/audit/
 * for review, and promotion into
 * data-sources/enrichment-source-registry-baseline.json stays a human act.
 *
 * Study design is mapped only where PubMed's own publication types are
 * unambiguous. "Review" is left blank rather than guessed: the registry
 * distinguishes systematic from narrative evidence, PubMed's Review type does
 * not, and 40 of the 68 cached records carry it. Guessing there would launder
 * a narrative review into a systematic one, which is precisely the confusion
 * the evidence grades exist to prevent.
 *
 * Usage:
 *   node scripts/data/prepare-source-attestations.mjs [--json]
 *
 * Requires ops/audit/held-source-verification-queue.json — regenerate it with
 *   node scripts/data/report-held-source-verification-queue.mjs
 */

import fs from 'node:fs'
import path from 'node:path'

import { identityTokens } from '../enrichment/source-identity.mjs'
import { writeJsonAtomic } from '../lib/atomic-json.mjs'

const ROOT = process.cwd()
const QUEUE_PATH = path.join(ROOT, 'ops', 'audit', 'held-source-verification-queue.json')
const CACHE_PATH = path.join(ROOT, 'ops', 'cache', 'pubmed-metadata.json')
const REGISTRY_PATH = path.join(ROOT, 'public', 'data', 'source-registry.json')
const SEED_PATH = path.join(ROOT, 'data-sources', 'enrichment-source-registry-baseline.json')
const OUT_JSON = path.join(ROOT, 'ops', 'audit', 'source-attestation-drafts.json')
const OUT_MD = path.join(ROOT, 'ops', 'audit', 'source-attestation-drafts.md')

const asJson = process.argv.includes('--json')

function readJson(filePath, fallback = null) {
  if (!fs.existsSync(filePath)) return fallback
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch {
    return fallback
  }
}

/**
 * PubMed publication types that map onto exactly one registry study design.
 * Anything absent from this table is left for the reviewer; see the header on
 * why "Review" is not in it.
 */
const DESIGN_BY_PUBLICATION_TYPE = new Map([
  ['Meta-Analysis', {
    sourceType: 'meta-analysis',
    studyDesign: 'meta-analysis',
    sourceClass: 'systematic-review-meta-analysis',
    // evidenceClass withheld: a meta-analysis of animal studies is not
    // human-clinical, and the publication type does not say which it is.
    evidenceClass: null,
  }],
  ['Systematic Review', {
    sourceType: 'systematic-review',
    studyDesign: 'systematic-review',
    sourceClass: 'systematic-review-meta-analysis',
    evidenceClass: null,
  }],
  ['Randomized Controlled Trial', {
    sourceType: 'journal-article',
    studyDesign: 'randomized-controlled-trial',
    sourceClass: 'randomized-human-trial',
    // PubMed applies this type only to trials in humans, so the class follows.
    evidenceClass: 'human-clinical',
  }],
])

/** Publication types that indicate the item is not research at all. */
const NON_RESEARCH_TYPES = new Set(['News', 'Editorial', 'Comment', 'Retraction of Publication'])

/** Most specific design wins, so a record typed both RCT and Review reads as an RCT. */
const DESIGN_PRECEDENCE = ['Meta-Analysis', 'Systematic Review', 'Randomized Controlled Trial']

function classify(publicationTypes = []) {
  const types = new Set(publicationTypes)
  for (const key of DESIGN_PRECEDENCE) {
    if (types.has(key)) return { ...DESIGN_BY_PUBLICATION_TYPE.get(key), basis: key }
  }
  const nonResearch = publicationTypes.filter((type) => NON_RESEARCH_TYPES.has(type))
  if (nonResearch.length) {
    return { sourceType: null, studyDesign: null, sourceClass: null, evidenceClass: null, nonResearch }
  }
  // PubMed says it is a journal article; it does not say what was done in it.
  return {
    sourceType: types.has('Journal Article') ? 'journal-article' : null,
    studyDesign: null,
    sourceClass: null,
    evidenceClass: null,
    basis: null,
  }
}

/** Vancouver-style citation, assembled only when every part is present. */
function citationTextFrom(record) {
  // The cache carries both a display string (authors) and the parsed array
  // (authorList). Only the array can be formatted or deduplicated.
  const { authorList: authors, title, journal, year, volume, pages } = record
  if (!authors?.length || !title || !journal || !year) return null
  const authorText = authors.length > 6 ? `${authors.slice(0, 6).join(', ')}, et al` : authors.join(', ')
  const tail = [volume, pages].filter(Boolean).join(':')
  return `${authorText}. ${title.replace(/\.$/, '')}. ${journal}. ${year}${tail ? `;${tail}` : ''}.`
}

const queue = readJson(QUEUE_PATH)
if (!queue) {
  console.error(
    '[source-attestations] ops/audit/held-source-verification-queue.json is missing.\n' +
      '  Regenerate it: node scripts/data/report-held-source-verification-queue.mjs',
  )
  process.exit(1)
}

const cacheRaw = readJson(CACHE_PATH, {})
const cache = cacheRaw.records || cacheRaw
const registry = readJson(REGISTRY_PATH, [])
const seed = readJson(SEED_PATH, [])

/** Identities already spoken for, so a draft can never shadow a registered source. */
const claimed = new Map()
for (const row of [...(Array.isArray(registry) ? registry : []), ...(Array.isArray(seed) ? seed : [])]) {
  for (const token of identityTokens(row)) if (!claimed.has(token)) claimed.set(token, row.sourceId)
}

/** PMID -> profiles it would help release, so review can start where it pays. */
const profilesByPmid = new Map()
const candidatesWithoutIdentifier = []

for (const candidate of queue.candidates || []) {
  const pmids = [candidate.claimSignals, candidate.detailSignals]
    .flatMap((signals) => signals?.validPmids || [])
    .map(String)
  if (!pmids.length) {
    candidatesWithoutIdentifier.push({
      slug: candidate.slug,
      entityType: candidate.entityType,
      // What the profile offered instead of an identifier, so the gap is legible.
      signals: [candidate.claimSignals, candidate.detailSignals]
        .flatMap((signals) => signals?.sourceUrls || [])
        .slice(0, 3),
    })
    continue
  }
  for (const pmid of pmids) {
    if (!profilesByPmid.has(pmid)) profilesByPmid.set(pmid, new Set())
    profilesByPmid.get(pmid).add(candidate.slug)
  }
}

const drafts = []
const missingFromCache = []
const alreadyClaimed = []

for (const [pmid, slugSet] of profilesByPmid) {
  const unblocks = [...slugSet].sort()
  const owner = claimed.get(`pmid:${pmid}`)
  if (owner) {
    alreadyClaimed.push({ pmid, sourceId: owner, unblocks })
    continue
  }

  const record = cache[pmid]
  if (!record) {
    missingFromCache.push({ pmid, unblocks })
    continue
  }

  const classification = classify(record.publicationTypes)
  const authors = Array.isArray(record.authorList) ? record.authorList : []

  // Everything below is copied from the esummary response for this PMID.
  const draft = {
    sourceId: `src_pmid-${pmid}`,
    title: record.title || null,
    sourceType: classification.sourceType,
    sourceClass: classification.sourceClass,
    evidenceClass: classification.evidenceClass,
    studyDesign: classification.studyDesign,
    authors: [...new Set(authors)],
    publicationYear: record.year ? Number(record.year) : null,
    citationText: citationTextFrom(record),
    doi: record.doi || null,
    pmid,
    canonicalUrl: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
    language: 'en',
    // Present in PubMed with a journal and year, which is evidence of
    // publication but not of current standing; a retraction would not show here.
    publicationStatus: record.journal && record.year ? 'published' : null,
    active: false,
    reliabilityTier: null,
    reviewer: null,
    reviewedAt: null,
  }

  const judgmentFields = ['sourceType', 'sourceClass', 'evidenceClass', 'studyDesign', 'reliabilityTier', 'reviewer', 'reviewedAt']
  const requiresJudgment = judgmentFields.filter((field) => draft[field] == null)

  drafts.push({
    draft,
    unblocks,
    designBasis: classification.basis || null,
    nonResearchTypes: classification.nonResearch || [],
    publicationTypes: record.publicationTypes || [],
    requiresJudgment,
    prefilled: ['title', 'authors', 'publicationYear', 'doi', 'canonicalUrl', 'citationText'].filter((field) => {
      const value = draft[field]
      return Array.isArray(value) ? value.length > 0 : value != null
    }),
  })
}

drafts.sort((a, b) => b.unblocks.length - a.unblocks.length || a.draft.pmid.localeCompare(b.draft.pmid))

const summary = {
  generatedFrom: 'NCBI E-utilities esummary via ops/cache/pubmed-metadata.json',
  heldProfiles: queue.counts?.heldProfiles ?? null,
  candidates: (queue.candidates || []).length,
  drafts: drafts.length,
  designResolvedFromPubmed: drafts.filter((entry) => entry.designBasis).length,
  designNeedsReviewer: drafts.filter((entry) => !entry.designBasis && !entry.nonResearchTypes.length).length,
  flaggedNonResearch: drafts.filter((entry) => entry.nonResearchTypes.length).length,
  alreadyClaimed: alreadyClaimed.length,
  missingFromCache: missingFromCache.length,
  candidatesWithoutIdentifier: candidatesWithoutIdentifier.length,
}

const payload = { summary, drafts, alreadyClaimed, missingFromCache, candidatesWithoutIdentifier }

fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true })
writeJsonAtomic(OUT_JSON, payload)

const md = []
md.push('# Source attestation drafts', '')
md.push('Bibliographic fields are copied from PubMed for the stated PMID. The judgment')
md.push('fields are deliberately blank: a draft is not a registration, and nothing here')
md.push('enters the registry until a reviewer fills them and promotes it into')
md.push('`data-sources/enrichment-source-registry-baseline.json`.', '')
md.push(`- held profiles: **${summary.heldProfiles}**`)
md.push(`- drafts prepared: **${summary.drafts}** (design resolved from PubMed for ${summary.designResolvedFromPubmed})`)
md.push(`- need a reviewer to classify design: **${summary.designNeedsReviewer}**`)
md.push(`- flagged as non-research: **${summary.flaggedNonResearch}**`)
md.push(`- candidates with no usable identifier: **${summary.candidatesWithoutIdentifier}**`, '')
md.push('| PMID | unblocks | design | needs judgment | title |')
md.push('| --- | --- | --- | --- | --- |')
for (const entry of drafts) {
  const design = entry.designBasis
    ? entry.draft.studyDesign
    : entry.nonResearchTypes.length
      ? `! ${entry.nonResearchTypes.join(', ')}`
      : '—'
  const title = (entry.draft.title || '(no title)').replace(/\|/g, '\\|').slice(0, 70)
  md.push(`| ${entry.draft.pmid} | ${entry.unblocks.join(', ')} | ${design} | ${entry.requiresJudgment.length} | ${title} |`)
}
if (candidatesWithoutIdentifier.length) {
  md.push('', '## Candidates with no usable identifier', '')
  md.push('These cannot be drafted at all. They cite something, but not anything resolvable.', '')
  for (const entry of candidatesWithoutIdentifier) {
    const signals = entry.signals.length ? entry.signals.map((text) => `"${text}"`).join(', ') : 'no source text'
    md.push(`- \`${entry.slug}\` — ${signals}`)
  }
}
md.push('')
fs.writeFileSync(OUT_MD, md.join('\n'))

if (asJson) {
  console.log(JSON.stringify(payload, null, 2))
  process.exit(0)
}

console.log('\nSource attestation drafts')
console.log('='.repeat(66))
console.log(`  held profiles                  ${String(summary.heldProfiles).padStart(5)}`)
console.log(`  queue candidates               ${String(summary.candidates).padStart(5)}`)
console.log(`  drafts prepared                ${String(summary.drafts).padStart(5)}`)
console.log(`    design resolved from PubMed  ${String(summary.designResolvedFromPubmed).padStart(5)}`)
console.log(`    design needs a reviewer      ${String(summary.designNeedsReviewer).padStart(5)}`)
console.log(`    flagged non-research         ${String(summary.flaggedNonResearch).padStart(5)}`)
console.log(`  already registered             ${String(summary.alreadyClaimed).padStart(5)}`)
console.log(`  PMID not in cache              ${String(summary.missingFromCache).padStart(5)}`)
console.log(`  candidates with no identifier  ${String(summary.candidatesWithoutIdentifier).padStart(5)}`)
console.log(`\n  JSON: ${path.relative(ROOT, OUT_JSON)}`)
console.log(`  Markdown: ${path.relative(ROOT, OUT_MD)}`)
console.log('\n  Drafts are not registrations. reviewer, reviewedAt and reliabilityTier')
console.log('  are blank by design; fill them and promote into the baseline seed.\n')
