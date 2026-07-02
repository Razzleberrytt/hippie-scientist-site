export function buildCompoundFingerprint(compound = {}) {
  return {
    slug: compound.slug,
    effects: compound.effects || compound.primary_effects || [],
    mechanisms: compound.mechanisms || [],
    evidence_tier: compound.evidence_tier || 'unknown',
    safety: compound.safety || 'unknown',
  }
}
