import Link from 'next/link'

type SidebarLink = {
  href: string
  label: string
  meta?: string
}

type AuthoritySidebarProps = {
  title?: string
  topics?: SidebarLink[]
  comparisons?: SidebarLink[]
  protocols?: SidebarLink[]
  stacks?: SidebarLink[]
}

function SidebarSection({
  title,
  items,
}: {
  title: string
  items: SidebarLink[]
}) {
  if (!items.length) return null

  return (
    <section className="card-premium p-5 space-y-4">
      <div className="space-y-1">
        <p className="eyebrow-label">Authority Discovery</p>
        <h3 className="text-lg font-semibold tracking-tight text-ink">
          {title}
        </h3>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="surface-subtle block rounded-2xl p-4 transition hover:bg-white/70"
          >
            <div className="space-y-1">
              <p className="font-medium leading-tight text-ink">
                {item.label}
              </p>

              {item.meta ? (
                <p className="text-xs leading-6 text-[#5c6b63]">
                  {item.meta}
                </p>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default function AuthoritySidebar({
  title = 'Related Ecosystems',
  topics = [],
  comparisons = [],
  protocols = [],
  stacks = [],
}: AuthoritySidebarProps) {
  return (
    <aside className="space-y-5">
      <SidebarSection
        title={title}
        items={topics}
      />

      <SidebarSection
        title="Comparisons"
        items={comparisons}
      />

      <SidebarSection
        title="Protocols"
        items={protocols}
      />

      <SidebarSection
        title="Stacks"
        items={stacks}
      />
    </aside>
  )
}
