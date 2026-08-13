import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const readGuide = () => fs
  .readFileSync(path.join(process.cwd(), 'app/guides/other/pt-141/page.tsx'), 'utf8')
  .replace(/\s+/g, ' ')

describe('PT-141 / Vyleesi labeling accuracy', () => {
  it('keeps the approved indication narrow and does not market sexual performance use', () => {
    const page = readGuide()

    expect(page).toMatch(/acquired, generalized hypoactive sexual desire disorder \(HSDD\) in premenopausal women/i)
    expect(page).toMatch(/not indicated for HSDD in postmenopausal women or in men/i)
    expect(page).toMatch(/not indicated to enhance sexual performance/i)
  })

  it('includes current cardiovascular and pigmentation safety boundaries', () => {
    const page = readGuide()

    expect(page).toMatch(/uncontrolled hypertension or known cardiovascular disease/i)
    expect(page).toMatch(/blood pressure can rise transiently and heart rate can decrease/i)
    expect(page).toMatch(/focal skin and mucosal pigmentation/i)
  })

  it('does not treat an RUO label as a categorical legality shortcut', () => {
    const page = readGuide()

    expect(page).toMatch(/research-use label does not convert an unapproved product into the FDA-approved drug/i)
    expect(page).not.toMatch(/RUO-labeled product is not legally intended for human consumption/i)
    expect(page).not.toMatch(/regulatory gray zone/i)
  })
})
