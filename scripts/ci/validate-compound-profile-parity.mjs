import fs from 'node:fs'
import path from 'node:path'

const source = fs.readFileSync(path.join(process.cwd(), 'app/compounds/[slug]/page.tsx'), 'utf8')
const failures = []

function expect(label, condition) {
  if (!condition) failures.push(label)
  console.log(`${condition ? 'PASS' : 'FAIL'} — ${label}`)
}

const heroStart = source.indexOf('id="overview"')
const decisionStart = source.indexOf('<ProfileDecisionPanel')
const safetySummary = source.indexOf('firstSentences(safetySummary, 1)')
const quickStats = source.indexOf('profile-quick-stats')

expect('compound hero exposes an overview anchor', heroStart !== -1)
expect('evidence jump points to the rendered evidence section', source.includes("{ label: 'Evidence', href: '#evidence' }") && !source.includes("href: '#evidence-summary'"))
expect('safety summary is visible before the decision panel', safetySummary > heroStart && safetySummary < decisionStart)
expect('quick facts are integrated into the hero', quickStats > heroStart && quickStats < decisionStart)
expect('standalone duplicate quick-stats section is removed', !source.includes('id="quick-stats"'))
expect('hero facts use semantic surface variables', source.includes('bg-[var(--surface-card)]') && source.includes('bg-[var(--surface-warning)]'))
expect('safety details have a direct jump link', source.includes('href="#safety"'))
expect('safety section is sticky-header safe', source.includes('id="safety" className="scroll-mt-24'))
expect('mechanism and compare anchors are sticky-header safe', source.includes('id="mechanisms" className="card-premium scroll-mt-24') && source.includes('id="compare" className="card-premium scroll-mt-24'))
expect('desktop TOC starts with Overview and includes core decision sections', source.includes("{ id: 'overview', label: 'Overview' }") && source.includes("{ id: 'evidence', label: 'Evidence' }") && source.includes("{ id: 'compare', label: 'Compare' }"))
expect('TOC no longer advertises a nonexistent FAQ anchor', !source.includes("{ id: 'faq',       label: 'FAQ'"))

if (failures.length) {
  console.error(`\n${failures.length} compound profile parity invariant(s) failed:`)
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log('\nCompound profile parity contract passed.')
