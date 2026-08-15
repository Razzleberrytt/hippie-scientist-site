#!/usr/bin/env node
import fs from 'node:fs/promises'

const files = {
  layout: 'app/layout.tsx',
  css: 'styles/accessibility-wcag-22.css',
  navigation: 'components/Navigation.tsx',
  evidenceLookup: 'app/evidence/evidence-checker/EvidenceLookupClient.tsx',
  atlas: 'src/components/atlas/BotanicalActivityAtlasClient.tsx',
}

const source = Object.fromEntries(
  await Promise.all(Object.entries(files).map(async ([key, file]) => [key, await fs.readFile(file, 'utf8')])),
)

const contracts = [
  ['skip navigation link', source.layout.includes("href='#main-content'") && source.layout.includes("className='skip-link'")],
  ['focusable main landmark target', source.layout.includes("id='main-content'") && source.layout.includes('tabIndex={-1}')],
  ['primary navigation landmark', /aria-label=['"]Primary['"]/.test(source.navigation)],
  ['mobile navigation landmark', /aria-label=['"]Mobile primary links['"]/.test(source.navigation)],
  ['keyboard focus-visible rule', /:focus-visible/.test(source.css)],
  ['44px minimum interactive target', /--a11y-target-size:\s*44px/.test(source.css)],
  ['forced-colors fallback', /@media\s*\(forced-colors:\s*active\)/.test(source.css)],
  ['reduced-motion fallback', /@media\s*\(prefers-reduced-motion:\s*reduce\)/.test(source.css)],
  ['accessible table region focus treatment', source.css.includes('.accessible-table-region:focus-visible')],
  ['table caption treatment', /table caption/.test(source.css)],
  ['evidence search input label', source.evidenceLookup.includes('htmlFor="evidence-lookup-search"')],
  ['evidence tier filter group label', source.evidenceLookup.includes('aria-label="Filter by evidence tier"')],
  ['atlas filter labels', source.atlas.includes("const labelClass") && source.atlas.includes('<label>')],
]

const failures = contracts.filter(([, passes]) => !passes).map(([name]) => name)

if (failures.length) {
  console.error(`Accessibility baseline failed (${failures.length}):`)
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log(`Accessibility baseline: ${contracts.length}/${contracts.length} contracts pass.`)
