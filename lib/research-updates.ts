import { editorialReviewHistory } from '@/data/editorial/review-history'
import { evidenceGradeHistory } from '@/data/editorial/evidence-grade-history'

const SITE = 'https://thehippiescientist.net'

export type ResearchUpdate = {
  id: string
  kind: 'review' | 'evidence-change'
  title: string
  path: string
  occurredAt: string
  summary: string
  topic?: string
}

function titleFromPath(pagePath: string) {
  const slug = pagePath.split('/').filter(Boolean).at(-1) || 'Research update'
  return slug
    .split('-')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function getRecentlyReviewedUpdates(limit = 50): ResearchUpdate[] {
  return [...editorialReviewHistory]
    .sort((a, b) => Date.parse(b.reviewedAt) - Date.parse(a.reviewedAt))
    .slice(0, limit)
    .map(review => ({
      id: review.id,
      kind: 'review' as const,
      title: `${titleFromPath(review.pagePath)} reviewed`,
      path: review.pagePath,
      occurredAt: review.reviewedAt,
      summary: review.summary?.trim() || `${review.kind} review recorded by ${review.reviewerName}.`,
      topic: review.kind,
    }))
}

export function getEvidenceChangeUpdates(limit = 50): ResearchUpdate[] {
  return [...evidenceGradeHistory]
    .sort((a, b) => Date.parse(b.changedAt) - Date.parse(a.changedAt))
    .slice(0, limit)
    .map(change => ({
      id: change.id,
      kind: 'evidence-change' as const,
      title: `${change.ingredientName}: ${change.fromGrade} → ${change.toGrade}`,
      path: change.ingredientPath,
      occurredAt: change.changedAt,
      summary: change.reason,
      topic: change.quarter,
    }))
}

function escapeXml(value: string) {
  return value.replace(/[<>&"']/g, character => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    '"': '&quot;',
    "'": '&apos;',
  }[character] || character))
}

function safeCdata(value: string) {
  return value.replace(/]]>/g, ']]]]><![CDATA[>')
}

export function buildResearchUpdateRss({
  title,
  description,
  selfPath,
  updates,
}: {
  title: string
  description: string
  selfPath: string
  updates: ResearchUpdate[]
}) {
  const sorted = [...updates].sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt)).slice(0, 50)
  const lastBuildDate = new Date(sorted[0]?.occurredAt || '2026-01-01').toUTCString()
  const items = sorted.map(update => {
    const url = `${SITE}${update.path}`
    return `
    <item>
      <title><![CDATA[${safeCdata(update.title)}]]></title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(`${SITE}/updates/#${update.id}`)}</guid>
      <pubDate>${new Date(update.occurredAt).toUTCString()}</pubDate>
      <description><![CDATA[${safeCdata(update.summary)}]]></description>
    </item>`
  }).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${escapeXml(title)}</title>
  <link>${SITE}/updates/</link>
  <atom:link href="${SITE}${selfPath}" rel="self" type="application/rss+xml" />
  <description>${escapeXml(description)}</description>
  <language>en</language>
  <lastBuildDate>${lastBuildDate}</lastBuildDate>${items}
</channel>
</rss>
`
}
