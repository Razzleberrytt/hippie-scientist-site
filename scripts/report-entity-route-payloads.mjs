import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()

function read(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8')
}

function hasAny(text, needles) {
  return needles.some(needle => text.includes(needle))
}

const routeChecks = [
  {
    route: '/herbs',
    file: 'src/pages/Herbs.tsx',
    expectation: 'summary',
    checks: ['useHerbData(', 'useHerbDataState('],
  },
  {
    route: '/compounds',
    file: 'src/pages/Compounds.tsx',
    expectation: 'summary',
    checks: ['useCompoundData(', 'useCompoundDataState('],
  },
  {
    route: '/interactions',
    file: 'src/pages/InteractionsPage.tsx',
    expectation: 'summary',
    checks: ['useHerbDataState('],
  },
  {
    route: '/herbs/:slug',
    file: 'src/pages/HerbDetail.tsx',
    expectation: 'detail',
    checks: ['useHerbDetailState(slug)'],
  },
  {
    route: '/compounds/:slug',
    file: 'src/pages/CompoundDetail.tsx',
    expectation: 'detail',
    checks: ['useCompoundDetailState(slug)'],
  },
]

const fullCorpusSignals = [
  '/data/herbs.json',
  '/data/compounds.json',
  "from '../../public/data/herbs.json'",
  "from '../../public/data/compounds.json'",
]

const routeReport = routeChecks.map(check => {
  const text = read(check.file)
  const matched = hasAny(text, check.checks)
  const fullCorpus = fullCorpusSignals.filter(signal => text.includes(signal))
  return {
    route: check.route,
    file: check.file,
    expectedPayload: check.expectation,
    matchedExpectedLoader: matched,
    fullCorpusSignals: fullCorpus,
  }
})

const loaderFiles = [
  'src/lib/herb-data.ts',
  'src/lib/compound-data.ts',
  'src/lib/data.ts',
]

const loaderReport = loaderFiles.map(file => {
  const text = read(file)
  return {
    file,
    usesHerbSummaryPayload: text.includes("fetch('/data/herbs-summary.json'"),
    usesCompoundSummaryPayload: text.includes("fetch('/data/compounds-summary.json'"),
    usesHerbDetailPayload: text.includes('/data/herbs-detail/'),
    usesCompoundDetailPayload: text.includes('/data/compounds-detail/'),
    fullCorpusSignals: fullCorpusSignals.filter(signal => text.includes(signal)),
  }
})

const badRoutes = routeReport.filter(route => !route.matchedExpectedLoader)
if (badRoutes.length > 0) {
  throw new Error(`Route loader mismatch: ${badRoutes.map(route => route.file).join(', ')}`)
}

const report = {
  generatedAt: new Date().toISOString(),
  routes: routeReport,
  loaders: loaderReport,
}

const outPath = path.join(ROOT, 'ops', 'reports', 'entity-route-payloads.json')
fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(report, null, 2) + '\n', 'utf8')

console.log('[entity-route-payloads] wrote ops/reports/entity-route-payloads.json')
for (const route of routeReport) {
  console.log(
    `[entity-route-payloads] ${route.route} -> ${route.expectedPayload} (${route.file})` +
      (route.fullCorpusSignals.length > 0 ? ` [full-corpus: ${route.fullCorpusSignals.join(', ')}]` : '')
  )
}
for (const loader of loaderReport) {
  if (loader.fullCorpusSignals.length > 0) {
    console.log(
      `[entity-route-payloads] loader full-corpus signal in ${loader.file}: ${loader.fullCorpusSignals.join(', ')}`
    )
  }
}
