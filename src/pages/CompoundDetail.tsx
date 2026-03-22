import { type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import Meta from '@/components/Meta'
import { useCompoundData } from '@/lib/compound-data'
import { useHerbData } from '@/lib/herb-data'
import { slugify } from '@/lib/slug'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className='mt-6'>
      <h2 className='text-lg font-semibold text-white'>{title}</h2>
      <div className='mt-2 text-sm text-white/85'>{children}</div>
    </section>
  )
}

export default function CompoundDetail() {
  const { slug = '' } = useParams()
  const compounds = useCompoundData()
  const herbs = useHerbData()
  const compound = compounds.find(item => item.slug === slug)

  if (!compound) {
    return (
      <main className='container mx-auto max-w-3xl px-4 py-10 text-white'>
        <p>Compound profile not found.</p>
      </main>
    )
  }

  const herbMap = new Map(
    herbs.map(herb => [String(herb.common || herb.name || herb.slug).toLowerCase(), herb.slug])
  )

  const linkedHerbs = compound.herbs.map(name => ({
    name,
    slug: herbMap.get(name.toLowerCase()) || slugify(name),
  }))

  const contraindications = compound.contraindications.filter(Boolean)

  return (
    <main className='container mx-auto max-w-4xl px-4 py-8 text-white'>
      <Meta
        title={`${compound.name} | Compound Detail`}
        description={compound.description || `Detail page for ${compound.name}.`}
        path={`/compounds/${compound.slug}`}
      />
      <Link to='/compounds' className='btn-secondary inline-flex items-center rounded-full px-4'>
        ← Back to compounds
      </Link>

      <article className='ds-card-lg mt-4'>
        <h1 className='text-3xl font-semibold'>{compound.name}</h1>

        {compound.description && <Section title='Description'>{compound.description}</Section>}
        {compound.className && <Section title='Class'>{compound.className}</Section>}
        {compound.intensity && <Section title='Intensity'>{compound.intensity}</Section>}
        {compound.mechanism && <Section title='Mechanism'>{compound.mechanism}</Section>}

        {compound.activeCompounds.length > 0 && (
          <Section title='Active Compounds'>
            <div className='flex flex-wrap gap-2'>
              {compound.activeCompounds.map(item => (
                <span key={item} className='ds-pill'>
                  {item}
                </span>
              ))}
            </div>
          </Section>
        )}

        {compound.effects.length > 0 && (
          <Section title='Effects'>
            <ul className='list-disc space-y-1 pl-5'>
              {compound.effects.map(effect => (
                <li key={effect}>{effect}</li>
              ))}
            </ul>
          </Section>
        )}

        {compound.therapeuticUses.length > 0 && (
          <Section title='Therapeutic Uses'>
            <ul className='list-disc space-y-1 pl-5'>
              {compound.therapeuticUses.map(item => (
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

        {compound.interactions.length > 0 && (
          <Section title='Interactions'>
            <ul className='list-disc space-y-1 pl-5'>
              {compound.interactions.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Section>
        )}

        {compound.dosage && <Section title='Dosage'>{compound.dosage}</Section>}
        {compound.duration && <Section title='Duration'>{compound.duration}</Section>}
        {compound.region && <Section title='Region'>{compound.region}</Section>}
        {compound.preparation && <Section title='Preparation'>{compound.preparation}</Section>}
        {compound.legalStatus && <Section title='Legal Status'>{compound.legalStatus}</Section>}

        {compound.sideEffects.length > 0 && (
          <Section title='Side Effects'>
            <ul className='list-disc space-y-1 pl-5'>
              {compound.sideEffects.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Section>
        )}

        {linkedHerbs.length > 0 && (
          <Section title='Herbs containing this compound'>
            <div className='mt-3 flex flex-wrap gap-2'>
              {linkedHerbs.map(herb => (
                <Link
                  key={herb.name}
                  to={`/herbs/${encodeURIComponent(herb.slug)}`}
                  className='ds-pill'
                >
                  {herb.name}
                </Link>
              ))}
            </div>
          </Section>
        )}

        {compound.sources.length > 0 && (
          <Section title='Sources'>
            <ol className='list-decimal space-y-1 pl-5'>
              {compound.sources.map((source, index) => (
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

        {compound.lastUpdated && <Section title='Last Updated'>{compound.lastUpdated}</Section>}
      </article>
    </main>
  )
}
