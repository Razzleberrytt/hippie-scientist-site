import { buildResearchUpdateRss, getEvidenceChangeUpdates } from '@/lib/research-updates'

export const dynamic = 'force-static'

export function GET() {
  return new Response(buildResearchUpdateRss({
    title: 'The Hippie Scientist — Evidence Changes',
    description: 'Recorded supplement evidence-grade changes from The Hippie Scientist.',
    selfPath: '/updates/evidence-changes.xml',
    updates: getEvidenceChangeUpdates(),
  }), { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } })
}
