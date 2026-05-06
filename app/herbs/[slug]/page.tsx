import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ExternalLink, Leaf } from 'lucide-react'
import { DetailCard, EvidenceBadge } from '@/components/ui'
import { getClaims, getCompounds, getHerbBySlug, getHerbCompoundMap, getHerbs } from '@/lib/runtime-data'
import { getHerbSearchLinks } from '@/lib/affiliate'
import { commonSupplementFaqJsonLd } from '@/lib/seo'
import { cleanSummary, formatDisplayLabel, isClean, list, text, unique } from '@/lib/display-utils'

type Params = { params: Promise<{ slug: string }> }
type HerbDetail = Record<string, any>
type RelatedLinkItem = { href: string; title: string; description: string }

const formatSlugLabel = (slug: string) => slug.split('-').filter(Boolean).map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')
const getHerbLabel = (herb: HerbDetail) => formatDisplayLabel(herb.displayName) || formatDisplayLabel(herb.name) || formatSlugLabel(herb.slug)

const getLeadText = (herb: HerbDetail) => {
  const effects = unique(list(herb.primary_effects)).slice(0, 3)
  if (effects.length) {
    return `Traditionally used for ${effects.join(', ')}.`
  }

  return cleanSummary(text(herb.summary) || text(herb.description), 'herb')
}

const splitSafety = (items: string[]) => {
  const cleaned = unique(items.map(formatDisplayLabel).filter(isClean)).slice(0, 10)

  return {
    avoidIf: cleaned.filter(item => /avoid|contraindicat|pregnan|allerg|do not/i.test(item)).slice(0, 5),
    useCautionWith: cleaned.filter(item => !/avoid|contraindicat|pregnan|allerg|do not/i.test(item)).slice(0, 5),
  }
}

const pmidUrl = (id: string) => `https://pubmed.ncbi.nlm.nih.gov/${id.replace(/\D/g, '')}`

const getRelatedCompounds = async (herb: HerbDetail): Promise<RelatedLinkItem[]> => {
  const [compoundMap, compounds] = await Promise.all([getHerbCompoundMap(), getCompounds()])
  const validCompoundSlugs = new Set(compounds.map((compound: any) => compound.slug).filter(Boolean))

  return compoundMap
    .filter((entry: any) => (entry.herbSlug || entry.herb_slug) === herb.slug)
    .map((entry: any) => ({
      href: `/compounds/${entry.canonicalCompoundId || entry.compound_slug}/`,
      title: formatDisplayLabel(entry.canonicalCompoundName || entry.compound_name),
      description: formatDisplayLabel(entry.relationship_reason || entry.reason || entry.mechanism || 'Related mechanism context'),
      slug: entry.canonicalCompoundId || entry.compound_slug,
    }))
    .filter((entry: any) => entry.slug && validCompoundSlugs.has(entry.slug))
    .slice(0, 6)
}

const BulletList = ({ items, color = 'bg-brand-700' }: { items: string[], color?: string }) => (
  <ul className="space-y-3 text-sm leading-7 text-[#46574d]">
    {items.map((item, index) => (
      <li key={`${item}-${index}`} className="flex gap-3">
        <span className={`mt-[0.55rem] h-1.5 w-1.5 flex-none rounded-full ${color}`} />
        <span>{item}</span>
      </li>
    ))}
  </ul>
)

export async function generateStaticParams() {
  const herbs = await getHerbs()
  return herbs.map((herb: any) => ({ slug: herb.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const herb = await getHerbBySlug(slug)
  if (!herb) return { title: 'Herb Not Found | The Hippie Scientist' }

  return {
    title: `${getHerbLabel(herb)} | Herb`,
    description: getLeadText(herb),
  }
}

export default async function HerbDetailPage({ params }: Params) {
  const { slug } = await params
  const herb = await getHerbBySlug(slug)
  if (!herb) notFound()

  const label = getHerbLabel(herb)
  const leadText = getLeadText(herb)
  const affiliateLinks = getHerbSearchLinks(label).filter(link => link.url && link.label)
  const relatedCompounds = await getRelatedCompounds(herb)
  const faqJsonLd = commonSupplementFaqJsonLd(`/herbs/${herb.slug}`)

  const claims = unique(
    (await getClaims())
      .filter((item: any) => (item.target_slug || item.targetSlug) === herb.slug)
      .map((item: any) => formatDisplayLabel(item.claim || item.text || item.title))
      .filter(isClean)
  ).slice(0, 6)

  const bestFor = unique([
    ...list(herb.primary_effects),
    ...claims,
  ].filter(isClean)).slice(0, 6)

  const mechanisms = unique([
    ...list(herb.mechanisms),
    formatDisplayLabel(herb.mechanism_summary)
  ].filter(isClean)).slice(0, 6)

  const safetyNote = formatDisplayLabel(herb.safetyNotes)

  const safetyItems = unique([
    safetyNote,
    ...list(herb.contraindications),
    ...list(herb.interactions),
  ].filter(isClean))

  const safety = splitSafety(safetyItems)

  const evidence = formatDisplayLabel(herb.evidence_grade) || 'Limited'
  const dosage = formatDisplayLabel(herb.dosage_range) || formatDisplayLabel(herb.dosage)
  const form = formatDisplayLabel(herb.oral_form) || formatDisplayLabel(herb.preparation)
  const timeToEffect = formatDisplayLabel(herb.time_to_effect)

  const pmids = unique([
    ...list(herb.pmid_list),
    ...list(herb.pmids),
    ...list(herb.references)
  ].filter(id => /\d/.test(id))).slice(0, 10)

  const toc = [
    bestFor.length ? ['best-for', 'Best for'] : null,
    mechanisms.length ? ['mechanisms', 'Mechanisms'] : null,
    safetyItems.length ? ['safety', 'Safety'] : null,
    (form || dosage || timeToEffect) ? ['forms', 'Forms & dosage'] : null,
    relatedCompounds.length ? ['related-compounds', 'Related compounds'] : null,
    pmids.length ? ['sources', 'Sources'] : null,
    affiliateLinks.length ? ['products', 'Product research'] : null,
  ].filter(Boolean) as string[][]

  return (
    <div className="grid gap-8 px-4 pb-20 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:px-8">
      {faqJsonLd ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} /> : null}

      <aside className="hidden lg:block">
        {toc.length > 0 ? (
          <nav className="sticky top-24 rounded-2xl border border-brand-900/10 bg-[rgba(255,253,247,0.92)] p-4 shadow-[0_10px_40px_rgba(29,74,47,0.06)]">
            <p className="eyebrow text-brand-700">On this page</p>
            <div className="mt-3 grid gap-2 text-sm">
              {toc.map(([href, title]) => (
                <a key={href} href={`#${href}`} className="rounded-lg px-3 py-2 font-medium text-[#46574d] transition-colors hover:bg-white hover:text-brand-800">
                  {title}
                </a>
              ))}
            </div>
          </nav>
        ) : null}
      </aside>

      <main className="detail-stack">
        <section className="hero-shell overflow-hidden rounded-[2rem] border border-brand-900/10 bg-[linear-gradient(180deg,#fffdf7_0%,#fbf6e9_100%)] p-6 shadow-card sm:p-8 lg:p-10">
          <div className="flex flex-wrap items-center gap-3">
            <Leaf className="text-brand-700" aria-hidden="true" />
            <h1 className="heading-premium max-w-4xl text-ink">{label}</h1>
            <EvidenceBadge value={evidence} />
          </div>

          <p className="text-reading mt-5 max-w-reading text-lg text-muted-soft">
            {leadText}
          </p>
        </section>

        {bestFor.length > 0 ? (
          <DetailCard id="best-for" eyebrow="Use Cases" title="Best for" description="Signals surfaced from the current profile and linked claim data.">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {bestFor.map(item => (
                <div key={item} className="surface-subtle rounded-2xl p-4 text-sm font-semibold text-ink">
                  {item}
                </div>
              ))}
            </div>
          </DetailCard>
        ) : null}

        {mechanisms.length > 0 ? (
          <DetailCard id="mechanisms" eyebrow="Mechanism Context" title="Mechanisms">
            <BulletList items={mechanisms} />
          </DetailCard>
        ) : null}

        {safetyItems.length > 0 ? (
          <DetailCard id="safety" eyebrow="Safety Context" title="Safety">
            <div className="grid gap-6 lg:grid-cols-2">
              {safety.avoidIf.length > 0 ? (
                <div className="rounded-2xl border border-red-700/10 bg-red-50/70 p-5">
                  <h3 className="text-base font-semibold text-ink">Avoid if</h3>
                  <div className="mt-4">
                    <BulletList items={safety.avoidIf} color="bg-red-700" />
                  </div>
                </div>
              ) : null}

              {safety.useCautionWith.length > 0 ? (
                <div className="rounded-2xl border border-amber-700/10 bg-amber-50/70 p-5">
                  <h3 className="text-base font-semibold text-ink">Use caution with</h3>
                  <div className="mt-4">
                    <BulletList items={safety.useCautionWith} color="bg-amber-600" />
                  </div>
                </div>
              ) : null}
            </div>

            {safetyNote ? (
              <div className="mt-6 surface-subtle rounded-2xl p-5">
                <h3 className="text-base font-semibold text-ink">General safety note</h3>
                <p className="mt-3 text-sm leading-7 text-[#46574d]">{safetyNote}</p>
              </div>
            ) : null}
          </DetailCard>
        ) : null}

        {(form || dosage || timeToEffect) ? (
          <DetailCard id="forms" eyebrow="Practical Context" title="Forms & dosage">
            <div className="grid gap-4 md:grid-cols-3">
              {form ? <div className="surface-subtle rounded-2xl p-5"><p className="eyebrow-label">Forms</p><p className="mt-3 text-sm leading-7 text-[#46574d]">{form}</p></div> : null}
              {dosage ? <div className="surface-subtle rounded-2xl p-5"><p className="eyebrow-label">Dosage note</p><p className="mt-3 text-sm leading-7 text-[#46574d]">{dosage}</p></div> : null}
              {timeToEffect ? <div className="surface-subtle rounded-2xl p-5"><p className="eyebrow-label">Time to effect</p><p className="mt-3 text-sm leading-7 text-[#46574d]">{timeToEffect}</p></div> : null}
            </div>
          </DetailCard>
        ) : null}

        {relatedCompounds.length > 0 ? (
          <DetailCard id="related-compounds" eyebrow="Compound Links" title="Related compounds">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {relatedCompounds.map(item => (
                <Link key={item.href} href={item.href} className="card-premium block p-5 hover:-translate-y-1">
                  <h3 className="text-base font-semibold text-ink">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#46574d]">{item.description}</p>
                  <p className="mt-4 text-sm font-semibold text-brand-800">Open compound →</p>
                </Link>
              ))}
            </div>
          </DetailCard>
        ) : null}

        {pmids.length > 0 ? (
          <DetailCard id="sources" eyebrow="Research References" title="PubMed links">
            <div className="flex flex-wrap gap-3">
              {pmids.map(id => (
                <a key={id} href={pmidUrl(id)} target="_blank" rel="noreferrer" className="chip-readable hover:text-brand-800">
                  PMID {id.replace(/\D/g, '')}
                </a>
              ))}
            </div>
          </DetailCard>
        ) : null}

        {affiliateLinks.length > 0 ? (
          <DetailCard id="products" eyebrow="Product Research" title="Search product options">
            <div className="grid gap-4 md:grid-cols-3">
              {affiliateLinks.map(link => (
                <a key={link.url} href={link.url} target="_blank" rel="sponsored noreferrer" className="surface-subtle rounded-2xl p-5 transition hover:-translate-y-0.5 hover:bg-white">
                  <h3 className="text-base font-semibold text-ink">{link.label}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#46574d]">{link.helperText}</p>
                  <p className="mt-4 inline-flex items-center text-sm font-semibold text-brand-800">
                    Search options <ExternalLink className="ml-1 h-3.5 w-3.5" />
                  </p>
                </a>
              ))}
            </div>
          </DetailCard>
        ) : null}
      </main>
    </div>
  )
}
