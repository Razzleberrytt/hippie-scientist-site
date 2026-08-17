/**
 * Write fetched PubMed metadata into the cited sources.
 *
 * Everything applied here comes from the esummary response for that exact
 * PMID, cached by `fetch-pubmed-metadata.mjs`. Nothing is inferred: a field is
 * filled only when PubMed supplied a value, and each touched source records
 * `metadataSource: 'pubmed'` so the provenance of every value stays visible.
 *
 * Existing curated values win. The only case where an existing value is
 * replaced is a placeholder title — "PubMed PMID 37818728. Minimal citation row
 * added from existing evidence." is a note about missing metadata, not a study
 * title, and PubMed has the real one.
 *
 * PubMed's own publication types are the authoritative study design, so they
 * also populate `studyType` through the canonical study-class taxonomy. That
 * replaces design strings that were previously guessed from the title.
 *
 * Usage: tsx scripts/data/apply-pubmed-metadata.ts [--dry-run]
 */

import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import { isPlaceholderCitationTitle, normalizeDoi } from '../../lib/citation-identifiers.mjs'
import { STUDY_CLASS_INFO, normalizeStudyClass, strongestStudyClass, type StudyClass } from '../../lib/study-class'

const ROOT = process.cwd()
const DATA_DIR = path.join(ROOT, 'public', 'data')
const CACHE_PATH = path.join(ROOT, 'ops', 'cache', 'pubmed-metadata.json')
const REPORT_PATH = path.join(ROOT, 'ops', 'reports', 'pubmed-metadata-applied.json')
const DRY_RUN = process.argv.includes('--dry-run')

type PubmedRecord = {
  pmid: string
  title: string
  authors: string
  journal: string
  year: number | null
  doi: string
  publicationTypes: string[]
}

const text = (value: unknown) => String(value ?? '').trim()

/**
 * PubMed tags nearly every record "Journal Article", which says nothing about
 * design. The specific tags alongside it are what carry the information, so the
 * strongest recognised class across all tags wins.
 */
function studyClassFromPublicationTypes(types: readonly string[]): StudyClass {
  const classes = types
    .filter((type) => !/^journal article$/i.test(type))
    .map((type) => normalizeStudyClass(type))
    .filter((studyClass) => studyClass !== 'unclassified')
  return strongestStudyClass(classes)
}

/**
 * Whether two titles are the same string once punctuation and spacing are
 * ignored — a hyphen against an em-dash, a trailing period, differing case.
 *
 * Deliberately strict: it compares the full normalized text, so a genuinely
 * different curated title can never be silently replaced by PubMed's. Only
 * cosmetic divergence qualifies.
 */
function isCosmeticTitleVariant(current: unknown, canonical: string): boolean {
  const normalize = (value: string) =>
    value
      .toLowerCase()
      .replace(/[‐-―]/g, '-')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim()

  const a = normalize(text(current))
  const b = normalize(canonical)
  return Boolean(a) && a === b && text(current) !== canonical
}

function main() {
  if (!existsSync(CACHE_PATH)) {
    console.error('[pubmed-apply] No cache. Run: node scripts/data/fetch-pubmed-metadata.mjs')
    process.exit(1)
  }

  const cache = JSON.parse(readFileSync(CACHE_PATH, 'utf8'))
  const records: Record<string, PubmedRecord> = cache.records ?? {}

  const filled: Record<string, number> = {}
  const touchedFiles: string[] = []
  const unresolved: { slug: string; pmid: string; title: string }[] = []
  let sourcesTouched = 0

  for (const dir of ['herbs-detail', 'compounds-detail']) {
    const full = path.join(DATA_DIR, dir)
    if (!existsSync(full)) continue

    for (const file of readdirSync(full)) {
      if (!file.endsWith('.json')) continue
      const filePath = path.join(full, file)
      const record = JSON.parse(readFileSync(filePath, 'utf8'))
      const sources = Array.isArray(record.sources) ? record.sources : []
      if (!sources.length) continue

      let touched = false
      const next = sources.map((source: Record<string, unknown>) => {
        const pmid = text(source.pmid ?? source.pubmedId)
        if (!pmid) return source

        const meta = records[pmid]
        if (!meta) {
          unresolved.push({ slug: String(record.slug ?? file), pmid, title: text(source.title).slice(0, 80) })
          return source
        }

        const updated = { ...source }
        const fill = (key: string, value: string | number) => {
          updated[key] = value
          filled[key] = (filled[key] ?? 0) + 1
          touched = true
        }

        if (meta.journal && !text(source.journal)) fill('journal', meta.journal)
        if (meta.year && !text(source.year)) fill('year', meta.year)
        if (meta.authors && !text(source.authors ?? source.author_or_label)) fill('authors', meta.authors)
        if (meta.doi && !normalizeDoi(source.doi)) fill('doi', meta.doi)
        // A placeholder title is a note about absent metadata, so PubMed's
        // title is strictly better. A curated title is left alone.
        if (meta.title && isPlaceholderCitationTitle(source.title)) {
          fill('title', meta.title)
        } else if (meta.title && isCosmeticTitleVariant(source.title, meta.title)) {
          // Same study, cosmetically different title. Two profiles cited PMID
          // 33086877 as "…Disorders-A Systematic Review" and
          // "…Disorders—A Systematic Review", and PMID 32048383 with and
          // without a trailing period, which reads as two studies to anything
          // keyed on title. Adopting PubMed's form makes one study look like
          // one study.
          fill('title', meta.title)
        }

        const studyClass = studyClassFromPublicationTypes(meta.publicationTypes)
        if (studyClass !== 'unclassified' && text(source.studyType) !== STUDY_CLASS_INFO[studyClass].label) {
          fill('studyType', STUDY_CLASS_INFO[studyClass].label)
          updated.studyClass = studyClass
        }

        if (touched && updated !== source) updated.metadataSource = 'pubmed'
        return updated
      })

      if (!touched) continue
      sourcesTouched += next.filter((s: Record<string, unknown>) => s.metadataSource === 'pubmed').length
      touchedFiles.push(`${dir}/${file}`)
      if (!DRY_RUN) {
        record.sources = next
        writeFileSync(filePath, `${JSON.stringify(record, null, 2)}\n`)
      }
    }
  }

  if (!DRY_RUN) {
    writeFileSync(
      REPORT_PATH,
      `${JSON.stringify({ generatedAt: new Date().toISOString(), filled, filesTouched: touchedFiles.length, sourcesTouched, unresolved }, null, 2)}\n`,
    )
  }

  console.log(`\nPubMed metadata applied${DRY_RUN ? ' (dry run)' : ''}`)
  console.log('='.repeat(66))
  console.log(`Files touched     ${touchedFiles.length}`)
  console.log(`Sources enriched  ${sourcesTouched}`)
  for (const [field, count] of Object.entries(filled).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(count).padStart(5)}  ${field}`)
  }
  if (unresolved.length) {
    console.log(`\nCitations whose PMID PubMed does not recognise: ${unresolved.length}`)
    for (const item of unresolved.slice(0, 10)) {
      console.log(`  ${item.slug} · PMID ${item.pmid} · ${item.title}`)
    }
  }
}

main()
