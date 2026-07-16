import type { Metadata } from 'next'
import GermanPageShell from '../../_components/GermanPageShell'
import { SITE_URL } from '@/src/lib/seo'

export const metadata: Metadata = {
  title: 'Angst und Supplements | The Hippie Scientist auf Deutsch',
  description:
    'Deutscher Einstieg zu Angst, Ruhe, Sicherheit und Grenzen der Evidenz ohne übertriebene Versprechen.',
  alternates: { canonical: `${SITE_URL}/de/goals/anxiety/` },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Angst und Supplements | The Hippie Scientist auf Deutsch',
    description: 'Angst, Ruhe, Sicherheit und Evidenzqualität auf Deutsch einordnen.',
    url: `${SITE_URL}/de/goals/anxiety/`,
    siteName: 'The Hippie Scientist',
    locale: 'de_DE',
    type: 'article',
  },
}

export default function GermanAnxietyPage() {
  return (
    <GermanPageShell
      eyebrow='Ziel: Angst'
      title='Angst: Mit Vorsicht, Kontext und klarer Sprache beginnen.'
      description='Diese Seite stellt Supplements nicht als Antwort dar. Sie hilft, Optionen rund um Ruhe, wichtige Vergleichspunkte und den Unterschied zwischen Humanstudien und Marketing besser einzuordnen.'
      primaryHref='/goals/anxiety/'
      primaryLabel='Vollständigen englischen Guide ansehen'
      secondaryHref='/de/goals/stress/'
      secondaryLabel='Mit Stress vergleichen'
      cards={[
        {
          title: 'Nicht alles gleichsetzen',
          body: 'Sorge, Anspannung und unruhiger Schlaf sind nicht derselbe Kontext. Eine gute Seite sollte sie nicht in ein einziges Versprechen pressen.',
        },
        {
          title: 'Kombinationen beachten',
          body: 'Wenn bereits Produkte für Stimmung, Schlaf oder Wachheit genutzt werden, sollten beruhigende Optionen besonders vorsichtig verglichen werden.',
        },
        {
          title: 'Echte Evidenz suchen',
          body: 'Nützliche Evidenz erklärt Studiengröße, Zielgruppe, Dosis, Dauer und Grenzen, statt nur zu sagen, dass etwas natürlich ist.',
        },
      ]}
      note='Wenn deine Situation dich beunruhigt, nutze passende professionelle Unterstützung. Diese Seite ordnet nur Bildungsinformationen.'
    />
  )
}
