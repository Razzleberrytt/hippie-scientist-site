import Link from 'next/link'

type SpanishCard = {
  title: string
  body: string
  href?: string
  label?: string
}

type SpanishPageShellProps = {
  eyebrow: string
  title: string
  description: string
  primaryHref: string
  primaryLabel: string
  secondaryHref?: string
  secondaryLabel?: string
  cards: SpanishCard[]
  note?: string
}

const spanishNav = [
  { href: '/es/', label: 'Inicio' },
  { href: '/es/goals/sleep/', label: 'Sueño' },
  { href: '/es/goals/stress/', label: 'Estrés' },
  { href: '/es/goals/anxiety/', label: 'Ansiedad' },
  { href: '/es/goals/focus/', label: 'Enfoque' },
]

export default function SpanishPageShell({
  eyebrow,
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  cards,
  note,
}: SpanishPageShellProps) {
  return (
    <div className='mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8'>
      <nav aria-label='Páginas principales en español' className='mb-8 flex flex-wrap gap-2'>
        {spanishNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className='rounded-full border border-brand-900/10 bg-white/80 px-3 py-1.5 text-xs font-semibold text-brand-800 transition-colors hover:bg-brand-50'
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <section className='hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-sm sm:p-8 lg:p-10'>
        <p className='eyebrow-label'>{eyebrow}</p>
        <h1 className='mt-3 max-w-4xl text-3xl font-semibold tracking-tight text-ink sm:text-5xl'>
          {title}
        </h1>
        <p className='mt-5 max-w-3xl text-base leading-7 text-muted sm:text-lg'>
          {description}
        </p>
        <div className='mt-7 flex flex-wrap gap-3'>
          <Link
            href={primaryHref}
            className='rounded-full bg-brand-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-800'
          >
            {primaryLabel}
          </Link>
          {secondaryHref && secondaryLabel ? (
            <Link
              href={secondaryHref}
              className='rounded-full border border-brand-900/10 bg-white px-5 py-3 text-sm font-bold text-brand-800 transition-colors hover:bg-brand-50'
            >
              {secondaryLabel}
            </Link>
          ) : null}
        </div>
      </section>

      <section className='mt-8 grid gap-4 md:grid-cols-3'>
        {cards.map((card) => (
          <article key={card.title} className='card-premium p-5'>
            <h2 className='text-lg font-bold text-ink'>{card.title}</h2>
            <p className='mt-2 text-sm leading-6 text-muted'>{card.body}</p>
            {card.href && card.label ? (
              <Link href={card.href} className='mt-4 inline-flex text-sm font-bold text-brand-800 hover:underline'>
                {card.label}
              </Link>
            ) : null}
          </article>
        ))}
      </section>

      <section className='mt-8 rounded-2xl border border-amber-900/10 bg-amber-50/70 p-5 text-sm leading-6 text-amber-950'>
        <h2 className='font-bold'>Nota editorial</h2>
        <p className='mt-2'>
          Esta versión en español es una traducción editorial de las páginas principales. El contenido es educativo y no sustituye una conversación con un profesional de salud.
        </p>
        {note ? <p className='mt-2'>{note}</p> : null}
      </section>
    </div>
  )
}
