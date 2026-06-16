/**
 * generate-herb-redirects.mjs
 *
 * Reads herbs.json and a canonical slug mapping to ensure that every
 * deprecated / alias herb slug has a 301 redirect entry in public/_redirects.
 *
 * Run: node scripts/generate-herb-redirects.mjs
 */

import fs from 'fs'
import path from 'path'

// ---------------------------------------------------------------------------
// Canonical mapping: deprecated/alias slug → canonical URL slug
//
// Sources:
//  • DEPRECATED_HERB_CANONICALS from app/herbs/[slug]/page.tsx
//  • HERB_CANONICAL_SOURCE_ALIASES from app/herbs/[slug]/page.tsx (aliases
//    that resolve via data source but should also have CDN-level redirects)
//  • Additional pairs identified during the June 2026 redirect audit
// ---------------------------------------------------------------------------
const CANONICAL_MAP = {
  // Latin-name → common-name (DEPRECATED_HERB_CANONICALS)
  'allium-sativum': 'garlic',
  'valeriana-officinalis': 'valerian',
  'hericium-erinaceus': 'lions-mane',
  'passiflora-incarnata': 'passionflower',
  'piper-methysticum': 'kava',
  'ganoderma-lucidum': 'reishi',

  // Botanical-compound slug → common slug (HERB_CANONICAL_SOURCE_ALIASES)
  'ashwagandha-withania-somnifera': 'ashwagandha',

  // Additional Latin → common pairs from audit
  'hypericum-perforatum': 'st-johns-wort',
  'silybum-marianum': 'milk-thistle',

  // Duplicate / thin profiles consolidated to a single canonical (audit dedup)
  'berberis-vulgaris': 'berberis',
  'berberis-aristata': 'berberis',
  'coptis-chinensis': 'coptis',
  'boswellia-carterii': 'boswellia-serrata',
  'morus-alba': 'mulberry-leaf',
  phellodendron: 'phellodendron-amurense',
  'astragalus-membranaceus': 'astragalus',
  'atractylodes-macrocephala': 'atractylodes',
  'angelica-sinensis': 'dong-quai',
  'angelica-root': 'angelica-archangelica',
}

const REDIRECTS_PATH = path.resolve('public/_redirects')
const HERBS_JSON_PATH = path.resolve('public/data/herbs.json')

function loadExistingSources(content) {
  const sources = new Set()
  const rules = new Set()
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const parts = line.split(/\s+/)
    if (parts.length >= 2) {
      const from = parts[0].toLowerCase()
      const to = parts[1].toLowerCase()
      sources.add(from)
      rules.add(`${from} ${to}`)
    }
  }
  return { sources, rules }
}

function detectLoops(content) {
  const forwardMap = new Map()
  const loops = []

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const parts = line.split(/\s+/)
    if (parts.length < 2) continue
    const from = parts[0].toLowerCase()
    const to = parts[1].toLowerCase()
    forwardMap.set(from, to)
  }

  for (const [from, to] of forwardMap) {
    if (forwardMap.get(to) === from) {
      loops.push([from, to])
    }
  }

  return loops
}

function runGenerateHerbRedirects() {
  const herbs = JSON.parse(fs.readFileSync(HERBS_JSON_PATH, 'utf8'))
  const existingContent = fs.existsSync(REDIRECTS_PATH)
    ? fs.readFileSync(REDIRECTS_PATH, 'utf8')
    : ''

  const { sources, rules } = loadExistingSources(existingContent)

  // Warn about any redirect loops already present
  const loops = detectLoops(existingContent)
  if (loops.length > 0) {
    console.warn('\n⚠  Redirect loops detected in _redirects:')
    loops.forEach(([a, b]) => console.warn(`   ${a} ↔ ${b}`))
    console.warn('')
  }

  const herbSlugs = new Set(herbs.map((h) => h.slug))

  const rulesToAdd = []
  let addedCount = 0
  let alreadyExistedCount = 0
  let skippedCount = 0
  const warnings = []

  for (const [fromSlug, toSlug] of Object.entries(CANONICAL_MAP)) {
    // Verify canonical target is in herbs.json (informational only — alias targets may not be)
    if (!herbSlugs.has(toSlug)) {
      warnings.push(
        `  Note: canonical target "${toSlug}" is not a direct entry in herbs.json ` +
        `(may be served via HERB_CANONICAL_SOURCE_ALIASES in page.tsx)`,
      )
    }

    const variants = [
      { from: `/herbs/${fromSlug}`, to: `/herbs/${toSlug}` },
      { from: `/herbs/${fromSlug}/`, to: `/herbs/${toSlug}/` },
    ]

    for (const { from, to } of variants) {
      const fromKey = from.toLowerCase()
      const toKey = to.toLowerCase()
      const ruleKey = `${fromKey} ${toKey}`

      if (rules.has(ruleKey)) {
        alreadyExistedCount++
        continue
      }

      if (sources.has(fromKey)) {
        // Source already has a redirect — could be wrong direction
        skippedCount++
        console.warn(
          `  Skipped: "${from}" already redirects to a different target. ` +
          `Manual review needed (expected target: "${to}").`,
        )
        continue
      }

      rulesToAdd.push(`${from} ${to} 301`)
      addedCount++
      sources.add(fromKey)
      rules.add(ruleKey)
    }
  }

  if (warnings.length > 0) {
    console.warn('\nInformational notes:')
    warnings.forEach((w) => console.warn(w))
    console.warn('')
  }

  if (rulesToAdd.length > 0) {
    let newContent = existingContent
    if (newContent.length > 0 && !newContent.endsWith('\n')) {
      newContent += '\n'
    }
    newContent += '\n# HERB CANONICAL REDIRECTS (generate-herb-redirects.mjs)\n'
    newContent += rulesToAdd.join('\n') + '\n'
    fs.writeFileSync(REDIRECTS_PATH, newContent)
    console.log(`\n✓ Updated "${REDIRECTS_PATH}"`)
  } else {
    console.log(`\n✓ No new redirects needed — "${REDIRECTS_PATH}" is up to date.`)
  }

  console.log('\n--- Herb Redirect Generator Summary ---')
  console.log(`  Added:           ${addedCount} redirect rules`)
  console.log(`  Already existed: ${alreadyExistedCount} rules`)
  console.log(`  Skipped:         ${skippedCount} source collisions`)
  console.log('---------------------------------------\n')
}

runGenerateHerbRedirects()
