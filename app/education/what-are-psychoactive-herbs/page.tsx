import type { Metadata } from 'next'
import { buildPageMetadata } from '../../../src/lib/seo'
import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import FaqJsonLd from '@/components/seo/FaqJsonLd'
export const metadata: Metadata = buildPageMetadata({
  title: "What Are Psychoactive Herbs?",
  description: "Educational overview of psychoactive herbs, neuropharmacology, mechanisms, pathways, and harm reduction.",
  path: "/education/what-are-psychoactive-herbs/",
})


const faqItems = [
  {
    question: 'What makes an herb psychoactive?',
    answer:
      'A psychoactive herb contains compounds capable of influencing perception, mood, cognition, stress response, sleep, arousal, or consciousness through interaction with neurochemical systems.',
  },
  {
    question: 'Are psychoactive herbs always intoxicating?',
    answer:
      'No. Many psychoactive herbs produce subtle or mild effects involving relaxation, alertness, mood regulation, dream vividness, or stress modulation rather than strong intoxication.',
  },
  {
    question: 'Why is harm reduction important?',
    answer:
      'Psychoactive substances can interact with medications, neurochemical systems, sleep architecture, or mental health conditions. Educational and evidence-informed harm reduction helps reduce unnecessary risk.',
  },
]

const systems = [
  {
    title: 'GABAergic Systems',
    description:
      'Associated with calming, relaxation, sedation, and nervous-system downregulation.',
    href: '/education/gaba',
  },
  {
    title: 'Serotonergic Systems',
    description:
      'Associated with mood regulation, emotional processing, perception, and cognition.',
    href: '/education/serotonin',
  },
  {
    title: 'Dopaminergic Systems',
    description:
      'Associated with motivation, reward processing, focus, and behavioral drive.',
    href: '/education/dopamine',
  },
  {
    title: 'Cholinergic Systems',
    description:
      'Associated with dreaming, cognition, memory, and REM-related mechanisms.',
    href: '/education/cholinergic-system',
  },
]

export default function WhatArePsychoactiveHerbsPage() {
  return (
    <main className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="What Are Psychoactive Herbs?"
        description="Educational overview of psychoactive herbs, neuropharmacology, mechanisms, pathways, and harm reduction."
        url="https://thehippiescientist.net/education/what-are-psychoactive-herbs"
        type="Article"
        breadcrumbs={[
          {
            name: 'Home',
            url: 'https://thehippiescientist.net',
          },
          {
            name: 'Education',
            url: 'https://thehippiescientist.net/education',
          },
          {
            name: 'What Are Psychoactive Herbs?',
            url: 'https://thehippiescientist.net/education/what-are-psychoactive-herbs',
          },
        ]}
      />

      <FaqJsonLd items={faqItems} />

      <AuthorityBreadcrumbs
        items={[
          {
            label: 'Home',
            href: '/',
          },
          {
            label: 'Education',
            href: '/education',
          },
          {
            label: 'What Are Psychoactive Herbs?',
          },
        ]}
      />

      <section className="space-y-5 max-w-4xl">
        <div className="space-y-3">
          <p className="eyebrow-label">Educational Supernode</p>

          <h1 className="text-4xl font-bold tracking-tight text-ink">
            What Are Psychoactive Herbs?
          </h1>
        </div>

        <p className="text-lg leading-8 text-[#46574d]">
          Psychoactive herbs are plants containing compounds capable of influencing neurochemical systems involved in mood, cognition, stress response, dreaming, relaxation, arousal, or consciousness.
        </p>

        <p className="text-base leading-8 text-[#5c6b63]">
          The term “psychoactive” does not necessarily imply intoxication or strong alteration. Many psychoactive herbs produce subtle effects connected to stress regulation, calmness, focus, emotional processing, or sleep architecture.
        </p>
      </section>

      <section className="surface-depth card-spacing">
        <div className="space-y-3 max-w-3xl">
          <p className="eyebrow-label">Neuropharmacology Overview</p>

          <h2 className="text-3xl font-semibold tracking-tight text-ink">
            Psychoactive mechanism systems
          </h2>

          <p className="text-sm leading-7 text-[#46574d]">
            Psychoactive herbs may interact with multiple pathway systems simultaneously. Educational pathway exploration helps contextualize mechanisms, safety considerations, and semantic relationships.
          </p>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {systems.map((system) => (
            <Link
              key={system.href}
              href={system.href}
              className="card-premium p-5 transition motion-safe:hover:-translate-y-0.5"
            >
              <div className="space-y-3">
                <h3 className="text-xl font-semibold tracking-tight text-ink">
                  {system.title}
                </h3>

                <p className="text-sm leading-7 text-[#46574d]">
                  {system.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="surface-subtle rounded-3xl p-6 space-y-5">
        <div className="space-y-2">
          <p className="eyebrow-label">Harm Reduction</p>

          <h2 className="text-2xl font-semibold tracking-tight text-ink">
            Safety and interaction awareness
          </h2>
        </div>

        <p className="text-sm leading-7 text-[#46574d] max-w-3xl">
          Psychoactive substances may interact with medications, mental health conditions, sleep systems, serotonergic signaling, GABAergic systems, and cardiovascular pathways. Educational exploration should always prioritize conservative interpretation, safety awareness, and evidence quality.
        </p>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/psychoactive/harm-reduction"
            className="chip-readable hover:bg-white transition"
          >
            Harm Reduction
          </Link>

          <Link
            href="/psychoactive/interactions"
            className="chip-readable hover:bg-white transition"
          >
            Interaction Guide
          </Link>

          <Link
            href="/psychoactive/serotonergic-stacking-risks"
            className="chip-readable hover:bg-white transition"
          >
            Serotonergic Risks
          </Link>
        </div>
      </section>
    </main>
  )
}
