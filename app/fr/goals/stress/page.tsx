import type { Metadata } from 'next'
import FrenchPageShell from '../../_components/FrenchPageShell'
import { SITE_URL } from '@/src/lib/seo'

export const metadata: Metadata = {
  title: 'Stress et suppléments | The Hippie Scientist en français',
  description:
    'Guide en français pour explorer les options liées au stress, au calme, à l’adaptation et à la sécurité des suppléments.',
  alternates: { canonical: `${SITE_URL}/fr/goals/stress/` },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Stress et suppléments | The Hippie Scientist en français',
    description: 'Une entrée en français pour explorer stress, calme et suppléments avec une approche fondée sur les preuves.',
    url: `${SITE_URL}/fr/goals/stress/`,
    siteName: 'The Hippie Scientist',
    locale: 'fr_FR',
    type: 'article',
  },
}

export default function FrenchStressPage() {
  return (
    <FrenchPageShell
      eyebrow='Objectif : stress'
      title='Stress : comparez calme, énergie et récupération sans exagération.'
      description='Le stress peut signifier beaucoup de choses : tension physique, fatigue, irritabilité, pression mentale ou récupération lente. Cette page aide à séparer ces contextes avant de regarder des suppléments ou des plantes.'
      primaryHref='/goals/stress/'
      primaryLabel='Voir le guide complet en anglais'
      secondaryHref='/fr/goals/anxiety/'
      secondaryLabel='Comparer avec l’anxiété'
      cards={[
        {
          title: 'Définir le problème',
          body: 'Toutes les options liées au stress ne visent pas la même chose. Certaines concernent la détente, d’autres l’énergie ou la résilience perçue.',
        },
        {
          title: 'Vérifier les interactions',
          body: 'Les plantes et suppléments peuvent ne pas convenir si vous utilisez déjà des médicaments, des sédatifs, des stimulants ou des produits aux effets similaires.',
        },
        {
          title: 'Regarder la qualité des preuves',
          body: 'Une recommandation solide demande plus qu’une histoire populaire : elle doit expliquer les études humaines, les limites et la sécurité.',
        },
      ]}
      note='Pour comparer des ingrédients précis, utilisez le guide complet en anglais pendant que la traduction s’élargit.'
    />
  )
}
