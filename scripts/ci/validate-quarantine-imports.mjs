#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from 'node:path'

const repoRoot = process.cwd()

const ACTIVE_ROOTS = [
  'app',
  'src/app',
  'components',
  'src/components/explore',
  'src/components/runtime',
  'lib',
]

const ACTIVE_FILES = [
  'src/components/mobile-bottom-nav.tsx',
]

const SOURCE_EXTENSIONS = new Set([
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.mjs',
])

// Mirrors quarantined/deferred areas documented in tsconfig.json.
// Keep this conservative and string-based to avoid heavy resolution logic.
const QUARANTINED_IMPORT_PATTERNS = [
  '@/src/pages/',
  '@/src/components/cta/',
  '@/src/components/detail/',
  '@/src/components/filters/',
  '@/src/components/interactions/',
  '@/src/components/trust/',
  '@/src/lib/affiliateClickTracking',
  '@/src/lib/collectionEnrichment',
  '@/src/lib/collectionQuality',
  '@/src/lib/collectionTracking',
  '@/src/lib/compound-data',
  '@/src/lib/compoundHerbRelations',
  '@/src/lib/compounds',
  '@/src/lib/consent',
  '@/src/lib/contentJourneyTracking',
  '@/src/lib/counters',
  '@/src/lib/curatedProducts',
  '@/src/lib/data',
  '@/src/lib/enrichmentDiscovery',
  '@/src/lib/enrichmentRecommendations',
  '@/src/lib/getCompoundByName',
  '@/src/lib/getHerbByName',
  '@/src/lib/governedAnalytics',
  '@/src/lib/governedCollectionDiscovery',
  '@/src/lib/governedCollectionIntro',
  '@/src/lib/governedCta',
  '@/src/lib/governedFaq',
  '@/src/lib/governedIntro',
  '@/src/lib/governedQuickCompare',
  '@/src/lib/governedRelatedQuestions',
  '@/src/lib/governedResearch',
  '@/src/lib/governedReviewFreshness',
  '@/src/lib/growth',
  '@/src/lib/herb-data',
  '@/src/lib/herbProducts',
  '@/src/lib/herbRecommendations',
  '@/src/lib/herbs',
  '@/src/lib/interactionSeed',
  '@/src/lib/loadAnalytics',
  '@/src/lib/relevance',
  '@/src/lib/researchEnrichment',
  '@/src/lib/theme',
  '@/src/lib/trust',
]

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    if (
      entry.name === 'node_modules' ||
      entry.name === '.next' ||
      entry.name === 'out' ||
      entry.name === 'public' ||
      entry.name === 'docs'
    ) {
      continue
    }

    const absolutePath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      files.push(...await walk(absolutePath))
      continue
    }

    if (entry.isFile() && SOURCE_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(absolutePath)
    }
  }

  return files
}

function normalize(value) {
  return value.replaceAll('\\', '/')
}

function looksLikeImport(line) {
  return (
    /^\s*import\s/.test(line) ||
    /\bimport\s*\(/.test(line) ||
    /\brequire\s*\(/.test(line)
  )
}

function matchesQuarantinePattern(line) {
  const normalizedLine = normalize(line)

  return QUARANTINED_IMPORT_PATTERNS.find(pattern =>
    normalizedLine.includes(pattern)
  )
}

async function main() {
  const files = []

  for (const root of ACTIVE_ROOTS) {
    const absoluteRoot = path.join(repoRoot, root)

    try {
      files.push(...await walk(absoluteRoot))
    } catch {
      // Missing roots are acceptable in trimmed branches.
    }
  }

  for (const file of ACTIVE_FILES) {
    files.push(path.join(repoRoot, file))
  }

  const failures = []

  for (const filePath of files) {
    const relativePath = path.relative(repoRoot, filePath)

    let content

    try {
      content = await fs.readFile(filePath, 'utf8')
    } catch {
      continue
    }

    const lines = content.split('\n')

    lines.forEach((line, index) => {
      if (!looksLikeImport(line)) {
        return
      }

      const matchedPattern = matchesQuarantinePattern(line)

      if (!matchedPattern) {
        return
      }

      failures.push(
        `${relativePath}:${index + 1}: imports quarantined path pattern ${matchedPattern}`
      )
    })
  }

  if (failures.length > 0) {
    console.error('Active production code must not import quarantined legacy/deferred TypeScript surfaces.\n')

    for (const failure of failures) {
      console.error(`- ${failure}`)
    }

    process.exit(1)
  }

  console.log('Quarantine import boundaries OK')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
