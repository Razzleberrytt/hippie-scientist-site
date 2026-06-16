import React from 'react'

interface NPSDisclaimerProps {
  className?: string
}

export function NPSDisclaimer({ className = '' }: NPSDisclaimerProps) {
  return (
    <aside
      className={`rounded-xl border border-red-700/25 bg-red-50 px-4 py-3 text-red-950 ${className}`}
      role="note"
      aria-label="Novel psychoactive substances disclaimer"
    >
      <p className="text-sm font-bold uppercase tracking-wider text-red-900">Important</p>
      <p className="mt-2 text-sm leading-6 text-red-950">
        This content is for informational and educational purposes only. Many novel psychoactive substances
        have little to no human clinical safety data. This is not medical advice. These substances can carry
        serious and poorly characterized risks.
      </p>
    </aside>
  )
}
