#!/usr/bin/env node

/**
 * Rank public research-intake issues by observable demand.
 *
 * This intentionally uses public issue engagement only: reactions, comments,
 * and duplicate/consolidation signals. It never ingests user health data.
 * Scientific corrections and missing-study reports receive a small review
 * urgency bonus, but popularity never changes evidence conclusions directly.
 */

import fs from 'node:fs'
import path from 'node:path'

const OWNER = process.env.GITHUB_REPOSITORY?.split('/')[0] || 'Razzleberrytt'
const REPO = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'hippie-scientist-site'
const TOKEN = process.env.GITHUB_TOKEN || ''
const ROOT = process.cwd()
const OUT_DIR = path.join(ROOT, 'ops', 'reports')
const JSON_PATH = path.join(OUT_DIR, 'research-intake-demand.json')
const MD_PATH = path.join(OUT_DIR, 'research-intake-demand.md')

function requestType(body = '') {
  const text = String(body)
  const match = text.match(/### Request type\s+([^\n]+)/i)
  return match?.[1]?.trim() || 'Unclassified'
}

function subject(body = '') {
  const text = String(body)
  const match = text.match(/### Ingredient, comparison, claim, or page\s+([^\n]+)/i)
  return match?.[1]?.trim() || ''
}

function demandScore(issue) {
  const reactions = issue.reactions || {}
  const positiveReactions = Number(reactions['+1'] || 0)
    + Number(reactions.heart || 0)
    + Number(reactions.hooray || 0)
    + Number(reactions.rocket || 0)
    + Number(reactions.eyes || 0)
  const comments = Number(issue.comments || 0)
  const type = requestType(issue.body)
  const reviewUrgency = /Scientific correction/i.test(type) ? 6 : /Missing study/i.test(type) ? 4 : 0
  return {
    positiveReactions,
    comments,
    reviewUrgency,
    score: positiveReactions * 5 + comments * 2 + reviewUrgency,
  }
}

async function fetchIssues() {
  const headers = {
    accept: 'application/vnd.github+json',
    'x-github-api-version': '2022-11-28',
    ...(TOKEN ? { authorization: `Bearer ${TOKEN}` } : {}),
  }
  const issues = []
  for (let page = 1; page <= 10; page += 1) {
    const url = `https://api.github.com/repos/${OWNER}/${REPO}/issues?state=open&labels=evidence,enhancement&per_page=100&page=${page}`
    const response = await fetch(url, { headers })
    if (!response.ok) throw new Error(`GitHub issues request failed (${response.status})`)
    const rows = await response.json()
    const filtered = rows.filter((row) => !row.pull_request && /^Research intake:/i.test(row.title || ''))
    issues.push(...filtered)
    if (rows.length < 100) break
  }
  return issues
}

function renderMarkdown(report) {
  return [
    '# Research intake — demand ranking',
    '',
    `Generated: ${report.generatedAt}`,
    '',
    'Demand score = positive public reactions × 5 + comments × 2 + a small review-urgency bonus for missing-study/correction reports. This ranks review attention; it never changes evidence grades automatically.',
    '',
    '| Rank | Demand | Type | Subject | Issue | Reactions | Comments |',
    '| ---: | ---: | --- | --- | --- | ---: | ---: |',
    ...report.items.map((item, index) => `| ${index + 1} | ${item.demandScore} | ${item.requestType} | ${item.subject || '—'} | #${item.number} | ${item.positiveReactions} | ${item.comments} |`),
    '',
  ].join('\n')
}

async function main() {
  const issues = await fetchIssues()
  const items = issues.map((issue) => {
    const demand = demandScore(issue)
    return {
      number: issue.number,
      title: issue.title,
      url: issue.html_url,
      requestType: requestType(issue.body),
      subject: subject(issue.body),
      positiveReactions: demand.positiveReactions,
      comments: demand.comments,
      reviewUrgency: demand.reviewUrgency,
      demandScore: demand.score,
      createdAt: issue.created_at,
      updatedAt: issue.updated_at,
    }
  }).sort((a, b) => b.demandScore - a.demandScore || new Date(b.updatedAt) - new Date(a.updatedAt))

  const report = { generatedAt: new Date().toISOString(), repository: `${OWNER}/${REPO}`, totalOpenRequests: items.length, items }
  fs.mkdirSync(OUT_DIR, { recursive: true })
  fs.writeFileSync(JSON_PATH, `${JSON.stringify(report, null, 2)}\n`)
  fs.writeFileSync(MD_PATH, renderMarkdown(report))
  console.log(`[research-intake] ranked ${items.length} open public request${items.length === 1 ? '' : 's'}`)
}

main().catch((error) => {
  console.error(`[research-intake] ${error.message}`)
  process.exitCode = 1
})
