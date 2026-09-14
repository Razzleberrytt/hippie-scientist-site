export function extractAnchorHrefs(html) {
  const hrefs = []
  const anchorHrefRegex = /<a\b[^>]*?\bhref=["']([^"']*)["'][^>]*>/gi

  let match
  while ((match = anchorHrefRegex.exec(html)) !== null) hrefs.push(match[1])

  return hrefs
}
