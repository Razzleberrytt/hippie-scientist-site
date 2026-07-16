import type { Metadata } from 'next'
import SpanishPageShell from '../../_components/SpanishPageShell'
import { SITE_URL } from '@/src/lib/seo'

export const metadata: Metadata = {
  title: 'Estrés y suplementos | The Hippie Scientist en español',
  description:
    'Guía en español para investigar opciones relacionadas con estrés, calma, adaptación y seguridad de suplementos.',
  alternates: { canonical: `${SITE_URL}/es/goals/stress/` },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Estrés y suplementos | The Hippie Scientist en español',
    description: 'Una entrada en español para investigar estrés, calma y suplementos con enfoque basado en evidencia.',
    url: `${SITE_URL}/es/goals/stress/`,
    siteName: 'The Hippie Scientist',
    locale: 'es_ES',
    type: 'article',
  },
}

export default function SpanishStressPage() {
  return (
    <SpanishPageShell
      eyebrow='Objetivo: estrés'
      title='Estrés: compara calma, energía y recuperación sin exagerar.'
      description='El estrés puede significar muchas cosas: tensión física, cansancio, irritabilidad, presión mental o recuperación lenta. Esta página ayuda a separar esos contextos antes de revisar suplementos o hierbas.'
      primaryHref='/goals/stress/'
      primaryLabel='Ver guía completa en inglés'
      secondaryHref='/es/goals/anxiety/'
      secondaryLabel='Comparar con ansiedad'
      cards={[
        {
          title: 'Define el problema',
          body: 'No todas las opciones para estrés apuntan a lo mismo. Algunas se enfocan en relajación, otras en energía o resiliencia percibida.',
        },
        {
          title: 'Revisa interacciones',
          body: 'Las hierbas y suplementos pueden no ser adecuados si ya usas medicamentos, sedantes, estimulantes o productos con efectos similares.',
        },
        {
          title: 'Mira la calidad de evidencia',
          body: 'Una recomendación fuerte necesita más que una historia popular: debe explicar estudios humanos, limitaciones y seguridad.',
        },
      ]}
      note='Para comparar ingredientes específicos, usa la guía completa en inglés mientras se amplía la traducción.'
    />
  )
}
