import fs from 'node:fs'
import path from 'node:path'

type Target = {entityType:'herb'|'compound';entitySlug:string;waveStatus:string;selectionWhy:string;highestPriorityMissingTopics:string[];criticality:string[];currentGovernedCoverageStatus:string}

const ROOT=process.cwd()
const p=(...s:string[])=>path.join(ROOT,...s)
const read=<T,>(f:string)=>JSON.parse(fs.readFileSync(f,'utf8')) as T

const targets=read<{generatedAt:string;targets:Target[]}>(p('ops/reports/enrichment-wave-2-targets.json'))
const sourceReview=read<any>(p('ops/reports/source-wave-2-review.json'))
const authoring=read<any>(p('ops/reports/enrichment-wave-2-authoring.json'))
const rollup=read<any>(p('ops/reports/enrichment-wave-2-rollup.json'))
const discovery=read<any>(p('ops/reports/enrichment-discovery-summary.json'))

const beforeByEntity = new Map((rollup.entitySnapshots?.beforeWave||[]).map((r:any)=>[`${r.entityType}:${r.entitySlug}`,r]))
const afterByEntity = new Map((rollup.entitySnapshots?.afterWave||[]).map((r:any)=>[`${r.entityType}:${r.entitySlug}`,r]))

const deltas = targets.targets.map(t=>{
  const k=`${t.entityType}:${t.entitySlug}`
  const b=beforeByEntity.get(k)?.summary
  const a=afterByEntity.get(k)?.summary
  return {
    entityType:t.entityType,entitySlug:t.entitySlug,waveStatus:t.waveStatus,
    beforeGovernedEntries:b?.governedEntriesIncluded||0,
    afterGovernedEntries:a?.governedEntriesIncluded||0,
    deltaGovernedEntries:(a?.governedEntriesIncluded||0)-(b?.governedEntriesIncluded||0),
    beforeTopicCoverage:b?.topicCoverage||{evidence:0,safety:0,mechanism:0,constituent:0},
    afterTopicCoverage:a?.topicCoverage||{evidence:0,safety:0,mechanism:0,constituent:0},
  }
})

const report={
  generatedAt:new Date().toISOString(),
  deterministicModelVersion:'enrichment-wave-2-summary-v1',
  selectedTargets:targets.targets,
  sourceCycle:{
    reviewedCandidates:sourceReview.summary.reviewedCandidateCount,
    approvedNewSources:sourceReview.summary.approvedCount,
    promotedToRegistry:sourceReview.summary.promotedCount,
    byClass:sourceReview.summary.sourceCountsByClass,
  },
  enrichmentCycle:{
    wave2SubmissionCount:Object.values(authoring.entryCounts.byEntity||{}).reduce((a:number,b:any)=>a+Number(b||0),0),
    wave2PromotedCount:authoring.submissionOutcomes.promoted,
    wave2BlockedCount:authoring.submissionOutcomes.blocked,
    byTopicType:authoring.entryCounts.byTopicType,
  },
  coverageDeltas:deltas,
  unresolvedCriticalGapsAfterWave2:authoring.unresolvedCriticalGaps,
  strengthenedPublicSurfaces:{
    discoveryPublishableCount:discovery.summary?.publishableCount||0,
    rollupSurfaceCoverage:rollup.publicSurfaceCoverage||[],
  },
}

const outJson=p('ops/reports/enrichment-wave-2.json')
const outMd=p('ops/reports/enrichment-wave-2.md')
fs.writeFileSync(outJson,JSON.stringify(report,null,2)+'\n')

const md=[
  '# Enrichment Wave 2',
  '',
  `Generated: ${report.generatedAt}`,
  '',
  '## Selected targets',
  ...targets.targets.map(t=>`- ${t.entityType}:${t.entitySlug} (${t.waveStatus}) — ${t.selectionWhy}`),
  '',
  '## Source cycle',
  `- Reviewed candidates: ${report.sourceCycle.reviewedCandidates}`,
  `- Approved new sources: ${report.sourceCycle.approvedNewSources}`,
  `- Promoted to registry: ${report.sourceCycle.promotedToRegistry}`,
  '',
  '## Enrichment cycle',
  `- Wave-2 submissions: ${report.enrichmentCycle.wave2SubmissionCount}`,
  `- Approved/promoted entries: ${report.enrichmentCycle.wave2PromotedCount}`,
  `- Blocked entries: ${report.enrichmentCycle.wave2BlockedCount}`,
  '',
  '## Coverage deltas by target',
  ...deltas.map(d=>`- ${d.entityType}:${d.entitySlug} entries ${d.beforeGovernedEntries} -> ${d.afterGovernedEntries} (delta ${d.deltaGovernedEntries})`),
  '',
  '## Unresolved critical gaps',
  ...report.unresolvedCriticalGapsAfterWave2.map((r:any)=>`- ${r.entityType}:${r.entitySlug}: ${r.unresolvedCriticalTopics.join(', ') || 'none'}`),
]
fs.writeFileSync(outMd,md.join('\n')+'\n')
console.log(`Wrote ${path.relative(ROOT,outJson)}`)
console.log(`Wrote ${path.relative(ROOT,outMd)}`)
