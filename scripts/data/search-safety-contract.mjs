export function interactionSlugsFromEdges(edges) {
  if (!edges || typeof edges !== 'object' || Array.isArray(edges)) return new Set()
  return new Set(
    Object.entries(edges)
      .filter(([slug, relationships]) => slug.trim() && Array.isArray(relationships) && relationships.length > 0)
      .map(([slug]) => slug.trim()),
  )
}

export function hasSearchInteractionSignal(slug, interactions, interactionSlugs = new Set()) {
  const normalizedSlug = String(slug || '').trim()
  const hasGraphEdge = interactionSlugs instanceof Set
    && normalizedSlug.length > 0
    && interactionSlugs.has(normalizedSlug)
  const hasRuntimeInteractions = Array.isArray(interactions) && interactions.length > 0
  return hasGraphEdge || hasRuntimeInteractions
}
