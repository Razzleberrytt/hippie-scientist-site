'use client'

import { useState } from 'react'
import Link from 'next/link'
import { TOTAL_PROFILE_COUNT } from '@/lib/profile-counts'
import AuthorCredentials from '@/components/AuthorCredentials'

export default function AboutPage() {
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

  return (
    <div className="mx-auto max-w-5xl space-y-12 px-4 py-8 sm:py-12">
      {/* Hero / Vision Section */}
      <section className="rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">
          Our Vision &amp; Purpose
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          About The Hippie Scientist
        </h1>

        <p className="mt-4 max-w-3xl text-base leading-7 text-muted sm:text-lg">
          The Hippie Scientist is an evidence-first reference for herbs, supplements, and compounds. We publish mechanism, safety, and practical context for {TOTAL_PROFILE_COUNT}+ profiles — plain-English, conservative on claims, and grounded in the strength of available research.
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            href="/herbs"
            className="rounded-full bg-brand-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-900"
          >
            Explore herbs
          </Link>

          <Link
            href="/compounds"
            className="rounded-full border border-brand-900/20 px-5 py-3 text-sm font-semibold text-ink transition hover:border-brand-700 hover:bg-brand-50"
          >
            Explore compounds
          </Link>

          <Link
            href="/goals"
            className="rounded-full border border-brand-900/20 px-5 py-3 text-sm font-semibold text-ink transition hover:border-brand-700 hover:bg-brand-50"
          >
            Browse by goals
          </Link>
        </div>
      </section>

      {/* Core Pillars */}
      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-[1.5rem] border border-brand-900/10 bg-white/85 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-ink flex items-center gap-2">
            <span className="text-emerald-700">✓</span> Evidence-First Synthesis
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            We map natural compounds back to peer-reviewed studies and human clinical trials, stating evidence levels (strong, moderate, limited) with total integrity.
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-brand-900/10 bg-white/85 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-ink flex items-center gap-2">
            <span className="text-emerald-700">✓</span> Safety-First Governance
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            We list precise medication interactions, contraindications, and precautions. We programmatically suppress product links for high-caution substances.
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-brand-900/10 bg-white/85 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-ink flex items-center gap-2">
            <span className="text-emerald-700">✓</span> Anti-Oversimplification
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            We explain preclinical mechanisms of action to outline pathways, but differentiate them clearly from guaranteed human outcomes.
          </p>
        </div>
      </section>

      {/* Editorial review section */}
      <section className="space-y-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">
            Editorial Review
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-ink mt-2">
            How Review Works
          </h2>
          <p className="text-sm text-muted mt-2 max-w-2xl">
            We use a documented editorial process to audit monograph data, evidence language, safety cautions, and affiliate separation before publication.
          </p>
          <p className="text-xs text-muted mt-1">Last reviewed: June 2026 (post-audit pipeline + hygiene updates per plan)</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-brand-900/10 bg-white/95 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-700/10 flex items-center justify-center text-emerald-800 font-bold text-lg">
                1
              </div>
              <div>
                <h3 className="text-lg font-bold text-ink">
                  Evidence Audit
                </h3>
                <p className="text-xs font-semibold text-brand-800 uppercase tracking-wider">
                  Claim Matching
                </p>
              </div>
            </div>
            <p className="text-sm leading-6 text-muted">
              Evidence claims are checked against the source workbook, cited studies, and study-design context so preclinical mechanisms are not presented as proven human outcomes.
            </p>
          </div>

          <div className="rounded-2xl border border-brand-900/10 bg-white/95 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-700/10 flex items-center justify-center text-emerald-800 font-bold text-lg">
                2
              </div>
              <div>
                <h3 className="text-lg font-bold text-ink">
                  Safety Review
                </h3>
                <p className="text-xs font-semibold text-brand-800 uppercase tracking-wider">
                  Conservative Language
                </p>
              </div>
            </div>
            <p className="text-sm leading-6 text-muted">
              Caution language is kept explicit when legal status, interaction risk, population exclusions, or dosing uncertainty make a profile inappropriate for casual use.
            </p>
          </div>

          <div className="rounded-2xl border border-brand-900/10 bg-white/95 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-700/10 flex items-center justify-center text-emerald-800 font-bold text-lg">
                3
              </div>
              <div>
                <h3 className="text-lg font-bold text-ink">
                  Commerce Check
                </h3>
                <p className="text-xs font-semibold text-brand-800 uppercase tracking-wider">
                  Affiliate Separation
                </p>
              </div>
            </div>
            <p className="text-sm leading-6 text-muted">
              Product and sourcing modules are separated from evidence grades, and affiliate configuration cannot raise an ingredient's rating or suppress caution language.
            </p>
          </div>
        </div>
      </section>

      {/* Editorial standards & process */}
      <section className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[1.5rem] border border-brand-900/10 bg-white/85 p-6 shadow-sm sm:p-8 space-y-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">
            Editorial Process
          </p>
          <h2 className="text-2xl font-bold text-ink">How We Build Monograph Content</h2>
          <div className="space-y-4 text-sm leading-7 text-muted">
            <p>
              Our process is rigorous, transparent, and completely decoupled from any commercial product sponsors:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="font-semibold text-ink">Workbook Sourcing:</strong> All ingredient entries originate in our master spreadsheet data pipeline, ensuring uniform metrics.
              </li>
              <li>
                <strong className="font-semibold text-ink">Evidence Grading:</strong> We grade evidence strictly according to study design: double-blind human RCTs and meta-analyses score highest.
              </li>
              <li>
                <strong className="font-semibold text-ink">FTC Affiliate Transparency:</strong> Affiliate links (configured via config/affiliate.ts) are strictly secondary. No brand can pay to improve their evidence grade.
              </li>
            </ul>
          </div>
        </div>

        {/* Contact Form */}
        <aside className="rounded-[1.5rem] border border-brand-900/10 bg-white/85 p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">
            Get in touch
          </p>
          <h2 className="text-xl font-bold text-ink mt-2">Send us a Message</h2>
          <p className="text-xs text-muted mt-1 leading-relaxed">
            Have scientific feedback or found a bug? Send us a message, and our review team will respond.
          </p>

          <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
            <div>
              <label htmlFor="contact-name" className="block text-xs font-semibold text-ink mb-1">
                Name
              </label>
              <input
                id="contact-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-lg border border-brand-900/15 bg-white/90 px-3 py-2 text-xs focus:border-brand-700 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="contact-email" className="block text-xs font-semibold text-ink mb-1">
                Email
              </label>
              <input
                id="contact-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="reviewer@thehippiescientist.net"
                className="w-full rounded-lg border border-brand-900/15 bg-white/90 px-3 py-2 text-xs focus:border-brand-700 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="contact-subject" className="block text-xs font-semibold text-ink mb-1">
                Subject
              </label>
              <input
                id="contact-subject"
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Editorial suggestion"
                className="w-full rounded-lg border border-brand-900/15 bg-white/90 px-3 py-2 text-xs focus:border-brand-700 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="contact-message" className="block text-xs font-semibold text-ink mb-1">
                Message
              </label>
              <textarea
                id="contact-message"
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your feedback..."
                className="w-full rounded-lg border border-brand-900/15 bg-white/90 px-3 py-2 text-xs focus:border-brand-700 focus:outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-full bg-brand-800 py-2.5 text-xs font-bold text-white transition hover:bg-brand-900"
            >
              Compose Email &rarr;
            </button>
          </form>
        </aside>
      </section>

      {/* Reusable credentials widget */}
      <AuthorCredentials />
    </div>
  )
}
