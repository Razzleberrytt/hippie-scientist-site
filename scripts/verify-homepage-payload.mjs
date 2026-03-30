#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const homePath = path.join(root, 'src/pages/Home.tsx')
const homepageArtifactPath = path.join(root, 'src/generated/homepage-data.json')
const herbsCorpusPath = path.join(root, 'public/data/herbs.json')
const compoundsCorpusPath = path.join(root, 'public/data/compounds.json')

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
    `[verify-homepage-payload] homepage artifact is not smaller than corpora (${artifactSize} >= ${corporaSize})`
  )
  process.exit(1)
}

const payload = JSON.parse(fs.readFileSync(homepageArtifactPath, 'utf8'))
const requiredKeys = [
  'counts',
  'featuredPool',
  'diverseFeatured',
  'curated',
  'trustBadges',
  'effectExplorerHerbs',
]

const missing = requiredKeys.filter(key => !(key in payload))
if (missing.length > 0) {
  console.error('[verify-homepage-payload] homepage artifact missing keys:', missing)
  process.exit(1)
}

console.log('[verify-homepage-payload] PASS')
console.log(`artifact bytes: ${artifactSize}`)
console.log(`full corpora bytes: ${corporaSize} (herbs=${herbsSize}, compounds=${compoundsSize})`)
console.log(`size reduction: ${(((corporaSize - artifactSize) / corporaSize) * 100).toFixed(1)}%`)
