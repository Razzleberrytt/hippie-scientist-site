import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { classifyReleaseImpact, isReleaseSensitivePath } from './classify-release-impact.mjs'

describe('release impact classification', () => {
  it.each([
    'scripts/data/build-runtime-from-workbook.mjs',
    'scripts/ci/validate-route-seo.mjs',
    'scripts/build-deploy.mjs',
    'app/page.tsx',
    'app/layout.tsx',
    'app/guides/example/page.tsx',
    'app/guides/example/layout.tsx',
    'app/guides/example/loading.tsx',
    'app/guides/example/error.tsx',
    'app/guides/example/not-found.tsx',
    'app/api/revalidate/route.ts',
    'app/guides/example/generateStaticParams.ts',
    'app/sitemap.ts',
    'app/robots.ts',
    'app/manifest.ts',
    'app/icon.png',
    'app/guides/opengraph-image.tsx',
    'lib/seo/canonical.ts',
    'lib/semantic-schema-graph.ts',
    'src/lib/seo.ts',
    'src/lib/goal-seo.ts',
    'src/lib/schema-graph.ts',
    'src/lib/schema-injector.ts',
    'src/lib/runtime-data.ts',
    'public/data/herbs.json',
    'public/_redirects',
    'public/_headers',
    'next.config.mjs',
    'package.json',
    'package-lock.json',
  ])('classifies %s as release-sensitive', (file) => {
    expect(isReleaseSensitivePath(file)).toBe(true)
  })

  it.each([
    'app/herbs/HerbsIndexClient.tsx',
    'components/Header.tsx',
    'src/lib/affiliate-copy.ts',
    'docs/build-and-verification.md',
    'styles/globals.css',
    '.github/workflows/lighthouse.yml',
    'public/hero-illustration.jpg',
  ])('classifies %s as standard-CI-only', (file) => {
    expect(isReleaseSensitivePath(file)).toBe(false)
  })

  it('normalizes, deduplicates, and reports the sensitive subset', () => {
    expect(classifyReleaseImpact([
      ' components/Header.tsx ',
      'public\\data\\herbs.json',
      'public/data/herbs.json',
      '',
    ])).toEqual({
      releaseSensitive: true,
      sensitiveFiles: ['public/data/herbs.json'],
      files: ['components/Header.tsx', 'public/data/herbs.json'],
    })
  })
})

describe('workflow release-impact contract', () => {
  const classifierCommand = 'node scripts/ci/classify-release-impact.mjs --github-output="$GITHUB_OUTPUT"'

  it.each([
    '.github/workflows/check.yml',
    '.github/workflows/atomic-upgrade-gate.yml',
  ])('%s consumes the shared classifier', (workflow) => {
    const yaml = fs.readFileSync(path.join(process.cwd(), workflow), 'utf8')
    expect(yaml).toContain(classifierCommand)
    expect(yaml).toContain('steps.impact.outputs.release_sensitive')
  })
})
