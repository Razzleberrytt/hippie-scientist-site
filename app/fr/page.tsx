import type { Metadata } from 'next'
import FrenchPageShell from './_components/FrenchPageShell'
import { SITE_URL } from '@/src/lib/seo'

export const metadata: Metadata = {
  title: 'The Hippie Scientist en français | Recherche sur les suppléments',
  description:
    'Page d’accueil française de The Hippie Scientist : recherche claire sur les suppléments, plantes et composés pour le sommeil, le stress, l’anxiété et la concentration.',
  alternates: { canonical: `${SITE_URL}/fr/` },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'The Hippie Scientist en français',
    description: 'Recherche claire sur les suppléments, plantes et composés, avec des pages principales en français.',
    url: `${SITE_URL}/fr/`,
    siteName: 'The Hippie Scientist',
    locale: 'fr_FR',
    type: 'website',
  },
}

export default function FrenchHomePage() {
  return (
    <FrenchPageShell
      eyebrow='The Hippie Scientist en français'
      title='La recherche sur les suppléments, expliquée avec clarté et prudence.'
      description='Commencez par votre objectif : mieux dormir, gérer le stress, comprendre l’anxiété ou améliorer la concentration. Ces pages résument les points clés en français et renvoient vers la bibliothèque complète du site.'
      primaryHref='/fr/goals/sleep/'
      primaryLabel='Commencer par le sommeil'
      secondaryHref='/goals/'
      secondaryLabel='Voir les objectifs en anglais'
      cards={[
        {
          title: 'Sommeil',
          body: 'Un point de départ simple pour examiner le repos, les horaires, la sécurité et la qualité des preuves.',
          href: '/fr/goals/sleep/',
          label: 'Voir le sommeil en français',
        },
        {
          title: 'Stress et anxiété',
          body: 'Des introductions pour distinguer calme, tension, inquiétude et sécurité avant de comparer des options.',
          href: '/fr/goals/stress/',
          label: 'Voir le stress en français',
        },
        {
          title: 'Concentration',
          body: 'Une entrée claire pour réfléchir à l’énergie mentale, l’attention, les habitudes et les limites des preuves.',
          href: '/fr/goals/focus/',
          label: 'Voir la concentration en français',
        },
      ]}
      note='La bibliothèque complète de plantes et de composés reste principalement en anglais pendant la mise en place du flux de traduction.'
    />
  )
}
