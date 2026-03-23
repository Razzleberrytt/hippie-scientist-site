import { type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import Meta from '@/components/Meta'
import InfoTooltip from '@/components/InfoTooltip'
import { useHerbData } from '@/lib/herb-data'
import { pickNonEmptyKeys } from '@/lib/nonEmptyFields'

type SourceRef = { title: string; url: string; note?: string }
const MISSING_COPY = 'Information not yet available'
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

function MissingText({ label }: { label: string }) {
  return (
    <p className='italic text-white/70'>
      {MISSING_COPY} for {label.toLowerCase()}.
    </p>
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

  return (
    <main className='container mx-auto max-w-4xl px-4 py-8 text-white'>
      <Meta
        title={`${herb.common || herb.name} | Herb Detail`}
        description={herb.description || 'Herb detail page'}
        path={`/herbs/${herb.slug}`}
      />
      <Link to='/herbs' className='btn-secondary inline-flex items-center rounded-full px-4'>
        ← Back to herbs
      </Link>

      <article className='ds-card-lg mt-4'>
        <h1 className='text-3xl font-semibold'>{herb.common || herb.name}</h1>
        {herb.scientific && <p className='mt-1 italic text-white/75'>{herb.scientific}</p>}

        {description && <Section title='Description'>{description}</Section>}
        <Section title='Class'>{className || <MissingText label='Class' />}</Section>
        {intensity && <Section title='Intensity'>{intensity}</Section>}
        {mechanism && <Section title='Mechanism'>{mechanism}</Section>}

        <Section title='Active Compounds'>
          {activeCompounds.length > 0 ? (
            <div className='flex flex-wrap gap-2'>
              {activeCompounds.map(compound => (
                <span key={compound} className='ds-pill'>
                  {compound}
                </span>
              ))}
            </div>
          ) : (
            <MissingText label='Active compounds' />
          )}
        </Section>

        {effects.length > 0 && (
          <Section title='Effects'>
            <ul className='list-disc space-y-1 pl-5'>
              {effects.map(effect => (
                <li key={effect}>{effect}</li>
              ))}
            </ul>
          </Section>
        )}

        <Section title='Therapeutic Uses'>
          {therapeuticUses.length > 0 ? (
            <ul className='list-disc space-y-1 pl-5'>
              {therapeuticUses.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <MissingText label='Therapeutic uses' />
          )}
        </Section>

        <Section title='Contraindications'>
          {contraindications.length > 0 ? (
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
          ) : (
            <MissingText label='Contraindications' />
          )}
        </Section>

        <Section title='Interactions'>
          {interactions.length > 0 ? (
            <ul className='list-disc space-y-1 pl-5'>
              {interactions.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <MissingText label='Interactions' />
          )}
        </Section>

        {dosage.length > 0 && <Section title='Dosage'>{dosage.join('; ')}</Section>}
        {duration && <Section title='Duration'>{duration}</Section>}
        {region && <Section title='Region'>{region}</Section>}
        {preparation && <Section title='Preparation'>{preparation}</Section>}
        <Section title='Legal Status'>
          {legalStatus || <MissingText label='Legal status' />}
        </Section>

        {sideEffects.length > 0 && (
          <Section title='Side Effects'>
            <ul className='list-disc space-y-1 pl-5'>
              {sideEffects.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Section>
        )}

        <Section title='Sources'>
          {sources.length > 0 ? (
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
          ) : (
            <p className='text-white/75'>No citations available yet.</p>
          )}
        </Section>

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

        <section className='mt-8 rounded-2xl border border-amber-300/40 bg-amber-200/10 p-4 text-sm text-amber-100'>
          <p className='flex items-center gap-2'>
            <span aria-hidden='true'>ℹ️</span>
            {missingFieldCount > 0
              ? `${missingFieldCount} evidence fields are still incomplete for this herb.`
              : 'This profile currently has all core evidence fields filled.'}
            <InfoTooltip text='Values with published studies should be cross-checked against the Sources section.' />
          </p>
        </section>
      </article>
    </main>
  )
}
