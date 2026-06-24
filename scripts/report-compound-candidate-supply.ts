import fs from 'node:fs'
import path from 'node:path'

type EntityType = 'herb' | 'compound'
type Workpack = { itemType: string; entitySlug: string | null; publicStatus: string; missingTopics: string[]; blockedReasons: string[] }
type GapItem = { itemType: string; entitySlug: string | null; topicType: string; sourceGapType: string; publishBlocking: boolean; safetyCritical: boolean }
type IntakeTask = { itemType: string; entitySlug: string | null; topicType: string; acquisitionTier: string }
type BalancingProfileResult = {
  profileId: string
  composition: { total: number; byType: Record<EntityType, number> }
}

type BalancingReport = {
  generatedAt: string
  profileResults: BalancingProfileResult[]
  balancingProfiles: Record<string, { targetSize: number; minByType: Partial<Record<EntityType, number>>; maxByType: Partial<Record<EntityType, number>> }>
}

type GovernedRow = { entityType: EntityType; entitySlug: string; researchEnrichment: { sourceRegistryIds?: string[]; mechanisms?: unknown[]; constituents?: unknown[]; interactions?: unknown[]; contraindications?: unknown[]; adverseEffects?: unknown[]; conflictNotes?: unknown[]; unsupportedOrUnclearUses?: unknown[] } }

type Manifest = { entities?: { compounds?: Array<{ slug: string }> } }
type SourceRegistryRow = { sourceId: string; active?: boolean }

const ROOT = process.cwd()
const PATHS = {
  workpacks: path.join(ROOT, 'ops', 'reports', 'enrichment-workpacks.json'),
  sourceGaps: path.join(ROOT, 'ops', 'reports', 'source-gaps.json'),
  intake: path.join(ROOT, 'ops', 'reports', 'source-intake-queue.json'),
  balancing: path.join(ROOT, 'ops', 'reports', 'enrichment-wave-target-balancing.json'),
  governed: path.join(ROOT, 'public', 'data', 'enrichment-governed.json'),
  manifest: path.join(ROOT, 'public', 'data', 'publication-manifest.json'),
  sourceRegistry: path.join(ROOT, 'public', 'data', 'source-registry.json'),
}
const OUTPUT_JSON = path.join(ROOT, 'ops', 'reports', 'compound-candidate-supply.json')
const OUTPUT_MD = path.join(ROOT, 'ops', 'reports', 'compound-candidate-supply.md')

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T
}

function normalizeSlug(value: string | null | undefined) {
  return String(value || '').trim().toLowerCase()
}

function writeJson(filePath: string, value: unknown) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

function run() {
  const workpacks = readJson<{ workpacks: Workpack[] }>(PATHS.workpacks).workpacks
  const sourceGaps = readJson<{ gapItems: GapItem[] }>(PATHS.sourceGaps).gapItems
  const intake = readJson<{ tasks: IntakeTask[] }>(PATHS.intake).tasks
  const balancing = readJson<BalancingReport>(PATHS.balancing)
  const governed = readJson<GovernedRow[]>(PATHS.governed)
  const manifest = readJson<Manifest>(PATHS.manifest)
  const sourceRegistry = readJson<SourceRegistryRow[]>(PATHS.sourceRegistry)

  const compoundWorkpacks = workpacks.filter(row => row.itemType === 'compound_page')
  const herbWorkpacks = workpacks.filter(row => row.itemType === 'herb_page')
  const compoundWorkpackSlugs = Array.from(new Set(compoundWorkpacks.map(row => normalizeSlug(row.entitySlug)).filter(Boolean))).sort()

  const compoundGaps = sourceGaps.filter(row => row.itemType === 'compound_page')
  const compoundIntake = intake.filter(row => row.itemType === 'compound_page')

  const indexableCompounds = (manifest.entities?.compounds || []).length
  const governedCompoundRows = governed.filter(row => row.entityType === 'compound')
  const governedCompoundSlugs = new Set(governedCompoundRows.map(row => normalizeSlug(row.entitySlug)))

  const activeRegistryIds = new Set(sourceRegistry.filter(row => row.active !== false).map(row => row.sourceId))
  const compoundRegistryCoverage = governedCompoundRows
    .map(row => {
      const activeSourceCount = (row.researchEnrichment.sourceRegistryIds || []).filter(sourceId => activeRegistryIds.has(sourceId)).length
      return { slug: normalizeSlug(row.entitySlug), activeSourceCount }
    })
    .sort((a, b) => a.slug.localeCompare(b.slug))

  const topicCoverage = governedCompoundRows.map(row => {
    const re = row.researchEnrichment
    return {
      slug: normalizeSlug(row.entitySlug),
      safetySignals: (re.interactions?.length || 0) + (re.contraindications?.length || 0) + (re.adverseEffects?.length || 0),
      mechanismSignals: (re.mechanisms?.length || 0) + (re.constituents?.length || 0),
      conflictSignals: (re.conflictNotes?.length || 0) + (re.unsupportedOrUnclearUses?.length || 0),
    }
  })

  const blockerReport = {
    tooFewIndexablePublicCompounds: {
      indexableCompounds,
      governedCompounds: governedCompoundRows.length,
      blocker: indexableCompounds === 0,
    },
    missingCompoundWorkpacks: {
      compoundWorkpacks: compoundWorkpacks.length,
      herbWorkpacks: herbWorkpacks.length,
      blocker: compoundWorkpacks.length < 5,
    },
    sourceGapDetectionForCompounds: {
      compoundGapItems: compoundGaps.length,
      compoundSafetyGaps: compoundGaps.filter(row => row.topicType === 'safety').length,
      compoundMechanismConstituentGaps: compoundGaps.filter(row => row.topicType === 'mechanism' || row.topicType === 'constituent').length,
      blocker: compoundGaps.length < compoundWorkpacks.length,
    },
    sourceRegistryCoverageForCompounds: {
      compoundRegistryCoverage,
      compoundsWithZeroActiveSources: compoundRegistryCoverage.filter(row => row.activeSourceCount === 0).map(row => row.slug),
      blocker: compoundRegistryCoverage.some(row => row.activeSourceCount === 0),
    },
    weakCompoundTopicCoverage: {
      compoundsMissingSafetySignals: topicCoverage.filter(row => row.safetySignals === 0).map(row => row.slug),
      compoundsMissingMechanismSignals: topicCoverage.filter(row => row.mechanismSignals === 0).map(row => row.slug),
      compoundsMissingConflictSignals: topicCoverage.filter(row => row.conflictSignals === 0).map(row => row.slug),
      blocker: topicCoverage.some(row => row.safetySignals === 0 || row.mechanismSignals === 0 || row.conflictSignals === 0),
    },
    upstreamSelectionBias: {
      profileFill: balancing.profileResults.map(result => {
        const profileConfig = balancing.balancingProfiles[result.profileId]
        const minCompound = profileConfig?.minByType?.compound ?? 0
        return {
          profileId: result.profileId,
          selectedTotal: result.composition.total,
          targetSize: profileConfig?.targetSize ?? result.composition.total,
          selectedCompounds: result.composition.byType.compound || 0,
          minCompoundsRequired: minCompound,
          compoundUnderfill: Math.max(0, minCompound - (result.composition.byType.compound || 0)),
        }
      }),
    },
  }

  const legacyCompoundPool = Array.from(governedCompoundSlugs).length
  const expandedCompoundPool = compoundWorkpackSlugs.length
  const herbPool = herbWorkpacks.length

  const profileFillImprovement = balancing.profileResults.map(result => {
    const profileConfig = balancing.balancingProfiles[result.profileId]
    const targetSize = profileConfig?.targetSize ?? result.composition.total
    const maxHerb = profileConfig?.maxByType?.herb ?? targetSize
    const maxCompound = profileConfig?.maxByType?.compound ?? targetSize

    const legacyMaxFill = Math.min(targetSize, Math.min(herbPool, maxHerb) + Math.min(legacyCompoundPool, maxCompound))
    const expandedMaxFill = Math.min(targetSize, Math.min(herbPool, maxHerb) + Math.min(expandedCompoundPool, maxCompound))

    return {
      profileId: result.profileId,
      selectedNow: result.composition.total,
      selectedCompoundsNow: result.composition.byType.compound || 0,
      legacyMaxFill,
      expandedMaxFill,
      projectedFillDelta: Math.max(0, expandedMaxFill - legacyMaxFill),
    }
  })

  const surfacedItems = {
    workpacks: {
      totalCompoundWorkpacks: compoundWorkpacks.length,
      compoundWorkpackSlugs,
    },
    sourceGaps: {
      totalCompoundGapItems: compoundGaps.length,
      publishBlockingCount: compoundGaps.filter(row => row.publishBlocking).length,
      safetyCriticalCount: compoundGaps.filter(row => row.safetyCritical).length,
    },
    sourceIntake: {
      totalCompoundIntakeTasks: compoundIntake.length,
      mustHavePublishBlocking: compoundIntake.filter(row => row.acquisitionTier === 'must_have_publish_blocking').length,
      highValueStrengthening: compoundIntake.filter(row => row.acquisitionTier === 'high_value_strengthening').length,
    },
  }

  const report = {
    generatedAt: new Date().toISOString(),
    deterministicModelVersion: 'compound-candidate-supply-v1',
    sources: Object.fromEntries(Object.entries(PATHS).map(([key, value]) => [key, path.relative(ROOT, value)])),
    blockerReport,
    surfacedItems,
    candidatePool: {
      legacyGovernedCompoundPool: legacyCompoundPool,
      expandedCompoundWorkpackPool: expandedCompoundPool,
      newlyEligibleCompoundEntities: compoundWorkpackSlugs.filter(slug => !governedCompoundSlugs.has(slug)),
    },
    profileFillImprovement,
  }

  writeJson(OUTPUT_JSON, report)

  const md = [
    '# Compound Candidate Supply Report',
    '',
    `- Generated at: ${report.generatedAt}`,
    `- Deterministic model version: ${report.deterministicModelVersion}`,
    '',
    '## Blocker summary',
    `- Indexable compounds: ${indexableCompounds}`,
    `- Compound workpacks: ${compoundWorkpacks.length} (herb workpacks: ${herbWorkpacks.length})`,
    `- Compound source gaps: ${compoundGaps.length}`,
    `- Compound intake tasks: ${compoundIntake.length}`,
    '',
    '## Newly eligible compound entities',
    ...(report.candidatePool.newlyEligibleCompoundEntities.length > 0
      ? report.candidatePool.newlyEligibleCompoundEntities.map(slug => `- ${slug}`)
      : ['- none']),
    '',
    '## Profile fill improvement projection',
    '| profile | selectedNow | legacyMaxFill | expandedMaxFill | projectedFillDelta |',
    '| --- | ---: | ---: | ---: | ---: |',
    ...profileFillImprovement.map(
      row => `| ${row.profileId} | ${row.selectedNow} | ${row.legacyMaxFill} | ${row.expandedMaxFill} | ${row.projectedFillDelta} |`,
    ),
  ]

  fs.writeFileSync(OUTPUT_MD, `${md.join('\n')}\n`, 'utf8')

  console.log(`Wrote ${path.relative(ROOT, OUTPUT_JSON)}`)
  console.log(`Wrote ${path.relative(ROOT, OUTPUT_MD)}`)
}

run()
