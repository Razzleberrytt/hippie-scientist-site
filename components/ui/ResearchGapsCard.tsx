export default function ResearchGapsCard({ gaps = [], limitations = [] }: { gaps?: string[]; limitations?: string[] }) {
  const visible = [...limitations, ...gaps].filter(Boolean).slice(0, 6)
  if (visible.length < 2) return null

  return (
    <div className="surface-depth rounded-2xl p-5 sm:p-6">
      <p className="eyebrow-label">Research gaps</p>
      <h3 className="mt-2 text-xl font-semibold tracking-tight text-ink">What remains uncertain</h3>
      <ul className="mt-5 space-y-3 text-sm leading-7 text-[#46574d]">
        {visible.map((item, index) => (
          <li key={`${item}-${index}`} className="flex gap-3">
            <span className="mt-[0.55rem] h-1.5 w-1.5 flex-none rounded-full bg-amber-600" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
