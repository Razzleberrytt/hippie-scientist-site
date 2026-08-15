import { describe, expect, it } from 'vitest'
import { evaluateHostNormalization } from './production-seo-health-lib.mjs'

function result(finalUrl, chain = []) {
  return { response: { status: 200 }, finalUrl, chain }
}

describe('production SEO host normalization', () => {
  it('rejects canonical-host redirects that collapse the requested pathname', () => {
    const errors = evaluateHostNormalization({
      inputUrl: 'https://www.thehippiescientist.net/goals/',
      label: 'https-www',
      result: result('https://thehippiescientist.net/', [
        { url: 'https://www.thehippiescientist.net/goals/', status: 301, location: 'https://thehippiescientist.net/' },
        { url: 'https://thehippiescientist.net/', status: 200, location: '' },
      ]),
    })

    expect(errors).toEqual(expect.arrayContaining([
      expect.objectContaining({
        type: 'host-redirect-path-mismatch',
        expectedPath: '/goals/',
        finalPath: '/',
      }),
    ]))
  })

  it('accepts canonical-host normalization that preserves the requested pathname', () => {
    const errors = evaluateHostNormalization({
      inputUrl: 'http://www.thehippiescientist.net/goals/',
      label: 'http-www',
      result: result('https://thehippiescientist.net/goals/', [
        { url: 'http://www.thehippiescientist.net/goals/', status: 301, location: 'https://thehippiescientist.net/goals/' },
        { url: 'https://thehippiescientist.net/goals/', status: 200, location: '' },
      ]),
    })

    expect(errors).toEqual([])
  })
})
