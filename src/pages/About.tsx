import Meta from '../components/Meta'

export default function About() {
  return (
    <>
      <Meta
        title='About Hippie Scientist'
        description='Education-first herbal database focused on harm reduction, research literacy, and clear safety communication.'
        path='/about'
      />
      <main className='container mx-auto max-w-4xl px-4 py-10 text-white'>
        <article className='ds-card-lg ds-stack'>
          <header className='ds-stack'>
            <p className='text-xs font-semibold uppercase tracking-[0.2em] text-white/60'>
              About Hippie Scientist
            </p>
            <h1 className='ds-heading'>Independent research for safer herbal decision-making</h1>
            <p className='ds-text'>
              Hippie Scientist is an education-first project built by an independent researcher. The
              goal is to make herbal and compound information easier to evaluate without hype.
            </p>
          </header>

          <section className='ds-stack border-t border-white/10 pt-4'>
            <h2 className='ds-subheading'>Mission</h2>
            <ul className='text-white/82 list-disc space-y-2 pl-5 text-sm leading-7'>
              <li>Education first: explain what is known, unknown, and uncertain.</li>
              <li>Harm reduction: surface risks, contraindications, and caution points early.</li>
              <li>Clarity over hype: use structured language instead of strong claims.</li>
            </ul>
          </section>

          <section className='ds-stack border-t border-white/10 pt-4'>
            <h2 className='ds-subheading'>How sources are used</h2>
            <p className='ds-text'>
              Profiles are compiled from public literature, pharmacology summaries, traditional-use
              references, and published research notes where available. Evidence strength is uneven
              across herbs and compounds, so each profile aims to label confidence and gaps.
            </p>
          </section>

          <section className='ds-stack border-t border-white/10 pt-4'>
            <h2 className='ds-subheading'>Scope and intent</h2>
            <p className='ds-text'>
              This site is for education and research literacy. It is not medical advice, and it is
              not a substitute for professional care.
            </p>
          </section>
        </article>
      </main>
    </>
  )
}
