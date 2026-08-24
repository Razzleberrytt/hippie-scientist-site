import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), 'utf8')

describe('responsive image production contract', () => {
  it('keeps optimization before rendering and export validation after rendering', () => {
    const build = read('scripts/build-production.mjs')
    const optimizeCall = build.indexOf("execSync('node scripts/optimize-images.mjs'")
    const nextBuildCall = build.indexOf("execSync('npx next build'")
    const validateCall = build.indexOf('validateResponsiveImageContract()')

    expect(optimizeCall).toBeGreaterThan(-1)
    expect(nextBuildCall).toBeGreaterThan(optimizeCall)
    expect(validateCall).toBeGreaterThan(nextBuildCall)
    expect(build).toContain('validate-responsive-image-contract.mjs')
  })

  it('keeps the local image loader mapped to generated 400/800/1200 WebP variants', () => {
    const loader = read('src/lib/cloudflare-image-loader.ts')

    expect(loader).toContain('const WIDTHS = [400, 800, 1200]')
    expect(loader).toContain('/images/optimized')
    expect(loader).toContain("if (!src.startsWith('/images/')) return src")
    expect(loader).toContain('pickWidth(width)')
  })

  it('keeps the monograph hero responsive and high-priority without losing intrinsic sizing', () => {
    const hero = read('components/profile/MonographHeroImage.tsx')

    expect(hero).toContain('width={800}')
    expect(hero).toContain('height={600}')
    expect(hero).toContain('priority')
    expect(hero).toContain('sizes="(min-width: 1024px) 32rem, (min-width: 640px) 50vw, 100vw"')
    expect(hero).toContain('alt={image.alt}')
    expect(hero).toContain('{image.credit ?')
  })

  it('checks representative herb and compound exports plus physical generated files', () => {
    const validator = read('scripts/ci/validate-responsive-image-contract.mjs')

    expect(validator).toContain('out/herbs/ashwagandha/index.html')
    expect(validator).toContain('out/compounds/l-theanine/index.html')
    expect(validator).toContain('/images/guides/ashwagandha-herb.jpg')
    expect(validator).toContain('/images/monographs/photos/l-theanine.jpg')
    expect(validator).toContain('public${variant}')
    expect(validator).toContain('out${variant}')
    expect(validator).toContain('html.includes(variant)')
  })
})
