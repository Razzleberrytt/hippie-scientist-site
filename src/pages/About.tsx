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
            <p className='ds-text'>
              The mission is to help readers make safer, evidence-aware decisions by translating
              complex herbal research into plain language while preserving uncertainty and context.
            </p>
            <ul className='text-white/82 list-disc space-y-2 pl-5 text-sm leading-7'>
              <li>Education first: explain what is known, unknown, and still unresolved.</li>
              <li>Harm reduction: surface risks, contraindications, and caution points early.</li>
              <li>Clarity over hype: prefer mechanism-first summaries over bold claims.</li>
              <li>Transparency: cite source quality and limits whenever conclusions are shared.</li>
            </ul>
          </section>

          <section className='ds-stack border-t border-white/10 pt-4'>
            <h2 className='ds-subheading'>Background</h2>
            <p className='ds-text'>
              Hippie Scientist is maintained by an independent researcher focused on herbal
              pharmacology literacy, scientific communication, and practical safety framing. Content
              draws from public literature, pharmacology summaries, traditional-use references, and
              published research notes when available.
            </p>
            <p className='ds-text'>
              Because evidence quality varies widely across herbs and compounds, each profile is
              designed to highlight confidence level, limitations, and open questions rather than
              imply certainty where it does not exist.
            </p>
          </section>

          <section className='ds-stack border-t border-white/10 pt-4'>
            <h2 className='ds-subheading'>Disclaimer</h2>
            <p className='ds-text'>
              This site is for education and research literacy only. It does not provide medical
              diagnosis, treatment, or personalized recommendations. Information here should not
              replace advice from a qualified clinician who can evaluate your personal history,
              medications, and risk profile.
            </p>
            <p className='ds-text'>
              If you are pregnant, breastfeeding, have a health condition, or take prescription
              medications, consult a licensed healthcare professional before trying any herb,
              compound, or supplement protocol.
            </p>
          </section>
        </article>
      </main>
    </>
  )
}
