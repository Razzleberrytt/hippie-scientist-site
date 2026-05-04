import type { Metadata } from 'next'
import LibraryBrowser from '@/components/library-browser'
import { getCompounds, getCompoundCardPayload } from '@/lib/runtime-data'
import { compoundDetailRoute } from '@/lib/public-routes'

export const metadata: Metadata = {
  title: 'Compounds',
  description: 'Browse compound profiles and decision-ready summaries.',
}

export default async function CompoundsPage() {
  const compounds = await getCompounds()
  const payload = await getCompoundCardPayload()

  const payloadMap = new Map(payload.map(p => [p.slug, p]))

  const items = compounds.map((compound: any) => {
    const p = payloadMap.get(compound.slug)

    return {
      slug: compound.slug,
      title: p?.headline || compound.name,
      summary: p?.recommendation || compound.summary,
      href: compoundDetailRoute(compound.slug),
      typeLabel: p?.evidence_badge || 'Compound',
      domain: p?.primary_use_case,
      isATier: p?.confidence_label === 'high',
    }
  })

  return (
    <LibraryBrowser
      title='Compounds'
      description='Decision-ready compounds prioritized by evidence and use-case.'
      items={items}
    />
  )
}
