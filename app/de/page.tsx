import type { Metadata } from 'next'
import GermanPageShell from './_components/GermanPageShell'
import { SITE_URL } from '@/src/lib/seo'

export const metadata: Metadata = {
  title: 'The Hippie Scientist auf Deutsch | Supplement-Forschung',
  description:
    'Deutsche Startseite von The Hippie Scientist: klare Forschung zu Supplements, Kräutern und Wirkstoffen für Schlaf, Stress, Angst und Fokus.',
  alternates: { canonical: `${SITE_URL}/de/` },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'The Hippie Scientist auf Deutsch',
    description: 'Klare Forschung zu Supplements, Kräutern und Wirkstoffen, jetzt mit deutschen Einstiegsseiten.',
    url: `${SITE_URL}/de/`,
    siteName: 'The Hippie Scientist',
    locale: 'de_DE',
    type: 'website',
  },
}

export default function GermanHomePage() {
  return (
    <GermanPageShell
      eyebrow='The Hippie Scientist auf Deutsch'
      title='Supplement-Forschung klar, vorsichtig und evidenzorientiert erklärt.'
      description='Beginne mit deinem Ziel: besser schlafen, Stress einordnen, Angst verstehen oder den Fokus verbessern. Diese Seiten fassen die wichtigsten Einstiegspunkte auf Deutsch zusammen und verlinken zur vollständigen englischen Bibliothek.'
      primaryHref='/de/goals/sleep/'
      primaryLabel='Mit Schlaf beginnen'
      secondaryHref='/goals/'
      secondaryLabel='Ziele auf Englisch ansehen'
      cards={[
        {
          title: 'Schlaf',
          body: 'Ein einfacher Einstieg zu Erholung, Rhythmus, Sicherheit und Qualität der Evidenz.',
          href: '/de/goals/sleep/',
          label: 'Schlaf auf Deutsch ansehen',
        },
        {
          title: 'Stress und Angst',
          body: 'Einführungen, um Ruhe, Anspannung, Sorge und Sicherheit sauber zu trennen.',
          href: '/de/goals/stress/',
          label: 'Stress auf Deutsch ansehen',
        },
        {
          title: 'Fokus',
          body: 'Ein klarer Einstieg zu mentaler Energie, Aufmerksamkeit, Gewohnheiten und Grenzen der Evidenz.',
          href: '/de/goals/focus/',
          label: 'Fokus auf Deutsch ansehen',
        },
      ]}
      note='Die vollständige Kräuter- und Wirkstoffbibliothek bleibt vorerst überwiegend englisch, während der Übersetzungsprozess aufgebaut wird.'
    />
  )
}
