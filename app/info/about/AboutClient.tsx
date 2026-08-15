'use client'

import { useState } from 'react'
import Link from 'next/link'
import AuthorCredentials from '@/components/AuthorCredentials'
import JsonLd from '@/components/seo/JsonLd'

const pillars = [
  {
    title: 'Evidence-first synthesis',
    body: 'We map natural compounds back to peer-reviewed studies and human clinical trials, stating evidence levels with the limitations and uncertainty kept visible.',
  },
  {
    title: 'Safety-first governance',
    body: 'We surface known and potential medication interactions, contraindications, and precautions, and keep uncertainty visible when evidence is incomplete. Product links are suppressed for high-caution substances where appropriate.',
  },
  {
    title: 'Anti-oversimplification',
    body: 'We explain preclinical mechanisms of action to outline pathways, but differentiate them clearly from demonstrated human outcomes.',
  },
]

const reviewSteps = [
  {
    title: 'Evidence audit',
    label: 'Claim matching',
    body: 'Evidence claims are checked against primary sources, cited studies, and study-design context so preclinical mechanisms are not presented as proven human outcomes.',
  },
  {
    title: 'Safety review',
    label: 'Conservative language',
    body: 'Caution language is kept explicit when legal status, interaction risk, population exclusions, or dosing uncertainty make a profile inappropriate for casual use.',
  },
  {
    title: 'Commerce check',
    label: 'Affiliate separation',
    body: "Product and sourcing modules are separated from evidence grades, and affiliate configuration cannot raise an ingredient's rating or suppress caution language.",
  },
]

export default function AboutClient() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const mailtoUrl = `mailto:support@thehippiescientist.net?subject=${encodeURIComponent(
      subject || 'General Inquiry'
    )}&body=${encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    )}`
    window.location.href = mailtoUrl
  }

  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Willie B. Randolph III',
    url: 'https://thehippiescientist.net/info/about/',
    jobTitle: 'Founder & Head Researcher',
    worksFor: {
      '@type': 'Organization',
      name: 'The Hippie Scientist',
      url: 'https://thehippiescientist.net/',
    },
    homeLocation: {
      '@type': 'Place',
      name: 'Oak Ridge, TN',
    },
    sameAs: [
      'https://x.com/TheHippieSci',
      'https://www.instagram.com/thehippiesci',
    ],
  }

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-8 sm:space-y-12 sm:py-12">
      <JsonLd schema={personJsonLd} />

      <section className="hero-shell rounded-[2rem] border p-6 sm:p-8 lg:p-10">
        <p className="eyebrow-label">Our vision &amp; purpose</p>
        <h1 className="heading-premium mt-5 max-w-4xl">About The Hippie Scientist</h1>

        <div className="mt-5 grid gap-7 lg:grid-cols-[1.25fr_0.75fr] lg:items-end lg:gap-10">
          <div>
            <p className="text-reading max-w-3xl">
              The Hippie Scientist is an evidence-first reference for herbs, supplements, and compounds. We publish mechanism, safety, and practical context across a growing research library — plain English, conservative on claims, and grounded in the strength of available evidence.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/herbs/" className="button-primary inline-flex min-h-11 items-center rounded-full px-5 py-2.5 text-sm font-semibold">
                Explore herbs
              </Link>
              <Link href="/compounds/" className="button-secondary inline-flex min-h-11 items-center rounded-full px-5 py-2.5 text-sm font-semibold">
                Explore compounds
              </Link>
              <Link href="/guides/" className="button-secondary inline-flex min-h-11 items-center rounded-full px-5 py-2.5 text-sm font-semibold">
                Browse by goals
              </Link>
            </div>
          </div>

          <aside className="border-l-2 border-[color:color-mix(in_srgb,var(--hs-gold)_44%,transparent)] pl-5">
            <p className="font-mono text-[0.64rem] font-bold uppercase tracking-[0.14em] text-[color:var(--hs-gold-ink)]">
              Independent project
            </p>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-[-0.03em] text-[color:var(--hs-ink)]">Willie B. Randolph III</h2>
            <p className="mt-2 text-sm leading-7 text-[color:var(--hs-body)]">
              Age 34, father of two little girls, and based in Oak Ridge, Tennessee. He built this site to make supplement choices feel calmer, clearer, and less like marketing.
            </p>
            <dl className="mt-5 grid grid-cols-3 border-y border-[color:var(--hs-hairline)] py-3 text-center">
              <div>
                <dt className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-[color:var(--hs-body)]">Age</dt>
                <dd className="mt-1 font-display text-xl font-semibold text-[color:var(--hs-ink)]">34</dd>
              </div>
              <div className="border-x border-[color:var(--hs-hairline)]">
                <dt className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-[color:var(--hs-body)]">Family</dt>
                <dd className="mt-1 font-display text-xl font-semibold text-[color:var(--hs-ink)]">2 girls</dd>
              </div>
              <div>
                <dt className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-[color:var(--hs-body)]">Home</dt>
                <dd className="mt-1 font-display text-lg font-semibold text-[color:var(--hs-ink)]">Oak Ridge</dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>

      <section aria-labelledby="principles-title">
        <p className="section-label">Operating principles</p>
        <h2 id="principles-title" className="mt-3 max-w-2xl font-display text-3xl font-semibold tracking-[-0.035em] text-[color:var(--hs-ink)]">
          Three rules shape the research library
        </h2>
        <div className="mt-7 grid gap-7 md:grid-cols-3">
          {pillars.map((pillar, index) => (
            <article key={pillar.title} className="border-t border-[color:var(--hs-hairline)] pt-4">
              <p aria-hidden="true" className="font-mono text-[0.64rem] font-bold tracking-[0.12em] text-[color:var(--hs-gold-ink)]">
                {String(index + 1).padStart(2, '0')}
              </p>
              <h3 className="mt-3 font-display text-xl font-semibold tracking-[-0.025em] text-[color:var(--hs-ink)]">{pillar.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[color:var(--hs-body)]">{pillar.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-[color:var(--hs-hairline)] py-8 sm:py-10" aria-labelledby="review-title">
        <div className="max-w-2xl">
          <p className="section-label">Editorial review</p>
          <h2 id="review-title" className="mt-3 font-display text-3xl font-semibold tracking-[-0.035em] text-[color:var(--hs-ink)]">How review works</h2>
          <p className="mt-3 text-sm leading-7 text-[color:var(--hs-body)]">
            We use a documented editorial process to audit monograph data, evidence language, safety cautions, and affiliate separation before publication.
          </p>
          <p className="mt-2 font-mono text-[0.64rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--hs-body)]">Last reviewed · August 2026</p>
        </div>

        <div className="mt-7 grid gap-7 md:grid-cols-3">
          {reviewSteps.map((step, index) => (
            <article key={step.title} className="border-t border-[color:var(--hs-hairline)] pt-4">
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-mono text-[0.64rem] font-bold tracking-[0.12em] text-[color:var(--hs-gold-ink)]">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="text-right text-[0.62rem] font-bold uppercase tracking-[0.12em] text-[color:var(--tone-ink)]">{step.label}</span>
              </div>
              <h3 className="mt-3 font-display text-xl font-semibold text-[color:var(--hs-ink)]">{step.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[color:var(--hs-body)]">{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-start md:gap-10">
        <div>
          <p className="section-label">Editorial process</p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.035em] text-[color:var(--hs-ink)]">How we build monograph content</h2>
          <p className="mt-4 text-sm leading-7 text-[color:var(--hs-body)]">
            Our process is designed to be transparent and separated from commercial product incentives:
          </p>
          <div className="mt-5 divide-y divide-[color:var(--hs-hairline)] text-sm leading-7 text-[color:var(--hs-body)]">
            <p className="py-4 first:pt-0"><strong className="font-semibold text-[color:var(--hs-ink)]">Source review:</strong> Ingredient entries draw from our structured evidence data and cited sources so fields can be reviewed consistently.</p>
            <p className="py-4"><strong className="font-semibold text-[color:var(--hs-ink)]">Evidence grading:</strong> We weigh study design, directness, replication, sample size, and limitations. Human randomized trials and high-quality syntheses generally carry more weight than mechanistic or preclinical evidence.</p>
            <p className="py-4 last:pb-0"><strong className="font-semibold text-[color:var(--hs-ink)]">Affiliate transparency:</strong> Affiliate links are secondary to the evidence review. Commercial availability cannot improve an ingredient&apos;s evidence grade or remove safety cautions.</p>
          </div>
        </div>

        <aside className="card-premium p-6">
          <p className="section-label">Get in touch</p>
          <h2 className="mt-3 font-display text-2xl font-semibold tracking-[-0.025em] text-[color:var(--hs-ink)]">Send us a message</h2>
          <p className="mt-2 text-xs leading-6 text-[color:var(--hs-body)]">
            Have scientific feedback or found a bug? Send a message and we’ll review it.
          </p>

          <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
            <div>
              <label htmlFor="contact-name" className="mb-1 block text-xs font-semibold text-[color:var(--hs-ink)]">Name</label>
              <input id="contact-name" type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-full rounded-lg px-3 py-2 text-xs" />
            </div>
            <div>
              <label htmlFor="contact-email" className="mb-1 block text-xs font-semibold text-[color:var(--hs-ink)]">Email</label>
              <input id="contact-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="reviewer@thehippiescientist.net" className="w-full rounded-lg px-3 py-2 text-xs" />
            </div>
            <div>
              <label htmlFor="contact-subject" className="mb-1 block text-xs font-semibold text-[color:var(--hs-ink)]">Subject</label>
              <input id="contact-subject" type="text" required value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Editorial suggestion" className="w-full rounded-lg px-3 py-2 text-xs" />
            </div>
            <div>
              <label htmlFor="contact-message" className="mb-1 block text-xs font-semibold text-[color:var(--hs-ink)]">Message</label>
              <textarea id="contact-message" required rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write your feedback..." className="w-full resize-none rounded-lg px-3 py-2 text-xs" />
            </div>
            <button type="submit" className="button-primary min-h-11 w-full rounded-full px-4 py-2.5 text-xs font-bold">
              Compose Email →
            </button>
          </form>
        </aside>
      </section>

      <AuthorCredentials />
    </div>
  )
}
