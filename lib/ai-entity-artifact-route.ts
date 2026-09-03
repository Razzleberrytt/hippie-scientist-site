const HERB_PAGE_ARTIFACT_OVERRIDES: Record<string, string> = {
  kava: 'piper-methysticum',
  passionflower: 'passiflora-incarnata',
  'ashwagandha-withania-somnifera': 'ashwagandha',
}

const COMPOUND_TO_HERB_ARTIFACT_OVERRIDES: Record<string, string> = {
  elderberry: 'elderberry',
  garlic: 'allium-sativum',
  ginger: 'ginger',
  'lions-mane': 'hericium-erinaceus',
  maca: 'maca',
  reishi: 'ganoderma-lucidum',
  valerian: 'valeriana-officinalis',
}

export type AiEntityArtifactRoute = {
  kind: 'herb' | 'compound'
  slug: string
}

/**
 * Resolve the machine-readable artifact identity for profile routes whose public
 * canonical slug/taxonomy intentionally differs from the underlying runtime
 * record slug. Keep this narrow: these entries are measured route/data identity
 * mismatches, not a generic synonym resolver.
 */
export function resolveAiEntityArtifactRoute(
  kind: 'herb' | 'compound',
  slug: string,
): AiEntityArtifactRoute {
  if (kind === 'herb') {
    return {
      kind,
      slug: HERB_PAGE_ARTIFACT_OVERRIDES[slug] || slug,
    }
  }

  const herbArtifactSlug = COMPOUND_TO_HERB_ARTIFACT_OVERRIDES[slug]
  if (herbArtifactSlug) {
    return { kind: 'herb', slug: herbArtifactSlug }
  }

  return { kind, slug }
}
