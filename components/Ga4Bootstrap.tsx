'use client'

import { useEffect } from 'react'
import { loadAnalytics } from '@/lib/loadAnalytics'
import { resolveGa4DefaultEligibility } from '@/lib/consent'

// Startup transport only: the footer Privacy settings modal owns the opt-out UI.
export default function Ga4Bootstrap() {
  useEffect(() => {
    // Explicit consent works immediately; default-on waits for server-trusted geography.
    loadAnalytics()
    void resolveGa4DefaultEligibility().then(loadAnalytics)
  }, [])

  return null
}
