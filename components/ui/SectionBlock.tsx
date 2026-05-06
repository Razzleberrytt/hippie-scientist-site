export default function SectionBlock({ title, children }: any) {
  return (
    <section className="space-y-4 rounded-3xl border border-brand-900/10 bg-white/72 p-5 shadow-sm backdrop-blur-xl sm:p-6">
      <h2 className="font-sans text-xl font-semibold tracking-tight text-ink">{title}</h2>
      <div className="text-sm leading-7 text-neutral-700">
        {children}
      </div>
    </section>
  )
}
