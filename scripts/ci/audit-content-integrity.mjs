#!/usr/bin/env node
/**
 * Content integrity report (backlog 50).
 *
 * One report covering the defect classes that are real but not safe to fix
 * automatically, because each needs an editorial decision rather than a rule:
 *
 *  1. Instruction-voice prose that the build does NOT strip. `validate-editorial-leaks`
 *     removes unambiguous cases ("It should be framed modestly because…").
 *     "Bitter melon is best framed around blood-glucose research" is editorial
 *     voice too, but it carries real meaning, so deleting it would cost content.
 *  2. Boilerplate summaries — machine-generated filler standing in for prose.
 *  3. Duplicate entity candidates — two slugs competing for one search intent.
 *  4. Mechanism vocabulary sitting in a field that describes outcomes.
 *  5. Summaries repeated verbatim across different entities.
 *
 * Reporting only; this never exits non-zero. It exists so the work is visible
 * and rankable, not to block a build on a judgement call.
 *
 * Usage: node scripts/ci/audit-content-integrity.mjs
 */

import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const DATA_DIR = path.join(ROOT, 'public', 'data')
const REPORTS_DIR = path.join(ROOT, 'ops', 'reports')
const REPORT_PATH = path.join(REPORTS_DIR, 'content-integrity.json')

const text = (value) => (Array.isArray(value) ? value.join(' ') : String(value ?? '')).replace(/\s+/g, ' ').trim()
const isIndexable = (record) => String(record.indexability_status ?? '').toUpperCase() === 'PUBLISH'

function load() {
  const read = (file) => {
    const full = path.join(DATA_DIR, file)
    return fs.existsSync(full) ? JSON.parse(fs.readFileSync(full, 'utf8')) : []
  }
  return [
    ...read('herbs.json').map((r) => ({ ...r, entityType: 'herb' })),
    ...read('compounds.json').map((r) => ({ ...r, entityType: 'compound' })),
  ]
}

/** Editorial voice that survives the build because stripping it would cost meaning. */
const SOFT_INSTRUCTION_PATTERNS = [
  { pattern: /\b(?:is|are)\s+best\s+framed\b/i, name: 'is-best-framed' },
  { pattern: /\bconservative evidence language\b/i, name: 'evidence-language-note' },
  { pattern: /\bconservative research profile\b/i, name: 'research-profile-template' },
]

/** Machine-written filler that stands in for a real summary. */
const BOILERPLATE_PATTERNS = [
  /\b(?:botanical|compound)\s+profile\s+with\s+evidence,\s+safety,\s+and\s+practical\s+fit\.?$/i,
  /\bprofile\s+with\s+mechanism,?\s+safety,?\s+and\s+practical\s+context\b/i,
  /^no summary available yet\.?$/i,
]

/**
 * Mechanism vocabulary. A target, pathway, or receptor is something the
 * ingredient touches, not something it does for a person.
 *
 * The presentation layer already hedges: profile pages label these "main
 * contexts" and the JSON-LD builder emits them as a generic
 * "profile use contexts" property rather than a schema.org benefit. The
 * conflation is in the data, where a pathway sits in an outcome field, and it
 * still reaches surfaces that render the value bare — a compound card shows
 * `primaryEffects[0]` as an unlabelled chip, so a card can read "AMPK".
 */
const MECHANISM_VOCABULARY =
  /\b(ampk|nf-?kb|nrf2|mtor|cox-?2|5-?lox|gaba-?a|nmda|mao-?[ab]|sirt1|ppar\w*|hdac|tnf-?α|il-?6|cyp[0-9a-z]*|receptors?|pathway|signaling|inhibition|modulation|agonis\w*|antagonis\w*|apoptosis)\b/i

const OUTCOME_FIELDS = ['effects', 'primary_effects', 'conditions', 'best_for']

const ENTITY_SUFFIXES = [
  '-extract', '-berry', '-root', '-powder', '-isolated', '-hcl',
  '-standardized', '-leaf', '-seed', '-oil',
]

function tokenSet(value) {
  return new Set(
    text(value).toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w.length > 3),
  )
}

function jaccard(a, b) {
  if (!a.size && !b.size) return 1
  if (!a.size || !b.size) return 0
  let intersection = 0
  for (const item of a) if (b.has(item)) intersection += 1
  return intersection / (a.size + b.size - intersection)
}

function main() {
  const records = load()
  const bySlug = new Map(records.map((r) => [r.slug, r]))

  // 1. Soft instruction voice.
  const softInstructions = []
  for (const record of records) {
    for (const field of ['summary', 'description']) {
      const value = text(record[field])
      const hit = SOFT_INSTRUCTION_PATTERNS.find(({ pattern }) => pattern.test(value))
      if (!hit) continue
      softInstructions.push({
        slug: record.slug,
        field,
        pattern: hit.name,
        indexable: isIndexable(record),
        value: value.slice(0, 140),
      })
      break
    }
  }

  // 2. Boilerplate summaries.
  const boilerplate = records
    .filter((record) => BOILERPLATE_PATTERNS.some((pattern) => pattern.test(text(record.summary))))
    .map((record) => ({ slug: record.slug, indexable: isIndexable(record), summary: text(record.summary).slice(0, 120) }))

  // 3. Duplicate entity candidates.
  const duplicates = []
  for (const record of records) {
    for (const suffix of ENTITY_SUFFIXES) {
      if (!record.slug.endsWith(suffix)) continue
      const base = bySlug.get(record.slug.slice(0, -suffix.length))
      if (!base) continue

      const prose = jaccard(
        tokenSet(`${base.summary} ${base.description}`),
        tokenSet(`${record.summary} ${record.description}`),
      )
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
        // Same words, different verdict: one of the two grades is wrong, or the
        // two records are not actually the same thing and should not read alike.
        contradictoryGrades: prose >= 0.9 && String(base.evidence_grade) !== String(record.evidence_grade),
      })
    }
  }
  duplicates.sort((a, b) => b.overlap - a.overlap)

  // 4. Mechanism vocabulary sitting in an outcome field.
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
    if (found.size) {
      mechanismAsOutcome.push({ slug: record.slug, indexable: isIndexable(record), values: [...found].slice(0, 6) })
    }
  }

  // 5. Summaries repeated across entities.
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

  const indexableCount = (list) => list.filter((item) => item.indexable).length
  const summary = {
    profiles: records.length,
    indexable: records.filter(isIndexable).length,
    softInstructionVoice: { total: softInstructions.length, indexable: indexableCount(softInstructions) },
    boilerplateSummaries: { total: boilerplate.length, indexable: indexableCount(boilerplate) },
    duplicateCandidates: {
      total: duplicates.length,
      bothIndexable: duplicates.filter((d) => d.bothIndexable).length,
      contradictoryGrades: duplicates.filter((d) => d.contradictoryGrades).length,
    },
    repeatedSummaries: { groups: repeatedSummaries.length, records: repeatedSummaries.reduce((n, g) => n + g.count, 0) },
    mechanismAsOutcome: { total: mechanismAsOutcome.length, indexable: indexableCount(mechanismAsOutcome) },
  }

  fs.mkdirSync(REPORTS_DIR, { recursive: true })
  fs.writeFileSync(
    REPORT_PATH,
    `${JSON.stringify({ generatedAt: new Date().toISOString(), summary, softInstructions, boilerplate, duplicates, repeatedSummaries, mechanismAsOutcome }, null, 2)}\n`,
  )

  console.log('\nContent integrity')
  console.log('='.repeat(72))
  console.log(`Profiles ${summary.profiles} (${summary.indexable} indexable)\n`)
  console.log(`Instruction voice, not auto-stripped   ${String(summary.softInstructionVoice.total).padStart(4)}  (${summary.softInstructionVoice.indexable} indexable)`)
  console.log(`Boilerplate summaries                  ${String(summary.boilerplateSummaries.total).padStart(4)}  (${summary.boilerplateSummaries.indexable} indexable)`)
  console.log(`Duplicate entity candidates            ${String(summary.duplicateCandidates.total).padStart(4)}  (${summary.duplicateCandidates.bothIndexable} with both pages indexable)`)
  console.log(`  of those, contradictory grades       ${String(summary.duplicateCandidates.contradictoryGrades).padStart(4)}`)
  console.log(`Summaries repeated across entities     ${String(summary.repeatedSummaries.groups).padStart(4)}  groups covering ${summary.repeatedSummaries.records} records`)
  console.log(`Mechanism listed as an outcome         ${String(summary.mechanismAsOutcome.total).padStart(4)}  (${summary.mechanismAsOutcome.indexable} indexable)`)

  const worst = duplicates.filter((d) => d.bothIndexable).slice(0, 8)
  if (worst.length) {
    console.log('\nHighest-overlap indexable pairs:')
    for (const d of worst) {
      const flag = d.contradictoryGrades ? '  <- same prose, different grade' : ''
      console.log(`  ${d.overlap.toFixed(2)}  /${d.base}/ vs /${d.variant}/  (${d.baseGrade} vs ${d.variantGrade})${flag}`)
    }
  }

  console.log(`\nReport: ${path.relative(ROOT, REPORT_PATH)}`)
}

main()
