import type { LocalizedPageData, LocalizedUiCopy } from './localization'
import { buildLocalizedPageMetadata } from './localization'
import { DEFAULT_OG_LOCALE, FRENCH_OG_LOCALE } from './international-seo'

export const FRENCH_UI: LocalizedUiCopy = {
  translationNotice:
    'Ceci est une traduction éditoriale en français. Les profils scientifiques qui ne disposent pas encore d’une version française complète sont clairement indiqués comme contenus en anglais.',
  nextStepLabel: 'Étape suivante',
  nextStepBody:
    'Continuez à comparer avec le même principe : les preuves d’abord, la sécurité visible et des limites clairement indiquées.',
  educationDisclaimer:
    'Contenu éducatif. Il ne remplace pas une évaluation individuelle par un professionnel de santé, notamment si vous prenez des médicaments, êtes enceinte ou avez une pathologie.',
}

export const FRENCH_PAGES = {
  home: {
    path: '/fr/',
    eyebrow: 'The Hippie Scientist en français',
    title: 'Recherchez les compléments sans deviner',
    description:
      'Comparez plantes et compléments selon les données humaines, les mécanismes, les doses, la sécurité et les interactions, en français.',
    intro:
      'Comparez plantes et compléments à partir des données humaines, des mécanismes, des doses et de la sécurité. Commencez par votre objectif, pas par le marketing.',
    sections: [
      {
        title: 'Commencez par un objectif',
        body:
          'Chaque parcours structure la décision avant de passer aux ingrédients. Choisissez le résultat que vous souhaitez étudier et comparez les options avec le même cadre.',
        links: [
          { href: '/fr/objectifs/sommeil/', label: 'Sommeil', note: 'Endormissement, qualité et effets le lendemain' },
          { href: '/fr/objectifs/stress/', label: 'Stress', note: 'Profil du stress, niveau de preuve et tolérance' },
          { href: '/fr/objectifs/anxiete/', label: 'Anxiété', note: 'Données, sédation, sécurité et limites' },
          { href: '/fr/objectifs/concentration/', label: 'Concentration', note: 'Attention, stimulation, sommeil et compromis' },
        ],
      },
      {
        title: 'Explorez la bibliothèque',
        body:
          'Nous séparons les données cliniques des mécanismes et gardons les avertissements de sécurité visibles. Les profils scientifiques détaillés seront traduits progressivement, sans masquer lorsqu’une page reste en anglais.',
        links: [
          { href: '/fr/plantes/', label: 'Plantes', note: 'Données, mécanismes et sécurité' },
          { href: '/fr/composes/', label: 'Composés et compléments', note: 'Données, doses et interactions' },
        ],
      },
      {
        title: 'Préserver le sens scientifique',
        body:
          'Une traduction doit conserver le degré de certitude, les limites, les interactions et le contexte des données originales. Une hypothèse prometteuse ne devient pas un bénéfice démontré parce qu’elle est traduite.',
        links: [
          { href: '/fr/methodologie/', label: 'Comment nous évaluons les preuves' },
          { href: '/fr/securite/', label: 'Sécurité et interactions' },
        ],
      },
    ],
    primaryCta: { href: '/fr/objectifs/', label: 'Choisir un objectif' },
    secondaryCta: { href: '/', label: 'English version' },
  },
  herbs: {
    path: '/fr/plantes/',
    eyebrow: 'Bibliothèque de recherche',
    title: 'Plantes : preuves, mécanismes et sécurité',
    description:
      'Explorez les plantes selon les données humaines, les mécanismes, les doses, la sécurité et les interactions, en français.',
    intro:
      'Commencez par une plante connue ou par l’objectif qui vous intéresse. Nous privilégions les données humaines et faisons apparaître la sécurité avant toute conclusion pratique.',
    sections: [
      {
        title: 'Comment lire la bibliothèque',
        body:
          'Une plante n’est pas évaluée selon sa popularité. Nous séparons ce qui a été observé chez l’humain de ce qui reste plausible sur la base de mécanismes, de traditions ou de données précliniques.',
        bullets: [
          'Regardez d’abord la qualité et le type de données humaines.',
          'Vérifiez les interactions, contre-indications et le contexte de dose.',
          'Traitez les mécanismes comme un contexte biologique, pas comme une preuve clinique.',
          'Tenez compte de l’incertitude lorsque les études sont petites, mixtes ou indirectes.',
        ],
      },
      {
        title: 'Profils à explorer',
        body: 'Les profils scientifiques complets s’ouvrent encore en anglais pendant la traduction champ par champ.',
        links: [
          { href: '/herbs/ashwagandha/', label: 'Ashwagandha', note: 'Profil détaillé en anglais' },
          { href: '/herbs/rhodiola/', label: 'Rhodiola', note: 'Profil détaillé en anglais' },
          { href: '/herbs/valerian/', label: 'Valériane', note: 'Profil détaillé en anglais' },
          { href: '/herbs/bacopa/', label: 'Bacopa', note: 'Profil détaillé en anglais' },
        ],
      },
    ],
    primaryCta: { href: '/fr/objectifs/', label: 'Rechercher par objectif' },
    secondaryCta: { href: '/herbs/', label: 'Ouvrir la bibliothèque complète en anglais' },
  },
  compounds: {
    path: '/fr/composes/',
    eyebrow: 'Bibliothèque de recherche',
    title: 'Composés et compléments : comparez les preuves',
    description:
      'Explorez composés et compléments selon les preuves, les mécanismes, les doses, la sécurité et les interactions, en français.',
    intro:
      'La bibliothèque organise ce que nous savons, ce que nous ignorons encore et les risques à examiner avant de comparer des options.',
    sections: [
      {
        title: 'Ce que nous privilégions',
        body:
          'Les données cliniques chez l’humain pèsent davantage que les mécanismes isolés ou les arguments marketing. Un signal prometteur n’est pas présenté comme un bénéfice démontré.',
        bullets: [
          'Type et qualité des études chez l’humain.',
          'Cohérence entre études et revues.',
          'Doses étudiées et contexte d’utilisation.',
          'Interactions, contre-indications et effets indésirables pertinents.',
        ],
      },
      {
        title: 'Points de départ',
        body: 'Les profils complets ci-dessous restent en anglais pendant cette phase de traduction.',
        links: [
          { href: '/compounds/magnesium/', label: 'Magnésium', note: 'Profil détaillé en anglais' },
          { href: '/compounds/l-theanine/', label: 'L-théanine', note: 'Profil détaillé en anglais' },
          { href: '/compounds/melatonin/', label: 'Mélatonine', note: 'Profil détaillé en anglais' },
          { href: '/compounds/omega-3/', label: 'Oméga-3', note: 'Profil détaillé en anglais' },
        ],
      },
    ],
    primaryCta: { href: '/fr/objectifs/', label: 'Comparer par objectif' },
    secondaryCta: { href: '/compounds/', label: 'Ouvrir la bibliothèque complète en anglais' },
  },
  goals: {
    path: '/fr/objectifs/',
    eyebrow: 'Commencez par ce que vous voulez améliorer',
    title: 'Explorez les compléments par objectif',
    description:
      'Comparez des options pour le sommeil, le stress, l’anxiété et la concentration selon les preuves, la sécurité, les doses et le contexte.',
    intro:
      'Au lieu de commencer par un ingrédient à la mode, commencez par le résultat qui compte pour vous. Chaque guide aide à réduire les options avant d’ouvrir les profils individuels.',
    sections: [
      {
        title: 'Objectifs principaux',
        body: 'Choisissez un parcours pour voir quelles questions importent avant de comparer les compléments.',
        links: [
          { href: '/fr/objectifs/sommeil/', label: 'Sommeil', note: 'Qualité, horaire et effets le lendemain' },
          { href: '/fr/objectifs/stress/', label: 'Stress', note: 'Profil du stress, durée d’usage et tolérance' },
          { href: '/fr/objectifs/anxiete/', label: 'Anxiété', note: 'Données, sédation, interactions et limites' },
          { href: '/fr/objectifs/concentration/', label: 'Concentration', note: 'Attention, stimulation, sommeil et compromis' },
        ],
      },
      {
        title: 'Comment comparer',
        body:
          'Une option peut être pertinente dans un contexte et mauvaise dans un autre. Comparez les preuves, le délai d’action, la durée, la sécurité, la compatibilité avec les médicaments et la proximité entre la recherche et votre situation.',
      },
    ],
    primaryCta: { href: '/fr/securite/', label: 'Vérifier d’abord la sécurité' },
    secondaryCta: { href: '/goals/', label: 'Voir tous les objectifs en anglais' },
  },
  sleep: {
    path: '/fr/objectifs/sommeil/',
    eyebrow: 'Objectif : sommeil',
    title: 'Compléments pour le sommeil : comment comparer les options',
    description:
      'Comparez les compléments pour le sommeil selon les données humaines, le moment de prise, la durée, les effets le lendemain, les doses et les interactions.',
    intro:
      '« Mieux dormir » peut vouloir dire s’endormir plus vite, se réveiller moins, améliorer la qualité perçue ou éviter la somnolence le lendemain. La comparaison dépend du problème réel.',
    sections: [
      {
        title: 'Questions qui changent la décision',
        body: 'Avant de choisir un ingrédient, précisez l’aspect du sommeil que vous cherchez à améliorer.',
        bullets: [
          'Le problème principal concerne-t-il l’endormissement ou le maintien du sommeil ?',
          'Faut-il éviter la sédation ou le ralentissement le lendemain ?',
          'Prenez-vous des médicaments ou compléments ayant des effets sédatifs ?',
          'Les études portent-elles sur une situation comparable à la vôtre ?',
        ],
      },
      {
        title: 'Profils à explorer',
        body: 'Les profils scientifiques détaillés sont encore en anglais pendant cette phase.',
        links: [
          { href: '/compounds/melatonin/', label: 'Mélatonine', note: 'Profil détaillé en anglais' },
          { href: '/compounds/magnesium/', label: 'Magnésium', note: 'Profil détaillé en anglais' },
          { href: '/compounds/l-theanine/', label: 'L-théanine', note: 'Profil détaillé en anglais' },
          { href: '/herbs/valerian/', label: 'Valériane', note: 'Profil détaillé en anglais' },
        ],
      },
    ],
    primaryCta: { href: '/fr/securite/', label: 'Vérifier la sécurité' },
    secondaryCta: { href: '/goals/sleep/', label: 'Ouvrir le guide complet en anglais' },
  },
  stress: {
    path: '/fr/objectifs/stress/',
    eyebrow: 'Objectif : stress',
    title: 'Stress : comparer sans confondre mécanisme et preuve',
    description:
      'Comparez les compléments pour le stress selon les données humaines, le profil des symptômes, la durée d’usage, la sécurité, les doses et les interactions.',
    intro:
      'Le stress n’est pas une expérience unique. L’intérêt d’une option dépend de la recherche d’un apaisement aigu, d’un soutien pendant une période exigeante ou d’une stratégie qui ne gêne pas l’énergie et la concentration.',
    sections: [
      {
        title: 'Ce qu’il faut distinguer',
        body:
          'De nombreux produits utilisent le langage des « adaptogènes » ou du cortisol. Ces termes ne remplacent pas des essais cliniques et ne prouvent pas qu’une option convient à une personne donnée.',
        bullets: [
          'Effets ressentis versus modifications de biomarqueurs.',
          'Usage ponctuel versus usage pendant plusieurs semaines.',
          'Apaisement utile versus sédation indésirable.',
          'Bénéfice potentiel versus interactions et contre-indications.',
        ],
      },
      {
        title: 'Profils à explorer',
        body: 'Les profils complets ci-dessous restent en anglais.',
        links: [
          { href: '/herbs/ashwagandha/', label: 'Ashwagandha', note: 'Profil détaillé en anglais' },
          { href: '/herbs/rhodiola/', label: 'Rhodiola', note: 'Profil détaillé en anglais' },
          { href: '/compounds/l-theanine/', label: 'L-théanine', note: 'Profil détaillé en anglais' },
          { href: '/compounds/magnesium/', label: 'Magnésium', note: 'Profil détaillé en anglais' },
        ],
      },
    ],
    primaryCta: { href: '/fr/securite/', label: 'Vérifier la sécurité' },
    secondaryCta: { href: '/goals/stress/', label: 'Ouvrir le guide complet en anglais' },
  },
  anxiety: {
    path: '/fr/objectifs/anxiete/',
    eyebrow: 'Objectif : anxiété',
    title: 'Anxiété : preuves et sécurité avant les promesses rapides',
    description:
      'Comparez les compléments étudiés pour l’anxiété selon la qualité des données, la sédation, les doses, les interactions et l’incertitude.',
    intro:
      'Pour l’anxiété, un petit signal ne doit pas devenir une grande promesse. La priorité est de distinguer les données cliniques des mécanismes théoriques et de garder les précautions visibles.',
    sections: [
      {
        title: 'Ce qu’il faut regarder d’abord',
        body: 'La qualité de l’étude, la population étudiée et l’ampleur de l’effet comptent autant que le nom de l’ingrédient.',
        bullets: [
          'Existe-t-il des essais contrôlés chez l’humain ou seulement des données indirectes ?',
          'Les résultats sont-ils cohérents entre les études ?',
          'Le produit peut-il provoquer une sédation ou s’ajouter à d’autres dépresseurs du système nerveux ?',
          'Existe-t-il des interactions pertinentes avec des médicaments ?',
        ],
      },
      {
        title: 'Profils à explorer',
        body: 'Les profils complets ci-dessous restent en anglais.',
        links: [
          { href: '/compounds/l-theanine/', label: 'L-théanine', note: 'Profil détaillé en anglais' },
          { href: '/herbs/ashwagandha/', label: 'Ashwagandha', note: 'Profil détaillé en anglais' },
          { href: '/herbs/valerian/', label: 'Valériane', note: 'Profil détaillé en anglais' },
          { href: '/compounds/magnesium/', label: 'Magnésium', note: 'Profil détaillé en anglais' },
        ],
      },
    ],
    primaryCta: { href: '/fr/securite/', label: 'Vérifier la sécurité' },
    secondaryCta: { href: '/goals/anxiety/', label: 'Ouvrir le guide complet en anglais' },
  },
  focus: {
    path: '/fr/objectifs/concentration/',
    eyebrow: 'Objectif : concentration',
    title: 'Concentration : comparez bénéfices, stimulation et compromis',
    description:
      'Comparez les compléments pour la concentration selon les données humaines, la stimulation, la durée, le sommeil, la tolérance, les doses et les interactions.',
    intro:
      'Davantage de stimulation ne signifie pas toujours une meilleure concentration. Une comparaison utile considère l’attention, la fatigue, le sommeil, la tolérance et la qualité réelle des données.',
    sections: [
      {
        title: 'Questions utiles',
        body:
          'Précisez si vous cherchez plus d’éveil, d’endurance mentale, moins de distraction ou un soutien en période de fatigue. Ce sont des objectifs différents et les études ne mesurent pas toujours la même chose.',
        bullets: [
          'Les données mesurent-elles l’attention objectivement ou seulement un ressenti subjectif ?',
          'L’ingrédient est-il stimulant et peut-il perturber le sommeil ?',
          'Existe-t-il une tolérance, un rebond ou des interactions à prendre en compte ?',
          'La dose étudiée correspond-elle à la forme du produit comparé ?',
        ],
      },
      {
        title: 'Profils à explorer',
        body: 'Les profils complets ci-dessous restent en anglais.',
        links: [
          { href: '/compounds/caffeine/', label: 'Caféine', note: 'Profil détaillé en anglais' },
          { href: '/compounds/l-theanine/', label: 'L-théanine', note: 'Profil détaillé en anglais' },
          { href: '/herbs/rhodiola/', label: 'Rhodiola', note: 'Profil détaillé en anglais' },
          { href: '/herbs/bacopa/', label: 'Bacopa', note: 'Profil détaillé en anglais' },
        ],
      },
    ],
    primaryCta: { href: '/fr/securite/', label: 'Vérifier la sécurité' },
    secondaryCta: { href: '/goals/focus/', label: 'Ouvrir le guide complet en anglais' },
  },
  methodology: {
    path: '/fr/methodologie/',
    eyebrow: 'Notre méthode',
    title: 'Méthodologie : comment nous évaluons les preuves',
    description:
      'Découvrez comment The Hippie Scientist distingue données humaines, mécanismes, sécurité et limites de la recherche pour évaluer les compléments.',
    intro:
      'Le but n’est pas de trouver une raison de recommander chaque ingrédient. Il est de représenter fidèlement la force des preuves, les questions ouvertes et les risques importants.',
    sections: [
      { title: '1. Les données humaines d’abord', body: 'Les essais et études chez l’humain sont prioritaires pour évaluer les résultats humains. Les études cellulaires et animales éclairent des hypothèses, mais ne sont pas présentées comme des bénéfices cliniques démontrés.' },
      { title: '2. Séparer mécanisme et résultat', body: 'Une voie biologique plausible peut expliquer pourquoi une intervention mérite d’être étudiée. Elle ne suffit pas, à elle seule, à démontrer son efficacité.' },
      { title: '3. La sécurité avant le verdict', body: 'Interactions, contre-indications, effets indésirables et contexte de dose restent visibles même lorsque les données de bénéfice semblent prometteuses.' },
      { title: '4. Une incertitude explicite', body: 'Résultats mixtes, petits échantillons, dépendance excessive à une seule étude et preuves indirectes réduisent la confiance. Cette incertitude doit rester présente dans le langage éditorial.' },
    ],
    primaryCta: { href: '/info/methodology/', label: 'Voir la méthodologie complète en anglais' },
    secondaryCta: { href: '/fr/securite/', label: 'Voir notre approche de la sécurité' },
  },
  safety: {
    path: '/fr/securite/',
    eyebrow: 'La sécurité d’abord',
    title: 'Sécurité des compléments et interactions',
    description:
      'Vérifiez interactions, contre-indications, sédation, effets cumulés et contexte de dose avant d’associer plantes ou compléments.',
    intro:
      'Le fait qu’un produit soit « naturel » ne signifie pas qu’il soit neutre. La sécurité dépend de la dose, des médicaments, des pathologies, de la grossesse, des associations et d’autres facteurs individuels.',
    sections: [
      {
        title: 'Avant d’associer plusieurs produits',
        body: 'Recherchez les risques cumulés, pas seulement les avertissements isolés de chaque ingrédient.',
        bullets: [
          'Effets sédatifs susceptibles de s’additionner.',
          'Modifications possibles de la tension artérielle, de la glycémie ou de la coagulation.',
          'Ingrédients répétés dans plusieurs produits.',
          'Interactions avec les médicaments et les pathologies.',
          'Doses ou formes d’ingrédients différentes de celles étudiées.',
        ],
      },
      {
        title: 'Outils actuels',
        body: 'Les outils interactifs détaillés restent en anglais à ce stade, mais peuvent aider à identifier les questions de sécurité à confirmer avec un professionnel de santé.',
        links: [
          { href: '/safety-checker/', label: 'Vérificateur d’interactions', note: 'Outil en anglais' },
          { href: '/info/supplement-safety-checklist/', label: 'Liste de contrôle de sécurité', note: 'Guide en anglais' },
        ],
      },
    ],
    primaryCta: { href: '/safety-checker/', label: 'Ouvrir le vérificateur en anglais' },
    secondaryCta: { href: '/fr/methodologie/', label: 'Comment nous évaluons les preuves' },
  },
} as const satisfies Record<string, LocalizedPageData>

export type FrenchPageKey = keyof typeof FRENCH_PAGES

export const FRENCH_ROUTE_KEYS: Record<string, FrenchPageKey> = {
  'plantes': 'herbs',
  'composes': 'compounds',
  'objectifs': 'goals',
  'objectifs/sommeil': 'sleep',
  'objectifs/stress': 'stress',
  'objectifs/anxiete': 'anxiety',
  'objectifs/concentration': 'focus',
  'methodologie': 'methodology',
  'securite': 'safety',
}

export function buildFrenchPageMetadata(page: LocalizedPageData) {
  return buildLocalizedPageMetadata(page, {
    openGraphLocale: FRENCH_OG_LOCALE,
    alternateOpenGraphLocales: [DEFAULT_OG_LOCALE],
  })
}
