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
    'app/not-found.tsx',
    'app/global-error.tsx',
    'app/guides/example/page.tsx',
    'app/guides/example/layout.tsx',
    'app/(marketing)/loading.tsx',
    'app/@modal/default.tsx',
    'app/api/search/route.ts',
    'app/route.ts',
    'app/sitemap.ts',
    'app/blog/sitemap.ts',
    'app/robots.ts',
    'app/manifest.ts',
    'app/feed.ts',
    'app/favicon.ico',
    'app/icon.tsx',
    'app/icon2.png',
    'app/apple-icon.tsx',
    'app/opengraph-image.tsx',
    'app/products/opengraph-image.tsx',
    'app/twitter-image.jpg',
    'app/guides/generateStaticParams.ts',
    'app/generateStaticParams.mjs',
    'lib/seo/canonical.ts',
    'public/data/herbs.json',
    'next.config.mjs',
    'package.json',
    'package-lock.json',
  ])('classifies %s as release-sensitive', (file) => {
    expect(isReleaseSensitivePath(file)).toBe(true)
  })

  it.each([
    'app/guides/example/GuideClient.tsx',
    'app/guides/example/components/DecisionTable.tsx',
    'app/lib/client-state.ts',
    'components/Header.tsx',
    'docs/build-and-verification.md',
    'styles/globals.css',
    '.github/workflows/lighthouse.yml',
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
