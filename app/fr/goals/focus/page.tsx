import type { Metadata } from 'next'
import FrenchPageShell from '../../_components/FrenchPageShell'
import { SITE_URL } from '@/src/lib/seo'

export const metadata: Metadata = {
  title: 'Concentration et suppléments | The Hippie Scientist en français',
  description:
    'Guide en français pour explorer concentration, énergie mentale, attention et sécurité des suppléments avec un langage fondé sur les preuves.',
  alternates: { canonical: `${SITE_URL}/fr/goals/focus/` },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Concentration et suppléments | The Hippie Scientist en français',
    description: 'Une entrée en français pour explorer concentration, énergie mentale et preuves sans exagération.',
    url: `${SITE_URL}/fr/goals/focus/`,
    siteName: 'The Hippie Scientist',
    locale: 'fr_FR',
    type: 'article',
  },
}

export default function FrenchFocusPage() {
  return (
    <FrenchPageShell
      eyebrow='Objectif : concentration'
      title='Concentration : distinguez énergie, clarté mentale et stimulation.'
      description='Améliorer la concentration ne signifie pas toujours utiliser quelque chose de plus fort. Cette page organise les questions utiles sur le sommeil, la caféine, le stress, les habitudes, la sécurité et la qualité des preuves.'
      primaryHref='/goals/focus/'
      primaryLabel='Voir le guide complet en anglais'
      secondaryHref='/fr/'
      secondaryLabel='Retour à l’accueil français'
      cards={[
        {
          title: 'L’énergie n’est pas la concentration',
          body: 'Un produit peut vous faire sentir plus éveillé sans améliorer l’organisation, la mémoire ou le travail profond. Il vaut mieux séparer ces objectifs.',
        },
        {
          title: 'Prudence avec les stimulants',
          body: 'Caféine, stimulants, médicaments et autres produits peuvent s’additionner. La sécurité dépend du contexte personnel.',
        },
        {
          title: 'Comparer par les preuves',
          body: 'Les meilleures pages expliquent ce qui a été étudié, chez qui, pendant combien de temps et l’ampleur de l’effet observé.',
        },
      ]}
      note='La page complète en anglais contient plus de liens internes pendant la préparation de la traduction de la bibliothèque.'
    />
  )
}
