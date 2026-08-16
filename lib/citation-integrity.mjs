import fs from 'node:fs'
import path from 'node:path'

import {
  citationCompleteness,
  citationIdentifiers,
  isPlaceholderCitationTitle,
  isValidDoi,
  isValidPmid,
  normalizeDoi,
} from './citation-identifiers.mjs'

const text = (value) => String(value ?? '').trim()

export function loadCitationProfiles(root = process.cwd()) {
  const dataDir = path.join(root, 'public', 'data')
  const profiles = []
  for (const [dir, kind] of [
    ['herbs-detail', 'herbs'],
    ['compounds-detail', 'compounds'],
  ]) {
    const full = path.join(dataDir, dir)
    if (!fs.existsSync(full)) continue
    for (const file of fs.readdirSync(full)) {
      if (!file.endsWith('.json')) continue
      try {
        const record = JSON.parse(fs.readFileSync(path.join(full, file), 'utf8'))
        const slug = record.slug ?? file.replace(/\.json$/, '')
        profiles.push({ kind: kind === 'herbs' ? 'herbs' : 'compounds', url: `/${kind}/${slug}/`, record })
      } catch {
        // Malformed profile JSON belongs to the data-format validators.
      }
    }
  }
  return profiles
}

function addMapping(map, key, value) {
  if (!key || !value) return
  const values = map.get(key) ?? new Set()
  values.add(value)
  map.set(key, values)
}

function mappingConflicts(map, fromKind, toKind) {
  return [...map.entries()]
    .filter(([, values]) => values.size > 1)
    .map(([identifier, values]) => ({
      kind: `${fromKind}-to-${toKind}`,
      identifier,
      values: [...values].sort(),
    }))
}

/**
 * Validate citation identity invariants over an existing profile collection.
 * Canonical research-quality passes its already-loaded profiles here, avoiding
 * another full directory traversal. Standalone callers can use loadCitationProfiles().
 */
export function analyzeCitationIntegrity(profiles) {
  const blocking = []
  const advisory = []
  const seenByIdentifier = new Map()
  const duplicateProfileSources = []
  const pmidToDois = new Map()
  const doiToPmids = new Map()
  let sources = 0

  for (const profile of profiles) {
    const kind = profile.kind === 'herbs' || profile.kind === 'herb' ? 'herbs' : 'compounds'
    const slug = profile.record?.slug ?? profile.slug ?? ''
    const url = profile.url ?? `/${kind}/${slug}/`
    const record = profile.record ?? profile
    const profileIdentifiers = new Set()

    for (const source of Array.isArray(record.sources) ? record.sources : []) {
      sources += 1
      const rawPmid = text(source.pmid ?? source.pubmedId)
      const rawDoi = normalizeDoi(source.doi)
      const canonicalDoi = rawDoi.toLowerCase()
      const rawUrl = text(source.url)

      if (rawPmid && !isValidPmid(rawPmid)) {
        blocking.push({ url, kind: 'invalid-pmid', value: rawPmid, title: text(source.title).slice(0, 80) })
      }
      if (rawDoi && !isValidDoi(rawDoi)) {
        blocking.push({ url, kind: 'invalid-doi', value: rawDoi, title: text(source.title).slice(0, 80) })
      }
      if (rawUrl && !/^https?:\/\/\S+$/.test(rawUrl)) {
        blocking.push({ url, kind: 'malformed-citation-url', value: rawUrl.slice(0, 120), title: text(source.title).slice(0, 80) })
      }

      if (isValidPmid(rawPmid) && isValidDoi(rawDoi)) {
        addMapping(pmidToDois, rawPmid, canonicalDoi)
        addMapping(doiToPmids, canonicalDoi, rawPmid)
      }

      const completeness = citationCompleteness(source)
      if (!completeness.complete) advisory.push({ url, missing: completeness.missing, identifier: completeness.identifier })
      if (isPlaceholderCitationTitle(source.title)) {
        advisory.push({ url, missing: ['placeholder-title'], value: text(source.title).slice(0, 90) })
      }

      const aliases = citationIdentifiers(source)
      const duplicateAliases = aliases.filter((identifier) => profileIdentifiers.has(identifier))
      if (duplicateAliases.length) {
        duplicateProfileSources.push({ url, identifiers: duplicateAliases, title: text(source.title).slice(0, 80) })
      }
      for (const identifier of aliases) profileIdentifiers.add(identifier)

      const normalizedTitle = text(source.title).toLowerCase()
      for (const identifier of aliases) {
        const titles = seenByIdentifier.get(identifier) ?? new Set()
        if (normalizedTitle) titles.add(normalizedTitle)
        seenByIdentifier.set(identifier, titles)
      }
    }
  }

  const conflicts = [...seenByIdentifier.entries()]
    .filter(([, titles]) => titles.size > 1)
    .map(([identifier, titles]) => ({ identifier, titles: [...titles].map((title) => title.slice(0, 80)) }))
    .sort((a, b) => a.identifier.localeCompare(b.identifier))

  const identifierPairConflicts = [
    ...mappingConflicts(pmidToDois, 'pmid', 'doi'),
    ...mappingConflicts(doiToPmids, 'doi', 'pmid'),
  ].sort((a, b) => a.kind.localeCompare(b.kind) || a.identifier.localeCompare(b.identifier))

  const missingCounts = {}
  for (const item of advisory) {
    for (const field of item.missing) missingCounts[field] = (missingCounts[field] ?? 0) + 1
  }

  const blockingCount = blocking.length + duplicateProfileSources.length + identifierPairConflicts.length + conflicts.length
  return {
    generatedAt: new Date().toISOString(),
    sources,
    blockingCount,
    blocking,
    duplicateProfileSources,
    identifierPairConflicts,
    missingCounts,
    conflicts,
    passed: blockingCount === 0,
  }
}

export function writeCitationIntegrityReport(report, root = process.cwd()) {
  const reportsDir = path.join(root, 'ops', 'reports')
  const reportPath = path.join(reportsDir, 'citation-identifiers.json')
  fs.mkdirSync(reportsDir, { recursive: true })
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`)
  return reportPath
}
