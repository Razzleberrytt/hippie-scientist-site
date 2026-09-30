import Link from 'next/link'
import { ArrowRight, BookOpen, FlaskConical, Microscope, ShieldCheck, Target } from 'lucide-react'
import { siteDestinations, type SiteDestinationId } from '@/lib/site-destinations'

const destinationIcons: Record<SiteDestinationId, typeof Target> = {
  goals: Target,
  guides: BookOpen,
  ingredients: FlaskConical,
  safety: ShieldCheck,
  research: Microscope,
}

export default function SiteDestinationGrid() {
  return (
    <nav aria-label='Primary site destinations' className='grid gap-4 sm:grid-cols-2 xl:grid-cols-5'>
      {siteDestinations.map((destination) => {
        const Icon = destinationIcons[destination.id]
        return (
          <Link
            key={destination.id}
            href={destination.href}
            className='card-premium group flex min-h-[12rem] flex-col p-5 transition hover:-translate-y-0.5 hover:border-brand-700/25 hover:bg-brand-50/30'
          >
            <span className='inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-50 text-brand-800'>
              <Icon className='h-5 w-5' aria-hidden='true' />
            </span>
            <p className='eyebrow-label mt-4'>{destination.eyebrow}</p>
            <h2 className='mt-2 text-xl font-semibold tracking-tight text-ink'>{destination.label}</h2>
            <p className='mt-2 text-sm leading-6 text-muted'>{destination.description}</p>
            <span className='mt-auto inline-flex items-center gap-2 pt-4 text-sm font-bold text-brand-700'>
              Open {destination.label}
              <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' aria-hidden='true' />
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
