import fs from 'node:fs'
import path from 'node:path'

/**
 * Safety-visibility guard for high-risk curated profiles.
 *
 * Pass 6 documented per-topic safety minimums in
 * docs/evidence-and-claim-discipline.md. This turns the highest-risk ones into a
 * machine check: the curated overlay entry for each listed profile must visibly
 * carry the required cautions (in safetyNote, notIdealFor, bottomLine, or the
 * evidenceConfidence takeaway — anywhere in that profile's overlay block).
 *
 * Scope is the curated overlay only (config/profile-verdicts.ts) — small,
 * authored, and where a missing caution on a "we recommend this" surface is most
 * dangerous. Each requirement is a group of alternative phrasings; a profile
 * satisfies a requirement if ANY phrasing in the group appears in its block. Keep
 * requirements loose enough to avoid false positives on reasonable wording.
 */

const ROOT = process.cwd()
const src = fs.readFileSync(path.join(ROOT, 'config/profile-verdicts.ts'), 'utf8')

// slug → list of requirements; each requirement is a list of accepted regexes.
const REQUIREMENTS = {
  // Kava (indexed as the herb piper-methysticum)
  'piper-methysticum': [
    { label: 'liver caution', any: [/liver/i, /hepato/i] },
    { label: 'alcohol / sedative caution', any: [/alcohol/i, /sedativ/i] },
  ],
  ashwagandha: [
    { label: 'pregnancy caution', any: [/pregnan/i] },
    { label: 'thyroid caution', any: [/thyroid/i] },
    { label: 'sedative or liver caution', any: [/sedativ/i, /liver/i, /immunosuppress/i] },
  ],
  melatonin: [
    { label: 'circadian / timing framing', any: [/circadian/i, /timing/i, /jet lag/i] },
    { label: 'next-day grogginess caution', any: [/grogg/i, /next-day/i, /morning/i] },
    { label: 'dose / clinician caution', any: [/clinician/i, /lowest effective/i, /overshoot/i, /medication/i] },
  ],
  magnesium: [{ label: 'kidney / renal caution', any: [/kidney/i, /renal/i] }],
  'magnesium-glycinate': [{ label: 'kidney / renal caution', any: [/kidney/i, /renal/i] }],
  caffeine: [
    { label: 'anxiety caution', any: [/anxiety/i, /anxious/i, /jitter/i] },
    { label: 'sleep-disruption caution', any: [/sleep/i, /late-day/i, /late or high/i] },
    { label: 'stimulant-stacking or BP caution', any: [/stack/i, /stimulant/i, /blood pressure/i, /\bbp\b/i, /taper/i] },
  ],
  rhodiola: [
    { label: 'over-stimulation caution', any: [/stimulat/i, /activating/i] },
    { label: 'bipolar / mania caution', any: [/bipolar/i, /mania/i] },
  ],
}

/** Extract the overlay object block for a given slug key (2-space-indented entry). */
function blockFor(slug) {
  // Match `  slug: {` or `  'slug': {` at 2-space indent, then read to the first
  // line that is exactly `  },` (closes the profile object).
  const keyRe = new RegExp(`^  (?:'${slug}'|${slug}):\\s*\\{$`, 'm')
  const m = src.match(keyRe)
  if (!m) return null
  const start = m.index
  const rest = src.slice(start)
  const closeIdx = rest.search(/\n {2}\},\n/)
  return closeIdx === -1 ? rest : rest.slice(0, closeIdx)
}

const errors = []
for (const [slug, reqs] of Object.entries(REQUIREMENTS)) {
  const block = blockFor(slug)
  if (!block) {
    errors.push(`${slug}: no curated overlay block found (expected a high-risk profile entry)`)
    continue
  }
  for (const req of reqs) {
    if (!req.any.some((re) => re.test(block))) {
      errors.push(`${slug}: missing ${req.label}`)
    }
  }
}

if (errors.length) {
  console.error('validate-safety-visibility: FAILED — required cautions missing from curated overlay:')
  for (const e of errors) console.error(`  - ${e}`)
  console.error('\nAdd the caution to the profile\'s safetyNote / notIdealFor / bottomLine in config/profile-verdicts.ts.')
  process.exit(1)
}

console.log(`validate-safety-visibility: OK (${Object.keys(REQUIREMENTS).length} high-risk profiles carry required cautions)`)
