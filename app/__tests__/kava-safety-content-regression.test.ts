import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8')
const compare = () => read('app/guides/compare/kava-vs-alcohol/page.tsx')
const alternatives = () => read('app/guides/anxiety/natural-anxiolytics-beyond-ashwagandha/page.tsx')
const hub = () => read('app/guides/anxiety/page.tsx')

describe('kava safety and citation content', () => {
  it('maps the comparison 2013 Sarris trial to the verified PMID', () => {
    expect(compare()).toContain('https://pubmed.ncbi.nlm.nih.gov/23635869/')
    expect(compare()).not.toContain('23942365')
  })

  it('maps the alternative-herbs 2013 Sarris trial to the verified PMID', () => {
    expect(alternatives()).toContain('https://pubmed.ncbi.nlm.nih.gov/23635869/')
    expect(alternatives()).not.toContain('23942365')
  })

  it('maps the 2020 171-person GAD study to its correct PMID', () => {
    expect(hub()).toContain('https://pubmed.ncbi.nlm.nih.gov/31813230/')
    expect(hub()).not.toContain('31665900')
  })

  it('explicitly reports serious liver outcomes in the comparison', () => {
    const source = compare()
    for (const term of ['liver failure', 'transplantation', 'death']) {
      expect(source).toContain(term)
    }
  })

  it('does not equate water extraction with liver safety', () => {
    const source = compare()
    expect(source).toContain('beverages prepared with water')
    expect(source).toContain('no preparation has been proven to eliminate that risk')
  })

  it('does not reintroduce noble-cultivar or guaranteed-clear-headed safety promises', () => {
    const source = compare().toLowerCase()
    for (const wording of ['noble kava safer', 'much stronger safety record', 'mental clarity preserved', 'preserves mental clarity', 'liver safety depends on using noble']) {
      expect(source).not.toContain(wording)
    }
  })

  it('preserves both positive early and negative later GAD trial context', () => {
    const source = compare()
    expect(source).toContain('earlier six-week trial found a benefit')
    expect(source).toContain('171 adults found no significant improvement')
  })

  it('preserves explicit alcohol and sedative cautions', () => {
    const source = compare()
    expect(source).toContain('Do not combine kava with alcohol or other sedatives')
    expect(source).toContain('people with liver disease')
  })

  it('removes rapid-anxiety-relief promises from the alternatives guide', () => {
    const source = alternatives()
    expect(source).toContain('Rare serious liver injury')
    expect(source).toContain('anxiety trial findings are mixed')
    expect(source).not.toContain('rapid situational anxiety relief')
  })

  it('uses shared constants for all visible and structured FAQ answers', () => {
    const source = compare()
    for (const name of ['KAVA_FAQ_ALTERNATIVE', 'KAVA_FAQ_LIVER', 'KAVA_FAQ_EFFECTS']) {
      expect(source).toContain('const ' + name + ' = ')
      expect(source).toContain('<p>{' + name + '}</p>')
      expect(source).toContain('answer: ' + name)
    }
  })
})
