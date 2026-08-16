export interface PrimaryNavigationItem {
  label: string
  href: string
  description?: string
  children?: PrimaryNavigationItem[]
  section?: string
  activePrefixes?: string[]
}

export const primaryNavigation: PrimaryNavigationItem[] = [
  {
    label: 'Goals',
    href: '/goals',
    description: 'Start with what you are researching, then follow the evidence to relevant options',
    activePrefixes: ['/goals', '/guides/mental-health', '/guides/adhd', '/guides/sleep', '/guides/stress', '/guides/anxiety', '/guides/focus'],
    children: [
      { section: 'Start here', label: 'Goal finder', href: '/goals', description: 'Choose the outcome or question you are actually researching' },
      { section: 'Health goals', label: 'Sleep', href: '/guides/sleep', description: 'Sleep aids, timing, alternatives, and sleep-support evidence' },
      { section: 'Health goals', label: 'Stress', href: '/guides/stress', description: 'Acute tension, chronic overload, burnout, and stress-support evidence' },
      { section: 'Health goals', label: 'Anxiety', href: '/guides/anxiety', description: 'Calming supports, overthinking, tension, and anxiety-focused evidence' },
      { section: 'Health goals', label: 'Focus & Cognition', href: '/guides/focus', description: 'Focus support, nootropics, and cognitive-performance evidence' },
      { section: 'Health goals', label: 'Mental Health', href: '/guides/mental-health', description: 'Conditions, treatment evidence, safety, and stigma-aware explainers' },
      { section: 'Health goals', label: 'ADHD', href: '/guides/adhd', description: 'Attention, executive function, nutrients, and treatment context' },
    ],
  },
  {
    label: 'Ingredients',
    href: '/herbs',
    description: 'Look up herbs, nutrients, active compounds, extracts, evidence, and safety',
    activePrefixes: ['/herbs', '/compounds'],
    children: [
      { label: 'Herb database', href: '/herbs', description: 'Canonical herb profiles with evidence, dosing context, and safety summaries' },
      { label: 'Compound database', href: '/compounds', description: 'Nutrients, isolated compounds, standardized extracts, and active constituents' },
      { label: 'Search everything', href: '/search', description: 'Search common names, scientific names, compounds, guides, and research resources' },
    ],
  },
  {
    label: 'Compare',
    href: '/guides/compare',
    description: 'Compare options side by side by evidence, safety, form, dose, and practical tradeoffs',
    activePrefixes: ['/guides/compare'],
    children: [
      { label: 'Comparison center', href: '/guides/compare', description: 'Browse published side-by-side evidence and safety comparisons' },
      { label: 'Build your own', href: '/guides/compare/dynamic', description: 'Choose two ingredients and inspect the structured research matrix' },
    ],
  },
  {
    label: 'Safety',
    href: '/safety-checker',
    description: 'Check interaction signals, contraindication context, and uncertainty before combining products',
    activePrefixes: ['/safety-checker', '/info/supplement-safety-checklist', '/guides/other/supplement-stacking-safety', '/novel-psychoactive-substances'],
    children: [
      { label: 'Safety Checker', href: '/safety-checker', description: 'Screen supplement and medication-class combinations for documented or theoretical caution signals' },
      { label: 'Supplement safety checklist', href: '/info/supplement-safety-checklist', description: 'A practical checklist for labels, interactions, contraindications, and product quality' },
      { label: 'Stacking safety', href: '/guides/other/supplement-stacking-safety', description: 'Understand additive-risk patterns before combining supplements' },
      { label: 'Harm-reduction research', href: '/novel-psychoactive-substances', description: 'Higher-caution profiles for emerging and psychoactive substances' },
    ],
  },
  {
    label: 'Research',
    href: '/evidence/evidence-report',
    description: 'Original evidence reports, databases, visual research tools, citations, and methodology',
    activePrefixes: ['/evidence', '/tools', '/articles', '/learn', '/info/methodology'],
    children: [
      { section: 'Original research', label: 'Evidence Report', href: '/evidence/evidence-report', description: 'The flagship state-of-supplement-evidence report and original aggregate findings' },
      { section: 'Original research', label: 'Evidence Database', href: '/evidence/evidence-checker', description: 'Search structured ingredient evidence and filter by evidence strength' },
      { section: 'Original research', label: 'Botanical Activity Atlas', href: '/tools/botanical-activity-atlas', description: 'Explore herbs → compounds → effects, evidence, noticeability, and safety relationships' },
      { section: 'Keep up', label: 'Evidence digest', href: '/evidence/evidence-digest', description: 'Recent human-trial highlights and research changes' },
      { section: 'Read and verify', label: 'All articles', href: '/articles', description: 'Research notes, evidence reviews, and editorial analysis' },
      { section: 'Read and verify', label: 'Citation explorer', href: '/learn/citation-explorer', description: 'Inspect research references behind site conclusions' },
      { section: 'Read and verify', label: 'Methodology', href: '/info/methodology', description: 'How evidence grades, safety language, and conclusions are produced' },
    ],
  },
]
