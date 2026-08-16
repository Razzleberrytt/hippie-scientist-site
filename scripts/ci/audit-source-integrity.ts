/**
 * Source integrity audit (backlog 1425-1439, 1904-1913, 1001-1002).
 *
 * Once every citation carries real PubMed metadata, the shape of the evidence
 * base becomes measurable rather than assumed. This reports it:
 *
 *  1. Referenced-by — which profiles each study backs, and which studies carry
 *     the most weight across the site. A wrong high-centrality citation is a
 *     site-wide problem, so those are the ones to audit first.
 *  2. Retractions and expressions of concern, read from PubMed's own
 *     publication types.
 *  3. Citation age, because a claim resting on twenty-year-old work is a
 *     different claim from one resting on last year's.
 *  4. Design mix — how much of the evidence base is primary human research
 *     versus narrative review.
 *
 * Blocking only on a retraction: a retracted study cannot keep silently
 * supporting a health claim. Everything else is reported, because "old" and
 * "review-heavy" are editorial judgements, not defects.
 *
 * Usage: tsx scripts/ci/audit-source-integrity.ts
 */

import fs from 'node:fs'
import path from 'node:path'

import { normalizeStudyClass, strongestStudyClass, STUDY_CLASS_INFO, type StudyClass } from '../../lib/study-class'

const ROOT = process.cwd()
const DATA_DIR = path.join(ROOT, 'public', 'data')
const CACHE_PATH = path.join(ROOT, 'ops', 'cache', 'pubmed-metadata.json')
const REPORTS_DIR = path.join(ROOT, 'ops', 'reports')
const REPORT_PATH = path.join(REPORTS_DIR, 'source-integrity.json')

/** Publication types that mean the record should not support a live claim. */
const WITHDRAWN = /retract|expression of concern|withdrawn/i

/** Reference year for age buckets; overridable so the report is reproducible. */
const CURRENT_YEAR = Number(process.env.SOURCE_AUDIT_YEAR) || new Date().getFullYear()

function loadCache(): Record<string, Record<string, unknown>> {
  if (!fs.existsSync(CACHE_PATH)) return {}
  try {
    return JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8')).records ?? {}
  } catch {
    return {}
  }
}

/** slug -> cited PMIDs, and PMID -> profiles citing it. */
function buildCitationGraph(): Map<string, Set<string>> {
  const referencedBy = new Map<string, Set<string>>()
  for (const [dir, kind] of [
    ['herbs-detail', 'herbs'],
    ['compounds-detail', 'compounds'],
  ]) {
    const full = path.join(DATA_DIR, dir)
    if (!fs.existsSync(full)) continue
    for (const file of fs.readdirSync(full)) {
      if (!file.endsWith('.json')) continue
      const record = JSON.parse(fs.readFileSync(path.join(full, file), 'utf8'))
      const url = `/${kind}/${record.slug ?? file.replace(/\.json$/, '')}/`
      for (const source of Array.isArray(record.sources) ? record.sources : []) {
        const pmid = String(source.pmid ?? source.pubmedId ?? '').trim()
        if (!pmid) continue
        if (!referencedBy.has(pmid)) referencedBy.set(pmid, new Set())
        referencedBy.get(pmid)!.add(url)
      }
    }
  }
  return referencedBy
}

function designOf(meta: { publicationTypes?: string[] }): StudyClass {
  const classes = (meta.publicationTypes ?? [])
    .filter((type) => !/^journal article$/i.test(type))
    .map((type) => normalizeStudyClass(type))
    .filter((studyClass) => studyClass !== 'unclassified')
  return strongestStudyClass(classes)
}

function main() {
  const cache = loadCache()
  const referencedBy = buildCitationGraph()

  const studies = [...referencedBy.entries()].map(([pmid, pages]) => {
    const meta = (cache[pmid] ?? {}) as { title?: string; journal?: string; year?: number; publicationTypes?: string[] }
    return {
      pmid,
      pageCount: pages.size,
      pages: [...pages].sort(),
      title: String(meta.title ?? '').slice(0, 120),
      journal: meta.journal ?? '',
      year: meta.year ?? null,
      design: (meta.publicationTypes ? designOf(meta) : 'unclassified') as StudyClass,
      publicationTypes: meta.publicationTypes ?? [],
      hasMetadata: Boolean(meta.title),
    }
  })

  studies.sort((a, b) => b.pageCount - a.pageCount || (a.year ?? 0) - (b.year ?? 0))

  const withdrawn = studies.filter((s) => s.publicationTypes.some((t) => WITHDRAWN.test(t)))

  const dated = studies.filter((s) => s.year)
  const age: Record<string, number> = { within5: 0, within10: 0, within20: 0, over20: 0 }
  for (const study of dated) {
    const years = CURRENT_YEAR - study.year
    if (years <= 5) age.within5 += 1
    else if (years <= 10) age.within10 += 1
    else if (years <= 20) age.within20 += 1
    else age.over20 += 1
  }

  const designMix: Record<string, number> = {}
  for (const study of studies) designMix[study.design] = (designMix[study.design] ?? 0) + 1

  // A study backing several profiles carries proportionally more risk.
  const central = studies.filter((s) => s.pageCount >= 3)
  // Old work that is also load-bearing is the highest-priority review target.
  const oldAndCentral = central.filter((s) => s.year && CURRENT_YEAR - s.year > 15)

  const humanPrimary = studies.filter((s) => ['rct', 'controlled-trial', 'uncontrolled-trial'].includes(s.design)).length
  const synthesis = studies.filter((s) => ['meta-analysis', 'systematic-review'].includes(s.design)).length

  const summary = {
    citedStudies: studies.length,
    withMetadata: studies.filter((s) => s.hasMetadata).length,
    citedOnMultipleProfiles: studies.filter((s) => s.pageCount > 1).length,
    loadBearing: central.length,
    oldAndLoadBearing: oldAndCentral.length,
    withdrawn: withdrawn.length,
    age,
    designMix,
    humanPrimary,
    synthesis,
    medianYear: dated.length ? dated.map((s) => s.year).sort((a, b) => a - b)[Math.floor(dated.length / 2)] : null,
  }

  fs.mkdirSync(REPORTS_DIR, { recursive: true })
  fs.writeFileSync(
    REPORT_PATH,
    `${JSON.stringify({ generatedAt: new Date().toISOString(), currentYear: CURRENT_YEAR, summary, withdrawn, mostReferenced: studies.slice(0, 40), oldAndLoadBearing: oldAndCentral }, null, 2)}\n`,
  )

  console.log('\nSource integrity')
  console.log('='.repeat(72))
  console.log(`Cited studies              ${summary.citedStudies}  (${summary.withMetadata} with PubMed metadata)`)
  console.log(`Cited on >1 profile        ${summary.citedOnMultipleProfiles}`)
  console.log(`Load-bearing (>=3 pages)   ${summary.loadBearing}`)
  console.log(`  of those older than 15y  ${summary.oldAndLoadBearing}`)
  console.log(`Retracted / concern        ${summary.withdrawn}`)
  console.log(`\nAge (median ${summary.medianYear}):  <=5y ${age.within5}   6-10y ${age.within10}   11-20y ${age.within20}   >20y ${age.over20}`)
  console.log(`\nPrimary human research ${humanPrimary} · evidence synthesis ${synthesis} · other ${summary.citedStudies - humanPrimary - synthesis}`)
  console.log('\nDesign mix:')
  for (const [design, count] of Object.entries(designMix).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(count).padStart(4)}  ${STUDY_CLASS_INFO[design as StudyClass]?.label ?? design}`)
  }

  if (central.length) {
    console.log('\nMost load-bearing studies (audit these first):')
    for (const study of central.slice(0, 10)) {
      console.log(`  ${String(study.pageCount).padStart(2)} pages · ${study.year ?? '????'} · ${study.title.slice(0, 58)}`)
    }
  }

  console.log(`\nReport: ${path.relative(ROOT, REPORT_PATH)}`)

  if (withdrawn.length) {
    console.error(`\n[source-integrity] FAILED — ${withdrawn.length} retracted or withdrawn study still cited.\n`)
    for (const study of withdrawn) {
      console.error(`  PMID ${study.pmid} [${study.publicationTypes.join(', ')}] cited by ${study.pages.join(', ')}`)
    }
    process.exit(1)
  }
}

main()
