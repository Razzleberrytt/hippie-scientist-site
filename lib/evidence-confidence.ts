import type { GraphNode } from '../src/types/graph'

export type EvidenceConfidence = {
  evidenceWeight: number // 0 to 1
  confidenceLabel: string
  humanEvidenceFlag: boolean
  evidenceExplanation: string
  downgradeReasons: string[]
}

export function getEvidenceConfidence(node: GraphNode): EvidenceConfidence {
  const tier = node.evidence_tier || 'Evidence-Limited'
  
  let evidenceWeight = 0.1
  let confidenceLabel = 'Evidence-Limited'
  let humanEvidenceFlag = false
  let evidenceExplanation = 'Limited or theoretical research signals available.'
  const downgradeReasons: string[] = []

  switch (tier) {
    case 'Strong Human Evidence':
      evidenceWeight = 0.95
      confidenceLabel = 'High Confidence'
      humanEvidenceFlag = true
      evidenceExplanation = 'Supported by robust human clinical trials, systematic reviews, or meta-analyses.'
      break
    case 'Moderate Human Evidence':
      evidenceWeight = 0.8
      confidenceLabel = 'Moderate Confidence'
      humanEvidenceFlag = true
      evidenceExplanation = 'Supported by human clinical trials showing consistent positive outcomes.'
      break
    case 'Limited Human Evidence':
    case 'Preliminary Evidence':
      evidenceWeight = 0.6
      confidenceLabel = 'Emerging Confidence'
      humanEvidenceFlag = true
      evidenceExplanation = 'Supported by early, preliminary, or mixed human clinical studies.'
      break
    case 'Mechanistic Evidence':
      evidenceWeight = 0.4
      confidenceLabel = 'Preclinical/Mechanistic'
      humanEvidenceFlag = false
      evidenceExplanation = 'Supported primarily by animal models, cell cultures, or biological plausibility models.'
      downgradeReasons.push('Lacks direct human clinical validation.')
      break
    case 'Traditional Use Context':
      evidenceWeight = 0.2
      confidenceLabel = 'Traditional Use'
      humanEvidenceFlag = false
      evidenceExplanation = 'Supported primarily by long-standing historical, ethnobotanical, or traditional medicine usage.'
      downgradeReasons.push('Lacks modern controlled clinical trial verification.')
      break
    default:
      evidenceWeight = 0.1
      confidenceLabel = 'Evidence-Limited'
      humanEvidenceFlag = false
      evidenceExplanation = 'No standardized or verifiable clinical literature base exists in the current registry.'
      downgradeReasons.push('No documented randomized controlled trials or verified mechanism reviews.')
      break
  }

  // Downgrade if marked as sparse profile
  if (node.sparse_profile) {
    evidenceWeight = Math.max(0.1, evidenceWeight - 0.2)
    downgradeReasons.push('Sparse data profile restricts comprehensive assessment.')
  }

  return {
    evidenceWeight: parseFloat(evidenceWeight.toFixed(2)),
    confidenceLabel,
    humanEvidenceFlag,
    evidenceExplanation,
    downgradeReasons,
  }
}
