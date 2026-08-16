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
  title: 'Menopause Supplements: Symptom-Specific Evidence (2026)',
  description:
    'Guideline-led menopause supplement review separating hot flashes, bone health, sleep, cognition, mood, and muscle evidence. Includes creatine, soy isoflavones, black cohosh, vitamin D/calcium, and magnesium limitations.',
  path: '/guides/other/menopause-supplements/',
  openGraphType: 'article',
})

const FAQS = [
  {
    question: 'What supplements are recommended for hot flashes and night sweats?',
    answer:
      'The Menopause Society’s 2023 nonhormone position statement does not recommend dietary supplements or herbal remedies as a treatment category for vasomotor symptoms because evidence is inconsistent. Hormone therapy remains the most effective treatment when appropriate, and several nonhormone prescription and behavioral options have stronger evidence than supplements.',
  },
  {
    question: 'Does soy help hot flashes?',
    answer:
      'Soy-isoflavone studies have produced mixed results. A recent meta-analysis found small overall symptom effects but no significant pooled benefit for hot flashes or vasomotor symptoms, and The Menopause Society does not recommend soy foods or extracts as a vasomotor treatment category. Soy foods can still be part of a healthy diet; that is a different claim from treating hot flashes.',
  },
  {
    question: 'Does creatine help menopause brain fog?',
    answer:
      'Evidence is early. CONCRET-MENOPA enrolled only 36 peri/postmenopausal women across four groups and tested low-dose creatine hydrochloride and creatine ethyl ester regimens. Selected reaction-time, brain-creatine, lipid, and mood-related signals were reported, but the study did not establish a universal menopause protocol or test the common 3–5 g/day creatine-monohydrate recommendation.',
  },
  {
    question: 'Is black cohosh effective and safe?',
    answer:
      'Black-cohosh evidence is inconsistent and may be product-specific. NCCIH notes possible benefit in some studies but no high-quality, consistent evidence across products. Rare serious liver injury has been reported, causality is uncertain, and some commercial products have contained the wrong herb or undeclared mixtures.',
  },
  {
    question: 'Do vitamin D, calcium, or magnesium treat menopause symptoms?',
    answer:
      'They should not be treated as one menopause-symptom package. Vitamin D and calcium belong mainly in bone-health, dietary-intake, deficiency, and osteoporosis decisions. Magnesium has limited sleep evidence in selected populations, but that is not menopause-specific proof that magnesium treats menopausal insomnia.',
  },
] as const

const MENOPAUSE_REFS = [
  {
    n: 1,
    text: 'The North American Menopause Society. (2023). Nonhormone therapy position statement. Menopause, 30(6):573-590.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/37252752/',
  },
  {
    n: 2,
    text: 'Korovljev D, et al. (2026). CONCRET-MENOPA: randomized trial of creatine formulations in 36 peri/postmenopausal women. J Am Nutr Assoc, 45(3):199-210.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/40854087/',
  },
  {
    n: 3,
    text: 'Effects of soy isoflavones on menopausal symptoms in perimenopausal women: systematic review and meta-analysis. (2025).',
    url: 'https://pubmed.ncbi.nlm.nih.gov/40718787/',
  },
  {
    n: 4,
    text: 'NCCIH. Black Cohosh: Usefulness and Safety.',
    url: 'https://www.nccih.nih.gov/health/black-cohosh',
  },
  {
    n: 5,
    text: 'NCCIH. Menopausal Symptoms and Complementary Health Approaches.',
    url: 'https://www.nccih.nih.gov/health/menopausal-symptoms-in-depth',
  },
  {
    n: 6,
    text: 'The North American Menopause Society. (2022). Hormone Therapy Position Statement. Menopause, 29(7):767-794.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/35797481/',
  },
]

const symptomRows = [
  {
    symptom: 'Hot flashes / night sweats',
    supplementEvidence: 'Supplements and herbal remedies are not recommended as a treatment category in the 2023 Menopause Society statement [1].',
    betterFrame: 'Compare evidence-based hormone and nonhormone options rather than ranking supplements.',
  },
  {
    symptom: 'Cognition / “brain fog”',
    supplementEvidence: 'One 36-person creatine trial reported selected signals with specific creatine formulations [2].',
    betterFrame: 'Promising, early, product-specific evidence—not a universal creatine protocol.',
  },
  {
    symptom: 'Sleep',
    supplementEvidence: 'No supplement has a menopause-specific evidence base strong enough to become a default insomnia treatment.',
    betterFrame: 'Identify vasomotor symptoms, insomnia disorder, sleep apnea, restless legs, mood, medications, and other causes first.',
  },
  {
    symptom: 'Bone health',
    supplementEvidence: 'Vitamin D and calcium have nutritional/osteoporosis roles, but they are not generic treatments for menopause symptoms.',
    betterFrame: 'Use dietary intake, deficiency status, fracture risk, and osteoporosis guidance.',
  },
  {
    symptom: 'Muscle / strength',
    supplementEvidence: 'Creatine has broader exercise and muscle evidence, but the menopause-specific clinical question is distinct from hot-flash treatment.',
    betterFrame: 'Keep resistance training, protein intake, and condition-specific evidence separate from vasomotor claims.',
  },
]

export default function MenopauseSupplementsPage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="Menopause Supplements: Symptom-Specific Evidence"
        description="Guideline-led review separating vasomotor symptoms, cognition, sleep, bone health, and muscle evidence."
        url="https://thehippiescientist.net/guides/other/menopause-supplements"
        type="MedicalWebPage"
        citationUrls={MENOPAUSE_REFS.map((ref) => ref.url)}
      />
      <AuthorityBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Guides', href: '/guides/' }, { label: 'Menopause Supplements' }]} />

      <section className="space-y-5 max-w-4xl">
        <p className="eyebrow-label">Evidence Review · Symptom-specific, not stack-based</p>
        <h1 className="text-5xl font-bold tracking-tight text-ink">Menopause Supplements: Match the Evidence to the Symptom</h1>
        <p className="text-lg leading-8 text-muted">
          Hot flashes, sleep problems, bone loss, mood changes, cognitive complaints, and muscle changes are not one outcome. A supplement can have evidence in one lane and none in another. That is why this guide does not rank a universal menopause stack or convert small trials into fixed dosing protocols.
        </p>
        <figure className="mt-6">
          <div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white">
            <Image src="/images/guides/menopause-supplements.jpg" alt="Menopause supplement evidence review with separate symptom categories" width={1536} height={1024} priority className="w-full h-auto" />
          </div>
          <figcaption className="mt-3 text-center text-sm text-muted">The useful question is “which symptom?” before “which supplement?”</figcaption>
        </figure>
      </section>

      <LegacyGuideQuickAnswer referencesHref="#references">
        <p>
          There is <strong>no evidence-based universal menopause supplement stack</strong>. For hot flashes and night sweats, The Menopause Society’s 2023 nonhormone statement does not recommend supplements or herbal remedies as a treatment category [1]. Soy evidence remains mixed [3]. Black cohosh has product-specific and liver-safety uncertainty [4,5]. Creatine has an interesting but very small menopause-specific trial in 36 women [2], which is not enough to establish a broad dosing protocol. Vitamin D/calcium and magnesium belong in separate bone-health, deficiency, or sleep questions rather than one “menopause formula.”
        </p>
      </LegacyGuideQuickAnswer>

      <section id="menopause-symptom-evidence" data-answer-engine-table="true" className="card-premium p-6 space-y-4 max-w-5xl scroll-mt-24">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Evidence by symptom—not by supplement popularity</h2>
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-left text-sm">
            <caption className="sr-only">Menopause symptom categories compared by supplement evidence and better decision frame</caption>
            <thead>
              <tr className="border-b border-brand-900/10 text-ink">
                <th scope="col" className="py-3 pr-4">Symptom / goal</th>
                <th scope="col" className="py-3 pr-4">What supplement evidence supports</th>
                <th scope="col" className="py-3">Better decision frame</th>
              </tr>
            </thead>
            <tbody className="text-muted">
              {symptomRows.map((row) => (
                <tr key={row.symptom} className="border-b border-brand-900/5 last:border-0 align-top">
                  <th scope="row" className="py-3 pr-4 text-left font-semibold text-ink">{row.symptom}</th>
                  <td className="py-3 pr-4">{row.supplementEvidence}</td>
                  <td className="py-3">{row.betterFrame}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Vasomotor symptoms: supplements are not the evidence leader</h2>
        <p className="text-sm leading-7 text-muted">
          The Menopause Society’s 2023 position statement recommends several nonhormone approaches for vasomotor symptoms but lists supplements/herbal remedies—and soy foods/extracts—as not recommended because evidence is inconsistent [1]. Hormone therapy remains the most effective treatment for vasomotor symptoms when clinically appropriate [1,6]. That does not mean every person should use hormone therapy; it means supplement pages should not imply equivalent evidence.
        </p>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Creatine: interesting signal, tiny menopause-specific evidence base</h2>
        <p className="text-sm leading-7 text-muted">
          CONCRET-MENOPA randomized 36 peri/postmenopausal women across four groups and tested low-dose creatine hydrochloride, creatine ethyl ester combinations, and placebo for eight weeks [2]. Selected reaction-time, frontal-brain-creatine, lipid, and mood-related signals were reported. That is hypothesis-generating evidence—not proof that creatine treats menopause “brain fog,” not proof of broad mood or muscle benefit in this population, and not evidence for a 3–5 g/day creatine-monohydrate menopause protocol because that regimen was not tested in this trial.
        </p>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Soy isoflavones: mixed evidence, especially for vasomotor outcomes</h2>
        <p className="text-sm leading-7 text-muted">
          Soy-isoflavone research is heterogeneous across product, dose, population, and outcome. A 2025 meta-analysis found a small overall symptom signal but no significant pooled effect on hot flashes, excessive sweating, insomnia, or vasomotor symptoms [3]. That lines up with the guideline-level caution against treating soy as a dependable vasomotor therapy [1]. Soy foods can still fit a healthy dietary pattern; that is a nutrition claim, not a hot-flash treatment claim.
        </p>
      </section>

      <section className="rounded-2xl border border-amber-900/15 bg-amber-50/70 p-6 text-amber-950 dark:border-amber-200/20 dark:bg-amber-950/20 dark:text-amber-50">
        <p className="text-xs font-bold uppercase tracking-[0.16em]">Black-cohosh boundary</p>
        <h2 className="mt-2 text-2xl font-semibold">Product identity and liver safety matter</h2>
        <p className="mt-3 text-sm leading-7">
          NCCIH describes black-cohosh findings as inconsistent across products and studies [4,5]. Rare serious liver injury has been reported, although causality is uncertain, and some commercial products have contained the wrong herb or undeclared mixtures [4]. That makes “black cohosh” a product-specific evidence and quality question—not a generic backup option after other supplements fail.
        </p>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Bone health and sleep belong in their own evidence lanes</h2>
        <p className="text-sm leading-7 text-muted">
          Vitamin D and calcium matter for nutrition and bone health, but decisions about supplementation depend on dietary intake, deficiency risk, fracture risk, osteoporosis status, kidney function, and other clinical context. They should not appear in a “menopause stack” simply because menopause changes bone risk. Likewise, generic magnesium sleep studies in older adults do not establish a menopause-specific treatment for insomnia.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/guides/other/vitamin-d-k2-guide/" className="rounded-full border border-brand-900/10 px-4 py-2 text-sm font-semibold text-brand-800 hover:bg-brand-50">Vitamin D + K2 evidence →</Link>
          <Link href="/guides/other/magnesium-types-guide/" className="rounded-full border border-brand-900/10 px-4 py-2 text-sm font-semibold text-brand-800 hover:bg-brand-50">Magnesium forms →</Link>
        </div>
      </section>

      <References refs={MENOPAUSE_REFS} />
      <LegacyGuideFAQ pagePath="/guides/other/menopause-supplements/" questions={[...FAQS]} />
      <EmailCapture headline="Get evidence reviews like this" description="Menopause evidence separated by symptom, not packaged into a supplement stack." ctaLabel="Get the evidence" location="guide-menopause" />
      <div className="pt-4 border-t border-brand-900/10 flex items-center justify-between">
        <Link href="/guides/" className="inline-flex rounded-full border border-brand-900/10 bg-[var(--surface-card)] px-4 py-2 text-sm font-bold text-ink transition hover:bg-brand-50">← Back to guides</Link>
        <Link href="/info/supplement-safety-checklist/" className="text-sm font-bold text-brand-800 hover:underline">Safety checklist →</Link>
      </div>
    </div>
  )
}
