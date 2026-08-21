export function interactionSlugsFromEdges(edges) {
  if (!edges || typeof edges !== 'object' || Array.isArray(edges)) return new Set()
  return new Set(
    Object.entries(edges)
      .filter(([slug, relationships]) => slug.trim() && Array.isArray(relationships) && relationships.length > 0)
      .map(([slug]) => slug.trim()),
  )
}

export function hasInteractionData(slug, interactionSlugs, flatInteractions = []) {
  const normalizedSlug = String(slug || '').trim()
  const graphHasInteraction = interactionSlugs instanceof Set && interactionSlugs.has(normalizedSlug)
  const flatHasInteraction = Array.isArray(flatInteractions) && flatInteractions.length > 0
  return graphHasInteraction || flatHasInteraction
}
