import type { ReactNode } from 'react'
import CompareHubAnalytics from '@/components/compare/CompareHubAnalytics'

export default function CompareLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <CompareHubAnalytics />
      {children}
    </>
  )
}
