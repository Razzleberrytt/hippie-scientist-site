import { describe, expect, it } from 'vitest'
import { evaluateHostNormalization } from './production-seo-health-lib.mjs'
import { looksLikeSoft404Page } from './production-soft-404.mjs'

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

describe('live soft-404 document classifier',()=>{
  const article=(title,text)=>'<html><head><title>'+title+'</title></head><body><main><article><h1>'+title+'</h1><p>'+text+'</p></article></main></body></html>'

  it('does not mistake a missing scientific epidemiology for a missing web page',()=>{
    expect(looksLikeSoft404Page(article('2F-2oxo-PCE (CanKet): Complete Toxicology',
      '2F-2oxo-PCE-specific dependence epidemiology does not exist. Review conclusions are limited.'))).toBe(false)
  })
  it('does not mistake a missing interaction map for missing website content',()=>{
    expect(looksLikeSoft404Page(article('3-FPM (3-Fluorophenmetrazine): Complete Human Toxicology',
      'A complete controlled interaction map does not exist.')).toBe(false)
  })
  it('finds a standard 404 title and heading',()=>{
    expect(looksLikeSoft404Page('<title>404: This page could not be found.</title><main><h1>404</h1></main>')).toBe(true)
    expect(looksLikeSoft404Page('<title>Unknown</title><main><h1>Page Not Found</h1></main>')).toBe(true)
  })
  it('finds a page-specific missing-content notice without an H1',()=>{
    expect(looksLikeSoft404Page('<title>Site</title><main><p>Sorry, this page does not exist.</p></main>')).toBe(true)
  })
  it('ignores irrelevant not-found words embedded in scripts and scientific content',()=>{
    expect(looksLikeSoft404Page(article('Forensic data and research limitations',
      'Some studies discuss content not found in older clinical registries.')).toBe(false)
    expect(looksLikeSoft404Page('<title>Research</title><script>Page not found</script><main><h1>Research article</h1><p>Evidence exists.</p></main>')).toBe(false)
  })
})
