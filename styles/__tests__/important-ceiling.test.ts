import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * A ceiling on `!important`, not a target of zero.
 *
 * `docs/design/PREMIUM_VISUAL_SYSTEM.md` names "adds a global `!important`
 * override to fight another canonical layer" as a reject condition, and the
 * count had reached 107. An audit of all of them
 * (`docs/generated/css-important-audit.md`) found that most are not the
 * accretion the count suggests:
 *
 *   54  genuine      reduced-motion resets, @media print, focus indicators, and
 *                    overrides of Tailwind utilities the markup applies directly
 *   34  ordering     could move into a later-loading canonical owner
 *   16  specificity  the competing selector is over-specific
 *    3  dead         no competing declaration remains
 *
 * Removing the 34 "ordering" ones in bulk was tried and reverted: the
 * computed-style harness reported 639 real differences on compound profiles.
 * See the DECISIONS entry for 2026-08-29.
 *
 * So the useful invariant today is that the number cannot grow. Lowering these
 * figures is welcome and expected; each reduction should come with a harness
 * run proving the rendering did not move.
 */

const ROOT = process.cwd()

/** Per-file ceiling. Lower these as declarations are verified and removed. */
const CEILING: Record<string, number> = {
  'app/globals.css': 19,
  'styles/premium-surface-details.css': 17,
  'styles/compact-hero-typography.css': 15,
  'styles/article-visual-polish.css': 14,
  'styles/herb-profile-polish.css': 11,
  'styles/editorial-content-surfaces.css': 10,
  'styles/accessibility-wcag-22.css': 8,
  'styles/premium-library-polish.css': 6,
  'styles/compact-safety-cautions.css': 3,
  'styles/homepage-premium-final.css': 2,
  'styles/resonant-theme-lighting.css': 1,
  'styles/premium-chrome.css': 1,
}

const TOTAL_CEILING = Object.values(CEILING).reduce((a, b) => a + b, 0)

function countImportant(relativePath: string): number {
  const file = path.join(ROOT, relativePath)
  if (!fs.existsSync(file)) return 0
  return fs.readFileSync(file, 'utf8').split(/\r?\n/).filter((l) => l.includes('!important')).length
}

function allStylesheets(): string[] {
  const out = ['app/globals.css']
  const dir = path.join(ROOT, 'styles')
  for (const name of fs.readdirSync(dir).filter((f) => f.endsWith('.css'))) out.push(`styles/${name}`)
  return out
}

describe('!important ceiling', () => {
  it('no stylesheet exceeds its recorded count', () => {
    const over: string[] = []
    for (const [file, limit] of Object.entries(CEILING)) {
      const actual = countImportant(file)
      if (actual > limit) over.push(`${file}: ${actual} > ${limit}`)
    }
    expect(over).toEqual([])
  })

  it('no stylesheet outside the recorded set introduces one', () => {
    const unlisted = allStylesheets()
      .filter((f) => !(f in CEILING))
      .filter((f) => countImportant(f) > 0)
      .map((f) => `${f}: ${countImportant(f)}`)
    expect(unlisted).toEqual([])
  })

  it('the repository-wide total does not rise', () => {
    const total = allStylesheets().reduce((n, f) => n + countImportant(f), 0)
    expect(total).toBeLessThanOrEqual(TOTAL_CEILING)
  })

  it('records the ceiling that the audit explains', () => {
    // If this fails, the audit and the ceiling have drifted apart and one of
    // them is lying. Regenerate with `node scripts/ci/audit-css-important.mjs`.
    expect(TOTAL_CEILING).toBe(107)
  })
})
