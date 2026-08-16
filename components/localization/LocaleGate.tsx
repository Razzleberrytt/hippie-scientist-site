'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

function isSpanishPath(pathname: string | null) {
  return pathname === '/es' || Boolean(pathname?.startsWith('/es/'))
}

export function EnglishOnly({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  return isSpanishPath(pathname) ? null : <>{children}</>
}

export function SpanishOnly({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  return isSpanishPath(pathname) ? <>{children}</> : null
}
