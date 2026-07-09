import type { Metadata } from 'next'
import SpanishPageShell from '../../_components/SpanishPageShell'
import { SITE_URL } from '@/src/lib/seo'

export const metadata: Metadata = {
  title: 'Enfoque y suplementos | The Hippie Scientist en español',
  description:
    'Guía en español para investigar enfoque, energía mental, concentración y seguridad de suplementos con lenguaje basado en evidencia.',
  alternates: { canonical: `${SITE_URL}/es/goals/focus/` },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Enfoque y suplementos | The Hippie Scientist en español',
    description: 'Una entrada en español para investigar enfoque, energía mental y evidencia sin exagerar.',
    url: `${SITE_URL}/es/goals/focus/`,
    siteName: 'The Hippie Scientist',
    locale: 'es_ES',
    type: 'article',
  },
}

export default function SpanishFocusPage() {
  return (
    <SpanishPageShell
      eyebrow='Objetivo: enfoque'
      title='Enfoque: separa energía, claridad mental y estimulación.'
      description='Mejorar el enfoque no siempre significa usar algo más fuerte. Esta página organiza preguntas útiles sobre sueño, cafeína, estrés, hábitos, seguridad y calidad de evidencia.'
      primaryHref='/goals/focus/'
      primaryLabel='Ver guía completa en inglés'
      secondaryHref='/es/'
      secondaryLabel='Volver al inicio en español'
      cards={[
        {
          title: 'Energía no es enfoque',
          body: 'Un producto puede hacerte sentir más despierto sin mejorar organización, memoria o trabajo profundo. Conviene separar esos objetivos.',
        },
        {
          title: 'Cuidado con estimulantes',
          body: 'Cafeína, estimulantes, medicamentos y otros productos pueden sumarse. La seguridad depende del contexto personal.',
        },
        {
          title: 'Compara por evidencia',
          body: 'Las mejores páginas explican qué se estudió, en quién, por cuánto tiempo y qué tan grande fue el efecto observado.',
        },
      ]}
      note='La página completa en inglés contiene más enlaces internos mientras se prepara la traducción de la biblioteca.'
    />
  )
}
