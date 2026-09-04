'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { trackSleepNextActionClick, type SleepNextAction } from '@/lib/sleep-next-actions-analytics'

export default function SleepResearchNextActionLink({
  href,
  action,
  className,
  children,
}: {
  href: string
  action: SleepNextAction
  className: string
  children: ReactNode
}) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() =>
        trackSleepNextActionClick({
          action,
          destination: href,
          sourcePath: window.location.pathname,
        })
      }
    >
      {children}
    </Link>
  )
}
