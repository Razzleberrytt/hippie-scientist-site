export function generateComparisons(compound = {}, related = []) {
  const name = compound.name || compound.slug

  return related.slice(0, 5).map(item => ({
    title: `${name} vs ${item.name || item.slug}`,
    slug: `${compound.slug}-vs-${item.slug}`,
  }))
}
