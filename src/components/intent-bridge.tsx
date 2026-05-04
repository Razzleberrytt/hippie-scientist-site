'use client'

import { useEffect } from 'react'
import { INTENT_STORAGE_KEY } from '@/lib/intent-memory'

export default function IntentBridge({ intent }: { intent: string }) {
  useEffect(() => {
    try {
      localStorage.setItem(INTENT_STORAGE_KEY, intent)
    } catch {}
  }, [intent])

  return null
}
