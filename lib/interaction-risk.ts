import fs from 'node:fs'
import path from 'node:path'
import type { InteractionEdge, RiskTag } from '@/src/types/interactions'
import type { SafetyCertainty } from '@/src/lib/safety-governance'

const dataDir = path.join(process.cwd(), 'public', 'data')

type EdgeEntry = InteractionEdge
type TagEntry = RiskTag

export interface MechanismRisk {
  mechanism: string
  label: string
  severity: string
  certainties: SafetyCertainty[]
  partnerCount: number
  provenanceCoverage: {
    withProvenance: number
    total: number
  }
  topPartners: { slug: string; name: string }[]
}

const LABELS: Record<string, { label: string; severity: string }> = {
  serotonergic:  { label: 'Serotonergic activity',       severity: 'severe'   },
  anticoagulant: { label: 'Anticoagulant / bleeding',     severity: 'severe'   },
  cns_sedation:  { label: 'CNS sedation',                 severity: 'moderate' },
  blood_glucose: { label: 'Blood-glucose lowering',       severity: 'moderate' },
  blood_pressure:{ label: 'Blood-pressure effects',       severity: 'moderate' },
}

let edgeCache: Record<string, EdgeEntry[]> | null = null
let tagCache: Record<string, TagEntry[]> | null = null

function edges(): Record<string, EdgeEntry[]> {
  if (!edgeCache) {
    try {
      edgeCache = JSON.parse(fs.readFileSync(path.join(dataDir, 'interaction_edges.json'), 'utf8'))
    } catch {
      edgeCache = {}
    }
  }
  return edgeCache!
}

function tags(): Record<string, TagEntry[]> {
  if (!tagCache) {
    try {
      tagCache = JSON.parse(fs.readFileSync(path.join(dataDir, 'entity_risk_tags.json'), 'utf8'))
    } catch {
      tagCache = {}
    }
  }
  return tagCache!
}

function certainty(edge: EdgeEntry): SafetyCertainty {
  // Legacy interaction files were generated from shared mechanisms only.
  return edge.certainty || 'theoretical'
}

export function getAdditiveRisks(slug: string): MechanismRisk[] {
  const slugTags = tags()[slug] ?? []
  const slugEdges = edges()[slug] ?? []

  const additiveMechs = new Set(
    slugTags.filter(t => t.pair_behavior === 'additive').map(t => t.risk_mechanism),
  )
  if (additiveMechs.size === 0) return []

  const risks: MechanismRisk[] = []
  for (const mech of additiveMechs) {
    const mechEdges = slugEdges
      .filter(e => e.risk_mechanism === mech)
      .sort((a, b) => b.weight - a.weight)
    const withProvenance = mechEdges.filter((edge) => (edge.provenance?.source_ids?.length || 0) > 0).length

    risks.push({
      mechanism: mech,
      label: LABELS[mech]?.label ?? mech,
      severity: LABELS[mech]?.severity ?? 'moderate',
      certainties: [...new Set(mechEdges.map(certainty))],
      partnerCount: mechEdges.length,
      provenanceCoverage: {
        withProvenance,
        total: mechEdges.length,
      },
      topPartners: mechEdges.slice(0, 5).map(e => ({ slug: e.partner_slug, name: e.partner_name })),
    })
  }

  return risks.sort((a, b) => (a.severity === 'severe' ? 0 : 1) - (b.severity === 'severe' ? 0 : 1))
}
