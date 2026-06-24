import fs from 'node:fs'
import path from 'node:path'

type Target = {
  entityType: 'herb' | 'compound'
  entitySlug: string
  selectionWhy: string
  highestPriorityMissingTopics: string[]
  criticality: string[]
}

type TargetReport = {
  generatedAt: string
  targets: Target[]
}

type Candidate = {
  candidateSourceId: string
  intakeTaskId: string
  sourceClass: string
  sourceType: string
  relatedEntities: Array<{ entityType: 'herb' | 'compound'; entitySlug: string }>
  relatedTopicGaps: string[]
}

type CandidateReport = {
  generatedAt: string
  candidates: Candidate[]
}

type SourceIntakeQueue = {
  tasks: Array<{
    itemType: string
    entitySlug: string | null
    topicType: string
    sourceGapType: string
    safetyCritical: boolean
    publishBlocking: boolean
  }>
}

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T
}

function toEntityKey(entityType: 'herb' | 'compound', entitySlug: string): string {
  return `${entityType}:${entitySlug}`
}

function run() {
  const root = process.cwd()
  const waveId = process.env.ENRICHMENT_WAVE_ID || 'wave-2'
  const safeWaveId = waveId.replace(/[^a-z0-9-]+/gi, '-').toLowerCase()
  const targetsPath = process.env.ENRICHMENT_WAVE_TARGETS_PATH || path.join(root, 'ops', 'reports', `source-${safeWaveId}-targets.json`)
  const candidatesPath = process.env.ENRICHMENT_WAVE_CANDIDATES_PATH || path.join(root, 'ops', 'reports', `source-${safeWaveId}-candidates.json`)
  const intakePath = path.join(root, 'ops', 'reports', 'source-intake-queue.json')
  const outPath = process.env.ENRICHMENT_WAVE_SOURCE_SUMMARY_PATH || path.join(root, 'ops', 'reports', `source-${safeWaveId}-summary.md`)

  const targets = readJson<TargetReport>(targetsPath)
  const candidates = readJson<CandidateReport>(candidatesPath)
  const intake = readJson<SourceIntakeQueue>(intakePath)

  const selectedKeys = new Set(targets.targets.map(target => toEntityKey(target.entityType, target.entitySlug)))

  const candidateCountByClass = new Map<string, number>()
  const candidateCountByEntity = new Map<string, number>()
  const topicCoverageByEntity = new Map<string, Set<string>>()

  for (const candidate of candidates.candidates) {
    candidateCountByClass.set(candidate.sourceClass, (candidateCountByClass.get(candidate.sourceClass) || 0) + 1)
    for (const related of candidate.relatedEntities) {
      const key = toEntityKey(related.entityType, related.entitySlug)
      candidateCountByEntity.set(key, (candidateCountByEntity.get(key) || 0) + 1)
      const topics = topicCoverageByEntity.get(key) || new Set<string>()
      for (const topic of candidate.relatedTopicGaps) topics.add(topic)
      topicCoverageByEntity.set(key, topics)
    }
  }

  const unresolved = new Map<string, string[]>()
  const safetyUnresolved = new Map<string, string[]>()
  for (const task of intake.tasks) {
    if (!task.entitySlug) continue
    const entityType = task.itemType === 'compound_page' ? 'compound' : task.itemType === 'herb_page' ? 'herb' : null
    if (!entityType) continue
    const key = toEntityKey(entityType, task.entitySlug)
    if (!selectedKeys.has(key)) continue

    const coveredTopics = topicCoverageByEntity.get(key) || new Set<string>()
    if (!coveredTopics.has(task.topicType)) {
      const list = unresolved.get(key) || []
      if (!list.includes(task.topicType)) list.push(task.topicType)
      unresolved.set(key, list)
      if (task.safetyCritical || task.topicType === 'safety') {
        const safetyList = safetyUnresolved.get(key) || []
        if (!safetyList.includes(task.topicType)) safetyList.push(task.topicType)
        safetyUnresolved.set(key, safetyList)
      }
    }
  }

  const lines: string[] = []
  lines.push(`# Source ${waveId} Summary`)
  lines.push('')
  lines.push(`Generated at: ${targets.generatedAt}`)
  lines.push(`Selected entities: ${targets.targets.length}`)
  lines.push(`Candidate sources prepared: ${candidates.candidates.length}`)
  lines.push('')
  lines.push('## Source classes represented')
  for (const [sourceClass, count] of Array.from(candidateCountByClass.entries()).sort((a, b) => b[1] - a[1])) {
    lines.push(`- ${sourceClass}: ${count}`)
  }
  lines.push('')
  lines.push('## Candidate counts by entity')
  for (const target of targets.targets) {
    const key = toEntityKey(target.entityType, target.entitySlug)
    lines.push(`- ${key}: ${candidateCountByEntity.get(key) || 0}`)
  }
  lines.push('')
  lines.push(`## Unresolved high-priority gaps after ${waveId} intake prep`)
  for (const target of targets.targets) {
    const key = toEntityKey(target.entityType, target.entitySlug)
    const gaps = unresolved.get(key) || []
    lines.push(`- ${key}: ${gaps.length > 0 ? gaps.join(', ') : 'none currently unresolved in selected intake topics'}`)
  }
  lines.push('')
  lines.push('## Safety-critical unresolved gaps')
  if (safetyUnresolved.size === 0) {
    lines.push('- none')
  } else {
    for (const [key, topics] of Array.from(safetyUnresolved.entries()).sort()) {
      lines.push(`- ${key}: ${topics.join(', ')}`)
    }
  }

  fs.writeFileSync(outPath, `${lines.join('\n')}\n`)
  console.log(`Wrote ${outPath}`)
}

run()
