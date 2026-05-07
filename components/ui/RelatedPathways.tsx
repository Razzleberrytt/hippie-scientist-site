import type { PathwayCluster } from '@/lib/research-intelligence'

export default function RelatedPathways({ pathways = [] }: { pathways?: PathwayCluster[] }) {
  const visible = pathways.filter(pathway => pathway.mechanisms?.length).slice(0, 5)
  if (!visible.length) return null

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {visible.map(pathway => (
        <div key={pathway.title} className="surface-subtle rounded-2xl p-5">
          <h3 className="text-base font-semibold text-ink">{pathway.title}</h3>
          <p className="mt-2 text-sm leading-6 text-[#46574d]">{pathway.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {pathway.mechanisms.slice(0, 4).map(mechanism => (
              <span key={mechanism} className="rounded-full border border-brand-900/10 bg-white/75 px-3 py-1 text-xs font-medium text-[#46574d]">
                {mechanism}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
