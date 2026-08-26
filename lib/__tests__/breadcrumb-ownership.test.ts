import { describe, expect, it } from 'vitest'

import { hasLocalBreadcrumbOwner } from '../breadcrumb-ownership'

describe('breadcrumb ownership', () => {
  it('defers global breadcrumbs on compound detail routes', () => {
    expect(hasLocalBreadcrumbOwner('/compounds/l-theanine/')).toBe(true)
    expect(hasLocalBreadcrumbOwner('/compounds/semaglutide')).toBe(true)
  })

  it('keeps the global breadcrumb on the compound index and pagination', () => {
    expect(hasLocalBreadcrumbOwner('/compounds/')).toBe(false)
    expect(hasLocalBreadcrumbOwner('/compounds/page/2/')).toBe(false)
  })

  it('does not change breadcrumb ownership for other route families', () => {
    expect(hasLocalBreadcrumbOwner('/herbs/ashwagandha/')).toBe(false)
    expect(hasLocalBreadcrumbOwner('/guides/sleep/')).toBe(false)
  })
})
