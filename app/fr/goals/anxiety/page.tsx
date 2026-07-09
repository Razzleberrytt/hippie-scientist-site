import type { Metadata } from 'next'
import FrenchPageShell from '../../_components/FrenchPageShell'
import { SITE_URL } from '@/src/lib/seo'

export const metadata: Metadata = {
  title: 'Anxiété et suppléments | The Hippie Scientist en français',
  description:
    'Guide en français pour explorer les suppléments et plantes liés à l’anxiété, au calme et à la sécurité, sans promesses exagérées.',
  alternates: { canonical: `${SITE_URL}/fr/goals/anxiety/` },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Anxiété et suppléments | The Hippie Scientist en français',
    description: 'Une entrée en français pour explorer anxiété, calme, sécurité et qualité des preuves.',
    url: `${SITE_URL}/fr/goals/anxiety/`,
    siteName: 'The Hippie Scientist',
    locale: 'fr_FR',
    type: 'article',
  },
}

export default function FrenchAnxietyPage() {
  return (
    <FrenchPageShell
      eyebrow='Objectif : anxiété'
      title='Anxiété : commencez avec prudence, contexte et langage clair.'
      description='Cette page ne présente pas les suppléments comme un traitement. Elle sert de point de départ pour comprendre les options liées au calme, vérifier les risques d’interaction et distinguer les preuves humaines du marketing.'
      primaryHref='/goals/anxiety/'
      primaryLabel='Voir le guide complet en anglais'
      secondaryHref='/fr/goals/stress/'
      secondaryLabel='Comparer avec le stress'
      cards={[
        {
          title: 'Tout n’est pas identique',
          body: 'Inquiétude, tension, sommeil agité et crises de panique ne relèvent pas du même contexte. La page évite de tout mélanger en une seule promesse.',
        },
        {
          title: 'Attention aux combinaisons',
          body: 'Les options apaisantes peuvent compter davantage si vous utilisez des médicaments pour l’humeur, le sommeil, la tension artérielle, l’alcool ou d’autres produits sédatifs.',
        },
        {
          title: 'Chercher de vraies preuves',
          body: 'Les preuves utiles expliquent la taille des études, la population, la dose, la durée et les limites, pas seulement qu’un produit est naturel.',
        },
      ]}
      note='Si les symptômes sont intenses, nouveaux ou dangereux, cherchez une aide professionnelle ou locale d’urgence. Cette page organise seulement des informations éducatives.'
    />
  )
}
