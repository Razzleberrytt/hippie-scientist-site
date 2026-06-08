import type { ReactNode } from 'react'
import { buildEditorialProfile, type EditorialEntityType } from '@/lib/editorial-runtime'

type Props = {
  record: any
  entityType: EditorialEntityType
  effects?: string[]
  mechanisms?: string[]
  summary?: string
}

function SnapshotItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface-subtle rounded-2xl border border-brand-900/10 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-900/50">
        {label}
      </p>
      <p className="mt-2 text-sm leading-7 text-[#46574d]">
        {value}
      </p>
    </div>
  )
}

function ChipList({ items }: { items: string[] }) {
  if (items.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item} className="chip-readable">
          {item}
        </span>
      ))}
    </div>
  )
}

function EditorialCard({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="card-premium space-y-4 p-5 sm:p-6">
      <p className="eyebrow-label">{title}</p>
      {children}
    </section>
  )
}

export default function AuthorityEditorialLayer({
  record,
  entityType,
  effects = [],
  mechanisms = [],
  summary = '',
}: Props) {
  const editorial = buildEditorialProfile({
    record,
    entityType,
    effects,
    mechanisms,
    summary,
  })

  return (
    <section className="space-y-5">
      <section className="card-premium space-y-5 p-5 sm:p-6">
        <div className="space-y-2">
          <p className="eyebrow-label">Decision Snapshot</p>

          <h2 className="text-2xl font-semibold tracking-tight text-ink">
            Fast scientific interpretation
          </h2>

          <p className="max-w-3xl text-sm leading-7 text-[#5b6b61]">
            A compact, compact reading of the profile before deeper mechanism and safety context.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {editorial.decisionSnapshot.map((item) => (
            <SnapshotItem
              key={item.label}
              label={item.label}
              value={item.value}
            />
          ))}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <EditorialCard title={editorial.whyItMatters.title}>
          <p className="detail-reading text-[#46574d]">
            {editorial.whyItMatters.body}
          </p>

          <ChipList items={editorial.whyItMatters.chips} />
        </EditorialCard>

        <EditorialCard title={editorial.researchConfidence.title}>
          <p className="detail-reading text-[#46574d]">
            {editorial.researchConfidence.body}
          </p>

          <ChipList items={editorial.researchConfidence.chips} />
        </EditorialCard>

        <EditorialCard title={editorial.mechanismNarrative.title}>
          <p className="detail-reading text-[#46574d]">
            {editorial.mechanismNarrative.body}
          </p>

          <ChipList items={editorial.mechanismNarrative.chips} />
        </EditorialCard>

        <EditorialCard title={editorial.safetyNarrative.title}>
          <p className="detail-reading text-[#46574d]">
            {editorial.safetyNarrative.body}
          </p>

          <ChipList items={editorial.safetyNarrative.chips} />
        </EditorialCard>
      </div>
    </section>
  )
}
