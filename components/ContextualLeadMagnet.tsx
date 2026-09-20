'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import DeferredEmailCapture from '@/components/articles/DeferredEmailCapture'
import { getContextualLeadMagnet, shouldShowContextualLeadMagnet } from '@/lib/lead-magnets'

type CaptureOwnershipCheck = {
  pathname: string
  hasPageOwnedCapture: boolean
}

export default function ContextualLeadMagnet() {
  const pathname = usePathname() || '/'
  const [ownershipCheck, setOwnershipCheck] = useState<CaptureOwnershipCheck | null>(null)
  const routeEligible = shouldShowContextualLeadMagnet(pathname)

  useEffect(() => {
    if (!routeEligible) {
      setOwnershipCheck({ pathname, hasPageOwnedCapture: false })
      return
    }

    const main = document.getElementById('main-content')
    const hasPageOwnedCapture = Boolean(
      main?.querySelector('[data-email-capture-owner="page"]'),
    )
    setOwnershipCheck({ pathname, hasPageOwnedCapture })
  }, [pathname, routeEligible])

  if (!routeEligible) return null
  if (!ownershipCheck || ownershipCheck.pathname !== pathname || ownershipCheck.hasPageOwnedCapture) return null

  const offer = getContextualLeadMagnet(pathname)
  const resourceUrl = offer.downloadHref || `/lead-magnets/${offer.slug}/`

  return (
    <section
      className='container-page pb-4 pt-2'
      aria-label={`Free resource: ${offer.shortTitle}`}
      data-contextual-lead-magnet='true'
    >
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
