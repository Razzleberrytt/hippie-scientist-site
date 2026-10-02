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

function classTokenCount(source, token, tag = '[A-Za-z][A-Za-z0-9.-]*') {
  const escapedToken = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const pattern = new RegExp(`<${tag}\\b[^>]*className=['"][^'"]*\\b${escapedToken}\\b[^'"]*['"]`, 'g')
  return (source.match(pattern) || []).length
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
const seeAlsoCluster = read('components/SeeAlsoCluster.tsx')
const packageJson = read('package.json')
const lighthouseWorkflow = read('.github/workflows/lighthouse.yml')

invariant('THS-001', 'homepage is routed through the focused V2 experience', () =>
  page.includes("import HomepageV2 from '@/components/homepage-v2'") && page.includes('return <HomepageV2 />'),
)
invariant('THS-001', 'homepage hero has a clear promise and only Search plus Explore as primary actions', () => {
  const searchActions = homepage.split("action='/search/'").length - 1
  const exploreActions = homepage.split("href='/explore/'").length - 1
  return homepage.includes('Start with the question. Open the evidence when you need it.') &&
    searchActions === 1 &&
    exploreActions === 1 &&
    homepage.includes("href='/library/'")
})
invariant('THS-001', 'homepage scientific search protects mobile ingredient terms from keyboard rewriting', () =>
  includesAll(homepage, [
    "type='search'",
    "autoCapitalize='none'",
    "autoCorrect='off'",
    'spellCheck={false}',
    "enterKeyHint='search'",
    "placeholder='Search herbs, compounds, or questions'",
  ]),
)

invariant('THS-002', 'primary navigation remains intentionally narrow', () =>
  includesAll(primaryNavigation, ["label: 'Goals'", "label: 'Guides'", "label: 'Ingredients'", "label: 'Safety'", "label: 'Research'"]) &&
  !primaryNavigation.includes("label: 'Home'") &&
  !primaryNavigation.includes("label: 'Compare',\n    href: '/guides/compare'") &&
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

invariant('THS-005A', 'mobile profile intro puts the decision layer before supporting art while desktop preserves the two-column first row', () => {
  const herbDecision = herbProfile.indexOf('<ProfileDecisionPanel')
  const herbImage = herbProfile.indexOf('<MonographHeroImage')
  const compoundDecision = compoundProfile.indexOf('<ProfileDecisionPanel')
  const compoundImage = compoundProfile.indexOf('<MonographHeroImage')
  const herbImageCount = herbProfile.split('<MonographHeroImage').length - 1
  const compoundImageCount = compoundProfile.split('<MonographHeroImage').length - 1

  return herbDecision >= 0 &&
    compoundDecision >= 0 &&
    herbDecision < herbImage &&
    compoundDecision < compoundImage &&
    herbImageCount === 1 &&
    compoundImageCount === 1 &&
    includesAll(herbProfile, ['lg:col-span-2 lg:row-start-2', 'lg:col-start-2 lg:row-start-1']) &&
    includesAll(compoundProfile, ['lg:col-span-2 lg:row-start-2', 'lg:col-start-2 lg:row-start-1'])
})

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

invariant('THS-011', 'related discovery is backed by runtime maps and respects answer-first navigation ownership', () =>
  includesAll(herbProfile, [
    'getRouteInternalLinkGroups',
    'getBatchedRuntimeRecords',
    'getProfileDecisionClaimedHrefs',
    'claimedHrefs={profileDecisionClaimedHrefs}',
    'continuationGroups={continuationGroups}',
  ]) &&
  includesAll(seeAlsoCluster, ['RelatedDiscoveryGroups', 'continuationGroups', 'dedupeContinuationGroups', 'claimedHrefs']) &&
  includesAll(compoundProfile, [
    'getRouteInternalLinkGroups',
    'getBatchedRuntimeRecords',
    'getProfileDecisionClaimedHrefs',
    'claimedHrefs={profileDecisionClaimedHrefs}',
    'continuationGroups={continuationGroups}',
  ]),
)

invariant('THS-012', 'profile next actions are decision-aware and monetization can be suppressed for risk', () =>
  includesAll(herbProfile, ['ProfileDecisionPanel', 'suppressAffiliate', 'isRestrictedRecord']) &&
  includesAll(compoundProfile, ['ProfileDecisionPanel', 'suppressAffiliate', 'isRestrictedRecord']),
)

invariant('THS-013', 'homepage uses one canonical Explore handoff without duplicate destination or methodology mini-hubs', () =>
  homepage.includes("href='/explore/'") &&
  !homepage.includes('<SiteDestinationGrid />') &&
  homepage.includes("href='/info/methodology/'") &&
  !homepage.includes('const comparisons') &&
  !homepage.includes('const principles') &&
  !homepage.includes('hs-comparison-index'),
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
