import { buildPageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'
import Link from 'next/link'
import AffiliateDisclosure from '@/components/AffiliateDisclosure'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'

export const metadata: Metadata = buildPageMetadata({
  title: 'Kratom 7-OH Withdrawal Management | Evidence-Informed Harm Reduction Guide',
  description: 'Comprehensive evidence-informed guide to 7-hydroxymitragynine (7-OH) withdrawal management, symptom timeline, harm reduction strategies, and medical support context.',
  path: '/guides/kratom-7oh-withdrawal-management/',
})

export default function Page() {
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Guides', href: '/guides' },
    { label: 'Kratom 7-OH Withdrawal Management' },
  ]

  return (
    <div className="container-page py-10 space-y-8">
      <AuthorityBreadcrumbs items={breadcrumbs} />

      <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8">
        <p className="eyebrow-label">Harm Reduction Guide</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink sm:text-4xl">Kratom 7-OH Withdrawal Management</h1>
        <p className="detail-reading mt-4 text-muted">Evidence-informed strategies for 7-hydroxymitragynine (7-OH) withdrawal, including symptom timeline, tapering approaches, harm reduction context, and when to seek medical support.</p>
      </section>

      <section className="rounded-2xl border border-rose-900/15 bg-rose-50/80 p-5 text-sm leading-6 text-rose-950">
        <p className="font-semibold">Jurisdiction and emergency-care notice</p>
        <p className="mt-2">
          7-hydroxymitragynine and kratom products are restricted, scheduled, or otherwise regulated in some U.S. states and countries.
          This page is for harm-reduction education only, does not endorse possession or use, and is not legal advice.
          Check your local law and seek licensed medical care for severe withdrawal, suicidal thoughts, chest pain, dehydration, seizures, or unsafe home conditions.
        </p>
      </section>

      <AffiliateDisclosure />

      <section className="prose-section space-y-6">
        <div className="card-premium p-6">
          <p className="text-sm font-semibold text-brand-700 uppercase tracking-wide">Important Disclaimer</p>
          <p className="mt-3 text-sm text-muted">This guide is educational only and does not constitute medical advice. Withdrawal symptoms can vary significantly by individual, dose history, duration of use, and underlying health status. Always consult a healthcare provider before changing kratom use, especially if you have medical conditions, take medications, or experience severe withdrawal symptoms. This guide is intended for harm reduction and evidence-informed decision-making, not as a replacement for professional medical care.</p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-ink mt-6 mb-4">Understanding 7-OH and Withdrawal</h2>
          <p className="text-muted leading-relaxed">
            7-Hydroxymitragynine (7-OH) is a kratom alkaloid with mu-opioid receptor activity, similar in mechanism to pharmaceutical opioids but occurring naturally in Mitragyna speciosa leaves. Chronic 7-OH use can lead to physical dependence, resulting in withdrawal symptoms when discontinuing or reducing dosage. The intensity and duration of withdrawal depend on dose, frequency, duration of use, individual metabolism, and co-occurring conditions. For pharmacology and regulatory context, read the <Link href="/articles/7-hydroxymitragynine" className="font-semibold text-brand-800 hover:underline">full 7-OH evidence monograph</Link>.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-ink mt-6 mb-3">Withdrawal Timeline</h3>
          <p className="text-sm text-muted mb-4">Typical progression (varies significantly by individual):</p>
          <ul className="space-y-3 text-muted pl-5">
            <li className="flex gap-3">
              <span className="font-semibold text-ink min-w-fit">6–12 hours:</span>
              <span>Early symptoms may begin; anxiety, restlessness, mild body aches</span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-ink min-w-fit">24–48 hours:</span>
              <span>Peak symptoms onset; muscle aches, insomnia, sweating, irritability, appetite loss</span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-ink min-w-fit">3–5 days:</span>
              <span>Symptoms typically peak in intensity; focus and concentration remain difficult</span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-ink min-w-fit">1–2 weeks:</span>
              <span>Acute phase subsides; fatigue and mood dysregulation may persist</span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-ink min-w-fit">2–4 weeks:</span>
              <span>Protracted symptoms (anhedonia, sleep disruption, low motivation) may continue</span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-ink min-w-fit">4+ weeks:</span>
              <span>Most physical symptoms resolve; psychological symptoms may linger longer in heavy users</span>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-ink mt-6 mb-3">Common Withdrawal Symptoms</h3>
          <p className="text-sm text-muted mb-4">Physical and psychological effects typically observed:</p>
          <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
            <div className="space-y-2 text-sm">
              <p className="font-semibold text-ink">Physical Symptoms</p>
              <ul className="list-disc pl-5 space-y-1 text-muted">
                <li>Muscle and body aches</li>
                <li>Chills and temperature dysregulation</li>
                <li>Sweating and night sweats</li>
                <li>Gastrointestinal distress</li>
                <li>Insomnia and sleep disruption</li>
                <li>Fatigue and low energy</li>
                <li>Dilated pupils</li>
                <li>Headaches</li>
                <li>Increased heart rate</li>
              </ul>
            </div>
            <div className="space-y-2 text-sm">
              <p className="font-semibold text-ink">Psychological Symptoms</p>
              <ul className="list-disc pl-5 space-y-1 text-muted">
                <li>Anxiety and panic</li>
                <li>Irritability and mood swings</li>
                <li>Dysphoria (emotional flatness, low mood)</li>
                <li>Difficulty concentrating</li>
                <li>Anhedonia (loss of pleasure)</li>
                <li>Cravings for kratom</li>
                <li>Restlessness and agitation</li>
                <li>Appetite loss</li>
                <li>Intrusive thoughts or rumination</li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">Harm Reduction Strategies</h2>

          <h3 className="text-xl font-semibold text-ink mt-6 mb-3">Tapering Approaches</h3>
          <p className="text-muted mb-4">Gradual reduction minimizes withdrawal intensity compared to cold-turkey cessation.</p>

          <div className="space-y-4">
            <div className="border-l-4 border-brand-200 pl-4">
              <p className="font-semibold text-ink">Slow Taper (4–8 weeks)</p>
              <p className="text-sm text-muted mt-2">Reduce daily dose by 10–25% every 3–7 days, depending on tolerance and symptom management. Example: If taking 20 grams daily, reduce to 18 grams, then 15 grams, then 12 grams, etc. Slow tapers are often better tolerated but require patience and discipline.</p>
            </div>

            <div className="border-l-4 border-brand-200 pl-4">
              <p className="font-semibold text-ink">Medium Taper (2–3 weeks)</p>
              <p className="text-sm text-muted mt-2">Reduce dose by 25–33% every 3–5 days. Provides balance between discomfort and quicker completion. May produce more noticeable withdrawal but is faster than slow tapering.</p>
            </div>

            <div className="border-l-4 border-brand-200 pl-4">
              <p className="font-semibold text-ink">Rapid Taper (7–10 days)</p>
              <p className="text-sm text-muted mt-2">Reduce dose by 50% every 2–3 days. Produces more acute withdrawal but faster resolution. Suitable for individuals with high motivation and good access to support.</p>
            </div>

            <div className="border-l-4 border-brand-200 pl-4">
              <p className="font-semibold text-ink">Cold Turkey (Abrupt Cessation)</p>
              <p className="text-sm text-muted mt-2">Stopping all use immediately. Produces most severe withdrawal but is sometimes necessary due to access, cost, or personal choice. Medical support is highly recommended with this approach.</p>
            </div>
          </div>

          <p className="text-sm text-muted mt-6">Choosing a taper schedule depends on individual factors: baseline health, concurrent medications, work obligations, psychological stability, and access to medical or psychological support. Slower tapers are generally safer but require extended commitment.</p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-ink mt-6 mb-3">Symptom Management</h3>

          <div className="space-y-4">
            <div>
              <p className="font-semibold text-ink">Sleep Support</p>
              <p className="text-sm text-muted mt-2">Insomnia is a primary complaint. Non-pharmacological approaches: establish consistent sleep schedule, avoid caffeine, use cool bedroom environment, limit screen time before bed, practice relaxation techniques. If severe, medical consultation for short-term sleep support may be appropriate.</p>
            </div>

            <div>
              <p className="font-semibold text-ink">Pain and Muscle Aches</p>
              <p className="text-sm text-muted mt-2">Heat application (warm bath, heating pad), light stretching, non-strenuous movement, and over-the-counter pain management (per provider guidance) may help. Avoid strenuous exercise during peak withdrawal, but gentle movement (walking, yoga) can reduce overall discomfort and support mood.</p>
            </div>

            <div>
              <p className="font-semibold text-ink">Gastrointestinal Distress</p>
              <p className="text-sm text-muted mt-2">Stay hydrated, eat small frequent meals, avoid heavy or spicy foods, use ginger or peppermint tea if tolerated. If severe diarrhea or constipation develops, medical consultation is warranted.</p>
            </div>

            <div>
              <p className="font-semibold text-ink">Anxiety and Mood Support</p>
              <p className="text-sm text-muted mt-2">Grounding techniques (5-4-3-2-1 sensory method), breathing exercises (4-7-8 breathing), meditation apps, journaling, and social connection all support psychological withdrawal. Professional mental health support is valuable, especially for individuals with depression or anxiety history.</p>
            </div>

            <div>
              <p className="font-semibold text-ink">Hydration and Nutrition</p>
              <p className="text-sm text-muted mt-2">Withdrawal accelerates fluid loss and electrolyte imbalance. Drink adequate water, consider electrolyte beverages (coconut water, sports drinks), and maintain nutrition despite appetite loss. Nutritional support may ease fatigue and support mood regulation.</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-ink mt-6 mb-3">Medical and Professional Support</h3>
          <p className="text-muted mb-4">Healthcare providers can offer evidence-based support during kratom withdrawal:</p>

          <ul className="space-y-3 text-muted pl-5">
            <li className="flex gap-3">
              <span className="font-semibold text-ink min-w-fit">Assessment:</span>
              <span>Evaluation of overall health, medication interactions, mental health history, and severity of dependence to tailor a withdrawal plan</span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-ink min-w-fit">Monitoring:</span>
              <span>Regular check-ins to monitor symptoms, adjust plans, and identify complications</span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-ink min-w-fit">Symptomatic Treatment:</span>
              <span>Short-term use of approved medications to manage specific symptoms (e.g., sleep aids, anti-anxiety agents) under medical supervision</span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-ink min-w-fit">Mental Health Support:</span>
              <span>Therapy or counseling to address psychological withdrawal, underlying causes of kratom use, and relapse prevention</span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-ink min-w-fit">Substance Use Specialist Referral:</span>
              <span>Connection to addiction medicine specialists or substance use disorder treatment programs if appropriate</span>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">Relapse Prevention</h2>
          <p className="text-muted mb-4">After completing withdrawal, preventing return to kratom use is critical:</p>

          <ul className="space-y-3 text-muted pl-5">
            <li className="flex gap-3">
              <span className="font-semibold text-ink min-w-fit">Identify Triggers:</span>
              <span>Recognize situations, emotions, or people that prompted kratom use and plan alternative responses</span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-ink min-w-fit">Build Support Network:</span>
              <span>Maintain connection to healthcare providers, therapists, support groups, or trusted individuals who support your abstinence</span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-ink min-w-fit">Lifestyle Modifications:</span>
              <span>Establish healthy routines for sleep, exercise, nutrition, and stress management to reduce protracted withdrawal and cravings</span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-ink min-w-fit">Address Underlying Conditions:</span>
              <span>If kratom use masked pain, anxiety, depression, or other conditions, seek appropriate medical or therapeutic treatment for those conditions</span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-ink min-w-fit">Avoid Triggers:</span>
              <span>When possible, avoid people, places, or situations associated with kratom use during early recovery</span>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">When to Seek Emergency Care</h2>
          <p className="text-muted mb-4">Contact emergency services or go to an emergency department if you experience:</p>

          <ul className="space-y-2 text-muted pl-5 text-sm">
            <li>Chest pain or difficulty breathing</li>
            <li>Severe confusion, hallucinations, or altered consciousness</li>
            <li>Suicidal thoughts or severe self-harm urges</li>
            <li>Seizures</li>
            <li>Severe allergic reaction (rash, anaphylaxis)</li>
            <li>Severe dehydration with dizziness, fainting, or rapid heart rate</li>
            <li>Signs of infection (high fever, severe infection)</li>
            <li>Severe gastrointestinal bleeding</li>
          </ul>

          <p className="text-muted mt-4 text-sm">These complications are rare but require immediate medical attention. Do not delay seeking emergency care due to stigma or fear of legal consequences—emergency providers are present to help, not judge.</p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">Key Takeaways</h2>
          <div className="space-y-3 text-muted pl-5">
            <p>• 7-OH withdrawal is a real physical and psychological process requiring patience and support, not willpower alone.</p>
            <p>• Tapering reduces withdrawal intensity and increases success rates compared to stopping abruptly.</p>
            <p>• Withdrawal symptoms typically peak in 3–5 days but can persist in modified form for weeks or months.</p>
            <p>• Medical and mental health support significantly improves outcomes and safety.</p>
            <p>• Addressing underlying conditions (pain, anxiety, stress) reduces relapse risk.</p>
            <p>• Recovery is possible, and many people successfully manage kratom withdrawal and maintain abstinence with the right support.</p>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-ink mt-8 mb-4">References and Further Reading</h2>
          <p className="text-muted mb-4 text-sm">This guide synthesizes evidence from:</p>
          <ul className="space-y-2 text-muted pl-5 text-sm">
            <li>Clinical literature on opioid withdrawal management principles</li>
            <li>Pharmacological research on kratom alkaloids and mu-opioid receptor binding</li>
            <li>Harm reduction frameworks from addiction medicine and public health</li>
            <li>Patient-reported withdrawal experiences and coping strategies</li>
            <li>Medical guidelines on substance use disorder treatment and relapse prevention</li>
          </ul>
          <p className="text-muted mt-4 text-sm">Consult your healthcare provider for personalized information based on your specific health context and medication use.</p>
        </div>
      </section>

      <section className="card-premium p-6 mt-8">
        <p className="text-sm font-semibold text-brand-700 uppercase tracking-wide">Next Steps</p>
        <div className="mt-4 space-y-2 text-sm text-muted">
          <p>Speak with a healthcare provider about your withdrawal plan and access to medical support.</p>
          <p>Consider connecting with mental health services or support groups for additional support during the withdrawal process.</p>
          <p>Prepare your environment: stock non-addictive comfort items, arrange social support, and plan activities for distraction and mood support.</p>
        </div>
      </section>

      <div className="mt-8 flex gap-4 flex-wrap">
        <Link href="/guides" className="text-sm font-medium text-emerald-700 hover:underline">Back to guides →</Link>
        <Link href="/articles/7-hydroxymitragynine" className="text-sm font-medium text-emerald-700 hover:underline">Read the 7-OH monograph →</Link>
        <Link href="/compounds/7-hydroxymitragynine" className="text-sm font-medium text-emerald-700 hover:underline">View 7-OH compound profile →</Link>
      </div>
    </div>
  )
}
