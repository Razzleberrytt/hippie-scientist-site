#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const DIST = path.join(ROOT, 'dist')
const REPORT_PATH = path.join(ROOT, 'ops', 'reports', 'structured-data-inventory.json')

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

function flattenEntities(parsed) {
  const rows = Array.isArray(parsed) ? parsed : [parsed]
  return rows.flatMap(entry => Array.isArray(entry?.['@graph']) ? entry['@graph'] : [entry])
}

function validateSchemaObject(entity) {
  if (!entity || typeof entity !== 'object') return 'entity-not-object'
  const types = Array.isArray(entity['@type']) ? entity['@type'] : [entity['@type']]
  const cleanTypes = types.map(v => String(v || '')).filter(Boolean)
  if (!cleanTypes.length) return 'missing-type'
  if (!entity['@context']) return 'missing-context'
  if ((cleanTypes.includes('Article') || cleanTypes.includes('BlogPosting')) && !entity.headline) return 'article-missing-headline'
  if (cleanTypes.includes('BreadcrumbList') && (!Array.isArray(entity.itemListElement) || entity.itemListElement.length < 2)) return 'breadcrumb-missing-items'
  return null
}

function collectHtmlFiles() {
  if (!fs.existsSync(DIST)) return []
  const out = []
  const stack = [DIST]
  while (stack.length) {
    const next = stack.pop()
    for (const entry of fs.readdirSync(next, { withFileTypes: true })) {
      const full = path.join(next, entry.name)
      if (entry.isDirectory()) stack.push(full)
      if (entry.isFile() && entry.name.toLowerCase() === 'index.html') out.push(full)
    }
  }
  return out
}

function routeFromFile(filePath) {
  const rel = path.relative(DIST, filePath).replace(/\\/g, '/')
  return rel === 'index.html' ? '/' : `/${rel.replace(/\/index\.html$/i, '')}`
}

const targetRoute = (route) => route.startsWith('/herbs/') || route.startsWith('/compounds/') || route.startsWith('/blog/')

function main() {
  const failures = []
  const renderedJsonLdScan = []

  for (const filePath of collectHtmlFiles()) {
    const route = routeFromFile(filePath)
    if (!targetRoute(route)) continue

    const html = fs.readFileSync(filePath, 'utf8')
    const scripts = extractJsonLdScripts(html)
    const schemaTypes = []

    for (const script of scripts) {
      let parsed
      try {
        parsed = JSON.parse(script)
      } catch {
        failures.push({ scope: route, reason: 'invalid-json-ld' })
        continue
      }
      const entities = flattenEntities(parsed)
      for (const entity of entities) {
        const error = validateSchemaObject(entity)
        if (error) failures.push({ scope: route, reason: error })
        const type = entity?.['@type']
        if (Array.isArray(type)) schemaTypes.push(...type.map(String))
        else if (type) schemaTypes.push(String(type))
      }
    }

    renderedJsonLdScan.push({ route, jsonLdScripts: scripts.length, detectedSchemaTypes: [...new Set(schemaTypes)] })
    if (route.startsWith('/blog/') && scripts.length < 2) failures.push({ scope: route, reason: 'blog-missing-article-and-breadcrumb-jsonld' })
    if ((route.startsWith('/herbs/') || route.startsWith('/compounds/')) && scripts.length < 2) failures.push({ scope: route, reason: 'profile-missing-schema-blocks' })
  }

  const report = { generatedAt: new Date().toISOString(), renderedJsonLdScan, failures }
  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true })
  fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`)

  if (failures.length) {
    failures.forEach(item => console.error(`[structured-data] FAIL ${item.scope} ${item.reason}`))
    process.exit(1)
  }
  console.log(`[structured-data] PASS report=${path.relative(ROOT, REPORT_PATH)}`)
}

main()
