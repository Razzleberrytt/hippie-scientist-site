#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const input = process.argv[2] || path.join(root, 'data/outreach/reporter-requests.json')
const output = path.join(root, 'reports/reporter-response-queue.json')

function readJson(file) {
  try {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'))
    return Array.isArray(parsed) ? parsed : parsed.requests || []
  } catch {
    return []
  }
}

function safeDate(value) {
  const parsed = Date.parse(String(value || ''))
  return Number.isFinite(parsed) ? new Date(parsed) : null
}

function urgency(deadline) {
  if (!deadline) return { label: 'unspecified', score: 10, hours: null }
  const hours = (deadline.getTime() - Date.now()) / 3_600_000
  if (hours <= 0) return { label: 'past-due', score: 100, hours }
  if (hours <= 8) return { label: 'same-day', score: 95, hours }
  if (hours <= 24) return { label: 'within-24-hours', score: 85, hours }
  if (hours <= 72) return { label: 'within-3-days', score: 65, hours }
  return { label: 'scheduled', score: 35, hours }
}

function evidenceReadiness(request) {
  let score = 0
  if (request.sourceUrl) score += 35
  if (request.statisticOrClaim) score += 20
  if (request.reportUrl) score += 20
  if (request.methodologyUrl) score += 15
  if (request.requestedData) score += 10
  return Math.min(100, score)
}

function priority(request) {
  const due = urgency(safeDate(request.deadline))
  const readiness = evidenceReadiness(request)
  const specificity = request.articleUrl || request.publication ? 15 : 0
  return {
    due,
    readiness,
    score: Math.min(100, Math.round(due.score * 0.55 + readiness * 0.3 + specificity)),
  }
}

const rows = readJson(input).map((request, index) => {
  const result = priority(request)
  return {
    id: String(request.id || `request-${index + 1}`),
    publication: String(request.publication || ''),
    reporter: String(request.reporter || ''),
    deadline: request.deadline || null,
    urgency: result.due.label,
    hoursUntilDeadline: result.due.hours === null ? null : Number(result.due.hours.toFixed(1)),
    evidenceReadiness: result.readiness,
    priority: result.score,
    articleUrl: request.articleUrl || null,
    requestedData: request.requestedData || null,
    statisticOrClaim: request.statisticOrClaim || null,
    sourceUrl: request.sourceUrl || null,
    reportUrl: request.reportUrl || 'https://thehippiescientist.net/evidence/evidence-report/',
    methodologyUrl: request.methodologyUrl || 'https://thehippiescientist.net/info/methodology/',
    responseChecklist: [
      'Verify the requested statistic or claim against the current source object.',
      'State scope and denominator so an aggregate number cannot be generalized beyond the dataset.',
      'Include the methodology link and the primary source trail when the request concerns a specific ingredient.',
      'Separate evidence strength from safety and avoid personalized medical conclusions.',
      'If verification cannot be completed before the deadline, say so rather than supplying an unverified number.',
    ],
  }
}).sort((a, b) => b.priority - a.priority || (a.deadline || '').localeCompare(b.deadline || ''))

fs.mkdirSync(path.dirname(output), { recursive: true })
fs.writeFileSync(output, `${JSON.stringify({ generatedAt: new Date().toISOString(), requests: rows }, null, 2)}\n`)
console.log(`[reporter-response] ranked ${rows.length} reporter/data requests -> ${path.relative(root, output)}`)
