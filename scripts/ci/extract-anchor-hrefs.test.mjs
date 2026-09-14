import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { extractAnchorHrefs } from './lib/extract-anchor-hrefs.mjs'

describe('internal navigation href extraction', () => {
  it('collects anchor destinations and ignores asset metadata', () => {
    const html = [
      '<link rel="stylesheet" href="/_next/static/a.css /_next/static/b.css">',
      '<a class="card" href="/compounds/creatine">Creatine</a>',
      '<a href=\'/goals/sleep?ref=home\'>Sleep</a>',
    ].join('')

    assert.deepEqual(extractAnchorHrefs(html), [
      '/compounds/creatine',
      '/goals/sleep?ref=home',
    ])
  })
})
