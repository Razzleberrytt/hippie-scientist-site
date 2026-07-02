export function generateRouteCandidates(compound = {}) {
  const slug = compound.slug || 'compound'

  return {
    compound_routes: [
      `/compounds/${slug}`,
      `/best/${slug}`,
    ],
    comparison_routes: [
      `/compare/${slug}-vs-magnesium`,
      `/compare/${slug}-vs-creatine`,
    ],
    topical_routes: [
      `/benefits/${slug}`,
      `/safety/${slug}`,
    ],
  }
}
