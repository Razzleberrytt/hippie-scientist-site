import { readdir, stat } from 'node:fs/promises'
import path from 'node:path'

const DIST_ASSETS = path.resolve('dist/assets')
const MAIN_BUDGET_KB = 350
const ROUTE_BUDGET_KB = 300

function toKb(bytes) {
  return Number((bytes / 1024).toFixed(2))
}

function isRouteChunk(name) {
  return /^[A-Z][A-Za-z0-9_-]*-.*\.js$/.test(name)
}

function printSizeRow(label, file, bytes) {
  console.log(`${label}: ${file} (${toKb(bytes)} KiB)`)
}

const assetFiles = await readdir(DIST_ASSETS)
const jsFiles = assetFiles.filter(file => file.endsWith('.js'))

const sized = await Promise.all(
  jsFiles.map(async file => ({
    file,
    bytes: (await stat(path.join(DIST_ASSETS, file))).size,
  }))
)

const mainChunk = sized.find(entry => /^index-.*\.js$/.test(entry.file))
if (!mainChunk) {
  console.error('[bundle-verify] Could not find main entry chunk (index-*.js).')
  process.exit(1)
}

const routeChunks = sized.filter(entry => isRouteChunk(entry.file)).sort((a, b) => b.bytes - a.bytes)

console.log('[bundle-verify] Main entry chunk')
printSizeRow('  main', mainChunk.file, mainChunk.bytes)
if (toKb(mainChunk.bytes) > MAIN_BUDGET_KB) {
  console.warn(
    `[bundle-verify] WARNING: main chunk exceeds budget (${toKb(mainChunk.bytes)} KiB > ${MAIN_BUDGET_KB} KiB).`
  )
}

console.log('[bundle-verify] Largest route chunks')
for (const entry of routeChunks.slice(0, 5)) {
  printSizeRow('  route', entry.file, entry.bytes)
  if (toKb(entry.bytes) > ROUTE_BUDGET_KB) {
    console.warn(
      `[bundle-verify] WARNING: route chunk exceeds budget (${entry.file}: ${toKb(entry.bytes)} KiB > ${ROUTE_BUDGET_KB} KiB).`
    )
  }
}

const deferredTargets = [
  { label: 'jspdf export', pattern: /jspdf/i },
  { label: 'html2canvas export dependency', pattern: /html2canvas/i },
  { label: 'graph rendering library', pattern: /react-force-graph-2d/i },
  { label: 'graph data chunk', pattern: /relevance/i },
]

console.log('[bundle-verify] Deferred optional module checks')
for (const target of deferredTargets) {
  const match = sized.find(entry => target.pattern.test(entry.file))
  if (!match) {
    console.warn(`  ⚠ ${target.label}: chunk not found by filename pattern (${target.pattern}).`)
    continue
  }

  const deferred = match.file !== mainChunk.file
  const icon = deferred ? '✅' : '⚠'
  console.log(
    `  ${icon} ${target.label}: ${match.file} (${toKb(match.bytes)} KiB)${
      deferred ? ' (deferred from main entry)' : ' (in main entry)'
    }`
  )
}
