'use client'

import { useEffect, useRef } from 'react'
import { captureEmailReturn } from '@/lib/email-attribution'
import { trackEmailReturn } from '@/lib/analytics'

export default function EmailReturnAttribution() {
  const trackedUrlRef = useRef('')

  useEffect(() => {
    if (typeof window === 'undefined') return

    const currentUrl = window.location.href
    if (trackedUrlRef.current === currentUrl) return

    const attribution = captureEmailReturn(new URL(currentUrl))
    if (!attribution) return

    trackedUrlRef.current = currentUrl
    trackEmailReturn({
      campaign: attribution.campaign,
      content: attribution.content,
      pagePath: window.location.pathname,
    })
  })

  return null
}
