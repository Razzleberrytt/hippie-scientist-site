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
    label: 'Explore',
    href: '/library',
    description: 'The complete site directory — every major content collection in one place',
    activePrefixes: ['/library', '/search'],
    children: [
      { label: 'Explore everything', href: '/library', description: 'Use the master directory to see every major section of the site' },
      { label: 'All articles', href: '/articles', description: 'Research notes, evidence reviews, updates, and editorial deep dives' },
      { label: 'All guides', href: '/guides', description: 'Goal-based supplement and mental health guides' },
      { label: 'Learning library', href: '/learn', description: 'Neuroscience, evidence literacy, and safety explainers' },
      { label: 'Search the site', href: '/search', description: 'Search herbs, compounds, guides, and educational resources' },
    ],
  },
  {
    label: 'Topics',
    href: '/guides',
    description: 'Browse guidance by health goal or practical question',
    activePrefixes: ['/guides'],
    children: [
      { section: 'Health goals', label: 'Mental Health', href: '/guides/mental-health', description: 'Conditions, treatment evidence, safety, and stigma-aware explainers' },
      { section: 'Health goals', label: 'ADHD', href: '/guides/adhd', description: 'Attention, executive function, nutrients, and treatment context' },
      { section: 'Health goals', label: 'Sleep', href: '/guides/sleep', description: 'Sleep aids, melatonin alternatives, and sleep hygiene' },
      { section: 'Health goals', label: 'Anxiety & Stress', href: '/guides/anxiety', description: 'Calming supports, adaptogens, and stress-management evidence' },
      { section: 'Health goals', label: 'Focus & Cognition', href: '/guides/focus', description: 'Nootropics, focus support, and cognitive performance' },
      { section: 'Practical guides', label: 'All topic guides', href: '/guides', description: 'Browse every organized guide collection' },
      { section: 'Practical guides', label: 'Comparisons', href: '/guides/compare', description: 'Side-by-side supplement and compound tradeoffs' },
      { section: 'Practical guides', label: 'Best supplements', href: '/guides/best', description: 'Research roundups organized by a specific need' },
      { section: 'Practical guides', label: 'Herb guides', href: '/guides/herbs', description: 'Editorial deep dives on individual botanicals' },
      { section: 'Practical guides', label: 'More supplement topics', href: '/guides/other', description: 'Forms, quality, routines, advanced compounds, and harm reduction' },
    ],
  },
  {
    label: 'Ingredients',
    href: '/herbs',
    description: 'Look up herbs, nutrients, active compounds, and standardized extracts',
    activePrefixes: ['/herbs', '/compounds'],
    children: [
      { label: 'Herb database', href: '/herbs', description: 'Alphabetical herb profiles with evidence and safety summaries' },
      { label: 'Compound database', href: '/compounds', description: 'Nutrients, active compounds, and standardized extracts' },
      { label: 'Herb guides', href: '/guides/herbs', description: 'Long-form practical guides for important botanicals' },
      { label: 'Evidence lookup', href: '/evidence/evidence-checker', description: 'Filter compounds by clinical evidence grade' },
      { label: 'Dosing guide', href: '/info/dosing', description: 'Bioavailability, timing, stacking, and dose realism basics' },
    ],
  },
  {
    label: 'Research',
    href: '/articles',
    description: 'Articles, learning resources, evidence reports, and methodology',
    activePrefixes: ['/articles', '/learn', '/evidence', '/novel-psychoactive-substances', '/info/methodology'],
    children: [
      { section: 'Read and learn', label: 'All articles', href: '/articles', description: 'Research notes, evidence reviews, and editorial analysis' },
      { section: 'Read and learn', label: 'Learning library', href: '/learn', description: 'Neuroscience, psychopharmacology, and evidence literacy' },
      { section: 'Read and learn', label: 'Novel psychoactives', href: '/novel-psychoactive-substances', description: 'Harm-reduction profiles for emerging substances' },
      { section: 'Evidence resources', label: 'Evidence report', href: '/evidence/evidence-report', description: 'The annual state of supplement evidence review' },
      { section: 'Evidence resources', label: 'Evidence digest', href: '/evidence/evidence-digest', description: 'Recent human-trial highlights and research summaries' },
      { section: 'Evidence resources', label: 'Citation explorer', href: '/learn/citation-explorer', description: 'Explore the research references behind the site' },
      { section: 'Evidence resources', label: 'Methodology', href: '/info/methodology', description: 'How evidence grades, safety language, and conclusions are built' },
    ],
  },
  {
    label: 'Tools',
    href: '/safety-checker',
    description: 'Safety checks, evidence lookup, dosing, and shareable resources',
    activePrefixes: ['/safety-checker', '/info/dosing', '/info/supplement-safety-checklist', '/info/infographics'],
    children: [
      { label: 'Safety checker', href: '/safety-checker', description: 'Herb-drug interaction and contraindication lookup' },
      { label: 'Evidence lookup', href: '/evidence/evidence-checker', description: 'Search compounds by clinical evidence grade' },
      { label: 'Dosing guide', href: '/info/dosing', description: 'Bioavailability, timing, and stacking guidelines' },
      { label: 'Supplement checklist', href: '/info/supplement-safety-checklist', description: 'What to verify before buying a supplement' },
      { label: 'Infographics', href: '/info/infographics', description: 'Downloadable and embeddable evidence visuals' },
    ],
  },
]
