import HeroCTA from './HeroCTA'

export default function Hero() {
  return (
    <div className='mx-auto mt-2 max-w-6xl px-4 pb-4 pt-8 sm:mt-4 sm:px-6 sm:pb-8 sm:pt-12'>
      <section className='premium-panel rounded-3xl px-5 py-8 sm:px-10 sm:py-10'>
        <div className='grid gap-7 lg:grid-cols-[1fr_auto] lg:items-end'>
          <div className='space-y-4'>
            <p className='section-label'>The Hippie Scientist · Science-first reference</p>
            <h1
              className='tracking-tight text-white'
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2.25rem, 5.2vw, 4.3rem)',
                lineHeight: 0.95,
              }}
            >
              Evidence-first herb and compound reference
            </h1>
            <p className='max-w-2xl text-sm leading-relaxed text-white/74 sm:text-base'>
              Browse herbs, compounds, and mechanism signals in one place with transparent confidence framing and safety context.
            </p>
            <HeroCTA />
          </div>

          <aside className='browse-shell border border-white/12 bg-white/[0.02] p-4 sm:p-5 lg:max-w-[320px]'>
            <p className='section-label'>How to use this archive</p>
            <ul className='mt-3 space-y-2 text-sm text-white/80'>
              <li>Start with a herb or compound profile.</li>
              <li>Cross-check mechanism clues against source quality.</li>
              <li>Review safety cautions and interactions before decisions.</li>
            </ul>
          </aside>
        </div>
      </section>
    </div>
  )
}
