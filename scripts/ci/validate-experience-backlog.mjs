import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()

function read(relativePath) {
  const absolutePath = path.join(root, relativePath)
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Missing required file: ${relativePath}`)
  }
  return fs.readFileSync(absolutePath, 'utf8')
}

function invariant(id, description, check) {
  const passed = Boolean(check())
  if (!passed) failures.push(`${id}: ${description}`)
  results.push({ id, description, passed })
}

function includesAll(source, values) {
  return values.every((value) => source.includes(value))
}

const failures = []
const results = []

const page = read('app/page.tsx')
const homepage = read('components/homepage-v2.tsx')
const navigation = read('components/Navigation.tsx')
const primaryNavigation = read('lib/primary-navigation.ts')
const layout = read('app/layout.tsx')
const globals = read('app/globals.css')
const homepageFinal = read('styles/homepage-premium-final.css')
const herbProfile = read('app/herbs/[slug]/page.tsx')
const compoundProfile = read('app/compounds/[slug]/page.tsx')
const packageJson = read('package.json')
const lighthouseWorkflow = read('.github/workflows/lighthouse.yml')

invariant('THS-001', 'homepage is routed through the focused V2 experience', () =>
  page.includes("import HomepageV2 from '@/components/homepage-v2'") && page.includes('return <HomepageV2 />'),
)
invariant('THS-001', 'homepage hero has a clear promise and no more than two primary hero actions', () => {
  const searchActions = homepage.match(/<form className='hs-home-search'/g) || []
  const browseActions = homepage.match(/className='hs-home-browse-link'/g) || []
  return homepage.includes('Better answers start with better') &&
    searchActions.length === 1 &&
    browseActions.length === 1
})

invariant('THS-002', 'primary navigation remains intentionally narrow', () =>
  includesAll(primaryNavigation, ["label: 'Goals'", "label: 'Ingredients'", "label: 'Compare'", "label: 'Safety'", "label: 'Research'"]) &&
  !primaryNavigation.includes("label: 'Home'") &&
  navigation.includes('primaryNavigation'),
)

invariant('THS-003', 'global typography uses the Inter/Fraunces system', () =>
  includesAll(layout, ["@fontsource-variable/inter", "@fontsource-variable/fraunces/wght.css"]) &&
  includesAll(globals, ['--font-sans:', '--font-body:', '--font-display:', 'font-family: var(--font-inter)']),
)

invariant('THS-004', 'homepage spacing and material hierarchy are governed by the route-scoped editorial layer', () =>
  includesAll(page, ["@/styles/homepage-structure.css", "@/styles/homepage-premium-final.css"]) &&
  includesAll(homepageFinal, ['.hs-home {', '.hs-index-hero', '.hs-decision-section', '.hs-method-section', '@media (max-width: 767px)']),
)

invariant('THS-005', 'herb and compound profiles share core decision/evidence primitives', () =>
  includesAll(herbProfile, ['ProfileDecisionPanel', 'EvidenceScoreBadge', 'MonographHeroImage']) &&
  includesAll(compoundProfile, ['ProfileDecisionPanel', 'EvidenceScoreBadge', 'MonographHeroImage']),
)

invariant('THS-006', 'both profile families expose one canonical scanning/jump-navigation surface with section anchors', () =>
  includesAll(herbProfile, ['ProfileTOC', 'id="evidence"', 'id="safety"']) &&
  includesAll(compoundProfile, ['ProfileTOC', 'id="evidence"', 'id="safety"']) &&
  !herbProfile.includes('Jump to profile sections') &&
  !compoundProfile.includes('Jump to profile sections'),
)

invariant('THS-007', 'evidence status is visible near the profile title on both profile families', () =>
  herbProfile.indexOf('<EvidenceScoreBadge') > herbProfile.indexOf('<h1') &&
  compoundProfile.indexOf('<EvidenceScoreBadge') > compoundProfile.indexOf('<h1') &&
  includesAll(herbProfile, ['EvidenceGradeExplainer', 'EvidenceGradeRationale']) &&
  includesAll(compoundProfile, ['EvidenceGradeExplainer', 'EvidenceGradeRationale']),
)

invariant('THS-008', 'safety is a first-class profile section and missing context is not represented as a safety endorsement', () =>
  includesAll(herbProfile, ['id="safety"', 'safetySummary', 'avoidIf']) &&
  includesAll(compoundProfile, ['id="safety"', 'safetySummary', 'avoidIf']) &&
  !compoundProfile.includes("return 'Safe'") &&
  !herbProfile.includes("return 'Safe'"),
)

invariant('THS-009', 'mobile navigation keeps focus management, touch targets, and dynamic viewport handling', () =>
  includesAll(navigation, ["event.key === 'Escape'", "event.key !== 'Tab'", 'min-h-11', 'min-w-11', "height: '100dvh'", "aria-modal='true'"]),
)

invariant('THS-010', 'profiles begin with a short plain-English summary rather than a raw data dump', () =>
  includesAll(herbProfile, ['getPlainEnglishSummary', 'briefSummary']) &&
  includesAll(compoundProfile, ['quickSummary', 'cleanSummary']),
)

invariant('THS-011', 'related discovery is backed by runtime relationship maps rather than only hardcoded link dumps', () =>
  includesAll(herbProfile, ['getRouteInternalLinkGroups', 'getBatchedRuntimeRecords', 'RelatedDiscoveryGroups']) &&
  includesAll(compoundProfile, ['getRouteInternalLinkGroups', 'getBatchedRuntimeRecords', 'RelatedDiscoveryGroups']),
)

invariant('THS-012', 'profile next actions are decision-aware and monetization can be suppressed for risk', () =>
  includesAll(herbProfile, ['ProfileDecisionPanel', 'suppressAffiliate', 'isRestrictedRecord']) &&
  includesAll(compoundProfile, ['ProfileDecisionPanel', 'suppressAffiliate', 'isRestrictedRecord']),
)

invariant('THS-013', 'homepage navigation and comparison content use the restrained shared editorial material system', () =>
  includesAll(homepageFinal, [
    '--home-panel:',
    '.hs-goal-nav {',
    '.hs-comparison-list {',
    '.hs-method-section {',
    'var(--home-line-strong)',
  ]) &&
  !homepage.includes('hs-specimen') &&
  !homepage.includes('hs-vs') &&
  !homepage.includes('hs-article'),
)

invariant('THS-014', 'accessibility and theme contrast are explicit repository gates', () =>
  layout.includes("@/styles/accessibility-wcag-22.css") &&
  packageJson.includes('validate:theme-contrast') &&
  packageJson.includes('test:a11y') &&
  navigation.includes('focus-visible:ring-2'),
)

invariant('THS-015', 'performance has a Lighthouse gate plus bundle/runtime budget tooling', () =>
  fs.existsSync(path.join(root, '.lighthouserc.json')) &&
  includesAll(lighthouseWorkflow, ['lighthouse', 'npm']) &&
  packageJson.includes('analyze:bundle') &&
  packageJson.includes('validate:runtime-payload-budgets'),
)

console.log('\nTHS experience backlog acceptance contract')
console.log('='.repeat(45))
for (const result of results) {
  console.log(`${result.passed ? 'PASS' : 'FAIL'} ${result.id} — ${result.description}`)
}

if (failures.length) {
  console.error(`\n${failures.length} acceptance invariant(s) failed:`)
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log(`\n${results.length} acceptance invariants passed.`)
