import Link from 'next/link'

function AppendixShell({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mx-auto mt-6 max-w-5xl px-4 sm:px-6 lg:px-8">
      <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
        <p className="eyebrow-label">{eyebrow}</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">{title}</h2>
        <div className="mt-4 space-y-5 text-[1.01rem] leading-[1.85] text-muted">{children}</div>
      </div>
    </section>
  )
}

export function BestAdhdSupplementsSeoAppendix() {
  return (
    <AppendixShell
      eyebrow="SEO idea expansion"
      title="Where rhodiola rosea and ashwagandha fit in an ADHD supplement plan"
    >
      <p>
        Rhodiola rosea and ashwagandha both show up in ADHD supplement searches, but they should not be framed as direct ADHD treatments. They are better understood as stress, fatigue, sleep, and emotional-regulation supports that may be relevant when those issues make attention harder. On a best supplements for ADHD page, the safer question is not “which herb treats ADHD?” but “which bottleneck is actually making focus worse?”
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-[0.9rem] border border-brand-900/10 bg-brand-50/40 p-4">
          <h3 className="text-lg font-semibold tracking-tight text-ink">Rhodiola rosea for ADHD-related fatigue</h3>
          <p className="mt-2 text-sm leading-7 text-muted">
            Rhodiola rosea is most relevant when the attention problem looks like stress fatigue, low stamina, or burnout-like mental effort rather than classic hyperactivity. The ADHD-specific evidence is limited, so it belongs below higher-yield priorities such as sleep, omega-3 status, magnesium or iron/ferritin assessment, and medication context.
          </p>
          <Link href="/guides/adhd/rhodiola-rosea-and-adhd/" className="mt-3 inline-flex text-sm font-semibold text-brand-800 hover:underline">
            Read the rhodiola ADHD guide →
          </Link>
        </article>

        <article className="rounded-[0.9rem] border border-brand-900/10 bg-brand-50/40 p-4">
          <h3 className="text-lg font-semibold tracking-tight text-ink">Ashwagandha for ADHD stress and sleep overlap</h3>
          <p className="mt-2 text-sm leading-7 text-muted">
            Ashwagandha is most relevant when ADHD symptoms overlap with stress load, poor sleep quality, or emotional overactivation. Its better evidence is for stress and sleep in broader populations, not for treating core ADHD symptoms. It should be used cautiously around thyroid conditions, pregnancy, liver concerns, sedatives, and complex medication regimens.
          </p>
          <Link href="/guides/adhd/ashwagandha-for-adhd/" className="mt-3 inline-flex text-sm font-semibold text-brand-800 hover:underline">
            Read the ashwagandha ADHD guide →
          </Link>
        </article>
      </div>

      <p>
        A practical ADHD supplement sequence still starts with foundations: sleep quality, nutrient status, diet quality, medication discussion, and one-at-a-time tracking. Rhodiola rosea and ashwagandha can be considered later only when the use case is specific, the safety context is clean, and expectations stay realistic.
      </p>
    </AppendixShell>
  )
}

export function Omega3AdhdSeoAppendix() {
  return (
    <AppendixShell
      eyebrow="SEO idea expansion"
      title="Fish oil supplements for ADHD: EPA vs DHA, dosage, and product-quality checks"
    >
      <p>
        Fish oil supplements for ADHD are usually evaluated by their EPA and DHA content, not by the total amount of oil in the capsule. Many products advertise “1,000 mg fish oil” while delivering much less combined EPA plus DHA. For ADHD research, the more useful label check is the actual milligrams of EPA and DHA per serving, the EPA:DHA ratio, and whether the product has oxidation and contaminant testing.
      </p>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-[0.9rem] border border-brand-900/10 bg-brand-50/40 p-4">
          <h3 className="text-lg font-semibold tracking-tight text-ink">EPA vs DHA for ADHD</h3>
          <p className="mt-2 text-sm leading-7 text-muted">
            EPA-dominant formulas have shown more consistent signals in ADHD trials, especially for behavioral symptoms. DHA is still important for brain structure and development, but DHA-dominant formulas are less consistently linked to short-term ADHD symptom changes.
          </p>
        </article>

        <article className="rounded-[0.9rem] border border-brand-900/10 bg-brand-50/40 p-4">
          <h3 className="text-lg font-semibold tracking-tight text-ink">Omega-3 dosage for ADHD</h3>
          <p className="mt-2 text-sm leading-7 text-muted">
            Study doses often land around 500–1,500 mg combined EPA + DHA daily, with some trials using higher totals. The right dose depends on age, diet, product concentration, bleeding risk, medication context, and clinician guidance.
          </p>
        </article>

        <article className="rounded-[0.9rem] border border-brand-900/10 bg-brand-50/40 p-4">
          <h3 className="text-lg font-semibold tracking-tight text-ink">Quality matters</h3>
          <p className="mt-2 text-sm leading-7 text-muted">
            Prioritize products that disclose EPA and DHA amounts, use third-party testing, and verify oxidation and heavy-metal limits. Rancid or poorly labeled fish oil can create a bad experiment even when the idea is reasonable.
          </p>
        </article>
      </div>

      <p>
        Omega-3 is best treated as foundational nutrient support, especially when fish intake is low or omega-3 status is likely poor. It is not an acute focus aid, and benefits in ADHD studies are usually modest and slow, often requiring consistent use over weeks rather than days.
      </p>

      <div className="flex flex-wrap gap-3 pt-1">
        <Link href="/guides/adhd/best-supplements-for-adhd/" className="chip-readable">Best ADHD supplements</Link>
        <Link href="/guides/adhd/nutrient-deficiencies-and-adhd/" className="chip-readable">Nutrient deficiencies and ADHD</Link>
        <Link href="/safety-checker/" className="chip-readable">Check stack safety</Link>
      </div>
    </AppendixShell>
  )
}
