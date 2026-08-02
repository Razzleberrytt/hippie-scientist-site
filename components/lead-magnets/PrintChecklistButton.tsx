'use client'

export default function PrintChecklistButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="button-primary inline-flex min-h-11 items-center justify-center px-5 py-3 text-sm"
    >
      Print checklist
    </button>
  )
}
