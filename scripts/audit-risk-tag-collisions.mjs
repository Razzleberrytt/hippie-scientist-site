#!/usr/bin/env node

// Guards against a real bug class found in production data (see
// docs/LOOP_NOTES.md, 2026-07-13): deriveInteractionData() in
// scripts/data/build-interaction-data.mjs matches risk keywords via plain
// String.includes(), with no word-boundary check. A keyword that happens to
// be a complete word (e.g. "liver") can match as a substring of an unrelated
// word (e.g. "delivery"), silently mislabeling an entity's risk mechanism.
//
// Legitimate matches are routinely formed by a medical prefix glued directly
// onto the keyword with no separator (e.g. "antidiabetic" -> "diabet",
// "hypertension" -> "hypertens") — those must NOT be flagged. This script
// flags only matches preceded by a letter that does NOT form one of those
// known-safe prefixes, so it can run over the real workbook with zero
// expected findings today and catch new collisions introduced by future
// enrichment edits before they reach entity_risk_tags.json.
//
// Informational by default (exit 0) since prefix curation is inherently
// incomplete; pass --strict to exit 1 on any finding (e.g. for a future,
// deliberate CI gate once the allowlist has proven itself over time).

import { assertWorkbookExists, resolveWorkbookPath } from './workbook-source.mjs'
import { getSheet, readWorkbook, sheetToRows } from './data/workbook-parser.mjs'
import { KEYWORDS } from './data/build-interaction-data.mjs'

const ENTITY_SHEET_CANDIDATES = ['Entity_Master', 'Sheet7']

// Prefixes that legitimately glue onto a keyword stem with no separator.
// Extend this list (not the matcher) when a new legitimate compound term
// is found — do not weaken the boundary check itself.
const ALLOWED_PREFIXES = [
  'anti', 'hyper', 'hypo', 'para', 'non', 'pre', 'post',
  'sub', 'poly', 'dys', 'over', 'under', 'co', 're',
]

function clean(value) {
  return String(value ?? '').trim()
}

function splitFlags(v) {
  return v == null ? [] : String(v).split(/[;,]/).map((s) => s.trim()).filter(Boolean)
}

export function findSuspectMatches(phrase) {
  const pl = phrase.toLowerCase()
  const suspects = []
  for (const [mech, keys] of Object.entries(KEYWORDS)) {
    for (const key of keys) {
      let from = 0
      let idx
      while ((idx = pl.indexOf(key, from)) !== -1) {
        from = idx + 1
        const before = idx > 0 ? pl[idx - 1] : ''
        if (/[a-z]/.test(before)) {
          let start = idx
          while (start > 0 && /[a-z]/.test(pl[start - 1])) start--
          const prefix = pl.slice(start, idx)
          if (!ALLOWED_PREFIXES.includes(prefix)) {
            suspects.push({ mech, key, prefix, phrase })
          }
        }
      }
    }
  }
  return suspects
}

async function main() {
  const strict = process.argv.includes('--strict')
  const workbookPath = resolveWorkbookPath(process.cwd())
  assertWorkbookExists(workbookPath)
  const wb = await readWorkbook(workbookPath)

  const sheetName = ENTITY_SHEET_CANDIDATES.find((c) => getSheet(wb, c))
  if (!sheetName) {
    console.error(`[audit:risk-tag-collisions] missing required sheet: ${ENTITY_SHEET_CANDIDATES.join(' or ')}`)
    process.exit(1)
  }
  const rows = sheetToRows(getSheet(wb, sheetName))

  const findings = []
  for (const row of rows) {
    const slug = clean(row.slug)
    for (const phrase of splitFlags(row.contraindications_or_flags)) {
      for (const suspect of findSuspectMatches(phrase)) {
        findings.push({ slug, ...suspect })
      }
    }
  }

  if (findings.length === 0) {
    console.log('[audit:risk-tag-collisions] clean — no unboundaried keyword matches found in contraindications_or_flags')
    process.exit(0)
  }

  console.log(`[audit:risk-tag-collisions] ${findings.length} potential substring-collision false positive(s):\n`)
  for (const f of findings) {
    console.log(`  ${f.slug} — mechanism "${f.mech}" matched "${f.key}" via prefix "${f.prefix}" in: "${f.phrase}"`)
  }
  console.log('\nIf a finding is a genuine new compound term (e.g. a novel medical prefix), add the prefix to')
  console.log('ALLOWED_PREFIXES in this script. Otherwise, reword the clause in the workbook to break the collision')
  console.log('(see docs/LOOP_NOTES.md, 2026-07-13 post-merge addendum, for a worked example).')

  process.exit(strict ? 1 : 0)
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}
