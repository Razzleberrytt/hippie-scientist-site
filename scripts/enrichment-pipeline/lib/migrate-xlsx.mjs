import fs from 'node:fs'
import path from 'node:path'
import { readWorkbookExcelJS } from '../../utils/read-workbook-exceljs.mjs'
import { assertPipelineWritePath, reportsDir, relative } from './paths.mjs'
import { isGap } from './canonical.mjs'
import { normalizeFieldValue, normalizeText } from './normalize.mjs'
import { digest } from './ids.mjs'

/**
 * Historical spreadsheet migration.
 *
 * Older enrichment passes live in standalone workbooks. They are treated as a
 * *source of proposals*, never as canonical state:
 *
 *   - schemas are detected per sheet rather than assumed;
 *   - rows are matched to canonical entities by slug (or by an exact name match
 *     when no slug column exists), never by row position or filename order;
 *   - a value is carried forward only when the canonical cell is currently a
 *     gap, so a newer production value is never overwritten by an older file;
 *   - repeated rows for the same (entity, field) are collapsed semantically,
 *     and disagreements between them are reported as conflicts rather than
 *     resolved by "last file wins";
 *   - the output is candidates, which then go through the same normalization,
 *     validation, and reviewed-patch path as any other work.
 */

/** Column names historical passes used for the same canonical field. */
export const COLUMN_ALIASES = {
  latin: 'latin_name',
  latin_binomial: 'latin_name',
  scientific_name: 'latin_name',
  botanical_name: 'latin_name',
  binomial: 'latin_name',
  pathways: 'canonical_pathways',
  mechanism_pathways: 'canonical_pathways',
  secondary_targets: 'secondary_effects',
  secondary_effect: 'secondary_effects',
  ecosystem: 'canonical_ecosystem',
  ecosystems: 'topic_ecosystems',
  synonyms: 'keywords',
  aliases: 'keywords',
  long_description: 'description',
  profile_description: 'description',
}

const SLUG_COLUMNS = ['slug', 'entity_slug', 'canonical_slug', 'herb_slug', 'compound_slug']
const NAME_COLUMNS = ['name', 'entity_name', 'herb_name', 'compound_name', 'title']

export function canonicalColumnFor(header, contract) {
  const raw = String(header ?? '').trim()
  if (!raw) return null
  if (contract.fields.has(raw)) return raw
  const key = raw.toLowerCase().replace(/[\s-]+/g, '_')
  if (contract.fields.has(key)) return key
  return COLUMN_ALIASES[key] ?? null
}

/** Identify which sheets in a workbook carry entity-field data worth migrating. */
export function detectSchema(handle, contract) {
  const sheets = []
  for (const name of handle.getSheetNames()) {
    const rows = handle.getSheetData(name)
    if (!rows.length) continue
    const headers = Object.keys(rows[0])
    const slugColumn = SLUG_COLUMNS.find((c) => headers.includes(c))
    const nameColumn = NAME_COLUMNS.find((c) => headers.includes(c))
    if (!slugColumn && !nameColumn) continue

    const mapped = {}
    for (const header of headers) {
      if (header === slugColumn || header === nameColumn) continue
      const canonical = canonicalColumnFor(header, contract)
      if (canonical) mapped[header] = canonical
    }
    if (!Object.keys(mapped).length) continue

    sheets.push({
      sheet: name,
      rows: rows.length,
      slug_column: slugColumn ?? null,
      name_column: nameColumn ?? null,
      column_map: mapped,
      unmapped_columns: headers.filter(
        (h) => h !== slugColumn && h !== nameColumn && !mapped[h],
      ),
    })
  }
  return sheets
}

function nameIndex(canonical) {
  const index = new Map()
  for (const [slug, entry] of canonical.bySlug) {
    const name = normalizeText(entry.row.name).toLowerCase()
    if (!name) continue
    if (index.has(name)) index.set(name, null) // ambiguous — refuse to guess
    else index.set(name, slug)
  }
  return index
}

/**
 * Compare a historical workbook against canonical data and produce proposals.
 * Read-only: nothing is written unless the caller asks for a report.
 */
export async function migrateWorkbook(filePath, { canonical, contract }) {
  if (!fs.existsSync(filePath)) throw new Error(`Workbook not found: ${filePath}`)

  const handle = await readWorkbookExcelJS(filePath)
  const schema = detectSchema(handle, contract)
  const namesToSlugs = nameIndex(canonical)

  const proposals = new Map() // `${slug}::${field}` -> proposal
  const conflicts = []
  const skipped = { unknown_entity: 0, ambiguous_name: 0, populated_canonical: 0, empty_value: 0, locked_field: 0, duplicate: 0 }
  let rowsRead = 0

  for (const sheetInfo of schema) {
    for (const row of handle.getSheetData(sheetInfo.sheet)) {
      rowsRead += 1

      let slug = sheetInfo.slug_column
        ? String(row[sheetInfo.slug_column] ?? '').trim().toLowerCase()
        : ''
      if (!slug && sheetInfo.name_column) {
        const key = normalizeText(row[sheetInfo.name_column]).toLowerCase()
        const resolved = namesToSlugs.get(key)
        if (resolved === null) {
          skipped.ambiguous_name += 1
          continue
        }
        slug = resolved ?? ''
      }
      const entity = slug ? canonical.bySlug.get(slug) : null
      if (!entity) {
        skipped.unknown_entity += 1
        continue
      }

      for (const [header, field] of Object.entries(sheetInfo.column_map)) {
        const definition = contract.fields.get(field)
        if (!definition || definition.enrichment === 'prohibited' || definition.enrichment === 'derived') {
          skipped.locked_field += 1
          continue
        }

        const incoming = normalizeFieldValue(row[header], definition.normalizer)
        if (!incoming || isGap(incoming)) {
          skipped.empty_value += 1
          continue
        }

        const canonicalValue = normalizeText(entity.row[field])
        if (!isGap(canonicalValue)) {
          // Production already holds a value. An older file never overrides it.
          skipped.populated_canonical += 1
          continue
        }

        const key = `${slug}::${field}`
        const existing = proposals.get(key)
        if (!existing) {
          proposals.set(key, {
            slug,
            entity_type: String(entity.row.entity_type ?? '').trim().toLowerCase(),
            field,
            value: incoming,
            canonical_value: canonicalValue,
            provenance: [{ file: relative(filePath), sheet: sheetInfo.sheet, column: header }],
          })
          continue
        }

        existing.provenance.push({ file: relative(filePath), sheet: sheetInfo.sheet, column: header })
        if (existing.value === incoming) {
          skipped.duplicate += 1
          continue
        }
        conflicts.push({
          slug,
          field,
          kept: existing.value,
          rejected: incoming,
          reason: 'two historical rows propose different values for the same empty canonical cell',
          provenance: existing.provenance,
        })
      }
    }
  }

  return {
    file: relative(filePath),
    file_digest: digest('migration/v1', fs.readFileSync(filePath)).slice(0, 16),
    schema,
    rows_read: rowsRead,
    proposals: [...proposals.values()].sort(
      (a, b) => a.slug.localeCompare(b.slug) || a.field.localeCompare(b.field),
    ),
    conflicts,
    skipped,
  }
}

/**
 * Turn migration proposals into candidate documents. The migration is the
 * *worker* here: its "source" is the historical workbook itself, which is why
 * every migrated change is marked as needing human review — a spreadsheet row
 * is provenance, not a citation.
 */
export function proposalsToCandidates(migration, { job = null } = {}) {
  const byEntity = new Map()
  for (const proposal of migration.proposals) {
    if (!byEntity.has(proposal.slug)) byEntity.set(proposal.slug, [])
    byEntity.get(proposal.slug).push(proposal)
  }

  return [...byEntity.entries()].map(([slug, proposals]) => ({
    slug,
    entity_type: proposals[0].entity_type,
    job_id: job?.job_id ?? null,
    changes: proposals.map((proposal) => ({
      field: proposal.field,
      operation: 'set',
      current_value: proposal.canonical_value,
      proposed_value: proposal.value,
      confidence: 'low',
      source_ids: [`migration:${migration.file_digest}`],
      rationale:
        `Carried forward from ${proposal.provenance.map((p) => `${p.file}#${p.sheet}.${p.column}`).join(', ')}. ` +
        'Historical spreadsheet provenance only — a reviewer must attach a real citation before this can be accepted.',
      requires_human_review: true,
    })),
    sources: [
      {
        id: `migration:${migration.file_digest}`,
        class: 'internal-canonical',
        canonical_ref: migration.file,
        title: `Historical enrichment workbook ${migration.file}`,
      },
    ],
  }))
}

export function writeMigrationReport(migration, label) {
  const target = path.join(reportsDir, `migration-${label}.json`)
  assertPipelineWritePath(target)
  fs.mkdirSync(path.dirname(target), { recursive: true })
  fs.writeFileSync(target, `${JSON.stringify(migration, null, 2)}\n`, 'utf8')
  return target
}
