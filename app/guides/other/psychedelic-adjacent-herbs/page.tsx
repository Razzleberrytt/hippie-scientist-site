import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArticleLayout, TableOfContents } from '@/components/articles'
import type { Heading } from '@/components/articles'
import References from '@/components/References'

export const metadata: Metadata = {
  title: 'Psychedelic-Adjacent Herbs & Harm Reduction',
  description: 'Evidence-informed harm reduction guide for traditional, ritual, and dream-adjacent botanicals like Blue Lotus and Kanna.',
  alternates: { canonical: '/guides/other/psychedelic-adjacent-herbs/' },
  openGraph: {
    title: 'Psychedelic-Adjacent Herbs & Harm Reduction',
    description: 'Evidence-informed harm reduction guide for traditional, ritual, and dream-adjacent botanicals like Blue Lotus and Kanna.',
    url: '/guides/other/psychedelic-adjacent-herbs/',
    images: ['/og-default.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Psychedelic-Adjacent Herbs & Harm Reduction',
    description: 'Evidence-informed harm reduction guide for traditional and ritual botanicals.',
  },
}

const HEADINGS: Heading[] = [
  { id: 'profiles', text: 'Monitored Botanical Profiles', level: 2 },
  { id: 'harm-reduction', text: 'Core Harm Reduction Checkpoints', level: 2 },
  { id: 'disclaimer', text: 'Legal & Health Disclaimer', level: 2 },
]

const PSYCHEDELIC_ADJACENT_HERBS_REFS = [
  { n: 1, text: 'Schimpf M, et al. (2023). Toxicity From Blue Lotus (Nymphaea caerulea) After Ingestion or Inhalation: A Case Series. Military Medicine, 188(7-8): e2689-e2692.', url: 'https://pubmed.ncbi.nlm.nih.gov/34345890/' },
  { n: 2, text: 'Dosoky NS, et al. (2023). Chemical Composition, Market Survey, and Safety Assessment of Blue Lotus (Nymphaea caerulea Savigny) Extracts. Molecules, 28(20): 7014.', url: 'https://pubmed.ncbi.nlm.nih.gov/37894493/' },
  { n: 3, text: 'Gericke N, et al. (2021). Sceletium tortuosum: A review on its phytochemistry, pharmacokinetics, biological and clinical activities. Journal of Ethnopharmacology, 276: 114476.', url: 'https://pubmed.ncbi.nlm.nih.gov/34333104/' },
  { n: 4, text: 'Nell H, et al. (2013). A randomized, double-blind, placebo-controlled trial of Sceletium tortuosum extract in healthy adults. Journal of Alternative and Complementary Medicine, 19(11): 898-904.', url: 'https://pubmed.ncbi.nlm.nih.gov/23441963/' },
  { n: 5, text: 'Harvey AL, et al. (2011). Pharmacological actions of Sceletium tortuosum and its principal alkaloids. Journal of Ethnopharmacology, 137(3): 1124-1129.', url: 'https://pubmed.ncbi.nlm.nih.gov/21798331/' },
]

export default function PsychedelicAdjacentHerbsPage() {
  const toc = <TableOfContents headings={HEADINGS} />

  const botanicals = [
    {
      name: 'Blue Lotus (Nymphaea caerulea)',
      href: '/herbs/blue-lotus',
      traditionalRole: 'Ritual and historical use is reported, but it does not establish the identity, dose, or effect of a modern extract.',
      activeConstituents: 'Commercial descriptions often name apomorphine and nuciferine. An analytical survey found both virtually absent from authentic extracts, so those claims should not be assumed from a label [2].',
      mechanisms: 'No reliable human mechanism can be inferred for an unverified marketplace product. Chemical findings do not establish a predictable psychoactive effect.',
      safetyContext: 'Higher caution. A five-patient case series reported sedation and perceptual disturbances after ingestion or inhalation. Avoid vaping, concentrated extracts, alcohol, and other sedatives [1].',
    },
    {
      name: 'Kanna (Sceletium tortuosum)',
      href: '/herbs/kanna',
      traditionalRole: 'Traditional mood-related use is documented, but clinical evidence remains limited and formulation-specific [3].',
      activeConstituents: 'Mesembrine and mesembrenone alkaloids.',
      mechanisms: 'Laboratory studies report serotonin-transporter and PDE4 activity; these findings do not prove a clinical benefit or quantify interaction risk [5].',
      safetyContext: 'Interaction caution. A small trial found one standardized extract tolerable in healthy adults, but that does not establish safety for other extracts or combinations. Avoid combining with serotonergic medicines unless a clinician has reviewed it [4].',
    },
  ]

  return (
    <ArticleLayout toc={toc} zone="harm-reduction">
    <div className="space-y-8">
      <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 sm:p-10 shadow-sm">
        <p className="eyebrow-label">Safety-Led Discovery</p>
        <h1 className="heading-premium mt-3 text-ink">
          Psychedelic-Adjacent Herbs
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted sm:text-base">
          This guide provides a conservative, evidence-based review of traditional and ritual botanicals. These herbs are not substitutes for clinical care or regulated psychedelics, and they require strict attention to dosing, pharmacological interactions, and safety thresholds.
        </p>

        <div className="mt-6 flex flex-wrap gap-4 text-xs font-semibold uppercase tracking-[0.14em]">
          <Link href="/learn/serotonergic-stacking-risks/" className="text-brand-700 hover:text-brand-800 hover:underline">
            Serotonergic Stacking Risks →
          </Link>
          <Link href="/guides/compare/kanna-vs-ssris/" className="text-brand-700 hover:text-brand-800 hover:underline">
            Kanna vs SSRIs Compare →
          </Link>
          <Link href="/info/disclaimer/" className="text-brand-700 hover:text-brand-800 hover:underline">
            Safety Disclaimer →
          </Link>
        </div>

        <figure className="mt-6">
          <div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white">
            <Image
              src="/images/guides/psychedelic-adjacent-herbs.jpg"
              alt="An arrangement of psychedelic-adjacent botanical herbs including blue lotus"
              width={1536}
              height={1024}
              priority
              className="w-full h-auto"
            />
          </div>
          <figcaption className="mt-3 text-center text-sm text-muted">
            Psychedelic-adjacent herbs — what they are and the safety context.
          </figcaption>
        </figure>
      </section>

      {/* Botanical Profiles */}
      <section id="profiles" className="scroll-mt-20 space-y-4">
        <h2 className="text-2xl font-semibold text-ink">Monitored Botanical Profiles</h2>
        <p className="text-sm text-muted">Review traditional uses, chemical constituents, and safety limits for these herbs.</p>
        
        <div className="grid gap-4 md:grid-cols-2">
          {botanicals.map((bot) => (
            <article key={bot.name} className="card-premium p-6 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-lg font-bold text-ink">{bot.name}</h3>
                <p className="mt-2 text-xs font-semibold text-brand-700">Traditional Use: {bot.traditionalRole}</p>
                <ul className="mt-3 space-y-2 text-xs leading-relaxed text-muted">
                  <li><strong>Active Constituents:</strong> {bot.activeConstituents}</li>
                  <li><strong>Mechanisms:</strong> {bot.mechanisms}</li>
                  <li className="pt-2 border-t border-brand-900/5 text-[#5f4a24]">
                    <strong>Safety Context:</strong> {bot.safetyContext}
                  </li>
                </ul>
              </div>
              <Link
                href={bot.href}
                className="inline-flex items-center justify-between text-xs font-semibold text-brand-700 hover:text-brand-800 hover:underline"
              >
                <span>View full research profile</span>
                <span>→</span>
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* Harm Reduction Principles */}
      <section id="harm-reduction" className="scroll-mt-20 rounded-2xl border border-brand-900/10 bg-white/90 p-5 sm:p-6 space-y-4 shadow-sm">
        <h2 className="text-xl font-semibold text-ink">Core Harm Reduction Checkpoints</h2>
        <div className="grid gap-4 sm:grid-cols-3 text-sm">
          <div className="space-y-2">
            <h3 className="font-semibold text-ink">1. Avoid Multi-Stacking</h3>
            <p className="text-muted text-xs leading-relaxed">
            Combining poorly characterized extracts with each other, alcohol, or central depressants can make sedation and other effects less predictable.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-ink">2. Screen for SSRI/MAOI Conflict</h3>
            <p className="text-muted text-xs leading-relaxed">
            Kanna has serotonergic laboratory activity, but direct interaction evidence is sparse. Treat combinations with SSRIs, MAOIs, and other serotonergic agents as an interaction concern that needs clinician review [5].
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-ink">3. Respect Potency Variations</h3>
            <p className="text-muted text-xs leading-relaxed">
            Natural extracts can differ substantially in identity and alkaloid content. Avoid products without species, plant-part, dose, and independent testing information.
            </p>
          </div>
        </div>
      </section>

      {/* Safety Layer */}
      <section id="disclaimer" className="scroll-mt-20 rounded-2xl border border-amber-900/15 bg-amber-50/70 p-5 text-sm leading-6 text-amber-950">
        <h2 className="font-semibold text-amber-950">Legal & Health Disclaimer</h2>
        <p className="mt-2 text-xs">
          These pages are for educational and harm reduction purposes only. The Hippie Scientist does not advocate for the use of unregulated or illegal substances. Always review clinical contraindications and consult with a licensed physician before introducing any botanical supplements into your lifestyle.
        </p>
        <div className="mt-4 flex gap-3">
          <Link href="/guides/compare/" className="text-xs font-bold text-amber-900 hover:text-amber-950 hover:underline">
            Side-by-Side Compare Tool →
          </Link>
          <Link href="/safety-checker/" className="text-xs font-bold text-amber-900 hover:text-amber-950 hover:underline">
            Interactive Safety Checker →
          </Link>
        </div>
      </section>
    </div>
    <References refs={PSYCHEDELIC_ADJACENT_HERBS_REFS} />
    </ArticleLayout>
  )
}
