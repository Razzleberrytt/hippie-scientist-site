#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const outDir = path.join(root, 'out')
const reportPath = path.join(root, 'reports/schema-policy.json')
if (!fs.existsSync(outDir)) {
  console.error('[schema-policy] missing out/ — run a production build first')
  process.exit(1)
}

const SITE_URL = 'https://thehippiescientist.net'
const SITE_NAME = 'The Hippie Scientist'
const ORGANIZATION_ID = `${SITE_URL}/#organization`
const AUTHOR_NAME = 'Willie B. Randolph III'
const AUTHOR_URL = `${SITE_URL}/info/author/`
const AUTHOR_ID = `${AUTHOR_URL}#person`

const bannedTypes = new Set([
  'Physician',
  'MedicalOrganization',
  'MedicalClinic',
  'Hospital',
  'Pharmacy',
  'Dentist',
  'DiagnosticLab',
  'MedicalBusiness',
])
const recognized = new Set([
  'Organization', 'Person', 'BreadcrumbList', 'Article', 'BlogPosting', 'ScholarlyArticle', 'Dataset',
  'ImageObject', 'FAQPage', 'MedicalWebPage', 'WebPage', 'WebSite', 'ProfilePage',
  'CollectionPage', 'ItemList', 'ListItem', 'Question', 'Answer', 'Substance',
  'ChemicalSubstance', 'DefinedTerm', 'Offer', 'Product', 'SoftwareApplication',
])
const legacyPlaceholderDates = new Set(['2026-01-01'])
const errors = []
const warnings = []
const typeCounts = {}
let jsonLdBlocks = 0

function walk(dir) {
  const files = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory() && entry.name !== '_next') files.push(...walk(full))
    else if (entry.isFile() && entry.name.endsWith('.html')) files.push(full)
  }
  return files
}

function routeFromFile(file) {
  const rel = path.relative(outDir, file).split(path.sep).join('/')
  if (rel === 'index.html') return '/'
  return `/${rel.replace(/\/index\.html$/, '').replace(/\.html$/, '')}`
}

function nodes(value, out = []) {
  if (!value || typeof value !== 'object') return out
  if (Array.isArray(value)) {
    value.forEach((item) => nodes(item, out))
    return out
  }
  out.push(value)
  Object.values(value).forEach((item) => nodes(item, out))
  return out
}

function typesOf(node) {
  const raw = node?.['@type']
  return Array.isArray(raw) ? raw.map(String) : raw ? [String(raw)] : []
}

function dateCheck(node, route, key) {
  if (!node[key]) return
  if (legacyPlaceholderDates.has(String(node[key]))) {
    errors.push(`${route}: ${key} uses legacy placeholder date ${node[key]}`)
    return
  }
  const parsed = new Date(node[key])
  if (Number.isNaN(parsed.getTime())) errors.push(`${route}: ${key} is not a valid date (${node[key]})`)
  else if (parsed.getTime() > Date.now() + 24 * 60 * 60 * 1000) errors.push(`${route}: ${key} is in the future (${node[key]})`)
}

function nameOfReference(value) {
  if (!value || typeof value !== 'object') return ''
  return String(value.name || value['@id'] || '')
}

function validateFirstPartyIdentity(node, route, types) {
  if (types.includes('Organization') && node.name === SITE_NAME) {
    if (node['@id'] !== ORGANIZATION_ID) {
      errors.push(`${route}: first-party Organization must resolve to ${ORGANIZATION_ID}`)
    }
    if (node.url !== SITE_URL) {
      errors.push(`${route}: first-party Organization must use canonical url ${SITE_URL}`)
    }
  }

  if (types.includes('Person') && node.name === AUTHOR_NAME) {
    if (node['@id'] !== AUTHOR_ID) {
      errors.push(`${route}: first-party author Person must resolve to ${AUTHOR_ID}`)
    }
    if (node.url !== AUTHOR_URL) {
      errors.push(`${route}: first-party author Person must use canonical url ${AUTHOR_URL}`)
    }
  }
}

function validateNode(node, route) {
  const types = typesOf(node)
  for (const type of types) {
    typeCounts[type] = (typeCounts[type] || 0) + 1
    if (bannedTypes.has(type)) errors.push(`${route}: banned credential/clinical schema type ${type}`)
  }

  validateFirstPartyIdentity(node, route, types)

  if (types.includes('Person')) {
    if (!node.name) errors.push(`${route}: Person schema is missing name`)
    if (node.medicalSpecialty || node.hasCredential || /doctor|physician|clinician|pharmacist|dietitian/i.test(String(node.jobTitle || ''))) {
      errors.push(`${route}: Person schema contains medical credential/specialty claims requiring explicit editorial verification`)
    }
    if (node.worksFor && !nameOfReference(node.worksFor)) errors.push(`${route}: Person worksFor relationship is incomplete`)
  }

  if (types.includes('Organization')) {
    if (!node.name || !node.url) errors.push(`${route}: Organization schema requires name and url`)
  }

  if (types.includes('BreadcrumbList')) {
    if (!Array.isArray(node.itemListElement) || !node.itemListElement.length) errors.push(`${route}: BreadcrumbList has no items`)
  }

  if (types.includes('Article') || types.includes('BlogPosting') || types.includes('ScholarlyArticle')) {
    if (!node.headline) errors.push(`${route}: Article/BlogPosting is missing headline`)
    dateCheck(node, route, 'datePublished')
    dateCheck(node, route, 'dateModified')
    if (node.reviewedBy && !node.dateReviewed) errors.push(`${route}: reviewedBy is present without a truthful dateReviewed event`)
    dateCheck(node, route, 'dateReviewed')

    if (node.author?.['@type'] === 'Organization' && node.author?.name === SITE_NAME) {
      warnings.push(`${route}: Article uses organizational authorship; prefer the canonical Person when the visible byline names the author`)
    }
  }

  if (types.includes('Dataset')) {
    if (!node.name || !node.description || !node.url) errors.push(`${route}: Dataset requires name, description and stable url`)
    if (!node.distribution && !node.encodingFormat) warnings.push(`${route}: Dataset has no distribution or encoding metadata`)
    dateCheck(node, route, 'datePublished')
    dateCheck(node, route, 'dateModified')
  }

  if (types.includes('FAQPage') && !Array.isArray(node.mainEntity)) errors.push(`${route}: FAQPage must contain visible FAQ entities`)
  if (types.includes('ImageObject') && !node.url && !node.contentUrl) warnings.push(`${route}: ImageObject has no url/contentUrl`)

  if (node.medicalAudience?.audienceType === 'Patient') {
    errors.push(`${route}: patient-targeted medicalAudience is not allowed for general educational pages`)
  }
}

for (const file of walk(outDir)) {
  const route = routeFromFile(file)
  const html = fs.readFileSync(file, 'utf8')
  const blocks = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
  for (const match of blocks) {
    jsonLdBlocks += 1
    let parsed
    try { parsed = JSON.parse(match[1]) }
    catch (error) {
      errors.push(`${route}: malformed JSON-LD (${error.message})`)
      continue
    }
    nodes(parsed).forEach((node) => validateNode(node, route))
  }
}

for (const required of ['Organization', 'Person', 'BreadcrumbList', 'Article', 'Dataset']) {
  if (!typeCounts[required]) warnings.push(`no ${required} schema observed in built output`)
}

const unknownTypes = Object.keys(typeCounts).filter((type) => !recognized.has(type)).sort()
const report = {
  generatedAt: new Date().toISOString(),
  jsonLdBlocks,
  typeCounts,
  unknownTypes,
  warningCount: warnings.length,
  warnings: warnings.slice(0, 200),
  errors,
}
fs.mkdirSync(path.dirname(reportPath), { recursive: true })
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`)

console.log(`[schema-policy] parsed ${jsonLdBlocks} JSON-LD blocks`)
console.log(`[schema-policy] types: ${Object.entries(typeCounts).sort(([a],[b]) => a.localeCompare(b)).map(([k,v]) => `${k}=${v}`).join(', ')}`)
console.log(`[schema-policy] warnings: ${warnings.length}`)
console.log('[schema-policy] report: reports/schema-policy.json')

if (errors.length) {
  console.error(`\n[schema-policy] ${errors.length} blocking problem(s):`)
  errors.slice(0, 100).forEach((error) => console.error(`[schema-policy]   ${error}`))
  process.exit(1)
}
console.log('[schema-policy] OK: JSON-LD is parseable and complies with schema safety policy')
