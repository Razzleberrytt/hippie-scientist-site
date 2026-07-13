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
    description: 'Guides, articles, and science explainers organized in one library',
    children: [
      { section: 'Browse by topic', label: 'Mental Health', href: '/guides/mental-health', description: 'OCD, personality disorders, treatment evidence, safety, and stigma' },
      { section: 'Browse by topic', label: 'ADHD', href: '/guides/adhd', description: 'Attention, executive function, nutrients, and treatment context' },
      { section: 'Browse by topic', label: 'Sleep', href: '/guides/sleep', description: 'Sleep aids, melatonin alternatives, and sleep hygiene' },
      { section: 'Browse by topic', label: 'Anxiety & Stress', href: '/guides/anxiety', description: 'Adaptogens, anxiolytics, and stress-management evidence' },
      { section: 'Browse by topic', label: 'Focus & Cognition', href: '/guides/focus', description: 'Nootropics, focus stacks, and cognitive performance' },
      { section: 'Practical content', label: 'All guides', href: '/guides', description: 'Browse the complete problem-solving guide library' },
      { section: 'Practical content', label: 'Herb guides', href: '/guides/herbs', description: 'Deep dives on individual herbs and botanicals' },
      { section: 'Practical content', label: 'Comparisons', href: '/guides/compare', description: 'Side-by-side supplement and compound tradeoffs' },
      { section: 'Practical content', label: 'Best supplements', href: '/guides/best', description: 'Curated recommendations organized by need' },
      { section: 'Science foundations', label: 'Learning library', href: '/learn', description: 'Evidence, neurochemistry, safety, and research explainers' },
      { section: 'Science foundations', label: 'Evidence literacy', href: '/learn/evidence-literacy', description: 'Interpret supplement research without the hype' },
      { section: 'Science foundations', label: 'How to read studies', href: '/learn/how-to-read-scientific-studies', description: 'Trial design, endpoints, bias, and practical interpretation' },
      { section: 'Science foundations', label: 'Neuroscience glossary', href: '/learn/neuroscience-glossary', description: 'Plain-English brain and receptor terminology' },
      { section: 'Science foundations', label: 'Interactions', href: '/learn/interactions', description: 'Why herb-drug and supplement interactions matter' },
      { section: 'Science foundations', label: 'Product quality', href: '/learn/product-quality', description: 'Labels, standardization, testing, and quality signals' },
      { section: 'Science foundations', label: 'Novel psychoactives', href: '/novel-psychoactive-substances', description: 'Harm-reduction profiles for emerging substances' },
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
