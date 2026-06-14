const SEVERITY_STYLES = {
  info: {
    bg: 'bg-blue-50/70',
    border: 'border-blue-200/50',
    text: 'text-blue-900',
    label: 'Note',
  },
  caution: {
    bg: 'bg-amber-50/70',
    border: 'border-amber-200/50',
    text: 'text-amber-950',
    label: 'Caution',
  },
  warning: {
    bg: 'bg-red-50/70',
    border: 'border-red-200/50',
    text: 'text-red-950',
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
  return (
    <div className="space-y-3">
      {heading && (
        <h2 className="text-xl font-bold text-ink">{heading}</h2>
      )}
      {notes.map((note, i) => {
        const style = SEVERITY_STYLES[note.severity]
        return (
          <div
            key={i}
            className={`rounded-xl border p-4 text-sm leading-6 ${style.bg} ${style.border} ${style.text}`}
          >
            <strong className="font-semibold">{style.label}: </strong>
            {note.text}
          </div>
        )
      })}
    </div>
  )
}
