import fs from 'node:fs'
import path from 'node:path'

/**
 * Claim-discipline guard for the editorial layer.
 *
 * The workbook data already passes `validate:evidence-language`. This guard
 * covers the *curated editorial layer* — the site's expressed point of view in
 * `config/profile-verdicts.ts` — where an overconfident or unsafe phrase would
 * be most damaging. That file is small and fully author-controlled, so banned
 * phrases there are a HARD failure.
 *
 * Article prose (`content/articles/*.md`) is scanned in WARN-only mode: it is
 * long-form and legitimately quotes bad claims as examples ("avoid 'cures
 * anxiety in 24 hours'"), defines terms, and negates claims ("not a cure-all").
 * Failing on that would be false-positive chaos, so we only surface warnings a
 * human can review — never break the build on prose.
 *
 * Keep the banned list about *dangerous overclaiming*, not normal educational
 * hedged language ("may help", "evidence suggests" stay welcome).
 */

const ROOT = process.cwd()

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

// Tokens that indicate the phrase is negated, quoted as a bad example, or
// definitional — used to suppress WARN-mode noise on article prose.
const CONTEXT_EXONERATORS =
  /\b(?:not|no|never|without|isn't|aren't|don't|doesn't|won't|myth|avoid|red flag|unrealistic|distrust|beware|claim|marketing|hype|so-called|rather than|instead of|there is no|not a|money-back|standardiz|marker compound|warranty|refund)\b/i

// Reference/citation metadata (YAML frontmatter or PubMed links) legitimately
// carries study titles like "…for treating anxiety" — never a site claim.
const REFERENCE_LINE = /^\s*-?\s*(?:title|authors?|url|pmid|doi|year|journal):/i
const CITATION_URL = /pubmed\.ncbi|doi\.org|ncbi\.nlm/i

function scanText(text, { negationAware }) {
  const hits = []
  const lines = text.split('\n')
  lines.forEach((line, i) => {
    if (negationAware && (REFERENCE_LINE.test(line) || CITATION_URL.test(line))) return
    for (const { re, name } of BANNED) {
      const m = line.match(re)
      if (!m) continue
      if (negationAware) {
        // Look at a window around the match for exonerating context.
        const idx = m.index ?? 0
        const window = line.slice(Math.max(0, idx - 60), idx + m[0].length + 40)
        if (CONTEXT_EXONERATORS.test(window)) continue
      }
      hits.push({ line: i + 1, name, matched: m[0], text: line.trim().slice(0, 120) })
    }
  })
  return hits
}

// ── HARD gate: curated editorial overlay ─────────────────────────────────────
const overlayPath = path.join(ROOT, 'config/profile-verdicts.ts')
const overlayHits = scanText(fs.readFileSync(overlayPath, 'utf8'), { negationAware: false })

// ── WARN only: article prose ─────────────────────────────────────────────────
const articlesDir = path.join(ROOT, 'content/articles')
const warnings = []
if (fs.existsSync(articlesDir)) {
  for (const file of fs.readdirSync(articlesDir).filter((f) => /\.mdx?$/.test(f))) {
    const hits = scanText(fs.readFileSync(path.join(articlesDir, file), 'utf8'), { negationAware: true })
    for (const h of hits) warnings.push({ file: `content/articles/${file}`, ...h })
  }
}

if (warnings.length) {
  console.warn(`validate-claim-discipline: ${warnings.length} prose warning(s) to review (non-failing):`)
  for (const w of warnings) console.warn(`  - ${w.file}:${w.line} [${w.name}] "${w.matched}" — ${w.text}`)
}

if (overlayHits.length) {
  console.error('\nvalidate-claim-discipline: FAILED — banned overclaim phrasing in config/profile-verdicts.ts:')
  for (const h of overlayHits) {
    console.error(`  - line ${h.line} [${h.name}] "${h.matched}" — ${h.text}`)
  }
  console.error('\nUse calibrated, hedged language instead (may help, evidence suggests, appears more useful for).')
  process.exit(1)
}

console.log('validate-claim-discipline: OK (curated overlay clean' +
  (warnings.length ? `; ${warnings.length} prose warning(s) above)` : ')'))
