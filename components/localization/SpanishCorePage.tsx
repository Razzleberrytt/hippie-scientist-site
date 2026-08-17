import type { SpanishPageData } from '@/src/lib/spanish-content'
import LocalizedCorePage from './LocalizedCorePage'

const spanishUi = {
  translationNotice:
    'Esta es una traducción editorial en español. Los perfiles científicos que todavía no tienen una versión española completa se identifican como contenido en inglés.',
  nextStepLabel: 'Siguiente paso',
  nextStepBody:
    'Sigue comparando con el mismo criterio: evidencia primero, seguridad visible y límites claros.',
  educationDisclaimer:
    'Contenido educativo. No sustituye la evaluación individual de un profesional sanitario, especialmente si tomas medicamentos, estás embarazada o tienes una condición médica.',
} as const

export default function SpanishCorePage({ page }: { page: SpanishPageData }) {
  return <LocalizedCorePage page={page} ui={spanishUi} lang='es' />
}
