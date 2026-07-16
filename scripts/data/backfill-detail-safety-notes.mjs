#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { readWorkbookExcelJS } from '../utils/read-workbook-exceljs.mjs'
import { resolveWorkbookPath } from '../workbook-source.mjs'

const __filename = fileURLToPath(import.meta.url)
const repoRoot = path.resolve(path.dirname(__filename), '../..')
const dataDir = path.join(repoRoot, 'public/data')
const dryRun = process.argv.includes('--dry-run')

// build-runtime-from-workbook.mjs stopped regenerating herbs-detail/compounds-detail
// content (its `details()` calls are intentionally commented out to avoid clobbering
// enrichment-only fields), so these detail files are stale artifacts of an older
// generator that fell back to this placeholder whenever a specific safety field was
// unset. The workbook's `safety_notes` column has since been filled in with real,
// reviewed cautionary text for the large majority of entities, but nothing in the
// current pipeline re-syncs it into the rendered detail JSON. This script closes that
// gap: it only overwrites the exact placeholder string, and only with existing
// workbook `safety_notes` text (no new claims or sources), so it is a correction of a
// pipeline gap rather than new content.
const PLACEHOLDER = 'Generally well tolerated for most users.'
const MIN_LENGTH = 15
const INTERNAL_NOTE_PATTERN =
  /\bneeds?\b[^.]{0,80}\b(review|pass|research)\b|runtime safety box|pending review|\btodo\b|\btbd\b|to be determined|\bplaceholder\b/i

function loadWorkbookSafetyNotesBySlug() {
  const workbookPath = resolveWorkbookPath(repoRoot)
  return readWorkbookExcelJS(workbookPath).then((wb) => {
    const rows = wb.getSheetData('Entity_Master')
    const bySlug = new Map()
    for (const row of rows) {
      const slug = String(row.slug || '').trim().toLowerCase()
      if (!slug) continue
      const text = String(row.safety_notes || '').trim()
      if (text) bySlug.set(slug, text)
    }
    return bySlug
  })
}

// Some workbook cells append an internal-only editorial reminder after a
// `|` separator (e.g. "<real safety text> | Runtime safety box: add caution for...").
// Keep the reader-facing prefix if it stands on its own; otherwise skip the row.
function extractPublishableText(rawText) {
  if (INTERNAL_NOTE_PATTERN.test(rawText)) {
    const [prefix] = rawText.split(/\s*\|\s*/, 1)
    if (prefix && prefix.length >= MIN_LENGTH && !INTERNAL_NOTE_PATTERN.test(prefix)) {
      return { text: prefix.trim(), skippedInternalSuffix: true }
    }
    return { text: null, skippedInternalSuffix: false }
  }
  return { text: rawText, skippedInternalSuffix: false }
}

function fixDetailDir(detailDirName, safetyNotesBySlug) {
  const dir = path.join(dataDir, detailDirName)
  if (!fs.existsSync(dir)) return { updated: [], skippedInternal: [] }

  const updated = []
  const skippedInternal = []

  for (const entry of fs.readdirSync(dir)) {
    if (!entry.endsWith('.json')) continue
    const file = path.join(dir, entry)
    const record = JSON.parse(fs.readFileSync(file, 'utf8'))
    const current = String(record.safetyNotes || '').trim()
    if (current !== PLACEHOLDER) continue

    const slug = String(record.slug || entry.replace(/\.json$/, '')).trim().toLowerCase()
    const workbookText = safetyNotesBySlug.get(slug)
    if (!workbookText || workbookText === PLACEHOLDER) continue

    const { text, skippedInternalSuffix } = extractPublishableText(workbookText)
    if (!text) {
      skippedInternal.push(slug)
      continue
    }
    if (text.length < MIN_LENGTH) continue

    record.safetyNotes = text
    updated.push({ slug, text, skippedInternalSuffix })
    if (!dryRun) fs.writeFileSync(file, `${JSON.stringify(record, null, 2)}\n`)
  }

  return { updated, skippedInternal }
}

async function main() {
  const safetyNotesBySlug = await loadWorkbookSafetyNotesBySlug()
  const herbs = fixDetailDir('herbs-detail', safetyNotesBySlug)
  const compounds = fixDetailDir('compounds-detail', safetyNotesBySlug)

  const totalUpdated = herbs.updated.length + compounds.updated.length
  const totalSkippedInternal = herbs.skippedInternal.length + compounds.skippedInternal.length

  for (const group of [
    ['herbs-detail', herbs],
    ['compounds-detail', compounds],
  ]) {
    const [name, result] = group
    for (const { slug, skippedInternalSuffix } of result.updated) {
      console.log(`  ${name}/${slug}.json${skippedInternalSuffix ? ' (trimmed internal-note suffix)' : ''}`)
    }
  }

  console.log(
    `[backfill-detail-safety-notes] ${totalUpdated} file(s) ${dryRun ? 'would be ' : ''}updated; ` +
      `${totalSkippedInternal} skipped as internal-only editorial notes (need real sourced text): ` +
      `${[...herbs.skippedInternal, ...compounds.skippedInternal].sort().join(', ') || 'none'}`,
  )
}

main()
