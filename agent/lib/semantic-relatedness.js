export function semanticRelatedness(base = {}, compounds = []) {
  const effects = new Set([
    ...(base.effects || []),
    ...(base.primary_effects || []),
  ].map(v => String(v).toLowerCase()))

  return compounds.map(compound => {
    const compare = [
      ...(compound.effects || []),
      ...(compound.primary_effects || []),
    ].map(v => String(v).toLowerCase())

    const overlap = compare.filter(item => effects.has(item)).length

    return {
      slug: compound.slug,
      overlap,
    }
  }).sort((a,b)=>b.overlap-a.overlap)
}
