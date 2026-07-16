import type { Metadata } from 'next'
import SpanishPageShell from './_components/SpanishPageShell'
import { SITE_URL } from '@/src/lib/seo'

export const metadata: Metadata = {
  title: 'The Hippie Scientist en español | Investigación de suplementos',
  description:
    'Página principal en español de The Hippie Scientist: investigación clara sobre suplementos, hierbas y compuestos para sueño, estrés, ansiedad y enfoque.',
  alternates: { canonical: `${SITE_URL}/es/` },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'The Hippie Scientist en español',
    description: 'Investigación clara sobre suplementos, hierbas y compuestos, ahora con páginas principales en español.',
    url: `${SITE_URL}/es/`,
    siteName: 'The Hippie Scientist',
    locale: 'es_ES',
    type: 'website',
  },
}

export default function SpanishHomePage() {
  return (
    <SpanishPageShell
      eyebrow='The Hippie Scientist en español'
      title='Investigación de suplementos, explicada con calma y evidencia.'
      description='Empieza por tu objetivo: dormir mejor, manejar el estrés, entender la ansiedad o mejorar el enfoque. Estas páginas resumen la idea principal en español y enlazan con la biblioteca completa del sitio.'
      primaryHref='/es/goals/sleep/'
      primaryLabel='Empezar con sueño'
      secondaryHref='/goals/'
      secondaryLabel='Ver objetivos en inglés'
      cards={[
        {
          title: 'Sueño',
          body: 'Una ruta simple para revisar opciones relacionadas con descanso, horarios, seguridad y evidencia.',
          href: '/es/goals/sleep/',
          label: 'Ver sueño en español',
        },
        {
          title: 'Estrés y ansiedad',
          body: 'Guías introductorias para separar calma, tensión, preocupación y seguridad antes de comparar opciones.',
          href: '/es/goals/stress/',
          label: 'Ver estrés en español',
        },
        {
          title: 'Enfoque',
          body: 'Una entrada clara para revisar energía mental, concentración, hábitos y límites de la evidencia.',
          href: '/es/goals/focus/',
          label: 'Ver enfoque en español',
        },
      ]}
      note='La biblioteca completa de hierbas y compuestos sigue principalmente en inglés mientras se construye el flujo de traducción.'
    />
  )
}
