import type { SpanishPageData } from '@/src/lib/spanish-content'
import { buildSpanishPageMetadata } from '@/src/lib/spanish-content'
import SpanishCorePage from '@/components/localization/SpanishCorePage'

const page: SpanishPageData = {
  path: '/es/',
  eyebrow: 'The Hippie Scientist en español',
  title: 'Investiga suplementos sin adivinar',
  description:
    'Compara hierbas y suplementos por evidencia humana, mecanismos, dosis, seguridad e interacciones. Investigación clara y basada en evidencia en español.',
  intro:
    'Compara hierbas y suplementos según evidencia en humanos, mecanismos, dosis y seguridad. Empieza por tu objetivo, no por el marketing.',
  sections: [
    {
      title: 'Empieza por un objetivo',
      body:
        'Cada ruta organiza la decisión antes de entrar en ingredientes individuales. Elige el resultado que quieres investigar y compara opciones con el mismo marco.',
      links: [
        { href: '/es/objetivos/sueno/', label: 'Sueño', note: 'Horario, calidad del sueño y efectos al día siguiente' },
        { href: '/es/objetivos/estres/', label: 'Estrés', note: 'Patrón de estrés, evidencia y tolerabilidad' },
        { href: '/es/objetivos/ansiedad/', label: 'Ansiedad', note: 'Evidencia, sedación, seguridad y límites' },
        { href: '/es/objetivos/concentracion/', label: 'Concentración', note: 'Atención, estimulación, sueño y compensaciones' },
      ],
    },
    {
      title: 'Explora la biblioteca',
      body:
        'Separamos la evidencia clínica de los mecanismos y mantenemos las advertencias visibles. Las bibliotecas españolas ya están publicadas; los perfiles detallados se traducirán de forma progresiva.',
      links: [
        { href: '/es/hierbas/', label: 'Hierbas', note: 'Investigación, mecanismos y seguridad' },
        { href: '/es/compuestos/', label: 'Compuestos y suplementos', note: 'Evidencia, dosis e interacciones' },
      ],
    },
    {
      title: 'Cómo protegemos el significado científico',
      body:
        'No publicamos traducciones automáticas de conclusiones médicas sensibles. La versión española debe conservar el grado de certeza, las limitaciones, las interacciones y el contexto de la evidencia del contenido original.',
      links: [
        { href: '/es/metodologia/', label: 'Cómo evaluamos la evidencia' },
        { href: '/es/seguridad/', label: 'Seguridad e interacciones' },
      ],
    },
  ],
  primaryCta: { href: '/es/objetivos/', label: 'Elegir un objetivo' },
  secondaryCta: { href: '/', label: 'English version' },
}

export const metadata = buildSpanishPageMetadata(page)

export default function SpanishHomePage() {
  return <SpanishCorePage page={page} />
}
