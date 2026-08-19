import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { sourceId } from '../ids.mjs'
import {
  buildAppliedPatchSourceRoleMap,
  mergeReviewedSourceRoleNote,
  rolesForAppliedOperation,
} from '../source-role-provenance.mjs'
import { applyReviewedSourceRoleOverlay } from '../../apply-reviewed-source-role-overlay.mjs'

const tempDirs = []

function tempDir(prefix) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix))
  tempDirs.push(dir)
  return dir
}

afterEach(() => {
  while (tempDirs.length) fs.rmSync(tempDirs.pop(), { recursive: true, force: true })
})

describe('reviewed source-role provenance', () => {
  it('classifies explicit safety operations and concrete studied dose text without inventing a claim', () => {
    expect(rolesForAppliedOperation({
      op: 'add_claim',
      field: 'safety',
      value: 'In a reviewed trial, 200 mg/day for four weeks produced no apparent adverse events.',
    })).toEqual(['dose', 'safety'])
  })

  it('classifies human context only when it is explicit in the reviewed operation', () => {
    expect(rolesForAppliedOperation({
      op: 'add_claim',
      field: 'effects',
      value: 'A randomized crossover study in healthy adults used 3 g before bedtime.',
    })).toEqual(['dose', 'human'])
  })

  it('derives roles only from patches that were actually applied', () => {
    const patchDir = tempDir('source-role-patches-')
    const source = {
      doi: '10.3390/nu11102362',
      url: 'https://doi.org/10.3390/nu11102362',
      title: 'Effects of L-Theanine Administration in Healthy Adults: A Randomized Controlled Trial',
      year: '2019',
    }
    const applied = {
      patch_id: 'reviewed-safety',
      operations: [{ op: 'add_claim', field: 'safety', value: '200 mg/day; short-term tolerability.' }],
      sources: [source],
      _apply_result: { status: 'applied' },
    }
    const rejected = {
      patch_id: 'not-applied-interaction',
      operations: [{ op: 'add_drug_interaction', value: 'Interaction claim.' }],
      sources: [{ doi: '10.1000/not-applied', title: 'Not applied' }],
      _apply_result: { status: 'rejected' },
    }
    fs.writeFileSync(path.join(patchDir, 'applied.json'), JSON.stringify(applied))
    fs.writeFileSync(path.join(patchDir, 'rejected.json'), JSON.stringify(rejected))

    const roleMap = buildAppliedPatchSourceRoleMap({ patchDir })
    expect(roleMap.get(sourceId(source))).toEqual(['dose', 'safety'])
    expect(roleMap.size).toBe(1)
  })

  it('never launders an explicitly in-vitro source into a human source', () => {
    const patchDir = tempDir('source-role-nonhuman-')
    const source = {
      doi: '10.1000/in-vitro',
      title: 'In Vitro Evaluation of Magnesium Bioavailability',
      year: '2025',
    }
    fs.writeFileSync(path.join(patchDir, 'applied.json'), JSON.stringify({
      patch_id: 'reviewed-mechanistic',
      operations: [{
        op: 'add_claim',
        field: 'effects',
        value: 'The reviewed discussion contrasts this source with randomized trials in adults, but this source itself is in vitro.',
      }],
      sources: [source],
      _apply_result: { status: 'applied' },
    }))

    const roleMap = buildAppliedPatchSourceRoleMap({ patchDir })
    expect(roleMap.get(sourceId(source))).toBeUndefined()
  })

  it('merges deterministic reviewed-role metadata idempotently', () => {
    const once = mergeReviewedSourceRoleNote('existing editorial note', ['safety', 'dose', 'safety'])
    expect(once).toBe('existing editorial note; reviewed source role: dose, safety')
    expect(mergeReviewedSourceRoleNote(once, ['dose', 'safety'])).toBe(once)
  })
})

describe('runtime reviewed source-role overlay', () => {
  it('annotates approved sources but never upgrades pending sources', () => {
    const root = tempDir('source-role-runtime-')
    const detailDir = path.join(root, 'compounds-detail')
    fs.mkdirSync(detailDir, { recursive: true })
    const filePath = path.join(detailDir, 'l-theanine.json')
    fs.writeFileSync(filePath, `${JSON.stringify({
      slug: 'l-theanine',
      sources: [
        { id: 'src_approved', reviewStatus: 'approved', note: '' },
        { id: 'src_pending', reviewStatus: 'pending', note: '' },
      ],
    }, null, 2)}\n`)

    const report = applyReviewedSourceRoleOverlay({
      dataDir: root,
      roleMap: new Map([
        ['src_approved', ['dose', 'human', 'safety']],
        ['src_pending', ['human', 'safety']],
      ]),
    })
    const updated = JSON.parse(fs.readFileSync(filePath, 'utf8'))

    expect(report).toMatchObject({ updatedProfiles: 1, updatedSources: 1 })
    expect(updated.sources[0].note).toBe('reviewed source role: dose, human, safety')
    expect(updated.sources[1].note).toBe('')
  })
})
