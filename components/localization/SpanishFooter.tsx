import Link from 'next/link'
import { Leaf } from 'lucide-react'

const footerLinkClass =
  '-mx-2 inline-flex min-h-11 items-center rounded-xl px-2 font-semibold text-[#33433c] transition hover:bg-[#f1e8d8] hover:text-[#123c2f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b88a42]/45 dark:text-[var(--text-secondary)] dark:hover:bg-[var(--surface-subtle)] dark:hover:text-[var(--text-primary)]'

export default function SpanishFooter() {
  return (
    <footer className='border-t border-[#123c2f]/10 bg-[#f8f3e8]/70 dark:border-[var(--border-soft)] dark:bg-[var(--surface-card-strong)]' lang='es'>
      <div className='mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 md:grid-cols-[1.2fr_1fr] lg:px-10'>
        <div>
          <Link href='/es/' className='inline-flex min-h-11 items-center gap-2 font-display text-lg font-semibold text-[#123c2f] dark:text-[var(--text-primary)]'>
            <Leaf className='h-5 w-5 text-[#315f50] dark:text-[var(--accent-teal)]' aria-hidden='true' />
            The Hippie Scientist
          </Link>
          <p className='mt-3 max-w-xl text-sm leading-6 text-[#526159] dark:text-[var(--text-secondary)]'>
            Referencia educativa basada en evidencia para investigar hierbas, suplementos y compuestos con la seguridad y la incertidumbre siempre visibles.
          </p>
        </div>
        <nav className='grid grid-cols-2 gap-x-6 text-sm' aria-label='Enlaces del pie de página'>
          <Link href='/es/hierbas/' className={footerLinkClass}>Hierbas</Link>
          <Link href='/es/compuestos/' className={footerLinkClass}>Compuestos</Link>
          <Link href='/es/objetivos/' className={footerLinkClass}>Objetivos</Link>
          <Link href='/es/metodologia/' className={footerLinkClass}>Metodología</Link>
          <Link href='/es/seguridad/' className={footerLinkClass}>Seguridad</Link>
          <Link href='/' hrefLang='en-US' className={footerLinkClass}>English</Link>
        </nav>
      </div>
      <div className='border-t border-[#123c2f]/10 px-5 py-5 text-center text-xs leading-5 text-[#66736d] dark:border-[var(--border-soft)] dark:text-[var(--text-muted)]'>
        Información educativa, no consejo médico. Para decisiones personales de salud, consulta a un profesional sanitario cualificado.
      </div>
    </footer>
  )
}
