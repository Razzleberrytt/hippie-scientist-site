#!/usr/bin/env node

import { promises as fs } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const DATA_DIR = resolveDataDir(process.argv)
const OUT_DIR = path.join(DATA_DIR, 'runtime-maps')
const DOCS_DIR = path.join(ROOT, 'docs')
const MAX_GROUP_LINKS = 4
const MIN_PAGE_LINKS = 2

const PRIORITY_CLUSTERS = [
  { slug: 'adhd', label: 'ADHD', signals: ['adhd', 'attention deficit', 'hyperactivity', 'executive function', 'focus', 'dopamine', 'iron', 'zinc', 'vitamin d'] },
  { slug: 'anxiety', label: 'Anxiety', signals: ['anxiety', 'anxious', 'calm', 'gaba', 'worry', 'nervous', 'relaxation'] },
  { slug: 'sleep', label: 'Sleep', signals: ['sleep', 'insomnia', 'melatonin', 'valerian', 'bedtime', 'circadian', 'night'] },
  { slug: 'stress', label: 'Stress', signals: ['stress', 'cortisol', 'adaptogen', 'burnout', 'hpa', 'resilience'] },
  { slug: 'focus', label: 'Focus', signals: ['focus', 'attention', 'nootropic', 'cognition', 'productivity', 'caffeine', 'l-theanine'] },
  { slug: 'energy', label: 'Energy', signals: ['energy', 'fatigue', 'stamina', 'mitochondria', 'atp', 'vitality', 'performance'] },
  { slug: 'gut-health', label: 'Gut Health', signals: ['gut', 'digestive', 'microbiome', 'probiotic', 'prebiotic', 'fiber', 'bloating'] },
  { slug: 'longevity', label: 'Longevity', signals: ['longevity', 'aging', 'nad', 'sirtuin', 'mitochondrial', 'cellular health'] },
  { slug: 'inflammation', label: 'Inflammation', signals: ['inflammation', 'anti-inflammatory', 'nf-kb', 'cox', 'oxidative', 'immune'] },
  { slug: 'metabolic-health', label: 'Metabolic Health', signals: ['metabolic', 'glucose', 'insulin', 'blood sugar', 'lipid', 'weight', 'berberine'] },
]

const SAFETY_ROUTES = [
  { href: '/supplement-safety-checklist', label: 'Supplement Safety Checklist', signals: ['safety', 'contraindication', 'interactions', 'medication', 'pregnancy'] },
  { href: '/safety-checker', label: 'Safety Checker', signals: ['safety', 'interaction', 'medication', 'avoid', 'contraindication'] },
  { href: '/education/safety-and-disclaimers', label: 'Safety and Disclaimers', signals: ['safety', 'disclaimer', 'risk', 'medical'] },
  { href: '/education/how-to-read-scientific-studies', label: 'How to Read Scientific Studies', signals: ['evidence', 'research', 'study', 'clinical'] },
]

const EDITORIAL_LINK_BOOSTS = {
  '/herbs/ashwagandha': ['/goals/stress', '/goals/anxiety', '/herbs/rhodiola', '/compounds/magnesium'],
  '/compounds/l-theanine': ['/goals/anxiety', '/goals/sleep', '/compounds/caffeine', '/compounds/magnesium'],
}

function resolveDataDir(argv) {
  const flag = argv.find((arg) => arg.startsWith('--data-dir=')) || argv.find((arg) => arg.startsWith('--out='))
  if (!flag) return path.join(ROOT, 'public', 'data')
  const value = flag.split('=').slice(1).join('=').trim()
  return value ? path.resolve(ROOT, value) : path.join(ROOT, 'public', 'data')
}

function text(value) {
  return String(value ?? '').trim()
}

function lower(value) {
  return text(value).toLowerCase()
}

function slugify(value) {
  return lower(value).replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

function titleize(value) {
  return text(value)
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function normalizeRoute(value) {
  const raw = text(value).split(/[?#]/)[0] || '/'
  const withSlash = raw.startsWith('/') ? raw : `/${raw}`
  return withSlash.length > 1 ? withSlash.replace(/\/+$/, '') : '/'
}

function routeSlug(route) {
  return normalizeRoute(route).split('/').filter(Boolean).pop() || 'home'
}

function routeType(route, fallback = 'static') {
  const normalized = normalizeRoute(route)
  if (normalized.startsWith('/herbs/')) return 'herb'
  if (normalized.startsWith('/compounds/')) return 'compound'
  if (normalized.startsWith('/articles/') || normalized.startsWith('/blog/')) return 'article'
  if (normalized.startsWith('/guides/') || normalized.startsWith('/goals/') || normalized.startsWith('/compare/') || normalized.startsWith('/education/') || normalized.startsWith('/learn/')) return 'guide'
  if (SAFETY_ROUTES.some((item) => item.href === normalized) || /safety|disclaimer|privacy|affiliate/.test(normalized)) return 'safety'
  return fallback
}

function groupTitleForType(type) {
  if (type === 'herb') return 'Related Herbs'
  if (type === 'compound') return 'Related Compounds'
  if (type === 'article') return 'Related Articles'
  if (type === 'safety') return 'Related Safety Pages'
  return 'Related Guides'
}

function list(value) {
  if (value == null) return []
  if (Array.isArray(value)) return value.flatMap(list)
  if (typeof value === 'object') return list(value.slug || value.name || value.label || value.title)
  return text(value).split(/[,;|\n]/g).map((item) => item.trim()).filter(Boolean)
}

function tokens(value) {
  return [...new Set(lower(value).split(/[^a-z0-9]+/g).filter((token) => token.length > 2 && !STOP_WORDS.has(token)))]
}

const STOP_WORDS = new Set(['and', 'for', 'the', 'with', 'from', 'that', 'this', 'guide', 'page', 'support', 'best', 'how', 'what', 'why', 'are', 'vs'])

async function readJson(relativePath, fallback) {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, relativePath), 'utf8')
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

async function pathExists(relativePath) {
  try {
    await fs.access(path.join(ROOT, relativePath))
    return true
  } catch {
    return false
  }
}

async function listPageFiles(dir = path.join(ROOT, 'app')) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const absolute = path.join(dir, entry.name)
    if (entry.isDirectory()) files.push(...await listPageFiles(absolute))
    if (entry.isFile() && entry.name === 'page.tsx') files.push(absolute)
  }
  return files
}

function staticRouteFromPageFile(file) {
  const relative = path.relative(path.join(ROOT, 'app'), file).replace(/\\/g, '/')
  const parts = relative.split('/').slice(0, -1).filter((part) => !/^\(.*\)$/.test(part))
  if (parts.some((part) => part.startsWith('['))) return ''
  return normalizeRoute(`/${parts.join('/')}`)
}

function extractTitleFromSource(source, route) {
  const metadataTitle = source.match(/title:\s*['"`]([^'"`]+)['"`]/)?.[1]
  const h1 = source.match(/<h1[^>]*>\s*([^<{]+)/)?.[1]
  return text(metadataTitle || h1 || titleize(routeSlug(route)))
}

function extractDescriptionFromSource(source) {
  return text(source.match(/description:\s*['"`]([^'"`]+)['"`]/)?.[1] || '')
}

function clusterMatches(searchText) {
  return PRIORITY_CLUSTERS
    .map((cluster) => ({
      slug: cluster.slug,
      label: cluster.label,
      score: cluster.signals.reduce((score, signal) => score + (lower(searchText).includes(signal) ? (signal.includes(' ') ? 4 : 2) : 0), 0),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.slug.localeCompare(b.slug))
}

function routeRecord({ route, type, title, description = '', signals = [], source = 'route-scan', goalSlugs = [] }) {
  const normalized = normalizeRoute(route)
  const label = text(title) || titleize(routeSlug(normalized))
  const searchText = [normalized, label, description, signals.join(' ')].join(' ')
  const clusters = clusterMatches(searchText)
  const normalizedGoalSlugs = [...new Set(list(goalSlugs).map(slugify).filter(Boolean))]
  return {
    route: normalized,
    href: normalized,
    label,
    type: routeType(normalized, type),
    description: text(description),
    signals: [...new Set([...tokens(searchText), ...list(signals).map(slugify).filter(Boolean)])].slice(0, 50),
    clusters: [...new Set([...clusters.map((entry) => entry.slug), ...normalizedGoalSlugs.filter((slug) => PRIORITY_CLUSTERS.some((cluster) => cluster.slug === slug))])],
    goalSlugs: normalizedGoalSlugs,
    source,
  }
}

async function buildStaticRouteRecords() {
  const files = await listPageFiles()
  const records = []
  for (const file of files) {
    const route = staticRouteFromPageFile(file)
    if (!route) continue
    const source = await fs.readFile(file, 'utf8')
    records.push(routeRecord({
      route,
      type: routeType(route),
      title: extractTitleFromSource(source, route),
      description: extractDescriptionFromSource(source),
      signals: tokens(source.slice(0, 8000)),
      source: 'app-route',
    }))
  }
  return records
}

function entityRouteRecords(rows, kind, conditionMap = {}) {
  return (Array.isArray(rows) ? rows : [])
    .filter((row) => row?.slug)
    .map((row) => {
      const slug = slugify(row.slug)
      const conditionEntries = Array.isArray(conditionMap[slug]) ? conditionMap[slug] : []
      const conditionSlugs = conditionEntries.map((entry) => entry.slug).filter(Boolean)
      const conditionLabels = conditionEntries.map((entry) => entry.label).filter(Boolean)
      return routeRecord({
        route: `/${kind === 'herb' ? 'herbs' : 'compounds'}/${slug}`,
        type: kind,
        title: row.name || row.displayName || row.title || row.slug,
        description: row.meta_description || row.generated_description || row.summary || row.description || '',
        signals: [
          row.primary_effects,
          row.effects,
          row.best_for,
          row.traditional_uses,
          row.mechanisms,
          row.pathways,
          row.topic_clusters,
          row.related_topics,
          row.safety,
          row.safetyNotes,
          conditionSlugs,
          conditionLabels,
        ].flatMap(list),
        goalSlugs: conditionSlugs,
        source: `${kind}-data`,
      })
    })
}

async function goalRouteRecords() {
  try {
    const raw = await fs.readFile(path.join(ROOT, 'data', 'goals.ts'), 'utf8')
    const slugs = [...raw.matchAll(/^\s{4}slug:\s*'([^']+)'/gm)].map((match) => match[1])
    return slugs.map((slug) => routeRecord({
      route: `/goals/${slug}`,
      type: 'guide',
      title: `${titleize(slug)} Goal Guide`,
      signals: [slug, slug.replace(/-/g, ' ')],
      source: 'goal-data',
    }))
  } catch {
    return []
  }
}

async function buildCompareRouteRecords() {
  const readTsStringArray = async (relativePath, varName) => {
    const filePath = path.join(ROOT, relativePath)
    try {
      const src = await fs.readFile(filePath, 'utf8')
      const re = new RegExp(`export\\s+(?:const|type)\\s+${varName}[\\s\\S]*?=\\s*\\[([\\s\\S]*?)\\]`, 'm')
      const m = src.match(re)
      if (!m) {
        const re2 = new RegExp(`const\\s+${varName}[\\s\\S]*?=\\s*\\[([\\s\\S]*?)\\]`, 'm')
        const m2 = src.match(re2)
        if (!m2) return []
        const body = m2[1]
        const items = []
        const itemRe = /['"]([^'"]+)['"]/g
        let im
        while ((im = itemRe.exec(body)) !== null) {
          if (im[1]) items.push(im[1])
        }
        return items
      }
      const body = m[1]
      const items = []
      const itemRe = /['"]([^'"]+)['"]/g
      let im
      while ((im = itemRe.exec(body)) !== null) {
        if (im[1]) items.push(im[1])
      }
      return items
    } catch {
      return []
    }
  }

  const readComparisonsJson = async () => {
    const filePath = path.join(ROOT, 'data', 'comparisons.ts')
    try {
      const src = await fs.readFile(filePath, 'utf8')
      const matches = [...src.matchAll(/slug:\s*['"]([^'"]+)['"]/g)]
      return matches.map((m) => m[1])
    } catch {
      return []
    }
  }

  const combinations = await readTsStringArray('config/compare-combinations.ts', 'COMPARE_COMBINATIONS')
  const generated = await readTsStringArray('data/generated-comparisons.ts', 'generatedComparisons')
  const comparisons = await readComparisonsJson()

  // Static/custom compare pages under app/compare/
  const staticCompareSlugs = [
    'ashwagandha-vs-l-theanine-vs-magnesium',
    'caffeine-vs-l-theanine-vs-bacopa-for-focus',
    'curcumin-vs-boswellia-vs-omega-3',
    'melatonin-vs-valerian-vs-magnesium-for-sleep',
    'berberine-vs-metformin',
    'kanna-vs-ssris',
    'kava-vs-alcohol',
    'sleep-herbs-vs-melatonin',
  ]

  const allSlugs = [...new Set([...combinations, ...generated, ...comparisons, ...staticCompareSlugs])]

  return allSlugs.map((slug) => {
    // Determine title
    let title = `${titleize(slug)} Comparison`
    if (slug.includes('-vs-')) {
      const parts = slug.split('-vs-')
      const n1 = titleize(parts[0])
      const n2 = titleize(parts[1])
      title = `${n1} vs ${n2}`
    }

    // Parse items to extract signals
    const items = slug.split('-vs-').flatMap((part) => part.split('-for-')[0].split('-'))

    return routeRecord({
      route: `/compare/${slug}`,
      type: 'guide',
      title,
      signals: [...items, slug, slug.replace(/-/g, ' ')],
      source: 'compare-data',
    })
  })
}

function parseCompareRouteSlugs(route) {
  if (!route.startsWith('/compare/')) return []
  const slug = route.split('/compare/')[1]
  if (!slug) return []
  const parts = slug.split('-vs-')
  return parts.map((part) => {
    return part.split('-for-')[0].split('-vs-')[0].trim()
  }).filter(Boolean)
}

function dedupeRecords(records) {
  const byRoute = new Map()
  for (const record of records) {
    if (!record.route) continue
    const existing = byRoute.get(record.route)
    if (!existing || existing.source === 'app-route') byRoute.set(record.route, record)
  }
  return [...byRoute.values()].sort((a, b) => a.route.localeCompare(b.route))
}

function scoreRelationship(source, target) {
  if (source.route === target.route) return 0
  const sourceClusters = new Set(source.clusters)
  const sourceSignals = new Set(source.signals)
  const sourceGoalSlugs = new Set(source.goalSlugs || [])
  let score = 0
  for (const cluster of target.clusters) if (sourceClusters.has(cluster)) score += 10
  for (const goalSlug of sourceGoalSlugs) if (target.route === `/goals/${goalSlug}`) score += 35
  for (const cluster of sourceClusters) if (target.route === `/goals/${cluster}`) score += 20
  for (const signal of target.signals) if (sourceSignals.has(signal)) score += 2
  if (source.type === 'herb' && target.type === 'compound') score += 2
  if (source.type === 'compound' && target.type === 'herb') score += 2
  if (source.type !== target.type && target.type !== 'safety') score += 1
  if (target.type === 'safety' && /safety|risk|caution|interaction|contraindication|pregnancy|medication/.test(source.signals.join(' '))) score += 8
  if ((EDITORIAL_LINK_BOOSTS[source.route] || []).includes(target.route)) score += 60
  if (['/articles', '/compounds', '/goals', '/guides', '/herbs'].includes(target.route)) score -= 8

  // Boost compare pages vs their compared items
  if (source.route.startsWith('/compare/')) {
    const compared = parseCompareRouteSlugs(source.route)
    const targetSlug = routeSlug(target.route)
    if (compared.includes(targetSlug) || compared.some(item => targetSlug.includes(item) || item.includes(targetSlug))) {
      score += 50
    }
  }
  if (target.route.startsWith('/compare/')) {
    const compared = parseCompareRouteSlugs(target.route)
    const sourceSlug = routeSlug(source.route)
    if (compared.includes(sourceSlug) || compared.some(item => sourceSlug.includes(item) || item.includes(sourceSlug))) {
      score += 50
    }
  }

  // Boost compare pages vs their relevant goals
  if (source.route.startsWith('/compare/') && target.route.startsWith('/goals/')) {
    const goalSlug = routeSlug(target.route)
    if (source.route.includes(goalSlug) || source.signals.includes(goalSlug) || source.clusters.includes(goalSlug)) {
      score += 45
    }
  }
  if (target.route.startsWith('/compare/') && source.route.startsWith('/goals/')) {
    const goalSlug = routeSlug(source.route)
    if (target.route.includes(goalSlug) || target.signals.includes(goalSlug) || target.clusters.includes(goalSlug)) {
      score += 45
    }
  }

  return score
}

function linkEntry(target, score) {
  return {
    href: target.href,
    label: target.label,
    score,
    type: target.type,
    clusters: target.clusters,
  }
}

function buildInternalLinkMap(records) {
  const map = {}
  const clusterHubs = records.filter((record) => record.route.startsWith('/goals/') || record.route.startsWith('/guides/') || record.route.startsWith('/education/'))
  const safetyRecords = records.filter((record) => record.type === 'safety')

  for (const source of records) {
    const scored = records
      .map((target) => ({ target, score: scoreRelationship(source, target) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score || a.target.route.localeCompare(b.target.route))

    const groups = new Map()
    for (const { target, score } of scored) {
      const title = groupTitleForType(target.type)
      const current = groups.get(title) || []
      if (current.length >= MAX_GROUP_LINKS) continue
      current.push(linkEntry(target, score))
      groups.set(title, current)
    }

    let totalLinks = [...groups.values()].reduce((sum, links) => sum + links.length, 0)
    if (totalLinks < MIN_PAGE_LINKS) {
      const fallback = [...clusterHubs, ...safetyRecords]
        .filter((target) => target.route !== source.route)
        .slice(0, MIN_PAGE_LINKS - totalLinks)
      for (const target of fallback) {
        const title = groupTitleForType(target.type)
        const current = groups.get(title) || []
        current.push(linkEntry(target, 1))
        groups.set(title, current)
      }
      totalLinks = [...groups.values()].reduce((sum, links) => sum + links.length, 0)
    }

    map[source.route] = {
      route: source.route,
      label: source.label,
      type: source.type,
      clusters: source.clusters,
      totalLinks,
      groups: [...groups.entries()].map(([title, links]) => ({ title, links })),
    }
  }
  return map
}

function buildTopicClusters(records) {
  const clusters = {}
  for (const cluster of PRIORITY_CLUSTERS) {
    const matchingRecords = records
      .filter((record) => record.clusters.includes(cluster.slug))
      .map((record) => ({ href: record.href, label: record.label, type: record.type }))
    const members = matchingRecords
      .slice(0, 80)
    clusters[cluster.slug] = { ...cluster, members, count: matchingRecords.length }
  }
  return clusters
}

function stableClone(value) {
  if (Array.isArray(value)) return value.map(stableClone)
  if (value && typeof value === 'object') {
    return Object.keys(value).sort((a, b) => a.localeCompare(b)).reduce((acc, key) => {
      acc[key] = stableClone(value[key])
      return acc
    }, {})
  }
  return value
}

async function writeJson(fileName, value) {
  await fs.mkdir(OUT_DIR, { recursive: true })
  await fs.writeFile(path.join(OUT_DIR, fileName), `${JSON.stringify(stableClone(value))}\n`, 'utf8')
}

function docsLink(item) {
  return `[${item.label}](${item.href})`
}

async function writeDocs(records, internalMap, topicClusters) {
  await fs.mkdir(DOCS_DIR, { recursive: true })

  const internalLines = [
    '# Internal Link Map',
    '',
    'Generated by `npm run data:build` via `scripts/data/build-internal-link-engine.mjs`.',
    '',
  ]
  for (const route of Object.keys(internalMap).sort()) {
    const entry = internalMap[route]
    internalLines.push(`## ${entry.label}`)
    internalLines.push(`- Route: \`${route}\``)
    internalLines.push(`- Clusters: ${entry.clusters.length ? entry.clusters.join(', ') : 'none detected'}`)
    for (const group of entry.groups) {
      internalLines.push(`- ${group.title}: ${group.links.map(docsLink).join(', ')}`)
    }
    internalLines.push('')
  }

  const clusterLines = [
    '# Topic Clusters',
    '',
    'Priority clusters used by the internal link engine.',
    '',
  ]
  for (const cluster of Object.values(topicClusters)) {
    clusterLines.push(`## ${cluster.label}`)
    clusterLines.push(`- Signals: ${cluster.signals.join(', ')}`)
    clusterLines.push(`- Pages: ${cluster.count}`)
    cluster.members.slice(0, 40).forEach((member) => {
      clusterLines.push(`- ${docsLink(member)} (${member.type})`)
    })
    clusterLines.push('')
  }

  const needingLinks = Object.values(internalMap)
    .filter((entry) => entry.totalLinks < MIN_PAGE_LINKS)
    .sort((a, b) => a.totalLinks - b.totalLinks || a.route.localeCompare(b.route))

  const needsLines = [
    '# Pages Needing Links',
    '',
    `Minimum target: ${MIN_PAGE_LINKS} related links per page.`,
    '',
    needingLinks.length ? '| Route | Links | Clusters |' : 'All analyzed pages currently meet the minimum internal-link target.',
  ]
  if (needingLinks.length) {
    needsLines.push('|---|---:|---|')
    needingLinks.forEach((entry) => {
      needsLines.push(`| \`${entry.route}\` | ${entry.totalLinks} | ${entry.clusters.join(', ') || 'none'} |`)
    })
  }

  await Promise.all([
    fs.writeFile(path.join(DOCS_DIR, 'internal-link-map.md'), `${internalLines.join('\n').trim()}\n`, 'utf8'),
    fs.writeFile(path.join(DOCS_DIR, 'topic-clusters.md'), `${clusterLines.join('\n').trim()}\n`, 'utf8'),
    fs.writeFile(path.join(DOCS_DIR, 'pages-needing-links.md'), `${needsLines.join('\n').trim()}\n`, 'utf8'),
  ])
}

async function main() {
  const [staticRecords, herbs, compounds, conditionMap, goals, compareRecords] = await Promise.all([
    buildStaticRouteRecords(),
    readJson('herbs-summary.json', []),
    readJson('compounds-summary.json', []),
    readJson('runtime-maps/entity-to-conditions.json', {}),
    goalRouteRecords(),
    buildCompareRouteRecords(),
  ])

  const safetyRecords = []
  for (const route of SAFETY_ROUTES) {
    if (await pathExists(path.join('app', ...route.href.split('/').filter(Boolean), 'page.tsx'))) {
      safetyRecords.push(routeRecord({ route: route.href, type: 'safety', title: route.label, signals: route.signals, source: 'safety-seed' }))
    }
  }

  const records = dedupeRecords([
    ...staticRecords,
    ...entityRouteRecords(herbs, 'herb', conditionMap),
    ...entityRouteRecords(compounds, 'compound', conditionMap),
    ...goals,
    ...compareRecords,
    ...safetyRecords,
  ])
  const internalMap = buildInternalLinkMap(records)
  const topicClusters = buildTopicClusters(records)

  await Promise.all([
    writeJson('internal-link-map.json', internalMap),
    writeJson('topic-clusters.json', topicClusters),
    writeDocs(records, internalMap, topicClusters),
  ])

  console.log(`Built internal link engine for ${records.length} pages`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
