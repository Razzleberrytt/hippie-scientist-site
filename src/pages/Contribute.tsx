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
        <h1 className='text-3xl font-semibold'>Help improve research quality</h1>
        <p className='text-white/85'>
          The project is research-first and harm-reduction oriented. We welcome citations,
          corrections, and high-signal updates to herb and compound records. Every submission is
          reviewed before publishing.
        </p>
      </header>

      <section className='ds-card-lg space-y-3'>
        <h2 className='text-xl font-semibold'>How to submit useful corrections</h2>
        <ol className='list-decimal space-y-2 pl-5 text-white/85'>
          <li>
            Open the evidence update issue template and identify the specific herb or compound page.
          </li>
          <li>
            Describe what should change (mechanism, contraindication, interaction, class, active
            compounds, or source metadata).
          </li>
          <li>
            Include exact citation details (title, link/DOI, date, and why the source supports your
            correction).
          </li>
        </ol>
        <a href={ISSUE_TEMPLATE_URL} target='_blank' rel='noreferrer' className='btn-primary w-fit'>
          Submit an evidence update
        </a>
      </section>

      <section className='ds-card-lg space-y-3'>
        <h2 className='text-xl font-semibold'>Preferred citations and contribution quality</h2>
        <ul className='list-disc space-y-1 pl-5 text-white/85'>
          <li>Peer-reviewed human or preclinical studies with DOI/PMID links.</li>
          <li>Authoritative monographs (pharmacopeias, WHO, EMA, NCCIH, textbook references).</li>
          <li>
            Safety-critical edits: contraindications, interactions, adverse effect notes, and
            uncertainty boundaries.
          </li>
          <li>Taxonomy, synonym, and region corrections with primary botany references.</li>
        </ul>
      </section>
    </main>
  )
}
