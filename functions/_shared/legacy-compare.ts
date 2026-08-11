const BUILT_COMPARE_SLUGS = new Set([
  'ashwagandha-vs-l-theanine-vs-magnesium',
  'berberine-vs-inositol',
  'berberine-vs-metformin',
  'caffeine-vs-l-theanine',
  'caffeine-vs-l-theanine-vs-bacopa-for-focus',
  'curcumin-vs-boswellia-vs-omega-3',
  'kanna-vs-ssris',
  'kava-vs-alcohol',
  'melatonin-vs-magnesium',
  'melatonin-vs-valerian-vs-magnesium-for-sleep',
  'rhodiola-vs-ashwagandha',
  'sleep-herbs-vs-melatonin',
])

const LEGACY_COMPARE_ALIASES: Record<string, string> = {
  'ashwagandha-vs-rhodiola': 'rhodiola-vs-ashwagandha',
  'curcumin-vs-boswellia': 'curcumin-vs-boswellia-vs-omega-3',
}

function extractLegacySlug(pathname: string, legacyPrefix: string): string {
  return pathname
    .replace(new RegExp(`^/${legacyPrefix}/?`), '')
    .replace(/^\/+|\/+$/g, '')
}

export function handleLegacyCompareRequest(request: Request, legacyPrefix: string): Response {
  const url = new URL(request.url)
  const legacySlug = extractLegacySlug(url.pathname, legacyPrefix)

  if (!legacySlug) {
    url.pathname = '/guides/compare/'
    return Response.redirect(url.toString(), 301)
  }

  const targetSlug = LEGACY_COMPARE_ALIASES[legacySlug] || legacySlug
  if (BUILT_COMPARE_SLUGS.has(targetSlug)) {
    url.pathname = `/guides/compare/${targetSlug}/`
    return Response.redirect(url.toString(), 301)
  }

  // Redirect only legacy URLs with a verified destination. Unknown comparison
  // slugs should not inherit a generic 301 to the hub because that hides retired
  // or phantom URLs behind an unrelated canonical destination.
  return new Response(null, {
    status: 410,
    headers: {
      'X-Robots-Tag': 'noindex, nofollow',
    },
  })
}
