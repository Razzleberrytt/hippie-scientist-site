import type { Metadata } from 'next'
import GermanPageShell from '../../_components/GermanPageShell'
import { SITE_URL } from '@/src/lib/seo'

export const metadata: Metadata = {
  title: 'Schlaf und Supplements | The Hippie Scientist auf Deutsch',
  description:
    'Deutscher Einstieg zu Schlaf, Supplements, Kräutern und Gewohnheiten mit Fokus auf Sicherheit und Evidenz.',
  alternates: { canonical: `${SITE_URL}/de/goals/sleep/` },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Schlaf und Supplements | The Hippie Scientist auf Deutsch',
    description: 'Ein deutscher Einstieg, um Schlaf mit Sicherheit, Rhythmus und Evidenz einzuordnen.',
    url: `${SITE_URL}/de/goals/sleep/`,
    siteName: 'The Hippie Scientist',
    locale: 'de_DE',
    type: 'article',
  },
}

export default function GermanSleepPage() {
  return (
    <GermanPageShell
      eyebrow='Ziel: Schlaf'
      title='Schlaf: Beginne mit Sicherheit, Rhythmus und Evidenz.'
      description='Es geht nicht darum, eine magische Lösung zu finden. Sinnvoller ist es, Optionen zu ordnen: Was kann Erholung unterstützen, was kann am nächsten Tag müde machen, und was verdient besondere Vorsicht bei Medikamenten oder Gesundheitsfaktoren?'
      primaryHref='/goals/sleep/'
      primaryLabel='Vollständigen englischen Guide ansehen'
      secondaryHref='/de/'
      secondaryLabel='Zur deutschen Startseite'
      cards={[
        {
          title: 'Zuerst: Kontext',
          body: 'Bevor Supplements verglichen werden, lohnt sich ein Blick auf Schlafzeiten, Koffein, Alkohol, Bildschirme, Abendstress und Regelmäßigkeit.',
        },
        {
          title: 'Dann: Sicherheit',
          body: 'Beruhigende Optionen können mit Alkohol, Schlafmitteln, Medikamenten, Schwangerschaft oder persönlichen Gesundheitsfaktoren relevant werden.',
        },
        {
          title: 'Danach: Evidenz',
          body: 'Eine gute Schlafseite trennt traditionelle Nutzung, plausible Mechanismen und echte Humanstudien, ohne Ergebnisse zu übertreiben.',
        },
      ]}
      note='Dies ist eine übersetzte Einstiegsseite. Für vollständige Inhaltsprofile verlinkt sie derzeit auf die englischen Bibliotheksseiten.'
    />
  )
}
