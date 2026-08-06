import { describe, expect, it } from 'vitest'
import { primaryNavigation } from '../primary-navigation'

describe('primary navigation', () => {
  it('exposes the Botanical Activity Atlas through the Tools menu', () => {
    const tools = primaryNavigation.find((item) => item.label === 'Tools')
    const atlas = tools?.children?.find((item) => item.href === '/tools/botanical-activity-atlas')

    expect(tools?.activePrefixes).toContain('/tools')
    expect(atlas).toMatchObject({
      label: 'Botanical Activity Atlas',
      href: '/tools/botanical-activity-atlas',
    })
  })
})
