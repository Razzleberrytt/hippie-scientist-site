'use client'

import { useEffect } from 'react'
import { loadAnalytics } from '@/lib/loadAnalytics'

// Startup transport only: the footer Privacy settings modal owns the opt-out UI.
export default function Ga4Bootstrap() {
  useEffect(() => {
    loadAnalytics()
  }, [])

  return null
}
