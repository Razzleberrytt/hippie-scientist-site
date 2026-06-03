export function buildInternalLinks(slug, related = []) {
  return related.slice(0, 10).map(item => ({
    anchor: item.name || item.slug,
    href: `/compounds/${item.slug}`,
    source: slug,
  }))
}
