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
    label: 'Home',
    href: '/',
    description: 'The Hippie Scientist – evidence-first supplement research',
  },
  {
    label: 'Articles',
    href: '/blog',
    description: 'Research articles on herbs, compounds, and supplement science',
  },
  {
    label: 'Comparisons',
    href: '/compare',
    description: 'Side-by-side herb and compound comparisons',
  },
  {
    label: 'Evidence Reviews',
    href: '/goals',
    description: 'Health pathway guides with evidence-graded candidate compounds',
  },
  {
    label: 'About',
    href: '/about',
    description: 'About The Hippie Scientist',
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
    description: 'Articles and updates',
    parent: '/',
  },
  '/blog/[slug]': {
    label: 'Article',
    description: 'Blog article',
    parent: '/blog',
    isDynamic: true,
  },
  '/learn': {
    label: 'Learn',
    description: 'Educational guides and deep dives',
    parent: '/',
  },
  '/learn/[slug]': {
    label: 'Guide',
    description: 'Educational guide',
    parent: '/learn',
    isDynamic: true,
  },
  '/tools': {
    label: 'Tools',
    description: 'Research tools',
    parent: '/',
  },
  '/education': {
    label: 'Education',
    description: 'Educational resources (redirects to /learn)',
    parent: '/',
  },
  '/education/[slug]': {
    label: 'Education Guide',
    description: 'Educational guide (redirects to /learn/[slug])',
    parent: '/education',
    isDynamic: true,
  },
}

/**
 * Footer links — consistent across all pages
 * Includes legal, meta, and important resources
 */
export const footerLinks = {
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Affiliate Disclosure', href: '/affiliate-disclosure' },
  ],
  social: [
    // Add social links as needed
  ],
  meta: [
    { label: 'Sitemap', href: '/sitemap.xml' },
    { label: 'RSS', href: '/rss.xml' },
  ],
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
        const displayLabel = segments[i]
          .replace(/-/g, ' ')
          .split(' ')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')

        breadcrumbs.push({
          label: displayLabel || patternMetadata.label,
          href: currentPath,
          current: isLast,
        })
      } else {
        // Unknown dynamic route — use segment as label
        const displayLabel = segments[i]
          .replace(/-/g, ' ')
          .split(' ')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')

        breadcrumbs.push({
          label: displayLabel,
          href: currentPath,
          current: isLast,
        })
      }
    } else {
      // No match found — use segment as label
      const displayLabel = segments[i]
        .replace(/-/g, ' ')
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')

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
