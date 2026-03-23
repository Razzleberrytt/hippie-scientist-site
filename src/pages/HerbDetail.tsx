import { type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import Meta from '@/components/Meta'
import InfoTooltip from '@/components/InfoTooltip'
import DataTrustPanel from '@/components/trust/DataTrustPanel'
import Disclaimer from '@/components/Disclaimer'
import { useHerbData } from '@/lib/herb-data'
import { pickNonEmptyKeys } from '@/lib/nonEmptyFields'
import { extractPrimaryEffects } from '@/utils/extractPrimaryEffects'
import { calculateHerbConfidence } from '@/utils/calculateConfidence'
import { getHerbDataCompleteness } from '@/utils/getDataCompleteness'

type SourceRef = { title: string; url: string; note?: string }
const ISSUE_TEMPLATE_URL =
  'https://github.com/Razzleberrytt/survive-99-evolved/issues/new?template=evidence-update.yml'

function toList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(v => String(v).trim()).filter(Boolean)
  if (typeof value === 'string') {
    return value
      .split(/[\n;,|]/)
      .map(item => item.trim())
      .filter(Boolean)
  }
  return []
}

function toSources(value: unknown): SourceRef[] {
  if (!Array.isArray(value)) return []
  return value
    .map(item => {
      if (typeof item === 'string') return { title: item, url: item }
      if (!item || typeof item !== 'object') return null
      const source = item as Record<string, unknown>
      const title = String(source.title || source.url || '').trim()
      const url = String(source.url || '').trim()
      if (!title && !url) return null
      const note = String(source.note || '').trim()
      return { title: title || url, url: url || title, note: note || undefined }
    })
    .filter((item): item is SourceRef => Boolean(item))
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className='mt-6'>
      <h2 className='text-lg font-semibold text-white'>{title}</h2>
      <div className='mt-2 text-sm text-white/85'>{children}</div>
    </section>
  )
}

export default function HerbDetail() {
  const { slug = '' } = useParams()
  const herbs = useHerbData()
  const herb = herbs.find(item => item.slug === slug)

  if (!herb) {
    return (
      <main className='container mx-auto max-w-3xl px-4 py-10 text-white'>
        <p>Herb profile not found.</p>
      </main>
    )
  }

  const activeCompounds = toList(
    (herb as any).activeCompounds ?? herb.active_compounds ?? herb.compounds
  )
  const therapeuticUses = toList((herb as any).therapeuticUses ?? herb.therapeutic)
  const contraindications = toList(herb.contraindications)
  const interactions = toList(herb.interactions)
  const effects = toList(herb.effects)
  const sideEffects = toList((herb as any).sideEffects ?? herb.sideeffects)
  const dosage = toList(herb.dosage)
  const sources = toSources((herb as any).sources)

  const className = String((herb as any).class || herb.category || '').trim()
  const intensity = String(herb.intensity || '').trim()
  const mechanism = String(herb.mechanism || '').trim()
  const description = String(herb.description || '').trim()
  const duration = String((herb as any).duration || '').trim()
  const region = String(herb.region || '').trim()
  const preparation = String(herb.preparation || herb.preparations?.join(', ') || '').trim()
  const legalStatus = String(herb.legalStatus || herb.legalstatus || '').trim()
  const lastUpdated = String((herb as any).lastUpdated || '').trim()
  const primaryEffects = extractPrimaryEffects(effects, 3)
  const alternateNames = [herb.scientific, herb.common, herb.name]
    .map(value => String(value || '').trim())
    .filter(Boolean)
    .filter(
      (value, index, arr) => arr.findIndex(v => v.toLowerCase() === value.toLowerCase()) === index
    )
  const confidence =
    herb.confidence ??
    calculateHerbConfidence({
      mechanism,
      effects,
      compounds: activeCompounds,
    })
  const completeness = getHerbDataCompleteness({
    mechanism,
    effects,
    activeCompounds,
    contraindications,
  })

  const presentContributionFields = pickNonEmptyKeys(
    {
      className,
      activeCompounds,
      mechanism,
      therapeuticUses,
      contraindications,
      interactions,
      sources,
    },
    [
      'className',
      'activeCompounds',
      'mechanism',
      'therapeuticUses',
      'contraindications',
      'interactions',
      'sources',
    ]
  )
  const shouldShowContributionCta = presentContributionFields.length < 7

  const keyFields = pickNonEmptyKeys(
    {
      mechanism,
      effects,
      activeCompounds,
      contraindications,
      interactions,
      sources,
    },
    ['mechanism', 'effects', 'activeCompounds', 'contraindications', 'interactions', 'sources']
  )
  const renderableKeys = pickNonEmptyKeys(
    {
      className,
      activeCompounds,
      therapeuticUses,
      contraindications,
      interactions,
      legalStatus,
    },
    [
      'className',
      'activeCompounds',
      'therapeuticUses',
      'contraindications',
      'interactions',
      'legalStatus',
    ]
  )
  const missingFieldCount = 6 - renderableKeys.length
  const isDataIncomplete = keyFields.length < 4
  const sourceCount = sources.length
  const mechanismKnown = Boolean(mechanism)

  const metaTitle = `${herb.common || herb.name} Effects, Benefits, Safety | The Hippie Scientist`
  const metaDescription = [
    description,
    effects.length > 0 ? `Effects include ${effects.slice(0, 3).join(', ')}.` : '',
    contraindications.length > 0
      ? `Review interactions and contraindications before use.`
      : 'Review confidence and safety notes before use.',
  ]
    .filter(Boolean)
    .join(' ')
    .slice(0, 280)

  const herbJsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': mechanismKnown || activeCompounds.length > 0 ? 'Substance' : 'MedicalEntity',
    name: herb.common || herb.name,
    description: description || undefined,
    possibleInteraction: interactions.length > 0 ? interactions : undefined,
    mechanismOfAction: mechanism || undefined,
    alternateName: alternateNames.length > 1 ? alternateNames.slice(1) : undefined,
  }

  const relatedHerbs = herbs
    .filter(item => item.slug !== herb.slug)
    .map(item => {
      const itemEffects = toList((item as any).effects)
      const itemCompounds = toList(
        (item as any).activeCompounds ?? item.active_compounds ?? item.compounds
      )
      const sharedEffects = itemEffects.filter(effect =>
        effects.some(base => base.toLowerCase() === effect.toLowerCase())
      )
      const sharedCompounds = itemCompounds.filter(compound =>
        activeCompounds.some(base => base.toLowerCase() === compound.toLowerCase())
      )
      const score = sharedEffects.length * 2 + sharedCompounds.length * 3
      return { item, score, sharedEffects, sharedCompounds }
    })
    .filter(entry => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)

  return (
    <main className='container mx-auto max-w-4xl px-4 py-8 text-white'>
      <Meta
        title={metaTitle}
        description={metaDescription}
        path={`/herbs/${herb.slug}`}
        pageType='article'
        og={{
          title: metaTitle,
          description: metaDescription,
          type: 'article',
          url: `https://thehippiescientist.net/herbs/${herb.slug}`,
        }}
        jsonLd={herbJsonLd}
      />
      <Link to='/herbs' className='btn-secondary inline-flex items-center rounded-full px-4'>
        ← Back to herbs
      </Link>

      <article className='ds-card-lg mt-4'>
        <div className='flex flex-wrap items-start justify-between gap-2'>
          <h1 className='text-3xl font-semibold'>{herb.common || herb.name}</h1>
        </div>
        {herb.scientific && <p className='mt-1 italic text-white/75'>{herb.scientific}</p>}
        <DataTrustPanel entity='herb' confidence={confidence} completeness={completeness} />
        <p className='mt-2 text-xs text-white/70'>
          Confidence: <span className='text-white/90'>{confidence.toUpperCase()}</span>
          {sourceCount > 0 ? ` · Sources: ${sourceCount}` : ''}
          {` · Mechanism: ${mechanismKnown ? 'Known' : 'Unknown'}`}
        </p>
        <p className='mt-1 text-xs text-cyan-100/90'>
          Learn how these signals are scored in{' '}
          <Link to='/methodology' className='underline decoration-dotted underline-offset-4'>
            our methodology
          </Link>
          .
        </p>
        {isDataIncomplete && (
          <section className='mt-4 rounded-xl border border-amber-300/35 bg-amber-500/10 p-3 text-sm text-amber-100'>
            <p className='font-semibold uppercase tracking-wide'>Data incomplete</p>
            <p className='mt-1 text-amber-50/90'>
              Key evidence fields are still missing for this profile. Treat this page as a draft
              snapshot and cross-check sources before making decisions.
            </p>
          </section>
        )}

        {description && <Section title='Description'>{description}</Section>}
        {className && <Section title='Class'>{className}</Section>}
        {intensity && <Section title='Intensity'>{intensity}</Section>}
        {mechanism && <Section title='Mechanism'>{mechanism}</Section>}

        {activeCompounds.length > 0 && (
          <Section title='Active Compounds'>
            <div className='flex flex-wrap gap-2'>
              {activeCompounds.map(compound => (
                <span key={compound} className='ds-pill'>
                  {compound}
                </span>
              ))}
            </div>
          </Section>
        )}

        {primaryEffects.length > 0 && (
          <Section title='Primary Effects'>
            <div className='flex flex-wrap gap-2'>
              {primaryEffects.map(effect => (
                <span
                  key={effect}
                  className='rounded-full border border-violet-300/35 bg-violet-500/10 px-2.5 py-1 text-xs text-violet-100'
                >
                  {effect}
                </span>
              ))}
            </div>
          </Section>
        )}

        {effects.length > 0 && (
          <Section title='Effects'>
            <ul className='list-disc space-y-1 pl-5'>
              {effects.map(effect => (
                <li key={effect}>{effect}</li>
              ))}
            </ul>
          </Section>
        )}

        {therapeuticUses.length > 0 && (
          <Section title='Therapeutic Uses'>
            <ul className='list-disc space-y-1 pl-5'>
              {therapeuticUses.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Section>
        )}

        {contraindications.length > 0 && (
          <Section title='Contraindications'>
            <ul className='space-y-2'>
              {contraindications.map(item => (
                <li
                  key={item}
                  className='rounded-xl border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-rose-100'
                >
                  ⚠ {item}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {interactions.length > 0 && (
          <Section title='Interactions'>
            <ul className='list-disc space-y-1 pl-5'>
              {interactions.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Section>
        )}

        {dosage.length > 0 && <Section title='Dosage'>{dosage.join('; ')}</Section>}
        {duration && <Section title='Duration'>{duration}</Section>}
        {region && <Section title='Region'>{region}</Section>}
        {preparation && <Section title='Preparation'>{preparation}</Section>}
        {legalStatus && <Section title='Legal Status'>{legalStatus}</Section>}

        {sideEffects.length > 0 && (
          <Section title='Side Effects'>
            <ul className='list-disc space-y-1 pl-5'>
              {sideEffects.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Section>
        )}

        {sources.length > 0 && (
          <Section title='Sources'>
            <ol className='list-decimal space-y-1 pl-5'>
              {sources.map((source, index) => (
                <li key={`${source.url}-${index}`}>
                  {/^https?:\/\//i.test(source.url) ? (
                    <a href={source.url} target='_blank' rel='noreferrer' className='link'>
                      {source.title}
                    </a>
                  ) : (
                    source.title
                  )}
                  {source.note && <span className='ml-2 text-white/70'>— {source.note}</span>}
                </li>
              ))}
            </ol>
          </Section>
        )}

        {lastUpdated && <Section title='Last Updated'>{lastUpdated}</Section>}

        {shouldShowContributionCta && (
          <section className='mt-8 rounded-2xl border border-cyan-300/40 bg-cyan-300/10 p-4 text-sm text-cyan-50'>
            <p className='font-semibold'>Help improve this entry</p>
            <p className='mt-2 text-cyan-100/90'>
              Submit a source or correction to improve mechanism, safety, or reference quality for
              this herb profile.
            </p>
            <div className='mt-3 flex flex-wrap gap-2'>
              <Link to='/contribute' className='btn-secondary'>
                Help improve this entry
              </Link>
              <a href={ISSUE_TEMPLATE_URL} target='_blank' rel='noreferrer' className='btn-primary'>
                Submit a source or correction
              </a>
            </div>
          </section>
        )}

        {relatedHerbs.length > 0 && (
          <Section title='Related Herbs'>
            <div className='grid gap-2 sm:grid-cols-2'>
              {relatedHerbs.map(({ item, sharedEffects, sharedCompounds }) => (
                <Link
                  key={item.slug}
                  to={`/herbs/${item.slug}`}
                  className='rounded-xl border border-white/15 bg-white/5 p-3 transition hover:bg-white/10'
                >
                  <p className='font-medium text-white'>{item.common || item.name}</p>
                  <p className='mt-1 text-xs text-white/70'>
                    Shared effects: {sharedEffects.slice(0, 2).join(', ') || 'None'}
                  </p>
                  <p className='text-xs text-white/70'>
                    Shared compounds: {sharedCompounds.slice(0, 2).join(', ') || 'None'}
                  </p>
                </Link>
              ))}
            </div>
          </Section>
        )}

        <section className='mt-8'>
          <p className='mb-3 flex items-center gap-2 text-sm text-white/75'>
            <span aria-hidden='true'>ℹ️</span>
            {missingFieldCount > 0
              ? `${missingFieldCount} evidence fields are still incomplete for this herb.`
              : 'This profile currently has all core evidence fields filled.'}
            <InfoTooltip text='Values with published studies should be cross-checked against the Sources section.' />
          </p>
          <Disclaimer />
        </section>
      </article>
    </main>
  )
}
