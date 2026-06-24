type Props = {
  mechanism: string
  detail?: string
}

export default function MechanismCard({ mechanism, detail }: Props) {
  return (
    <div className="rounded-xl border border-brand-900/8 bg-brand-50/40 px-3 py-2.5 dark:border-white/10 dark:bg-white/5">
      <p className="text-xs font-semibold text-ink">{mechanism}</p>
      {detail && <p className="mt-0.5 text-[0.7rem] leading-4 text-muted">{detail}</p>}
    </div>
  )
}
