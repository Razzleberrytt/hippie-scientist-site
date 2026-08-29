'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { allowedCommercePlacement, getCommerceExperimentAssignments, type CommercePlacement } from '@/lib/commerce-experiments'

export default function ProductQualityExperimentLayout({
  evidenceContent,
  commerceContent,
}: {
  evidenceContent: ReactNode
  commerceContent: ReactNode
}) {
  const [placement, setPlacement] = useState<CommercePlacement>('post-evidence')

  useEffect(() => {
    const assignments = getCommerceExperimentAssignments()
    setPlacement(allowedCommercePlacement('buy-guide', assignments.placement))
  }, [])

  if (placement === 'top-commercial-section') {
    return <>{commerceContent}{evidenceContent}</>
  }

  return <>{evidenceContent}{commerceContent}</>
}
