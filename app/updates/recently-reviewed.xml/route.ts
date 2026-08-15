import { buildResearchUpdateRss, getRecentlyReviewedUpdates } from '@/lib/research-updates'

export const dynamic = 'force-static'

export function GET() {
  return new Response(buildResearchUpdateRss({
    title: 'The Hippie Scientist — Recently Reviewed',
    description: 'Real editorial and scientific review events from The Hippie Scientist.',
    selfPath: '/updates/recently-reviewed.xml',
    updates: getRecentlyReviewedUpdates(),
  }), { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } })
}
