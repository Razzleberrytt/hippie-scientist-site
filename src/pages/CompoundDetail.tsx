import { type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import Meta from '@/components/Meta'
import { useCompoundData } from '@/lib/compound-data'
import { useHerbData } from '@/lib/herb-data'
import { slugify } from '@/lib/slug'
import { pickNonEmptyKeys } from '@/lib/nonEmptyFields'

type SourceRef = { title: string; url: string; note?: string }
const ISSUE_TEMPLATE_URL =
  'https://github.com/Razzleberrytt/survive-99-evolved/issues/new?template=evidence-update.yml'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className='mt-6'>
      <h2 className='text-lg font-semibold text-white'>{title}</h2>
      <div className='mt-2 text-sm text-white/85'>{children}</div>
    </section>
  )
}

function MissingField({ label }: { label: string }) {
  return (
    <p className='italic text-white/70'>Information not yet available for {label.toLowerCase()}.</p>
  )
}

function SourceList({ sources }: { sources: SourceRef[] }) {
  if (!sources.length) {
    return <p className='text-white/75'>No citations available yet.</p>
  }

  return (
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
          {source.note && <span className='ml-2 text-white/65'>— {source.note}</span>}
        </li>
      ))}
    </ol>
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

  const missingContributionFields = pickNonEmptyKeys(
    {
      className: compound.className,
      activeCompounds: compound.activeCompounds,
      therapeuticUses: compound.therapeuticUses,
      contraindications: compound.contraindications,
      interactions: compound.interactions,
    },
    ['className', 'activeCompounds', 'therapeuticUses', 'contraindications', 'interactions']
  )
  const shouldShowContributionCta = missingContributionFields.length < 5

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

        <Section title='Description'>
          {compound.description || <MissingField label='Description' />}
        </Section>

        <Section title='Class'>
          {compound.className || compound.category || <MissingField label='Class' />}
        </Section>

        <Section title='Active Compounds'>
          {compound.activeCompounds.length ? (
            <div className='flex flex-wrap gap-2'>
              {compound.activeCompounds.map(item => (
                <span key={item} className='ds-pill'>
                  {item}
                </span>
              ))}
            </div>
          ) : (
            <MissingField label='Active compounds' />
          )}
        </Section>

        <Section title='Effects'>
          {compound.effects.length > 0 ? (
            <ul className='list-disc space-y-1 pl-5'>
              {compound.effects.map(effect => (
                <li key={effect}>{effect}</li>
              ))}
            </ul>
          ) : (
            <MissingField label='Effects' />
          )}
        </Section>

        <Section title='Therapeutic Uses'>
          {compound.therapeuticUses.length > 0 ? (
            <ul className='list-disc space-y-1 pl-5'>
              {compound.therapeuticUses.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <MissingField label='Therapeutic uses' />
          )}
        </Section>

        <Section title='Contraindications'>
          {compound.contraindications.length > 0 ? (
            <ul className='space-y-2'>
              {compound.contraindications.map(item => (
                <li
                  key={item}
                  className='rounded-xl border border-rose-300/45 bg-rose-500/15 px-3 py-2 text-rose-50'
                >
                  <span aria-hidden='true'>⚠ </span>
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <MissingField label='Contraindications' />
          )}
        </Section>

        <Section title='Interactions'>
          {compound.interactions.length > 0 ? (
            <ul className='list-disc space-y-1 pl-5'>
              {compound.interactions.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <MissingField label='Interactions' />
          )}
        </Section>

        <Section title='Associated Herbs'>
          {linkedHerbs.length > 0 ? (
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
          ) : (
            <MissingField label='Associated herbs' />
          )}
        </Section>

        <Section title='Sources'>
          <SourceList sources={compound.sources} />
        </Section>

        {shouldShowContributionCta && (
          <section className='mt-8 rounded-2xl border border-cyan-300/40 bg-cyan-300/10 p-4 text-sm text-cyan-50'>
            <p className='font-semibold'>Help us fill in missing data</p>
            <p className='mt-2 text-cyan-100/90'>
              This compound still has evidence gaps in class, compounds, therapeutic uses,
              contraindications, or interactions.
            </p>
            <div className='mt-3 flex flex-wrap gap-2'>
              <Link to='/contribute' className='btn-secondary'>
                Contribution guide
              </Link>
              <a href={ISSUE_TEMPLATE_URL} target='_blank' rel='noreferrer' className='btn-primary'>
                Open evidence issue
              </a>
            </div>
          </section>
        )}

        <Section title='Last Updated'>
          {compound.lastUpdated || <MissingField label='Last updated' />}
        </Section>
      </article>
    </main>
  )
}
