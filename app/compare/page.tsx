import { CompareTableClient } from '@/components/compare-table-client'
import { getCompounds } from '@/lib/runtime-data'
import { cleanSummary, formatDisplayLabel, isClean, list } from '@/lib/display-utils'

export default async function ComparePage() {
  const compounds = await getCompounds()
  const safeCompounds = compounds
    .filter((compound: any) => compound.slug && isClean(compound.name || compound.displayName || compound.slug))
    .map((compound: any) => ({
      slug: compound.slug,
      name: formatDisplayLabel(compound.displayName || compound.name || compound.slug),
      summary: cleanSummary(compound.summary || compound.description, 'compound'),
      effects: list(compound.primary_effects || compound.effects).slice(0, 4),
      evidence_tier: formatDisplayLabel(compound.evidence_tier || compound.evidenceTier || compound.evidence_grade),
      time_to_effect: formatDisplayLabel(compound.time_to_effect),
      role: formatDisplayLabel(compound.role),
      safety_flags: list(compound.safety_flags || compound.safetyNotes || compound.contraindications).slice(0, 3),
      complexity: formatDisplayLabel(compound.complexity),
      cost: formatDisplayLabel(compound.cost),
    }))

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <h1 className="text-3xl font-bold text-ink">Compound comparison</h1>
      <CompareTableClient compounds={safeCompounds} />
    </main>
  )
}
