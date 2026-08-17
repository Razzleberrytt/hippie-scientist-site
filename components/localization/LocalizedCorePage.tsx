import Link from 'next/link'
import { ArrowRight, BookOpen, Languages, ShieldCheck } from 'lucide-react'
import LanguageSwitcher from '@/components/localization/LanguageSwitcher'
import type { LocalizedPageData, LocalizedUiCopy } from '@/src/lib/localization'

export default function LocalizedCorePage({ page, ui, lang }: { page: LocalizedPageData; ui: LocalizedUiCopy; lang: string }) {
  return (
    <div className='mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-16 lg:px-10' lang={lang}>
      <section className='rounded-[1.75rem] border border-[var(--border-soft)] bg-[var(--surface-card-strong)] p-6 shadow-[0_20px_55px_-42px_rgba(29,29,31,0.4)] sm:p-10'>
        <div className='flex flex-wrap items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--accent-gold)]'>
          <Languages className='h-4 w-4' aria-hidden='true' />
          <span>{page.eyebrow}</span>
        </div>
        <h1 className='mt-5 max-w-4xl font-display text-4xl font-semibold leading-tight tracking-[-0.035em] text-[var(--text-primary)] sm:text-5xl'>{page.title}</h1>
        <p className='mt-6 max-w-3xl text-base leading-8 text-[var(--text-secondary)] sm:text-lg'>{page.intro}</p>
        <LanguageSwitcher path={page.path} />
        <div className='mt-7 flex items-start gap-3 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-subtle)] px-4 py-4 text-sm leading-6 text-[var(--text-secondary)]'>
          <BookOpen className='mt-0.5 h-4 w-4 shrink-0 text-[var(--accent-gold)]' aria-hidden='true' />
          <p>{ui.translationNotice}</p>
        </div>
      </section>

      <div className='mt-10 space-y-8'>
        {page.sections.map((section) => (
          <section key={section.title} className='rounded-[1.5rem] border border-[var(--border-soft)] bg-[var(--surface-card)] p-6 sm:p-8'>
            <h2 className='font-display text-2xl font-semibold tracking-[-0.02em] text-[var(--text-primary)] sm:text-3xl'>{section.title}</h2>
            <p className='mt-4 max-w-3xl text-[0.98rem] leading-7 text-[var(--text-secondary)]'>{section.body}</p>
            {section.bullets?.length ? (
              <ul className='mt-5 grid gap-3 sm:grid-cols-2'>
                {section.bullets.map((bullet) => (
                  <li key={bullet} className='flex gap-3 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-subtle)] px-4 py-3 text-sm leading-6 text-[var(--text-secondary)]'>
                    <ShieldCheck className='mt-0.5 h-4 w-4 shrink-0 text-[var(--accent-gold)]' aria-hidden='true' />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            {section.links?.length ? (
              <div className='mt-6 grid gap-3 sm:grid-cols-2'>
                {section.links.map((link) => (
                  <Link key={`${section.title}-${link.href}`} href={link.href} className='group rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-card-strong)] px-4 py-4 transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-brand)]'>
                    <span className='flex items-center justify-between gap-3 font-semibold text-[var(--text-primary)]'>{link.label}<ArrowRight className='h-4 w-4 text-[var(--accent-gold)] transition group-hover:translate-x-0.5' aria-hidden='true' /></span>
                    {link.note ? <span className='mt-1.5 block text-xs leading-5 text-[var(--text-muted)]'>{link.note}</span> : null}
                  </Link>
                ))}
              </div>
            ) : null}
          </section>
        ))}
      </div>

      {(page.primaryCta || page.secondaryCta) ? (
        <section className='mt-10 flex flex-col gap-4 rounded-[1.5rem] border border-[var(--border-soft)] bg-[#17191a] p-6 text-[#fffdf8] sm:flex-row sm:items-center sm:justify-between sm:p-8'>
          <div>
            <p className='text-xs font-extrabold uppercase tracking-[0.14em] text-[#d0a35b]'>{ui.nextStepLabel}</p>
            <p className='mt-2 max-w-xl text-sm leading-6 text-[#c7c0b5]'>{ui.nextStepBody}</p>
          </div>
          <div className='flex flex-col gap-2 sm:flex-row'>
            {page.secondaryCta ? <Link href={page.secondaryCta.href} className='inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 px-5 py-2.5 text-sm font-bold text-[#f3eee4] transition hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d0a35b]'>{page.secondaryCta.label}</Link> : null}
            {page.primaryCta ? <Link href={page.primaryCta.href} className='inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#d0a35b] px-5 py-2.5 text-sm font-bold text-[#151719] transition hover:bg-[#dfb66d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white'>{page.primaryCta.label}<ArrowRight className='h-4 w-4' aria-hidden='true' /></Link> : null}
          </div>
        </section>
      ) : null}

      <p className='mx-auto mt-8 max-w-3xl text-center text-xs leading-5 text-[var(--text-muted)]'>{ui.educationDisclaimer}</p>
    </div>
  )
}
