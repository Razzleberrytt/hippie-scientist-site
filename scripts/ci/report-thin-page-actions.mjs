#!/usr/bin/env node
/**
 * report-thin-page-actions.mjs
 *
 * Turns the quality-gate and citation-density scores into a single decision
 * list: for every profile URL, what should actually happen to it.
 *
 *   promote      already clears the gate but is noindexed — free inventory
 *   keep         indexed and passing
 *   upgrade      indexed, close to the bar, worth the editorial spend
 *   consolidate  a near-duplicate of a stronger sibling — redirect into it
 *   noindex      indexed, far below the bar, nothing to cite — stop indexing it
 *
 * A smaller library of excellent URLs beats hundreds of interchangeable ones,
 * so this errs toward consolidation over breadth.
 *
 * Usage:
 *   node scripts/ci/report-thin-page-actions.mjs
 *   node scripts/ci/report-thin-page-actions.mjs --min=60
 *
 * Reads (regenerating if absent is the caller's job):
 *   ops/reports/content-quality-gate.json
 *   ops/reports/citation-density.json
 *
 * Output: ops/reports/thin-page-actions.json + ops/reports/thin-page-actions.md
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { REPORTS_DIR, ROOT, loadProfileCorpus, percent } from '../lib/profile-corpus.mjs'

const argv = process.argv.slice(2)
const flag = (name, fallback) => {
  const hit = argv.find((a) => a === `--${name}` || a.startsWith(`--${name}=`))
  if (!hit) return fallback
  const [, value] = hit.split('=')
  return value === undefined ? true : value
}

const MIN_SCORE = Number(flag('min', 60))
const JSON_PATH = path.join(REPORTS_DIR, 'thin-page-actions.json')
const MD_PATH = path.join(REPORTS_DIR, 'thin-page-actions.md')

function readReport(name) {
  const file = path.join(REPORTS_DIR, name)
  if (!existsSync(file)) {
    console.error(`[thin-page-actions] Missing ${path.relative(ROOT, file)}.`)
    console.error('  Run: npm run gate:content-quality && npm run audit:citation-density')
    process.exit(1)
  }
  return JSON.parse(readFileSync(file, 'utf8'))
}

/* ---------------------------------------------------------- duplicates -- */

/**
 * Normalize a slug to its conceptual identity so alias pages collapse together:
 * `l-theanine` / `theanine`, `green-tea-egcg-isolated` /
 * `epigallocatechin-gallate-egcg`. Stereochemistry prefixes, isolation
 * qualifiers, and parenthetical abbreviations all describe the same entity.
 */
const NOISE_TOKENS = new Set([
  'isolated', 'extract', 'standardized', 'complex', 'supplement', 'powder',
  'acid', 'salt', 'form', 'root', 'leaf', 'the', 'and', 'of',
])

function conceptKey(slug, name) {
  const base = `${slug} ${name}`
    .toLowerCase()
    .replace(/\(([^)]+)\)/g, ' $1 ')
    .replace(/\b(l|d|dl|alpha|beta|gamma|n|s|r)-/g, '')
    .replace(/[^a-z0-9]+/g, ' ')

  // Short tokens are kept deliberately: the single character is the whole
  // distinction in "vitamin a" vs "vitamin d", and dropping it would propose
  // redirecting one nutrient into a different one.
  const tokens = base
    .split(' ')
    .map((t) => t.trim())
    .filter((t) => t.length > 0 && !NOISE_TOKENS.has(t))

  return [...new Set(tokens)].sort().join('-')
}

/** Group profiles that resolve to the same concept key. */
function findDuplicateGroups(entries) {
  const groups = new Map()
  for (const entry of entries) {
    const key = conceptKey(entry.slug, entry.name)
    if (!key) continue
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(entry)
  }
  return [...groups.entries()]
    .filter(([, members]) => members.length > 1)
    .map(([key, members]) => ({ key, members }))
}

/* ---------------------------------------------------------------- main -- */

function main() {
  const gate = readReport('content-quality-gate.json')
  const citations = readReport('citation-density.json')
  const { entries } = loadProfileCorpus()

  const gateBySlug = new Map(gate.profiles.map((p) => [`${p.kind}:${p.slug}`, p]))
  const citeBySlug = new Map(citations.profiles.map((p) => [`${p.kind}:${p.slug}`, p]))

  // A profile is a consolidation candidate when a stronger sibling covers the
  // same concept. The strongest member of each group is the survivor.
  const consolidationTargets = new Map()
  const duplicateGroups = findDuplicateGroups(entries)
  for (const group of duplicateGroups) {
    const ranked = [...group.members].sort((a, b) => {
      const scoreA = gateBySlug.get(`${a.kind}:${a.slug}`)?.score ?? 0
      const scoreB = gateBySlug.get(`${b.kind}:${b.slug}`)?.score ?? 0
      if (scoreB !== scoreA) return scoreB - scoreA
      return b.sourceCount - a.sourceCount
    })
    const [survivor, ...rest] = ranked
    for (const loser of rest) {
      // Only worth consolidating if the survivor is meaningfully stronger.
      const loserScore = gateBySlug.get(`${loser.kind}:${loser.slug}`)?.score ?? 0
      const survivorScore = gateBySlug.get(`${survivor.kind}:${survivor.slug}`)?.score ?? 0
      if (survivorScore - loserScore >= 10) {
        consolidationTargets.set(`${loser.kind}:${loser.slug}`, survivor.url)
      }
    }
  }

  const decisions = entries.map((entry) => {
    const key = `${entry.kind}:${entry.slug}`
    const gateRow = gateBySlug.get(key)
    const citeRow = citeBySlug.get(key)
    const score = gateRow?.score ?? 0
    const sources = citeRow?.uniqueSources ?? entry.sourceCount
    const consolidateInto = consolidationTargets.get(key)

    let action
    let reason

    if (!entry.indexable && score >= MIN_SCORE) {
      action = 'promote'
      reason = `Scores ${score} but is noindexed — already meets the publish bar.`
    } else if (!entry.indexable) {
      action = 'leave-noindexed'
      reason = `Scores ${score}; correctly excluded from the index.`
    } else if (consolidateInto) {
      action = 'consolidate'
      reason = `Duplicate concept; redirect into stronger page ${consolidateInto}.`
    } else if (score >= MIN_SCORE) {
      action = 'keep'
      reason = `Scores ${score} and is indexed.`
    } else if (sources === 0 && score < 40) {
      action = 'noindex'
      reason = `Indexed at score ${score} with zero citations — nothing to support a claim.`
    } else {
      action = 'upgrade'
      reason = `Indexed at score ${score}; needs ${(gateRow?.failingDimensions ?? []).join(', ') || 'more depth'}.`
    }

    return {
      kind: entry.kind,
      slug: entry.slug,
      url: entry.url,
      name: entry.name,
      indexable: entry.indexable,
      score,
      uniqueSources: sources,
      failingDimensions: gateRow?.failingDimensions ?? [],
      action,
      reason,
      consolidateInto: consolidateInto ?? null,
    }
  })

  const byAction = {}
  for (const decision of decisions) {
    if (!byAction[decision.action]) byAction[decision.action] = []
    byAction[decision.action].push(decision)
  }
  for (const list of Object.values(byAction)) list.sort((a, b) => b.score - a.score)

  const indexableCount = decisions.filter((d) => d.indexable).length
  const report = {
    generatedAt: new Date().toISOString(),
    minScore: MIN_SCORE,
    totals: {
      profiles: decisions.length,
      indexable: indexableCount,
      ...Object.fromEntries(Object.entries(byAction).map(([action, list]) => [action, list.length])),
    },
    // Net effect on the indexed library if every recommendation is applied.
    projectedIndexSize:
      indexableCount +
      (byAction.promote?.length ?? 0) -
      (byAction.noindex?.length ?? 0) -
      (byAction.consolidate?.length ?? 0),
    duplicateGroups: duplicateGroups.map((group) => ({
      key: group.key,
      members: group.members.map((m) => m.url),
    })),
    decisions,
  }

  mkdirSync(REPORTS_DIR, { recursive: true })
  writeFileSync(JSON_PATH, `${JSON.stringify(report, null, 2)}\n`)
  writeFileSync(MD_PATH, renderMarkdown(report, byAction))

  printSummary(report, byAction)
}

function renderMarkdown(report, byAction) {
  const lines = [
    '# Thin-page action plan',
    '',
    `Generated ${report.generatedAt} · pass floor ${report.minScore}/100`,
    '',
    `- Profiles: **${report.totals.profiles}** (indexable today: **${report.totals.indexable}**)`,
    `- Projected indexed library after applying this plan: **${report.projectedIndexSize}**`,
    '',
  ]

  const ORDER = [
    ['promote', 'Promote — passing the gate but noindexed'],
    ['noindex', 'Noindex — indexed but unsupportable'],
    ['consolidate', 'Consolidate — duplicate concepts'],
    ['upgrade', 'Upgrade — indexed and close to the bar'],
  ]

  for (const [action, heading] of ORDER) {
    const rows = byAction[action] ?? []
    if (!rows.length) continue
    lines.push(`## ${heading} (${rows.length})`, '')
    lines.push('| URL | Score | Sources | Detail |', '| --- | ---: | ---: | --- |')
    for (const row of rows.slice(0, 60)) {
      lines.push(`| \`${row.url}\` | ${row.score} | ${row.uniqueSources} | ${row.reason} |`)
    }
    if (rows.length > 60) lines.push(`| … | | | ${rows.length - 60} more in the JSON report |`)
    lines.push('')
  }

  return `${lines.join('\n')}\n`
}

function printSummary(report, byAction) {
  console.log('\nThin-page action plan')
  console.log('='.repeat(64))
  console.log(`Profiles: ${report.totals.profiles} · indexable today: ${report.totals.indexable}`)
  console.log(`Projected indexed library after plan: ${report.projectedIndexSize}`)
  console.log('')

  for (const [action, rows] of Object.entries(byAction).sort((a, b) => b[1].length - a[1].length)) {
    console.log(`  ${String(rows.length).padStart(5)}  ${action}`)
  }

  for (const action of ['promote', 'noindex', 'consolidate']) {
    const rows = byAction[action] ?? []
    if (!rows.length) continue
    console.log(`\n${action} (top ${Math.min(10, rows.length)} of ${rows.length}):`)
    for (const row of rows.slice(0, 10)) {
      console.log(`  ${String(row.score).padStart(3)}  ${row.url}${row.consolidateInto ? ` → ${row.consolidateInto}` : ''}`)
    }
  }

  const dupes = report.duplicateGroups.length
  console.log(`\nDuplicate concept groups detected: ${dupes}`)
  for (const group of report.duplicateGroups.slice(0, 8)) {
    console.log(`  ${group.members.join('  ·  ')}`)
  }

  console.log(`\nReports: ${path.relative(ROOT, JSON_PATH)}`)
  console.log(`         ${path.relative(ROOT, MD_PATH)}`)
  console.log(`\nIndexable pass rate today: ${percent(byAction.keep?.length ?? 0, report.totals.indexable)}%`)
}

main()
