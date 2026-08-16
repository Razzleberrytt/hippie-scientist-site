import {
  DEFAULT_LOCALE,
  FRENCH_LOCALE,
  GERMAN_LOCALE,
  PORTUGUESE_LOCALE,
  SPANISH_LOCALE,
  type SupportedLocale,
} from './international-seo'

export type LocalizedChromeConfig = {
  locale: SupportedLocale
  languageLabel: string
  homeHref: string
  navAriaLabel: string
  sectionsAriaLabel: string
  links: readonly { href: string; label: string }[]
  footerDescription: string
  footerAriaLabel: string
  footerDisclaimer: string
  skipLabel: string
}

export const LOCALIZED_CHROME: Record<SupportedLocale, LocalizedChromeConfig> = {
  [DEFAULT_LOCALE]: {
    locale: DEFAULT_LOCALE,
    languageLabel: 'English',
    homeHref: '/',
    navAriaLabel: 'Main navigation',
    sectionsAriaLabel: 'Site sections',
    links: [],
    footerDescription: '',
    footerAriaLabel: 'Footer links',
    footerDisclaimer: '',
    skipLabel: 'Skip to main content',
  },
  [SPANISH_LOCALE]: {
    locale: SPANISH_LOCALE,
    languageLabel: 'Español',
    homeHref: '/es/',
    navAriaLabel: 'Navegación principal',
    sectionsAriaLabel: 'Secciones en español',
    links: [
      { href: '/es/hierbas/', label: 'Hierbas' },
      { href: '/es/compuestos/', label: 'Compuestos' },
      { href: '/es/objetivos/', label: 'Objetivos' },
      { href: '/es/metodologia/', label: 'Metodología' },
      { href: '/es/seguridad/', label: 'Seguridad' },
    ],
    footerDescription: 'Referencia educativa basada en evidencia para investigar hierbas, suplementos y compuestos con la seguridad y la incertidumbre siempre visibles.',
    footerAriaLabel: 'Enlaces del pie de página',
    footerDisclaimer: 'Información educativa, no consejo médico. Para decisiones personales de salud, consulta a un profesional sanitario cualificado.',
    skipLabel: 'Saltar al contenido principal',
  },
  [PORTUGUESE_LOCALE]: {
    locale: PORTUGUESE_LOCALE,
    languageLabel: 'Português',
    homeHref: '/pt/',
    navAriaLabel: 'Navegação principal',
    sectionsAriaLabel: 'Seções em português',
    links: [
      { href: '/pt/ervas/', label: 'Ervas' },
      { href: '/pt/compostos/', label: 'Compostos' },
      { href: '/pt/objetivos/', label: 'Objetivos' },
      { href: '/pt/metodologia/', label: 'Metodologia' },
      { href: '/pt/seguranca/', label: 'Segurança' },
    ],
    footerDescription: 'Referência educacional baseada em evidências para pesquisar ervas, suplementos e compostos mantendo segurança e incerteza sempre visíveis.',
    footerAriaLabel: 'Links do rodapé',
    footerDisclaimer: 'Informação educacional, não aconselhamento médico. Para decisões pessoais de saúde, consulte um profissional de saúde qualificado.',
    skipLabel: 'Pular para o conteúdo principal',
  },
  [FRENCH_LOCALE]: {
    locale: FRENCH_LOCALE,
    languageLabel: 'Français',
    homeHref: '/fr/',
    navAriaLabel: 'Navigation principale',
    sectionsAriaLabel: 'Sections en français',
    links: [
      { href: '/fr/plantes/', label: 'Plantes' },
      { href: '/fr/composes/', label: 'Composés' },
      { href: '/fr/objectifs/', label: 'Objectifs' },
      { href: '/fr/methodologie/', label: 'Méthodologie' },
      { href: '/fr/securite/', label: 'Sécurité' },
    ],
    footerDescription: 'Référence éducative fondée sur les preuves pour étudier plantes, compléments et composés en gardant la sécurité et l’incertitude visibles.',
    footerAriaLabel: 'Liens du pied de page',
    footerDisclaimer: 'Information éducative, pas un avis médical. Pour les décisions de santé personnelles, consultez un professionnel de santé qualifié.',
    skipLabel: 'Aller au contenu principal',
  },
  [GERMAN_LOCALE]: {
    locale: GERMAN_LOCALE,
    languageLabel: 'Deutsch',
    homeHref: '/de/',
    navAriaLabel: 'Hauptnavigation',
    sectionsAriaLabel: 'Bereiche auf Deutsch',
    links: [
      { href: '/de/kraeuter/', label: 'Kräuter' },
      { href: '/de/wirkstoffe/', label: 'Wirkstoffe' },
      { href: '/de/ziele/', label: 'Ziele' },
      { href: '/de/methodik/', label: 'Methodik' },
      { href: '/de/sicherheit/', label: 'Sicherheit' },
    ],
    footerDescription: 'Evidenzbasierte Bildungsreferenz zu Kräutern, Supplementen und Wirkstoffen, bei der Sicherheit und Unsicherheit sichtbar bleiben.',
    footerAriaLabel: 'Links im Seitenfuß',
    footerDisclaimer: 'Bildungsinformation, keine medizinische Beratung. Für persönliche Gesundheitsentscheidungen wenden Sie sich an qualifiziertes medizinisches Fachpersonal.',
    skipLabel: 'Zum Hauptinhalt springen',
  },
}

export function getLocaleFromPathname(pathname: string | null | undefined): SupportedLocale {
  const path = pathname || '/'
  if (path === '/es' || path.startsWith('/es/')) return SPANISH_LOCALE
  if (path === '/pt' || path.startsWith('/pt/')) return PORTUGUESE_LOCALE
  if (path === '/fr' || path.startsWith('/fr/')) return FRENCH_LOCALE
  if (path === '/de' || path.startsWith('/de/')) return GERMAN_LOCALE
  return DEFAULT_LOCALE
}

export function isTranslatedPath(pathname: string | null | undefined): boolean {
  return getLocaleFromPathname(pathname) !== DEFAULT_LOCALE
}
