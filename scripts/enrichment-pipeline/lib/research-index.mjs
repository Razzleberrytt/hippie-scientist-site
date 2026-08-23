import fs from 'node:fs'
import path from 'node:path'
import { assertPipelineWritePath, researchIndexPath, relative } from './paths.mjs'
import { sourceIdentity } from './source-identity.mjs'
import {
  normalizeDoi,
  normalizePmid,
  normalizeStudyType,
  normalizeTitleKey,
  normalizeUrl,
  normalizeYear,
  normalizePunctuation,
} from './normalize.mjs'

/**
 * Local research index.
 *
 * Everything the site already cites lives in Source_Register and
 * Evidence_Register. Before a worker goes looking for new literature it should
 * search here, because a source already in the workbook comes with settled
 * identity, metadata, and entity linkage.
 *
 * Matching is intentionally strict. `lookup` resolves only by stable identifier
 * (DOI, PMID, PMCID, canonical URL, or title+year+author). Topic and entity
 * context is exposed separately through `forEntity` / `forTopic` as *candidate
 * leads a worker must still verify* — it is never used to declare two records
 * the same source. Keyword overlap alone can never attach a source to a claim.
 */

export function buildResearchIndex(canonical) {
  const records = new Map()

  const upsert = (raw, origin) => {
    const identity = sourceIdentity(raw)
    if (identity.kind === 'none') return null
    const existing = records.get(identity.key)
    const record = existing || {
      key: identity.key,
      identity_kind: identity.kind,
      doi: normalizeDoi(raw.doi),
      pmid: normalizePmid(raw.pmid),
      url: normalizeUrl(raw.url),
      title: normalizePunctuation(raw.title),
      title_key: normalizeTitleKey(raw.title),
      year: normalizeYear(raw.year),
      journal: normalizePunctuation(raw.journal),
      authors: normalizePunctuation(raw.authors),
      study_type: normalizeStudyType(raw.study_type),
      entity_slugs: [],
      topics: [],
      origins: [],
      workbook_ids: [],
    }

    for (const field of ['doi', 'pmid', 'url', 'title', 'journal', 'authors']) {
      if (!record[field] && raw[field]) record[field] = normalizePunctuation(raw[field])
    }
    if (!record.year && raw.year) record.year = normalizeYear(raw.year)
    if ((!record.study_type || record.study_type === 'unclassified') && raw.study_type) {
      record.study_type = normalizeStudyType(raw.study_type)
    }
    if (!record.title_key && record.title) record.title_key = normalizeTitleKey(record.title)

    for (const slug of raw.entity_slugs || []) {
      const clean = String(slug).trim().toLowerCase()
      if (clean && !record.entity_slugs.includes(clean)) record.entity_slugs.push(clean)
    }
    for (const topic of raw.topics || []) {
      const clean = String(topic).trim().toLowerCase()
      if (clean && !record.topics.includes(clean)) record.topics.push(clean)
    }
    if (raw.workbook_id && !record.workbook_ids.includes(raw.workbook_id)) {
      record.workbook_ids.push(raw.workbook_id)
    }
    if (!record.origins.includes(origin)) record.origins.push(origin)

    records.set(identity.key, record)
    return record
  }

  for (const row of canonical.sourceRows || []) {
    upsert(
      {
        doi: row.doi,
        pmid: row.pmid,
        url: row.url,
        title: row.title,
        authors: row.author_or_label,
        journal: row.journal,
        year: row.year,
        study_type: row.status,
        workbook_id: row.source_id,
        entity_slugs: splitList(row.entity_slugs),
        topics: splitList(row.used_for),
      },
      'Source_Register',
    )
  }

  for (const row of canonical.evidenceRows || []) {
    upsert(
      {
        doi: row.doi,
        pmid: row.pmid,
        url: row.url_or_source,
        title: row.notes,
        year: null,
        study_type: row.study_type || row.evidence_type,
        workbook_id: row.record_id,
        entity_slugs: splitList(row.entity_slug),
        topics: splitList(row.effect_or_condition),
      },
      'Evidence_Register',
    )
  }

  const byEntity = new Map()
  const byTopic = new Map()
  for (const record of records.values()) {
    record.entity_slugs.sort()
    record.topics.sort()
    record.origins.sort()
    record.workbook_ids.sort()
    for (const slug of record.entity_slugs) {
      if (!byEntity.has(slug)) byEntity.set(slug, [])
      byEntity.get(slug).push(record.key)
    }
    for (const topic of record.topics) {
      if (!byTopic.has(topic)) byTopic.set(topic, [])
      byTopic.get(topic).push(record.key)
    }
  }

  return {
    index_version: 1,
    source_rows: (canonical.sourceRows || []).length,
    evidence_rows: (canonical.evidenceRows || []).length,
    records: Object.fromEntries([...records.entries()].sort((a, b) => a[0].localeCompare(b[0]))),
    by_entity: Object.fromEntries(
      [...byEntity.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([k, v]) => [k, v.sort()]),
    ),
    by_topic: Object.fromEntries(
      [...byTopic.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([k, v]) => [k, v.sort()]),
    ),
  }
}

function splitList(value) {
  return String(value ?? '')
    .split(/[;,|]/)
    .map((part) => part.trim())
    .filter(Boolean)
}

export function writeResearchIndex(index) {
  assertPipelineWritePath(researchIndexPath)
  fs.mkdirSync(path.dirname(researchIndexPath), { recursive: true })
  fs.writeFileSync(researchIndexPath, `${JSON.stringify(index, null, 2)}\n`, 'utf8')
  return researchIndexPath
}

export function readResearchIndex() {
  if (!fs.existsSync(researchIndexPath)) {
    throw new Error(
      `Research index not built. Run: node scripts/enrichment-pipeline/cli.mjs index (writes ${relative(researchIndexPath)})`,
    )
  }
  return JSON.parse(fs.readFileSync(researchIndexPath, 'utf8'))
}

/** Map view used by source classification and reuse metrics. */
export function toLookupMap(index) {
  return new Map(Object.entries(index.records))
}

/** Identity-only resolution. Returns null when the source is not already known. */
export function lookup(index, source) {
  const identity = sourceIdentity(source)
  if (identity.kind === 'none') return null
  return index.records[identity.key] || null
}

/**
 * Sources already linked to this entity. These are *leads*, not matches: a
 * worker must still confirm the source supports the specific field before
 * citing it.
 */
export function forEntity(index, slug) {
  const keys = index.by_entity[String(slug ?? '').trim().toLowerCase()] || []
  return keys.map((key) => index.records[key]).filter(Boolean)
}

export function forTopic(index, topic) {
  const keys = index.by_topic[String(topic ?? '').trim().toLowerCase()] || []
  return keys.map((key) => index.records[key]).filter(Boolean)
}

/**
 * Reuse metrics for one candidate: how many of its sources the site already had.
 */
export function reuseMetrics(index, sources) {
  let reused = 0
  let fresh = 0
  let unidentified = 0
  for (const source of sources || []) {
    const identity = sourceIdentity(source)
    if (identity.kind === 'none') unidentified += 1
    else if (index.records[identity.key]) reused += 1
    else fresh += 1
  }
  return { reused, fresh, unidentified, total: (sources || []).length }
}
