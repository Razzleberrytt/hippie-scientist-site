import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { describe, expect, it } from 'vitest'
import { applyEnrichmentRuntimeOverrides } from '../../scripts/data/apply-enrichment-runtime-overrides.mjs'

describe('methyl-eugenol canonical runtime safety', () => {
  it('renders the governed IARC hazard boundary without a consumer dose', async () => {
    const originalRoot = process.cwd()
    const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'methyl-eugenol-runtime-'))
    const dataDir = path.join(tempRoot, 'public', 'data')
    const detailDir = path.join(dataDir, 'compounds-detail')
    const configPath = path.join(tempRoot, 'methyl-eugenol-runtime-override.json')

    await fs.mkdir(detailDir, { recursive: true })
    await Promise.all([
      fs.copyFile(path.join(originalRoot, 'public/data/compounds.json'), path.join(dataDir, 'compounds.json')),
      fs.copyFile(path.join(originalRoot, 'public/data/source-registry.json'), path.join(dataDir, 'source-registry.json')),
      fs.copyFile(
        path.join(originalRoot, 'public/data/compounds-detail/methyl-eugenol.json'),
        path.join(detailDir, 'methyl-eugenol.json'),
      ),
    ])

    const config = JSON.parse(await fs.readFile(
      path.join(originalRoot, 'data/canonical/enrichment-runtime-overrides.json'),
      'utf8',
    ))
    const methylEugenol = config.entries.find((entry: { entitySlug?: string }) => entry.entitySlug === 'methyl-eugenol')
    await fs.writeFile(configPath, `${JSON.stringify({ schemaVersion: 1, entries: [methylEugenol] }, null, 2)}\n`)
    await applyEnrichmentRuntimeOverrides({ dataDir, configPath })

    process.chdir(tempRoot)
    const runtimeModuleUrl = `${pathToFileURL(path.join(originalRoot, 'lib/runtime-data.ts')).href}?methyl=${Date.now()}`
    const { getCompoundBySlug } = await import(/* @vite-ignore */ runtimeModuleUrl)
    const record = await getCompoundBySlug('methyl-eugenol')
    process.chdir(originalRoot)
    await fs.rm(tempRoot, { recursive: true, force: true })

    expect(record).not.toBeNull()
    expect(record?.safety).toMatch(/probably carcinogenic to humans \(Group 2A\)/i)
    expect(record?.safetyNotes).toBe(record?.safety)
    expect(record?.safety).toMatch(/human cancer evidence is inadequate/i)
    expect(record?.safety).toMatch(/not interchangeable/i)
    expect(record?.dosage).toBe('')
    expect(record?.typical_dosage).toBe('')
    expect(record?.governance).toMatchObject({
      medicalRisk: 'high',
      monetizationAllowed: false,
      recommendationAllowed: false,
      requiresHumanReview: true,
    })
    expect(record?.evidence).toMatchObject({
      sourceCount: 1,
      sourceIds: ['src_iarc-v134-methyleugenol-2024'],
    })
  })
})
