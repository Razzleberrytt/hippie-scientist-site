import fs from 'node:fs'
import path from 'node:path'

const text = (value) => (Array.isArray(value) ? value.join(' ') : String(value ?? '')).replace(/\s+/g, ' ').trim()
const isIndexable = (record) => String(record.indexability_status ?? '').toUpperCase() === 'PUBLISH'

const SOFT_INSTRUCTION_PATTERNS = [
  { pattern: /\b(?:is|are)\s+best\s+framed\b/i, name: 'is-best-framed' },
  { pattern: /\bconservative evidence language\b/i, name: 'evidence-language-note' },
  { pattern: /\bconservative research profile\b/i, name: 'research-profile-template' },
]

const BOILERPLATE_PATTERNS = [
  /\b(?:botanical|compound)\s+profile\s+with\s+evidence,\s+safety,\s+and\s+practical\s+fit\.?$/i,
  /\bprofile\s+with\s+mechanism,?\s+safety,?\s+and\s+practical\s+context\b/i,
  /^no summary available yet\.?$/i,
]

const MECHANISM_VOCABULARY =
  /\b(ampk|nf-?kb|nrf2|mtor|cox-?2|5-?lox|gaba-?a|nmda|mao-?[ab]|sirt1|ppar\w*|hdac|tnf-?α|il-?6|cyp[0-9a-z]*|receptors?|pathway|signaling|inhibition|modulation|agonis\w*|antagonis\w*|apoptosis)\b/i

const OUTCOME_FIELDS = ['effects', 'primary_effects', 'conditions', 'best_for']
const ENTITY_SUFFIXES = ['-extract', '-berry', '-root', '-powder', '-isolated', '-hcl', '-standardized', '-leaf', '-seed', '-oil']

function loadRecords(root) {
  const dataDir = path.join(root, 'public', 'data')
  const read = (file) => {
    const full = path.join(dataDir, file)
    return fs.existsSync(full) ? JSON.parse(fs.readFileSync(full, 'utf8')) : []
  }
  return [
    ...read('herbs.json').map((record) => ({ ...record, entityType: 'herb' })),
    ...read('compounds.json').map((record) => ({ ...record, entityType: 'compound' })),
  ]
}

function tokenSet(value) {
  return new Set(text(value).toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((word) => word.length > 3))
}

function jaccard(left, right) {
  if (!left.size && !right.size) return 1
  if (!left.size || !right.size) return 0
  let intersection = 0
  for (const item of left) if (right.has(item)) intersection += 1
  return intersection / (left.size + right.size - intersection)
}

export function analyzeContentIntegrity(root = process.cwd()) {
  const records = loadRecords(root)
  const bySlug = new Map(records.map((record) => [record.slug, record]))

  const softInstructions = []
  for (const record of records) {
    for (const field of ['summary', 'description']) {
      const value = text(record[field])
      const hit = SOFT_INSTRUCTION_PATTERNS.find(({ pattern }) => pattern.test(value))
      if (!hit) continue
      softInstructions.push({ slug: record.slug, field, pattern: hit.name, indexable: isIndexable(record), value: value.slice(0, 140) })
      break
    }
  }

  const boilerplate = records
    .filter((record) => BOILERPLATE_PATTERNS.some((pattern) => pattern.test(text(record.summary))))
    .map((record) => ({ slug: record.slug, indexable: isIndexable(record), summary: text(record.summary).slice(0, 120) }))

  const duplicates = []
  for (const record of records) {
    for (const suffix of ENTITY_SUFFIXES) {
      if (!record.slug.endsWith(suffix)) continue
      const base = bySlug.get(record.slug.slice(0, -suffix.length))
      if (!base) continue

      const prose = jaccard(tokenSet(`${base.summary} ${base.description}`), tokenSet(`${record.summary} ${record.description}`))
      const mechanisms = jaccard(tokenSet(base.mechanisms), tokenSet(record.mechanisms))
      const effects = jaccard(tokenSet(base.effects), tokenSet(record.effects))
      duplicates.push({
        base: base.slug,
        variant: record.slug,
        suffix,
        bothIndexable: isIndexable(base) && isIndexable(record),
        overlap: Number(((prose + mechanisms + effects) / 3).toFixed(2)),
        prose: Number(prose.toFixed(2)),
        mechanisms: Number(mechanisms.toFixed(2)),
        effects: Number(effects.toFixed(2)),
        baseGrade: base.evidence_grade ?? null,
        variantGrade: record.evidence_grade ?? null,
        contradictoryGrades: prose >= 0.9 && String(base.evidence_grade) !== String(record.evidence_grade),
      })
    }
  }
  duplicates.sort((a, b) => b.overlap - a.overlap)

  const mechanismAsOutcome = []
  for (const record of records) {
    const found = new Set()
    for (const field of OUTCOME_FIELDS) {
      const raw = record[field]
      const items = Array.isArray(raw) ? raw : text(raw).split(/[;,|]/)
      for (const item of items) {
        const value = text(item)
        if (value && MECHANISM_VOCABULARY.test(value)) found.add(`${field}:${value}`)
      }
    }
    if (found.size) mechanismAsOutcome.push({ slug: record.slug, indexable: isIndexable(record), values: [...found].slice(0, 6) })
  }

  const summaryOwners = new Map()
  for (const record of records) {
    const value = text(record.summary).toLowerCase()
    if (!value || BOILERPLATE_PATTERNS.some((pattern) => pattern.test(value))) continue
    if (!summaryOwners.has(value)) summaryOwners.set(value, [])
    summaryOwners.get(value).push(record.slug)
  }
  const repeatedSummaries = [...summaryOwners.entries()]
    .filter(([, slugs]) => slugs.length > 1)
    .map(([value, slugs]) => ({ slugs, count: slugs.length, summary: value.slice(0, 110) }))
    .sort((a, b) => b.count - a.count)

  const indexableCount = (items) => items.filter((item) => item.indexable).length
  const summary = {
    profiles: records.length,
    indexable: records.filter(isIndexable).length,
    softInstructionVoice: { total: softInstructions.length, indexable: indexableCount(softInstructions) },
    boilerplateSummaries: { total: boilerplate.length, indexable: indexableCount(boilerplate) },
    duplicateCandidates: {
      total: duplicates.length,
      bothIndexable: duplicates.filter((item) => item.bothIndexable).length,
      contradictoryGrades: duplicates.filter((item) => item.contradictoryGrades).length,
    },
    repeatedSummaries: { groups: repeatedSummaries.length, records: repeatedSummaries.reduce((sum, group) => sum + group.count, 0) },
    mechanismAsOutcome: { total: mechanismAsOutcome.length, indexable: indexableCount(mechanismAsOutcome) },
  }

  return { generatedAt: new Date().toISOString(), summary, softInstructions, boilerplate, duplicates, repeatedSummaries, mechanismAsOutcome }
}

export function writeContentIntegrityReport(report, root = process.cwd()) {
  const output = path.join(root, 'ops', 'reports', 'content-integrity.json')
  fs.mkdirSync(path.dirname(output), { recursive: true })
  fs.writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`)
  return output
}

export function printContentIntegrityReport(report, root = process.cwd(), output = null) {
  const { summary, duplicates } = report
  console.log('\nContent integrity')
  console.log('='.repeat(72))
  console.log(`Profiles ${summary.profiles} (${summary.indexable} indexable)\n`)
  console.log(`Instruction voice, not auto-stripped   ${String(summary.softInstructionVoice.total).padStart(4)}  (${summary.softInstructionVoice.indexable} indexable)`)
  console.log(`Boilerplate summaries                  ${String(summary.boilerplateSummaries.total).padStart(4)}  (${summary.boilerplateSummaries.indexable} indexable)`)
  console.log(`Duplicate entity candidates            ${String(summary.duplicateCandidates.total).padStart(4)}  (${summary.duplicateCandidates.bothIndexable} with both pages indexable)`)
  console.log(`  of those, contradictory grades       ${String(summary.duplicateCandidates.contradictoryGrades).padStart(4)}`)
  console.log(`Summaries repeated across entities     ${String(summary.repeatedSummaries.groups).padStart(4)}  groups covering ${summary.repeatedSummaries.records} records`)
  console.log(`Mechanism listed as an outcome         ${String(summary.mechanismAsOutcome.total).padStart(4)}  (${summary.mechanismAsOutcome.indexable} indexable)`)

  const worst = duplicates.filter((item) => item.bothIndexable).slice(0, 8)
  if (worst.length) {
    console.log('\nHighest-overlap indexable pairs:')
    for (const item of worst) {
      const flag = item.contradictoryGrades ? '  <- same prose, different grade' : ''
      console.log(`  ${item.overlap.toFixed(2)}  /${item.base}/ vs /${item.variant}/  (${item.baseGrade} vs ${item.variantGrade})${flag}`)
    }
  }
  if (output) console.log(`\nReport: ${path.relative(root, output)}`)
}
