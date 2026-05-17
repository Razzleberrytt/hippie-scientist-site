import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getEcosystemHub, getEcosystemHubs } from '@/lib/ecosystem-hubs'
import EcosystemSupernode from '@/components/ecosystem-supernode'

type EcosystemRouteParams = Promise<{ slug: string }>

type EcosystemRouteProps = {
  params: EcosystemRouteParams
}

export async function generateStaticParams() {
  return getEcosystemHubs().map((hub) => ({
    slug: hub.slug,
  }))
}

export async function generateMetadata({ params }: EcosystemRouteProps) {
  const resolvedParams = await params
  const hub = getEcosystemHub(resolvedParams.slug)

  if (!hub) {
    return {}
  }

  return {
    title: `${hub.title} | The Hippie Scientist`,
    description: hub.description,
  }
}

function profileHref(profile: string) {
  const normalized = profile.toLowerCase()

  const compounds = new Set([
    'creatine',
    'theanine',
    'glycine',
    'taurine',
    'nac',
    'magnesium',
    'magnesium-glycinate',
  ])

  if (compounds.has(normalized)) {
    return `/compounds/${normalized}`
  }

  return `/herbs/${normalized}`
}

function stimulationTone(value: string) {
  if (value === 'calming') {
    return 'border-emerald-700/15 bg-emerald-50/70 text-emerald-950'
  }

  if (value === 'activating') {
    return 'border-amber-700/20 bg-amber-50/80 text-amber-950'
  }

  return 'border-brand-900/10 bg-paper-50/80 text-[#33443a]'
}

export default async function EcosystemHubPage({ params }: EcosystemRouteProps) {
  const resolvedParams = await params
  const hub = getEcosystemHub(resolvedParams.slug)

  if (!hub) {
    notFound()
  }

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:space-y-10 sm:py-10">
      <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8">
        <div className="max-w-4xl space-y-5">
          <p className="eyebrow-label">
            Ecosystem Authority Hub
          </p>

          <h1 className="heading-premium text-ink">
            {hub.title}
          </h1>

          <p className="detail-reading text-base text-[#46574d] sm:text-lg">
            {hub.description}
          </p>

          <div className="flex flex-wrap gap-3">
            <span className={`rounded-full border px-4 py-2 text-sm font-semibold ${stimulationTone(hub.stimulationProfile)}`}>
              {hub.stimulationProfile} profile
            </span>

            <span className="rounded-full border border-brand-900/10 bg-white/80 px-4 py-2 text-sm font-semibold text-ink">
              {hub.timelineProfile} timeline
            </span>

            <Link
              href={`/start/${hub.onboardingPathway}`}
              className="rounded-full border border-brand-900/10 bg-brand-50/70 px-4 py-2 text-sm font-semibold text-ink transition hover:border-brand-700/20 hover:bg-white"
            >
              Beginner onboarding pathway
            </Link>
          </div>
        </div>
      </section>

      <EcosystemSupernode hub={hub} profileHref={profileHref} />

      <section className="space-y-5">
        <div className="space-y-2">
          <p className="eyebrow-label">Starter Profiles</p>

          <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Beginner-friendly ecosystem entry points
          </h2>

          <p className="detail-reading max-w-3xl text-[#46574d]">
            These profiles were selected to create practical comparison paths instead of overwhelming stack-first exploration.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {hub.beginnerProfiles.map((profile) => (
            <Link
              key={profile}
              href={profileHref(profile)}
              className="rounded-3xl border border-brand-900/10 bg-white/80 p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-700/20 hover:bg-white hover:shadow-md"
            >