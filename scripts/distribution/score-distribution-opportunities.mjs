#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const inputPath = path.resolve(process.argv[2] || 'data/distribution/research-objects.json')
const outputPath = path.resolve(process.argv[3] || 'artifacts/distribution/opportunities.json')

function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')) }
function clamp(value, min = 0, max = 10) { return Math.max(min, Math.min(max, value)) }
function daysSince(date) {
  const parsed = Date.parse(`${date}T00:00:00Z`)
  if (!Number.isFinite(parsed)) return 0
  return Math.floor((Date.now() - parsed) / 86400000)
}

const evidenceStrength = { A: 10, B: 8, C: 6, D: 3, 'Avoid/Insufficient': 0 }
const formatCost = { carousel: 2, infographic: 2, 'vertical-video': 4 }

export function scoreResearchObject(object) {
  const tags = Array.isArray(object.tags) ? object.tags.map((tag) => String(tag).toLowerCase()) : []
  const evidence = evidenceStrength[object.evidenceGrade] ?? 0
  const freshnessDays = daysSince(object.lastVerified)
  const verificationDateValid = freshnessDays >= 0
  const freshness = verificationDateValid ? (freshnessDays <= 30 ? 10 : freshnessDays <= 90 ? 8 : freshnessDays <= 180 ? 5 : 2) : 0
  const humanEvidence = tags.includes('human-evidence') || /human|randomized|meta-analysis/i.test(`${object.evidenceType} ${object.title}`)
  const socialSuitability = clamp(5 + (humanEvidence ? 2 : 0) + (tags.length >= 3 ? 1 : 0) + (String(object.finding || '').length <= 360 ? 1 : 0))
  const informationUniqueness = clamp(5 + (object.formulationContext ? 1 : 0) + (object.populationContext ? 1 : 0) + (object.doseContext ? 1 : 0))
  const claimRisk = clamp((evidence <= 3 ? 5 : 1) + (humanEvidence ? 0 : 3) + ((object.safetyWarnings?.length || 0) > 0 ? 1 : 0))
  const sourceEligible = /^https:\/\/thehippiescientist\.net\/(herbs|compounds|guides)\//.test(String(object.sourceUrl || ''))

  const formats = ['carousel', 'infographic', 'vertical-video'].map((format) => {
    const platformFit = format === 'vertical-video' ? socialSuitability : clamp(socialSuitability + (informationUniqueness >= 7 ? 1 : 0))
    const productionCost = formatCost[format]
    const score = sourceEligible && verificationDateValid
      ? Math.round(3 * evidence + 2 * freshness + 2 * socialSuitability + 2 * informationUniqueness + 2 * platformFit - productionCost - 2 * claimRisk)
      : 0
    return { format, score, platformFit, productionCost }
  }).sort((a, b) => b.score - a.score || a.format.localeCompare(b.format))

  return {
    id: object.id,
    title: object.title,
    destinationUrl: object.sourceUrl,
    eligible: sourceEligible && evidence > 0 && verificationDateValid,
    evidenceGrade: object.evidenceGrade,
    lastVerified: object.lastVerified,
    signals: { evidenceStrength: evidence, freshness, freshnessDays, socialSuitability, informationUniqueness, claimRisk },
    recommendedFormat: formats[0].format,
    score: formats[0].score,
    formats,
    angle: object.finding,
    guardrail: object.limitation,
    successCriteria: {
      primary: 'qualified visits to canonical evidence page',
      secondary: ['asset completion/engagement rate', 'saves/shares', 'tracked destination clicks'],
      scientific: '0 unsupported or strengthened factual claims',
      attribution: 'campaign/UTM identity required before publication',
    },
  }
}

const objects = readJson(inputPath)
if (!Array.isArray(objects)) throw new Error('research objects input must be an array')
const opportunities = objects.map(scoreResearchObject)
  .filter((item) => item.eligible)
  .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))

fs.mkdirSync(path.dirname(outputPath), { recursive: true })
fs.writeFileSync(outputPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), input: path.relative(root, inputPath), count: opportunities.length, opportunities }, null, 2)}\n`)
console.log(`[distribution-opportunity] scored ${opportunities.length} eligible governed object(s); top=${opportunities[0]?.id || 'none'} format=${opportunities[0]?.recommendedFormat || 'none'} score=${opportunities[0]?.score ?? 0}`)
