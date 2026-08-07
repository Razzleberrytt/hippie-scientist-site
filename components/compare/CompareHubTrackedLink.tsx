'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { trackCompareHubClick, type CompareHubClickSource } from '@/lib/compareHubTracking'

type Props = {
  href: string
  label: string
  source: CompareHubClickSource
  category?: string
  className?: string
  children: ReactNode
}

export default function CompareHubTrackedLink({ href, label, source, category, className, children }: Props) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => trackCompareHubClick({ source, href, label, category })}
    >
      {children}
    </Link>
  )
}
