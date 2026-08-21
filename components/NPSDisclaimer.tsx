import React from 'react'
import Disclaimer from '@/src/components/Disclaimer'

interface NPSDisclaimerProps {
  className?: string
}

/**
 * Backward-compatible wrapper. The high-risk disclaimer copy and rendering now
 * live in the shared Disclaimer primitive so safety language cannot drift.
 */
export function NPSDisclaimer({ className = '' }: NPSDisclaimerProps) {
  return <Disclaimer variant='high-risk' className={className} />
}
