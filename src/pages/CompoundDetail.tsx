import { useEffect, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import Meta from '@/components/Meta'
import { decorateCompounds } from '@/lib/compounds'
import { useHerbData } from '@/lib/herb-data'
import { slugify } from '@/lib/slug'
import { getDisplayName, recommendRelatedCompounds, recommendRelatedHerbs } from '@/lib/discovery'
import { getTopClickedCompounds, pushRecentlyViewed, trackEvent, useSavedItems } from '@/lib/growth'
import ContextualLeadMagnet from '@/components/ContextualLeadMagnet'
import { CTA } from '@/lib/cta'
import ShareInsightCard from '@/components/ShareInsightCard'
import { getSnippet } from '@/utils/contentSnippets'

const compounds = decorateCompounds()
type Param = { slug?: string }

function splitNotes(input: string) {
  return input
    .split(/\n|;|\.|•/g)
    .map(part => part.trim())
    .filter(Boolean)
}

function riskLevelText(rawRisk: string) {
  const value = rawRisk.toLowerCase()
  if (/(high|severe|toxic|unsafe)/.test(value)) return 'High'
  if (/(moderate|caution|interaction|unknown)/.test(value)) return 'Moderate'
  if (/(low|minimal|mild)/.test(value)) return 'Low'
  return 'Moderate'
}

function evidenceChips(sourceCount: number, hasMechanism: boolean, hasHumanSignals: boolean) {
  const chips: string[] = []
  chips.push('Preclinical research')
  if (hasHumanSignals) chips.push('Limited human data')
  if (sourceCount > 2 && hasMechanism) chips.push('Well-studied')
  if (!chips.includes('Limited human data')) chips.push('Traditional use')
  return chips
}

export default function CompoundDetail() {
  const { slug } = useParams<Param>()
  const compound = compounds.find(entry => entry.slug === slug)
  const herbs = useHerbData()
  const { toggle, isSaved } = useSavedItems()

  useEffect(() => {
    if (!compound) return
    const title = compound.common || compound.scientific || compound.name || 'Compound'
    pushRecentlyViewed({
      type: 'compound',
      slug: compound.slug,
      title,
      href: `/compounds/${compound.slug}`,
    })
    trackEvent('detail_click', { kind: 'compound', slug: compound.slug, action: 'view' })
  }, [compound])

  if (!compound) {
    return (
      <main className='container mx-auto max-w-3xl px-4 py-10 text-white'>
        <section className='ds-card-lg'>
          <p className='text-xs uppercase tracking-[0.14em] text-white/60'>Not Found</p>
          <h1 className='mt-2 text-2xl font-semibold'>Compound profile not found</h1>
          <Link className='btn-primary mt-5 inline-flex' to='/compounds'>
            ← Back to compounds
          </Link>
        </section>
      </main>
    )
  }

  const title = compound.common || compound.scientific || compound.name || 'Compound'
  const description = compound.description || compound.effects || 'Compound profile'
  const mechanism = compound.benefits || compound.effects || ''
  const effects = splitNotes(compound.effectsSummary || compound.effects || '')
  const contraindications = Array.isArray(compound.contraindications)
    ? compound.contraindications
    : splitNotes(compound.contraindications || '')
  const sideEffects = splitNotes(compound.sideEffects || compound.safety || compound.toxicity || '')
  const riskRaw = compound.safety || compound.toxicity || compound.intensityLabel || 'Use caution'
  const riskLevel = riskLevelText(riskRaw)
  const lastUpdated = String((compound as any).lastUpdated || '')
  const sources = Array.isArray((compound as any).sources)
    ? ((compound as any).sources as string[])
    : []
  const evidence = evidenceChips(
    Array.isArray((compound as any).sources) ? (compound as any).sources.length : 0,
    Boolean(mechanism),
    Boolean(compound.effectsSummary)
  )

  const foundIn = Array.isArray(compound.compounds) ? compound.compounds : []
  const relatedHerbs = recommendRelatedHerbs(compound, herbs, 5)
  const foundHerbs = foundIn
    .map(name =>
      herbs.find(
        item => slugify(item.common || item.scientific || item.slug || '') === slugify(name)
      )
    )
    .filter(Boolean)
  const herbLinks = (foundHerbs.length ? foundHerbs : relatedHerbs).slice(0, 5)
  const relatedCompounds = recommendRelatedCompounds(
    compound,
    compounds.filter(c => c.slug !== compound.slug),
    5
  )
  const fallbackCompounds = compounds.filter(c => c.slug !== compound.slug).slice(0, 3)
  const saved = isSaved('compound', compound.slug)
  const shareInsight = `${title} is associated with ${effects[0] || 'distinct receptor-level effects'} and should always be interpreted through dose + safety context.`
  const snippet = getSnippet('compound', compound.slug)
  const trendingCompounds = getTopClickedCompounds(4).filter(item => item.slug !== compound.slug)

  return (
    <>
      <Meta
        title={`${title} — The Hippie Scientist`}
        description={description}
        path={`/compounds/${slug ?? ''}`}
        pageType='article'
      />
      <main className='container mx-auto max-w-4xl px-4 py-10 text-white'>
        <Link className='btn-secondary inline-flex items-center rounded-full px-4' to='/compounds'>
          ← Back to compounds
        </Link>
        <article className='ds-card-lg ds-section ds-stack mt-4'>
          <header className='border-b border-white/10 pb-4'>
            <h1 className='text-4xl font-semibold text-white'>{title}</h1>
            {compound.scientific && compound.common && compound.common !== compound.scientific && (
              <p className='mt-1 text-white/65'>{compound.scientific}</p>
            )}
            <p className='mt-2 text-xs text-white/60'>Built for clarity, not hype.</p>
            {lastUpdated && (
              <p className='mt-1 text-xs text-emerald-100/85'>
                Last updated: {lastUpdated.slice(0, 10)}
              </p>
            )}
            <button
              className='mt-3 w-fit rounded-full border border-white/20 px-3 py-1 text-sm text-white/85'
              onClick={() =>
                toggle({
                  type: 'compound',
                  slug: compound.slug,
                  title,
                  href: `/compounds/${compound.slug}`,
                  note: description,
                })
              }
            >
              {saved ? '★ Favorited' : '☆ Favorite'}
            </button>
            <p className='mt-2 text-xs text-white/60'>
              Save this for later and get deeper insights.
            </p>
            <ShareInsightCard
              title={title}
              insight={shareInsight}
              kind='compound'
              slug={compound.slug}
            />
          </header>

          <Section title='Overview' label='Research-backed'>
            <p className='mt-2 text-sm leading-7 text-white/85'>{description}</p>
            <div className='mt-3 flex flex-wrap gap-2'>
              <Link to={`/compounds/${compound.slug}`} className='btn-secondary'>
                Read full breakdown
              </Link>
              <Link to='/blend' className='btn-secondary'>
                Build a blend with this
              </Link>
            </div>
          </Section>

          {snippet && (
            <Section title='Distribution snippet' label='Social + email ready'>
              <ul className='text-white/82 mt-2 space-y-2 text-sm'>
                <li>
                  <strong className='text-white'>Hook:</strong> {snippet.hook}
                </li>
                <li>
                  <strong className='text-white'>Explanation:</strong> {snippet.explanation}
                </li>
                <li>
                  <strong className='text-white'>Safety note:</strong> {snippet.safetyNote}
                </li>
              </ul>
            </Section>
          )}

          <Section title='Class' label='Taxonomy + profile'>
            <dl className='mt-3 grid gap-3 text-sm sm:grid-cols-2'>
              <Fact label='Primary class' value={compound.compoundClasses?.[0] || 'Unclassified'} />
              <Fact
                label='Pharmacology'
                value={compound.pharmCategories?.join(', ') || 'Not specified'}
              />
            </dl>
          </Section>

          <Section title='Mechanism' label='Mechanism overview'>
            <p className='mt-2 text-sm leading-7 text-white/85'>
              {mechanism || 'Mechanistic evidence is currently limited in this profile.'}
            </p>
          </Section>

          <Section title='Effects' label='Observed outcomes'>
            <ul className='text-white/82 mt-2 list-disc space-y-2 pl-5 text-sm leading-7'>
              {(effects.length ? effects : ['Effects vary by dose, route, and individual biology.'])
                .slice(0, 6)
                .map(note => (
                  <li key={note}>{note}</li>
                ))}
            </ul>
          </Section>

          <Section title='Safety' label='Safety profile'>
            {contraindications.length > 0 && (
              <div className='mb-3 flex flex-wrap gap-2'>
                {contraindications.slice(0, 8).map(item => (
                  <span
                    key={item}
                    className='rounded-full border border-rose-400/50 bg-rose-500/15 px-2.5 py-1 text-xs text-rose-100'
                  >
                    {item}
                  </span>
                ))}
              </div>
            )}
            <SafetyBlock
              riskLevel={riskLevel}
              contraindications={contraindications}
              sideEffects={sideEffects}
              evidenceQuality={
                evidence.includes('Well-studied') ? 'Moderate to strong' : 'Limited to moderate'
              }
              cautionNote={riskRaw}
            />
          </Section>
          {sources.length > 0 && (
            <Section title='Sources' label='Citations'>
              <ol className='text-white/82 mt-2 list-decimal space-y-2 pl-5 text-sm'>
                {sources.map(source => (
                  <li key={source}>
                    {/^https?:\/\//i.test(source) ? (
                      <a
                        href={source}
                        target='_blank'
                        rel='noreferrer'
                        className='link text-[color:var(--accent)]'
                      >
                        {source}
                      </a>
                    ) : (
                      source
                    )}
                  </li>
                ))}
              </ol>
            </Section>
          )}

          <Section title='Related herbs' label='Cross-reference'>
            <ul className='text-white/82 mt-2 list-disc space-y-2 pl-5 text-sm'>
              {herbLinks.map((item: any) => (
                <li key={`herb-${item.slug}`}>
                  <Link className='link text-[color:var(--accent)]' to={`/herbs/${item.slug}`}>
                    {getDisplayName(item)}
                  </Link>
                </li>
              ))}
            </ul>
          </Section>

          <Section title='Research Notes' label='Evidence quality'>
            <div className='mt-2 flex flex-wrap gap-2'>
              {evidence.map(chip => (
                <span key={chip} className='ds-pill'>
                  {chip}
                </span>
              ))}
            </div>
          </Section>
        </article>
        <ContextualLeadMagnet
          context='compound'
          title='Learn how this compound is used in blends'
          subtitle='Get the free guide with beginner-safe examples and confidence labels.'
        />

        <section className='ds-card-lg ds-section'>
          <h2 className='text-lg font-semibold text-white'>Explore Next</h2>
          <p className='mt-1 text-sm text-white/70'>
            If you found this interesting… continue the loop.
          </p>
          <div className='mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            <ExploreColumn
              title='Compare with…'
              items={(relatedCompounds.length ? relatedCompounds : fallbackCompounds).map(item => ({
                label: item.common || item.name || item.scientific || item.slug,
                href: `/compounds/${item.slug}`,
              }))}
            />
            <ExploreColumn
              title='Explore similar mechanisms'
              items={herbLinks.map((item: any) => ({
                label: getDisplayName(item),
                href: `/herbs/${item.slug}`,
              }))}
            />
            <ExploreColumn
              title='Jump to another herb'
              items={(foundHerbs.length ? foundHerbs : herbs.slice(0, 3)).map((item: any) => ({
                label: getDisplayName(item),
                href: `/herbs/${item.slug}`,
              }))}
            />
          </div>
        </section>
        <section className='ds-card-lg ds-section'>
          <h2 className='text-lg font-semibold text-white'>Trending now</h2>
          <p className='mt-1 text-sm text-white/70'>Get deeper insights from trending compounds.</p>
          <div className='mt-3 flex flex-wrap gap-2'>
            {(trendingCompounds.length ? trendingCompounds : fallbackCompounds)
              .slice(0, 4)
              .map(item => (
                <Link key={item.slug} className='btn-secondary' to={`/compounds/${item.slug}`}>
                  {item.slug}
                </Link>
              ))}
          </div>
        </section>
        <ContextualLeadMagnet
          context='compound'
          title='Turn this compound insight into a safe starter blend'
          subtitle='Get guide + save your first blend workflow.'
        />
      </main>
    </>
  )
}

function Section({
  title,
  label,
  children,
}: {
  title: string
  label: string
  children: ReactNode
}) {
  return (
    <section>
      <p className='text-xs font-semibold uppercase tracking-[0.15em] text-white/55'>{label}</p>
      <h2 className='mt-1 text-xl font-semibold text-white'>{title}</h2>
      {children}
    </section>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className='rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2'>
      <dt className='text-[11px] font-semibold uppercase tracking-wide text-white/60'>{label}</dt>
      <dd className='mt-1 text-sm text-white/85'>{value}</dd>
    </div>
  )
}

function SafetyBlock({
  riskLevel,
  contraindications,
  sideEffects,
  evidenceQuality,
  cautionNote,
}: {
  riskLevel: string
  contraindications: string[]
  sideEffects: string[]
  evidenceQuality: string
  cautionNote: string
}) {
  return (
    <div className='mt-3 rounded-xl border border-amber-300/35 bg-amber-500/10 p-4'>
      <p className='text-sm font-semibold text-amber-100'>⚠️ Safety-first review required</p>
      <dl className='mt-3 space-y-2 text-sm text-white/85'>
        <div>
          <dt className='font-semibold text-white'>Risk level</dt>
          <dd>{riskLevel}</dd>
        </div>
        <div>
          <dt className='font-semibold text-white'>Contraindications</dt>
          <dd>{contraindications.join('; ') || 'Not clearly documented in this profile.'}</dd>
        </div>
        <div>
          <dt className='font-semibold text-white'>Known side effects</dt>
          <dd>{sideEffects.join('; ') || 'Side effect reporting is currently limited.'}</dd>
        </div>
        <div>
          <dt className='font-semibold text-white'>Evidence quality</dt>
          <dd>{evidenceQuality}</dd>
        </div>
      </dl>
      <p className='mt-3 text-xs text-white/75'>{cautionNote}</p>
      <p className='mt-2 text-xs text-white/80'>Educational purposes only.</p>
    </div>
  )
}

function ExploreColumn({
  title,
  items,
}: {
  title: string
  items: Array<{ label: string; href: string }>
}) {
  return (
    <div>
      <h3 className='text-xs font-semibold uppercase tracking-[0.13em] text-white/60'>{title}</h3>
      <ul className='mt-2 space-y-2'>
        {items.slice(0, 4).map(item => (
          <li key={`${title}-${slugify(item.label)}`}>
            <Link
              to={item.href}
              onClick={() =>
                trackEvent('detail_click', { source: `compound_${title}`, target: item.href })
              }
              className='text-white/84 text-sm underline decoration-white/35 underline-offset-2 hover:text-white'
            >
              {item.label} · {CTA.primary.viewDetails}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
