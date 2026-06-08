import Link from 'next/link'
import { cleanEditorialText, isDuplicateTitleBody, isRenderableText, shouldRenderCard } from '@/lib/editorial-rendering'

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
  const cleanTitle = cleanEditorialText(title)
  const renderableItems = items
    .map((item) => ({
      ...item,
      label: cleanEditorialText(item.label),
      meta: cleanEditorialText(item.meta),
    }))
    .filter((item) => item.href && shouldRenderCard(item.label, item.meta))

  if (!renderableItems.length || !cleanTitle) return null

  return (
    <section className="card-premium p-5 space-y-4">
      <div className="space-y-1">
        <p className="eyebrow-label">Authority Discovery</p>
        <h3 className="text-lg font-semibold tracking-tight text-ink">
          {cleanTitle}
        </h3>
      </div>

      <div className="space-y-3">
        {renderableItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="surface-subtle block rounded-2xl p-4 transition hover:bg-white/70"
          >
            <div className="space-y-1">
              <p className="font-medium leading-tight text-ink">
                {item.label}
              </p>

              {isRenderableText(item.meta) && !isDuplicateTitleBody(item.label, item.meta) ? (
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
