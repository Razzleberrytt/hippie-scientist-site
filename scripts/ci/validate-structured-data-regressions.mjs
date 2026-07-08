#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const outDir = path.join(root, 'out')

const INVALID_SCHEMA_PROPERTIES = new Set([
  'evidenceLevel',
  'knownUse',
  'safetyWarnings',
])

const ARTICLE_TYPES = new Set(['Article', 'BlogPosting', 'NewsArticle', 'ScholarlyArticle'])
const PRODUCT_SNIPPET_TYPES = new Set(['Product', 'DietarySupplement'])
const ENTITY_TYPES_REJECTING_IS_PART_OF = new Set([
  'ChemicalSubstance',
  'DietarySupplement',
  'Drug',
  'MedicalSubstance',
  'MedicalTherapy',
  'MolecularEntity',
])

function* walkHtmlFiles(dir) {
  if (!fs.existsSync(dir)) return

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '_next' || entry.name === 'pagefind') continue
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      yield* walkHtmlFiles(fullPath)
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      yield fullPath
    }
  }
}

function routeFromFile(filePath) {
  const rel = path.relative(outDir, filePath).replace(/\\/g, '/')
  if (rel === 'index.html') return '/'
  return `/${rel.replace(/\/index\.html$/, '').replace(/\.html$/, '')}`
}

function jsonLdBlocks(html) {
  return [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map((match) => match[1].trim())
    .filter(Boolean)
}

function typeList(value) {
  if (typeof value === 'string') return [value]
  if (Array.isArray(value)) return value.filter((item) => typeof item === 'string')
  return []
}

function hasProductSupport(node) {
  return Boolean(node.aggregateRating || node.offers || node.review)
}

function traverse(value, visitor, pathLabel = '$') {
  if (Array.isArray(value)) {
    value.forEach((item, index) => traverse(item, visitor, `${pathLabel}[${index}]`))
    return
  }

  if (!value || typeof value !== 'object') return

  visitor(value, pathLabel)

  for (const [key, nested] of Object.entries(value)) {
    traverse(nested, visitor, `${pathLabel}.${key}`)
  }
}

function validateNode(node, route, blockIndex, objectPath, errors) {
  for (const key of Object.keys(node)) {
    if (INVALID_SCHEMA_PROPERTIES.has(key)) {
      errors.push(`${route} block ${blockIndex} ${objectPath}: invalid Schema.org property "${key}"`)
    }
  }

  const types = typeList(node['@type'])

  if (types.some((type) => PRODUCT_SNIPPET_TYPES.has(type)) && !hasProductSupport(node)) {
    errors.push(`${route} block ${blockIndex} ${objectPath}: product-snippet type without aggregateRating/offers/review (${types.join(', ')})`)
  }

  if (types.some((type) => ARTICLE_TYPES.has(type)) && Object.prototype.hasOwnProperty.call(node, 'breadcrumb')) {
    errors.push(`${route} block ${blockIndex} ${objectPath}: Article-like node has invalid direct breadcrumb property`)
  }

  if (types.includes('ListItem') && !node.item && !node.url) {
    errors.push(`${route} block ${blockIndex} ${objectPath}: ListItem missing item or url`)
  }

  if (types.some((type) => ENTITY_TYPES_REJECTING_IS_PART_OF.has(type)) && Object.prototype.hasOwnProperty.call(node, 'isPartOf')) {
    errors.push(`${route} block ${blockIndex} ${objectPath}: entity node has invalid isPartOf property (${types.join(', ')})`)
  }
}

if (!fs.existsSync(outDir)) {
  console.log('[validate-structured-data-regressions] SKIP: out/ not found. Run a build first.')
  process.exit(0)
}

const errors = []
let routeCount = 0
let blockCount = 0

for (const filePath of walkHtmlFiles(outDir)) {
  const route = routeFromFile(filePath)
  const html = fs.readFileSync(filePath, 'utf8')
  const blocks = jsonLdBlocks(html)
  if (blocks.length === 0) continue

  routeCount += 1
  blockCount += blocks.length

  blocks.forEach((block, index) => {
    let parsed
    try {
      parsed = JSON.parse(block)
    } catch (error) {
      errors.push(`${route} block ${index + 1}: invalid JSON-LD (${error.message})`)
      return
    }

    traverse(parsed, (node, objectPath) => validateNode(node, route, index + 1, objectPath, errors))
  })
}

const report = {
  generatedAt: new Date().toISOString(),
  routeCount,
  blockCount,
  errorCount: errors.length,
  errors: errors.slice(0, 250),
}

fs.mkdirSync(path.join(root, 'ops/reports'), { recursive: true })
fs.writeFileSync(
  path.join(root, 'ops/reports/structured-data-regressions.json'),
  JSON.stringify(report, null, 2),
)

if (errors.length > 0) {
  console.error(`[validate-structured-data-regressions] FAIL: ${errors.length} Semrush-style structured data regressions found.`)
  errors.slice(0, 80).forEach((error) => console.error(`  - ${error}`))
  console.error('[validate-structured-data-regressions] Full report: ops/reports/structured-data-regressions.json')
  process.exit(1)
}

console.log(`[validate-structured-data-regressions] PASS: ${blockCount} JSON-LD blocks across ${routeCount} routes have no known Semrush regression patterns.`)
