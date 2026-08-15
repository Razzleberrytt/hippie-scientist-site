#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const DEFAULT_LEDGER = path.join(ROOT, 'data/seo/metadata-experiments.json')
const MAX_SIMULTANEOUS_EXPERIMENTS = 10
const CTR_BY_POSITION = new Map([[1, .28],[2,.15],[3,.11],[4,.08],[5,.065],[6,.052],[7,.043],[8,.036],[9,.031],[10,.027],[11,.022],[12,.019],[13,.017],[14,.015],[15,.013],[20,.008]])

function arg(name, fallback = '') {
  const value = process.argv.find((entry) => entry.startsWith(`--${name}=`))
  return value ? value.split('=').slice(1).join('=') : fallback
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`)
}

function normalizeUrl(value) {
  try {
    const url = new URL(String(value), 'https://thehippiescientist.net')
    return url.pathname === '/' ? '/' : `${url.pathname.replace(/\/+$/, '')}/`
  } catch {
    return ''
  }
}

function expectedCtr(position) {
  const rounded = Math.round(position)
  if (CTR_BY_POSITION.has(rounded)) return CTR_BY_POSITION.get(rounded)
  if (position > 20) return Math.max(.002, .008 * (20 / position))
  const ranks = [...CTR_BY_POSITION.keys()].sort((a,b) => a-b)
  for (let i = 0; i < ranks.length - 1; i += 1) {
    const a = ranks[i], b = ranks[i + 1]
    if (position > a && position < b) {
      const t = (position - a) / (b - a)
      return CTR_BY_POSITION.get(a) + (CTR_BY_POSITION.get(b) - CTR_BY_POSITION.get(a)) * t
    }
  }
  return .28
}

function intent(query) {
  const value = query.toLowerCase()
  if (/\b(vs|versus|compare|comparison|alternative)\b/.test(value)) return 'comparison'
  if (/\b(dose|dosage|how much|mg|gram)\b/.test(value)) return 'dose'
  if (/\b(when|morning|night|time to take|before bed|with food|empty stomach)\b/.test(value)) return 'timing'
  if (/\b(safe|safety|interaction|side effect|risk|contraindication|warning)\b/.test(value)) return 'safety'
  if (/\b(best brand|buy|quality|extract|form|standardized|third party|coa)\b/.test(value)) return 'product-quality'
  return 'general'
}

function differentiator(kind) {
  return {
    safety: 'Safety, Interactions & Evidence',
    dose: 'Studied Doses & Evidence',
    timing: 'Timing, Evidence & Safety',
    comparison: 'Evidence & Safety Comparison',
    'product-quality': 'Forms, Quality & Evidence',
    general: 'Evidence, Effects & Safety',
  }[kind]
}

function compactTitle(query, kind) {
  const cleaned = query.trim().replace(/\s+/g, ' ')
  const proposed = `${cleaned}: ${differentiator(kind)}`
  if (proposed.length <= 60) return proposed
  if (cleaned.length <= 60) return cleaned
  return `${cleaned.slice(0, 59).replace(/\s+\S*$/, '')}…`
}

function proposedDescriptions(query, kind) {
  const topic = query.trim().replace(/\s+/g, ' ')
  const focus = differentiator(kind).toLowerCase()
  return {
    questionLed: `Researching ${topic}? Compare ${focus}, source quality, and the limits of the available evidence before making a decision.`.slice(0, 160),
    conclusionLed: `${topic}: a concise evidence-first review of ${focus}, with major limitations and practical safety context kept visible.`.slice(0, 160),
  }
}

function loadLedger(file) {
  if (!fs.existsSync(file)) return { version: 1, experiments: [] }
  const ledger = readJson(file)
  if (!Array.isArray(ledger.experiments)) ledger.experiments = []
  return ledger
}

function aggregateRows(rows) {
  const byUrl = new Map()
  for (const row of rows) {
    const url = normalizeUrl(row.url || row.page || row.path)
    const query = String(row.query || row.search_query || row.searchQuery || '').trim()
    if (!url || !query) continue
    const impressions = Number(row.impressions || 0)
    const clicks = Number(row.clicks || 0)
    const position = Number(row.position || row.average_position || row.averagePosition || 0)
    if (!Number.isFinite(impressions) || impressions <= 0 || !Number.isFinite(position)) continue

    const current = byUrl.get(url) || {
      url,
      impressions: 0,
      clicks: 0,
      weightedPosition: 0,
      queries: new Map(),
      title: String(row.title || row.current_title || row.currentTitle || ''),
      description: String(row.description || row.meta_description || row.metaDescription || ''),
    }
    current.impressions += impressions
    current.clicks += clicks
    current.weightedPosition += position * impressions
    current.queries.set(query, (current.queries.get(query) || 0) + impressions)
    if (!current.title && row.title) current.title = String(row.title)
    if (!current.description && (row.description || row.meta_description)) current.description = String(row.description || row.meta_description)
    byUrl.set(url, current)
  }

  return [...byUrl.values()].map((row) => ({
    ...row,
    position: row.weightedPosition / row.impressions,
    primaryQuery: [...row.queries.entries()].sort((a,b) => b[1] - a[1])[0]?.[0] || '',
  }))
}

function propose() {
  const input = arg('input')
  if (!input) throw new Error('propose requires --input=<search-console.json>')
  const ledgerFile = path.resolve(ROOT, arg('ledger', 'data/seo/metadata-experiments.json'))
  const max = Math.min(MAX_SIMULTANEOUS_EXPERIMENTS, Math.max(1, Number(arg('max', '10')) || 10))
  const ledger = loadLedger(ledgerFile)
  const existingByUrl = new Map(ledger.experiments.map((experiment) => [experiment.url, experiment]))
  const activeCount = ledger.experiments.filter((experiment) => ['running', 'proposed'].includes(experiment.status)).length
  const available = Math.max(0, max - activeCount)
  if (!available) {
    console.log('No experiment slots available; existing proposed/running experiments already hit the batch cap.')
    return
  }

  const rows = aggregateRows(Array.isArray(readJson(path.resolve(ROOT, input))) ? readJson(path.resolve(ROOT, input)) : readJson(path.resolve(ROOT, input)).rows || [])
  const candidates = rows.map((row) => {
    const ctr = row.clicks / row.impressions
    const expected = expectedCtr(row.position)
    return { ...row, ctr, expected, underperformanceRatio: expected > 0 ? ctr / expected : 1 }
  }).filter((row) => row.impressions >= 100 && row.position >= 1 && row.position <= 15 && row.underperformanceRatio < .72)
    .filter((row) => !existingByUrl.has(row.url) || existingByUrl.get(row.url).status === 'closed')
    .sort((a,b) => (b.impressions * (b.expected - b.ctr)) - (a.impressions * (a.expected - a.ctr)))
    .slice(0, available)

  for (const row of candidates) {
    const kind = intent(row.primaryQuery)
    const descriptions = proposedDescriptions(row.primaryQuery, kind)
    ledger.experiments.push({
      id: `meta-${new Date().toISOString().slice(0,10)}-${row.url.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').slice(0,50)}`,
      url: row.url,
      status: 'proposed',
      primaryQuery: row.primaryQuery,
      intent: kind,
      createdAt: new Date().toISOString(),
      baseline: {
        title: row.title,
        description: row.description,
        impressions: row.impressions,
        clicks: row.clicks,
        ctr: row.ctr,
        position: row.position,
        expectedCtr: row.expected,
      },
      variants: [
        { id: 'query-first-question', title: compactTitle(row.primaryQuery, kind), description: descriptions.questionLed, status: 'candidate', results: [] },
        { id: 'query-first-conclusion', title: compactTitle(row.primaryQuery, kind), description: descriptions.conclusionLed, status: 'candidate', results: [] },
      ],
      revisions: [{ at: new Date().toISOString(), action: 'proposed', note: 'CTR underperformed the expected position benchmark.' }],
    })
  }

  writeJson(ledgerFile, ledger)
  console.log(`Added ${candidates.length} metadata experiments to ${path.relative(ROOT, ledgerFile)}.`)
}

function start() {
  const ledgerFile = path.resolve(ROOT, arg('ledger', 'data/seo/metadata-experiments.json'))
  const id = arg('id')
  const variantId = arg('variant')
  if (!id || !variantId) throw new Error('start requires --id=<experiment-id> --variant=<variant-id>')
  const ledger = loadLedger(ledgerFile)
  const experiment = ledger.experiments.find((item) => item.id === id)
  if (!experiment) throw new Error(`Unknown experiment: ${id}`)
  if (ledger.experiments.filter((item) => item.status === 'running').length >= MAX_SIMULTANEOUS_EXPERIMENTS) throw new Error('Running experiment cap reached.')
  if (experiment.status === 'winner') throw new Error('Winning metadata is protected. Close/supersede explicitly before replacing it.')
  const variant = experiment.variants.find((item) => item.id === variantId)
  if (!variant) throw new Error(`Unknown variant: ${variantId}`)
  experiment.status = 'running'
  experiment.activeVariant = variantId
  experiment.startedAt = new Date().toISOString()
  variant.status = 'running'
  experiment.revisions.push({ at: new Date().toISOString(), action: 'started', variant: variantId })
  writeJson(ledgerFile, ledger)
  console.log(`Started ${id} / ${variantId}. Apply this exact metadata revision to the URL, then record 14/28-day results.`)
}

function record() {
  const ledgerFile = path.resolve(ROOT, arg('ledger', 'data/seo/metadata-experiments.json'))
  const id = arg('id')
  const impressions = Number(arg('impressions'))
  const clicks = Number(arg('clicks'))
  const position = Number(arg('position'))
  if (!id || !Number.isFinite(impressions) || !Number.isFinite(clicks) || !Number.isFinite(position)) throw new Error('record requires --id, --impressions, --clicks, --position')
  const ledger = loadLedger(ledgerFile)
  const experiment = ledger.experiments.find((item) => item.id === id)
  if (!experiment || !experiment.activeVariant) throw new Error('Experiment must be running with an active variant.')
  const variant = experiment.variants.find((item) => item.id === experiment.activeVariant)
  variant.results.push({ at: new Date().toISOString(), impressions, clicks, ctr: impressions > 0 ? clicks / impressions : 0, position })
  experiment.revisions.push({ at: new Date().toISOString(), action: 'results-recorded', variant: experiment.activeVariant, impressions, clicks, position })
  writeJson(ledgerFile, ledger)
  console.log(`Recorded results for ${id}.`)
}

function winner() {
  const ledgerFile = path.resolve(ROOT, arg('ledger', 'data/seo/metadata-experiments.json'))
  const id = arg('id')
  const variantId = arg('variant')
  if (!id || !variantId) throw new Error('winner requires --id and --variant')
  const ledger = loadLedger(ledgerFile)
  const experiment = ledger.experiments.find((item) => item.id === id)
  if (!experiment) throw new Error(`Unknown experiment: ${id}`)
  const variant = experiment.variants.find((item) => item.id === variantId)
  if (!variant) throw new Error(`Unknown variant: ${variantId}`)
  experiment.status = 'winner'
  experiment.winnerVariant = variantId
  experiment.activeVariant = variantId
  experiment.wonAt = new Date().toISOString()
  for (const item of experiment.variants) item.status = item.id === variantId ? 'winner' : 'loser'
  experiment.revisions.push({ at: new Date().toISOString(), action: 'winner-declared', variant: variantId })
  writeJson(ledgerFile, ledger)
  console.log(`Protected ${variantId} as winner for ${experiment.url}.`)
}

function validate() {
  const ledgerFile = path.resolve(ROOT, arg('ledger', 'data/seo/metadata-experiments.json'))
  const ledger = loadLedger(ledgerFile)
  const running = ledger.experiments.filter((item) => item.status === 'running')
  const urlSet = new Set()
  const errors = []
  if (running.length > MAX_SIMULTANEOUS_EXPERIMENTS) errors.push(`running experiment count ${running.length} exceeds ${MAX_SIMULTANEOUS_EXPERIMENTS}`)
  for (const experiment of ledger.experiments) {
    if (!experiment.id || !experiment.url) errors.push('experiment missing id/url')
    if (urlSet.has(experiment.url) && experiment.status !== 'closed') errors.push(`multiple live ledger entries for ${experiment.url}`)
    if (experiment.status !== 'closed') urlSet.add(experiment.url)
    if (experiment.status === 'winner' && !experiment.winnerVariant) errors.push(`winner ${experiment.id} lacks winnerVariant`)
    for (const variant of experiment.variants || []) {
      if ((variant.title || '').length > 60) errors.push(`${experiment.id}/${variant.id} title > 60 chars`)
      if ((variant.description || '').length > 160) errors.push(`${experiment.id}/${variant.id} description > 160 chars`)
    }
  }
  if (errors.length) {
    console.error(errors.join('\n'))
    process.exitCode = 1
  } else console.log(`Metadata experiment ledger valid: ${ledger.experiments.length} experiments, ${running.length} running.`)
}

const command = process.argv[2] || 'validate'
if (command === 'propose') propose()
else if (command === 'start') start()
else if (command === 'record') record()
else if (command === 'winner') winner()
else if (command === 'validate') validate()
else throw new Error(`Unknown command: ${command}`)
