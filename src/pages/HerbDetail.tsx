import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import Meta from '../components/Meta'
import HerbDetails, { normalizeHerbDetails } from '../components/HerbDetails'
import { Button } from '../components/ui/Button'
import postsData from '../data/blog/posts.json'
import { relatedPostsByHerbSlug } from '../lib/relevance'
import { cleanLine, hasVal, titleCase } from '../lib/pretty'
import { pick } from '../lib/present'
import { getCommonName } from '../lib/herbName'
import { useHerbData } from '@/lib/herb-data'
import type { Herb } from '@/types'

type BlogPost = {
  slug: string
  title: string
  date?: string
  description?: string
}

const blogPosts = postsData as BlogPost[]

type Param = {
  slug?: string
}

function RelatedPosts({ slug }: { slug?: string }) {
  if (!slug) return null
  const posts = relatedPostsByHerbSlug(slug, 3)
    .map(ref => blogPosts.find(p => p.slug === ref?.slug))
    .filter((p): p is BlogPost => Boolean(p))
  if (!posts.length) return null

  return (
    <section className='card bg-[color-mix(in_oklab,var(--surface-c)_92%,transparent_8%)] p-5 backdrop-blur'>
      <h2 className='text-lg font-semibold text-[color:var(--text-c)]'>Related Posts</h2>
      <ul className='mt-3 space-y-3'>
        {posts.map(p => (
          <li key={p.slug} className='text-sm text-[color:var(--muted-c)]'>
            <Link to={`/blog/${p.slug}/`} className='link text-[color:var(--accent)]'>
              {p.title}
            </Link>
            {p.date && (
              <p className='text-xs text-[color:color-mix(in_oklab,var(--muted-c)_75%,transparent_25%)]'>
                {new Date(p.date).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            )}
            {p.description && (
              <p className='text-xs text-[color:color-mix(in_oklab,var(--muted-c)_85%,transparent_15%)]'>
                {p.description}
              </p>
            )}
          </li>
        ))}
      </ul>
      <div className='mt-4 text-sm text-[color:var(--muted-c)]'>
        <Link to='/blog/' className='link text-[color:var(--accent)]'>
          View all posts →
        </Link>
      </div>
    </section>
  )
}

export default function HerbDetail() {
  const { slug } = useParams<Param>()
  const herbs = useHerbData()
  const herb = useMemo(() => herbs.find((h: Herb) => h.slug === slug), [herbs, slug])

  if (!herb) {
    if (!herbs.length) {
      return <main className='container py-6'>Loading…</main>
    }
    return <main className='container py-6'>Not found.</main>
  }

  const details = normalizeHerbDetails(herb)
  const scientificName =
    herb.scientific || (herb as any).scientificName || (herb as any).binomial || herb.name
  const rawCommon = herb.common ? titleCase(String(herb.common)) : undefined
  const normalizedCommon = getCommonName(herb) ?? rawCommon
  const commonName =
    normalizedCommon &&
    scientificName &&
    normalizedCommon.toLowerCase() === scientificName.toLowerCase()
      ? undefined
      : normalizedCommon
  const displayTitle = commonName ?? scientificName ?? 'Herb'
  const description = details.description || details.effects || 'Herb profile'
  const intensityLevel = herb.intensityLevel || null
  const intensityLabel = herb.intensityLabel || (intensityLevel ? titleCase(intensityLevel) : '')
  const intensityClass = (() => {
    switch (intensityLevel) {
      case 'strong':
        return 'border border-[color:rgba(248,113,113,0.45)] bg-[rgba(244,63,94,0.12)] text-[color:#ffdada]'
      case 'moderate':
        return 'border border-[color:color-mix(in_oklab,var(--accent),white_25%)] bg-[color-mix(in_oklab,var(--accent)_18%,var(--surface-c)_82%)] text-[color:color-mix(in_oklab,var(--accent)_20%,var(--text-c)_80%)]'
      case 'mild':
        return 'border border-[color:rgba(52,211,153,0.45)] bg-[rgba(34,197,94,0.15)] text-[color:#defce7]'
      case 'variable':
        return 'border border-[color:rgba(56,189,248,0.35)] bg-[rgba(56,189,248,0.14)] text-[color:#d6f3ff]'
      case 'unknown':
      default:
        return 'border border-[color:color-mix(in_oklab,var(--border-c)_80%,transparent_20%)] bg-[color-mix(in_oklab,var(--surface-c)_92%,transparent_8%)] text-[color:var(--muted-c)]'
    }
  })()
  const benefits = cleanLine((herb as any).benefits || herb.benefits || '')

  const safety = cleanLine(herb.safety || pick.safety(herb))
  const therapeutic = cleanLine(herb.therapeutic || pick.therapeutic(herb))
  const sideEffects = pick
    .sideeffects(herb)
    .map(effect => cleanLine(effect))
    .filter(Boolean)
  const toxicity = cleanLine(herb.toxicity || pick.toxicity(herb))
  const toxicityLd50 = cleanLine(
    (herb.toxicity_ld50 as string) ||
      (herb as any).toxicityld50 ||
      (herb as any).toxicityLD50 ||
      pick.toxicity_ld50(herb)
  )
  const mechanism = cleanLine(herb.mechanism || pick.mechanism(herb))
  const pharmacology = cleanLine((herb as any).pharmacology || (herb as any).pharmacokinetics || '')

  const hasSafetyExtras = Boolean(
    safety || therapeutic || toxicity || toxicityLd50 || (sideEffects && sideEffects.length > 0)
  )
  const hasMechanism = Boolean(mechanism || pharmacology)

  return (
    <>
      <Meta
        title={`${displayTitle} — The Hippie Scientist`}
        description={description}
        path={`/herb/${slug}`}
        pageType='article'
        image={herb.og || (herb.slug ? `/og/herb/${herb.slug}.png` : '/og/default.png')}
        og={{
          image: herb.og || (herb.slug ? `/og/herb/${herb.slug}.png` : '/og/default.png'),
        }}
      />
      <main className='container py-6'>
        <div className='mx-auto flex max-w-3xl flex-col gap-6'>
          <article className='card bg-[color-mix(in_oklab,var(--surface-c)_94%,transparent_6%)] p-6 shadow-[0_30px_80px_rgba(0,0,0,.25)] backdrop-blur'>
            <header className='flex flex-col gap-2 border-b border-b-[color:var(--border-c)] pb-4'>
              <h1 className='text-3xl font-semibold text-[color:var(--accent)]'>{displayTitle}</h1>
              {hasVal(scientificName) && (
                <p className='italic text-[color:var(--muted-c)]'>{scientificName}</p>
              )}
              {intensityLabel && intensityLevel && intensityLevel !== 'unknown' && (
                <span
                  className={`pill hover-glow focus-glow mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/85 ${intensityClass}`}
                >
                  Intensity: {intensityLabel}
                </span>
              )}
              {hasVal(benefits) && (
                <span className='pill hover-glow focus-glow mt-2 text-[12px] text-white/80'>
                  {benefits}
                </span>
              )}
            </header>

            <div className='mt-4 flex flex-wrap gap-2 text-sm text-[color:var(--muted-c)]'>
              <Button
                variant='ghost'
                data-fav={herb.slug}
                className='px-3 py-1 text-current'
                onClick={() => {
                  toast('Added to favorites ❤️')
                }}
              >
                ★ Favorite
              </Button>
              <Button
                variant='ghost'
                data-compare={herb.slug}
                className='px-3 py-1 text-current'
                onClick={() => {
                  toast('Added to compare list 🔄')
                }}
              >
                ⇄ Compare
              </Button>
              <Button
                variant='ghost'
                className='px-3 py-1 text-current'
                onClick={() =>
                  navigator.share?.({
                    title: herb.common || herb.scientific,
                    url: typeof window !== 'undefined' ? window.location.href : undefined,
                  })
                }
              >
                ↗ Share
              </Button>
            </div>

            <div className='mt-6 space-y-5 text-[color:var(--text-c)]'>
              <HerbDetails herb={herb} />
            </div>
          </article>

          {hasSafetyExtras && (
            <section className='card bg-[color-mix(in_oklab,var(--surface-c)_92%,transparent_8%)] p-5 shadow-sm backdrop-blur-sm'>
              <h2 className='text-lg font-semibold text-[color:var(--text-c)]'>Safety Notes</h2>
              <div className='mt-3 space-y-3 text-sm text-[color:var(--muted-c)]'>
                {safety && <p>{safety}</p>}
                {therapeutic && (
                  <p>
                    <strong className='text-[color:var(--text-c)]'>Therapeutic uses:</strong>{' '}
                    {therapeutic}
                  </p>
                )}
                {sideEffects && sideEffects.length > 0 && (
                  <div>
                    <strong className='text-[color:var(--text-c)]'>Side effects:</strong>
                    <ul className='mt-1 list-disc space-y-1 pl-5'>
                      {sideEffects.map((effect, index) => (
                        <li key={`effect-${index}`}>{effect}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {toxicity && (
                  <p>
                    <strong className='text-[color:var(--text-c)]'>Toxicity:</strong> {toxicity}
                  </p>
                )}
                {toxicityLd50 && (
                  <p>
                    <strong className='text-[color:var(--text-c)]'>LD50:</strong> {toxicityLd50}
                  </p>
                )}
              </div>
            </section>
          )}

          {hasMechanism && (
            <section className='card bg-[color-mix(in_oklab,var(--surface-c)_92%,transparent_8%)] p-5 shadow-sm backdrop-blur-sm'>
              <h2 className='text-lg font-semibold text-[color:var(--text-c)]'>
                Mechanism &amp; Pharmacology
              </h2>
              <div className='mt-3 space-y-3 text-sm text-[color:var(--muted-c)]'>
                {mechanism && <p>{mechanism}</p>}
                {pharmacology && (
                  <p>
                    <strong className='text-[color:var(--text-c)]'>Pharmacology:</strong>{' '}
                    {pharmacology}
                  </p>
                )}
              </div>
            </section>
          )}

          <RelatedPosts slug={herb.slug} />

          <div className='text-sm text-[color:var(--muted-c)]'>
            <Link to='/herbs' className='link text-[color:var(--accent)]'>
              ← Back to Database
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
