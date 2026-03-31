#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { getSharedRouteManifest } from './shared-route-manifest.mjs'

const ROOT = process.cwd()
const DIST = path.join(ROOT, 'dist')
const REPORT_PATH = path.join(ROOT, 'ops', 'reports', 'structured-data-inventory.json')

const TEMPLATE_FILES = {
  herb: 'src/pages/HerbDetail.tsx',
  compound: 'src/pages/CompoundDetail.tsx',
  collection: 'src/pages/CollectionPage.tsx',
}

function readText(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8')
}

function readJson(relativePath) {
  const full = path.join(ROOT, relativePath)
  if (!fs.existsSync(full)) return {}
  return JSON.parse(fs.readFileSync(full, 'utf8'))
}

function mustContain(source, pattern, label, failures) {
  if (!pattern.test(source)) failures.push({ scope: label, reason: 'missing-pattern' })
}

function extractJsonLdScripts(html) {
  const scripts = []
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  let match = re.exec(html)
  while (match) {
    scripts.push(match[1])
    match = re.exec(html)
  }
  return scripts
}

function unescapeHtml(value) {
  return String(value || '')
    .replace(/&quot;/g, '"')
    .replace(/&#34;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

function validateSchemaObject(entity) {
  if (!entity || typeof entity !== 'object') return 'entity-not-object'
  const rawType = entity['@type']
  const types = Array.isArray(rawType)
    ? rawType.map(value => String(value || '')).filter(Boolean)
    : [String(rawType || '')].filter(Boolean)
  if (!types.length) return 'missing-type'
  if (!entity['@context']) return 'missing-context'

  if (types.includes('BreadcrumbList')) {
    if (!Array.isArray(entity.itemListElement) || entity.itemListElement.length < 2) {
      return 'breadcrumb-missing-items'
    }
  }

  if (types.includes('WebPage') || types.includes('CollectionPage')) {
    if (!entity.name || !entity.url || !entity.description) {
      return 'webpage-or-collectionpage-missing-required'
    }
  }

  if (types.includes('ItemList')) {
    if (
      !entity.name ||
      !entity.url ||
      !Array.isArray(entity.itemListElement) ||
      !entity.itemListElement.length
    ) {
      return 'itemlist-missing-required'
    }
  }

  return null
}

function flattenEntities(parsed) {
  const rows = Array.isArray(parsed) ? parsed : [parsed]
  return rows.flatMap(entry => {
    if (!entry || typeof entry !== 'object') return []
    if (Array.isArray(entry['@graph'])) return entry['@graph']
    return [entry]
  })
}

function routeFromFile(filePath) {
  const rel = path.relative(DIST, filePath).replace(/\\/g, '/')
  if (rel === 'index.html') return '/'
  return `/${rel.replace(/\/index\.html$/i, '')}`
}

function collectHtmlFiles() {
  if (!fs.existsSync(DIST)) return []
  const out = []
  const stack = [DIST]
  while (stack.length > 0) {
    const next = stack.pop()
    for (const entry of fs.readdirSync(next, { withFileTypes: true })) {
      const full = path.join(next, entry.name)
      if (entry.isDirectory()) stack.push(full)
      if (entry.isFile() && entry.name.toLowerCase() === 'index.html') out.push(full)
    }
  }
  return out
}

function main() {
  const failures = []

  const herbSource = readText(TEMPLATE_FILES.herb)
  mustContain(herbSource, /jsonLd=\{\[/, TEMPLATE_FILES.herb, failures)
  mustContain(herbSource, /herbJsonLd\(/, TEMPLATE_FILES.herb, failures)
  mustContain(herbSource, /breadcrumbJsonLd\(/, TEMPLATE_FILES.herb, failures)

  const compoundSource = readText(TEMPLATE_FILES.compound)
  mustContain(compoundSource, /jsonLd=\{\[/, TEMPLATE_FILES.compound, failures)
  mustContain(compoundSource, /compoundJsonLd\(/, TEMPLATE_FILES.compound, failures)
  mustContain(compoundSource, /breadcrumbJsonLd\(/, TEMPLATE_FILES.compound, failures)

  const collectionSource = readText(TEMPLATE_FILES.collection)
  mustContain(
    collectionSource,
    /const jsonLd = collectionQuality\.approved\s*\?/,
    TEMPLATE_FILES.collection,
    failures,
  )
  mustContain(collectionSource, /collectionPageJsonLd\(/, TEMPLATE_FILES.collection, failures)
  mustContain(collectionSource, /itemListJsonLd\(/, TEMPLATE_FILES.collection, failures)
  mustContain(collectionSource, /breadcrumbJsonLd\(/, TEMPLATE_FILES.collection, failures)

  const { metadata } = getSharedRouteManifest()
  const seoPriority = readJson('public/data/seo-priority-report.json')

  const topHerbs = Array.isArray(seoPriority.topHerbs) ? seoPriority.topHerbs : []
  const topCompounds = Array.isArray(seoPriority.topCompounds) ? seoPriority.topCompounds : []
  const topCollections = Array.isArray(seoPriority.topCollections) ? seoPriority.topCollections : []

  const indexableCollectionSet = new Set(
    (metadata?.indexableCollections || []).map(item => item.route),
  )
  const excludedCollectionSet = new Set(
    (metadata?.excludedCollections || []).map(item => item.route),
  )

  const inventoryRows = [
    ...topHerbs.map(item => ({
      route: item.route,
      pageType: 'herb_detail',
      expectedSchema: ['WebPage', 'BreadcrumbList'],
      excluded: false,
      exclusionReason: null,
    })),
    ...topCompounds.map(item => ({
      route: item.route,
      pageType: 'compound_detail',
      expectedSchema: ['WebPage', 'BreadcrumbList'],
      excluded: false,
      exclusionReason: null,
    })),
    ...topCollections.map(item => {
      const route = item.route
      const excluded = excludedCollectionSet.has(route)
      return {
        route,
        pageType: 'collection_page',
        expectedSchema: excluded ? [] : ['CollectionPage', 'ItemList', 'BreadcrumbList'],
        excluded,
        exclusionReason: excluded ? 'collection-not-index-approved' : null,
      }
    }),
  ]

  const htmlResults = []
  for (const filePath of collectHtmlFiles()) {
    const route = routeFromFile(filePath)
    const isTarget =
      route.startsWith('/herbs/') ||
      route.startsWith('/compounds/') ||
      route.startsWith('/collections/')
    if (!isTarget) continue

    const html = fs.readFileSync(filePath, 'utf8')
    const scripts = extractJsonLdScripts(html)
    const schemaTypes = []

    for (const raw of scripts) {
      let parsed
      try {
        parsed = JSON.parse(unescapeHtml(raw.trim()))
      } catch {
        failures.push({ scope: route, reason: 'invalid-json-ld' })
        continue
      }

      const entities = flattenEntities(parsed)
      const topTypes = entities.flatMap(entity => {
        const rawType = entity?.['@type']
        if (Array.isArray(rawType)) {
          return rawType.map(value => String(value || '')).filter(Boolean)
        }
        return [String(rawType || '')].filter(Boolean)
      })
      schemaTypes.push(...topTypes)

      const duplicates = topTypes.filter((type, index) => topTypes.indexOf(type) !== index)
      if (duplicates.length) {
        failures.push({
          scope: route,
          reason: `duplicate-types:${[...new Set(duplicates)].join(',')}`,
        })
      }

      for (const entity of entities) {
        const validationError = validateSchemaObject(entity)
        if (validationError) failures.push({ scope: route, reason: validationError })
      }
    }

    const hasNoindex = /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html)
    if (hasNoindex && schemaTypes.length > 0) {
      failures.push({ scope: route, reason: 'noindex-route-has-jsonld' })
    }

    htmlResults.push({
      route,
      detectedSchemaTypes: [...new Set(schemaTypes)],
      jsonLdScripts: scripts.length,
    })
  }

  const report = {
    generatedAt: new Date().toISOString(),
    targetSource: 'public/data/seo-priority-report.json',
    templateChecks: {
      herbTemplate: failures.every(item => item.scope !== TEMPLATE_FILES.herb),
      compoundTemplate: failures.every(item => item.scope !== TEMPLATE_FILES.compound),
      collectionTemplate: failures.every(item => item.scope !== TEMPLATE_FILES.collection),
    },
    pageTypeInventory: {
      herbs: inventoryRows.filter(row => row.pageType === 'herb_detail'),
      compounds: inventoryRows.filter(row => row.pageType === 'compound_detail'),
      collections: inventoryRows.filter(row => row.pageType === 'collection_page'),
    },
    intentionallyExcluded: inventoryRows
      .filter(row => row.excluded)
      .map(row => ({ route: row.route, reason: row.exclusionReason })),
    renderedJsonLdScan: htmlResults,
    notes: [
      'Templates are validated for schema helper usage to guarantee SSR/hydration parity.',
      'Rendered HTML scan validates JSON-LD syntax/required fields for any schema blocks present in prerender outputs.',
      `Index-approved collections in route manifest: ${indexableCollectionSet.size}`,
    ],
    failures,
  }

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true })
  fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8')

  if (failures.length) {
    failures.forEach(item => {
      console.error(`[structured-data] FAIL ${item.scope} ${item.reason}`)
    })
    console.error(`[structured-data] wrote report: ${path.relative(ROOT, REPORT_PATH)}`)
    process.exit(1)
  }

  console.log(`[structured-data] PASS report=${path.relative(ROOT, REPORT_PATH)}`)
}

main()
