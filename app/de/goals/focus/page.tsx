import type { Metadata } from 'next'
import GermanPageShell from '../../_components/GermanPageShell'
import { SITE_URL } from '@/src/lib/seo'

export const metadata: Metadata = {
  title: 'Fokus und Supplements | The Hippie Scientist auf Deutsch',
  description:
    'Deutscher Einstieg zu Fokus, mentaler Energie, Aufmerksamkeit und Supplement-Sicherheit mit evidenzorientierter Sprache.',
  alternates: { canonical: `${SITE_URL}/de/goals/focus/` },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Fokus und Supplements | The Hippie Scientist auf Deutsch',
    description: 'Fokus, mentale Energie und Evidenz ohne Übertreibung auf Deutsch einordnen.',
    url: `${SITE_URL}/de/goals/focus/`,
    siteName: 'The Hippie Scientist',
    locale: 'de_DE',
    type: 'article',
  },
}

export default function GermanFocusPage() {
  return (
    <GermanPageShell
      eyebrow='Ziel: Fokus'
      title='Fokus: Energie, Klarheit und Stimulation unterscheiden.'
      description='Besserer Fokus bedeutet nicht automatisch, etwas Stärkeres zu nehmen. Sinnvoller ist es, Schlaf, Koffein, Stress, Gewohnheiten, Sicherheit und Evidenzqualität zuerst zu sortieren.'
      primaryHref='/goals/focus/'
      primaryLabel='Vollständigen englischen Guide ansehen'
      secondaryHref='/de/'
      secondaryLabel='Zur deutschen Startseite'
      cards={[
        {
          title: 'Energie ist nicht Fokus',
          body: 'Ein Produkt kann wacher machen, ohne Organisation, Gedächtnis oder tiefes Arbeiten zu verbessern. Diese Ziele sollten getrennt betrachtet werden.',
        },
        {
          title: 'Vorsicht mit Stimulanzien',
          body: 'Koffein, Stimulanzien, Medikamente und andere Produkte können sich addieren. Sicherheit hängt vom persönlichen Kontext ab.',
        },
        {
          title: 'Nach Evidenz vergleichen',
          body: 'Gute Seiten erklären, was untersucht wurde, bei wem, wie lange und wie groß der beobachtete Effekt war.',
        },
      ]}
      note='Die vollständige englische Seite enthält aktuell mehr interne Links, während die deutsche Bibliothek vorbereitet wird.'
    />
  )
}
