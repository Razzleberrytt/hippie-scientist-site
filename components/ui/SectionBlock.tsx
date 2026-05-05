export default function SectionBlock({ title, children }: any) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="text-sm text-neutral-700 leading-relaxed">
        {children}
      </div>
    </section>
  )
}
