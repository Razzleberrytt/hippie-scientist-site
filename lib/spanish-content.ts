import type { Metadata } from 'next'
import { buildPageMetadata } from './seo'
import { DEFAULT_OG_LOCALE, SPANISH_OG_LOCALE } from './international-seo'

export type SpanishLink = {
  href: string
  label: string
  note?: string
}

export type SpanishSection = {
  title: string
  body: string
  bullets?: readonly string[]
  links?: readonly SpanishLink[]
}

export type SpanishPageData = {
  path: string
  eyebrow: string
  title: string
  description: string
  intro: string
  sections: readonly SpanishSection[]
  primaryCta?: SpanishLink
  secondaryCta?: SpanishLink
}

export const SPANISH_PAGES = {
  herbs: {
    path: '/es/hierbas/',
    eyebrow: 'Biblioteca de investigación',
    title: 'Hierbas: evidencia, mecanismos y seguridad',
    description:
      'Explora hierbas con un enfoque basado en evidencia: investigación en humanos, mecanismos, dosis, seguridad e interacciones, explicado en español.',
    intro:
      'Empieza por una hierba conocida o por el objetivo que te interesa. Priorizamos la evidencia en humanos y mantenemos la seguridad visible antes de cualquier conclusión práctica.',
    sections: [
      {
        title: 'Cómo leer la biblioteca',
        body:
          'Una hierba no se evalúa por popularidad. Separamos lo que se ha observado en personas de lo que solo es plausible por mecanismos, tradición o estudios preclínicos.',
        bullets: [
          'Busca primero la calidad y el tipo de evidencia humana.',
          'Revisa interacciones, contraindicaciones y contexto de dosis.',
          'Trata los mecanismos como contexto biológico, no como prueba clínica.',
          'Ten en cuenta la incertidumbre cuando los estudios sean pequeños, mixtos o indirectos.',
        ],
      },
      {
        title: 'Perfiles populares',
        body:
          'Estos perfiles detallados todavía se abren en inglés mientras completamos la traducción científica campo por campo.',
        links: [
          { href: '/herbs/ashwagandha/', label: 'Ashwagandha', note: 'Perfil detallado en inglés' },
          { href: '/herbs/rhodiola/', label: 'Rhodiola', note: 'Perfil detallado en inglés' },
          { href: '/herbs/valerian/', label: 'Valeriana', note: 'Perfil detallado en inglés' },
          { href: '/herbs/bacopa/', label: 'Bacopa', note: 'Perfil detallado en inglés' },
        ],
      },
      {
        title: 'Qué estamos traduciendo',
        body:
          'La prioridad es conservar el significado científico: resumen de evidencia, seguridad, dosis, mecanismos y referencias. No publicamos una versión española de un perfil hasta que esos elementos sean equivalentes y coherentes.',
      },
    ],
    primaryCta: { href: '/es/objetivos/', label: 'Buscar por objetivo' },
    secondaryCta: { href: '/herbs/', label: 'Abrir biblioteca completa en inglés' },
  },
  compounds: {
    path: '/es/compuestos/',
    eyebrow: 'Biblioteca de investigación',
    title: 'Compuestos y suplementos: compara la evidencia',
    description:
      'Explora compuestos y suplementos con evidencia, mecanismos, dosis, seguridad e interacciones en un formato claro y basado en investigación.',
    intro:
      'La biblioteca de compuestos organiza lo que sabemos, lo que todavía no sabemos y qué riesgos conviene revisar antes de comparar opciones.',
    sections: [
      {
        title: 'Qué priorizamos',
        body:
          'La evidencia clínica en personas pesa más que los mecanismos aislados o las afirmaciones de marketing. Una señal prometedora no se presenta como un beneficio demostrado.',
        bullets: [
          'Tipo y calidad de estudios en humanos.',
          'Consistencia entre estudios y revisiones.',
          'Dosis estudiadas y contexto de uso.',
          'Interacciones, contraindicaciones y efectos adversos relevantes.',
        ],
      },
      {
        title: 'Puntos de partida',
        body:
          'Los perfiles completos de estos compuestos siguen en inglés durante la primera fase de traducción.',
        links: [
          { href: '/compounds/magnesium/', label: 'Magnesio', note: 'Perfil detallado en inglés' },
          { href: '/compounds/l-theanine/', label: 'L-teanina', note: 'Perfil detallado en inglés' },
          { href: '/compounds/melatonin/', label: 'Melatonina', note: 'Perfil detallado en inglés' },
          { href: '/compounds/omega-3/', label: 'Omega-3', note: 'Perfil detallado en inglés' },
        ],
      },
      {
        title: 'Sin falsas equivalencias',
        body:
          'No traducimos automáticamente términos científicos sensibles si eso puede cambiar el significado. Cada versión española debe conservar el nivel de certeza, los límites de la evidencia y las advertencias del original.',
      },
    ],
    primaryCta: { href: '/es/objetivos/', label: 'Comparar por objetivo' },
    secondaryCta: { href: '/compounds/', label: 'Abrir biblioteca completa en inglés' },
  },
  goals: {
    path: '/es/objetivos/',
    eyebrow: 'Empieza por lo que quieres mejorar',
    title: 'Explora suplementos por objetivo',
    description:
      'Compara opciones por objetivo — sueño, estrés, ansiedad y concentración — usando evidencia, seguridad, dosis y contexto práctico en español.',
    intro:
      'En vez de empezar por un ingrediente de moda, empieza por el resultado que te importa. Cada guía te ayuda a reducir opciones antes de entrar en perfiles individuales.',
    sections: [
      {
        title: 'Objetivos principales',
        body: 'Elige una ruta para ver qué preguntas importan antes de comparar suplementos.',
        links: [
          { href: '/es/objetivos/sueno/', label: 'Sueño', note: 'Calidad del sueño, horario y efectos al día siguiente' },
          { href: '/es/objetivos/estres/', label: 'Estrés', note: 'Patrón de estrés, tiempo de uso y tolerabilidad' },
          { href: '/es/objetivos/ansiedad/', label: 'Ansiedad', note: 'Evidencia, sedación, interacciones y límites' },
          { href: '/es/objetivos/concentracion/', label: 'Concentración', note: 'Atención, estimulación, sueño y compensaciones' },
        ],
      },
      {
        title: 'Cómo comparar',
        body:
          'Una opción puede ser interesante en un contexto y mala en otro. Compara evidencia, tiempo de acción, duración, seguridad, compatibilidad con medicamentos y qué tan bien coincide con tu situación.',
      },
    ],
    primaryCta: { href: '/es/seguridad/', label: 'Revisar seguridad primero' },
    secondaryCta: { href: '/goals/', label: 'Ver todos los objetivos en inglés' },
  },
  sleep: {
    path: '/es/objetivos/sueno/',
    eyebrow: 'Objetivo: sueño',
    title: 'Suplementos para el sueño: cómo comparar opciones',
    description:
      'Compara suplementos para el sueño considerando evidencia humana, horario, duración, efectos al día siguiente, dosis e interacciones importantes.',
    intro:
      '“Dormir mejor” puede significar conciliar el sueño, despertarse menos, mejorar la calidad percibida o evitar somnolencia al día siguiente. La comparación cambia según el problema real.',
    sections: [
      {
        title: 'Preguntas que cambian la decisión',
        body: 'Antes de elegir un ingrediente, define qué aspecto del sueño estás intentando mejorar.',
        bullets: [
          '¿El problema principal es conciliar el sueño o mantenerlo?',
          '¿Necesitas evitar sedación o lentitud al día siguiente?',
          '¿Tomas medicamentos u otros suplementos con efectos sedantes?',
          '¿La evidencia disponible estudia una situación parecida a la tuya?',
        ],
      },
      {
        title: 'Perfiles para investigar',
        body: 'Los perfiles científicos detallados aún están en inglés durante esta fase.',
        links: [
          { href: '/compounds/melatonin/', label: 'Melatonina', note: 'Perfil detallado en inglés' },
          { href: '/compounds/magnesium/', label: 'Magnesio', note: 'Perfil detallado en inglés' },
          { href: '/compounds/l-theanine/', label: 'L-teanina', note: 'Perfil detallado en inglés' },
          { href: '/herbs/valerian/', label: 'Valeriana', note: 'Perfil detallado en inglés' },
        ],
      },
    ],
    primaryCta: { href: '/es/seguridad/', label: 'Revisar seguridad' },
    secondaryCta: { href: '/goals/sleep/', label: 'Abrir guía completa en inglés' },
  },
  stress: {
    path: '/es/objetivos/estres/',
    eyebrow: 'Objetivo: estrés',
    title: 'Estrés: compara opciones sin confundir mecanismo con evidencia',
    description:
      'Compara suplementos para el estrés por evidencia humana, patrón de síntomas, tiempo de uso, seguridad, dosis e interacciones, con límites claros.',
    intro:
      'El estrés no es una sola experiencia. La utilidad de una opción depende de si buscas calma aguda, apoyo durante una etapa exigente o una estrategia que no interfiera con energía y concentración.',
    sections: [
      {
        title: 'Qué conviene separar',
        body:
          'Muchos productos se venden con lenguaje de “adaptógenos” o cortisol. Esas etiquetas no sustituyen ensayos clínicos ni demuestran que una opción sea adecuada para una persona concreta.',
        bullets: [
          'Efectos percibidos frente a cambios en biomarcadores.',
          'Uso agudo frente a uso durante semanas.',
          'Calma útil frente a sedación no deseada.',
          'Beneficio potencial frente a interacciones y contraindicaciones.',
        ],
      },
      {
        title: 'Perfiles para investigar',
        body: 'Los perfiles completos enlazados aquí todavía están en inglés.',
        links: [
          { href: '/herbs/ashwagandha/', label: 'Ashwagandha', note: 'Perfil detallado en inglés' },
          { href: '/herbs/rhodiola/', label: 'Rhodiola', note: 'Perfil detallado en inglés' },
          { href: '/compounds/l-theanine/', label: 'L-teanina', note: 'Perfil detallado en inglés' },
          { href: '/compounds/magnesium/', label: 'Magnesio', note: 'Perfil detallado en inglés' },
        ],
      },
    ],
    primaryCta: { href: '/es/seguridad/', label: 'Revisar seguridad' },
    secondaryCta: { href: '/goals/stress/', label: 'Abrir guía completa en inglés' },
  },
  anxiety: {
    path: '/es/objetivos/ansiedad/',
    eyebrow: 'Objetivo: ansiedad',
    title: 'Ansiedad: evidencia y seguridad antes que promesas rápidas',
    description:
      'Compara suplementos estudiados para ansiedad considerando calidad de evidencia, sedación, dosis, interacciones y cuándo la incertidumbre sigue siendo alta.',
    intro:
      'En temas de ansiedad, una señal pequeña no debe convertirse en una promesa grande. Aquí la prioridad es distinguir evidencia clínica de mecanismos teóricos y mantener visibles las precauciones.',
    sections: [
      {
        title: 'Qué mirar primero',
        body:
          'La calidad del estudio, la población estudiada y la magnitud del efecto importan tanto como el nombre del ingrediente.',
        bullets: [
          '¿Hay ensayos controlados en humanos o solo evidencia indirecta?',
          '¿Los resultados son consistentes entre estudios?',
          '¿Puede causar sedación o potenciar otros depresores del sistema nervioso?',
          '¿Existen interacciones relevantes con medicamentos?',
        ],
      },
      {
        title: 'Perfiles para investigar',
        body: 'Los perfiles completos enlazados aquí todavía están en inglés.',
        links: [
          { href: '/compounds/l-theanine/', label: 'L-teanina', note: 'Perfil detallado en inglés' },
          { href: '/herbs/ashwagandha/', label: 'Ashwagandha', note: 'Perfil detallado en inglés' },
          { href: '/herbs/valerian/', label: 'Valeriana', note: 'Perfil detallado en inglés' },
          { href: '/compounds/magnesium/', label: 'Magnesio', note: 'Perfil detallado en inglés' },
        ],
      },
    ],
    primaryCta: { href: '/es/seguridad/', label: 'Revisar seguridad' },
    secondaryCta: { href: '/goals/anxiety/', label: 'Abrir guía completa en inglés' },
  },
  focus: {
    path: '/es/objetivos/concentracion/',
    eyebrow: 'Objetivo: concentración',
    title: 'Concentración: compara beneficios, estimulación y compensaciones',
    description:
      'Compara suplementos para concentración por evidencia humana, estimulación, duración, sueño, tolerabilidad, dosis e interacciones relevantes.',
    intro:
      'Más estimulación no siempre significa mejor concentración. Una comparación útil considera atención, fatiga, sueño, tolerabilidad y la calidad real de la evidencia.',
    sections: [
      {
        title: 'Preguntas útiles',
        body:
          'Define si buscas alerta, resistencia mental, menos distracción o apoyo durante fatiga. Son objetivos distintos y no todos los estudios miden lo mismo.',
        bullets: [
          '¿La evidencia mide atención objetiva o solo sensación subjetiva?',
          '¿El ingrediente es estimulante y puede afectar el sueño?',
          '¿Hay tolerancia, efectos rebote o interacciones que deban considerarse?',
          '¿La dosis estudiada coincide con la forma del producto que estás comparando?',
        ],
      },
      {
        title: 'Perfiles para investigar',
        body: 'Los perfiles completos enlazados aquí todavía están en inglés.',
        links: [
          { href: '/compounds/caffeine/', label: 'Cafeína', note: 'Perfil detallado en inglés' },
          { href: '/compounds/l-theanine/', label: 'L-teanina', note: 'Perfil detallado en inglés' },
          { href: '/herbs/rhodiola/', label: 'Rhodiola', note: 'Perfil detallado en inglés' },
          { href: '/herbs/bacopa/', label: 'Bacopa', note: 'Perfil detallado en inglés' },
        ],
      },
    ],
    primaryCta: { href: '/es/seguridad/', label: 'Revisar seguridad' },
    secondaryCta: { href: '/goals/focus/', label: 'Abrir guía completa en inglés' },
  },
  methodology: {
    path: '/es/metodologia/',
    eyebrow: 'Cómo trabajamos',
    title: 'Metodología: cómo evaluamos la evidencia',
    description:
      'Conoce cómo The Hippie Scientist separa evidencia humana, mecanismos, seguridad y límites de investigación para evaluar suplementos con rigor.',
    intro:
      'El objetivo no es encontrar una razón para recomendar cada ingrediente. El objetivo es representar con fidelidad qué tan fuerte es la evidencia, qué preguntas siguen abiertas y qué riesgos importan.',
    sections: [
      {
        title: '1. Evidencia humana primero',
        body:
          'Los ensayos y estudios en personas tienen prioridad para evaluar resultados humanos. Estudios celulares y animales ayudan a explicar hipótesis, pero no se presentan como beneficios clínicos demostrados.',
      },
      {
        title: '2. Mecanismo separado del resultado',
        body:
          'Una vía biológica plausible puede explicar por qué algo merece estudio. No convierte por sí sola una intervención en eficaz.',
      },
      {
        title: '3. Seguridad antes del veredicto',
        body:
          'Interacciones, contraindicaciones, efectos adversos y contexto de dosis deben seguir visibles incluso cuando la evidencia de beneficio sea prometedora.',
      },
      {
        title: '4. Incertidumbre explícita',
        body:
          'Resultados mixtos, muestras pequeñas, dependencia excesiva de un solo estudio y evidencia indirecta reducen la confianza. Esa incertidumbre se conserva en el lenguaje editorial.',
      },
    ],
    primaryCta: { href: '/info/methodology/', label: 'Ver metodología completa en inglés' },
    secondaryCta: { href: '/es/seguridad/', label: 'Ver enfoque de seguridad' },
  },
  safety: {
    path: '/es/seguridad/',
    eyebrow: 'Seguridad primero',
    title: 'Seguridad de suplementos e interacciones',
    description:
      'Revisa interacciones, contraindicaciones, sedación, duplicación de efectos y contexto de dosis antes de combinar hierbas o suplementos.',
    intro:
      'Que un producto sea “natural” no significa que sea neutro. La seguridad depende de dosis, medicamentos, condiciones médicas, embarazo, combinaciones y otros factores personales.',
    sections: [
      {
        title: 'Antes de combinar productos',
        body: 'Busca riesgos acumulativos, no solo advertencias aisladas de cada ingrediente.',
        bullets: [
          'Efectos sedantes que puedan sumarse.',
          'Cambios potenciales en presión arterial, glucosa o coagulación.',
          'Ingredientes repetidos entre varios productos.',
          'Interacciones con medicamentos y condiciones médicas.',
          'Dosis o formas del ingrediente que no coinciden con las estudiadas.',
        ],
      },
      {
        title: 'Herramientas actuales',
        body:
          'Las herramientas interactivas detalladas siguen en inglés durante esta fase, pero puedes usarlas como apoyo para identificar preguntas de seguridad que después conviene confirmar con un profesional sanitario.',
        links: [
          { href: '/safety-checker/', label: 'Comprobador de interacciones', note: 'Herramienta en inglés' },
          { href: '/info/supplement-safety-checklist/', label: 'Lista de seguridad de suplementos', note: 'Guía en inglés' },
        ],
      },
    ],
    primaryCta: { href: '/safety-checker/', label: 'Abrir comprobador en inglés' },
    secondaryCta: { href: '/es/metodologia/', label: 'Cómo evaluamos la evidencia' },
  },
} as const satisfies Record<string, SpanishPageData>

export type SpanishPageKey = keyof typeof SPANISH_PAGES

export function buildSpanishPageMetadata(page: SpanishPageData): Metadata {
  const metadata = buildPageMetadata({
    title: page.title,
    description: page.description,
    path: page.path,
    openGraphType: 'website',
  })

  return {
    ...metadata,
    openGraph: metadata.openGraph
      ? {
          ...metadata.openGraph,
          locale: SPANISH_OG_LOCALE,
          alternateLocale: [DEFAULT_OG_LOCALE],
        }
      : metadata.openGraph,
  }
}
