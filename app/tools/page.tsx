import type { Metadata } from 'next'
import Link from 'next/link'
import { Shield, GitCompare, Target, Search, Calculator, AlertTriangle, BookOpen } from 'lucide-react'
import { buildPageMetadata } from '../../src/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Research Tools',
  description: 'Interactive tools for navigating herb and compound evidence: safety checker, comparisons, goal guides, and site search.',
  path: '/tools',
})

type ToolCard = {
  href: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: true }>
  available: boolean
}

const tools: ToolCard[] = [
  {
    href: '/safety-checker',
    title: 'Safety Checker',
    description: 'Check interactions, contraindications, and cautions for herbs and compounds against your medications or conditions.',
    icon: Shield,
    available: true,
  },
  {
    href: '/compare',
    title: 'Herb & Compound Comparison',
    description: 'Side-by-side evidence, mechanisms, and safety comparison of two or more profiles.',
    icon: GitCompare,
    available: true,
  },
  {
    href: '/goals',
    title: 'Goal-Based Decision Guides',
    description: 'Browse by practical goal (sleep, focus, stress) with evidence-ranked recommendations and context.',
    icon: Target,
    available: true,
  },
  {
    href: '/search',
    title: 'Site Search',
    description: 'Full-text search across all herb, compound, and research note profiles powered by Pagefind.',
    icon: Search,
    available: true,
  },
]

const plannedTools: ToolCard[] = [
  {
    href: '#',
    title: 'Dosing Calculator',
    description: 'Evidence-informed starting ranges and titration guidance (with safety guardrails).',
    icon: Calculator,
    available: false,
  },
  {
    href: '#',
    title: 'Interaction Checker',
    description: 'Deeper medication + supplement interaction matrix with references.',
    icon: AlertTriangle,
    available: false,
  },
  {
    href: '#',
    title: 'Evidence Tracker',
    description: 'Track updates to specific profiles and new human trials in your areas of interest.',
    icon: BookOpen,
    available: false,
  },
]

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-6 sm:py-8">
      {/* Hero */}
      <section className="hero-shell rounded-[0.95rem] border border-brand-900/10 p-4 shadow-sm sm:p-5">
        <p className="eyebrow-label">Interactive research tools</p>
        <h1 className="mt-2 max-w-3xl font-display text-3xl font-semibold tracking-tight text-ink sm:text-5xl">
          Research Tools
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#46574d]">
          Interactive tools for navigating herb and compound evidence without the guesswork.
        </p>
      </section>

      {/* Available tools */}
      <section className="space-y-4">
        <div>
          <p className="eyebrow-label">Available now</p>
          <h2 className="compact-heading">Use these tools to make better decisions.</h2>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {tools.map((tool) => {
            const Icon = tool.icon
            return (
              <Link
                key={tool.href}
                href={tool.href}
                className="group flex h-full flex-col rounded-[0.85rem] border border-brand-900/10 bg-white/80 p-4 shadow-sm transition hover:border-brand-700/30 hover:bg-white"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-brand-900/10 bg-white text-brand-800">
                    <Icon aria-hidden={true} className="h-4 w-4" />
                  </span>
                  <h3 className="text-base font-semibold tracking-tight text-ink group-hover:text-brand-800">{tool.title}</h3>
                </div>
                <p className="mt-2 flex-1 text-sm leading-6 text-[#46574d]">{tool.description}</p>
                <span className="mt-3 inline-flex text-xs font-semibold text-brand-800 group-hover:underline">Open tool →</span>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Planned tools */}
      <section className="space-y-4">
        <div>
          <p className="eyebrow-label">Planned</p>
          <h2 className="compact-heading">More tools are in development.</h2>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {plannedTools.map((tool) => {
            const Icon = tool.icon
            return (
              <div
                key={tool.title}
                className="flex h-full flex-col rounded-[0.85rem] border border-brand-900/10 bg-white/60 p-4 opacity-80"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-brand-900/10 bg-white text-[#5f6f66]">
                    <Icon aria-hidden={true} className="h-4 w-4" />
                  </span>
                  <h3 className="text-base font-semibold tracking-tight text-ink">{tool.title}</h3>
                </div>
                <p className="mt-2 flex-1 text-sm leading-6 text-[#46574d]">{tool.description}</p>
                <span className="mt-3 inline-flex text-xs font-semibold text-[#5f6f66]">Planned tool</span>
              </div>
            )
          })}
        </div>
      </section>

      <p className="text-center text-xs text-[#5f6f66]">
        All tools are evidence-first and include conservative safety framing. Not medical advice.
      </p>
    </div>
  )
}
