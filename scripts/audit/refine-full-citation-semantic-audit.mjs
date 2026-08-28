#!/usr/bin/env node
/**
 * Precision pass over full-citation-semantic-audit.mjs.
 *
 * The first pass is deliberately recall-heavy. This pass re-fetches abstracts
 * for its high-risk set and applies stronger identity normalization so valid
 * citations are not mislabeled merely because PubMed uses a Greek letter,
 * scientific abbreviation, formulation name, or common synonym.
 */

import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const ROOT = process.cwd()
const REPORT_PATH = path.join(ROOT, 'ops', 'reports', 'full-citation-semantic-audit.json')
const DATA_DIR = path.join(ROOT, 'public', 'data')
const EFETCH = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi'
const USER_AGENT = 'thehippiescientist.net semantic citation precision pass/1.0'
const BATCH = 70
const SLEEP_MS = 400

const GENERIC = new Set([
  'extract','complex','supplement','supplementation','powder','root','standardized','standardised',
  'capsule','capsules','form','forms','product','products','oral','oil','compound','compounds','acid',
])

// Curated synonym/formulation equivalences are conservative: they prevent a
// false mismatch but do NOT promote a citation to "clean". Related/formulation
// matches remain manual-review material at the claim level.
const DIRECT_ALIASES = {
  'alpha-asarone': ['alpha asarone', 'asarone'],
  'alpha-mangostin': ['alpha mangostin', 'mangostin'],
  boswellia: ['boswellia serrata', 'b serrata'],
  'capsicum-annuum': ['capsicum annuum', 'capsaicinoid', 'capsaicinoids'],
  'curcumin-piperine': ['curcumin piperine', 'curcumin plus piperine'],
  'devils-claw': ['devils claw', 'harpagophytum procumbens'],
  'garcinia-cambogia-extract': ['garcinia cambogia', 'hydroxycitric acid'],
  'glycinate-magnesium-complex': ['magnesium glycinate', 'magnesium bisglycinate', 'magnesium'],
  'green-tea-extract-egcg': ['epigallocatechin gallate', 'egcg'],
  'lavender-extract': ['lavender', 'silexan'],
  'panax-ginseng': ['panax ginseng', 'ginseng'],
  'pomegranate-extract': ['pomegranate', 'punica granatum'],
  'psyllium-husk': ['psyllium', 'plantago ovata'],
  turmeric: ['turmeric', 'curcuma longa', 'curcuma domestica'],
  'uc-ii-collagen': ['uc ii', 'type ii collagen', 'native type ii collagen', 'undenatured type ii collagen'],
  'valerian-root-extract': ['valerian', 'valeriana officinalis'],
  'vitamin-d3': ['vitamin d3', 'vitamin d', 'cholecalciferol'],
}

const RELATED_ALIASES = {
  'omega-3': ['icosapent ethyl', 'eicosapentaenoic acid', 'docosahexaenoic acid'],
  'green-tea-extract': ['green tea', 'camellia sinensis', 'catechin', 'egcg', 'epigallocatechin gallate'],
  'l-tyrosine': ['tyrosine'],
}

const INTERVENTION_PATTERNS = [
  /supplement/i, /administr/i, /randomi[sz]/i, /placebo/i, /controlled trial/i,
  /clinical trial/i, /intervention/i, /\bextract/i, /\bdose/i, /\bdosing/i,
  /\bintake/i, /ingest/i, /\boral/i, /treated with/i, /treatment with/i,
  /meta-analysis/i, /systematic review/i, /efficacy/i,
]

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const text = (value) => String(value ?? '').replace(/\s+/g, ' ').trim()

function norm(value) {
  return text(value)
    .toLowerCase()
    .replace(/α/g, ' alpha ')
    .replace(/β/g, ' beta ')
    .replace(/γ/g, ' gamma ')
    .replace(/δ/g, ' delta ')
    .replace(/ω/g, ' omega ')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function decodeXml(value) {
  return String(value ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/\s+/g, ' ').trim()
}

function asStrings(value) {
  if (Array.isArray(value)) return value.flatMap(asStrings)
  if (typeof value === 'string' || typeof value === 'number') return [String(value)]
  if (value && typeof value === 'object') return [value.name, value.slug, value.scientific, value.common, value.label].flatMap(asStrings)
  return []
}

function loadProfiles() {
  const map = new Map()
  for (const dir of ['herbs-detail', 'compounds-detail']) {
    const full = path.join(DATA_DIR, dir)
    if (!fs.existsSync(full)) continue
    for (const file of fs.readdirSync(full)) {
      if (!file.endsWith('.json')) continue
      const record = JSON.parse(fs.readFileSync(path.join(full, file), 'utf8'))
      const slug = text(record.slug) || file.replace(/\.json$/, '')
      map.set(slug, record)
    }
  }
  return map
}

function identitySets(record, slug) {
  const raw = [
    record?.name,
    record?.scientific,
    record?.scientificName,
    record?.common,
    record?.commonName,
    ...(Array.isArray(record?.aliases) ? record.aliases : []),
    slug.replace(/-/g, ' '),
  ].flatMap(asStrings).map(norm).filter(Boolean)

  const direct = new Set(raw)
  for (const phrase of raw) {
    const tokens = phrase.split(' ').filter((token) => token.length >= 5 && !GENERIC.has(token))
    // A meaningful long token often survives naming variations such as
    // "lavender extract" -> "lavender oil" or "L-tyrosine" -> "tyrosine".
    for (const token of tokens) direct.add(token)
    const parts = phrase.split(' ').filter(Boolean)
    if (parts.length === 2 && parts[0].length >= 4 && parts[1].length >= 4) {
      direct.add(`${parts[0][0]} ${parts[1]}`)
    }
  }
  for (const alias of DIRECT_ALIASES[slug] ?? []) direct.add(norm(alias))

  const related = new Set((RELATED_ALIASES[slug] ?? []).map(norm))
  return { direct: [...direct].filter((v) => v.length >= 3), related: [...related].filter((v) => v.length >= 3) }
}

function mentioned(haystack, phrase) {
  const h = ` ${norm(haystack)} `
  const p = ` ${norm(phrase)} `
  return Boolean(phrase) && h.includes(p)
}

function hasInterventionSignal(value) {
  return INTERVENTION_PATTERNS.some((pattern) => pattern.test(value))
}

function parseAbstracts(xml) {
  const out = {}
  const blocks = xml.match(/<Pubmed(?:Article|BookArticle)\b[\s\S]*?<\/Pubmed(?:Article|BookArticle)>/g) ?? []
  for (const block of blocks) {
    const pmid = block.match(/<PMID\b[^>]*>(\d+)<\/PMID>/)?.[1]
    if (!pmid) continue
    const parts = [...block.matchAll(/<AbstractText\b[^>]*>([\s\S]*?)<\/AbstractText>/g)]
      .map((match) => decodeXml(match[1])).filter(Boolean)
    if (parts.length) out[pmid] = parts.join(' ')
  }
  return out
}

async function fetchCandidateAbstracts(pmids) {
  const out = {}
  const ids = [...new Set(pmids)].filter(Boolean)
  for (let i = 0; i < ids.length; i += BATCH) {
    const batch = ids.slice(i, i + BATCH)
    const url = `${EFETCH}?db=pubmed&retmode=xml&id=${batch.join(',')}`
    const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
    if (response.ok) Object.assign(out, parseAbstracts(await response.text()))
    if (i + BATCH < ids.length) await sleep(SLEEP_MS)
  }
  return out
}

function isSageDrugCollision(slug, semanticText) {
  if (slug !== 'sage') return false
  const n = norm(semanticText)
  return (/\bsage 718\b/.test(n) || /\bsage therapeutics\b/.test(n)) && !/\bsalvia\b/.test(n)
}

function reclassifySource(row, record, abstract) {
  if (!row.pmid || row.classification === 'UNRESOLVED_PMID' || row.classification === 'NON_PMID_SOURCE') return row.classification
  const semanticText = `${row.liveTitle ?? ''} ${abstract ?? ''}`
  if (isSageDrugCollision(row.profile, semanticText)) return 'AMBIGUOUS_NAME_COLLISION'

  const identities = identitySets(record, row.profile)
  const directHits = identities.direct.filter((phrase) => mentioned(semanticText, phrase))
  const relatedHits = identities.related.filter((phrase) => mentioned(semanticText, phrase))
  if (directHits.length && hasInterventionSignal(semanticText)) return 'ENTITY_INTERVENTION_SIGNAL'
  if (directHits.length) return 'ENTITY_MENTION_ONLY'
  if (relatedHits.length) return 'RELATED_ENTITY_OR_FORMULATION_SIGNAL'
  return row.classification
}

function counts(rows) {
  return rows.reduce((acc, row) => {
    acc[row.classification] = (acc[row.classification] ?? 0) + 1
    return acc
  }, {})
}

async function main() {
  console.log('[precision-pass] Running exhaustive first pass...')
  const child = spawnSync(process.execPath, ['scripts/audit/full-citation-semantic-audit.mjs'], {
    cwd: ROOT,
    stdio: 'inherit',
    env: process.env,
  })
  if (!fs.existsSync(REPORT_PATH)) throw new Error(`First pass did not produce ${REPORT_PATH}`)
  if (child.error) throw child.error

  const report = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf8'))
  const profiles = loadProfiles()
  const candidates = report.sourceAssessments.filter((row) => row.classification === 'NO_ENTITY_SIGNAL')
  const abstracts = await fetchCandidateAbstracts(candidates.map((row) => row.pmid))

  const refinedByKey = new Map()
  for (const row of report.sourceAssessments) {
    const record = profiles.get(row.profile)
    const refined = record ? reclassifySource(row, record, abstracts[row.pmid]) : row.classification
    row.firstPassClassification = row.classification
    row.classification = refined
    refinedByKey.set(`${row.profile}::${row.sourceId}::${row.pmid}`, refined)
  }

  const knownBad = new Set([
    'melatonin::20091037','melatonin::25128263','melatonin::12467979','taurine::20386132',
    'coq10::25174896','alpha-gpc::14767959','berberine::25676062','berberine::21346706',
    'magnesium::31654344','sage::40302443',
  ])

  for (const row of report.claimEdgeAssessments) {
    if (!row.pmid) continue
    const sourceClass = refinedByKey.get(`${row.profile}::${row.sourceRefId}::${row.pmid}`) ?? row.sourceClassification
    row.firstPassSourceClassification = row.sourceClassification
    row.sourceClassification = sourceClass

    const key = `${row.profile}::${row.pmid}`
    if (knownBad.has(key)) {
      row.classification = 'CONFIRMED_KNOWN_MISMATCH'
      continue
    }
    if (sourceClass === 'AMBIGUOUS_NAME_COLLISION' || sourceClass === 'NO_ENTITY_SIGNAL') {
      row.classification = 'HIGH_RISK_ENTITY_MISMATCH_CANDIDATE'
    } else if (row.classification === 'HIGH_RISK_ENTITY_MISMATCH_CANDIDATE') {
      row.classification = sourceClass === 'RELATED_ENTITY_OR_FORMULATION_SIGNAL'
        ? 'FORMULATION_OR_RELATED_ENTITY_REVIEW'
        : 'PLAUSIBLE_ENTITY_REQUIRES_CLAIM_REVIEW'
    }
  }

  let regressionFailures = 0
  for (const check of report.regressionChecks) {
    if (check.type === 'known-bad') {
      const hits = report.sourceAssessments.filter((row) => row.profile === check.profile && row.pmid === check.pmid)
      check.classifications = hits.map((row) => row.classification)
      check.passed = !hits.length || hits.every((row) => ['NO_ENTITY_SIGNAL', 'UNRESOLVED_PMID', 'AMBIGUOUS_NAME_COLLISION'].includes(row.classification))
    } else {
      const hits = report.sourceAssessments.filter((row) => row.profile === check.profile && row.pmid === check.pmid)
      check.classifications = hits.map((row) => row.classification)
      check.passed = !hits.length || hits.every((row) => !['NO_ENTITY_SIGNAL', 'UNRESOLVED_PMID', 'AMBIGUOUS_NAME_COLLISION'].includes(row.classification))
    }
    if (!check.passed) regressionFailures += 1
  }

  const riskClasses = new Set(['CONFIRMED_KNOWN_MISMATCH','HIGH_RISK_ENTITY_MISMATCH_CANDIDATE','CLAIM_DOMAIN_MISMATCH_CANDIDATE','UNRESOLVED_SOURCE'])
  const highRisk = report.claimEdgeAssessments.filter((row) => riskClasses.has(row.classification))
  report.precisionPass = {
    applied: true,
    candidateAbstractsRequested: candidates.length,
    candidateAbstractsResolved: Object.keys(abstracts).length,
    synonymPolicy: 'dynamic meaningful-token/scientific-abbreviation normalization plus conservative curated equivalences; no automatic deletion',
  }
  report.summary.sourceClassifications = counts(report.sourceAssessments)
  report.summary.claimEdgeClassifications = counts(report.claimEdgeAssessments)
  report.summary.publicClaimEdgeClassifications = counts(report.claimEdgeAssessments.filter((row) => row.public))
  report.summary.highRiskClaimEdges = highRisk.length
  report.summary.publicHighRiskClaimEdges = highRisk.filter((row) => row.public).length
  report.summary.regressionFailures = regressionFailures
  report.highRiskClaimEdges = highRisk
  fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`)

  console.log('\nPrecision-pass summary')
  console.log('='.repeat(76))
  console.log(`Candidate abstracts rechecked: ${Object.keys(abstracts).length}/${candidates.length}`)
  console.log(`High-risk claim edges: ${report.summary.highRiskClaimEdges}`)
  console.log(`Public high-risk claim edges: ${report.summary.publicHighRiskClaimEdges}`)
  console.log(`Regression failures: ${regressionFailures}`)
  console.log('Source classifications:', JSON.stringify(report.summary.sourceClassifications))
  console.log('Claim-edge classifications:', JSON.stringify(report.summary.claimEdgeClassifications))
  console.log('\nPublic high-risk edges after precision pass:')
  for (const row of highRisk.filter((r) => r.public).slice(0, 100)) {
    console.log(`  ${row.classification.padEnd(36)} ${row.profile.padEnd(28)} PMID ${String(row.pmid ?? '-').padEnd(9)} ${text(row.liveTitle).slice(0, 105)}`)
    console.log(`    claim: ${text(row.claim).slice(0, 160)}`)
  }

  if (regressionFailures) process.exit(1)
}

main().catch((error) => {
  console.error(`[precision-pass] ${error.stack || error.message}`)
  process.exit(1)
})
