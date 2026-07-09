import type { Metadata } from 'next'
import FrenchPageShell from '../../_components/FrenchPageShell'
import { SITE_URL } from '@/src/lib/seo'

export const metadata: Metadata = {
  title: 'Sommeil et suppléments | The Hippie Scientist en français',
  description:
    'Guide en français pour commencer à explorer les suppléments, plantes et habitudes liés au sommeil, avec un accent sur la sécurité et les preuves.',
  alternates: { canonical: `${SITE_URL}/fr/goals/sleep/` },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Sommeil et suppléments | The Hippie Scientist en français',
    description: 'Une entrée en français pour aborder le sommeil avec prudence, sécurité et preuves.',
    url: `${SITE_URL}/fr/goals/sleep/`,
    siteName: 'The Hippie Scientist',
    locale: 'fr_FR',
    type: 'article',
  },
}

export default function FrenchSleepPage() {
  return (
    <FrenchPageShell
      eyebrow='Objectif : sommeil'
      title='Sommeil : commencez par la sécurité, le rythme et les preuves.'
      description='Le but n’est pas de trouver une solution magique. Il s’agit d’organiser les options : ce qui peut soutenir le repos, ce qui peut causer de la somnolence le lendemain et ce qui mérite une vérification si vous prenez des médicaments ou avez des conditions de santé.'
      primaryHref='/goals/sleep/'
      primaryLabel='Voir le guide complet en anglais'
      secondaryHref='/fr/'
      secondaryLabel='Retour à l’accueil français'
      cards={[
        {
          title: 'D’abord : le contexte',
          body: 'Avant de comparer des suppléments, examinez les horaires, la caféine, l’alcool, les écrans, le stress du soir et la régularité du sommeil.',
        },
        {
          title: 'Ensuite : la sécurité',
          body: 'Les options apaisantes peuvent interagir avec les sédatifs, l’alcool, certains médicaments, la grossesse ou d’autres facteurs personnels.',
        },
        {
          title: 'Enfin : les preuves',
          body: 'Une bonne page sur le sommeil doit distinguer tradition, mécanisme plausible et études humaines réelles sans exagérer les résultats.',
        },
      ]}
      note='Cette page est une entrée traduite. Pour les profils complets d’ingrédients, utilisez le guide complet et les pages de bibliothèque liées.'
    />
  )
}
