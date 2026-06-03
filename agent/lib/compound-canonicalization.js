export function canonicalizeCompoundSlug(value = '') {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function dedupeCanonicalCompounds(compounds = []) {
  const seen = new Set()

  return compounds.filter(compound => {
    const slug = canonicalizeCompoundSlug(compound.slug || compound.name)

    if (seen.has(slug)) return false

    seen.add(slug)
    return true
  })
}
