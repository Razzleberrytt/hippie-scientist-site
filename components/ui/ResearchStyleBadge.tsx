import type { ResearchStyle } from '@/lib/research-intelligence'

export default function ResearchStyleBadge({ style }: { style?: ResearchStyle | null }) {
  if (!style) return null

  return (
    <span className="inline-flex rounded-full border border-brand-900/10 bg-paper-100 px-3 py-1 text-xs font-semibold tracking-wide text-brand-800">
      {style}
    </span>
  )
}
