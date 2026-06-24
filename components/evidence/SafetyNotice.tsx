interface SafetyNoticeProps {
  title?: string
  children: React.ReactNode
}

export default function SafetyNotice({
  title = 'Safety considerations',
  children,
}: SafetyNoticeProps) {
  return (
    <section className="space-y-4 rounded-3xl border border-amber-600/25 bg-amber-50/85 p-6 dark:border-amber-200/25 dark:bg-amber-300/10">
      <div className="space-y-2">
        <p className="eyebrow-label text-amber-800 dark:text-amber-100">
          Educational Safety Notice
        </p>

        <h2 className="text-2xl font-semibold tracking-tight text-amber-950 dark:text-amber-50 sm:text-3xl">
          {title}
        </h2>
      </div>

      <div className="text-sm leading-7 text-amber-950/90 dark:text-amber-50/90 sm:text-base">
        {children}
      </div>
    </section>
  )
}
