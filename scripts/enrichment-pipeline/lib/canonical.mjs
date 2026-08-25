import fs from 'node:fs'
import path from 'node:path'
import { readWorkbookExcelJS } from '../../utils/read-workbook-exceljs.mjs'
import { isMissingLike, normalizeStructuredText } from '../../../lib/data-quality.mjs'
import { workbookPath as defaultWorkbookPath, publicDataDir, relative, repoRoot } from './paths.mjs'
import { loadContract } from './contract.mjs'

/**
 * Read-only access to canonical production data.
 *
 * Nothing in this module writes. The gap scanner, validators, and importer all
 * read canonical values through here so there is exactly one place where the
 * canonical source is opened, and no component can drift onto a write path by
 * accident.
 */

const cache = new Map()

export async function loadCanonical({ workbookPath = defaultWorkbookPath, force = false } = {}) {
  if (!force && cache.has(workbookPath)) return cache.get(workbookPath)

  if (!fs.existsSync(workbookPath)) {
    throw new Error(`Canonical workbook not found: ${relative(workbookPath)}`)
  }

  const contract = loadContract()
  const handle = await readWorkbookExcelJS(workbookPath)
  const sheetNames = handle.getSheetNames()

  const entitySheet = [
    contract.canonicalSource.entity_sheet,
    ...(contract.canonicalSource.entity_sheet_fallbacks || []),
  ].find((name) => sheetNames.includes(name))

  if (!entitySheet) {
    throw new Error(
      `Canonical workbook is missing the entity sheet. Looked for: ` +
        `${contract.canonicalSource.entity_sheet}. Present: ${sheetNames.join(', ')}`,
    )
  }

  const entityRows = handle.getSheetData(entitySheet)
  const columns = entityRows.length ? Object.keys(entityRows[0]) : []
  const keyColumn = contract.canonicalSource.key_column

  const bySlug = new Map()
  const duplicateSlugs = []
  entityRows.forEach((row, index) => {
    const slug = String(row[keyColumn] ?? '').trim().toLowerCase()
    if (!slug) return
    if (bySlug.has(slug)) {
      duplicateSlugs.push({ slug, rows: [bySlug.get(slug).rowNumber, index + 2] })
      return
    }
    bySlug.set(slug, { row, rowNumber: index + 2, index })
  })

  const optional = (name) => (sheetNames.includes(name) ? handle.getSheetData(name) : [])

  const canonical = Object.freeze({
    workbookPath,
    entitySheet,
    sheetNames,
    columns,
    entityRows,
    bySlug,
    duplicateSlugs,
    evidenceRows: optional('Evidence_Register'),
    sourceRows: optional('Source_Register'),
    relationshipRows: optional('Entity_Relationships'),
    maintenanceRows: optional('Maintenance_Queue'),
    unresolvedGapRows: optional('Unresolved_Gaps'),
  })

  cache.set(workbookPath, canonical)
  return canonical
}

export function getEntity(canonical, slug) {
  return canonical.bySlug.get(String(slug ?? '').trim().toLowerCase()) || null
}

export function entityType(entity) {
  return String(entity?.row?.entity_type ?? '').trim().toLowerCase()
}

export function cellValue(canonical, slug, column) {
  const entity = getEntity(canonical, slug)
  if (!entity) return null
  if (!Object.prototype.hasOwnProperty.call(entity.row, column)) return null
  return normalizeStructuredText(entity.row[column])
}

/**
 * A canonical cell counts as a gap when it is empty or a missing-like
 * placeholder ("n/a", "tbd", "unknown", …). This is deliberately the same
 * primitive the rest of the repo uses so the queue and the existing audits
 * agree on what "missing" means.
 */
export function isGap(value) {
  return isMissingLike(value)
}

/** Deterministic snapshot used to prove a scan did not mutate canonical data. */
export function canonicalFingerprint(canonical) {
  const parts = []
  for (const [slug, { row }] of [...canonical.bySlug.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    parts.push(slug + '\u0000' + canonical.columns.map((c) => normalizeStructuredText(row[c])).join('\u0001'))
  }
  return parts.join('\u0002')
}

function readJson(filePath) {
  if (!fs.existsSync(filePath)) return null
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch {
    return null
  }
}

/**
 * Optional repository-grounded priority signals, used only when present.
 * Generated public-data signals remain read-only. Operator-supplied search-index
 * observations are also read-only evidence inputs and never mutate publication.
 */
export function loadPublicDataSignals() {
  const readPublic = (name) => readJson(path.join(publicDataDir, name))
  return {
    herbs: readPublic('herbs.json'),
    compounds: readPublic('compounds.json'),
    canonicalMechanisms: readPublic('canonical-mechanisms.json'),
    seoPriority: readPublic('seo-priority-report.json'),
    indexableHerbs: readPublic('indexable-herbs.json'),
    indexableCompounds: readPublic('indexable-compounds.json'),
    searchIndexObservations: readJson(path.join(repoRoot, 'data-sources', 'search-index-observations.json')),
  }
}
