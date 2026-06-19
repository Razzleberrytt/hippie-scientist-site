import {
  formatEvidenceLabel,
  getSafetySeverityTone,
  type EvidenceEngineSafetyNote,
} from '../../lib/evidence-engine'

type EvidenceSafetyNotesProps = {
  notes: EvidenceEngineSafetyNote[]
}

export default function EvidenceSafetyNotes({ notes }: EvidenceSafetyNotesProps) {
  if (notes.length === 0) return null

  return (
    <div className="mt-4 space-y-2">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-rose-800">Ingredient safety warnings</p>
      {notes.map((note) => (
        <div key={note.safety_id} className={`rounded-xl border p-3 text-xs leading-5 ${getSafetySeverityTone(note.severity)}`}>
          <strong>{formatEvidenceLabel(note.risk_type)}:</strong> {note.warning}
          <span className="mt-1 block">{note.decision_effect}</span>
        </div>
      ))}
    </div>
  )
}
