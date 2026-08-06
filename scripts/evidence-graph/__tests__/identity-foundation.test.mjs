import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { buildStableEntityId, normalizeAliases, normalizeIdentityText, requiresFormReview } from '../../../config/evidence-graph/identity-rules.mjs'
import { applyIdentityResolutions } from '../apply-identity-resolutions.mjs'

test('identity normalization produces stable graph IDs', () => {
  assert.equal(normalizeIdentityText('Lion’s Mane & Extract'), 'lion-s-mane-and-extract')
  assert.equal(buildStableEntityId('compound', 'Berberine HCl'), 'compound:berberine-hcl')
  assert.deepEqual(normalizeAliases(['CoQ10|Coenzyme Q10', 'coq10']), ['CoQ10', 'Coenzyme Q10'])
  assert.equal(requiresFormReview('magnesium glycinate extract'), true)
})

test('approved resolutions merge aliases and preserve child forms', () => {
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'identity-foundation-'))
  const dir = path.join(repoRoot, 'data/graph/identity')
  fs.mkdirSync(dir, { recursive: true })
  const registry = [
    { id: 'compound:coenzyme-q10', canonicalSlug: 'coenzyme-q10', canonicalName: 'Coenzyme Q10', aliases: [], status: 'duplicate-candidate', parentEntityId: null, reviewFlags: ['identity-collision'] },
    { id: 'compound:coq10', canonicalSlug: 'coq10', canonicalName: 'CoQ10', aliases: [], status: 'duplicate-candidate', parentEntityId: null, reviewFlags: ['identity-collision'] },
    { id: 'compound:berberine', canonicalSlug: 'berberine', canonicalName: 'Berberine', aliases: [], status: 'duplicate-candidate', parentEntityId: null, reviewFlags: ['identity-collision'] },
    { id: 'compound:berberine-hcl', canonicalSlug: 'berberine-hcl', canonicalName: 'Berberine', aliases: [], status: 'duplicate-candidate', parentEntityId: null, reviewFlags: ['identity-collision'] },
  ]
  const resolutions = {
    schemaVersion: '0.2.0',
    resolutions: [
      { action: 'merge-alias', canonicalRecordId: 'compound:coenzyme-q10', retiredRecordIds: ['compound:coq10'], status: 'approved' },
      { action: 'establish-form', canonicalRecordId: 'compound:berberine', formRecordIds: ['compound:berberine-hcl'], formCanonicalNames: { 'compound:berberine-hcl': 'Berberine hydrochloride' }, formAliases: { 'compound:berberine-hcl': ['Berberine HCl'] }, status: 'approved' },
    ],
  }
  fs.writeFileSync(path.join(dir, 'substance-registry.json'), JSON.stringify(registry))
  fs.writeFileSync(path.join(dir, 'identity-resolutions.json'), JSON.stringify(resolutions))

  const { registry: resolved, report } = applyIdentityResolutions({ repoRoot })
  const coq10 = resolved.find((record) => record.id === 'compound:coq10')
  const canonical = resolved.find((record) => record.id === 'compound:coenzyme-q10')
  const form = resolved.find((record) => record.id === 'compound:berberine-hcl')

  assert.equal(report.summary.appliedResolutions, 2)
  assert.equal(coq10.status, 'deprecated')
  assert.ok(canonical.aliases.includes('CoQ10'))
  assert.equal(form.parentEntityId, 'compound:berberine')
  assert.equal(form.canonicalName, 'Berberine hydrochloride')
  assert.ok(form.aliases.includes('Berberine HCl'))
})
