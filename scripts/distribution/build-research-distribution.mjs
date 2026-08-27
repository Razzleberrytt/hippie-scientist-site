#!/usr/bin/env node
/**
 * One source of truth -> many review-only distribution formats.
 *
 * Nothing is auto-posted. Every channel inherits the same finding, evidence
 * class, grade, limitation, verification date and destination evidence URL.
 */
import fs from 'node:fs'
import path from 'node:path'
import { buildCreativeSpec } from './creative-spec.mjs'

const root = process.cwd()
const inputPath = path.resolve(process.argv[2] || 'data/distribution/research-objects.json')
const seriesPath = path.join(root, 'data/distribution/research-series.json')
const outDir = path.resolve(process.env.DISTRIBUTION_OUTPUT || 'artifacts/distribution')
const siteRoot = 'https://thehippiescientist.net/'

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return fallback }
}
function clean(value) { return String(value ?? '').trim().replace(/\s+/g, ' ') }
function sentence(value) {
  const text = clean(value)
  return /[.!?]$/.test(text) ? text : `${text}.`
}
function validate(object, index) {
  const errors = []
  const required = ['id','title','finding','evidenceType','evidenceGrade','limitation','sourceUrl','lastVerified']
  for (const field of required) if (!clean(object[field])) errors.push(`[${index}] ${field} is required`)
  if (object.sourceUrl === siteRoot || object.sourceUrl === siteRoot.slice(0, -1)) errors.push(`[${index}] sourceUrl must be the corresponding evidence page, never the homepage`)
  if (object.sourceUrl && !String(object.sourceUrl).startsWith(siteRoot)) errors.push(`[${index}] sourceUrl must be a Hippie Scientist source page`)
  if (object.lastVerified && !/^\d{4}-\d{2}-\d{2}$/.test(String(object.lastVerified))) errors.push(`[${index}] lastVerified must be YYYY-MM-DD`)
  if (!['A','B','C','D','Avoid/Insufficient'].includes(String(object.evidenceGrade))) errors.push(`[${index}] invalid evidenceGrade`)
  return errors
}
function truncate(text, max) {
  const value = clean(text)
  if (value.length <= max) return value
  return `${value.slice(0, Math.max(0, max - 1)).replace(/\s+\S*$/, '')}…`
}
function core(o) {
  const numeric = [
    Number.isInteger(o.trialCount) ? `${o.trialCount} human trial${o.trialCount === 1 ? '' : 's'}` : '',
    Number.isInteger(o.participants) ? `~${o.participants.toLocaleString()} participants` : '',
  ].filter(Boolean).join(', ')
  return {
    finding: sentence(o.finding),
    evidence: `Evidence: ${clean(o.evidenceType)} · grade ${clean(o.evidenceGrade)}${numeric ? ` · ${numeric}` : ''}.`,
    limitation: `Key limitation: ${sentence(o.limitation)}`,
    dose: o.doseContext ? `Dose/form context: ${sentence(o.doseContext)}` : '',
    population: o.populationContext ? `Population context: ${sentence(o.populationContext)}` : '',
    destination: clean(o.sourceUrl),
  }
}
function buildChannels(o, seriesById) {
  const c = core(o)
  const series = seriesById.get(o.series)?.name || 'What the evidence actually says'
  const xBody = `${o.title}: ${c.finding} ${c.evidence} ${c.limitation} ${c.destination}`
  const caption = `${o.title}\n\n${c.finding}\n\n${c.evidence}\n${c.limitation}${c.dose ? `\n${c.dose}` : ''}\n\nRead the evidence page: ${c.destination}`
  const video = [
    `HOOK: ${truncate(o.title, 90)}`,
    `FINDING: ${c.finding}`,
    `EVIDENCE ON SCREEN: ${c.evidence}`,
    `CAVEAT: ${c.limitation}`,
    c.dose ? `CONTEXT: ${c.dose}` : '',
    c.population ? `CONTEXT: ${c.population}` : '',
    `CTA: Full evidence and sources: ${c.destination}`,
  ].filter(Boolean).join('\n')
  return {
    sharedFacts: {
      id: o.id,
      series,
      title: clean(o.title),
      finding: c.finding,
      evidenceType: o.evidenceType,
      evidenceGrade: o.evidenceGrade,
      limitation: clean(o.limitation),
      trialCount: Number.isInteger(o.trialCount) ? o.trialCount : null,
      participants: Number.isInteger(o.participants) ? o.participants : null,
      doseContext: clean(o.doseContext),
      populationContext: clean(o.populationContext),
      sourceUrl: c.destination,
      primarySourceUrl: clean(o.primarySourceUrl),
      lastVerified: o.lastVerified,
      tags: Array.isArray(o.tags) ? o.tags : [],
    },
    x: truncate(xBody, 280),
    instagram: caption,
    shortVideo: video,
    youtubeShort: video,
    reddit: {
      guidance: 'Contribute only where the finding directly answers the community discussion and community rules permit it. Do not astroturf, mass-post, or hide affiliation.',
      draft: `${c.finding}\n\n${c.evidence} ${c.limitation}\n\nSource trail and methodology: ${c.destination}`,
    },
    email: {
      subjectIdea: truncate(o.title, 70),
      section: `${c.finding}\n\n${c.evidence} ${c.limitation}${c.dose ? ` ${c.dose}` : ''}\n\nRead the full evidence page: ${c.destination}`,
    },
    articleBrief: {
      headline: o.title,
      directAnswer: `${c.finding} ${c.evidence}`,
      requiredSections: ['Direct answer', 'What the human evidence shows', 'Important limitations', 'Dose/form context', 'Safety context', 'Primary sources'],
      canonicalEvidencePage: c.destination,
      publishOnlyIf: 'The article adds substantial search-intent value beyond the source evidence page and all claims remain traceable to the canonical research object.',
    },
  }
}

const objects = readJson(inputPath, [])
const series = readJson(seriesPath, [])
if (!Array.isArray(objects)) throw new Error('research objects input must be an array')
const errors = objects.flatMap(validate)
if (errors.length) {
  console.error(`[distribution] ${errors.length} validation error(s):`)
  errors.forEach((error) => console.error(`[distribution]   ${error}`))
  process.exit(1)
}

const seriesById = new Map((Array.isArray(series) ? series : []).map((item) => [item.id, item]))
fs.mkdirSync(outDir, { recursive: true })
const manifest = []

for (const object of objects) {
  const packageData = {
    generatedAt: new Date().toISOString(),
    status: 'review-required',
    rule: 'All channel variants inherit facts from sharedFacts. Edit the canonical research object, then regenerate; do not manually fork scientific facts across channels.',
    ...buildChannels(object, seriesById),
    creativeSpec: buildCreativeSpec(object),
  }
  const jsonPath = path.join(outDir, `${object.id}.json`)
  fs.writeFileSync(jsonPath, `${JSON.stringify(packageData, null, 2)}\n`)
  const md = `# ${object.title}\n\n**Status:** review required  \n**Series:** ${packageData.sharedFacts.series}  \n**Source:** ${object.sourceUrl}\n\n## X\n\n${packageData.x}\n\n## Instagram\n\n${packageData.instagram}\n\n## Short video / YouTube Short\n\n${packageData.shortVideo}\n\n## Reddit contribution draft\n\n${packageData.reddit.guidance}\n\n${packageData.reddit.draft}\n\n## Email section\n\n${packageData.email.section}\n\n## Article brief\n\n${packageData.articleBrief.directAnswer}\n` 
  fs.writeFileSync(path.join(outDir, `${object.id}.md`), md)
  manifest.push({ id: object.id, sourceUrl: object.sourceUrl, json: `${object.id}.json`, markdown: `${object.id}.md`, status: 'review-required' })
}

fs.writeFileSync(path.join(outDir, 'manifest.json'), `${JSON.stringify({ generatedAt: new Date().toISOString(), input: path.relative(root, inputPath), count: manifest.length, objects: manifest }, null, 2)}\n`)
console.log(`[distribution] generated ${manifest.length} review-only distribution package(s) from ${path.relative(root, inputPath)}`)
