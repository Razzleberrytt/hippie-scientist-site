'use client'

import { usePathname } from 'next/navigation'
import DeferredEmailCapture from '@/components/articles/DeferredEmailCapture'
import { getContextualLeadMagnet, shouldShowContextualLeadMagnet } from '@/lib/lead-magnets'

export default function ContextualLeadMagnet() {
  const pathname = usePathname() || '/'
  if (!shouldShowContextualLeadMagnet(pathname)) return null

  const offer = getContextualLeadMagnet(pathname)
  const resourceUrl = offer.downloadHref || `/lead-magnets/${offer.slug}/`

  return (
    <section className='container-page pb-4 pt-2' aria-label={`Free resource: ${offer.shortTitle}`}>
      <DeferredEmailCapture
        title={offer.title}
        description={offer.description}
        ctaLabel={`Email me the ${offer.shortTitle}`}
        magnet={offer.slug}
        resourceUrl={resourceUrl}
        resourceLabel={offer.downloadLabel || `Open the ${offer.shortTitle}`}
        eyebrow={offer.eyebrow}
        placement='contextual-global'
        disclaimer='Research education only. We ask for your email to deliver the resource and research updates; we do not ask for diagnoses, medications, or other health details here.'
      />
    </section>
  )
}
