#!/usr/bin/env node
/**
 * Build a domain-deduplicated outreach queue from exported candidate data.
 * This does not scrape or send outreach. It ranks opportunities around original
 * research assets, broken/outdated citations, unlinked mentions and referral
 * value while surfacing spam risk separately from genuine link value.
 */
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const input = process.argv[2] || path.join(root, 'data/outreach/candidates.json')
const outDir = path.join(root, 'reports')
const jsonPath = path.join(outDir, 'outreach-opportunities.json')
const csvPath = path.join(outDir, 'outreach-opportunities.csv')
const brand = 'the hippie scientist'

function readCandidates(file) {
  if (!fs.existsSync(file)) return []
  if (file.endsWith('.json')) {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'))
    return Array.isArray(parsed) ? parsed : parsed.candidates || []
  }
  const text = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '')
  const lines = text.split(/\r?\n/).filter(Boolean)
  const headers = lines.shift()?.split(',').map((x) => x.trim()) || []
  return lines.map((line) => {
    const cells = line.match(/("(?:[^"]|"")*"|[^,]*)/g)?.filter((_, i) => i % 2 === 0).map((v) => v.replace(/^"|"$/g, '').replaceAll('""', '"')) || []
    return Object.fromEntries(headers.map((h, i) => [h, cells[i] || '']))
  })
}

function number(value, fallback = 0) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function clamp(value, min = 0, max = 100) { return Math.max(min, Math.min(max, value)) }

function hostname(value) {
  try { return new URL(value).hostname.toLowerCase().replace(/^www\./, '') } catch { return String(value || '').toLowerCase().replace(/^www\./, '') }
}

function normalizedType(row) {
  const explicit = String(row.type || row.opportunityType || '').toLowerCase()
  if (explicit) return explicit
  const context = `${row.title || ''} ${row.context || ''} ${row.notes || ''}`.toLowerCase()
  if (context.includes(brand) && !String(row.targetUrl || row.linkedUrl || '').includes('thehippiescientist.net')) return 'unlinked-brand-mention'
  if (/404|broken link|dead link/.test(context)) return 'broken-link-replacement'
  if (/outdated|old statistic|old data|20(?:0\d|1\d|2[0-4])/.test(context)) return 'outdated-statistic'
  return 'original-data-pitch'
}

function audienceFit(row) {
  const text = `${row.siteType || ''} ${row.title || ''} ${row.context || ''}`.toLowerCase()
  if (/journal|reporter|news|science writer|health writer/.test(text)) return 95
  if (/university|library|\.edu\b|resource page/.test(text)) return 92
  if (/pharmac|safety educator|evidence literacy/.test(text)) return 90
  if (/newsletter|science communicat|data visual/.test(text)) return 86
  if (/blog|publisher|education/.test(text)) return 72
  return 55
}

function spamRisk(row) {
  let risk = 0
  const domain = hostname(row.url || row.sourceUrl || row.domain)
  const text = `${domain} ${row.title || ''} ${row.context || ''}`.toLowerCase()
  if (!domain || !domain.includes('.')) risk += 50
  if (/casino|betting|poker|slots|payday|viagra|essay-writing|guest-post-for-sale|link farm/.test(text)) risk += 70
  if (number(row.domainRating ?? row.authority, 20) < 5) risk += 15
  if (number(row.organicTraffic, 100) < 10) risk += 10
  if (number(row.outboundDomains, 0) > 5000) risk += 20
  return clamp(risk)
}

function assetFit(row, type) {
  const target = String(row.proposedAsset || row.targetUrl || '').toLowerCase()
  if (/evidence-report|dataset|atlas|safety-checker|interaction|matrix|research/.test(target)) return 100
  if (['outdated-statistic', 'broken-link-replacement', 'original-data-pitch'].includes(type)) return 88
  if (type === 'unlinked-brand-mention') return 80
  return 65
}

function score(row) {
  const type = normalizedType(row)
  const authority = clamp(number(row.domainRating ?? row.authority, 30))
  const traffic = clamp(Math.log10(Math.max(1, number(row.organicTraffic, 1))) * 20)
  const relevance = clamp(number(row.relevance, audienceFit(row)))
  const asset = assetFit(row, type)
  const freshness = type === 'outdated-statistic' ? 100 : clamp(number(row.freshnessGap, 55))
  const referral = clamp(number(row.referralPotential, traffic))
  const contactability = clamp(number(row.contactability, row.contactUrl || row.contact ? 80 : 40))
  const risk = spamRisk(row)
  const opportunityScore = clamp(
    0.24 * relevance + 0.2 * asset + 0.15 * authority + 0.1 * traffic + 0.1 * freshness + 0.12 * referral + 0.09 * contactability - 0.35 * risk,
  )
  return { type, authority, traffic, relevance, assetFit: asset, freshnessGap: freshness, referralPotential: referral, contactability, spamRisk: risk, opportunityScore: Number(opportunityScore.toFixed(1)) }
}

const candidates = readCandidates(input)
const scored = candidates.map((row) => {
  const sourceUrl = row.url || row.sourceUrl || ''
  const domain = hostname(sourceUrl || row.domain)
  const metrics = score(row)
  const targetUrl = row.targetUrl || row.proposedAsset || ''
  const originalAsset = /evidence-report|dataset|atlas|safety-checker|interaction|matrix|research/.test(String(targetUrl).toLowerCase())
  return {
    domain, sourceUrl, title: row.title || '', targetUrl, contactUrl: row.contactUrl || '', notes: row.notes || row.context || '',
    referralVisits: number(row.referralVisits), originalAsset, ...metrics,
  }
}).filter((row) => row.domain)

// Referring domains matter more than duplicated URL counts. Retain the strongest
// opportunity per domain while aggregating referral traffic and candidate URLs.
const byDomain = new Map()
for (const row of scored) {
  const existing = byDomain.get(row.domain)
  if (!existing) {
    byDomain.set(row.domain, { ...row, candidateUrls: [row.sourceUrl], referralVisits: row.referralVisits })
    continue
  }
  existing.candidateUrls.push(row.sourceUrl)
  existing.referralVisits += row.referralVisits
  if (row.opportunityScore > existing.opportunityScore) {
    const urls = existing.candidateUrls
    const visits = existing.referralVisits
    byDomain.set(row.domain, { ...row, candidateUrls: urls, referralVisits: visits })
  }
}

const opportunities = [...byDomain.values()].sort((a, b) => b.opportunityScore - a.opportunityScore || b.referralVisits - a.referralVisits)
const suspicious = opportunities.filter((row) => row.spamRisk >= 60)
const actionable = opportunities.filter((row) => row.spamRisk < 60 && row.opportunityScore >= 50)

const summary = {
  generatedAt: new Date().toISOString(),
  input: path.relative(root, input),
  candidateUrls: scored.length,
  referringDomains: opportunities.length,
  actionableDomains: actionable.length,
  suspiciousDomains: suspicious.length,
  originalAssetOpportunities: actionable.filter((row) => row.originalAsset).length,
  referralVisitsFromKnownDomains: opportunities.reduce((sum, row) => sum + row.referralVisits, 0),
  note: 'Suspicious domains are reported for review; this tool never auto-disavows or sends outreach.',
}

fs.mkdirSync(outDir, { recursive: true })
fs.writeFileSync(jsonPath, `${JSON.stringify({ summary, actionable, suspicious, allDomains: opportunities }, null, 2)}\n`)
const cols = ['opportunityScore','domain','type','targetUrl','sourceUrl','referralVisits','originalAsset','spamRisk','relevance','authority','contactUrl']
const quote = (v) => `"${String(v ?? '').replaceAll('"', '""')}"`
fs.writeFileSync(csvPath, `${cols.join(',')}\n${opportunities.map((row) => cols.map((col) => quote(row[col])).join(',')).join('\n')}\n`)
console.log(`[outreach] ${summary.candidateUrls} URLs → ${summary.referringDomains} domains → ${summary.actionableDomains} actionable`)
console.log(`[outreach] suspicious domains: ${summary.suspiciousDomains} (review only; no automatic disavow)`)
console.log(`[outreach] reports: ${path.relative(root, jsonPath)}, ${path.relative(root, csvPath)}`)
