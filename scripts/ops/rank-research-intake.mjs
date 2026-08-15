#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const [OWNER = 'Razzleberrytt', REPO = 'hippie-scientist-site'] = (process.env.GITHUB_REPOSITORY || '').split('/')
const TOKEN = process.env.GITHUB_TOKEN || ''
const OUT_DIR = path.join(process.cwd(), 'ops', 'reports')

function field(body = '', label) {
  return String(body).match(new RegExp(`### ${label}\\s+([^\\n]+)`, 'i'))?.[1]?.trim() || ''
}

function score(issue) {
  const r = issue.reactions || {}
  const positive = Number(r['+1'] || 0) + Number(r.heart || 0) + Number(r.hooray || 0) + Number(r.rocket || 0) + Number(r.eyes || 0)
  const comments = Number(issue.comments || 0)
  const type = field(issue.body, 'Request type')
  const urgency = /Scientific correction/i.test(type) ? 6 : /Missing study/i.test(type) ? 4 : 0
  return { positive, comments, urgency, demandScore: positive * 5 + comments * 2 + urgency }
}

async function main() {
  const headers = { accept: 'application/vnd.github+json', 'x-github-api-version': '2022-11-28', ...(TOKEN ? { authorization: `Bearer ${TOKEN}` } : {}) }
  const issues = []
  for (let page = 1; page <= 10; page += 1) {
    const response = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/issues?state=open&labels=evidence,enhancement&per_page=100&page=${page}`, { headers })
    if (!response.ok) throw new Error(`GitHub issues request failed (${response.status})`)
    const rows = await response.json()
    issues.push(...rows.filter((row) => !row.pull_request && /^Research intake:/i.test(row.title || '')))
    if (rows.length < 100) break
  }

  const items = issues.map((issue) => {
    const demand = score(issue)
    return {
      number: issue.number,
      url: issue.html_url,
      requestType: field(issue.body, 'Request type') || 'Unclassified',
      subject: field(issue.body, 'Ingredient, comparison, claim, or page'),
      reactions: demand.positive,
      comments: demand.comments,
      reviewUrgency: demand.urgency,
      demandScore: demand.demandScore,
      updatedAt: issue.updated_at,
    }
  }).sort((a, b) => b.demandScore - a.demandScore || new Date(b.updatedAt) - new Date(a.updatedAt))

  fs.mkdirSync(OUT_DIR, { recursive: true })
  const report = { generatedAt: new Date().toISOString(), totalOpenRequests: items.length, items }
  fs.writeFileSync(path.join(OUT_DIR, 'research-intake-demand.json'), `${JSON.stringify(report, null, 2)}\n`)
  fs.writeFileSync(path.join(OUT_DIR, 'research-intake-demand.md'), [
    '# Research intake — demand ranking', '',
    'Demand = positive public reactions × 5 + comments × 2 + a small review-urgency bonus for missing-study/correction reports. This ranks review attention; it never changes evidence grades automatically.', '',
    '| Rank | Demand | Type | Subject | Issue |', '| ---: | ---: | --- | --- | --- |',
    ...items.map((item, index) => `| ${index + 1} | ${item.demandScore} | ${item.requestType} | ${item.subject || '—'} | #${item.number} |`), ''
  ].join('\n'))
  console.log(`[research-intake] ranked ${items.length} open requests`)
}

main().catch((error) => { console.error(`[research-intake] ${error.message}`); process.exitCode = 1 })
