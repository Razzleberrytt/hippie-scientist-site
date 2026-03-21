import { type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import Meta from '@/components/Meta'
import { useHerbData } from '@/lib/herb-data'

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
  const sources = toList(herb.sources)

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
        {herb.scientific && <p className='mt-1 italic text-white/70'>{herb.scientific}</p>}

        {herb.description && <Section title='Description'>{herb.description}</Section>}
        {(herb.category || (herb as any).class) && (
          <Section title='Class'>{String((herb as any).class || herb.category)}</Section>
        )}
        {herb.intensity && <Section title='Intensity'>{herb.intensity}</Section>}
        {herb.mechanism && <Section title='Mechanism'>{herb.mechanism}</Section>}

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
            <ul className='list-disc space-y-1 pl-5'>
              {contraindications.map(item => (
                <li key={item}>{item}</li>
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

        {herb.dosage && <Section title='Dosage'>{herb.dosage}</Section>}
        {(herb as any).duration && (
          <Section title='Duration'>{String((herb as any).duration)}</Section>
        )}
        {herb.region && <Section title='Region'>{herb.region}</Section>}
        {(herb.preparation || herb.preparations?.length) && (
          <Section title='Preparation'>
            {String(herb.preparation || herb.preparations?.join(', '))}
          </Section>
        )}
        {(herb.legalStatus || herb.legalstatus) && (
          <Section title='Legal Status'>{String(herb.legalStatus || herb.legalstatus)}</Section>
        )}

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
                <li key={`${source}-${index}`}>
                  {/^https?:\/\//i.test(source) ? (
                    <a href={source} target='_blank' rel='noreferrer' className='link'>
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

        {(herb as any).lastUpdated && (
          <Section title='Last Updated'>{String((herb as any).lastUpdated)}</Section>
        )}
      </article>
    </main>
  )
}
