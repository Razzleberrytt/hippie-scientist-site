export interface PrimaryNavigationItem {
  label: string
  href: string
  description?: string
  children?: PrimaryNavigationItem[]
  section?: string
  activePrefixes?: string[]
}

/**
 * Primary navigation is intentionally organized around the four user intents
 * that should dominate first-time navigation: Goal, Ingredient, Compare, and
 * Safety. Research-heavy resources remain one click away inside the relevant
 * intent menus and through /tools/ and /library/, without competing for a
 * fifth top-level slot.
 */
export const primaryNavigation: PrimaryNavigationItem[] = [
  {
    label: 'Goals',
    href: '/guides',
    description: 'Start with what you are researching, then narrow to evidence-backed options',
    activePrefixes: ['/guides/sleep', '/guides/stress', '/guides/anxiety', '/guides/focus', '/guides/mental-health', '/guides/adhd', '/start'],
    children: [
      { section: 'Start with a goal', label: 'Start here', href: '/start', description: 'Choose Sleep, Stress, Anxiety, Focus, ingredient lookup, or Safety' },
      { section: 'Start with a goal', label: 'Sleep', href: '/guides/sleep', description: 'Sleep aids, melatonin alternatives, and sleep hygiene' },
      { section: 'Start with a goal', label: 'Stress', href: '/guides/stress', description: 'Acute tension, chronic overload, burnout, sleep disruption, and cortisol concerns' },
      { section: 'Start with a goal', label: 'Anxiety', href: '/guides/anxiety', description: 'Overthinking, tension, calming supports, and anxiety-focused evidence' },
      { section: 'Start with a goal', label: 'Focus & Cognition', href: '/guides/focus', description: 'Nootropics, focus support, and cognitive performance' },
      { section: 'More goals', label: 'Mental Health', href: '/guides/mental-health', description: 'Conditions, treatment evidence, safety, and stigma-aware explainers' },
      { section: 'More goals', label: 'ADHD', href: '/guides/adhd', description: 'Attention, executive function, nutrients, and treatment context' },
      { section: 'More goals', label: 'All goal guides', href: '/guides', description: 'Browse every organized guide collection' },
    ],
  },
  {
    label: 'Ingredients',
    href: '/herbs',
    description: 'Look up an herb, nutrient, compound, extract, or its evidence record',
    activePrefixes: ['/herbs', '/compounds', '/evidence/evidence-checker', '/articles', '/learn', '/evidence/evidence-report', '/evidence/evidence-digest', '/info/methodology', '/tools/botanical-activity-atlas'],
    children: [
      { section: 'Look up an ingredient', label: 'Herb database', href: '/herbs', description: 'Alphabetical herb profiles with evidence and safety summaries' },
      { section: 'Look up an ingredient', label: 'Compound database', href: '/compounds', description: 'Nutrients, active compounds, and standardized extracts' },
      { section: 'Look up an ingredient', label: 'Evidence Database', href: '/evidence/evidence-checker', description: 'Filter the research library by clinical evidence strength' },
      { section: 'Research deeper', label: 'Botanical Activity Atlas', href: '/tools/botanical-activity-atlas', description: 'Explore botanicals through chemistry, evidence, effects, and safety' },
      { section: 'Research deeper', label: 'Evidence Report', href: '/evidence/evidence-report', description: 'The annual state of supplement evidence review' },
      { section: 'Research deeper', label: 'Evidence digest', href: '/evidence/evidence-digest', description: 'Recent human-trial highlights and research summaries' },
      { section: 'Research deeper', label: 'Citation explorer', href: '/learn/citation-explorer', description: 'Explore the research references behind the site' },
      { section: 'Research deeper', label: 'Methodology', href: '/info/methodology', description: 'How evidence grades, safety language, and conclusions are built' },
      { section: 'Research deeper', label: 'All research tools', href: '/tools', description: 'Open the site’s evidence, safety, comparison, and botanical research tools' },
    ],
  },
  {
    label: 'Compare',
    href: '/guides/compare',
    description: 'Compare two options by evidence, safety, dose, form, and practical fit',
    activePrefixes: ['/guides/compare', '/compare'],
    children: [
      { label: 'Comparison library', href: '/guides/compare', description: 'Editorially reviewed side-by-side supplement comparisons' },
      { label: 'Compare two ingredients', href: '/guides/compare/dynamic', description: 'Build an on-demand two-ingredient comparison; dynamic results stay out of the index' },
      { label: 'Melatonin vs Magnesium', href: '/guides/compare/melatonin-vs-magnesium', description: 'See evidence, safety, and practical sleep-use differences' },
      { label: 'Research tools', href: '/tools', description: 'Open the full research-tool directory' },
    ],
  },
  {
    label: 'Safety',
    href: '/safety-checker',
    description: 'Screen combinations and trace caution flags back to source-backed profiles',
    activePrefixes: ['/safety-checker', '/info/supplement-safety-checklist', '/info/dosing'],
    children: [
      { label: 'Safety Checker', href: '/safety-checker', description: 'Screen supplement and medication-class combinations for possible caution flags' },
      { label: 'Try Ashwagandha + Melatonin', href: '/safety-checker?items=herb%3Aashwagandha%2Ccompound%3Amelatonin', description: 'Open a pre-filled example to see how screening results work' },
      { label: 'Supplement safety checklist', href: '/info/supplement-safety-checklist', description: 'What to verify before buying or combining supplements' },
      { label: 'Dosing guide', href: '/info/dosing', description: 'Bioavailability, timing, stacking, and dose realism basics' },
      { label: 'Serotonergic caution atlas', href: '/tools/botanical-activity-atlas/serotonergic-interaction-risk', description: 'Explore a research view of botanicals carrying serotonergic caution signals' },
    ],
  },
]
