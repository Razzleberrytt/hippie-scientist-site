#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const OUT = path.join(ROOT, process.argv.find((arg) => arg.startsWith('--out='))?.split('=')[1] || 'out')
const REPORT = path.join(ROOT, 'artifacts/profile-information-architecture.json')
const FAIL = process.argv.includes('--fail')
const PROFILE_PREFIXES = ['/herbs/', '/compounds/']
const MAX_INTERNAL_LINKS = 120

function walk(dir) {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    return entry.isDirectory() ? walk(full) : [full]
  })
}

function routeForFile(file) {
  const relative = path.relative(OUT, file).replaceAll(path.sep, '/')
  if (relative === 'index.html') return '/'
  if (relative.endsWith('/index.html')) return `/${relative.slice(0, -'index.html'.length)}`
  return `/${relative.replace(/\.html$/, '/')}`
}

function visibleText(html) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z0-9#]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function sentenceKeys(text) {
  return (text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [])
    .map((sentence) => sentence.toLowerCase().replace(/\s+/g, ' ').trim())
    .filter((sentence) => sentence.length >= 45)
}

function internalLinks(html) {
  return Array.from(html.matchAll(/href=["']([^"'#]+)["']/gi), (match) => match[1])
    .filter((href) => href.startsWith('/') && !href.startsWith('//'))
}

function indexOfSection(html, id) {
  const patterns = [`id="${id}"`, `id='${id}'`]
  const indexes = patterns.map((pattern) => html.indexOf(pattern)).filter((value) => value >= 0)
  return indexes.length ? Math.min(...indexes) : -1
}

function sourceArchitectureChecks() {
  const files = ['app/herbs/[slug]/page.tsx', 'app/compounds/[slug]/page.tsx']
  return files.map((relative) => {
    const source = fs.readFileSync(path.join(ROOT, relative), 'utf8')
    const positions = {
      decision: source.indexOf('ProfileDecisionPanel'),
      safety: source.indexOf('id="safety"'),
      evidence: source.indexOf('id="evidence"'),
      dose: Math.max(source.indexOf('id="dosing"'), source.indexOf('Dosing & timing')),
      mechanisms: source.indexOf('id="mechanisms"'),
      related: source.indexOf('id="related"'),
    }
    return {
      file: relative,
      hasBreadcrumbs: /Breadcrumb|breadcrumbs/i.test(source),
      hasProfileToc: source.includes('ProfileTOC'),
      hasDecisionPanel: positions.decision >= 0,
      safetyBeforeMechanisms: positions.safety >= 0 && (positions.mechanisms < 0 || positions.safety < positions.mechanisms),
      evidenceBeforeMechanisms: positions.evidence >= 0 && (positions.mechanisms < 0 || positions.evidence < positions.mechanisms),
      relatedAfterCoreEvidence: positions.related < 0 || (positions.evidence >= 0 && positions.related > positions.evidence),
      positions,
    }
  })
}

const htmlFiles = walk(OUT).filter((file) => file.endsWith('.html'))
const profiles = htmlFiles
  .map((file) => ({ file, route: routeForFile(file), html: fs.readFileSync(file, 'utf8') }))
  .filter((page) => PROFILE_PREFIXES.some((prefix) => page.route.startsWith(prefix)) && page.route.split('/').filter(Boolean).length === 2)

const sentenceFrequency = new Map()
for (const page of profiles) {
  for (const sentence of new Set(sentenceKeys(visibleText(page.html)))) {
    sentenceFrequency.set(sentence, (sentenceFrequency.get(sentence) || 0) + 1)
  }
}

const boilerplateFloor = Math.max(5, Math.ceil(profiles.length * 0.05))
const rows = profiles.map((page) => {
  const text = visibleText(page.html)
  const sentences = sentenceKeys(text)
  const totalChars = sentences.reduce((sum, sentence) => sum + sentence.length, 0)
  const templatedChars = sentences
    .filter((sentence) => (sentenceFrequency.get(sentence) || 0) >= boilerplateFloor)
    .reduce((sum, sentence) => sum + sentence.length, 0)
  const uniqueRatio = totalChars > 0 ? Math.max(0, 1 - templatedChars / totalChars) : 0
  const links = internalLinks(page.html)
  const positions = {
    conclusion: Math.max(indexOfSection(page.html, 'overview'), indexOfSection(page.html, 'conclusion')),
    safety: indexOfSection(page.html, 'safety'),
    evidence: indexOfSection(page.html, 'evidence'),
    dose: indexOfSection(page.html, 'dosing'),
    mechanisms: indexOfSection(page.html, 'mechanisms'),
    related: indexOfSection(page.html, 'related'),
  }

  const corePositions = [positions.conclusion, positions.safety, positions.evidence, positions.dose].filter((value) => value >= 0)
  const mechanismProgressive = positions.mechanisms < 0 || corePositions.every((value) => value < positions.mechanisms)
  const relatedLow = positions.related < 0 || corePositions.every((value) => value < positions.related)
  const hasParentTopic = page.route.startsWith('/herbs/')
    ? /href=["']\/herbs\/?["']/i.test(page.html)
    : /href=["']\/compounds\/?["']/i.test(page.html)

  const flags = []
  if (uniqueRatio < 0.45) flags.push('boilerplate-dominated')
  if (!mechanismProgressive) flags.push('mechanisms-before-decision-content')
  if (!relatedLow) flags.push('related-links-too-high')
  if (!hasParentTopic) flags.push('missing-parent-topic-navigation')
  if (links.length > MAX_INTERNAL_LINKS) flags.push('excessive-internal-link-count')

  return {
    route: page.route,
    uniqueRatio: Number(uniqueRatio.toFixed(3)),
    textCharacters: text.length,
    internalLinks: links.length,
    uniqueInternalLinks: new Set(links).size,
    hasParentTopic,
    mechanismProgressive,
    relatedLow,
    flags,
  }
})

const sourceChecks = sourceArchitectureChecks()
const flagged = rows.filter((row) => row.flags.length > 0)
const summary = {
  profilesScanned: rows.length,
  boilerplateSentenceThresholdPages: boilerplateFloor,
  averageUniqueRatio: rows.length ? Number((rows.reduce((sum, row) => sum + row.uniqueRatio, 0) / rows.length).toFixed(3)) : null,
  boilerplateDominated: rows.filter((row) => row.flags.includes('boilerplate-dominated')).length,
  excessiveLinkCount: rows.filter((row) => row.flags.includes('excessive-internal-link-count')).length,
  architectureFailures: sourceChecks.filter((row) => !row.hasDecisionPanel || !row.safetyBeforeMechanisms || !row.evidenceBeforeMechanisms || !row.relatedAfterCoreEvidence).length,
  flaggedProfiles: flagged.length,
}

fs.mkdirSync(path.dirname(REPORT), { recursive: true })
fs.writeFileSync(REPORT, `${JSON.stringify({ generatedAt: new Date().toISOString(), summary, sourceChecks, profiles: rows }, null, 2)}\n`)
console.log('[profile-information-architecture]', summary)
console.log(`Report: ${path.relative(ROOT, REPORT)}`)

if (FAIL && (summary.architectureFailures > 0 || summary.boilerplateDominated > 0)) process.exitCode = 1
