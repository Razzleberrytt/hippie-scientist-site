import Link from 'next/link'
import { ArrowRight, BookOpen, Languages, ShieldCheck } from 'lucide-react'
import type { SpanishPageData } from '@/src/lib/spanish-content'

export default function SpanishCorePage({ page }: { page: SpanishPageData }) {
  return (
    <div className='mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-16 lg:px-10'>
      <section className='rounded-[2rem] border border-[#123c2f]/10 bg-[#fffdf8] p-6 shadow-[0_18px_48px_rgba(45,35,19,0.08)] dark:border-[var(--border-strong)] dark:bg-[var(--surface-card-strong)] sm:p-10'>
        <div className='flex flex-wrap items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[#8a6a38] dark:text-[var(--accent-gold)]'>
          <Languages className='h-4 w-4' aria-hidden='true' />
          <span>{page.eyebrow}</span>
        </div>
        <h1 className='mt-5 max-w-4xl font-display text-4xl font-semibold leading-tight tracking-[-0.035em] text-[#123c2f] dark:text-[var(--text-primary)] sm:text-5xl'>
          {page.title}
        </h1>
        <p className='mt-6 max-w-3xl text-base leading-8 text-[#44544d] dark:text-[var(--text-secondary)] sm:text-lg'>
          {page.intro}
        </p>

        <div className='mt-7 flex items-start gap-3 rounded-2xl border border-[#b88a42]/20 bg-[#f8f3e8] px-4 py-4 text-sm leading-6 text-[#44544d] dark:border-[var(--border-soft)] dark:bg-[var(--surface-subtle)] dark:text-[var(--text-secondary)]'>
          <BookOpen className='mt-0.5 h-4 w-4 shrink-0 text-[#8a6a38] dark:text-[var(--accent-gold)]' aria-hidden='true' />
          <p>
            Esta es una traducción editorial en español. Los perfiles científicos que todavía no tienen una versión española completa se identifican como contenido en inglés.
          </p>
        </div>
      </section>

      <div className='mt-10 space-y-8'>
        {page.sections.map((section) => (
          <section
            key={section.title}
            className='rounded-[1.75rem] border border-[#123c2f]/10 bg-white/70 p-6 dark:border-[var(--border-soft)] dark:bg-[var(--surface-card)] sm:p-8'
          >
            <h2 className='font-display text-2xl font-semibold tracking-[-0.02em] text-[#123c2f] dark:text-[var(--text-primary)] sm:text-3xl'>
              {section.title}
            </h2>
            <p className='mt-4 max-w-3xl text-[0.98rem] leading-7 text-[#44544d] dark:text-[var(--text-secondary)]'>
              {section.body}
            </p>

            {section.bullets?.length ? (
              <ul className='mt-5 grid gap-3 sm:grid-cols-2'>
                {section.bullets.map((bullet) => (
                  <li
                    key={bullet}
                    className='flex gap-3 rounded-2xl bg-[#f8f3e8]/75 px-4 py-3 text-sm leading-6 text-[#33433c] dark:bg-[var(--surface-subtle)] dark:text-[var(--text-secondary)]'
                  >
                    <ShieldCheck className='mt-0.5 h-4 w-4 shrink-0 text-[#315f50] dark:text-[var(--accent-teal)]' aria-hidden='true' />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            ) : null}

            {section.links?.length ? (
              <div className='mt-6 grid gap-3 sm:grid-cols-2'>
                {section.links.map((link) => (
                  <Link
                    key={`${section.title}-${link.href}`}
                    href={link.href}
                    className='group rounded-2xl border border-[#123c2f]/10 bg-[#fffdf8] px-4 py-4 transition hover:border-[#b88a42]/35 hover:bg-[#f8f3e8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b88a42]/50 dark:border-[var(--border-soft)] dark:bg-[var(--surface-card-strong)] dark:hover:bg-[var(--surface-subtle)]'
                  >
                    <span className='flex items-center justify-between gap-3 font-semibold text-[#123c2f] dark:text-[var(--text-primary)]'>
                      {link.label}
                      <ArrowRight className='h-4 w-4 transition group-hover:translate-x-0.5' aria-hidden='true' />
                    </span>
                    {link.note ? (
                      <span className='mt-1.5 block text-xs leading-5 text-[#66736d] dark:text-[var(--text-muted)]'>
                        {link.note}
                      </span>
                    ) : null}
                  </Link>
                ))}
              </div>
            ) : null}
          </section>
        ))}
      </div>

      {(page.primaryCta || page.secondaryCta) ? (
        <section className='mt-10 flex flex-col gap-3 rounded-[1.75rem] border border-[#123c2f]/10 bg-[#123c2f] p-6 text-[#fffdf8] sm:flex-row sm:items-center sm:justify-between sm:p-8'>
          <div>
            <p className='text-xs font-extrabold uppercase tracking-[0.14em] text-[#e2cba3]'>Siguiente paso</p>
            <p className='mt-2 max-w-xl text-sm leading-6 text-[#f4efe5]'>
              Sigue comparando con el mismo criterio: evidencia primero, seguridad visible y límites claros.
            </p>
          </div>
          <div className='flex flex-col gap-2 sm:flex-row'>
            {page.secondaryCta ? (
              <Link
                href={page.secondaryCta.href}
                className='inline-flex min-h-11 items-center justify-center rounded-full border border-white/20 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e2cba3]'
              >
                {page.secondaryCta.label}
              </Link>
            ) : null}
            {page.primaryCta ? (
              <Link
                href={page.primaryCta.href}
                className='inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#e2cba3] px-5 py-2.5 text-sm font-bold text-[#123c2f] transition hover:bg-[#f0ddba] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white'
              >
                {page.primaryCta.label}
                <ArrowRight className='h-4 w-4' aria-hidden='true' />
              </Link>
            ) : null}
          </div>
        </section>
      ) : null}

      <p className='mx-auto mt-8 max-w-3xl text-center text-xs leading-5 text-[#66736d] dark:text-[var(--text-muted)]'>
        Contenido educativo. No sustituye la evaluación individual de un profesional sanitario, especialmente si tomas medicamentos, estás embarazada o tienes una condición médica.
      </p>
    </div>
  )
}
