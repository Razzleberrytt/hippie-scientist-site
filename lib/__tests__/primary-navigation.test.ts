import { describe, expect, it } from 'vitest'
import { coreGoals } from '../core-goals'
import { primaryNavigation } from '../primary-navigation'

describe('primary navigation', () => {
  it('keeps five distinct top-level jobs', () => {
    expect(primaryNavigation.map((item) => item.label)).toEqual([
      'Goals',
      'Guides',
      'Ingredients',
      'Safety',
      'Research',
    ])
  })

  it('keeps the Goals menu inside the canonical goals namespace', () => {
    const goals = primaryNavigation.find((item) => item.label === 'Goals')
    const goalChildren = goals?.children?.filter((item) => item.section === 'Health goals') ?? []

    expect(goalChildren.map(({ label, href }) => ({ label, href }))).toEqual(
      coreGoals.map((goal) => ({ label: goal.label, href: goal.href.replace(/\/$/, '') })),
    )
    expect(goals?.children?.some((item) => item.href.startsWith('/guides/'))).toBe(false)
  })

  it('makes Guides the front door to topic content', () => {
    const guides = primaryNavigation.find((item) => item.label === 'Guides')

    expect(guides?.href).toBe('/guides')
    expect(guides?.activePrefixes).toContain('/guides')
    expect(guides?.children?.[0]).toMatchObject({ label: 'All guides', href: '/guides' })
    expect(guides?.children).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: 'Mental Health', href: '/guides/mental-health' }),
      expect.objectContaining({ label: 'ADHD', href: '/guides/adhd' }),
      expect.objectContaining({ label: 'Comparisons', href: '/guides/compare' }),
      expect.objectContaining({ label: 'Substance Use & Harm Reduction', href: '/guides/substance-use' }),
    ]))
  })

  it('does not duplicate Compare as a top-level destination', () => {
    expect(primaryNavigation.some((item) => item.label === 'Compare')).toBe(false)
    const guides = primaryNavigation.find((item) => item.label === 'Guides')
    expect(guides?.children?.some((item) => item.href === '/guides/compare')).toBe(true)
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
