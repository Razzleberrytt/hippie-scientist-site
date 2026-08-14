#!/usr/bin/env node
/**
 * audit-crawler-visible-content.mjs
 *
 * Tier-1 SEO guard: proves that the substance of every profile page exists in
 * static, crawler-visible HTML rather than only inside the RSC flight payload,
 * a client-only widget, or an `ssr: false` island.
 *
 * A crawler that executes no JavaScript should still be able to read:
 *   evidence · dosing · safety · mechanism · citations · verdict
 *
 * The audit reads the built `out/` directory (static export), strips every
 * <script>/<style> block so nothing hidden in the flight payload can count as
 * "visible", then measures real rendered text inside each required section.
 *
 * Usage:
 *   node scripts/ci/audit-crawler-visible-content.mjs
 *   node scripts/ci/audit-crawler-visible-content.mjs --family herbs --limit 25
 *   node scripts/ci/audit-crawler-visible-content.mjs --strict     # non-zero exit on failures
 *
 * Output: ops/reports/crawler-visible-content.json + console summary.
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()

/* ------------------------------------------------------------------ args -- */

function parseArgs(argv) {
  const args = { dir: 'out', strict: false, limit: 0, families: null, json: null, quiet: false }
  for (const raw of argv.slice(2)) {
    const [key, value] = raw.startsWith('--') ? raw.slice(2).split('=') : [null, null]
    if (!key) continue
    if (key === 'strict') args.strict = true
    else if (key === 'quiet') args.quiet = true
    else if (key === 'dir' && value) args.dir = value
    else if (key === 'json' && value) args.json = value
    else if (key === 'limit' && value) args.limit = Number.parseInt(value, 10) || 0
    else if (key === 'family' && value) args.families = value.split(',').map((s) => s.trim()).filter(Boolean)
  }
  return args
}

const args = parseArgs(process.argv)
const OUT_DIR = path.isAbsolute(args.dir) ? args.dir : path.join(ROOT, args.dir)
const REPORT_PATH = args.json
  ? path.isAbsolute(args.json) ? args.json : path.join(ROOT, args.json)
  : path.join(ROOT, 'ops', 'reports', 'crawler-visible-content.json')

/* -------------------------------------------------------------- contract -- */

/**
 * Each required section is located by anchor id (preferred, stable) or by a
 * heading-text fallback. `minChars` is the floor for *rendered* text between
 * this section's anchor and the next section anchor on the page.
 */
const SECTION = (id, label, minChars, headingPatterns = [], textPatterns = []) => ({
  id,
  label,
  minChars,
  headingPatterns,
  textPatterns,
})

/**
 * Anchor ids differ between the herb and compound templates, and several
 * sections are rendered without an id at all — so every section carries
 * heading-text fallbacks that match what the templates actually emit.
 */
const PROFILE_SECTIONS = [
  SECTION('evidence', 'Evidence', 350, [/evidence summary/i, /evidence lens/i]),
  SECTION('dosing', 'Dosing', 150, [/dosing/i, /\bdose\b/i, /how much/i], [/>\s*Dosing\b/i, />\s*Typical dose/i]),
  SECTION('safety', 'Safety', 200, [/safety\s*(&amp;|&|and)?\s*cautions/i, /\bsafety\b/i]),
  SECTION('mechanisms', 'Mechanism', 150, [/how .* works/i, /mechanism/i]),
  // ShowMeTheStudies labels the citation list in a <span>, not a heading.
  SECTION(
    'references',
    'Citations',
    100,
    [/references/i, /representative studies/i],
    [/Clinical Study Summaries\s*\(/i, />\s*References\s*</i],
  ),
]

// Verdict is curated-only today (config/profile-verdicts.ts); tracked as
// coverage rather than a hard gate so the report shows the real gap.
// ScientificVerdictCard renders "Verdict: <name>" inside a span, not a heading.
const VERDICT_SECTION = SECTION('verdict', 'Verdict', 80, [], [/Verdict:\s*\w/])

const FAMILIES = {
  herbs: {
    dir: 'herbs',
    label: 'Herb profiles',
    minPageChars: 2500,
    sections: [SECTION('overview', 'Overview', 200, [/what this profile is built to answer/i]), ...PROFILE_SECTIONS],
    softSections: [VERDICT_SECTION],
  },
  compounds: {
    dir: 'compounds',
    label: 'Compound profiles',
    minPageChars: 2000,
    sections: [SECTION('overview', 'Overview', 200, [/quick stats/i, /what this profile is built to answer/i]), ...PROFILE_SECTIONS],
    softSections: [VERDICT_SECTION],
  },
}

/* --------------------------------------------------------------- helpers -- */

const SCRIPT_RE = /<script\b[^>]*>[\s\S]*?<\/script>/gi
const STYLE_RE = /<style\b[^>]*>[\s\S]*?<\/style>/gi
const TEMPLATE_RE = /<template\b[^>]*>[\s\S]*?<\/template>/gi
const TAG_RE = /<[^>]+>/g

const ENTITIES = {
  '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&apos;': "'",
  '&nbsp;': ' ', '&mdash;': '—', '&ndash;': '–', '&hellip;': '…', '&rsquo;': '’', '&lsquo;': '‘',
  '&ldquo;': '“', '&rdquo;': '”', '&times;': '×', '&deg;': '°', '&middot;': '·',
}

function decodeEntities(input) {
  return input
    .replace(/&[a-z]+;|&#\d+;/gi, (m) => {
      if (ENTITIES[m]) return ENTITIES[m]
      const num = /^&#(\d+);$/.exec(m)
      if (num) {
        const code = Number.parseInt(num[1], 10)
        return Number.isFinite(code) ? String.fromCodePoint(code) : ' '
      }
      return ' '
    })
}

/** HTML with all executable/non-rendered payloads removed. */
function toDomHtml(html) {
  return html.replace(SCRIPT_RE, ' ').replace(STYLE_RE, ' ').replace(TEMPLATE_RE, ' ')
}

/** Rendered text a JS-less crawler would read. */
function toVisibleText(domHtml) {
  return decodeEntities(domHtml.replace(TAG_RE, ' ')).replace(/\s+/g, ' ').trim()
}

/**
 * Index every `id="..."` anchor position in the document so a section's text can
 * be sliced from its own anchor to the next *required* anchor.
 */
function anchorPositions(domHtml, ids) {
  const positions = new Map()
  for (const id of ids) {
    const re = new RegExp(`id=["']${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`)
    const match = re.exec(domHtml)
    if (match) positions.set(id, match.index)
  }
  return positions
}

function sliceSectionText(domHtml, startIndex, allStarts) {
  const next = allStarts.filter((pos) => pos > startIndex).sort((a, b) => a - b)[0]
  const end = next ?? Math.min(domHtml.length, startIndex + 40000)
  return toVisibleText(domHtml.slice(startIndex, end))
}

function findByHeading(domHtml, patterns) {
  for (const pattern of patterns) {
    const headingRe = new RegExp(`<h[1-4][^>]*>[^<]*${pattern.source}[^<]*<`, 'i')
    const match = headingRe.exec(domHtml)
    if (match) return match.index
  }
  return -1
}

const CITATION_HOST_RE = /(doi\.org|pubmed\.ncbi\.nlm\.nih\.gov|ncbi\.nlm\.nih\.gov|clinicaltrials\.gov|cochranelibrary\.com|examine\.com)/gi

function countCitations(domHtml) {
  const hrefs = domHtml.match(/href=["'][^"']+["']/gi) ?? []
  let count = 0
  for (const href of hrefs) {
    CITATION_HOST_RE.lastIndex = 0
    if (CITATION_HOST_RE.test(href)) count += 1
  }
  return count
}

function isNoindex(html) {
  return /<meta[^>]+name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html)
}

function listPages(familyDir) {
  const base = path.join(OUT_DIR, familyDir)
  if (!existsSync(base)) return []
  const pages = []
  for (const entry of readdirSync(base, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const file = path.join(base, entry.name, 'index.html')
    if (existsSync(file)) pages.push({ slug: entry.name, file })
  }
  return pages.sort((a, b) => a.slug.localeCompare(b.slug))
}

/* ----------------------------------------------------------------- audit -- */

function auditPage(family, page) {
  const html = readFileSync(page.file, 'utf8')
  const domHtml = toDomHtml(html)
  const pageText = toVisibleText(domHtml)

  const allSections = [...family.sections, ...family.softSections]
  const positions = anchorPositions(domHtml, allSections.map((s) => s.id))

  // Heading fallback, then raw-text fallback, for sections rendered without an id.
  for (const section of allSections) {
    if (positions.has(section.id)) continue
    const headingIdx = findByHeading(domHtml, section.headingPatterns)
    if (headingIdx >= 0) {
      positions.set(section.id, headingIdx)
      continue
    }
    for (const pattern of section.textPatterns) {
      const match = pattern.exec(domHtml)
      if (match) {
        positions.set(section.id, match.index)
        break
      }
    }
  }

  const allStarts = [...positions.values()]
  const findings = []
  const sectionReport = {}

  for (const section of allSections) {
    const soft = family.softSections.includes(section)
    const start = positions.get(section.id)
    if (start === undefined) {
      sectionReport[section.id] = { present: false, chars: 0, soft }
      if (!soft) findings.push({ section: section.id, label: section.label, issue: 'missing', chars: 0 })
      continue
    }
    const text = sliceSectionText(domHtml, start, allStarts)
    const chars = text.length
    sectionReport[section.id] = { present: true, chars, soft }
    if (chars < section.minChars && !soft) {
      findings.push({ section: section.id, label: section.label, issue: 'thin', chars, min: section.minChars })
    }
  }

  const citations = countCitations(domHtml)
  if (citations === 0) findings.push({ section: 'references', label: 'Citations', issue: 'no-citation-links', chars: 0 })

  if (pageText.length < family.minPageChars) {
    findings.push({ section: 'page', label: 'Whole page', issue: 'thin-page', chars: pageText.length, min: family.minPageChars })
  }

  const h1 = /<h1\b[^>]*>([\s\S]*?)<\/h1>/i.exec(domHtml)
  if (!h1 || toVisibleText(h1[1]).length < 2) {
    findings.push({ section: 'page', label: 'H1', issue: 'missing-h1', chars: 0 })
  }

  return {
    slug: page.slug,
    url: `/${family.dir}/${page.slug}/`,
    noindex: isNoindex(html),
    visibleChars: pageText.length,
    citationLinks: citations,
    sections: sectionReport,
    findings,
    status: findings.length === 0 ? 'pass' : 'fail',
  }
}

/* ------------------------------------------------------------------ main -- */

function main() {
  if (!existsSync(OUT_DIR)) {
    console.error(`[crawler-visible] Build output not found at ${OUT_DIR}. Run \`npm run build\` first.`)
    process.exit(args.strict ? 1 : 0)
  }

  const selected = Object.entries(FAMILIES).filter(([name]) => !args.families || args.families.includes(name))
  const report = { generatedAt: new Date().toISOString(), outDir: path.relative(ROOT, OUT_DIR) || '.', families: {} }
  let totalFail = 0
  let totalPages = 0

  for (const [name, family] of selected) {
    let pages = listPages(family.dir)
    if (args.limit > 0) pages = pages.slice(0, args.limit)
    const results = pages.map((page) => auditPage(family, page))
    const indexable = results.filter((r) => !r.noindex)
    const failures = indexable.filter((r) => r.status === 'fail')

    // Aggregate which sections break most often — this is the template-level signal.
    const issueCounts = {}
    for (const result of failures) {
      for (const finding of result.findings) {
        const key = `${finding.section}:${finding.issue}`
        issueCounts[key] = (issueCounts[key] ?? 0) + 1
      }
    }

    const verdictCoverage = indexable.filter((r) => r.sections.verdict?.present).length

    report.families[name] = {
      label: family.label,
      pages: results.length,
      indexable: indexable.length,
      noindex: results.length - indexable.length,
      passing: indexable.length - failures.length,
      failing: failures.length,
      verdictCoverage,
      verdictCoveragePct: indexable.length ? Number(((verdictCoverage / indexable.length) * 100).toFixed(1)) : 0,
      medianVisibleChars: median(indexable.map((r) => r.visibleChars)),
      medianCitationLinks: median(indexable.map((r) => r.citationLinks)),
      issueCounts,
      results,
    }

    totalFail += failures.length
    totalPages += indexable.length
  }

  mkdirSync(path.dirname(REPORT_PATH), { recursive: true })
  writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`)

  if (!args.quiet) printSummary(report, totalPages, totalFail)

  if (args.strict && totalFail > 0) {
    console.error(`\n[crawler-visible] FAILED — ${totalFail} indexable page(s) hide required content from crawlers.`)
    process.exit(1)
  }
}

function median(values) {
  if (!values.length) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2)
}

function printSummary(report, totalPages, totalFail) {
  console.log('\nCrawler-visible content audit')
  console.log('='.repeat(60))
  for (const [name, family] of Object.entries(report.families)) {
    console.log(`\n${family.label} (${name})`)
    console.log(`  indexable pages     ${family.indexable}  (noindex: ${family.noindex})`)
    console.log(`  passing             ${family.passing}`)
    console.log(`  failing             ${family.failing}`)
    console.log(`  median visible text ${family.medianVisibleChars} chars`)
    console.log(`  median citations    ${family.medianCitationLinks} links`)
    console.log(`  verdict coverage    ${family.verdictCoverage}/${family.indexable} (${family.verdictCoveragePct}%)`)
    const issues = Object.entries(family.issueCounts).sort((a, b) => b[1] - a[1])
    if (issues.length) {
      console.log('  top template-level issues:')
      for (const [key, count] of issues.slice(0, 10)) console.log(`    ${String(count).padStart(5)}  ${key}`)
    }
  }
  console.log(`\nReport: ${path.relative(ROOT, REPORT_PATH)}`)
  console.log(`Totals: ${totalPages - totalFail}/${totalPages} indexable pages fully crawler-visible.`)
}

main()
