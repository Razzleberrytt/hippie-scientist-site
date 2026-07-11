/**
 * Navigation Configuration
 *
 * Central source of truth for all navigation hierarchies, breadcrumb generation,
 * and route metadata. Used by Navigation component, Breadcrumbs, and structured
 * data (Schema.org).
 *
 * Structure:
 * - mainNavigation: Hierarchical menu structure for UI rendering
 * - routeLabels: Flat mapping of pathname → readable label
 * - footerLinks: Footer legal/meta links consistent across all pages
 * - generateDynamicBreadcrumbs(): Auto-generate breadcrumbs from pathname
 * - validateRoute(): Check if a route is recognized
 *
 * @author The Hippie Scientist
 */

/**
 * Navigation item with optional children for dropdowns
 */
export interface NavigationItem {
  /** Display label (visible in UI) */
  label: string
  /** Href path (e.g., '/herbs', '/blog') */
  href: string
  /** Optional: children for dropdown menus */
  children?: NavigationItem[]
  /** Optional: SEO description for breadcrumbs */
  description?: string
  /** Optional: only show in desktop menu (hide mobile) */
  desktopOnly?: boolean
}

/**
 * Breadcrumb item for dynamic rendering
 */
export interface BreadcrumbItem {
  /** Display label */
  label: string
  /** Full path to this breadcrumb */
  href: string
  /** Whether this is the current page (last item) */
  current: boolean
}

/**
 * Metadata for a route
 */
export interface RouteMetadata {
  /** Display name for the route */
  label: string
  /** Breadcrumb-friendly description */
  description?: string
  /** Parent route for breadcrumb hierarchy */
  parent?: string
  /** Whether this is a dynamic route (e.g., /herb/[slug]) */
  isDynamic?: boolean
}

/**
 * Site URL (root domain)
 */
export const SITE_URL = 'https://thehippiescientist.net'

/**
 * Main navigation hierarchy
 * Used for rendering the header/nav component
 */
export const mainNavigation: NavigationItem[] = [
  {
    label: 'Herbs',
    href: '/herbs',
    description: 'Evidence-graded herb profiles — effects, safety, dosing, and pharmacology',
  },
  {
    label: 'Compounds',
    href: '/compounds',
    description: 'Evidence-graded compound profiles with mechanisms, safety context, and research summaries',
  },
  {
    label: 'Guides',
    href: '/guides',
    description: 'Evidence-based guides organized by health goal',
    children: [
      { label: 'ADHD', href: '/guides/adhd', description: 'ADHD supplements, nutrient research, and treatment context' },
      { label: 'Sleep', href: '/guides/sleep', description: 'Natural sleep aids, melatonin alternatives, and sleep hygiene' },
      { label: 'Anxiety & Stress', href: '/guides/anxiety', description: 'Adaptogens, anxiolytics, and stress management strategies' },
      { label: 'Focus & Cognition', href: '/guides/focus', description: 'Nootropics, focus stacks, and cognitive enhancement' },
      { label: 'Herb Profiles', href: '/guides/herbs', description: 'Deep dives on individual herbs and botanicals' },
      { label: 'Comparisons', href: '/guides/compare', description: 'Side-by-side supplement and compound comparisons' },
      { label: 'Best Supplements', href: '/guides/best', description: 'Curated supplement recommendations by need' },
    ],
  },
  {
    label: 'Learn',
    href: '/learn',
    description: 'Neuroscience, psychopharmacology, and evidence literacy',
    children: [
      { label: 'Neuroscience Basics', href: '/learn', description: 'Neurochemistry, receptors, and brain systems explained' },
      { label: 'Novel Psychoactives', href: '/novel-psychoactive-substances', description: 'Harm-reduction profiles for emerging substances' },
    ],
  },
  {
    label: 'Tools',
    href: '/safety-checker',
    description: 'Safety checkers, evidence lookup, and practical resources',
    children: [
      { label: 'Safety Checker', href: '/safety-checker', description: 'Herb-drug interaction and contraindication lookup' },
      { label: 'Evidence Lookup', href: '/evidence/evidence-checker', description: 'Search compounds by clinical evidence grade' },
      { label: 'Evidence Report', href: '/evidence/evidence-report', description: 'State of Supplement Evidence — annual research review' },
      { label: 'Dosing Guide', href: '/info/dosing', description: 'Bioavailability, timing, and stacking guidelines' },
      { label: 'Supplement Checklist', href: '/info/supplement-safety-checklist', description: 'What to verify before buying any supplement' },
    ],
  },
]

/**
 * Flat mapping of routes to human-readable labels
 * Used for breadcrumbs, Schema.org SiteNavigationElement, and fallback labels
 *
 * Format: pathname → { label, description?, parent?, isDynamic? }
 */
export const routeLabels: Record<string, RouteMetadata> = {
  '/': {
    label: 'Home',
    description: 'The Hippie Scientist – Natural remedies & evidence-based herbalism',
  },
  '/herbs': {
    label: 'Herbs',
    description: 'Browse medicinal herbs',
    parent: '/',
  },
  '/herbs/[slug]': {
    label: 'Herb Profile',
    description: 'Detailed herb information',
    parent: '/herbs',
    isDynamic: true,
  },
  '/compounds': {
    label: 'Compounds',
    description: 'Active compounds and effects',
    parent: '/',
  },
  '/compounds/[slug]': {
    label: 'Compound Profile',
    description: 'Detailed compound information',
    parent: '/compounds',
    isDynamic: true,
  },
  '/search': {
    label: 'Search',
    description: 'Search all herbs and compounds',
    parent: '/',
  },
  '/safety': {
    label: 'Safety',
    description: 'Safety checker redirect',
    parent: '/',
  },
  '/safety-checker': {
    label: 'Safety',
    description: 'Interaction checker and safety context',
    parent: '/',
  },
  '/guides/adhd': {
    label: 'ADHD',
    description: 'ADHD supplements, nutrient research, and treatment context',
    parent: '/guides',
  },
  '/guides/sleep': {
    label: 'Sleep',
    description: 'Natural sleep aids, melatonin alternatives, and sleep hygiene',
    parent: '/guides',
  },
  '/guides/anxiety': {
    label: 'Anxiety & Stress',
    description: 'Adaptogens, anxiolytics, and stress management strategies',
    parent: '/guides',
  },
  '/guides/focus': {
    label: 'Focus & Cognition',
    description: 'Nootropics, focus stacks, and cognitive enhancement',
    parent: '/guides',
  },
  '/guides/herbs': {
    label: 'Herb Guides',
    description: 'Deep dives on individual herbs and botanicals',
    parent: '/guides',
  },
  '/guides/best': {
    label: 'Best Supplements',
    description: 'Curated supplement recommendations by need',
    parent: '/guides',
  },
  '/guides/compare': {
    label: 'Compare',
    description: 'Side-by-side comparisons',
    parent: '/guides',
  },
  '/guides/compare/[slug]': {
    label: 'Comparison',
    description: 'Side-by-side comparison',
    parent: '/guides/compare',
    isDynamic: true,
  },
  '/guides': {
    label: 'Guides',
    description: 'Problem-solving supplement guides for sleep, anxiety, focus, stress, and more',
    parent: '/',
  },
  '/guides/[slug]': {
    label: 'Guide',
    description: 'Evidence-informed supplement guide',
    parent: '/guides',
    isDynamic: true,
  },
  '/tools': {
    label: 'Tools',
    description: 'Research tools',
    parent: '/',
  },
}
