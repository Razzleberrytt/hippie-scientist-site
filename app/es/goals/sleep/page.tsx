import type { Metadata } from 'next'
import SpanishPageShell from '../../_components/SpanishPageShell'
import { SITE_URL } from '@/src/lib/seo'

export const metadata: Metadata = {
  title: 'Sueño y suplementos | The Hippie Scientist en español',
  description:
    'Guía en español para empezar a investigar suplementos, hierbas y hábitos relacionados con el sueño, con enfoque en seguridad y evidencia.',
  alternates: { canonical: `${SITE_URL}/es/goals/sleep/` },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Sueño y suplementos | The Hippie Scientist en español',
    description: 'Una entrada en español para investigar el sueño con calma, seguridad y evidencia.',
    url: `${SITE_URL}/es/goals/sleep/`,
    siteName: 'The Hippie Scientist',
    locale: 'es_ES',
    type: 'article',
  },
}

export default function SpanishSleepPage() {
  return (
    <SpanishPageShell
      eyebrow='Objetivo: sueño'
      title='Sueño: empieza por seguridad, ritmo y evidencia.'
      description='El objetivo no es encontrar una solución mágica. Es ordenar las opciones: qué puede apoyar el descanso, qué puede causar somnolencia al día siguiente y qué merece revisión si tomas medicamentos o tienes condiciones de salud.'
      primaryHref='/goals/sleep/'
      primaryLabel='Ver guía completa en inglés'
      secondaryHref='/es/'
      secondaryLabel='Volver al inicio en español'
      cards={[
        {
          title: 'Primero: contexto',
          body: 'Antes de comparar suplementos, revisa horarios, cafeína, alcohol, pantallas, estrés nocturno y consistencia del sueño.',
        },
        {
          title: 'Segundo: seguridad',
          body: 'Las opciones calmantes pueden interactuar con sedantes, alcohol, medicamentos para ánimo, embarazo u otros factores personales.',
        },
        {
          title: 'Tercero: evidencia',
          body: 'Una buena página de sueño debe separar tradición, mecanismo plausible y estudios humanos reales sin exagerar resultados.',
        },
      ]}
      note='Esta página es una entrada traducida. Para perfiles completos de ingredientes, usa la guía completa y las páginas de biblioteca enlazadas.'
    />
  )
}
