import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import test from 'node:test'
import assert from 'node:assert/strict'

import { evaluateEntryReadiness } from '../../enrichment/normalize-enrichment-lib.mjs'

const ROOT = process.cwd()
const BOOTSTRAP_SCRIPT = path.join(ROOT, 'scripts', 'data', 'bootstrap-enrichment-source-registry.mjs')
const VALIDATOR_SCRIPT = path.join(ROOT, 'scripts', 'validate-source-registry.mjs')

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'))
}

function readJsonl(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8').split(/\r?\n/).map(line => line.trim()).filter(Boolean).map(line => JSON.parse(line))
}

test('all active approved normalized entries have publication-ready source support', () => {
  const registry = readJson('public/data/source-registry.json')
  const registryById = new Map(registry.map(row => [row.sourceId, row]))
  const entries = readJsonl('public/data/enrichment-normalized.jsonl')
  const activeApproved = entries.filter(row => row.active === true && row.editorialStatus === 'approved')

  const blockedBySource = activeApproved.filter(entry => {
    const readiness = evaluateEntryReadiness(entry, registryById.get(entry.sourceId) || null)
    return readiness.reasons.some(reason =>
      reason === 'missing_source_registry_reference' ||
      reason === 'source_inactive' ||
      reason === 'source_publication_status_withdrawn' ||
      reason === 'source_publication_status_superseded' ||
      reason === 'source_publication_status_archived'
    )
  })

  assert.deepEqual([...new Set(blockedBySource.map(row => row.sourceId))].sort(), [])
})

test('archived source status blocks canonical publication readiness', () => {
  const entry = {
    active: true,
    reviewer: 'governor-test',
    reviewedAt: '2026-08-25T01:35:00.000Z',
    editorialStatus: 'approved',
    evidenceClass: 'human-clinical',
  }
  const source = { active: true, publicationStatus: 'archived' }
  const readiness = evaluateEntryReadiness(entry, source)
  assert.equal(readiness.publishable, false)
  assert.ok(readiness.reasons.includes('source_publication_status_archived'))
  assert.ok(readiness.criticalReasons.includes('source_publication_status_archived'))
})

test('baseline registry preserves current and historical identities without conflating readiness', () => {
  const registry = readJson('public/data/source-registry.json')
  const baseline = readJson('data-sources/enrichment-source-registry-baseline.json')
  const registryById = new Map(registry.map(row => [row.sourceId, row]))

  assert.equal(baseline.length, 9)
  const historical = registryById.get('src_fda-epidiolex-label-2021')
  assert.ok(historical)
  assert.equal(historical.active, false)
  assert.equal(historical.publicationStatus, 'superseded')

  const current = registryById.get('src_fda-epidiolex-label-2026')
  assert.ok(current)
  assert.equal(current.active, true)
  assert.equal(current.publicationStatus, 'published')
  assert.equal(current.monographId, 'SPL-8bf27097-4870-43fb-94f0-f3d0871d1eec-20260529')

  const kavaSafety = registryById.get('src_pubmed-23348842')
  assert.ok(kavaSafety)
  assert.equal(kavaSafety.active, true)
  assert.equal(kavaSafety.publicationStatus, 'published')
  assert.equal(kavaSafety.pmid, '23348842')
  assert.equal(kavaSafety.doi, '10.1002/ptr.4916')

  for (const expected of baseline) {
    const actual = registryById.get(expected.sourceId)
    assert.ok(actual, `missing baseline source ${expected.sourceId}`)
    assert.equal(actual.active, expected.active, `${expected.sourceId} active-state drift`)
    assert.equal(actual.publicationStatus, expected.publicationStatus, `${expected.sourceId} publication-status drift`)
    assert.equal(actual.sourceClass, expected.sourceClass, `${expected.sourceId} source-class drift`)
    assert.equal(actual.evidenceClass, expected.evidenceClass, `${expected.sourceId} evidence-class drift`)
    assert.equal(actual.doi || null, expected.doi || null, `${expected.sourceId} DOI identity drift`)
    assert.equal(actual.pmid || null, expected.pmid || null, `${expected.sourceId} PMID identity drift`)
    assert.equal(actual.canonicalUrl || null, expected.canonicalUrl || null, `${expected.sourceId} URL identity drift`)
    assert.equal(actual.monographId || null, expected.monographId || null, `${expected.sourceId} monograph identity drift`)
  }
})

test('current CBD provenance anchors remain pinned to verified source identities', () => {
  const registry = readJson('public/data/source-registry.json')
  const registryById = new Map(registry.map(row => [row.sourceId, row]))
  const currentLabel = registryById.get('src_fda-epidiolex-label-2026')
  const nonSeizureReview = registryById.get('src_pubmed-36271316')

  assert.equal(currentLabel?.canonicalUrl, 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=8bf27097-4870-43fb-94f0-f3d0871d1eec')
  assert.equal(currentLabel?.publicationYear, 2026)
  assert.equal(nonSeizureReview?.pmid, '36271316')
  assert.equal(nonSeizureReview?.doi, '10.1007/s40290-022-00446-8')
})

test('active CBD claims do not use the superseded 2021 EPIDIOLEX label', () => {
  const entries = readJsonl('public/data/enrichment-normalized.jsonl')
  const cbd = entries.filter(row => row.entityType === 'compound' && row.entitySlug === 'cannabidiol' && row.active === true && row.editorialStatus === 'approved')

  assert.ok(cbd.length > 0)
  assert.equal(cbd.some(row => row.sourceId === 'src_fda-epidiolex-label-2021'), false)
  assert.equal(cbd.find(row => row.enrichmentId === 'enr_cbd-medication-class-caution-cns-depressants')?.sourceId, 'src_fda-epidiolex-label-2026')
  assert.equal(cbd.find(row => row.enrichmentId === 'enr_cbd-enzyme-cyp2c19')?.sourceId, 'src_fda-epidiolex-label-2026')
  assert.equal(cbd.find(row => row.enrichmentId === 'enr_cbd-research-gap-non-epilepsy')?.sourceId, 'src_pubmed-36271316')
})

test('Ashwagandha efficacy stays limited to the statistically supported endpoint', () => {
  const entries = readJsonl('public/data/enrichment-normalized.jsonl')
  const efficacy = entries.find(row => row.enrichmentId === 'enr_ashwagandha-supported-use-stress-rct')

  assert.equal(efficacy?.sourceId, 'src_pubmed-31517876')
  assert.equal(efficacy?.strengthLabel, 'limited')
  assert.match(efficacy?.findingTextNormalized || '', /HAM-A/i)
  assert.match(efficacy?.findingTextNormalized || '', /P = \.040/)
  assert.match(efficacy?.findingTextNormalized || '', /DASS-21/i)
  assert.match(efficacy?.findingTextNormalized || '', /P = \.096/)
  assert.match(efficacy?.findingTextNormalized || '', /not statistically significant/i)
  assert.doesNotMatch(efficacy?.findingTextNormalized || '', /reduced validated stress and anxiety symptom scores versus placebo/i)
  assert.match(efficacy?.conflictNote || '', /Arjuna Natural Ltd funded the study/i)
  assert.match(efficacy?.conflictNote || '', /does not establish independent replication/i)
})

test('Chamomile safety stays within adverse events actually reported by the review', () => {
  const entries = readJsonl('public/data/enrichment-normalized.jsonl')
  const safety = entries.find(row => row.enrichmentId === 'enr_chamomile-adverse-effect-sedation')

  assert.equal(safety?.sourceId, 'src_pubmed-31006899')
  assert.equal(safety?.mechanismKnown, false)
  assert.equal(safety?.targetName, 'participants in reviewed chamomile trials')
  assert.match(safety?.findingTextNormalized || '', /mild adverse events were reported by three trials/i)
  assert.match(safety?.uncertaintyNote || '', /does not establish that co-sedative exposure increases adverse-event risk/i)
  assert.doesNotMatch(safety?.findingTextNormalized || '', /especially when combined with other sedating exposures/i)
})

test('Kava liver safety does not borrow the anxiety review for publishable claims', () => {
  const entries = readJsonl('public/data/enrichment-normalized.jsonl')
  const historicalConflict = entries.find(row => row.enrichmentId === 'enr_kava-conflict-hepatotoxicity-note')
  const historicalCaution = entries.find(row => row.enrichmentId === 'enr_kava-condition-caution-liver-disease')
  const trialSafety = entries.find(row => row.enrichmentId === 'enr_kava-short-term-liver-tolerability-rct')
  const longTermGap = entries.find(row => row.enrichmentId === 'enr_kava-research-gap-long-term-safety')

  assert.equal(historicalConflict?.active, false)
  assert.equal(historicalConflict?.editorialStatus, 'deprecated')
  assert.equal(historicalCaution?.active, false)
  assert.equal(historicalCaution?.editorialStatus, 'deprecated')
  assert.equal(trialSafety?.active, true)
  assert.equal(trialSafety?.editorialStatus, 'approved')
  assert.equal(trialSafety?.sourceId, 'src_pubmed-23348842')
  assert.equal(trialSafety?.targetName, 'adults with generalized anxiety disorder')
  assert.match(trialSafety?.uncertaintyNote || '', /does not establish long-term safety/i)
  assert.match(trialSafety?.uncertaintyNote || '', /pre-existing liver disease/i)

  assert.equal(longTermGap?.active, true)
  assert.equal(longTermGap?.editorialStatus, 'approved')
  assert.equal(longTermGap?.claimType, 'research_gap')
  assert.equal(longTermGap?.sourceId, 'src_cochrane-cd003383')
  assert.match(longTermGap?.findingTextNormalized || '', /long-term safety profile/i)
  assert.match(longTermGap?.uncertaintyNote || '', /does not establish or quantify hepatotoxicity/i)
})

test('CBD liver-enzyme trial remains scoped to the healthy-adult study population', () => {
  const entries = readJsonl('public/data/enrichment-normalized.jsonl')
  const cbdLiver = entries.find(row => row.enrichmentId === 'enr_cbd-adverse-effect-transaminase')

  assert.equal(cbdLiver?.sourceId, 'src_pubmed-40622698')
  assert.equal(cbdLiver?.targetName, 'healthy adults')
  assert.match(cbdLiver?.populationContext || '', /healthy adults/i)
  assert.match(cbdLiver?.usageContext || '', /5 mg\/kg\/day/i)
  assert.match(cbdLiver?.uncertaintyNote || '', /Do not transfer this risk estimate/i)
  assert.doesNotMatch(cbdLiver?.targetName || '', /hepatic risk/i)
})

test('registry validator rejects PMID and DOI aliases expressed only as canonical URLs', () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'enrichment-source-validator-'))
  const schemaDir = path.join(tempRoot, 'schemas')
  const registryPath = path.join(tempRoot, 'public', 'data', 'source-registry.json')

  try {
    fs.mkdirSync(schemaDir, { recursive: true })
    fs.mkdirSync(path.dirname(registryPath), { recursive: true })
    for (const schemaName of ['source-registry.schema.json', 'source-class-governance.json']) {
      fs.copyFileSync(path.join(ROOT, 'schemas', schemaName), path.join(schemaDir, schemaName))
    }

    const registry = readJson('public/data/source-registry.json')
    const original = registry.find(row => row.sourceId === 'src_pubmed-31517876')
    assert.ok(original)

    for (const [sourceId, canonicalUrl] of [
      ['src_alias-pubmed-url', `https://pubmed.ncbi.nlm.nih.gov/${original.pmid}/`],
      ['src_alias-doi-url', `https://doi.org/${original.doi}`],
      ['src_alias-dx-doi-url', `https://dx.doi.org/${original.doi}`],
    ]) {
      const alias = { ...original, sourceId, canonicalUrl }
      delete alias.pmid
      delete alias.doi
      fs.writeFileSync(registryPath, `${JSON.stringify([original, alias], null, 2)}\n`, 'utf8')

      const result = spawnSync(process.execPath, [VALIDATOR_SCRIPT], { cwd: tempRoot, encoding: 'utf8' })
      assert.notEqual(result.status, 0)
      assert.match(`${result.stderr}\n${result.stdout}`, /duplicates identity owned by src_pubmed-31517876/i)
    }
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true })
  }
})

test('bootstrap writes missing baseline sources, passes check mode, and rejects identity conflicts', () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'enrichment-source-bootstrap-'))
  const seedPath = path.join(tempRoot, 'data-sources', 'enrichment-source-registry-baseline.json')
  const registryPath = path.join(tempRoot, 'public', 'data', 'source-registry.json')

  try {
    fs.mkdirSync(path.dirname(seedPath), { recursive: true })
    fs.mkdirSync(path.dirname(registryPath), { recursive: true })

    const seed = [
      { sourceId: 'src_existing', pmid: '12345' },
      { sourceId: 'src_new', doi: '10.1000/example' },
    ]
    fs.writeFileSync(seedPath, `${JSON.stringify(seed, null, 2)}\n`, 'utf8')
    fs.writeFileSync(registryPath, `${JSON.stringify([{ sourceId: 'src_existing', pmid: '12345' }], null, 2)}\n`, 'utf8')

    let result = spawnSync(process.execPath, [BOOTSTRAP_SCRIPT], { cwd: tempRoot, encoding: 'utf8' })
    assert.equal(result.status, 0, result.stderr || result.stdout)

    const merged = JSON.parse(fs.readFileSync(registryPath, 'utf8'))
    assert.deepEqual(merged.map(row => row.sourceId), ['src_existing', 'src_new'])
    assert.equal(merged.find(row => row.sourceId === 'src_new')?.doi, '10.1000/example')

    result = spawnSync(process.execPath, [BOOTSTRAP_SCRIPT, '--check'], { cwd: tempRoot, encoding: 'utf8' })
    assert.equal(result.status, 0, result.stderr || result.stdout)
    assert.match(result.stdout, /CHECK PASS/)

    const conflicting = merged.map(row => row.sourceId === 'src_existing' ? { ...row, pmid: '54321' } : row)
    fs.writeFileSync(registryPath, `${JSON.stringify(conflicting, null, 2)}\n`, 'utf8')

    result = spawnSync(process.execPath, [BOOTSTRAP_SCRIPT, '--check'], { cwd: tempRoot, encoding: 'utf8' })
    assert.notEqual(result.status, 0)
    assert.match(`${result.stderr}\n${result.stdout}`, /Baseline source identity conflict/)

    fs.writeFileSync(registryPath, `${JSON.stringify(merged, null, 2)}\n`, 'utf8')
    for (const alias of [
      { sourceId: 'src_alias-pubmed-url', canonicalUrl: 'https://pubmed.ncbi.nlm.nih.gov/12345/' },
      { sourceId: 'src_alias-doi-url', canonicalUrl: 'https://doi.org/10.1000/example' },
      { sourceId: 'src_alias-dx-doi-url', canonicalUrl: 'https://dx.doi.org/10.1000/example' },
    ]) {
      const aliasedSeed = [...seed, alias]
      fs.writeFileSync(seedPath, `${JSON.stringify(aliasedSeed, null, 2)}\n`, 'utf8')

      result = spawnSync(process.execPath, [BOOTSTRAP_SCRIPT, '--check'], { cwd: tempRoot, encoding: 'utf8' })
      assert.notEqual(result.status, 0)
      assert.match(`${result.stderr}\n${result.stdout}`, /cross-ID source identity collision/i)
    }
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true })
  }
})
