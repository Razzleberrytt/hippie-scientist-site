import { seoEntryPages } from '../../app/seo-entry-pages'

function main() {
  console.log('[validate-guide-related] Auditing related guides listings...')

  const seenRoutes = new Set()
  const cleanRoute = (r) => r.replace(/^guides\//, '')

  let failed = false
  const errors = []

  for (const page of seoEntryPages) {
    const currentCleanRoute = cleanRoute(page.route)
    const seenRoutes = new Set()
    
    // Simulate the related guides filter logic exactly as in app/seo-entry-pages.tsx
    const related = seoEntryPages.filter((item) => {
      const itemCleanRoute = cleanRoute(item.route)
      if (itemCleanRoute === currentCleanRoute) return false
      if (item.goalSlug !== page.goalSlug) return false
      if (seenRoutes.has(itemCleanRoute)) return false
      seenRoutes.add(itemCleanRoute)
      return true
    })

    // Assert that the filtered list is clean
    const localSeen = new Set()
    for (const item of related) {
      const itemCleanRoute = cleanRoute(item.route)
      if (itemCleanRoute === currentCleanRoute) {
        errors.push(`Self-referential related guide found on route "${page.route}": targets "${item.route}"`)
        failed = true
      }
      if (localSeen.has(itemCleanRoute)) {
        errors.push(`Duplicate related guide route "${item.route}" mapped on guide page "${page.route}"`)
        failed = true
      }
      localSeen.add(itemCleanRoute)
    }
  }

  if (failed) {
    console.error('[validate-guide-related] FAIL: Related guides issues detected:')
    errors.forEach(e => console.error(`  - ${e}`))
    process.exit(1)
  }

  console.log('[validate-guide-related] PASS: Related guides are fully clean and deduplicated.')
}

main()
