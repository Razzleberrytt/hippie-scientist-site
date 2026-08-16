/**
 * Build researcher-facing citation exports (backlog 1409-1424, 213-214).
 *
 * The site cites 849 studies whose bibliographic metadata is now complete
 * enough to hand to a reference manager. Emitting BibTeX, RIS, CSV and JSON
 * makes the library usable by the researchers and writers most likely to cite
 * the site back, which no amount of on-page formatting achieves.
 *
 * Every record is written from the PubMed metadata for that PMID. Titles keep
 * their exact wording and journal names are not abbreviated further, because a
 * reference manager will treat whatever it is given as authoritative.
 *
 * Output lands in `public/data/exports/`, so it ships as static files under a
 * stable URL rather than needing a server.
 *
 * Usage: tsx scripts/data/build-citation-exports.ts
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import { normalizeStudyClass, strongestStudyClass, STUDY_CLASS_INFO, type StudyClass } from '../../lib/study-class'

const ROOT = process.cwd()
const DATA_DIR = path.join(ROOT, 'public', 'data')
const CACHE_PATH = path.join(ROOT, 'ops', 'cache', 'pubmed-metadata.json')
const OUT_DIR = path.join(DATA_DIR, 'exports')

const SITE = 'https://thehippiescientist.net'

type Study = {
  pmid: string
  title: string
  authors: string
  journal: string
  year: number | null
  volume?: string
  pages?: string
  doi: string
  publicationTypes: string[]
  authorList?: string[]
}

/**
 * BibTeX joins authors with " and ". The stored display form collapses to
 * "et al." after the first name, which a reference manager cannot expand, so
 * the full list is used whenever it is available.
 */
function authorsForExport(study: Study): string[] {
  if (study.authorList?.length) return study.authorList
  return text(study.authors)
    .split(/\s*,\s*/)
    .map((name) => name.trim())
    .filter((name) => name && !/^et al\.?$/i.test(name))
}

const text = (value: unknown) => String(value ?? '').trim()

/** BibTeX keys must be unique and ASCII-safe; the PMID guarantees both. */
function bibtexKey(study: Study): string {
  const lead = text(study.authors).split(/[\s,]+/)[0]?.toLowerCase().replace(/[^a-z]/g, '') || 'study'
  return `${lead}${study.year ?? 'nd'}pmid${study.pmid}`
}

/**
 * Escape the characters BibTeX treats as markup. Braces around the title
 * preserve capitalisation, which matters for species names — without them
 * BibTeX lowercases "Withania" in most styles.
 */
function bibtexValue(value: string): string {
  return value.replace(/[\\{}$&#_%~^]/g, (ch) => `\\${ch}`)
}

/**
 * PubMed indexes NCBI Bookshelf monographs — LiverTox, StatPearls — alongside
 * journal articles, but returns no journal for them and reports the last
 * revision year rather than a publication year. 44 cited records are of this
 * kind. Exporting them as `@article` would hand a researcher a journal
 * reference for something that was never in a journal.
 */
function isMonograph(study: Study): boolean {
  return !text(study.journal) && !authorsForExport(study).length
}

function toBibtex(study: Study): string {
  if (isMonograph(study)) {
    const fields: [string, string][] = [
      ['title', `{${bibtexValue(study.title)}}`],
      ['year', String(study.year ?? '')],
      ['howpublished', '{NCBI Bookshelf, National Library of Medicine}'],
      ['note', '{Reference work; year reflects last revision}'],
      ['pmid', study.pmid],
      ['url', `https://pubmed.ncbi.nlm.nih.gov/${study.pmid}/`],
    ].filter(([, value]) => value && value !== '{}')
    const body = fields.map(([key, value]) => `  ${key} = ${value.startsWith('{') ? value : `{${value}}`}`).join(',\n')
    return `@misc{${bibtexKey(study)},\n${body}\n}`
  }

  const fields: [string, string][] = [
    ['title', `{${bibtexValue(study.title)}}`],
    ['author', bibtexValue(authorsForExport(study).join(' and '))],
    ['journal', bibtexValue(study.journal)],
    ['year', String(study.year ?? '')],
    ['volume', bibtexValue(study.volume ?? '')],
    ['pages', bibtexValue(study.pages ?? '')],
    ['doi', study.doi],
    ['pmid', study.pmid],
    ['url', `https://pubmed.ncbi.nlm.nih.gov/${study.pmid}/`],
  ].filter(([, value]) => value && value !== '{}')

  const body = fields.map(([key, value]) => `  ${key} = ${value.startsWith('{') ? value : `{${value}}`}`).join(',\n')
  return `@article{${bibtexKey(study)},\n${body}\n}`
}

/** RIS is line-oriented and tag-delimited; TY must lead and ER must close. */
function toRis(study: Study): string {
  // ELEC marks an online reference work; JOUR would misrepresent a monograph.
  const lines = [isMonograph(study) ? `TY  - ELEC` : `TY  - JOUR`]
  if (isMonograph(study)) lines.push(`PB  - NCBI Bookshelf, National Library of Medicine`)
  // RIS wants one AU line per author; the stored form is "Cheah KL et al."
  for (const author of authorsForExport(study)) {
    lines.push(`AU  - ${author}`)
  }
  if (study.title) lines.push(`TI  - ${study.title}`)
  if (study.journal) lines.push(`JO  - ${study.journal}`)
  if (study.year) lines.push(`PY  - ${study.year}`)
  if (study.volume) lines.push(`VL  - ${study.volume}`)
  if (study.pages) lines.push(`SP  - ${study.pages}`)
  if (study.doi) lines.push(`DO  - ${study.doi}`)
  lines.push(`AN  - ${study.pmid}`)
  lines.push(`UR  - https://pubmed.ncbi.nlm.nih.gov/${study.pmid}/`)
  lines.push(`ER  - `)
  return lines.join('\n')
}

function csvCell(value: unknown): string {
  const cell = text(value)
  return /[",\n]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell
}

function designOf(study: Study): StudyClass {
  const classes = study.publicationTypes
    .filter((type) => !/^journal article$/i.test(type))
    .map((type) => normalizeStudyClass(type))
    .filter((studyClass) => studyClass !== 'unclassified')
  return strongestStudyClass(classes)
}

/** Which profiles cite each study, so an export row is traceable to a page. */
function buildReferencedBy(): Map<string, string[]> {
  const map = new Map<string, Set<string>>()
  for (const [dir, kind] of [
    ['herbs-detail', 'herbs'],
    ['compounds-detail', 'compounds'],
  ]) {
    const full = path.join(DATA_DIR, dir)
    if (!existsSync(full)) continue
    for (const file of readdirSync(full)) {
      if (!file.endsWith('.json')) continue
      const record = JSON.parse(readFileSync(path.join(full, file), 'utf8'))
      const slug = record.slug ?? file.replace(/\.json$/, '')
      for (const source of Array.isArray(record.sources) ? record.sources : []) {
        const pmid = text(source.pmid ?? source.pubmedId)
        if (!pmid) continue
        if (!map.has(pmid)) map.set(pmid, new Set())
        map.get(pmid)!.add(`/${kind}/${slug}/`)
      }
    }
  }
  return new Map([...map].map(([pmid, pages]) => [pmid, [...pages].sort()]))
}

function main() {
  if (!existsSync(CACHE_PATH)) {
    console.error('[citation-exports] No PubMed cache. Run: node scripts/data/fetch-pubmed-metadata.mjs')
    process.exit(1)
  }

  const cache = JSON.parse(readFileSync(CACHE_PATH, 'utf8'))
  const referencedBy = buildReferencedBy()

  // Only export studies the site actually cites.
  const studies: Study[] = Object.values(cache.records ?? {})
    .filter((record) => referencedBy.has((record as Study).pmid))
    .map((record) => record as Study)
    .filter((study) => study.title)
    .sort((a, b) => (b.year ?? 0) - (a.year ?? 0) || a.pmid.localeCompare(b.pmid))

  mkdirSync(OUT_DIR, { recursive: true })

  const generatedNote = `Citation library for ${SITE} — ${studies.length} studies. Metadata retrieved from PubMed.`

  writeFileSync(
    path.join(OUT_DIR, 'citations.bib'),
    `% ${generatedNote}\n% Each key encodes the PMID so entries stay stable across regenerations.\n\n${studies.map(toBibtex).join('\n\n')}\n`,
  )

  writeFileSync(path.join(OUT_DIR, 'citations.ris'), `${studies.map(toRis).join('\n\n')}\n`)

  const csvHeader = ['pmid', 'doi', 'title', 'authors', 'journal', 'year', 'design', 'referenced_by_count', 'referenced_by']
  const csvRows = studies.map((study) =>
    [
      study.pmid,
      study.doi,
      study.title,
      study.authors,
      study.journal,
      study.year ?? '',
      STUDY_CLASS_INFO[designOf(study)].label,
      (referencedBy.get(study.pmid) ?? []).length,
      (referencedBy.get(study.pmid) ?? []).join(' '),
    ]
      .map(csvCell)
      .join(','),
  )
  writeFileSync(path.join(OUT_DIR, 'citations.csv'), `${[csvHeader.join(','), ...csvRows].join('\n')}\n`)

  writeFileSync(
    path.join(OUT_DIR, 'citations.json'),
    `${JSON.stringify(
      {
        name: 'The Hippie Scientist citation library',
        description: generatedNote,
        license: 'Bibliographic metadata is factual and sourced from PubMed. Attribution appreciated.',
        source: 'https://pubmed.ncbi.nlm.nih.gov/',
        studyCount: studies.length,
        studies: studies.map((study) => ({
          pmid: study.pmid,
          doi: study.doi || null,
          title: study.title,
          authors: study.authors || null,
          journal: study.journal || null,
          year: study.year,
          design: designOf(study),
          url: `https://pubmed.ncbi.nlm.nih.gov/${study.pmid}/`,
          referencedBy: referencedBy.get(study.pmid) ?? [],
        })),
      },
      null,
      2,
    )}\n`,
  )

  console.log('\nCitation exports')
  console.log('='.repeat(60))
  console.log(`Studies exported  ${studies.length}`)
  console.log(`  with DOI        ${studies.filter((s) => s.doi).length}`)
  console.log(`  with journal    ${studies.filter((s) => s.journal).length}`)
  for (const file of ['citations.bib', 'citations.ris', 'citations.csv', 'citations.json']) {
    const bytes = readFileSync(path.join(OUT_DIR, file)).length
    console.log(`  ${file.padEnd(16)} ${(bytes / 1024).toFixed(0)} KB`)
  }
  console.log(`\nOutput: ${path.relative(ROOT, OUT_DIR)}`)
}

main()
