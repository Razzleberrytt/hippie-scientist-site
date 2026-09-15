const SEVERITY_STYLES = {
  info: {
    bg: 'bg-blue-50/70 dark:bg-blue-300/10',
    border: 'border-blue-200/50 dark:border-blue-200/20',
    text: 'text-blue-900 dark:text-blue-100',
    label: 'Note',
  },
  caution: {
    bg: 'bg-amber-50/70 dark:bg-amber-300/10',
    border: 'border-amber-200/50 dark:border-amber-200/20',
    text: 'text-amber-950 dark:text-amber-100',
    label: 'Caution',
  },
  warning: {
    bg: 'bg-red-50/70 dark:bg-red-300/10',
    border: 'border-red-200/50 dark:border-red-200/20',
    text: 'text-red-950 dark:text-red-100',
    label: 'Warning',
  },
} as const

export type SafetySeverity = keyof typeof SEVERITY_STYLES

export interface SafetyNote {
  severity: SafetySeverity
  text: string
}

interface Props {
  notes: SafetyNote[]
  heading?: string
}

export default function SafetyBox({ notes, heading }: Props) {
  const hasMultipleNotes = notes.length > 1

  return (
    <div className="space-y-3">
      {heading && (
        <h2 className="text-xl font-bold text-ink">{heading}</h2>
      )}
      <div
        className={hasMultipleNotes ? 'grid gap-3 sm:grid-cols-2' : 'space-y-3'}
        aria-label={hasMultipleNotes ? 'Safety and caution notes' : undefined}
        data-mobile-safety-stack={hasMultipleNotes ? 'true' : undefined}
      >
        {notes.map((note, i) => {
          const style = SEVERITY_STYLES[note.severity]
          return (
            <div
              key={`${note.severity}-${i}`}
              className={`rounded-xl border p-4 text-sm leading-6 ${style.bg} ${style.border} ${style.text} ${
                hasMultipleNotes ? 'h-full' : ''
              }`}
            >
              <strong className="font-semibold">{style.label}: </strong>
              {note.text}
            </div>
          )
        })}
      </div>
    </div>
  )
}
