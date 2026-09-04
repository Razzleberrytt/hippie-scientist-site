/**
 * report:faq-coverage — which guide pages actually emit FAQPage structured data.
 *
 * This exists because the question is genuinely hard to answer by reading the
 * code, and I got it wrong three times in a row while working on the sleep
 * cluster. The repository emits FAQPage through three different paths:
 *
 *   1. `faqs={...}` passed to components/StructuredData.tsx
 *   2. `faqPageJsonLd(...)` called directly in the page
 *   3. shared data — a GoalClusterArticlePage page.tsx is 11 lines and contains
 *      no FAQ markup at all; the schema comes from lib/sleep-cluster-content.ts
 *
 * Grepping any single mechanism undercounts. Grepping the literal string
 * "FAQPage" finds *none* of them, because all three live in shared helpers. The
 * successive wrong answers were 3/16, then 10/16, then 13/16; the real figure
 * was 13/16 before the FAQ work and 16/16 after.
 *
 * Both (2) and (3) additionally require >= 2 answers that pass
 * isMeaningfulFaqAnswer, so counting FAQ *entries* also overcounts — a page can
 * carry FAQ data and still emit no schema.
 *
 * Read-only. Prints a table and exits 0; pass --json for machine output.
 */

import fs from 'node:fs'
import path from 'node:path'

import { isMeaningfulFaqAnswer } from '../../lib/seo'
import { getSleepArticleContent } from '../../lib/sleep-cluster-content'

type Row = { slug: string; mechanism: string | null; detail: string }

const ROOT = process.cwd()
const CLUSTER_DIRS = ['app/guides/sleep']

function inspect(dir: string, slug: string): Row {
  const file = path.join(ROOT, dir, slug, 'page.tsx')
  const src = fs.readFileSync(file, 'utf8')

  if (/faqs=\{/.test(src)) return { slug, mechanism: 'StructuredData faqs=', detail: '' }
  if (/faqPageJsonLd\(/.test(src)) return { slug, mechanism: 'faqPageJsonLd', detail: '' }

  // An 11-line GoalClusterArticlePage re-export carries no FAQ markup; the
  // schema is assembled from shared content keyed by slug.
  if (/GoalClusterArticlePage/.test(src)) {
    const content = getSleepArticleContent(slug as never) as { faq?: Array<{ answer: string }> } | undefined
    const meaningful = (content?.faq ?? []).filter((item) => isMeaningfulFaqAnswer(item.answer))
    return meaningful.length >= 2
      ? { slug, mechanism: 'shared content', detail: `${meaningful.length} meaningful answers` }
      : { slug, mechanism: null, detail: `${meaningful.length} meaningful answers (needs >= 2)` }
  }

  return { slug, mechanism: null, detail: '' }
}

function main(): void {
  const asJson = process.argv.includes('--json')
  const all: Array<Row & { dir: string }> = []

  for (const dir of CLUSTER_DIRS) {
    const full = path.join(ROOT, dir)
    if (!fs.existsSync(full)) continue
    for (const entry of fs.readdirSync(full, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue
      if (!fs.existsSync(path.join(full, entry.name, 'page.tsx'))) continue
      all.push({ ...inspect(dir, entry.name), dir })
    }
  }

  const covered = all.filter((row) => row.mechanism)

  if (asJson) {
    console.log(JSON.stringify({ total: all.length, covered: covered.length, rows: all }, null, 2))
    return
  }

  console.log('\nFAQPage coverage (read-only)\n')
  for (const row of all.sort((a, b) => a.slug.localeCompare(b.slug))) {
    const flag = row.mechanism ? 'FAQ ' : '--- '
    const via = row.mechanism ? `${row.mechanism}${row.detail ? ` — ${row.detail}` : ''}` : row.detail || 'no FAQ schema'
    console.log(`  ${flag} ${row.slug.padEnd(46)} ${via}`)
  }
  console.log(`\n  ${covered.length} / ${all.length} pages emit FAQPage.`)
  console.log('  Counted by resolving all three mechanisms, not by grepping page files.\n')
}

main()
