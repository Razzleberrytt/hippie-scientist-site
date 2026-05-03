'use client'

import type { AnchorHTMLAttributes, ReactNode } from 'react'

type TrackingPayload = {
  compoundSlug: string
  productName: string
  productLabel: string
  brand: string
  destination: string
}

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'onClick'> & {
  children: ReactNode
  tracking: TrackingPayload
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    plausible?: (eventName: string, options?: { props?: Record<string, string> }) => void
    dataLayer?: Array<Record<string, unknown>>
  }
}

function trackAffiliateClick(payload: TrackingPayload) {
  const eventName = 'affiliate_click'
  const props = {
    compound_slug: payload.compoundSlug,
    product_name: payload.productName,
    product_label: payload.productLabel,
    brand: payload.brand,
    destination: payload.destination,
  }

  window.dataLayer?.push({ event: eventName, ...props })

  window.gtag?.('event', eventName, {
    event_category: 'affiliate',
    event_label: payload.productName,
    ...props,
  })

  window.plausible?.('Affiliate Click', {
    props: {
      compound_slug: payload.compoundSlug,
      product_name: payload.productName,
      product_label: payload.productLabel,
      brand: payload.brand,
    },
  })
}

export default function TrackedAffiliateLink({ children, tracking, ...props }: Props) {
  return (
    <a
      {...props}
      data-affiliate-click="true"
      data-compound={tracking.compoundSlug}
      data-product={tracking.productName}
      data-product-label={tracking.productLabel}
      data-brand={tracking.brand}
      onClick={() => trackAffiliateClick(tracking)}
    >
      {children}
    </a>
  )
}
