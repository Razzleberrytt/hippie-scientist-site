#!/usr/bin/env node
// validate:generated-freshness — fail if the canonical site export in
// data/generated/site/ is stale relative to the canonical JSONL. Regenerates
// the export in-memory and compares content hashes; does not write.
//
// Because the export is deterministic (sorted, no timestamps), a matching hash
// proves the committed/generated files reflect current canonical data.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { exportSiteRecords } from '../data/canonical/site-export.mjs'
import { contentHash } from '../data/canonical/ids.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const generatedSiteDir = path.resolve(here, '../../data/generated/site')

function main() {
  const { herbs, compounds } = exportSiteRecords()
  const expected = {
    herbs: contentHash(herbs),
    compounds: contentHash(compounds),
  }

  const herbsPath = path.join(generatedSiteDir, 'herbs.json')
  const compoundsPath = path.join(generatedSiteDir, 'compounds.json')

  if (!fs.existsSync(herbsPath) || !fs.existsSync(compoundsPath)) {
    console.error('✗ generated site export missing — run `npm run data:export`')
    process.exit(1)
  }

  const onDisk = {
    herbs: contentHash(JSON.parse(fs.readFileSync(herbsPath, 'utf8'))),
    compounds: contentHash(JSON.parse(fs.readFileSync(compoundsPath, 'utf8'))),
  }

  const stale = []
  if (onDisk.herbs !== expected.herbs) stale.push('herbs.json')
  if (onDisk.compounds !== expected.compounds) stale.push('compounds.json')

  if (stale.length) {
    console.error(`✗ generated site export is STALE: ${stale.join(', ')} — run \`npm run data:export\` and commit`)
    process.exit(1)
  }
  console.log('✓ generated site export is fresh')
}

main()
