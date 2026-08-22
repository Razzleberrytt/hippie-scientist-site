import type { Metadata } from 'next'
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
  title: 'Menopause Supplements: What Works, What Does Not & How to Evaluate a Formula',
  description:
    '2026 evidence review of menopause supplements by symptom: black cohosh, soy isoflavones, creatine, vitamins/minerals, sleep, bone health, and how to evaluate multi-ingredient products such as MenoSerene.',
  path: '/guides/other/menopause-supplements/',
  openGraphType: 'article',
})

const FAQS = [
  {
    question: 'Do menopause supplements work for hot flashes and night sweats?',
    answer:
      'The evidence is mixed and guideline interpretation differs. The Menopause Society’s 2023 nonhormone statement did not recommend supplements/herbal remedies as a vasomotor-treatment category, while a 2026 systematic review prepared to inform International Menopause Society recommendations judged black cohosh evidence moderate-certainty for vasomotor/menopausal symptoms. That disagreement is a reason to match the exact ingredient and product to the evidence rather than treating the entire supplement category as proven or disproven.',
  },
  {
    question: 'Does black cohosh work for menopause symptoms?',
    answer:
      'There is a real efficacy signal, but it is not product-independent. A 2023 meta-analysis of 22 articles / 2,310 women found improvements in overall menopausal symptoms, hot flashes, and somatic symptoms, while the 2026 IMS evidence review graded black cohosh evidence moderate-certainty. Product identity, extract composition, adulteration, and rare liver-injury reports remain important limitations.',
  },
  {
    question: 'Does soy help hot flashes?',
    answer:
      'Soy-isoflavone evidence depends on the outcome. A 2025 meta-analysis found no significant pooled benefit for hot flashes or vasomotor symptoms, while a 2026 meta-analysis reported signals for vaginal dryness and urogenital symptoms with very high heterogeneity. A separate 40-trial meta-analysis found no significant effect on four measured markers of estrogenicity in postmenopausal women. “Soy works” and “soy does nothing” are both too broad.',
  },
  {
    question: 'Does creatine help after menopause?',
    answer:
      'The strongest 2026 evidence is for body-composition and strength outcomes, not hot flashes or a generic menopause cure. A meta-analysis of seven randomized trials / 608 postmenopausal women found a small lean-mass gain and improved leg-press strength, especially when creatine was paired with resistance training; bone density was unchanged overall. A separate tiny 36-woman trial reported selected cognition/mood signals with unusual creatine formulations, which should not be generalized into a brain-fog treatment protocol.',
  },
  {
    question: 'How should I evaluate a menopause combination supplement?',
    answer:
      'Break the formula into ingredients and ask five questions: exact ingredient/extract, amount per daily serving, whether the human study used the same or a comparable preparation, which symptom was measured, and whether the combination itself has been tested. A multi-ingredient formula cannot inherit the full evidence for each ingredient when its doses, extracts, and combinations differ from the trials.',
  },
  {
    question: 'Do vitamin D, calcium, or magnesium treat menopause symptoms?',
    answer:
      'They should not be treated as one menopause-symptom package. Vitamin D and calcium belong mainly in dietary-intake, deficiency, fracture-risk, and osteoporosis decisions. Magnesium has limited sleep evidence in selected populations, but that is not menopause-specific proof that magnesium treats menopausal insomnia.',
  },
] as const

const MENOPAUSE_REFS = [
  {
    n: 1,
    text: 'The North American Menopause Society. 2023 nonhormone therapy position statement. Menopause. 2023;30(6):573-590. PMID 37252752.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/37252752/',
  },
  {
    n: 2,
    text: 'Complementary therapies for management of menopausal symptoms: systematic review to inform the International Menopause Society recommendations. 2026. PMID 41498229.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/41498229/',
  },
  {
    n: 3,
    text: 'Sadahiro R, et al. Black cohosh extracts in women with menopausal symptoms: updated pairwise meta-analysis. Menopause. 2023;30:766-773. PMID 37192826. DOI 10.1097/GME.0000000000002196.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/37192826/',
  },
  {
    n: 4,
    text: 'NCCIH. Black Cohosh: Usefulness and Safety.',
    url: 'https://www.nccih.nih.gov/health/black-cohosh',
  },
  {
    n: 5,
    text: 'Le Y, et al. Review of black cohosh-induced toxicity and adverse clinical effects. J Environ Sci Health C Toxicol Carcinog. 2025;43:243-268. PMID 40503925. DOI 10.1080/26896583.2025.2513795.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/40503925/',
  },
  {
    n: 6,
    text: 'Orhan N, Gafner S, Blumenthal M. Estimating the extent of adulteration of black cohosh and other popular herbs—challenges and limitations. Nat Prod Rep. 2024;41:1604-1621. PMID 39108221.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/39108221/',
  },
  {
    n: 7,
    text: 'Effects of soy isoflavones on menopausal symptoms in perimenopausal women: systematic review and meta-analysis. 2025. PMID 40718787.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/40718787/',
  },
  {
    n: 8,
    text: 'Viscardi G, et al. Effect of Soy Isoflavones on Measures of Estrogenicity: systematic review and meta-analysis of 40 randomized trials. Adv Nutr. 2025;16:100327. PMID 39433088.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/39433088/',
  },
  {
    n: 9,
    text: 'Karaahmet AY, Sadeghi E. Soy isoflavone supplementation and sexual function in postmenopausal women: systematic review and meta-analysis of randomized trials. 2026. PMID 42032055.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/42032055/',
  },
  {
    n: 10,
    text: 'Naddafha S, et al. Creatine monohydrate for lean mass, strength, and bone density in postmenopausal women: systematic review and meta-analysis. J Int Soc Sports Nutr. 2026. PMID 42141930.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/42141930/',
  },
  {
    n: 11,
    text: 'Korovljev D, et al. CONCRET-MENOPA randomized trial of creatine formulations in 36 peri/postmenopausal women. J Am Nutr Assoc. 2026;45:199-210. PMID 40854087.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/40854087/',
  },
  {
    n: 12,
    text: 'Healthspan. MenoSerene current Supplement Facts / ingredient disclosure, accessed August 22, 2026. Product-label source only; not an efficacy trial.',
    url: 'https://www.healthspan.co.uk/menoserene-soy-isoflavones-flaxseed-and-sage/',
  },
  {
    n: 13,
    text: 'The North American Menopause Society. 2022 Hormone Therapy Position Statement. Menopause. 2022;29:767-794. PMID 35797481.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/35797481/',
  },
]

const symptomRows = [
  {
    symptom: 'Hot flashes / night sweats',
    evidence: 'Guidelines are not perfectly aligned: NAMS 2023 did not recommend supplements/herbals as a category [1], while the 2026 IMS evidence review rated black cohosh evidence moderate-certainty [2].',
    boundary: 'Do not turn a black-cohosh signal into a class-wide supplement recommendation.',
  },
  {
    symptom: 'Vaginal / urogenital symptoms',
    evidence: 'A 2026 soy-isoflavone meta-analysis reported improvement in vaginal dryness and urogenital symptoms, with very high heterogeneity [9].',
    boundary: 'This is not the same evidence question as hot flashes or systemic estrogen therapy.',
  },
  {
    symptom: 'Muscle / strength',
    evidence: '2026 creatine meta-analysis: small lean-mass gain and leg-press strength improvement across postmenopausal RCTs; benefit concentrated in creatine + resistance-training contexts [10].',
    boundary: 'This does not make creatine a vasomotor, sleep, or mood treatment.',
  },
  {
    symptom: 'Cognition / “brain fog”',
    evidence: 'One 36-person trial reported selected cognitive/mood-related signals with specific nonstandard creatine formulations [11].',
    boundary: 'Hypothesis-generating, not a universal brain-fog protocol.',
  },
  {
    symptom: 'Bone health',
    evidence: 'Vitamin D/calcium belong in fracture-risk, diet, deficiency and osteoporosis care; the 2026 creatine meta-analysis found bone density unchanged overall [2,10].',
    boundary: 'Bone-support nutrients are not generic treatments for menopause symptoms.',
  },
  {
    symptom: 'Sleep',
    evidence: 'No single supplement has a menopause-specific evidence base strong enough to become a default insomnia treatment.',
    boundary: 'First identify vasomotor symptoms, insomnia disorder, sleep apnea, restless legs, mood, medications and other drivers.',
  },
]

export default function MenopauseSupplementsPage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="Menopause Supplements: What Works, What Does Not and How to Evaluate a Formula"
        description="2026 symptom-specific menopause supplement evidence with black-cohosh guideline reconciliation, soy outcome separation, creatine meta-analysis, and formula evaluation."
        url="https://thehippiescientist.net/guides/other/menopause-supplements"
        type="MedicalWebPage"
        citationUrls={MENOPAUSE_REFS.map((ref) => ref.url)}
      />
      <AuthorityBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Guides', href: '/guides/' }, { label: 'Menopause Supplements' }]} />

      <section className="space-y-5 max-w-4xl">
        <p className="eyebrow-label">Evidence Review · 13 Sources · Updated August 22, 2026</p>
        <h1 className="text-5xl font-bold tracking-tight text-ink">Menopause Supplements: Match the Ingredient to the Symptom—and the Product to the Trial</h1>
        <p className="text-lg leading-8 text-muted">
          Hot flashes, sleep problems, vaginal symptoms, bone loss, mood changes, cognitive complaints, and muscle changes are not one outcome. The 2026 evidence is also more nuanced than a simple “supplements work” or “supplements do not work” verdict: guideline conclusions differ, ingredient evidence varies by symptom, and retail combination products often do not match the interventions studied in trials.
        </p>
        <figure className="mt-6">
          <div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white">
            <Image src="/images/guides/menopause-supplements.jpg" alt="Menopause supplement evidence review with separate symptom categories" width={1536} height={1024} priority className="w-full h-auto" />
          </div>
          <figcaption className="mt-3 text-center text-sm text-muted">The useful sequence is symptom → ingredient → exact preparation → studied outcome → product match.</figcaption>
        </figure>
      </section>

      <LegacyGuideQuickAnswer referencesHref="#references">
        <p>
          <strong>There is no evidence-based universal menopause supplement stack.</strong> For vasomotor symptoms, the evidence is genuinely contested: NAMS 2023 did not recommend supplements/herbal remedies as a category [1], while a newer 2026 IMS evidence review graded black cohosh as moderate-certainty for vasomotor/menopausal symptoms [2]. Soy shows different results by endpoint—weak/mixed for hot flashes, potentially more favorable for some urogenital symptoms [7,9]. Creatine now has a 2026 postmenopausal meta-analysis supporting small lean-mass and strength gains, especially with resistance training, but not hot-flash or generalized menopause treatment [10].
        </p>
      </LegacyGuideQuickAnswer>

      <section id="menopause-symptom-evidence" data-answer-engine-table="true" className="card-premium p-6 space-y-4 max-w-5xl scroll-mt-24">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Evidence by symptom—not supplement popularity</h2>
        <div className="overflow-x-auto">
          <table className="min-w-[960px] w-full text-left text-sm">
            <caption className="sr-only">Menopause symptoms compared by supplement evidence and evidence limits</caption>
            <thead><tr className="border-b border-brand-900/10 text-ink"><th className="py-3 pr-4">Symptom / goal</th><th className="py-3 pr-4">Best evidence represented here</th><th className="py-3">Evidence boundary</th></tr></thead>
            <tbody className="text-muted">
              {symptomRows.map((row) => (
                <tr key={row.symptom} className="border-b border-brand-900/5 last:border-0 align-top">
                  <th scope="row" className="py-3 pr-4 text-left font-semibold text-ink">{row.symptom}</th><td className="py-3 pr-4">{row.evidence}</td><td className="py-3">{row.boundary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl">
        <p className="eyebrow-label">Guideline reconciliation</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Black cohosh is exactly why “recommended / not recommended” needs context</h2>
        <p className="text-sm leading-7 text-muted">
          NAMS 2023 placed supplements and herbal remedies in the “not recommended” category for vasomotor symptoms [1]. Since then, the 2026 systematic review used to inform updated International Menopause Society recommendations evaluated 158 studies and judged most complementary-therapy evidence low or very low certainty, but <strong>black cohosh was one of the exceptions with moderate-certainty evidence</strong> for vasomotor/menopausal symptoms [2]. A 2023 meta-analysis of 22 articles / 2,310 women also found pooled improvements in overall symptoms, hot flashes, and somatic symptoms, but not anxiety or depressive symptoms [3].
        </p>
        <p className="text-sm leading-7 text-muted">
          The correct takeaway is not “black cohosh is proven” or “NAMS was wrong.” Different reviews use different evidence windows, methods and recommendation frameworks. The newer efficacy signal deserves visibility while product identity and safety remain separate questions.
        </p>
      </section>

      <section className="rounded-2xl border border-amber-900/15 bg-amber-50/70 p-6 text-amber-950 dark:border-amber-200/20 dark:bg-amber-950/20 dark:text-amber-50">
        <p className="text-xs font-bold uppercase tracking-[0.16em]">Black-cohosh safety & identity</p>
        <h2 className="mt-2 text-2xl font-semibold">A positive meta-analysis does not make every bottle equivalent</h2>
        <p className="mt-3 text-sm leading-7">
          NCCIH continues to note rare serious liver-injury reports and uncertainty about causality [4]. A 2025 toxicology review summarizes human adverse-effect and mechanistic safety concerns [5]. Product identity is also a real issue: a 2024 adulteration review found a high proportion of black-cohosh samples in the published literature were reported adulterated or mislabeled, while explicitly warning that literature-based prevalence estimates have major limitations and may not represent the current market [6]. Evidence should therefore stay attached to the exact extract used, not the plant name alone.
        </p>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl">
        <p className="eyebrow-label">Soy isoflavones</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Different symptoms produce different soy conclusions</h2>
        <p className="text-sm leading-7 text-muted">
          The 2025 perimenopause meta-analysis did not find significant pooled benefits for hot flashes, excessive sweating, insomnia, or vasomotor symptoms [7]. A 2026 meta-analysis of 13 RCTs / 1,325 postmenopausal women reported improvements in vaginal dryness and urogenital symptoms, but heterogeneity exceeded 90%, so the result should stay qualified [9]. Those findings can coexist because they measure different outcomes.
        </p>
        <p className="text-sm leading-7 text-muted">
          “Phytoestrogen” also should not be translated into “same as taking estrogen.” A 40-trial meta-analysis involving 3,285 postmenopausal women found no significant effects on endometrial thickness, vaginal maturation index, FSH, or estradiol, with high-to-moderate certainty across those outcomes [8]. That does not prove zero biological activity; it does show that simplistic estrogen-equivalence language is inaccurate.
        </p>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl">
        <p className="eyebrow-label">Creatine · 2026 update</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">The strongest menopause-specific creatine case is muscle and strength—not “brain fog”</h2>
        <p className="text-sm leading-7 text-muted">
          A 2026 meta-analysis included seven randomized placebo-controlled trials / 608 postmenopausal women [10]. Creatine produced a small pooled lean-mass gain (+0.37 kg) and improved leg-press 1RM (+7.5 kg); benefit was most evident in trials combining at least 5 g/day with resistance training. Bone mineral density was unchanged overall, and adverse events were similar to placebo. Risk of bias was mostly rated “some concerns,” and the authors disclosed creatine-industry relationships relevant to interpretation [10].
        </p>
        <p className="text-sm leading-7 text-muted">
          The much smaller CONCRET-MENOPA study remains interesting for selected reaction-time, brain-creatine, lipid and mood-related signals, but it enrolled only 36 women and tested creatine hydrochloride / creatine ethyl ester regimens rather than a standard creatine-monohydrate cognition protocol [11]. It should not outrank the larger body-composition/strength evidence.
        </p>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-5xl">
        <p className="eyebrow-label">Brand-formula checkpoint</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">How to evaluate a product such as Healthspan MenoSerene without grading the label as a clinical trial</h2>
        <p className="text-sm leading-7 text-muted">
          The current Healthspan MenoSerene label lists, per daily dose, <strong>16 mg soy isoflavones, 10 mg flax lignans, 50 mg sage extract, 320 mg calcium, 187 mg magnesium, and 10 µg vitamin D3</strong>, alongside additional vitamins and minerals [12]. That is enough to evaluate label transparency; it is not evidence that the finished combination improves hot flashes, sleep, mood, cognition, or another menopause outcome.
        </p>
        <div className="overflow-x-auto rounded-xl border border-brand-900/10">
          <table className="min-w-[820px] w-full text-left text-sm"><thead><tr className="border-b border-brand-900/10"><th className="p-3">Question</th><th className="p-3">Why it matters</th></tr></thead><tbody className="divide-y divide-brand-900/5 text-muted">
            <tr><th className="p-3 text-ink">Is the ingredient/extract identifiable?</th><td className="p-3">A generic plant name cannot automatically inherit evidence from a standardized extract.</td></tr>
            <tr><th className="p-3 text-ink">Does the amount resemble the studied exposure?</th><td className="p-3">A formula may contain an evidence-backed ingredient at a materially different amount than the relevant trials.</td></tr>
            <tr><th className="p-3 text-ink">Was the same symptom studied?</th><td className="p-3">Hot-flash, vaginal, bone, sleep, cognition and strength evidence are not interchangeable.</td></tr>
            <tr><th className="p-3 text-ink">Was the finished combination tested?</th><td className="p-3">Without a trial of the exact combination, ingredient evidence cannot prove the finished formula’s net effect.</td></tr>
            <tr><th className="p-3 text-ink">Are nutrients filling a dietary need or being marketed as symptom treatment?</th><td className="p-3">Calcium, vitamin D and magnesium can have nutritional roles without proving relief of menopause symptoms.</td></tr>
          </tbody></table>
        </div>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Hormone therapy and supplements should not be compared as equal evidence categories</h2>
        <p className="text-sm leading-7 text-muted">
          Hormone therapy remains the most effective treatment for vasomotor symptoms when clinically appropriate [13]. That does not mean it is appropriate for every person, and this page is not a treatment recommendation. It does mean a supplement with an encouraging small trial should not be described as having the same depth of efficacy, long-term outcome, contraindication, and monitoring evidence as established therapies.
        </p>
      </section>

      <div id="references" className="scroll-mt-24"><References refs={MENOPAUSE_REFS} /></div>
      <LegacyGuideFAQ pagePath="/guides/other/menopause-supplements/" questions={[...FAQS]} />
      <EmailCapture headline="Get evidence reviews like this" description="Menopause evidence separated by symptom, product, and certainty instead of packaged into a universal stack." ctaLabel="Get the evidence" location="guide-menopause" />
      <div className="pt-4 border-t border-brand-900/10 flex items-center justify-between">
        <Link href="/guides/" className="inline-flex rounded-full border border-brand-900/10 bg-[var(--surface-card)] px-4 py-2 text-sm font-bold text-ink transition hover:bg-brand-50">← Back to guides</Link>
        <Link href="/info/supplement-safety-checklist/" className="text-sm font-bold text-brand-800 hover:underline">Safety checklist →</Link>
      </div>
    </div>
  )
}
