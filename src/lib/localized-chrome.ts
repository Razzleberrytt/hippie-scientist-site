import {
  DEFAULT_LOCALE,
  DUTCH_LOCALE,
  FRENCH_LOCALE,
  GERMAN_LOCALE,
  ITALIAN_LOCALE,
  JAPANESE_LOCALE,
  KOREAN_LOCALE,
  LOCALE_CONFIG,
  POLISH_LOCALE,
  PORTUGUESE_LOCALE,
  SPANISH_LOCALE,
  getLocaleFromPathname as detectLocaleFromPathname,
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

const baseChrome = (locale: SupportedLocale) => ({
  locale,
  languageLabel: LOCALE_CONFIG[locale].languageLabel,
  homeHref: LOCALE_CONFIG[locale].pathPrefix,
})

export const LOCALIZED_CHROME: Record<SupportedLocale, LocalizedChromeConfig> = {
  [DEFAULT_LOCALE]: {
    ...baseChrome(DEFAULT_LOCALE), navAriaLabel: 'Main navigation', sectionsAriaLabel: 'Site sections', languagesAriaLabel: 'Languages', equivalentPageLabel: 'equivalent page', scrollTopLabel: 'Scroll to top', links: [], footerDescription: '', footerAriaLabel: 'Footer links', footerDisclaimer: '', skipLabel: 'Skip to main content',
  },
  [SPANISH_LOCALE]: {
    ...baseChrome(SPANISH_LOCALE), navAriaLabel: 'Navegación principal', sectionsAriaLabel: 'Secciones en español', languagesAriaLabel: 'Idiomas', equivalentPageLabel: 'página equivalente', scrollTopLabel: 'Volver arriba',
    links: [{ href: '/es/hierbas/', label: 'Hierbas' }, { href: '/es/compuestos/', label: 'Compuestos' }, { href: '/es/objetivos/', label: 'Objetivos' }, { href: '/es/metodologia/', label: 'Metodología' }, { href: '/es/seguridad/', label: 'Seguridad' }],
    footerDescription: 'Referencia educativa basada en evidencia para investigar hierbas, suplementos y compuestos con la seguridad y la incertidumbre siempre visibles.', footerAriaLabel: 'Enlaces del pie de página', footerDisclaimer: 'Información educativa, no consejo médico. Para decisiones personales de salud, consulta a un profesional sanitario cualificado.', skipLabel: 'Saltar al contenido principal',
  },
  [PORTUGUESE_LOCALE]: {
    ...baseChrome(PORTUGUESE_LOCALE), navAriaLabel: 'Navegação principal', sectionsAriaLabel: 'Seções em português', languagesAriaLabel: 'Idiomas', equivalentPageLabel: 'página equivalente', scrollTopLabel: 'Voltar ao topo',
    links: [{ href: '/pt/ervas/', label: 'Ervas' }, { href: '/pt/compostos/', label: 'Compostos' }, { href: '/pt/objetivos/', label: 'Objetivos' }, { href: '/pt/metodologia/', label: 'Metodologia' }, { href: '/pt/seguranca/', label: 'Segurança' }],
    footerDescription: 'Referência educacional baseada em evidências para pesquisar ervas, suplementos e compostos mantendo segurança e incerteza sempre visíveis.', footerAriaLabel: 'Links do rodapé', footerDisclaimer: 'Informação educacional, não aconselhamento médico. Para decisões pessoais de saúde, consulte um profissional de saúde qualificado.', skipLabel: 'Pular para o conteúdo principal',
  },
  [FRENCH_LOCALE]: {
    ...baseChrome(FRENCH_LOCALE), navAriaLabel: 'Navigation principale', sectionsAriaLabel: 'Sections en français', languagesAriaLabel: 'Langues', equivalentPageLabel: 'page équivalente', scrollTopLabel: 'Retour en haut',
    links: [{ href: '/fr/plantes/', label: 'Plantes' }, { href: '/fr/composes/', label: 'Composés' }, { href: '/fr/objectifs/', label: 'Objectifs' }, { href: '/fr/methodologie/', label: 'Méthodologie' }, { href: '/fr/securite/', label: 'Sécurité' }],
    footerDescription: 'Référence éducative fondée sur les preuves pour étudier plantes, compléments et composés en gardant la sécurité et l’incertitude visibles.', footerAriaLabel: 'Liens du pied de page', footerDisclaimer: 'Information éducative, pas un avis médical. Pour les décisions de santé personnelles, consultez un professionnel de santé qualifié.', skipLabel: 'Aller au contenu principal',
  },
  [GERMAN_LOCALE]: {
    ...baseChrome(GERMAN_LOCALE), navAriaLabel: 'Hauptnavigation', sectionsAriaLabel: 'Bereiche auf Deutsch', languagesAriaLabel: 'Sprachen', equivalentPageLabel: 'entsprechende Seite', scrollTopLabel: 'Zum Seitenanfang',
    links: [{ href: '/de/kraeuter/', label: 'Kräuter' }, { href: '/de/wirkstoffe/', label: 'Wirkstoffe' }, { href: '/de/ziele/', label: 'Ziele' }, { href: '/de/methodik/', label: 'Methodik' }, { href: '/de/sicherheit/', label: 'Sicherheit' }],
    footerDescription: 'Evidenzbasierte Bildungsreferenz zu Kräutern, Supplementen und Wirkstoffen, bei der Sicherheit und Unsicherheit sichtbar bleiben.', footerAriaLabel: 'Links im Seitenfuß', footerDisclaimer: 'Bildungsinformation, keine medizinische Beratung. Für persönliche Gesundheitsentscheidungen wenden Sie sich an qualifiziertes medizinisches Fachpersonal.', skipLabel: 'Zum Hauptinhalt springen',
  },
  [ITALIAN_LOCALE]: {
    ...baseChrome(ITALIAN_LOCALE), navAriaLabel: 'Navigazione principale', sectionsAriaLabel: 'Sezioni in italiano', languagesAriaLabel: 'Lingue', equivalentPageLabel: 'pagina equivalente', scrollTopLabel: 'Torna all’inizio',
    links: [{ href: '/it/erbe/', label: 'Erbe' }, { href: '/it/composti/', label: 'Composti' }, { href: '/it/obiettivi/', label: 'Obiettivi' }, { href: '/it/metodologia/', label: 'Metodologia' }, { href: '/it/sicurezza/', label: 'Sicurezza' }],
    footerDescription: 'Riferimento educativo basato sulle prove per studiare erbe, integratori e composti mantenendo visibili sicurezza e incertezza.', footerAriaLabel: 'Link del piè di pagina', footerDisclaimer: 'Informazioni educative, non consulenza medica. Per decisioni personali sulla salute, rivolgiti a un professionista sanitario qualificato.', skipLabel: 'Vai al contenuto principale',
  },
  [DUTCH_LOCALE]: {
    ...baseChrome(DUTCH_LOCALE), navAriaLabel: 'Hoofdnavigatie', sectionsAriaLabel: 'Nederlandse secties', languagesAriaLabel: 'Talen', equivalentPageLabel: 'overeenkomstige pagina', scrollTopLabel: 'Naar boven',
    links: [{ href: '/nl/kruiden/', label: 'Kruiden' }, { href: '/nl/stoffen/', label: 'Stoffen' }, { href: '/nl/doelen/', label: 'Doelen' }, { href: '/nl/methodologie/', label: 'Methodologie' }, { href: '/nl/veiligheid/', label: 'Veiligheid' }],
    footerDescription: 'Evidence-based educatieve referentie voor kruiden, supplementen en stoffen, met veiligheid en onzekerheid altijd zichtbaar.', footerAriaLabel: 'Voettekstlinks', footerDisclaimer: 'Educatieve informatie, geen medisch advies. Raadpleeg voor persoonlijke gezondheidsbeslissingen een gekwalificeerde zorgprofessional.', skipLabel: 'Ga naar hoofdinhoud',
  },
  [POLISH_LOCALE]: {
    ...baseChrome(POLISH_LOCALE), navAriaLabel: 'Nawigacja główna', sectionsAriaLabel: 'Sekcje po polsku', languagesAriaLabel: 'Języki', equivalentPageLabel: 'odpowiednia strona', scrollTopLabel: 'Wróć na górę',
    links: [{ href: '/pl/ziola/', label: 'Zioła' }, { href: '/pl/skladniki/', label: 'Składniki' }, { href: '/pl/cele/', label: 'Cele' }, { href: '/pl/metodologia/', label: 'Metodologia' }, { href: '/pl/bezpieczenstwo/', label: 'Bezpieczeństwo' }],
    footerDescription: 'Edukacyjne źródło oparte na dowodach do badania ziół, suplementów i składników z wyraźnie pokazanym bezpieczeństwem i niepewnością.', footerAriaLabel: 'Linki w stopce', footerDisclaimer: 'Informacje edukacyjne, nie porada medyczna. W sprawach dotyczących własnego zdrowia skonsultuj się z wykwalifikowanym pracownikiem ochrony zdrowia.', skipLabel: 'Przejdź do głównej treści',
  },
  [JAPANESE_LOCALE]: {
    ...baseChrome(JAPANESE_LOCALE), navAriaLabel: 'メインナビゲーション', sectionsAriaLabel: '日本語のセクション', languagesAriaLabel: '言語', equivalentPageLabel: '対応するページ', scrollTopLabel: 'ページ上部へ',
    links: [{ href: '/ja/herbs/', label: 'ハーブ' }, { href: '/ja/compounds/', label: '成分' }, { href: '/ja/goals/', label: '目的' }, { href: '/ja/methodology/', label: '評価方法' }, { href: '/ja/safety/', label: '安全性' }],
    footerDescription: 'エビデンスに基づき、ハーブ、サプリメント、成分を調べるための教育情報です。安全性と不確実性を明確に示します。', footerAriaLabel: 'フッターリンク', footerDisclaimer: '教育目的の情報であり、医療上の助言ではありません。個別の健康判断は資格を持つ医療専門職に相談してください。', skipLabel: 'メインコンテンツへ移動',
  },
  [KOREAN_LOCALE]: {
    ...baseChrome(KOREAN_LOCALE), navAriaLabel: '메인 탐색', sectionsAriaLabel: '한국어 섹션', languagesAriaLabel: '언어', equivalentPageLabel: '해당 페이지', scrollTopLabel: '맨 위로',
    links: [{ href: '/ko/herbs/', label: '허브' }, { href: '/ko/compounds/', label: '성분' }, { href: '/ko/goals/', label: '목표' }, { href: '/ko/methodology/', label: '평가 방법' }, { href: '/ko/safety/', label: '안전성' }],
    footerDescription: '근거를 바탕으로 허브, 보충제, 성분을 조사할 수 있는 교육 자료이며 안전성과 불확실성을 분명하게 표시합니다.', footerAriaLabel: '바닥글 링크', footerDisclaimer: '교육 목적의 정보이며 의학적 조언이 아닙니다. 개인 건강 결정은 자격을 갖춘 의료 전문가와 상의하세요.', skipLabel: '메인 콘텐츠로 이동',
  },
}

export const getLocaleFromPathname = detectLocaleFromPathname

export function isTranslatedPath(pathname: string | null | undefined): boolean {
  return detectLocaleFromPathname(pathname) !== DEFAULT_LOCALE
}
