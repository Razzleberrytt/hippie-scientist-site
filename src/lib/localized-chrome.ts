import {
  DEFAULT_LOCALE,
  DUTCH_LOCALE,
  FRENCH_LOCALE,
  GERMAN_LOCALE,
  ITALIAN_LOCALE,
  POLISH_LOCALE,
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
  languagesAriaLabel: string
  equivalentPageLabel: string
  scrollTopLabel: string
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
    languagesAriaLabel: 'Languages',
    equivalentPageLabel: 'equivalent page',
    scrollTopLabel: 'Scroll to top',
    links: [],
    footerDescription: '',
    footerAriaLabel: 'Footer links',
    footerDisclaimer: '',
    skipLabel: 'Skip to main content',
  },
  [SPANISH_LOCALE]: {
    locale: SPANISH_LOCALE, languageLabel: 'Español', homeHref: '/es/', navAriaLabel: 'Navegación principal', sectionsAriaLabel: 'Secciones en español', languagesAriaLabel: 'Idiomas', equivalentPageLabel: 'página equivalente', scrollTopLabel: 'Volver arriba',
    links: [{ href: '/es/hierbas/', label: 'Hierbas' }, { href: '/es/compuestos/', label: 'Compuestos' }, { href: '/es/objetivos/', label: 'Objetivos' }, { href: '/es/metodologia/', label: 'Metodología' }, { href: '/es/seguridad/', label: 'Seguridad' }],
    footerDescription: 'Referencia educativa basada en evidencia para investigar hierbas, suplementos y compuestos con la seguridad y la incertidumbre siempre visibles.', footerAriaLabel: 'Enlaces del pie de página', footerDisclaimer: 'Información educativa, no consejo médico. Para decisiones personales de salud, consulta a un profesional sanitario cualificado.', skipLabel: 'Saltar al contenido principal',
  },
  [PORTUGUESE_LOCALE]: {
    locale: PORTUGUESE_LOCALE, languageLabel: 'Português', homeHref: '/pt/', navAriaLabel: 'Navegação principal', sectionsAriaLabel: 'Seções em português', languagesAriaLabel: 'Idiomas', equivalentPageLabel: 'página equivalente', scrollTopLabel: 'Voltar ao topo',
    links: [{ href: '/pt/ervas/', label: 'Ervas' }, { href: '/pt/compostos/', label: 'Compostos' }, { href: '/pt/objetivos/', label: 'Objetivos' }, { href: '/pt/metodologia/', label: 'Metodologia' }, { href: '/pt/seguranca/', label: 'Segurança' }],
    footerDescription: 'Referência educacional baseada em evidências para pesquisar ervas, suplementos e compostos mantendo segurança e incerteza sempre visíveis.', footerAriaLabel: 'Links do rodapé', footerDisclaimer: 'Informação educacional, não aconselhamento médico. Para decisões pessoais de saúde, consulte um profissional de saúde qualificado.', skipLabel: 'Pular para o conteúdo principal',
  },
  [FRENCH_LOCALE]: {
    locale: FRENCH_LOCALE, languageLabel: 'Français', homeHref: '/fr/', navAriaLabel: 'Navigation principale', sectionsAriaLabel: 'Sections en français', languagesAriaLabel: 'Langues', equivalentPageLabel: 'page équivalente', scrollTopLabel: 'Retour en haut',
    links: [{ href: '/fr/plantes/', label: 'Plantes' }, { href: '/fr/composes/', label: 'Composés' }, { href: '/fr/objectifs/', label: 'Objectifs' }, { href: '/fr/methodologie/', label: 'Méthodologie' }, { href: '/fr/securite/', label: 'Sécurité' }],
    footerDescription: 'Référence éducative fondée sur les preuves pour étudier plantes, compléments et composés en gardant la sécurité et l’incertitude visibles.', footerAriaLabel: 'Liens du pied de page', footerDisclaimer: 'Information éducative, pas un avis médical. Pour les décisions de santé personnelles, consultez un professionnel de santé qualifié.', skipLabel: 'Aller au contenu principal',
  },
  [GERMAN_LOCALE]: {
    locale: GERMAN_LOCALE, languageLabel: 'Deutsch', homeHref: '/de/', navAriaLabel: 'Hauptnavigation', sectionsAriaLabel: 'Bereiche auf Deutsch', languagesAriaLabel: 'Sprachen', equivalentPageLabel: 'entsprechende Seite', scrollTopLabel: 'Zum Seitenanfang',
    links: [{ href: '/de/kraeuter/', label: 'Kräuter' }, { href: '/de/wirkstoffe/', label: 'Wirkstoffe' }, { href: '/de/ziele/', label: 'Ziele' }, { href: '/de/methodik/', label: 'Methodik' }, { href: '/de/sicherheit/', label: 'Sicherheit' }],
    footerDescription: 'Evidenzbasierte Bildungsreferenz zu Kräutern, Supplementen und Wirkstoffen, bei der Sicherheit und Unsicherheit sichtbar bleiben.', footerAriaLabel: 'Links im Seitenfuß', footerDisclaimer: 'Bildungsinformation, keine medizinische Beratung. Für persönliche Gesundheitsentscheidungen wenden Sie sich an qualifiziertes medizinisches Fachpersonal.', skipLabel: 'Zum Hauptinhalt springen',
  },
  [ITALIAN_LOCALE]: {
    locale: ITALIAN_LOCALE, languageLabel: 'Italiano', homeHref: '/it/', navAriaLabel: 'Navigazione principale', sectionsAriaLabel: 'Sezioni in italiano', languagesAriaLabel: 'Lingue', equivalentPageLabel: 'pagina equivalente', scrollTopLabel: 'Torna all’inizio',
    links: [{ href: '/it/erbe/', label: 'Erbe' }, { href: '/it/composti/', label: 'Composti' }, { href: '/it/obiettivi/', label: 'Obiettivi' }, { href: '/it/metodologia/', label: 'Metodologia' }, { href: '/it/sicurezza/', label: 'Sicurezza' }],
    footerDescription: 'Riferimento educativo basato sulle prove per studiare erbe, integratori e composti mantenendo visibili sicurezza e incertezza.', footerAriaLabel: 'Link del piè di pagina', footerDisclaimer: 'Informazioni educative, non consulenza medica. Per decisioni personali sulla salute, rivolgiti a un professionista sanitario qualificato.', skipLabel: 'Vai al contenuto principale',
  },
  [DUTCH_LOCALE]: {
    locale: DUTCH_LOCALE, languageLabel: 'Nederlands', homeHref: '/nl/', navAriaLabel: 'Hoofdnavigatie', sectionsAriaLabel: 'Nederlandse secties', languagesAriaLabel: 'Talen', equivalentPageLabel: 'overeenkomstige pagina', scrollTopLabel: 'Naar boven',
    links: [{ href: '/nl/kruiden/', label: 'Kruiden' }, { href: '/nl/stoffen/', label: 'Stoffen' }, { href: '/nl/doelen/', label: 'Doelen' }, { href: '/nl/methodologie/', label: 'Methodologie' }, { href: '/nl/veiligheid/', label: 'Veiligheid' }],
    footerDescription: 'Evidence-based educatieve referentie voor kruiden, supplementen en stoffen, met veiligheid en onzekerheid altijd zichtbaar.', footerAriaLabel: 'Voettekstlinks', footerDisclaimer: 'Educatieve informatie, geen medisch advies. Raadpleeg voor persoonlijke gezondheidsbeslissingen een gekwalificeerde zorgprofessional.', skipLabel: 'Ga naar hoofdinhoud',
  },
  [POLISH_LOCALE]: {
    locale: POLISH_LOCALE, languageLabel: 'Polski', homeHref: '/pl/', navAriaLabel: 'Nawigacja główna', sectionsAriaLabel: 'Sekcje po polsku', languagesAriaLabel: 'Języki', equivalentPageLabel: 'odpowiednia strona', scrollTopLabel: 'Wróć na górę',
    links: [{ href: '/pl/ziola/', label: 'Zioła' }, { href: '/pl/skladniki/', label: 'Składniki' }, { href: '/pl/cele/', label: 'Cele' }, { href: '/pl/metodologia/', label: 'Metodologia' }, { href: '/pl/bezpieczenstwo/', label: 'Bezpieczeństwo' }],
    footerDescription: 'Edukacyjne źródło oparte na dowodach do badania ziół, suplementów i składników z wyraźnie pokazanym bezpieczeństwem i niepewnością.', footerAriaLabel: 'Linki w stopce', footerDisclaimer: 'Informacje edukacyjne, nie porada medyczna. W sprawach dotyczących własnego zdrowia skonsultuj się z wykwalifikowanym pracownikiem ochrony zdrowia.', skipLabel: 'Przejdź do głównej treści',
  },
}

export function getLocaleFromPathname(pathname: string | null | undefined): SupportedLocale {
  const path = pathname || '/'
  if (path === '/es' || path.startsWith('/es/')) return SPANISH_LOCALE
  if (path === '/pt' || path.startsWith('/pt/')) return PORTUGUESE_LOCALE
  if (path === '/fr' || path.startsWith('/fr/')) return FRENCH_LOCALE
  if (path === '/de' || path.startsWith('/de/')) return GERMAN_LOCALE
  if (path === '/it' || path.startsWith('/it/')) return ITALIAN_LOCALE
  if (path === '/nl' || path.startsWith('/nl/')) return DUTCH_LOCALE
  if (path === '/pl' || path.startsWith('/pl/')) return POLISH_LOCALE
  return DEFAULT_LOCALE
}

export function isTranslatedPath(pathname: string | null | undefined): boolean {
  return getLocaleFromPathname(pathname) !== DEFAULT_LOCALE
}
