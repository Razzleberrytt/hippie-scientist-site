import type { ReactNode } from 'react'
import SleepResearchNextActions from '@/components/SleepResearchNextActions'

export default function LTheanineForSleepLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <div className="mx-auto max-w-5xl px-4 pb-20 sm:px-6 lg:px-8">
        <SleepResearchNextActions />
      </div>
    </>
  )
}
