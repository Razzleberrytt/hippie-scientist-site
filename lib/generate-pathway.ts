// Dynamic PathwayDiagramData generator.
// Builds a 4–5 node diagram from the mechanism fields already present in every
// herb and compound runtime record. Returns null when there is insufficient data
// so callers can skip rendering gracefully.

import type { PathwayDiagramData, PathwayNode, PathwayEdge } from './pathway-data'
import { formatDisplayLabel, list } from './display-utils'

// ─── Label maps ───────────────────────────────────────────────────────────────

const TARGET_SYSTEM_DISPLAY: Record<string, { label: string; sublabel: string }> = {
  'nervous-system':       { label: 'Nervous System',    sublabel: 'Neural signaling'   },
  'nervous system':       { label: 'Nervous System',    sublabel: 'Neural signaling'   },
  'immune-system':        { label: 'Immune System',     sublabel: 'Immune pathways'    },
  'immune/inflammatory':  { label: 'Immune + Inflam.',  sublabel: 'Cytokine pathways'  },
  'endocrine':            { label: 'Endocrine System',  sublabel: 'Hormonal signaling' },
  'stress/neuroendocrine':{ label: 'Stress Axis (HPA)', sublabel: 'Cortisol axis'      },
  'cardiovascular':       { label: 'Cardiovascular',    sublabel: 'Blood / vessels'    },
  'digestive':            { label: 'Digestive Tract',   sublabel: 'GI function'        },
  'gastrointestinal':     { label: 'GI Tract',          sublabel: 'Digestive support'  },
  'musculoskeletal':      { label: 'Muscle / Skeletal', sublabel: 'Physical recovery'  },
  'antioxidant':          { label: 'Oxidative Defense', sublabel: 'Free radical ctrl.' },
  'metabolic':            { label: 'Metabolic System',  sublabel: 'Cellular energy'    },
  'liver/detox':          { label: 'Liver / Detox',     sublabel: 'Detoxification'     },
  'mitochondrial':        { label: 'Mitochondria',      sublabel: 'Energy production'  },
}

const EFFECT_DISPLAY: Record<string, { label: string; sublabel: string }> = {
  sleep:        { label: 'Sleep Quality ↑',  sublabel: 'Onset + depth'      },
  stress:       { label: 'Stress Relief',    sublabel: 'Reduced cortisol'   },
  focus:        { label: 'Focus + Alertness',sublabel: 'Sustained attention'},
  memory:       { label: 'Memory + Learning',sublabel: 'Cognitive support'  },
  energy:       { label: 'Energy Levels ↑',  sublabel: 'Reduced fatigue'    },
  mood:         { label: 'Mood Support',     sublabel: 'Emotional balance'  },
  inflammation: { label: '↓ Inflammation',   sublabel: 'Systemic relief'    },
  immune:       { label: 'Immune Defense',   sublabel: 'Pathogen resistance'},
  pain:         { label: 'Pain Relief',      sublabel: 'Analgesic effect'   },
  anxiety:      { label: 'Anxiety Relief',   sublabel: 'Calming effect'     },
  recovery:     { label: 'Recovery Speed ↑', sublabel: 'Repair support'     },
  digestion:    { label: 'Digestive Health', sublabel: 'GI comfort'         },
  cognitive:    { label: 'Cognitive Health', sublabel: 'Mental performance' },
  antioxidant:  { label: 'Antioxidant Efct', sublabel: 'Cell protection'    },
  longevity:    { label: 'Longevity Support',sublabel: 'Healthy aging'      },
  weight:       { label: 'Weight Mgmt.',     sublabel: 'Metabolic support'  },
  hormonal:     { label: 'Hormone Balance',  sublabel: 'Endocrine support'  },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function splitLabel(raw: string): { label: string; sublabel?: string } {
  const s = raw.trim()
  if (s.length <= 17) return { label: s }
  const words = s.split(/\s+/)
  if (words.length < 2) return { label: s.slice(0, 17), sublabel: s.slice(17) || undefined }
  const cut = Math.ceil(words.length / 2)
  return { label: words.slice(0, cut).join(' '), sublabel: words.slice(cut).join(' ') }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export type GeneratorRecord = {
  slug?: unknown
  name?: unknown
  canonical_mechanisms?: unknown
  mechanisms?: unknown
  mechanism_target_systems?: unknown
  primary_effects?: unknown
  effects?: unknown
}

export function generatePathwayDiagram(record: GeneratorRecord): PathwayDiagramData | null {
  const slug = String(record.slug ?? '')
  const rawName = String(record.name ?? slug)
  const name = formatDisplayLabel(rawName) || rawName

  // ── Gather mechanism data ────────────────────────────────────────────────────
  // Keep canonical mechanism labels as-is (already properly cased)
  const canonicalMechs = list(record.canonical_mechanisms)
    .map((m) => String(m).trim())
    .filter(Boolean)

  const rawMechs = list(record.mechanisms)
    .map((m) => String(m).trim())
    .filter(Boolean)

  const mechList = canonicalMechs.length > 0 ? canonicalMechs : rawMechs

  const targetSystemsRaw = list(record.mechanism_target_systems)
    .map((s) => s.toLowerCase().trim())
    .filter(Boolean)

  const effectsRaw = list(record.primary_effects ?? record.effects)
    .map((e) => e.toLowerCase().trim())
    .filter(Boolean)

  // Need at least one mechanism or target system to build a meaningful diagram
  if (mechList.length === 0 && targetSystemsRaw.length === 0) return null

  // ── Resolve target node ──────────────────────────────────────────────────────
  const targetSystemKey = targetSystemsRaw[0] ?? ''
  const targetDisplay = TARGET_SYSTEM_DISPLAY[targetSystemKey]
  const targetLabel = targetDisplay?.label ?? formatDisplayLabel(targetSystemKey) ?? 'Biological Target'
  const targetSublabel = targetDisplay?.sublabel ?? 'Biological pathway'

  // ── Resolve mechanism node ───────────────────────────────────────────────────
  const primaryMech = mechList[0] ?? 'Physiological effect'
  const { label: mechLabel, sublabel: mechSublabel } = splitLabel(primaryMech)

  // ── Resolve effect node ──────────────────────────────────────────────────────
  const effectKey = effectsRaw[0] ?? ''
  const effectDisplay = EFFECT_DISPLAY[effectKey]
  const effectLabel = effectDisplay?.label ?? (effectKey ? formatDisplayLabel(effectKey) : 'Observed Effect')
  const effectSublabel = effectDisplay?.sublabel ?? 'Observable outcome'

  // ── Name node sublabel (dose / extract hint if available) ────────────────────
  const nameNode: PathwayNode = {
    id: 'c',
    label: name,
    role: 'compound',
    col: 0,
    row: 0,
  }

  const nodes: PathwayNode[] = [
    nameNode,
    { id: 't', label: targetLabel, sublabel: targetSublabel,  role: 'target',    col: 1, row: 0 },
    { id: 'm', label: mechLabel,   sublabel: mechSublabel,    role: 'mechanism', col: 2, row: 0 },
    { id: 'e', label: effectLabel, sublabel: effectSublabel,  role: 'effect',    col: 3, row: 0 },
  ]

  const edges: PathwayEdge[] = [
    { from: 'c', to: 't' },
    { from: 't', to: 'm' },
    { from: 'm', to: 'e' },
  ]

  // ── Optional second mechanism row ────────────────────────────────────────────
  const secondMech = mechList[1]
  if (secondMech && secondMech !== primaryMech) {
    const { label: m2Label, sublabel: m2Sub } = splitLabel(secondMech)
    nodes.push({
      id: 'm2',
      label: m2Label,
      sublabel: m2Sub ?? 'Parallel pathway',
      role: 'mechanism',
      col: 2,
      row: 1,
    })
    edges.push({ from: 't', to: 'm2' })
  }

  const effectLabelLc = effectLabel.toLowerCase().replace(/[↑↓]/g, '').trim()
  const summary =
    `${name} acts on ${targetLabel.toLowerCase()} pathways via ` +
    `${mechLabel.toLowerCase()}${mechSublabel ? ` (${mechSublabel.toLowerCase()})` : ''}, ` +
    `leading to ${effectLabelLc}.`

  return {
    id: `${slug}-mechanism`,
    title: `How ${name} Works`,
    summary,
    nodes,
    edges,
  }
}
