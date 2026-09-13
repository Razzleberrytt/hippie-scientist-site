import type { ReactNode } from 'react'
import SleepResearchNextActions from '@/components/SleepResearchNextActions'

export default function GlycineForSleepLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <div className="mx-auto max-w-5xl px-4 pb-24 sm:px-6 lg:px-8">
        <SleepResearchNextActions />
      </div>
    </>
  )
}
