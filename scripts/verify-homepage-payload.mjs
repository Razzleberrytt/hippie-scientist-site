#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const homePath = path.join(root, 'src/pages/Home.tsx')
const homepageArtifactPath = path.join(root, 'src/generated/homepage-data.json')
const herbsCorpusPath = path.join(root, 'public/data/herbs.json')
const compoundsCorpusPath = path.join(root, 'public/data/compounds.json')
const governedPath = path.join(root, 'public/data/enrichment-governed.json')

const homeSource = fs.readFileSync(homePath, 'utf8')

const forbidden = [
  "from '@/lib/herb-data'",
  "from '@/lib/compound-data'",
  'loadHerbData(',
  'loadCompoundData(',
  "fetch('/data/herbs.json'",
  "fetch('/data/compounds.json'",
]

const hits = forbidden.filter(marker => homeSource.includes(marker))
if (hits.length > 0) {
  console.error('[verify-homepage-payload] Home.tsx still references full corpora loaders:', hits)
  process.exit(1)
}

const artifactSize = fs.statSync(homepageArtifactPath).size
const herbsSize = fs.statSync(herbsCorpusPath).size
const compoundsSize = fs.statSync(compoundsCorpusPath).size
const corporaSize = herbsSize + compoundsSize

if (artifactSize >= corporaSize) {
  console.error(
    `[verify-homepage-payload] homepage artifact is not smaller than corpora (${artifactSize} >= ${corporaSize})`,
  )
  process.exit(1)
}

const payload = JSON.parse(fs.readFileSync(homepageArtifactPath, 'utf8'))
const governed = JSON.parse(fs.readFileSync(governedPath, 'utf8'))

const requiredKeys = [
  'counts',
  'featuredPool',
  'diverseFeatured',
  'curated',
  'governedHighlights',
  'trustBadges',
  'effectExplorerHerbs',
  'governance',
]

const missing = requiredKeys.filter(key => !(key in payload))
if (missing.length > 0) {
  console.error('[verify-homepage-payload] homepage artifact missing keys:', missing)
  process.exit(1)
}

const publishableSet = new Set(
  governed
    .filter(
      row =>
        ['approved', 'published'].includes(String(row?.researchEnrichment?.editorialStatus || '')) &&
        row?.researchEnrichment?.editorialReadiness?.publishable === true,
    )
    .map(row => `${row.entityType}:${row.entitySlug}`),
)

const disallowed = []
for (const item of payload.governedHighlights || []) {
  const key = `${item.kind}:${item.slug}`
  if (!publishableSet.has(key)) disallowed.push(key)
}

if (disallowed.length > 0) {
  console.error('[verify-homepage-payload] blocked/unpublishable entity leaked into governedHighlights:', disallowed)
  process.exit(1)
}

const missingGovernedBadge = (payload.featuredPool || []).filter(
  item => item.qualityBadge === 'Enriched + reviewed' && !item.governedSummary?.enrichedAndReviewed,
)

if (missingGovernedBadge.length > 0) {
  console.error(
    '[verify-homepage-payload] enriched+reviewed badge must map to governed summary:',
    missingGovernedBadge.map(item => `${item.kind}:${item.slug}`),
  )
  process.exit(1)
}

console.log('[verify-homepage-payload] PASS')
console.log(`artifact bytes: ${artifactSize}`)
console.log(`full corpora bytes: ${corporaSize} (herbs=${herbsSize}, compounds=${compoundsSize})`)
console.log(`size reduction: ${(((corporaSize - artifactSize) / corporaSize) * 100).toFixed(1)}%`)
console.log(`governed highlights: ${(payload.governedHighlights || []).length}`)
