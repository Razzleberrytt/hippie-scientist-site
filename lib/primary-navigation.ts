export interface PrimaryNavigationItem {
  label: string
  href: string
  description?: string
  children?: PrimaryNavigationItem[]
  section?: string
}

export const primaryNavigation: PrimaryNavigationItem[] = [
  {
    label: 'Herbs',
    href: '/herbs',
    description: 'Evidence-graded herb profiles — effects, safety, dosing, and pharmacology',
    children: [
      { label: 'Browse all herbs', href: '/herbs', description: 'Alphabetical herb database with evidence and safety summaries' },
      { label: 'Herb guides', href: '/guides/herbs', description: 'Editorial herb explainers and practical use guides' },
      { label: 'Compare herbs', href: '/guides/compare', description: 'Side-by-side tradeoffs for popular botanicals and supplements' },
    ],
  },
  {
    label: 'Compounds',
    href: '/compounds',
    description: 'Evidence-graded compound profiles with mechanisms, safety context, and research summaries',
    children: [
      { label: 'Browse all compounds', href: '/compounds', description: 'Active compounds, nutrients, and standardized extracts' },
      { label: 'Evidence lookup', href: '/evidence/evidence-checker', description: 'Filter compounds by clinical evidence grade' },
      { label: 'Dosing guide', href: '/info/dosing', description: 'Bioavailability, timing, stacking, and dose realism basics' },
    ],
  },
  {
    label: 'Library',
    href: '/guides',
    description: 'Choose a health goal, practical guide, or science foundation',
    children: [
      { section: 'Choose a health goal', label: 'Sleep', href: '/guides/sleep', description: 'Sleep aids, melatonin alternatives, and sleep hygiene' },
      { section: 'Choose a health goal', label: 'Anxiety & Stress', href: '/guides/anxiety', description: 'Calming supports, adaptogens, and stress-management evidence' },
      { section: 'Choose a health goal', label: 'Focus & Cognition', href: '/guides/focus', description: 'Nootropics, focus stacks, and cognitive performance' },
      { section: 'Choose a health goal', label: 'ADHD', href: '/guides/adhd', description: 'Attention, executive function, nutrients, and treatment context' },
      { section: 'Choose a health goal', label: 'Mental Health', href: '/guides/mental-health', description: 'Treatment evidence, safety, stigma, and condition explainers' },
      { section: 'Find a practical answer', label: 'All guides', href: '/guides', description: 'Browse the complete problem-solving guide library' },
      { section: 'Find a practical answer', label: 'Comparisons', href: '/guides/compare', description: 'Side-by-side supplement and compound tradeoffs' },
      { section: 'Find a practical answer', label: 'Best supplements', href: '/guides/best', description: 'Curated research roundups organized by need' },
      { section: 'Understand the science', label: 'Learning library', href: '/learn', description: 'Evidence, neurochemistry, safety, and research explainers' },
      { section: 'Understand the science', label: 'Evidence literacy', href: '/learn/evidence-literacy', description: 'Interpret supplement research without the hype' },
      { section: 'Understand the science', label: 'Interactions', href: '/learn/interactions', description: 'Why herb-drug and supplement interactions matter' },
      { section: 'Understand the science', label: 'Novel psychoactives', href: '/novel-psychoactive-substances', description: 'Harm-reduction profiles for emerging substances' },
    ],
  },
  {
    label: 'Tools',
    href: '/safety-checker',
    description: 'Safety checkers, evidence lookup, and practical resources',
    children: [
      { label: 'Safety checker', href: '/safety-checker', description: 'Herb-drug interaction and contraindication lookup' },
      { label: 'Evidence lookup', href: '/evidence/evidence-checker', description: 'Search compounds by clinical evidence grade' },
      { label: 'Evidence report', href: '/evidence/evidence-report', description: 'State of Supplement Evidence — annual research review' },
      { label: 'Evidence digest', href: '/evidence/evidence-digest', description: 'Recent human-trial highlights and research summaries' },
      { label: 'Dosing guide', href: '/info/dosing', description: 'Bioavailability, timing, and stacking guidelines' },
      { label: 'Supplement checklist', href: '/info/supplement-safety-checklist', description: 'What to verify before buying any supplement' },
      { label: 'Infographics', href: '/info/infographics', description: 'Shareable evidence-based supplement visuals' },
    ],
  },
]
