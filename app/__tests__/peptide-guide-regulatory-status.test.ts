import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const read = (relativePath: string) => fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8').replace(/\s+/g, ' ')

const guidePaths = [
  'app/guides/other/bpc-157/page.tsx',
  'app/guides/other/tb-500/page.tsx',
  'app/guides/other/cjc-1295/page.tsx',
  'app/guides/other/ipamorelin/page.tsx',
]

describe('peptide guide regulatory status', () => {
  it('does not describe the July 2026 FDA meeting as a future event', () => {
    const pages = guidePaths.map(read).join('\n')

    expect(pages).not.toMatch(/scheduled (?:for|to).*July 2[34],? 2026/i)
    expect(pages).not.toMatch(/pending the July 2026 PCAC/i)
    expect(pages).not.toMatch(/likely to be clarified by the July 2026/i)
    expect(pages).not.toMatch(/July 23–24, 2026:.*is scheduled/i)
  })

  it('does not turn RUO marketing or availability into legal authorization', () => {
    const pages = guidePaths.map(read).join('\n')

    expect(pages).not.toMatch(/legally sellable only as [“"]research use only/i)
    expect(pages).not.toMatch(/not legally intended for human consumption regardless/i)
    expect(pages).not.toMatch(/regulatory gray zone/i)
    expect(pages).not.toMatch(/moving toward Category 1/i)
    expect(pages).not.toMatch(/trending toward eventual compounding access/i)
  })

  it('keeps FDA approval and compounding status distinct', () => {
    const bpc = read(guidePaths[0])
    const tb500 = read(guidePaths[1])
    const cjc = read(guidePaths[2])
    const ipamorelin = read(guidePaths[3])

    expect(bpc).toContain('advisory-committee discussion or recommendation is not FDA approval')
    expect(tb500).toContain('Advisory-committee consideration does not equal FDA approval')
    expect(cjc).toContain('CJC-1295 is not FDA-approved')
    expect(ipamorelin).toContain('Ipamorelin is not FDA-approved as a finished drug product')
  })

  it('preserves current FDA safety signals instead of generic reassurance', () => {
    const bpc = read(guidePaths[0])
    const tb500 = read(guidePaths[1])
    const cjc = read(guidePaths[2])
    const ipamorelin = read(guidePaths[3])

    expect(bpc).toMatch(/no or only limited safety information/i)
    expect(tb500).toMatch(/not identified human exposure data/i)
    expect(cjc).toMatch(/increased heart rate and a systemic vasodilatory reaction/i)
    expect(ipamorelin).toMatch(/serious adverse events, including deaths/i)
  })
})
