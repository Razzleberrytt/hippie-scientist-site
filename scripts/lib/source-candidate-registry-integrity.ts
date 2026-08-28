export type DuplicateTargetAssessment = {
  hasExplicitTarget: boolean
  targetResolves: boolean
  metadataIssue: string | null
}

type CandidateWithDuplicateTarget = {
  duplicateOfSourceId?: string
}

type RegistrySource = {
  sourceId: string
}

export function assessExplicitDuplicateTarget(
  candidate: CandidateWithDuplicateTarget,
  registryById: ReadonlyMap<string, RegistrySource>,
): DuplicateTargetAssessment {
  const duplicateOfSourceId = String(candidate.duplicateOfSourceId ?? '').trim()
  if (!duplicateOfSourceId) {
    return { hasExplicitTarget: false, targetResolves: false, metadataIssue: null }
  }

  if (registryById.has(duplicateOfSourceId)) {
    return { hasExplicitTarget: true, targetResolves: true, metadataIssue: null }
  }

  return {
    hasExplicitTarget: true,
    targetResolves: false,
    metadataIssue: `duplicateOfSourceId=${duplicateOfSourceId} not found in source registry.`,
  }
}
