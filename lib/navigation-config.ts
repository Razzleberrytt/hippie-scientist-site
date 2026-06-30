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
    description: '557 active compounds with mechanism data and evidence summaries',
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
      { label: 'How the Brain Works', href: '/learn', description: 'Neurochemistry, receptors, and brain systems explained' },
      { label: 'Psychoactive Substances', href: '/learn', description: 'How herbs and compounds affect perception and cognition' },
      { label: 'Novel Psychoactives', href: '/novel-psychoactive-substances', description: 'Harm-reduction profiles for emerging substances' },
    ],
  },
  {
    label: 'Tools',
    href: '/safety-checker',
    description: 'Safety checkers, evidence lookup, and practical resources',
    children: [
      { label: 'Safety Checker', href: '/safety-checker', description: 'Herb-drug interaction and contraindication lookup' },
      { label: 'Evidence Lookup', href: '/evidence/evidence/evidence-checker', description: 'Search compounds by clinical evidence grade' },
      { label: 'Evidence Report', href: '/evidence/evidence/evidence-report', description: 'State of Supplement Evidence — annual research review' },
      { label: 'Dosing Guide', href: '/info/info/dosing', description: 'Bioavailability, timing, and stacking guidelines' },
      { label: 'Supplement Checklist', href: '/info/info/supplement-safety-checklist', description: 'What to verify before buying any supplement' },
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
  '/goals': {
    label: 'Goals',
    description: 'Find remedies by health goals',
    parent: '/',
  },
  '/goals/[slug]': {
    label: 'Goal',
    description: 'Remedies for a specific health goal',
    parent: '/goals',
    isDynamic: true,
  },
  '/stacks': {
    label: 'Stacks',
    description: 'Curated supplement stacks',
    parent: '/',
  },
  '/stacks/[slug]': {
    label: 'Stack',
    description: 'Curated supplement stack',
    parent: '/stacks',
    isDynamic: true,
  },
  '/compare': {
    label: 'Compare',
    description: 'Side-by-side comparisons',
    parent: '/',
  },
  '/compare/[slug]': {
    label: 'Comparison',
    description: 'Side-by-side comparison',
    parent: '/compare',
    isDynamic: true,
  },
  '/blog': {
    label: 'Blog',
    description: 'Blog posts and updates',
    parent: '/articles',
  },
  '/blog/[slug]': {
    label: 'Blog Post',
    description: 'Blog post',
    parent: '/blog',
    isDynamic: true,
  },
  '/research-notes': {
    label: 'Research Notes',
    description: 'Redirects to Articles',
    parent: '/articles',
  },
  '/research-notes/[slug]': {
    label: 'Research Note',
    description: 'Redirects to article',
    parent: '/research-notes',
    isDynamic: true,
  },
  '/articles': {
    label: 'Articles',
    description: 'Evidence reviews, mechanism deep-dives, and research notes',
    parent: '/',
  },
  '/articles/[slug]': {
    label: 'Article',
    description: 'Research note or evidence review',
    parent: '/articles',
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
  '/learn': {
    label: 'Learn',
    description: 'Redirects to Articles',
    parent: '/articles',
  },
  '/learn/[slug]': {
    label: 'Article',
    description: 'Redirects to article',
    parent: '/articles',
    isDynamic: true,
  },
  '/tools': {
    label: 'Tools',
    description: 'Research tools',
    parent: '/',
  },
  '/evidence/evidence-report': {
    label: 'Evidence Report',
    description: 'State of Supplement Evidence 2026 — analysis of 816 peer-reviewed studies',
    parent: '/',
  },
  '/evidence/evidence-checker': {
    label: 'Evidence Lookup',
    description: 'Search 557 compounds by clinical evidence grade (A-F)',
    parent: '/',
  },
  '/info/infographics': {
    label: 'Infographics',
    description: 'Free evidence-based supplement infographics with embed codes',
    parent: '/',
  },
  '/learn': {
    label: 'Guides',
    description: 'Educational resources (redirects to /guides)',
    parent: '/',
  },
  '/learn/[slug]': {
    label: 'Guide',
    description: 'Supplement guide (redirects to /guides/[slug])',
    parent: '/guides',
    isDynamic: true,
  },
}

/**
 * Footer links — consistent across all pages
 * Includes legal, meta, and important resources
 */
export const footerLinks = {
  legal: [
    { label: 'Privacy Policy', href: '/info/privacy' },
    { label: 'Disclaimer', href: '/info/disclaimer' },
    { label: 'Affiliate Disclosure', href: '/info/affiliate-disclosure' },
  ],
  social: [
    // Add social links as needed
  ],
  meta: [
    { label: 'Evidence Report', href: '/evidence/evidence-report' },
    { label: 'Evidence Lookup', href: '/evidence/evidence-checker' },
    { label: 'Infographics', href: '/info/infographics' },
    { label: 'Sitemap', href: '/sitemap.xml' },
    { label: 'RSS', href: '/rss.xml' },
  ],
}

const SEGMENT_LABEL_OVERRIDES: Record<string, string> = {
  'lions-mane': "Lion's Mane",
  'l-theanine': 'L-Theanine',
  'withanoside-iv': 'Withanoside IV',
}

function segmentToLabel(segment: string): string {
  if (SEGMENT_LABEL_OVERRIDES[segment]) return SEGMENT_LABEL_OVERRIDES[segment]

  return segment
    .replace(/-/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .replace(/\bL Theanine\b/g, 'L-Theanine')
}

/**
 * Generate dynamic breadcrumbs from a pathname
 *
 * @param pathname - Current page pathname (e.g., '/herb/cannabis')
 * @param customTrail - Optional custom breadcrumb trail to prepend
 * @returns Array of breadcrumb items
 *
 * @example
 * generateDynamicBreadcrumbs('/herb/cannabis')
 * // Returns:
 * // [
 * //   { label: 'Home', href: '/', current: false },
 * //   { label: 'Discover', href: '/discover', current: false },
 * //   { label: 'Herbs', href: '/herbs', current: false },
 * //   { label: 'Cannabis', href: '/herbs/cannabis', current: true }
 * // ]
 */
export function generateDynamicBreadcrumbs(
  pathname: string,
  customTrail?: BreadcrumbItem[]
): BreadcrumbItem[] {
  // Start with custom trail if provided
  const breadcrumbs: BreadcrumbItem[] = customTrail
    ? [...customTrail]
    : [{ label: 'Home', href: '/', current: false }]

  // Normalize pathname
  const normalizedPath = pathname.toLowerCase().trim()
  if (normalizedPath === '/' || !normalizedPath) {
    breadcrumbs[0].current = true
    return breadcrumbs
  }

  // Split into segments
  const segments = normalizedPath.split('/').filter(Boolean)
  let currentPath = ''

  // Build breadcrumb trail from segments
  for (let i = 0; i < segments.length; i++) {
    currentPath += `/${segments[i]}`
    const isLast = i === segments.length - 1
    const isStructuralSegment = segments[i] === 'page' || segments[i] === 'style'

    if (!isLast && isStructuralSegment) {
      continue
    }

    // Try exact match first
    const metadata = routeLabels[currentPath]

    if (metadata) {
      // Found exact match
      breadcrumbs.push({
        label: metadata.label,
        href: currentPath,
        current: isLast,
      })
    } else if (currentPath.includes('[')) {
      // Dynamic route — try pattern matching
      const patternKey = findDynamicRoutePattern(currentPath)
      if (patternKey) {
        const patternMetadata = routeLabels[patternKey]
        const displayLabel = segmentToLabel(segments[i])

        breadcrumbs.push({
          label: displayLabel || patternMetadata.label,
          href: currentPath,
          current: isLast,
        })
      } else {
        // Unknown dynamic route — use segment as label
        const displayLabel = segmentToLabel(segments[i])

        breadcrumbs.push({
          label: displayLabel,
          href: currentPath,
          current: isLast,
        })
      }
    } else {
      // No match found — use segment as label
      const displayLabel = segments[i - 1] === 'page'
        ? `Page ${segments[i]}`
        : segmentToLabel(segments[i])

      breadcrumbs.push({
        label: displayLabel,
        href: currentPath,
        current: isLast,
      })
    }
  }

  // Mark last breadcrumb as current
  if (breadcrumbs.length > 0) {
    breadcrumbs[breadcrumbs.length - 1].current = true
  }

  return breadcrumbs
}

/**
 * Find matching dynamic route pattern
 * @private
 *
 * @param pathname - Path to match (e.g., '/herb/cannabis')
 * @returns Matching pattern key (e.g., '/herb/[slug]') or null
 */
function findDynamicRoutePattern(pathname: string): string | null {
  const segments = pathname.split('/').filter(Boolean)

  // Try to match against known patterns
  for (const key in routeLabels) {
    if (!key.includes('[')) continue

    const keySegments = key.split('/').filter(Boolean)
    if (keySegments.length !== segments.length) continue

    // Check if all non-dynamic segments match
    let matches = true
    for (let i = 0; i < keySegments.length; i++) {
      if (!keySegments[i].includes('[') && keySegments[i] !== segments[i]) {
        matches = false
        break
      }
    }

    if (matches) {
      return key
    }
  }

  return null
}

/**
 * Validate if a route is recognized in navigation config
 * Useful for debugging and ensuring consistency
 *
 * @param pathname - Route to validate
 * @returns true if route exists or matches a pattern
 *
 * @example
 * validateRoute('/herbs') // true
 * validateRoute('/herbs/cannabis') // true (matches /herbs/[slug])
 * validateRoute('/nonexistent') // false
 */
export function validateRoute(pathname: string): boolean {
  const normalizedPath = pathname.toLowerCase().trim()

  // Check exact matches
  if (normalizedPath in routeLabels) {
    return true
  }

  // Check pattern matches
  return findDynamicRoutePattern(normalizedPath) !== null
}

/**
 * Get metadata for a specific route
 * Handles both exact and dynamic routes
 *
 * @param pathname - Route path
 * @returns Route metadata or null if not found
 *
 * @example
 * getRouteMetadata('/herb/cannabis')
 * // Returns: { label: 'Cannabis', description: 'Herb Profile', ... }
 */
export function getRouteMetadata(pathname: string): RouteMetadata | null {
  const normalizedPath = pathname.toLowerCase().trim()

  // Exact match
  if (normalizedPath in routeLabels) {
    return routeLabels[normalizedPath]
  }

  // Pattern match
  const patternKey = findDynamicRoutePattern(normalizedPath)
  if (patternKey) {
    return routeLabels[patternKey]
  }

  return null
}

/**
 * Flatten navigation hierarchy into a simple array
 * Useful for sitemap generation or recursive rendering
 *
 * @param items - Navigation items to flatten
 * @returns Flat array of all navigation items with their full paths
 */
export function flattenNavigation(
  items: NavigationItem[] = mainNavigation
): Array<{ item: NavigationItem; level: number; path: string }> {
  const result: Array<{ item: NavigationItem; level: number; path: string }> = []

  function traverse(
    items: NavigationItem[],
    level: number,
    _parentPath: string
  ) {
    for (const item of items) {
      result.push({
        item,
        level,
        path: item.href,
      })

      if (item.children) {
        traverse(item.children, level + 1, item.href)
      }
    }
  }

  traverse(items, 0, '')
  return result
}
