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
        description='How The Hippie Scientist determines effects, scores confidence, evaluates safety, and applies harm-reduction guidance.'
        path='/methodology'
      />

      <header className='rounded-2xl border border-cyan-300/25 bg-cyan-400/10 p-5'>
        <h1 className='text-3xl font-semibold'>Methodology</h1>
        <p className='mt-2 text-sm text-cyan-50/90'>
          This page explains how effects are determined, how safety is evaluated, what intensity
          means, and why the site uses a harm-reduction framing.
        </p>
      </header>

      <Section title='1. How effects are determined'>
        <p>
          Effects are determined from structured evidence fields in the herb and compound dataset:
          reported effects, known active compounds, and mechanism notes.
        </p>
        <p>
          We prioritize signals that can be traced to source-backed records over anecdotal claims.
          Where evidence is thin, entries are shown with lower confidence rather than overstated.
        </p>
      </Section>

      <Section title='2. How safety is evaluated'>
        <p>
          Safety is evaluated using available contraindications, interactions, side effect notes,
          and legal/scheduling context when present in the data.
        </p>
        <p>
          Missing safety fields are treated as uncertainty, not as proof of safety. When in doubt,
          users should cross-check primary literature and clinical guidance.
        </p>
      </Section>

      <Section title='3. What intensity means'>
        <p>
          Intensity is a qualitative estimate of reported psychoactive or physiological strength
          under common use contexts. It is not a dosage recommendation.
        </p>
        <p>
          Individual response varies based on body weight, medications, route, preparation, setting,
          and personal sensitivity.
        </p>
      </Section>

      <Section title='4. Confidence and source transparency'>
        <p>
          Confidence labels (Low / Medium / High) are data quality indicators based on structure and
          coverage, not guarantees of efficacy.
        </p>
        <p>
          Source counts and mechanism-known status are displayed where available to make uncertainty
          visible to readers.
        </p>
      </Section>

      <Section title='5. Medical disclaimer and harm reduction'>
        <p>
          The Hippie Scientist is for educational purposes only and does not provide medical advice,
          diagnosis, or treatment.
        </p>
        <p>
          We use a non-judgmental harm-reduction tone: start low, avoid dangerous combinations, and
          consult licensed professionals for personal medical decisions.
        </p>
      </Section>
    </main>
  )
}
