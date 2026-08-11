import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

describe('production build governance ordering', () => {
  it('postprocesses and governs runtime data before downstream manifests', () => {
    const source = fs.readFileSync(path.join(process.cwd(), 'scripts/build-deploy.mjs'), 'utf8')

    const runtime = source.indexOf("name: 'build-runtime-from-workbook'")
    const postprocess = source.indexOf("name: 'postprocess-workbook-payloads'")
    const governance = source.indexOf("name: 'apply-governance-overlay'")
    const related = source.indexOf("name: 'build-related-runtime-maps'")
    const routes = source.indexOf("name: 'build-route-manifest'")
    const sitemap = source.indexOf("name: 'build-sitemap-manifest'")

    expect(runtime).toBeGreaterThan(-1)
    expect(postprocess).toBeGreaterThan(runtime)
    expect(governance).toBeGreaterThan(postprocess)
    expect(related).toBeGreaterThan(governance)
    expect(routes).toBeGreaterThan(governance)
    expect(sitemap).toBeGreaterThan(governance)
  })

  it('does not cache away the governance pass', () => {
    const source = fs.readFileSync(path.join(process.cwd(), 'scripts/build-deploy.mjs'), 'utf8')
    const governanceBlock = source.slice(
      source.indexOf("name: 'apply-governance-overlay'"),
      source.indexOf("name: 'build-related-runtime-maps'"),
    )

    expect(governanceBlock).toMatch(/cacheable:\s*false/)
  })
})
