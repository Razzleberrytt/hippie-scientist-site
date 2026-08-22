import { describe, expect, it } from 'vitest'
import { coreGoals } from '../core-goals'
import { primaryNavigation } from '../primary-navigation'

describe('primary navigation', () => {
  it('puts the four dominant user intents first', () => {
    expect(primaryNavigation.slice(0, 4).map((item) => item.label)).toEqual([
      'Goals',
      'Ingredients',
      'Compare',
      'Safety',
    ])
    expect(primaryNavigation[4]?.label).toBe('Research')
  })

  it('keeps the Goals menu inside the canonical goals namespace', () => {
    const goals = primaryNavigation.find((item) => item.label === 'Goals')
    const goalChildren = goals?.children?.filter((item) => item.section === 'Health goals') ?? []

    expect(goalChildren.map(({ label, href }) => ({ label, href }))).toEqual(
      coreGoals.map((goal) => ({ label: goal.label, href: goal.href.replace(/\/$/, '') })),
    )
    expect(goals?.children?.some((item) => item.href.startsWith('/guides/'))).toBe(false)
  })

  it('uses the source-first research library as the Research landing page', () => {
    const research = primaryNavigation.find((item) => item.label === 'Research')

    expect(research?.href).toBe('/research')
    expect(research?.activePrefixes).toContain('/research')
    expect(research?.children?.[0]).toMatchObject({
      label: 'Research library',
      href: '/research',
    })
  })

  it('keeps the Botanical Activity Atlas discoverable through Research', () => {
    const research = primaryNavigation.find((item) => item.label === 'Research')
    const atlas = research?.children?.find((item) => item.href === '/tools/botanical-activity-atlas')

    expect(research?.activePrefixes).toContain('/tools')
    expect(atlas).toMatchObject({
      label: 'Botanical Activity Atlas',
      href: '/tools/botanical-activity-atlas',
    })
  })

  it('keeps the flagship evidence resources distinct', () => {
    const research = primaryNavigation.find((item) => item.label === 'Research')
    expect(research?.children).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: 'Evidence Report', href: '/evidence/evidence-report' }),
      expect.objectContaining({ label: 'Evidence Database', href: '/evidence/evidence-checker' }),
      expect.objectContaining({ label: 'Citation explorer', href: '/learn/citation-explorer' }),
    ]))
  })
})
