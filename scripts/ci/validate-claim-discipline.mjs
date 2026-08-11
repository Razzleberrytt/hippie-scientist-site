import fs from 'node:fs'
import path from 'node:path'

/**
 * Claim-discipline guard for the editorial layer.
 *
 * The workbook data already passes `validate:evidence-language`. This guard
 * covers the curated editorial layer where an overconfident or unsafe phrase
 * would be most damaging.
 *
 * HARD gate:
 *   - config/profile-verdicts.ts (small, fully author-controlled overlay)
 *
 * WARN-only debt inventory:
 *   - content/articles/**/*.{md,mdx}
 *   - app/guides/**/*.{ts,tsx}
 *
 * The guide scan intentionally starts warn-only because the App Router guide
 * library predates this guard and contains legacy phrasing. Surfacing that debt
 * in CI gives us a stable migration queue without breaking unrelated work. As
 * priority guides are calibrated, they can graduate to hard-gated coverage.
 */

const ROOT = process.cwd()
const MAX_WARNINGS_PRINTED = 120

// Dangerous overclaim / unsafe phrasing. Whole-word / phrase anchored.
const BANNED = [
  { re: /\bcure-?alls?\b/i, name: 'cure-all' },
  { re: /\bcures?\b/i, name: 'cure claim' },
  { re: /\bguarantee(?:d|s)?\b/i, name: 'guarantee' },
  { re: /\bmiracle\b/i, name: 'miracle' },
  { re: /\brisk-free\b/i, name: 'risk-free' },
  { re: /\bno risk\b/i, name: 'no risk' },
  { re: /\b(?:completely|totally|perfectly|100%|entirely)\s+safe\b/i, name: 'absolute-safety claim' },
  { re: /\bsafe for everyone\b/i, name: 'safe for everyone' },
  { re: /\bworks for everyone\b/i, name: 'works for everyone' },
  { re: /\b(?:no|zero)\s+side\s+effects?\b/i, name: 'no side effects' },
  { re: /\beliminates?\s+(?:anxiety|stress|insomnia|depression)\b/i, name: 'eliminates-symptom claim' },
  { re: /\b(?:treats?|treating|treatment for)\s+(?:anxiety|insomnia|depression|disease)\b/i, name: 'treats-condition claim' },
  { re: /\bproven\s+to\s+(?:cure|fix|treat|prevent|work)\b/i, name: 'proven-to claim' },
  { re: /\bproven cure\b/i, name: 'proven cure' },
]

// High-signal patterns found in bespoke decision guides. These are not always
// wrong in every imaginable context, so they are debt warnings rather than a
// global hard failure. They flag copy that deserves claim-level sourcing or a
// more explicit evidence boundary before it is used to guide a purchase/stack.
const GUIDE_RISK_PATTERNS = [
  {
    re: /\b(?:no\s+(?:well[- ]documented\s+)?major|no\s+known\s+major)\s+interactions?\b/i,
    name: 'interaction reassurance',
  },
  {
    re: /\bsafe\s+to\s+(?:combine|stack|take\s+together)\b/i,
    name: 'combination safety reassurance',
  },
  {
    re: /\bworks?\s+(?:within|in)\s+\d+(?:\s*[–-]\s*\d+)?\s*(?:minutes?|hours?|days?|weeks?)\b/i,
    name: 'efficacy timing certainty',
  },
  {
    re: /\b(?:fastest|cleaner|best)\s+(?:useful\s+)?(?:choice|option|pick)\b/i,
    name: 'pseudo-ranking recommendation',
  },
  {
    re: /\bmeaningful\s+effects?\s+(?:typically\s+)?require\s+\d+(?:\s*[–-]\s*\d+)?\s*(?:days?|weeks?|months?)\b/i,
    name: 'fixed efficacy timeline',
  },
]

// Tokens that indicate the phrase is negated, quoted as a bad example, or
// definitional — used to suppress WARN-mode noise on article/guide prose.
const CONTEXT_EXONERATORS =
  /\b(?:not|no|never|without|isn't|aren't|don't|doesn't|won't|myth|avoid|red flag|unrealistic|distrust|beware|claim|marketing|hype|so-called|rather than|instead of|there is no|not a|money-back|standardiz|marker compound|warranty|refund|does not establish|cannot establish)\b/i

// Reference/citation metadata legitimately carries study titles that look like
// claims — never treat those as site editorial language.
const REFERENCE_LINE = /^\s*-?\s*(?:title|authors?|url|pmid|doi|year|journal):/i
const CITATION_URL = /pubmed\.ncbi|doi\.org|ncbi\.nlm/i

function scanText(text, { negationAware, patterns = BANNED }) {
  const hits = []
  const lines = text.split('\n')
  lines.forEach((line, i) => {
    if (negationAware && (REFERENCE_LINE.test(line) || CITATION_URL.test(line))) return
    for (const { re, name } of patterns) {
      const m = line.match(re)
      if (!m) continue
      if (negationAware) {
        // Look at a local window around the match for exonerating context.
        const idx = m.index ?? 0
        const window = line.slice(Math.max(0, idx - 70), idx + m[0].length + 50)
        if (CONTEXT_EXONERATORS.test(window)) continue
      }
      hits.push({ line: i + 1, name, matched: m[0], text: line.trim().slice(0, 150) })
    }
  })
  return hits
}

function walkFiles(dir, matcher, prefix) {
  if (!fs.existsSync(dir)) return []
  const files = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const absolute = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...walkFiles(absolute, matcher, prefix))
      continue
    }
    if (!matcher.test(entry.name)) continue
    files.push({
      absolute,
      relative: path.relative(ROOT, absolute).replaceAll('\\', '/'),
      prefix,
    })
  }
  return files
}

function pushWarnings(target, file, hits) {
  for (const hit of hits) target.push({ file, ...hit })
}

// ── HARD gate: curated editorial overlay ─────────────────────────────────────
const overlayPath = path.join(ROOT, 'config/profile-verdicts.ts')
const overlayHits = scanText(fs.readFileSync(overlayPath, 'utf8'), {
  negationAware: false,
  patterns: BANNED,
})

// ── WARN only: long-form Markdown prose ──────────────────────────────────────
const warnings = []
for (const file of walkFiles(path.join(ROOT, 'content/articles'), /\.mdx?$/, 'article')) {
  const text = fs.readFileSync(file.absolute, 'utf8')
  pushWarnings(warnings, file.relative, scanText(text, { negationAware: true, patterns: BANNED }))
}

// ── WARN only: App Router decision guides ────────────────────────────────────
const guideWarnings = []
for (const file of walkFiles(path.join(ROOT, 'app/guides'), /\.(?:ts|tsx)$/, 'guide')) {
  const text = fs.readFileSync(file.absolute, 'utf8')
  pushWarnings(guideWarnings, file.relative, scanText(text, { negationAware: true, patterns: BANNED }))
  pushWarnings(guideWarnings, file.relative, scanText(text, { negationAware: true, patterns: GUIDE_RISK_PATTERNS }))
}

const allWarnings = [...warnings, ...guideWarnings]
if (allWarnings.length) {
  console.warn(
    `validate-claim-discipline: ${allWarnings.length} editorial warning(s) to review (non-failing; articles=${warnings.length}, app-guides=${guideWarnings.length}):`,
  )
  for (const warning of allWarnings.slice(0, MAX_WARNINGS_PRINTED)) {
    console.warn(
      `  - ${warning.file}:${warning.line} [${warning.name}] "${warning.matched}" — ${warning.text}`,
    )
  }
  if (allWarnings.length > MAX_WARNINGS_PRINTED) {
    console.warn(`  … ${allWarnings.length - MAX_WARNINGS_PRINTED} additional warning(s) omitted from console output`)
  }
}

if (overlayHits.length) {
  console.error('\nvalidate-claim-discipline: FAILED — banned overclaim phrasing in config/profile-verdicts.ts:')
  for (const hit of overlayHits) {
    console.error(`  - line ${hit.line} [${hit.name}] "${hit.matched}" — ${hit.text}`)
  }
  console.error('\nUse calibrated, hedged language instead (may help, evidence suggests, appears more useful for).')
  process.exit(1)
}

console.log(
  'validate-claim-discipline: OK (curated overlay clean' +
    (allWarnings.length ? `; ${allWarnings.length} editorial warning(s) surfaced)` : ')'),
)
