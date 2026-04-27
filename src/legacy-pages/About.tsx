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
              I&apos;m Ari, the researcher and writer behind Hippie Scientist. This project is built
              to make plant pharmacology and safety information easier to evaluate with clear
              language, transparent uncertainty, and no hype.
            </p>
          </header>

          <section className='ds-stack border-t border-white/10 pt-4'>
            <h2 className='ds-subheading'>Who this is for</h2>
            <p className='ds-text'>
              This site is for curious readers, students, and cautious experimenters who want a
              grounded view of herbs and psychoactive compounds. It is especially for people trying
              to understand tradeoffs, interaction risks, and evidence quality before acting.
            </p>
          </section>

          <section className='ds-stack border-t border-white/10 pt-4'>
            <h2 className='ds-subheading'>What this site does</h2>
            <ul className='text-white/82 list-disc space-y-2 pl-5 text-sm leading-7'>
              <li>Summarizes plant pharmacology and mechanism-level evidence in plain language.</li>
              <li>Highlights safety notes, contraindications, and interaction awareness.</li>
              <li>Separates stronger findings from weaker or unresolved claims.</li>
              <li>Provides practical context while keeping confidence boundaries visible.</li>
            </ul>
          </section>

          <section className='ds-stack border-t border-white/10 pt-4'>
            <h2 className='ds-subheading'>Why it exists</h2>
            <p className='ds-text'>
              Most herbal content online is either too technical to use or too confident to trust.
              Hippie Scientist exists to bridge that gap through harm-reduction framing and
              education-first writing.
            </p>
            <p className='ds-text'>
              The focus is independent research and synthesis: reading across pharmacology papers,
              review articles, and traditional-use context, then translating that into clear, usable
              notes with explicit limits.
            </p>
          </section>

          <section className='ds-stack border-t border-white/10 pt-4'>
            <h2 className='ds-subheading'>Methodology and editorial standard</h2>
            <p className='ds-text'>
              Content is data-driven where possible, references are included when source material is
              available, and confidence is stated conservatively. Posts prioritize mechanism-first
              interpretation, practical safety context, and explicit unknowns.
            </p>
            <p className='ds-text'>
              This site is educational only and is not medical advice. It does not diagnose, treat,
              or replace care from qualified professionals.
            </p>
          </section>
        </article>
      </main>
    </>
  )
}
