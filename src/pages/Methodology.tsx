import type { ReactNode } from 'react'
import Meta from '@/components/Meta'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className='border-white/12 mt-6 rounded-2xl border bg-white/5 p-4 backdrop-blur-xl'>
      <h2 className='text-lg font-semibold text-white'>{title}</h2>
      <div className='mt-2 space-y-2 text-sm text-white/85'>{children}</div>
    </section>
  )
}

export default function Methodology() {
  return (
    <main className='container mx-auto max-w-4xl px-4 py-8 text-white'>
      <Meta
        title='Methodology | The Hippie Scientist'
        description='How The Hippie Scientist compiles, cleans, and scores herb and compound data confidence.'
        path='/methodology'
      />

      <header className='rounded-2xl border border-cyan-300/25 bg-cyan-400/10 p-5'>
        <h1 className='text-3xl font-semibold'>Methodology</h1>
        <p className='mt-2 text-sm text-cyan-50/90'>
          This page explains how the dataset is assembled, what confidence represents, and why some
          entries are intentionally shown as incomplete.
        </p>
      </header>

      <Section title='1. How data is compiled'>
        <p>
          Entries are standardized into a shared structure for herbs and compounds (for example:
          mechanism, effects, and safety-related fields).
        </p>
        <p>
          Data is cleaned for consistent naming, formatting, and routing so that search, filtering,
          and detail pages can use the same schema.
        </p>
      </Section>

      <Section title='2. How confidence is calculated'>
        <p>
          Confidence is computed dynamically at runtime from available structured fields. It is not
          hard-coded in the source dataset files.
        </p>
        <p>
          Missing core fields lower confidence. More complete structured entries score higher.
          Confidence is a data coverage signal, not a medical certainty rating.
        </p>
      </Section>

      <Section title='3. Why some entries are incomplete'>
        <p>
          Coverage varies by herb and compound. Some entries have strong mechanism and effect data,
          while others currently include only partial structured information.
        </p>
        <p>
          Sparse records are displayed transparently instead of being padded with assumptions or
          guessed values.
        </p>
      </Section>

      <Section title='4. Ongoing improvement approach'>
        <p>
          The dataset is continuously improved through normalization, gap review, and evidence
          updates.
        </p>
        <p>
          As structured fields are filled and verified, completeness and confidence presentation
          update automatically in the frontend.
        </p>
      </Section>
    </main>
  )
}
