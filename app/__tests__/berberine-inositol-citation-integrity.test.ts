import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const page = readFileSync(
  path.join(process.cwd(), 'app/guides/compare/berberine-vs-inositol/page.tsx'),
  'utf8',
)
const citationBlock = page.split('const BERBERINE_VS_INOSITOL_REFS = [')[1]?.split('const COMPARISON_ROWS = [')[0] ?? ''

describe('berberine vs inositol source integrity', () => {
  it('links berberine publications to their correct PMID identities', () => {
    expect(citationBlock).toContain('Metabolism, 57(5): 712-717')
    expect(citationBlock).toContain('(2008)')
    expect(citationBlock).toContain('pubmed.ncbi.nlm.nih.gov/18442638/')
    expect(citationBlock).toContain('Eur J Clin Pharmacol, 68(2): 213-217')
    expect(citationBlock).toContain('pubmed.ncbi.nlm.nih.gov/21870106/')
    expect(citationBlock).not.toContain('18442639')
    expect(citationBlock).not.toContain('21575678')
  })

  it('uses an actual PCOS inositol systematic review and guideline', () => {
    expect(citationBlock).toContain('pubmed.ncbi.nlm.nih.gov/38163998/')
    expect(citationBlock).toContain('PMC10477934')
    expect(citationBlock).not.toContain('29498933')
    expect(citationBlock).not.toContain('34078260')
    expect(page).toContain('limited and inconclusive')
  })

  it('does not convert observational or male hormone pilot data into PCOS efficacy evidence', () => {
    expect(page).not.toContain('Inositol has RCT meta-analysis support in PCOS')
    expect(page).not.toContain('meta-analysis of randomised trials covers insulin')
    expect(page).toContain('ten-man hormone pilot')
    expect(page).toContain('Exeltis')
    expect(page).toContain('Lo.Li. Pharma')
    expect(page).toContain('Editorial citation correction')
  })

  it('does not misrepresent the populations or assert a head-to-head comparison', () => {
    expect(page).toContain('No cited trial directly compares the two')
    expect(page).toContain('type 2 diabetes')
    expect(page).toContain('PCOS')
    expect(page).toContain('insufficient direct evidence')
    expect(page).toContain('a 2024 systematic review found the evidence limited and inconclusive')
  })

  it('preserves medical caution and canonical route', () => {
    expect(page).toContain('hypoglycaemia')
    expect(page).toContain('CYP2D6')
    expect(page).toContain('Neither is a substitute for prescribed diabetes or PCOS treatment')
    expect(page).toContain("path: '/guides/compare/berberine-vs-inositol/'")
    expect(page).toContain("pagePath=\"/guides/compare/berberine-vs-inositol/\"")
  })
})
