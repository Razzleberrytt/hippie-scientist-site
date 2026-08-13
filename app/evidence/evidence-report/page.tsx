import type { Metadata } from 'next'

import { buildPageMetadata } from '@/src/lib/seo'
import { getHerbs, getCompounds } from '@/src/lib/runtime-data'
import { getRuntimeVisibility } from '@/lib/runtime-visibility'
import type { RuntimeRecord } from '@/src/types/content'
import EvidenceReportClient from './EvidenceReportClient'

export const metadata: Metadata = buildPageMetadata({
  title: 'Supplement Evidence Report',
  description: 'Current evidence-label distribution across renderable herb and compound reference records in The Hippie Scientist research library.',
  path: '/evidence/evidence-report/',
  openGraphType: 'article',
})

function evidenceLabel(record: RuntimeRecord): string {
  const grade = String(record.evidence_grade || '').trim()
  if (grade) return grade
  return 'Unclassified'
}

export default async function EvidenceReportPage() {
  const [herbs, compounds] = await Promise.all([getHerbs(), getCompounds()])
  const records = ([...herbs, ...compounds] as RuntimeRecord[]).filter((record) => {
    try {
      return getRuntimeVisibility(record).canRender
    } catch {
      return false
    }
  })

  const counts = new Map<string, number>()
  for (const record of records) {
    const label = evidenceLabel(record)
    counts.set(label, (counts.get(label) || 0) + 1)
  }

  const preferredOrder = ['A', 'B', 'C', 'D', 'Traditional', 'Unclassified']
  const labels = Array.from(counts.keys()).sort((a, b) => {
    const aIndex = preferredOrder.indexOf(a)
    const bIndex = preferredOrder.indexOf(b)
    if (aIndex !== -1 || bIndex !== -1) {
      if (aIndex === -1) return 1
      if (bIndex === -1) return -1
      return aIndex - bIndex
    }
    return a.localeCompare(b)
  })

  const gradeData = labels.map((label) => {
    const count = counts.get(label) || 0
    return {
      label,
      count,
      pct: records.length > 0 ? (count / records.length) * 100 : 0,
    }
  })

  const gradedCount = records.length - (counts.get('Unclassified') || 0)

  return (
    <EvidenceReportClient
      profileCount={records.length}
      gradedCount={gradedCount}
      gradeData={gradeData}
    />
  )
}
