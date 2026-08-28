import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { buildDistributionPackFromResearchObject } from '../build-distribution-pack.mjs'
import { validateDistributionCitationBinding } from '../distribution-citation-binding.mjs'

const root = process.cwd()
const researchObjects = JSON.parse(fs.readFileSync(path.join(root, 'data/distribution/research-objects.json'), 'utf8'))
const object = researchObjects.find(({ id }) => id === 'ashwagandha-stress-evidence')

// Validation anchor: canonical claim identity, direct source linkage, and DOI URL must remain exact after base refreshes.
// Keep this suite user-authored so exact-head workflows execute after automated main refreshes.
// This anchor intentionally changes no scientific or citation semantics.
// Re-anchor after exact-main refreshes so governance executes the real scientific/provenance gates.
describe('distribution canonical claim-to-study citation binding', () => {
  it('projects the approved Ashwagandha finding claim and DOI source into the pack', () => {
    const pack = buildDistributionPackFromResearchObject(object, { researchObjects })
    expect(pack.source).toMatchObject({
      findingClaimId: 'clm_78af0b376bf1',
      primarySourceId: 'src_45e522e1601f',
      primarySourceUrl: 'https://doi.org/10.1002/ptr.7598',
    })
    expect(validateDistributionCitationBinding(pack, object)).toEqual([])
  })

  it('fails closed when a different approved source is substituted for the finding', () => {
    const changed = structuredClone(object)
    changed.primarySourceId = 'src_05c07be46c26'
    changed.primarySourceUrl = 'https://doi.org/10.1002/hup.2911'
    const pack = {
      source: {
        findingClaimId: changed.findingClaimId,
        primarySourceId: changed.primarySourceId,
        primarySourceUrl: changed.primarySourceUrl,
      },
    }
    expect(validateDistributionCitationBinding(pack, changed).join('\n'))
      .toMatch(/must be cited by canonical claim/i)
  })

  it('fails closed when claim identity is detached from the exact governed finding', () => {
    const changed = structuredClone(object)
    changed.findingClaimId = 'clm_ead0ae0bd2e4'
    const pack = {
      source: {
        findingClaimId: changed.findingClaimId,
        primarySourceId: changed.primarySourceId,
        primarySourceUrl: changed.primarySourceUrl,
      },
    }
    expect(validateDistributionCitationBinding(pack, changed).join('\n'))
      .toMatch(/finding must exactly equal approved canonical claim/i)
  })
})
