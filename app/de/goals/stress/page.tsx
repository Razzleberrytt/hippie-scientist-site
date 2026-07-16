import type { Metadata } from 'next'
import GermanPageShell from '../../_components/GermanPageShell'
import { SITE_URL } from '@/src/lib/seo'

export const metadata: Metadata = {
  title: 'Stress und Supplements | The Hippie Scientist auf Deutsch',
  description:
    'Deutscher Einstieg zu Stress, Ruhe, Anpassung und Supplement-Sicherheit mit evidenzorientierter Sprache.',
  alternates: { canonical: `${SITE_URL}/de/goals/stress/` },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Stress und Supplements | The Hippie Scientist auf Deutsch',
    description: 'Stress, Ruhe und Supplements auf Deutsch evidenzorientiert einordnen.',
    url: `${SITE_URL}/de/goals/stress/`,
    siteName: 'The Hippie Scientist',
    locale: 'de_DE',
    type: 'article',
  },
}

export default function GermanStressPage() {
  return (
    <GermanPageShell
      eyebrow='Ziel: Stress'
      title='Stress: Ruhe, Energie und Erholung getrennt betrachten.'
      description='Stress kann körperliche Anspannung, Erschöpfung, Reizbarkeit, mentalen Druck oder langsame Erholung bedeuten. Diese Seite hilft, diese Kontexte zu trennen, bevor Supplements oder Kräuter verglichen werden.'
      primaryHref='/goals/stress/'
      primaryLabel='Vollständigen englischen Guide ansehen'
      secondaryHref='/de/goals/anxiety/'
      secondaryLabel='Mit Angst vergleichen'
      cards={[
        {
          title: 'Problem definieren',
          body: 'Nicht jede Stress-Option zielt auf dasselbe. Manche betreffen Entspannung, andere Energie oder ein subjektives Gefühl von Belastbarkeit.',
        },
        {
          title: 'Interaktionen prüfen',
          body: 'Kräuter und Supplements können ungeeignet sein, wenn bereits Medikamente, Beruhigungsmittel, Stimulanzien oder ähnliche Produkte genutzt werden.',
        },
        {
          title: 'Evidenzqualität ansehen',
          body: 'Eine solide Empfehlung braucht mehr als eine beliebte Geschichte: Sie sollte Humanstudien, Grenzen und Sicherheit erklären.',
        },
      ]}
      note='Für konkrete Inhaltsvergleiche bleibt der vollständige englische Guide vorerst die Hauptquelle.'
    />
  )
}
