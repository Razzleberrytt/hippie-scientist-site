import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { reconcileDeliberateGovernanceHolds } from './governance-hold-policy.mjs'

const tempDirs = []

async function writeJson(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, 'utf8'))
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => fs.rm(dir, { recursive: true, force: true })))
})

describe('deliberate governance hold runtime-map reconciliation', () => {
  it('removes held profiles as both recommendation sources and targets after maps were already built', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'ths-governance-hold-'))
    tempDirs.push(root)

    await writeJson(path.join(root, 'herbs.json'), [
      { slug: 'ashwagandha', profile_status: 'complete', governance: { recommendationAllowed: true } },
      { slug: 'black-cohosh', profile_status: 'research_only', governance: { recommendationAllowed: true } },
    ])
    await writeJson(path.join(root, 'compounds.json'), [
      { slug: 'magnesium', profile_status: 'complete', governance: { recommendationAllowed: true } },
    ])
    await writeJson(path.join(root, 'herbs-detail/black-cohosh.json'), {
      slug: 'black-cohosh',
      profile_status: 'research_only',
      governance: { recommendationAllowed: true },
    })

    await writeJson(path.join(root, 'runtime-maps/related-profiles.json'), {
      ashwagandha: [{ slug: 'black-cohosh', score: 9 }, { slug: 'magnesium', score: 7 }],
      'black-cohosh': [{ slug: 'ashwagandha', score: 9 }],
    })
    await writeJson(path.join(root, 'runtime-maps/comparison-recommendations.json'), {
      ashwagandha: [
        { sourceSlug: 'ashwagandha', targetSlug: 'black-cohosh', href: '/guides/compare/ashwagandha-vs-black-cohosh' },
        { sourceSlug: 'ashwagandha', targetSlug: 'magnesium', href: '/guides/compare/ashwagandha-vs-magnesium' },
      ],
      'black-cohosh': [
        { sourceSlug: 'black-cohosh', targetSlug: 'ashwagandha', href: '/guides/compare/black-cohosh-vs-ashwagandha' },
      ],
    })
    await writeJson(path.join(root, 'runtime-maps/condition-to-herbs.json'), {
      anxiety: [
        { slug: 'black-cohosh', score: 8 },
        { slug: 'ashwagandha', score: 7 },
      ],
    })

    const report = await reconcileDeliberateGovernanceHolds({ dataDir: root })

    expect(report.herbs).toEqual(['black-cohosh'])
    expect(report.runtimeMaps).toEqual([
      'comparison-recommendations.json',
      'condition-to-herbs.json',
      'related-profiles.json',
    ])

    const related = await readJson(path.join(root, 'runtime-maps/related-profiles.json'))
    expect(related['black-cohosh']).toBeUndefined()
    expect(related.ashwagandha).toEqual([{ slug: 'magnesium', score: 7 }])

    const comparisons = await readJson(path.join(root, 'runtime-maps/comparison-recommendations.json'))
    expect(comparisons['black-cohosh']).toBeUndefined()
    expect(comparisons.ashwagandha).toEqual([
      { sourceSlug: 'ashwagandha', targetSlug: 'magnesium', href: '/guides/compare/ashwagandha-vs-magnesium' },
    ])

    const conditions = await readJson(path.join(root, 'runtime-maps/condition-to-herbs.json'))
    expect(conditions.anxiety).toEqual([{ slug: 'ashwagandha', score: 7 }])

    const held = (await readJson(path.join(root, 'herbs.json'))).find((record) => record.slug === 'black-cohosh')
    expect(held.governance.recommendationAllowed).toBe(false)
    expect(held.robots).toBe('noindex,follow')
  })
})
