import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import References from '@/components/References'

export const metadata: Metadata = {
  title: 'Dopamine Pathway Education',
  description:
    'Explore educational content on dopaminergic signaling, focus, motivation, reward systems, and related herbs and compounds.',
  alternates: { canonical: '/learn/dopamine/' },
}

const profiles = [
  {
    href: '/herbs/rhodiola',
    title: 'Rhodiola',
  },
  {
    href: '/compounds/l-tyrosine',
    title: 'L-Tyrosine',
  },
  {
    href: '/compounds/mucuna-pruriens',
    title: 'Mucuna Pruriens',
  },
  {
    href: '/learn/why-calm-focus-differs-from-stimulation',
    title: 'Calm Focus vs Stimulation',
  },
]

const DOPAMINE_REFS = [
  { n: 1, text: 'Kandel ER, et al. (2013). Principles of Neural Science: synaptic transmission. McGraw-Hill.', url: '' },
  { n: 2, text: 'Cooper JR, Bloom FE, Roth RH. (2003). The Biochemical Basis of Neuropharmacology, 8th ed. Oxford.', url: '' },
  { n: 3, text: 'Südhof TC. (2013). Neurotransmitter release. Neuron, 80(3): 675-690.', url: 'https://pubmed.ncbi.nlm.nih.gov/24183020/' },
]

export default function DopaminePathwayPage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="Dopamine Pathway"
        description="Educational overview of dopaminergic signaling, motivation systems, cognition, reward processing, and focus-related neuropharmacology."
        url="https://thehippiescientist.net/learn/dopamine"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Education', href: '/learn' },
          { label: 'Dopamine' },
        ]}
      />

      <section className="space-y-5 max-w-4xl">
        <p className="eyebrow-label">Pathway Supernode</p>

        <h1 className="text-4xl font-bold tracking-tight text-ink">
          Dopamine Pathway
        </h1>

        <p className="text-lg leading-8 text-muted">
          Educational exploration of motivation systems, reward signaling, focus regulation, behavioral drive, and dopaminergic neuropharmacology.
        </p>
      
        <figure className="mt-6"><div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white"><Image src="/images/learn/dopamine.jpg" alt="Dopamine molecular model with runner and coffee" width={1536} height={1024} priority className="w-full h-auto" /></div><figcaption className="mt-3 text-center text-sm text-muted">Dopamine — a motivation signal, not a pleasure chemical.</figcaption></figure></section>

      <section className="grid gap-5 lg:grid-cols-2">
        {profiles.map((profile) => (
          <Link
            key={profile.href}
            href={profile.href}
            className="card-premium p-6 transition motion-safe:hover:-translate-y-0.5"
          >
            <div className="space-y-3">
              <p className="eyebrow-label">Related System</p>

              <h2 className="text-2xl font-semibold tracking-tight text-ink">
                {profile.title}
              </h2>
            </div>
          </Link>
        ))}
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl"><h2 className="text-2xl font-semibold tracking-tight text-ink">Dopamine in practice</h2><p className="text-sm leading-7 text-muted">Dopamine is not a pleasure chemical — it is a motivation and learning signal. It rises in anticipation of reward, not during consumption. Practical implications: cold exposure produces sustained dopamine increases (2.5x baseline for hours). Sleep deprivation downregulates D2 receptors. L-tyrosine (500-2000 mg) may support synthesis during stress. Mucuna pruriens (L-DOPA source) is potent but carries dyskinesia risk — avoid chronic use. The best dopamine strategy: pursue effort-based rewards (exercise, learning) over consumption-based ones (scrolling, eating).</p></section>

      <References refs={DOPAMINE_REFS} />
    </div>
  )
}
