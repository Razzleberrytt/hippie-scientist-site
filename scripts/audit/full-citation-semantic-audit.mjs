#!/usr/bin/env node
/**
 * Corpus-wide PubMed semantic citation audit.
 *
 * This is intentionally READ-ONLY with respect to canonical/public data. It:
 *   1. enumerates every herb/compound source and every claim -> source edge,
 *      regardless of claim reviewStatus;
 *   2. resolves every cited PMID against live PubMed ESummary;
 *   3. fetches PubMed abstracts via EFetch when available;
 *   4. compares stored bibliographic identity to live PubMed identity;
 *   5. screens entity/intervention and claim-domain alignment;
 *   6. preserves uncertain cases for manual review instead of auto-removing them.
 *
 * Output: ops/reports/full-citation-semantic-audit.json
 */

import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const DATA_DIR = path.join(ROOT, 'public', 'data')
const REPORT_PATH = path.join(ROOT, 'ops', 'reports', 'full-citation-semantic-audit.json')
const ESUMMARY = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi'
const EFETCH = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi'
const USER_AGENT = 'thehippiescientist.net full semantic citation audit/1.0'
const REQUEST_SPACING_MS = 400
const SUMMARY_BATCH = 150
const ABSTRACT_BATCH = 80
const PMID_PATTERN = /^[1-9]\d{0,8}$/

const DOMAIN_PATTERNS = {
  sleep: [/\bsleep/i, /insomnia/i, /sleep onset/i, /sleep quality/i],
  circadian: [/circadian/i, /chronobiolog/i, /jet lag/i, /shift work/i, /phase shift/i, /\brhythm/i],
  stress: [/\bstress/i, /cortisol/i],
  anxiety: [/anxi/i],
  depression: [/depress/i, /mood disorder/i],
  cognition: [/cognit/i, /memory/i, /attention/i, /executive function/i],
  exercise: [/exercise/i, /athletic/i, /performance/i, /strength/i, /muscle/i, /soreness/i],
  lipids: [/cholesterol/i, /triglyceride/i, /\blipid/i],
  glucose: [/glucose/i, /glycemi/i, /diabet/i, /insulin/i],
  bloodPressure: [/blood pressure/i, /hypertension/i, /systolic/i, /diastolic/i],
  liver: [/\bliver/i, /hepatic/i, /hepatotox/i],
  inflammation: [/inflamm/i, /cytokine/i],
  pain: [/\bpain/i, /analgesi/i],
  fertility: [/fertil/i, /sperm/i, /reproduct/i],
  thyroid: [/thyroid/i, /thyrotox/i],
  weight: [/body weight/i, /obes/i, /body mass/i, /weight loss/i],
  safety: [/safety/i, /adverse/i, /toxicit/i, /tolerab/i, /side effect/i, /injur/i],
  interaction: [/interaction/i, /cytochrome p450/i, /\bcyp\d/i, /drug[- ]herb/i, /herb[- ]drug/i],
  pregnancy: [/pregnan/i, /maternal/i, /fetal/i, /foetal/i, /lactat/i, /breast[- ]?feed/i],
}

const INTERVENTION_PATTERNS = [
  /supplement/i, /administr/i, /randomi[sz]/i, /placebo/i, /controlled trial/i,
  /clinical trial/i, /intervention/i, /\bextract/i, /\bdose/i, /\bdosing/i,
  /\bintake/i, /ingest/i, /\boral/i, /treated with/i, /treatment with/i,
  /meta-analysis/i, /systematic review/i, /efficacy/i,
]

const STOPWORDS = new Set([
  'a','an','and','are','as','at','be','by','for','from','in','is','of','on','or','the','to','with',
  'study','studies','effect','effects','review','analysis','trial','randomized','randomised','clinical',
])

const KNOWN_BAD = [
  ['melatonin', '20091037'],
  ['melatonin', '25128263'],
  ['melatonin', '12467979'],
  ['taurine', '20386132'],
  ['coq10', '25174896'],
  ['alpha-gpc', '14767959'],
  ['berberine', '25676062'],
  ['berberine', '21346706'],
  ['magnesium', '31654344'],
  ['sage', '40302443'],
]

const KNOWN_GOOD = [
  ['melatonin', '23691095'],
  ['melatonin', '38888087'],
  ['melatonin', '34923676'],
]

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const text = (value) => String(value ?? '').replace(/\s+/g, ' ').trim()
const norm = (value) => text(value)
  .toLowerCase()
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()

function decodeXml(value) {
  return String(value ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/\s+/g, ' ')
    .trim()
}

function asStrings(value) {
  if (Array.isArray(value)) return value.flatMap(asStrings)
  if (typeof value === 'string' || typeof value === 'number') return [String(value)]
  if (value && typeof value === 'object') {
    return [value.name, value.slug, value.scientific, value.common, value.label].flatMap(asStrings)
  }
  return []
}

function extractPmids(value) {
  const raw = text(value)
  if (!raw) return []
  const exact = raw.match(/^\d{1,9}$/) ? [raw] : (raw.match(/\b[1-9]\d{0,8}\b/g) ?? [])
  return [...new Set(exact.filter((id) => PMID_PATTERN.test(id)))]
}

function titleTokens(value) {
  return new Set(norm(value).split(' ').filter((token) => token.length > 2 && !STOPWORDS.has(token)))
}

function jaccard(a, b) {
  const left = titleTokens(a)
  const right = titleTokens(b)
  if (!left.size || !right.size) return null
  const intersection = [...left].filter((token) => right.has(token)).length
  const union = new Set([...left, ...right]).size
  return union ? intersection / union : null
}

function normalizeDoi(value) {
  return text(value).toLowerCase().replace(/^https?:\/\/(?:dx\.)?doi\.org\//, '').replace(/[\s.]+$/, '')
}

function detectDomains(value) {
  return Object.entries(DOMAIN_PATTERNS)
    .filter(([, patterns]) => patterns.some((pattern) => pattern.test(value)))
    .map(([domain]) => domain)
}

function intersects(a, b) {
  const right = new Set(b)
  return a.some((value) => right.has(value))
}

function isPublicProfile(record) {
  const status = text(record.indexability_status).toUpperCase()
  const robots = text(record.robots).toLowerCase()
  return status === 'PUBLISH'
    || record.sitemap_included === true
    || /^index(?:,|$)/.test(robots)
    || record?.governance?.indexingAllowed === true
}

function identityPhrases(record, slug) {
  const direct = [
    record.name,
    record.scientific,
    record.scientificName,
    record.common,
    record.commonName,
    ...(Array.isArray(record.aliases) ? record.aliases : []),
    slug.replace(/-/g, ' '),
  ].flatMap(asStrings).map(norm).filter((value) => value.length >= 3)

  const constituents = (Array.isArray(record.activeCompounds) ? record.activeCompounds : [])
    .flatMap(asStrings).map(norm).filter((value) => value.length >= 3)

  return {
    direct: [...new Set(direct)],
    constituents: [...new Set(constituents)],
  }
}

function phraseMentioned(haystack, phrase) {
  if (!phrase) return false
  const h = ` ${norm(haystack)} `
  const p = ` ${norm(phrase)} `
  return h.includes(p)
}

function interventionSignal(value) {
  return INTERVENTION_PATTERNS.some((pattern) => pattern.test(value))
}

function loadProfiles() {
  const profiles = []
  for (const [kind, dir] of [['herb', 'herbs-detail'], ['compound', 'compounds-detail']]) {
    const full = path.join(DATA_DIR, dir)
    if (!fs.existsSync(full)) continue
    for (const file of fs.readdirSync(full)) {
      if (!file.endsWith('.json')) continue
      const filePath = path.join(full, file)
      const record = JSON.parse(fs.readFileSync(filePath, 'utf8'))
      const slug = text(record.slug) || file.replace(/\.json$/, '')
      profiles.push({
        kind,
        slug,
        file: path.relative(ROOT, filePath),
        name: text(record.name),
        public: isPublicProfile(record),
        identities: identityPhrases(record, slug),
        record,
      })
    }
  }
  return profiles
}

function collectCitationGraph(profiles) {
  const sources = []
  const claimEdges = []
  const brokenClaimRefs = []
  const pmids = new Set()

  for (const profile of profiles) {
    const sourceList = Array.isArray(profile.record.sources) ? profile.record.sources : []
    const byId = new Map(sourceList.map((source) => [text(source.id), source]).filter(([id]) => id))

    for (const source of sourceList) {
      const sourcePmids = extractPmids(source.pmid ?? source.pubmedId)
      sourcePmids.forEach((pmid) => pmids.add(pmid))
      sources.push({ profile, source, pmids: sourcePmids })
    }

    for (const claim of Array.isArray(profile.record.claimMap) ? profile.record.claimMap : []) {
      const refs = Array.isArray(claim.sourceRefIds) ? [...new Set(claim.sourceRefIds.map(text).filter(Boolean))] : []
      for (const sourceRefId of refs) {
        const source = byId.get(sourceRefId)
        if (!source) {
          brokenClaimRefs.push({
            profile: profile.slug,
            public: profile.public,
            claimId: text(claim.id),
            claim: text(claim.claim),
            claimReviewStatus: text(claim.reviewStatus),
            sourceRefId,
          })
          continue
        }
        claimEdges.push({ profile, claim, source, sourceRefId, pmids: extractPmids(source.pmid ?? source.pubmedId) })
      }
    }
  }

  return { sources, claimEdges, brokenClaimRefs, pmids: [...pmids].sort((a, b) => Number(a) - Number(b)) }
}

function extractDoi(entry) {
  const ids = Array.isArray(entry.articleids) ? entry.articleids : []
  const doi = ids.find((id) => id.idtype === 'doi')
  return doi ? text(doi.value) : ''
}

async function fetchWithRetry(url, attempts = 3) {
  let lastError
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return response
    } catch (error) {
      lastError = error
      if (attempt < attempts) await sleep(800 * attempt)
    }
  }
  throw lastError
}

async function fetchSummaries(pmids) {
  const records = {}
  const unresolved = []
  for (let index = 0; index < pmids.length; index += SUMMARY_BATCH) {
    const batch = pmids.slice(index, index + SUMMARY_BATCH)
    const url = `${ESUMMARY}?db=pubmed&retmode=json&id=${batch.join(',')}`
    process.stdout.write(`[semantic-audit] PubMed summary ${index + 1}-${Math.min(index + batch.length, pmids.length)} / ${pmids.length} ... `)
    try {
      const response = await fetchWithRetry(url)
      const payload = await response.json()
      for (const pmid of batch) {
        const entry = payload?.result?.[pmid]
        if (!entry || entry.error) {
          unresolved.push({ pmid, reason: text(entry?.error) || 'not returned by PubMed ESummary' })
          continue
        }
        records[pmid] = {
          pmid,
          title: decodeXml(entry.title ?? ''),
          journal: text(entry.source),
          pubdate: text(entry.pubdate),
          doi: extractDoi(entry),
          publicationTypes: Array.isArray(entry.pubtype) ? entry.pubtype.map(String) : [],
          abstract: '',
        }
      }
      console.log(`${batch.filter((pmid) => records[pmid]).length} resolved`)
    } catch (error) {
      console.log(`FAILED: ${error.message}`)
      unresolved.push(...batch.map((pmid) => ({ pmid, reason: `summary fetch failed: ${error.message}` })))
    }
    if (index + SUMMARY_BATCH < pmids.length) await sleep(REQUEST_SPACING_MS)
  }
  return { records, unresolved }
}

function parseAbstractXml(xml) {
  const abstracts = {}
  const blocks = xml.match(/<Pubmed(?:Article|BookArticle)\b[\s\S]*?<\/Pubmed(?:Article|BookArticle)>/g) ?? []
  for (const block of blocks) {
    const pmid = block.match(/<PMID\b[^>]*>(\d+)<\/PMID>/)?.[1]
    if (!pmid) continue
    const parts = [...block.matchAll(/<AbstractText\b([^>]*)>([\s\S]*?)<\/AbstractText>/g)]
      .map((match) => {
        const label = match[1].match(/Label="([^"]+)"/)?.[1]
        const body = decodeXml(match[2])
        return body ? `${label ? `${label}: ` : ''}${body}` : ''
      })
      .filter(Boolean)
    if (parts.length) abstracts[pmid] = parts.join(' ')
  }
  return abstracts
}

async function fetchAbstracts(pmids, records) {
  let fetched = 0
  for (let index = 0; index < pmids.length; index += ABSTRACT_BATCH) {
    const batch = pmids.slice(index, index + ABSTRACT_BATCH).filter((pmid) => records[pmid])
    if (!batch.length) continue
    const url = `${EFETCH}?db=pubmed&retmode=xml&id=${batch.join(',')}`
    process.stdout.write(`[semantic-audit] PubMed abstracts ${index + 1}-${Math.min(index + ABSTRACT_BATCH, pmids.length)} / ${pmids.length} ... `)
    try {
      const response = await fetchWithRetry(url)
      const xml = await response.text()
      const abstracts = parseAbstractXml(xml)
      for (const [pmid, abstract] of Object.entries(abstracts)) {
        records[pmid].abstract = abstract
        fetched += 1
      }
      console.log(`${Object.keys(abstracts).length} abstracts`)
    } catch (error) {
      console.log(`FAILED: ${error.message}`)
    }
    if (index + ABSTRACT_BATCH < pmids.length) await sleep(REQUEST_SPACING_MS)
  }
  return fetched
}

function sourceSemanticAssessment(profile, source, pmid, live) {
  const storedTitle = text(source.title)
  const storedDoi = normalizeDoi(source.doi)
  const liveTitle = text(live?.title)
  const liveDoi = normalizeDoi(live?.doi)
  const semanticText = [liveTitle, live?.abstract].filter(Boolean).join(' · ')
  const directHits = profile.identities.direct.filter((phrase) => phraseMentioned(semanticText, phrase))
  const constituentHits = profile.identities.constituents.filter((phrase) => phraseMentioned(semanticText, phrase))
  const hasInterventionSignal = interventionSignal(semanticText)
  const titleSimilarity = storedTitle && liveTitle ? jaccard(storedTitle, liveTitle) : null
  const titleMismatch = titleSimilarity !== null && titleSimilarity < 0.28
  const doiMismatch = Boolean(storedDoi && liveDoi && storedDoi !== liveDoi)

  let classification
  if (!live) classification = 'UNRESOLVED_PMID'
  else if (directHits.length && hasInterventionSignal) classification = 'ENTITY_INTERVENTION_SIGNAL'
  else if (directHits.length) classification = 'ENTITY_MENTION_ONLY'
  else if (constituentHits.length) classification = 'CONSTITUENT_OR_FORMULATION_SIGNAL'
  else if (liveTitle || live.abstract) classification = 'NO_ENTITY_SIGNAL'
  else classification = 'INSUFFICIENT_METADATA'

  return {
    classification,
    pmid,
    directIdentityHits: directHits,
    constituentHits,
    interventionSignal: hasInterventionSignal,
    liveTitle: liveTitle || null,
    liveDoi: liveDoi || null,
    hasAbstract: Boolean(live?.abstract),
    storedTitle: storedTitle || null,
    storedDoi: storedDoi || null,
    titleSimilarity: titleSimilarity === null ? null : Number(titleSimilarity.toFixed(3)),
    storedMetadataMismatch: titleMismatch || doiMismatch,
    titleMismatch,
    doiMismatch,
  }
}

function claimText(claim) {
  return [
    claim.claim,
    claim.notes,
    claim.predicate,
    claim?.qualifiers?.population,
    claim?.qualifiers?.direction,
  ].map(text).filter(Boolean).join(' · ')
}

function classifyClaimEdge(edge, sourceAssessment, live) {
  const cText = claimText(edge.claim)
  const sText = [live?.title, live?.abstract].map(text).filter(Boolean).join(' · ')
  const claimDomains = detectDomains(cText)
  const sourceDomains = detectDomains(sText)
  const domainComparable = claimDomains.length > 0 && sourceDomains.length > 0
  const domainOverlap = domainComparable && intersects(claimDomains, sourceDomains)

  let classification = 'MANUAL_REVIEW'
  const reasons = []

  if (!sourceAssessment || sourceAssessment.classification === 'UNRESOLVED_PMID') {
    classification = 'UNRESOLVED_SOURCE'
    reasons.push('PMID did not resolve to live PubMed metadata')
  } else if (sourceAssessment.classification === 'NO_ENTITY_SIGNAL') {
    classification = 'HIGH_RISK_ENTITY_MISMATCH_CANDIDATE'
    reasons.push('target entity/alias/constituent is absent from available PubMed title+abstract metadata')
  } else if (domainComparable && !domainOverlap) {
    classification = 'CLAIM_DOMAIN_MISMATCH_CANDIDATE'
    reasons.push(`claim domains (${claimDomains.join(', ')}) are disjoint from explicit source domains (${sourceDomains.join(', ')})`)
  } else if (sourceAssessment.classification === 'ENTITY_INTERVENTION_SIGNAL' && domainOverlap) {
    classification = 'ALIGNED_SCREEN'
    reasons.push('entity/intervention signal and at least one explicit claim domain align')
  } else if (sourceAssessment.classification === 'ENTITY_INTERVENTION_SIGNAL') {
    classification = 'PLAUSIBLE_ENTITY_REQUIRES_CLAIM_REVIEW'
    reasons.push('entity/intervention signal is present but claim-domain alignment is not fully machine-assessable')
  } else if (sourceAssessment.classification === 'ENTITY_MENTION_ONLY') {
    reasons.push('entity is mentioned but intervention role is not established from title/abstract metadata')
  } else if (sourceAssessment.classification === 'CONSTITUENT_OR_FORMULATION_SIGNAL') {
    reasons.push('support may be indirect or formulation/constituent-specific')
  } else {
    reasons.push('metadata is insufficient for a reliable semantic decision')
  }

  return {
    classification,
    claimDomains,
    sourceDomains,
    reasons,
  }
}

function byRisk(a, b) {
  const rank = {
    CONFIRMED_KNOWN_MISMATCH: 0,
    HIGH_RISK_ENTITY_MISMATCH_CANDIDATE: 1,
    CLAIM_DOMAIN_MISMATCH_CANDIDATE: 2,
    UNRESOLVED_SOURCE: 3,
    MANUAL_REVIEW: 4,
    PLAUSIBLE_ENTITY_REQUIRES_CLAIM_REVIEW: 5,
    ALIGNED_SCREEN: 6,
  }
  return Number(b.public) - Number(a.public)
    || (rank[a.classification] ?? 99) - (rank[b.classification] ?? 99)
    || a.profile.localeCompare(b.profile)
}

async function main() {
  const profiles = loadProfiles()
  const graph = collectCitationGraph(profiles)
  console.log('\nFull citation semantic audit')
  console.log('='.repeat(76))
  console.log(`Profiles: ${profiles.length}`)
  console.log(`Source records: ${graph.sources.length}`)
  console.log(`Claim -> source edges: ${graph.claimEdges.length}`)
  console.log(`Unique PMIDs: ${graph.pmids.length}`)

  const { records: live, unresolved } = await fetchSummaries(graph.pmids)
  const abstractsFetched = await fetchAbstracts(graph.pmids, live)

  const sourceAssessments = []
  const sourceKey = new Map()
  for (const entry of graph.sources) {
    if (!entry.pmids.length) {
      sourceAssessments.push({
        profile: entry.profile.slug,
        profileName: entry.profile.name,
        public: entry.profile.public,
        kind: entry.profile.kind,
        sourceId: text(entry.source.id),
        classification: 'NON_PMID_SOURCE',
        pmid: null,
        storedTitle: text(entry.source.title) || null,
        doi: text(entry.source.doi) || null,
        url: text(entry.source.url) || null,
      })
      continue
    }
    for (const pmid of entry.pmids) {
      const assessment = sourceSemanticAssessment(entry.profile, entry.source, pmid, live[pmid])
      const row = {
        profile: entry.profile.slug,
        profileName: entry.profile.name,
        public: entry.profile.public,
        kind: entry.profile.kind,
        sourceId: text(entry.source.id),
        ...assessment,
      }
      sourceAssessments.push(row)
      sourceKey.set(`${entry.profile.slug}::${text(entry.source.id)}::${pmid}`, row)
    }
  }

  const knownBadSet = new Set(KNOWN_BAD.map(([slug, pmid]) => `${slug}::${pmid}`))
  const claimEdgeAssessments = []
  for (const edge of graph.claimEdges) {
    if (!edge.pmids.length) {
      claimEdgeAssessments.push({
        profile: edge.profile.slug,
        profileName: edge.profile.name,
        public: edge.profile.public,
        kind: edge.profile.kind,
        claimId: text(edge.claim.id),
        claim: text(edge.claim.claim),
        predicate: text(edge.claim.predicate),
        claimReviewStatus: text(edge.claim.reviewStatus) || null,
        sourceRefId: edge.sourceRefId,
        pmid: null,
        classification: 'NON_PMID_EDGE',
        reasons: ['linked source has no PMID; DOI/URL semantic verification requires a separate resolver'],
      })
      continue
    }

    for (const pmid of edge.pmids) {
      const sourceAssessment = sourceKey.get(`${edge.profile.slug}::${edge.sourceRefId}::${pmid}`)
      const assessment = classifyClaimEdge(edge, sourceAssessment, live[pmid])
      const knownBad = knownBadSet.has(`${edge.profile.slug}::${pmid}`)
      claimEdgeAssessments.push({
        profile: edge.profile.slug,
        profileName: edge.profile.name,
        public: edge.profile.public,
        kind: edge.profile.kind,
        claimId: text(edge.claim.id),
        claim: text(edge.claim.claim),
        predicate: text(edge.claim.predicate),
        claimReviewStatus: text(edge.claim.reviewStatus) || null,
        sourceRefId: edge.sourceRefId,
        pmid,
        liveTitle: live[pmid]?.title ?? null,
        sourceClassification: sourceAssessment?.classification ?? 'UNKNOWN',
        classification: knownBad ? 'CONFIRMED_KNOWN_MISMATCH' : assessment.classification,
        claimDomains: assessment.claimDomains,
        sourceDomains: assessment.sourceDomains,
        reasons: knownBad ? ['independently confirmed semantic mismatch retained as a regression control', ...assessment.reasons] : assessment.reasons,
      })
    }
  }

  const regressionChecks = []
  let regressionFailures = 0
  for (const [slug, pmid] of KNOWN_BAD) {
    const present = sourceAssessments.filter((row) => row.profile === slug && row.pmid === pmid)
    if (!present.length) {
      regressionChecks.push({ type: 'known-bad', profile: slug, pmid, passed: true, status: 'not present in current corpus (already absent or renamed)' })
      continue
    }
    const passed = present.every((row) => ['NO_ENTITY_SIGNAL', 'UNRESOLVED_PMID'].includes(row.classification))
    if (!passed) regressionFailures += 1
    regressionChecks.push({ type: 'known-bad', profile: slug, pmid, passed, classifications: present.map((row) => row.classification) })
  }
  for (const [slug, pmid] of KNOWN_GOOD) {
    const present = sourceAssessments.filter((row) => row.profile === slug && row.pmid === pmid)
    if (!present.length) {
      regressionChecks.push({ type: 'known-good', profile: slug, pmid, passed: true, status: 'not present in current corpus' })
      continue
    }
    const passed = present.every((row) => row.classification !== 'NO_ENTITY_SIGNAL' && row.classification !== 'UNRESOLVED_PMID')
    if (!passed) regressionFailures += 1
    regressionChecks.push({ type: 'known-good', profile: slug, pmid, passed, classifications: present.map((row) => row.classification) })
  }

  const classificationCounts = (rows) => rows.reduce((acc, row) => {
    acc[row.classification] = (acc[row.classification] ?? 0) + 1
    return acc
  }, {})

  const publicEdges = claimEdgeAssessments.filter((row) => row.public)
  const highRiskEdges = claimEdgeAssessments
    .filter((row) => ['CONFIRMED_KNOWN_MISMATCH', 'HIGH_RISK_ENTITY_MISMATCH_CANDIDATE', 'CLAIM_DOMAIN_MISMATCH_CANDIDATE', 'UNRESOLVED_SOURCE'].includes(row.classification))
    .sort(byRisk)
  const metadataMismatches = sourceAssessments.filter((row) => row.storedMetadataMismatch)

  const pmidProfileUse = new Map()
  for (const row of sourceAssessments.filter((row) => row.pmid)) {
    if (!pmidProfileUse.has(row.pmid)) pmidProfileUse.set(row.pmid, new Set())
    pmidProfileUse.get(row.pmid).add(row.profile)
  }
  const reusedPmids = [...pmidProfileUse.entries()]
    .filter(([, slugs]) => slugs.size > 1)
    .map(([pmid, slugs]) => ({ pmid, profiles: [...slugs].sort() }))
    .sort((a, b) => b.profiles.length - a.profiles.length || a.pmid.localeCompare(b.pmid))

  const report = {
    auditVersion: 1,
    generatedAt: new Date().toISOString(),
    commit: process.env.GITHUB_SHA || null,
    policy: {
      mutation: 'read-only',
      scope: 'every herb/compound source and every claim->source edge, independent of reviewStatus',
      semanticRule: 'machine screening is triage, not automatic scientific adjudication; uncertain cases remain manual review',
      highRiskRule: 'absence of target identity from available PubMed title+abstract is a high-risk candidate, not automatic deletion unless independently confirmed',
    },
    summary: {
      profiles: profiles.length,
      publicProfiles: profiles.filter((profile) => profile.public).length,
      sourceRecords: graph.sources.length,
      sourceAssessments: sourceAssessments.length,
      claimSourceEdges: graph.claimEdges.length,
      claimEdgeAssessments: claimEdgeAssessments.length,
      publicClaimEdgeAssessments: publicEdges.length,
      brokenClaimSourceRefs: graph.brokenClaimRefs.length,
      uniquePmids: graph.pmids.length,
      livePubmedResolved: Object.keys(live).length,
      livePubmedUnresolved: unresolved.length,
      abstractsFetched,
      metadataMismatches: metadataMismatches.length,
      reusedPmidsAcrossProfiles: reusedPmids.length,
      sourceClassifications: classificationCounts(sourceAssessments),
      claimEdgeClassifications: classificationCounts(claimEdgeAssessments),
      publicClaimEdgeClassifications: classificationCounts(publicEdges),
      highRiskClaimEdges: highRiskEdges.length,
      publicHighRiskClaimEdges: highRiskEdges.filter((row) => row.public).length,
      regressionFailures,
    },
    regressionChecks,
    unresolvedPmids: unresolved,
    brokenClaimSourceRefs: graph.brokenClaimRefs,
    metadataMismatches,
    highRiskClaimEdges: highRiskEdges,
    sourceAssessments,
    claimEdgeAssessments: claimEdgeAssessments.sort(byRisk),
    reusedPmidsAcrossProfiles: reusedPmids,
  }

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true })
  fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8')

  console.log('\nAudit summary')
  console.log('-'.repeat(76))
  for (const [key, value] of Object.entries(report.summary)) {
    if (typeof value !== 'object') console.log(`${key.padEnd(34)} ${value}`)
  }
  console.log('\nSource classifications:', JSON.stringify(report.summary.sourceClassifications))
  console.log('Claim-edge classifications:', JSON.stringify(report.summary.claimEdgeClassifications))
  console.log('\nTop public high-risk claim edges')
  for (const row of highRiskEdges.filter((entry) => entry.public).slice(0, 75)) {
    console.log(`  ${row.classification.padEnd(36)} ${row.profile.padEnd(28)} PMID ${String(row.pmid ?? '-').padEnd(9)} ${text(row.liveTitle).slice(0, 100)}`)
    console.log(`    claim: ${text(row.claim).slice(0, 150)}`)
  }
  console.log(`\nReport: ${path.relative(ROOT, REPORT_PATH)}`)

  if (regressionFailures) {
    console.error(`\n[semantic-audit] FAILED — ${regressionFailures} known regression control(s) were misclassified; audit logic is not trustworthy enough.`)
    process.exit(1)
  }
}

main().catch((error) => {
  console.error(`[semantic-audit] ${error.stack || error.message}`)
  process.exit(1)
})
