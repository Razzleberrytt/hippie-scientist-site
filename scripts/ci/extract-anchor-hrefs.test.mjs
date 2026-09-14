import { describe, expect, it } from 'vitest'

import { extractAnchorHrefs } from './lib/extract-anchor-hrefs.mjs'

describe('internal navigation href extraction', () => {
  it('collects anchor destinations and ignores asset metadata', () => {
    const html = [
      '<link rel="stylesheet" href="/_next/static/a.css /_next/static/b.css">',
      '<a class="card" href="/compounds/creatine">Creatine</a>',
      '<a href=\'/goals/sleep?ref=home\'>Sleep</a>',
    ].join('')

    expect(extractAnchorHrefs(html)).toEqual([
      '/compounds/creatine',
      '/goals/sleep?ref=home',
    ])
  })
})
