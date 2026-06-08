interface SafetyNoticeProps {
  title?: string
  children: React.ReactNode
}

export default function SafetyNotice({
  title = 'Safety considerations',
  children,
}: SafetyNoticeProps) {
  return (
    <section className="rounded-3xl border border-amber-300 bg-amber-50 p-6 space-y-4">
      <div className="space-y-2">
        <p className="eyebrow-label text-amber-900">
          Educational Safety Notice
        </p>

        <h2 className="text-2xl font-semibold tracking-tight text-amber-950">
          {title}
        </h2>
      </div>

      <div className="text-sm leading-7 text-amber-950/90">
        {children}
      </div>
    </section>
  )
}
