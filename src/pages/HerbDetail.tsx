import { type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import Meta from '@/components/Meta'
import { useHerbData } from '@/lib/herb-data'

type SourceRef = { title: string; url: string }

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
      return { title: title || url, url: url || title }
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
  const effects = toList(herb.effects)
  const therapeuticUses = toList((herb as any).therapeuticUses ?? herb.therapeutic)
  const contraindications = toList(herb.contraindications)
  const interactions = toList(herb.interactions)
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
                </li>
              ))}
            </ol>
          </Section>
        )}

        {lastUpdated && <Section title='Last Updated'>{lastUpdated}</Section>}
      </article>
    </main>
  )
}
