import type { Metadata } from 'next'
import SpanishPageShell from '../../_components/SpanishPageShell'
import { SITE_URL } from '@/src/lib/seo'

export const metadata: Metadata = {
  title: 'Ansiedad y suplementos | The Hippie Scientist en español',
  description:
    'Guía en español para investigar suplementos y hierbas relacionados con ansiedad, calma y seguridad, sin promesas exageradas.',
  alternates: { canonical: `${SITE_URL}/es/goals/anxiety/` },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Ansiedad y suplementos | The Hippie Scientist en español',
    description: 'Una entrada en español para investigar ansiedad, calma, seguridad y evidencia.',
    url: `${SITE_URL}/es/goals/anxiety/`,
    siteName: 'The Hippie Scientist',
    locale: 'es_ES',
    type: 'article',
  },
}

export default function SpanishAnxietyPage() {
  return (
    <SpanishPageShell
      eyebrow='Objetivo: ansiedad'
      title='Ansiedad: empieza con cautela, contexto y lenguaje claro.'
      description='Esta página no presenta suplementos como tratamiento. Sirve como punto de partida para entender opciones de calma, revisar riesgos de interacción y distinguir evidencia humana de marketing.'
      primaryHref='/goals/anxiety/'
      primaryLabel='Ver guía completa en inglés'
      secondaryHref='/es/goals/stress/'
      secondaryLabel='Comparar con estrés'
      cards={[
        {
          title: 'No todo es lo mismo',
          body: 'Preocupación, tensión, sueño inquieto y ataques de pánico no tienen el mismo contexto. La página debe evitar mezclar todo en una sola promesa.',
        },
        {
          title: 'Cuidado con combinaciones',
          body: 'Las opciones calmantes pueden importar más si usas medicamentos para ánimo, sueño, presión arterial, alcohol u otros productos sedantes.',
        },
        {
          title: 'Busca evidencia real',
          body: 'La evidencia útil debe explicar tamaño de estudios, población, dosis, duración y límites, no solo decir que algo es natural.',
        },
      ]}
      note='Si los síntomas son intensos, nuevos o peligrosos, busca ayuda profesional o local de emergencia. Esta página solo organiza información educativa.'
    />
  )
}
