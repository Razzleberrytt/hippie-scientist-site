import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()

function readJson(relPath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relPath), 'utf8'))
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function fileText(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8')
}

function verifySummaryShape() {
  const herbs = readJson('public/data/herbs-summary.json')
  const compounds = readJson('public/data/compounds-summary.json')

  assert(Array.isArray(herbs) && herbs.length > 0, 'herb summary payload missing or empty')
  assert(Array.isArray(compounds) && compounds.length > 0, 'compound summary payload missing or empty')

  const herb = herbs[0]
  const compound = compounds[0]

  for (const field of ['slug', 'name', 'summaryShort', 'primaryEffects', 'confidence']) {
    assert(field in herb, `herb summary missing ${field}`)
    assert(field in compound, `compound summary missing ${field}`)
  }
}

function verifyBrowseRoutingUsesSummary() {
  const herbsPage = fileText('src/pages/Herbs.tsx')
  const compoundsPage = fileText('src/pages/Compounds.tsx')

  assert(herbsPage.includes("useHerbData"), 'Herbs page should still use herb list hook')
  assert(compoundsPage.includes("useCompoundData"), 'Compounds page should still use compound list hook')

  const herbLoader = fileText('src/lib/herb-data.ts')
  const compoundLoader = fileText('src/lib/compound-data.ts')

  assert(herbLoader.includes("fetch('/data/herbs-summary.json'"), 'Herb list loader must fetch summary payload')
  assert(
    compoundLoader.includes("fetch('/data/compounds-summary.json'"),
    'Compound list loader must fetch summary payload'
  )
}

function verifyDetailRoutesUsePerEntityPayloads() {
  const herbDetail = fileText('src/pages/HerbDetail.tsx')
  const compoundDetail = fileText('src/pages/CompoundDetail.tsx')
  const herbLoader = fileText('src/lib/herb-data.ts')
  const compoundLoader = fileText('src/lib/compound-data.ts')

  assert(herbDetail.includes('useHerbDetailState(slug)'), 'HerbDetail must load by slug')
  assert(compoundDetail.includes('useCompoundDetailState(slug)'), 'CompoundDetail must load by slug')
  assert(
    herbLoader.includes('/data/herbs-detail/'),
    'Herb detail loader must fetch per-entity detail payload'
  )
  assert(
    compoundLoader.includes('/data/compounds-detail/'),
    'Compound detail loader must fetch per-entity detail payload'
  )

  const herbSummary = readJson('public/data/herbs-summary.json')
  const compoundSummary = readJson('public/data/compounds-summary.json')
  const herbSlug = herbSummary[0]?.slug
  const compoundSlug = compoundSummary[0]?.slug

  assert(Boolean(herbSlug), 'Herb summary should contain at least one valid slug')
  assert(Boolean(compoundSlug), 'Compound summary should contain at least one valid slug')

  assert(
    fs.existsSync(path.join(ROOT, 'public/data/herbs-detail', `${herbSlug}.json`)),
    `Missing herb detail payload for ${herbSlug}`
  )
  assert(
    fs.existsSync(path.join(ROOT, 'public/data/compounds-detail', `${compoundSlug}.json`)),
    `Missing compound detail payload for ${compoundSlug}`
  )
}

function run() {
  verifySummaryShape()
  verifyBrowseRoutingUsesSummary()
  verifyDetailRoutesUsePerEntityPayloads()
  console.log('[verify-entity-payloads] ok')
}

run()
