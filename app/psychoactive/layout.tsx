import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: true,
  },
}

export default function PsychoactiveLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-6">
      <div className="rounded-[0.85rem] border border-amber-500/20 bg-amber-50/50 p-4 text-sm leading-6 text-amber-900 shadow-sm">
        <p className="font-bold">⚠️ Educational Reference &amp; Harm Reduction Context</p>
        <p className="mt-1 text-xs text-amber-800/90">
          The content in this section covers ethnobotanical history, pharmacology, and harm reduction practices for psychoactive compounds. This information is intended for educational and risk-mitigation purposes only. The Hippie Scientist does not encourage, endorse, or facilitate the use of illegal or regulated substances.
        </p>
      </div>
      {children}
    </div>
  )
}
