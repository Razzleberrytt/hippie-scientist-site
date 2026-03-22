import Meta from '@/components/Meta'

const ISSUE_TEMPLATE_URL =
  'https://github.com/Razzleberrytt/survive-99-evolved/issues/new?template=evidence-update.yml'

export default function Contribute() {
  return (
    <main className='container mx-auto max-w-3xl space-y-5 px-4 py-10 text-white'>
      <Meta
        title='Contribute Data — The Hippie Scientist'
        description='Learn how to submit citations, corrections, and new herb or compound entries.'
        path='/contribute'
      />

      <header className='ds-card-lg space-y-2'>
        <p className='text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200/80'>
          Community contributions
        </p>
        <h1 className='text-3xl font-semibold'>Help us fill in missing data</h1>
        <p className='text-white/85'>
          We welcome citations, corrections, and new herb/compound records. Every submission is
          reviewed before publishing.
        </p>
      </header>

      <section className='ds-card-lg space-y-3'>
        <h2 className='text-xl font-semibold'>How to submit</h2>
        <ol className='list-decimal space-y-2 pl-5 text-white/85'>
          <li>Open the evidence update issue template.</li>
          <li>Include the herb or compound name, what is missing, and your source links.</li>
          <li>
            Prefer peer-reviewed studies, pharmacopeias, or clearly cited clinical references.
          </li>
        </ol>
        <a href={ISSUE_TEMPLATE_URL} target='_blank' rel='noreferrer' className='btn-primary w-fit'>
          Submit an evidence update
        </a>
      </section>

      <section className='ds-card-lg space-y-3'>
        <h2 className='text-xl font-semibold'>What is most helpful</h2>
        <ul className='list-disc space-y-1 pl-5 text-white/85'>
          <li>Clear mechanism language tied to a source.</li>
          <li>Contraindications and interaction details with dosing context.</li>
          <li>Corrections to taxonomy, legal status, or region metadata.</li>
        </ul>
      </section>
    </main>
  )
}
