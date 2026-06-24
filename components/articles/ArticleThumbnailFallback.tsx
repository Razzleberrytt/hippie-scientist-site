type CategoryColor = {
  bg: string
  accent: string
  label: string
}

const CATEGORY_COLORS: Record<string, CategoryColor> = {
  'focus':         { bg: '#1a2e1a', accent: '#4a7c4a', label: 'Focus' },
  'adhd':          { bg: '#1a2e1a', accent: '#4a7c4a', label: 'Focus & ADHD' },
  'focus-adhd':    { bg: '#1a2e1a', accent: '#4a7c4a', label: 'Focus' },
  'nootropics':    { bg: '#1a2e1a', accent: '#4a7c4a', label: 'Cognition' },
  'cognition':     { bg: '#1a1e2a', accent: '#3a4a7a', label: 'Cognition' },
  'stress':        { bg: '#1e2a1e', accent: '#5a8a5a', label: 'Stress' },
  'anxiety':       { bg: '#1e2a1e', accent: '#5a8a5a', label: 'Anxiety' },
  'stress-anxiety':{ bg: '#1e2a1e', accent: '#5a8a5a', label: 'Stress' },
  'mood':          { bg: '#1e2a1e', accent: '#5a8a5a', label: 'Mood' },
  'sleep':         { bg: '#12201e', accent: '#3a6a5a', label: 'Sleep' },
  'energy':        { bg: '#2a2a1a', accent: '#7a7a3a', label: 'Energy' },
  'alkaloids':     { bg: '#201828', accent: '#6a4a8a', label: 'Alkaloids' },
  'default':       { bg: '#1a2e1a', accent: '#4a6a4a', label: 'Research' },
}

function resolveCategory(category?: string): CategoryColor {
  if (!category) return CATEGORY_COLORS.default
  const key = category.toLowerCase().trim().replace(/\s+/g, '-')
  if (CATEGORY_COLORS[key]) return CATEGORY_COLORS[key]
  for (const [k, v] of Object.entries(CATEGORY_COLORS)) {
    if (k !== 'default' && (key.includes(k) || k.includes(key))) return v
  }
  return CATEGORY_COLORS.default
}

function titleSnippet(title: string): string {
  const words = title.trim().split(/\s+/)
  return words.slice(0, 3).join(' ')
}

export default function ArticleThumbnailFallback({
  category,
  title,
}: {
  category?: string
  title: string
}) {
  const colors = resolveCategory(category)
  const snippet = titleSnippet(title)

  return (
    <div
      className="relative mb-3 flex aspect-[2/1] w-full flex-col justify-between overflow-hidden rounded-xl p-3"
      style={{ backgroundColor: colors.bg }}
      aria-hidden="true"
    >
      {/* decorative accent bar */}
      <div
        className="absolute inset-x-0 top-0 h-[3px] opacity-60"
        style={{ backgroundColor: colors.accent }}
      />

      {/* category label — top left */}
      <span
        className="self-start rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em]"
        style={{ color: colors.accent, border: `1px solid ${colors.accent}33` }}
      >
        {colors.label}
      </span>

      {/* title snippet — bottom left */}
      <p
        className="max-w-[85%] font-display text-sm font-semibold leading-snug tracking-tight"
        style={{ color: '#f5f0e8cc' }}
      >
        {snippet}
      </p>
    </div>
  )
}
