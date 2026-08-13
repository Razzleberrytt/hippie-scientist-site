import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), 'utf8')

const WITHDRAWN_CARD_PMIDS = [
  '29324881',
  '31443482',
  '33842104',
  '31048821',
  '32009843',
  '32540634',
]

describe('Evidence Digest integrity reset', () => {
  it('withdraws the unverified study feed and keeps the route noindex during re-audit', () => {
    const page = read('app/evidence/evidence-digest/page.tsx')

    expect(page).toContain('Source Verification in Progress')
    expect(page).toContain('study identifiers, intervention details, outcome summaries, and evidence labels are re-audited')
    expect(page).toContain('index: false')
    expect(page).toContain('follow: true')

    for (const pmid of WITHDRAWN_CARD_PMIDS) {
      expect(page).not.toContain(`PMID ${pmid}`)
      expect(page).not.toContain(`pmid: '${pmid}'`)
    }

    expect(page).not.toContain('600mg daily of standardized Ashwagandha extract (KSM-66) over 8 weeks')
    expect(page).not.toContain('Our research team reviews peer-reviewed literature weekly')
  })

  it('removes the withdrawn digest from the core index allowlist', () => {
    const allowlist = read('src/lib/index-allowlist.ts')

    expect(allowlist).not.toContain("'/evidence/evidence-digest',")
  })
})
