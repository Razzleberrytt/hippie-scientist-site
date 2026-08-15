import { describe, expect, it } from 'vitest'
import { primaryNavigation } from '../primary-navigation'

describe('primary navigation', () => {
  it('keeps the four dominant user intents at the top level', () => {
    expect(primaryNavigation.map((item) => item.label)).toEqual([
      'Goals',
      'Ingredients',
      'Compare',
      'Safety',
    ])
  })

  it('keeps advanced research tools accessible without another top-level choice', () => {
    const ingredients = primaryNavigation.find((item) => item.label === 'Ingredients')
    const atlas = ingredients?.children?.find((item) => item.href === '/tools/botanical-activity-atlas')
    const report = ingredients?.children?.find((item) => item.href === '/evidence/evidence-report')
    const tools = ingredients?.children?.find((item) => item.href === '/tools')

    expect(atlas?.label).toBe('Botanical Activity Atlas')
    expect(report?.label).toBe('Evidence Report')
    expect(tools?.label).toBe('All research tools')
  })

  it('offers a working Safety Checker example from the Safety intent', () => {
    const safety = primaryNavigation.find((item) => item.label === 'Safety')
    const example = safety?.children?.find((item) => item.label === 'Try Ashwagandha + Melatonin')

    expect(example?.href).toContain('/safety-checker?items=')
    expect(example?.href).toContain('ashwagandha')
    expect(example?.href).toContain('melatonin')
  })
})
