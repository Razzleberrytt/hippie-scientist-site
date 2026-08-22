import type { Metadata } from 'next'
import RecommendationSection from '@/components/RecommendationSection'
import { getRevenueProductSet } from '@/config/revenue-products'
import Link from 'next/link'
import Image from 'next/image'
import { buildPageMetadata } from '../../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import LegacyGuideFAQ from '@/components/LegacyGuideFAQ'
import LegacyGuideQuickAnswer from '@/components/LegacyGuideQuickAnswer'
import References from '@/components/References'
import EmailCapture from '../../../../components/EmailCapture'

export const metadata: Metadata = buildPageMetadata({
  title: 'Collagen Supplements: Benefits, Risks & What the Evidence Really Shows (2026)',
  description: 'Evidence-first 2026 review of collagen supplements for skin, osteoarthritis, bone, muscle and tendons, including funding-bias disputes, product-form differences, safety limits, and why collagen is not simply whey protein.',
  path: '/guides/other/collagen-supplements/',
  openGraphType: 'article',
})

const FAQS = [
  {
    question: 'Do collagen supplements improve skin?',
    answer:
      'The total literature is positive, but confidence is disputed. A 2026 umbrella review reported favorable skin hydration and elasticity outcomes across prior meta-analyses, while a 2025 meta-analysis that stratified trials by funding source and study quality found no significant hydration, elasticity, or wrinkle benefit in non-industry-funded studies and no significant benefit across the higher-quality subgroup. A separate 2026 systematic review found many positive individual trials but rated most included studies at high risk of bias. The safest conclusion is “possible modest skin benefit, with important sponsorship and study-quality uncertainty,” not “high-certainty anti-aging effect.”',
  },
  {
    question: 'Does collagen help knee osteoarthritis?',
    answer:
      'This evidence is stronger than the skin-marketing story suggests. A 2024 trial-sequential meta-analysis of 35 randomized trials / 3,165 patients found small-to-moderate pain improvement and small function improvement, with moderate-to-high certainty for those outcomes and no increased withdrawal or adverse-event risk. A separate updated knee-OA meta-analysis of 11 RCTs / 870 participants also found improvements in pain and function, although heterogeneity was high.',
  },
  {
    question: 'Is collagen good for muscle building?',
    answer:
      'It depends on the endpoint. In a direct feeding trial in older women, whey stimulated acute and longer-term muscle protein synthesis more effectively than collagen. However, longer-duration collagen-peptide trials combined with resistance training have reported small improvements in fat-free mass, strength, tendon morphology, or recovery. That does not make collagen a superior complete protein; it suggests collagen peptides may have connective-tissue or training-adjunct effects that are different from acute muscle-protein-synthesis quality.',
  },
  {
    question: 'Does collagen improve bone density?',
    answer:
      'There are positive signals, especially in postmenopausal or low-BMD populations, but fracture prevention is not established. A 2025 meta-analysis reported favorable BMD and bone-turnover outcomes with substantial heterogeneity, and the best-known 12-month randomized trial used a specific collagen-peptide product in postmenopausal women. Collagen should not be framed as a replacement for osteoporosis evaluation or established fracture-prevention treatment.',
  },
  {
    question: 'Which collagen type is best?',
    answer:
      'There is no universal winner. Hydrolyzed type-I-rich collagen peptides dominate skin, bone, and training studies, while undenatured type II has a separate osteoarthritis literature. Milligrams of undenatured type II are not interchangeable with grams of hydrolyzed peptides, and a generic “multi-collagen” formula cannot automatically inherit the evidence for every studied preparation.',
  },
  {
    question: 'Are collagen supplements safe?',
    answer:
      'Short clinical trials generally report good tolerability and low adverse-event rates, but most trials are not designed to establish years of use. Source allergies and ingredient-specific issues still matter, and dietary supplements are not preapproved by FDA for efficacy before marketing. Product identity, additives, allergens, and independent quality testing remain separate from whether collagen itself has evidence for a particular outcome.',
  },
] as const

const COLLAGEN_REFS = [
  { n: 1, text: 'Ravindran R, et al. Collagen Supplementation for Skin and Musculoskeletal Health: umbrella review of meta-analyses. Aesthet Surg J Open Forum. 2026;8:ojag018. PMID 41809116.', url: 'https://pubmed.ncbi.nlm.nih.gov/41809116/' },
  { n: 2, text: 'Myung SK, et al. Effects of Collagen Supplements on Skin Aging: systematic review and meta-analysis of randomized controlled trials, including funding-source and study-quality subgroup analyses. Am J Med. 2025. PMID 40324552.', url: 'https://pubmed.ncbi.nlm.nih.gov/40324552/' },
  { n: 3, text: 'Bassila C, et al. Efficacy and safety of hydrolyzed collagen supplementation on skin health outcomes: systematic literature review of RCTs. Eur J Clin Nutr. 2026. PMID 42342959. DOI 10.1038/s41430-026-01778-3.', url: 'https://pubmed.ncbi.nlm.nih.gov/42342959/' },
  { n: 4, text: 'Pu SY, et al. Effects of Oral Collagen for Skin Anti-Aging: systematic review and meta-analysis of 26 RCTs / 1,721 participants. Nutrients. 2023. PMID 37432180.', url: 'https://pubmed.ncbi.nlm.nih.gov/37432180/' },
  { n: 5, text: 'Liang CW, et al. Efficacy and safety of collagen derivatives for osteoarthritis: trial sequential meta-analysis of 35 RCTs / 3,165 patients. Osteoarthritis Cartilage. 2024;32:574-584. PMID 38218227.', url: 'https://pubmed.ncbi.nlm.nih.gov/38218227/' },
  { n: 6, text: 'Simental-Mendía M, et al. Effect of collagen supplementation on knee osteoarthritis: updated systematic review and meta-analysis of 11 RCTs / 870 participants. Clin Exp Rheumatol. 2025;43:126-134. PMID 39212129.', url: 'https://pubmed.ncbi.nlm.nih.gov/39212129/' },
  { n: 7, text: 'König D, et al. Specific collagen peptides improve bone mineral density and bone markers in postmenopausal women: randomized controlled study. Nutrients. 2018. PMID 29337906.', url: 'https://pubmed.ncbi.nlm.nih.gov/29337906/' },
  { n: 8, text: 'Sun Y, et al. Efficacy of collagen peptide supplementation on bone and muscle health: meta-analysis. Front Nutr. 2025. PMID 41049371. DOI 10.3389/fnut.2025.1646090.', url: 'https://pubmed.ncbi.nlm.nih.gov/41049371/' },
  { n: 9, text: 'Oikawa SY, et al. Whey protein but not collagen peptides stimulate acute and longer-term muscle protein synthesis in healthy older women: randomized controlled trial. Am J Clin Nutr. 2020;111:708-718. PMID 31919527.', url: 'https://pubmed.ncbi.nlm.nih.gov/31919527/' },
  { n: 10, text: 'Bischof K, et al. Collagen peptide supplementation with long-term physical training: systematic review and meta-analysis. Sports Med. 2024;54:2865-2888. PMID 39060741.', url: 'https://pubmed.ncbi.nlm.nih.gov/39060741/' },
  { n: 11, text: 'Drummond MDM, et al. Which protein-based supplements most effectively enhance fat-free mass and strength during resistance training? Network meta-analysis. Transl Sports Med. 2026. PMID 41635649.', url: 'https://pubmed.ncbi.nlm.nih.gov/41635649/' },
  { n: 12, text: 'Miyamoto N, et al. Collagen peptide supplementation enhances muscle-tendon stiffness and explosive strength: 16-week randomized trial. Med Sci Sports Exerc. 2025. PMID 40623147.', url: 'https://pubmed.ncbi.nlm.nih.gov/40623147/' },
]

const evidenceRows = [
  ['Skin hydration / elasticity', 'Conflicted', 'Multiple pooled analyses are positive [1,4], but non-industry-funded and higher-quality subgroups in a 2025 meta-analysis were null [2]; most trials in a 2026 review had high risk of bias [3].'],
  ['Wrinkles / roughness', 'Uncertain', 'Some meta-analyses report wrinkle improvement, but funding/quality analyses weaken confidence [2]. The 2026 umbrella review did not find a significant roughness effect [1].'],
  ['Knee osteoarthritis pain / function', 'Moderate', '35-RCT trial-sequential meta-analysis found small-to-moderate pain and small function benefits, with moderate/high certainty [5].'],
  ['Bone mineral density', 'Promising', 'Positive postmenopausal RCT and 2025 meta-analysis, but heterogeneity is substantial and fracture outcomes are not established [7,8].'],
  ['Acute muscle protein synthesis', 'Weak vs complete protein', 'Direct RCT: whey stimulated MPS more strongly than collagen in older women [9].'],
  ['Training / tendon adaptations', 'Promising but mixed', 'Long-term training meta-analysis found small effects on several outcomes with low-to-moderate certainty; individual tendon trials are positive [10,12].'],
] as const

export default function CollagenGuidePage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="Collagen Supplements: Benefits, Risks and What the Evidence Really Shows"
        description="2026 evidence review separating disputed skin findings from osteoarthritis, bone, muscle-protein-synthesis, and training/tendon evidence."
        url="https://thehippiescientist.net/guides/other/collagen-supplements"
        type="Article"
        citationUrls={COLLAGEN_REFS.map((ref) => ref.url)}
      />
      <AuthorityBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Guides', href: '/guides/' }, { label: 'Collagen Supplements' }]} />

      <section className="space-y-5 max-w-4xl">
        <p className="eyebrow-label">Evidence Review · 12 Sources · Updated August 22, 2026</p>
        <h1 className="text-5xl font-bold tracking-tight text-ink">Collagen Supplements: The Evidence Is Stronger for Some Claims—and Much More Disputed for Skin Than Marketing Suggests</h1>
        <p className="text-lg leading-8 text-muted">
          Collagen has an unusually large supplement literature, but a large literature is not the same thing as a settled literature. Skin meta-analyses disagree sharply once funding source and trial quality are examined. Osteoarthritis evidence is more consistent. Bone outcomes are promising but not fracture evidence. And muscle research shows an important split: collagen is a relatively poor complete protein for acute muscle-protein synthesis, yet collagen peptides may still influence connective tissue and some training adaptations.
        </p>
        <figure className="mt-6"><div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white"><Image src="/images/guides/collagen-supplements.jpg" alt="Collagen peptide powder beside an evidence review" width={1536} height={1024} priority className="w-full h-auto" /></div><figcaption className="mt-3 text-center text-sm text-muted">“Collagen works” is too broad. Skin, joint, bone, muscle, and tendon questions have different evidence.</figcaption></figure>
      </section>

      <LegacyGuideQuickAnswer referencesHref="#references">
        <p><strong>Collagen is not one evidence claim.</strong> For skin, pooled results are often positive, but a 2025 meta-analysis found no significant hydration, elasticity, or wrinkle benefit in non-industry-funded studies and no significant benefit in higher-quality studies [2]; a 2026 review also rated most included skin RCTs at high risk of bias [3]. For osteoarthritis, evidence is more convincing: a 35-RCT trial-sequential meta-analysis found small-to-moderate pain and function benefits without higher adverse-event or withdrawal risk [5]. Collagen is inferior to whey for acute muscle-protein synthesis [9], but longer-term collagen + training studies show possible small benefits for fat-free mass, strength, tendon morphology, and recovery [10-12].</p>
      </LegacyGuideQuickAnswer>

      <section id="collagen-evidence" data-answer-engine-table="true" className="card-premium scroll-mt-24 p-6 space-y-4 max-w-5xl">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Evidence by outcome</h2>
        <div className="overflow-x-auto"><table className="min-w-[940px] w-full text-sm"><caption className="sr-only">Collagen evidence by outcome and certainty</caption><thead><tr className="border-b border-brand-900/10"><th className="py-3 pr-4 text-left">Outcome</th><th className="py-3 pr-4 text-left">Current read</th><th className="py-3 text-left">Why</th></tr></thead><tbody className="divide-y divide-brand-900/5 text-muted">{evidenceRows.map(([outcome, grade, why]) => <tr key={outcome} className="align-top"><th scope="row" className="py-3 pr-4 text-left font-semibold text-ink">{outcome}</th><td className="py-3 pr-4 font-semibold text-ink">{grade}</td><td className="py-3 leading-6">{why}</td></tr>)}</tbody></table></div>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl">
        <p className="eyebrow-label">Skin · the funding-bias dispute</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Why “high-certainty skin benefit” is too confident</h2>
        <p className="text-sm leading-7 text-muted">
          The 2026 umbrella review synthesized 16 prior systematic reviews representing 113 RCTs / 7,983 participants and reported favorable pooled skin hydration and elasticity outcomes [1]. That is an important high-level synthesis—but another recent analysis asked a different question: <strong>do the results survive when trials are separated by funding source and quality?</strong>
        </p>
        <p className="text-sm leading-7 text-muted">
          Myung et al. analyzed 23 RCTs / 1,474 participants and found significant pooled improvements when all trials were combined. But studies without pharmaceutical-company funding showed no significant improvement in hydration, elasticity, or wrinkles; higher-quality studies also showed no significant benefit across those outcomes [2]. A separate 2026 review of 25 RCTs found many positive individual trials but rated the majority as high risk of bias [3].
        </p>
        <p className="text-sm leading-7 text-muted">
          That does not prove collagen has zero skin effect. It lowers confidence. The honest synthesis is <strong>possible modest dermatologic benefit, with material sponsorship and trial-quality uncertainty</strong>—not a guaranteed anti-aging effect.
        </p>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl">
        <p className="eyebrow-label">Osteoarthritis</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Joint evidence is broader than one famous UC-II trial</h2>
        <p className="text-sm leading-7 text-muted">
          A 2024 trial-sequential meta-analysis included 35 randomized trials / 3,165 osteoarthritis patients. Collagen derivatives produced small-to-moderate pain reduction and small function improvement versus controls; certainty was rated moderate for pain and high for function, and withdrawals/adverse events were not increased [5]. An updated knee-OA meta-analysis of 11 RCTs / 870 participants also favored collagen for pain and function, although heterogeneity was high [6].
        </p>
        <p className="text-sm leading-7 text-muted">
          “Collagen derivatives” still covers different interventions—hydrolyzed peptides, undenatured collagen, and product-specific preparations. A pooled class signal does not establish one universal dose or prove that every retail joint formula is equivalent.
        </p>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl">
        <p className="eyebrow-label">Muscle vs tendon</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Collagen can be inferior protein and still have training-adjunct signals</h2>
        <p className="text-sm leading-7 text-muted">
          In a direct randomized feeding study in healthy older women, 30 g whey stimulated acute and longer-term myofibrillar muscle-protein synthesis more strongly than 30 g collagen peptides [9]. That makes collagen a poor replacement for a leucine-rich complete protein when the specific goal is maximizing muscle-protein synthesis.
        </p>
        <p className="text-sm leading-7 text-muted">
          Longer-duration training research measures different endpoints. A 2024 systematic review/meta-analysis of 19 studies / 768 participants found small favorable effects for fat-free mass and maximal strength and larger estimates for tendon morphology, but certainty ranged from moderate down to very low depending on the outcome [10]. More recent trials also report connective-tissue changes such as tendon size/stiffness or intramuscular collagen remodeling [12].
        </p>
        <p className="text-sm leading-7 text-muted">
          A 2026 network meta-analysis even ranked collagen highly for strength/fat-free mass across resistance-training supplement trials [11]. Network rankings are indirect comparisons and should not override direct protein-quality physiology. Together, the evidence supports a nuanced conclusion: <strong>collagen may be a useful training/connective-tissue adjunct, but it is not nutritionally interchangeable with whey or another complete protein.</strong>
        </p>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl">
        <p className="eyebrow-label">Bone</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">BMD signals are promising; fracture prevention is still a different question</h2>
        <p className="text-sm leading-7 text-muted">
          A 12-month randomized trial in postmenopausal women with age-related BMD loss reported favorable spine and femoral-neck BMD changes with a specific collagen-peptide preparation [7]. A 2025 meta-analysis also found favorable BMD and bone-turnover outcomes, but heterogeneity for BMD was high and some included interventions combined collagen with calcium and vitamin D [8].
        </p>
        <p className="text-sm leading-7 text-muted">
          BMD and bone-turnover markers are not fracture outcomes. Collagen should therefore be described as an adjunct under investigation for bone health—not a replacement for osteoporosis screening, adequate nutrition, resistance/impact exercise, or indicated fracture-prevention therapy.
        </p>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl">
        <p className="eyebrow-label">Product matching & safety</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">“Collagen” on a label is not enough information</h2>
        <div className="space-y-3 text-sm leading-7 text-muted">
          <p><strong className="text-ink">Hydrolyzed collagen peptides</strong> dominate many skin, bone, and exercise studies and are usually discussed in gram quantities.</p>
          <p><strong className="text-ink">Undenatured type II collagen</strong> is a different intervention used in joint studies and often appears in much smaller milligram quantities. Its dose cannot be compared numerically with hydrolyzed-peptide grams.</p>
          <p><strong className="text-ink">Source</strong> can matter for allergens, composition, dietary preference, and product identity; it does not create a universal marine-over-bovine efficacy hierarchy.</p>
          <p><strong className="text-ink">Safety evidence</strong> is mostly short-term. The 2026 skin RCT review found low adverse-event incidence, but longer-term, adequately powered safety trials remain limited [3].</p>
          <p><strong className="text-ink">Combination products</strong> cannot automatically inherit the evidence for each ingredient or collagen preparation studied separately.</p>
        </div>
      </section>

      <div id="references" className="scroll-mt-24"><References refs={COLLAGEN_REFS} /></div>
      <LegacyGuideFAQ pagePath="/guides/other/collagen-supplements/" questions={[...FAQS]} />
      <RecommendationSection products={getRevenueProductSet('collagen')?.products ?? []} />
      <EmailCapture headline="Get evidence reviews like this" description="Supplement evidence with funding, bias, product form, and outcome boundaries kept visible." ctaLabel="Get the evidence" location="guide-collagen" />
      <div className="pt-4 border-t border-brand-900/10 flex items-center justify-between"><Link href="/guides/" className="inline-flex rounded-full border border-brand-900/10 bg-[var(--surface-card)] px-4 py-2 text-sm font-bold text-ink transition hover:bg-brand-50">← Back to guides</Link><Link href="/guides/other/protein-powder-guide/" className="text-sm font-bold text-brand-800 hover:underline">Protein powder guide →</Link></div>
    </div>
  )
}
