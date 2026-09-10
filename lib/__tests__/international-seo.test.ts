import { describe, expect, it } from 'vitest'
import { DEFAULT_LOCALE, DEFAULT_LANGUAGE, DEFAULT_REGION, HINDI_LOCALE, INDONESIAN_LOCALE, CHINESE_LOCALE, TURKISH_LOCALE, ARABIC_LOCALE, RUSSIAN_LOCALE, VIETNAMESE_LOCALE, THAI_LOCALE, SWEDISH_LOCALE, LOCALIZED_ROUTE_PAIRS, LOCALIZED_ROUTES, LOCALE_TEXT_DIRECTION, SPANISH_LOCALE, SUPPORTED_LOCALES, buildDefaultLocaleUrl, getCurrentLocaleAlternates, getLocaleFromPathname, getLocaleMetadata, getLocalizedRoute, normalizeInternationalPath } from '../international-seo'
import { shouldIndexRoute } from '../seo'

describe('international SEO helpers', () => {
  it('declares English as the default and every published translation as supported', () => {
    expect(DEFAULT_LOCALE).toBe('en-US')
    expect(DEFAULT_LANGUAGE).toBe('en')
    expect(DEFAULT_REGION).toBe('US')
    expect(LOCALE_TEXT_DIRECTION).toBe('ltr')
    expect(SPANISH_LOCALE).toBe('es')
    expect(HINDI_LOCALE).toBe('hi')
    expect(INDONESIAN_LOCALE).toBe('id')
    expect(CHINESE_LOCALE).toBe('zh-CN')
    expect(TURKISH_LOCALE).toBe('tr')
    expect(ARABIC_LOCALE).toBe('ar')
    expect(RUSSIAN_LOCALE).toBe('ru')
    expect(VIETNAMESE_LOCALE).toBe('vi')
    expect(THAI_LOCALE).toBe('th')
    expect(SWEDISH_LOCALE).toBe('sv')
    expect(SUPPORTED_LOCALES).toEqual(['en-US', 'es', 'pt-BR', 'fr', 'de', 'it', 'nl', 'pl', 'ja', 'ko', 'hi', 'id', 'zh-CN', 'tr', 'ar', 'ru', 'vi', 'th', 'sv'])
  })

  it('normalizes paths for locale alternates without query strings', () => {
    expect(normalizeInternationalPath('/guides/sleep?utm_source=test')).toBe('/guides/sleep/')
    expect(normalizeInternationalPath('/robots.txt')).toBe('/robots.txt')
  })

  it('detects locale prefixes from the canonical locale registry', () => {
    expect(getLocaleFromPathname('/')).toBe('en-US')
    expect(getLocaleFromPathname('/pt')).toBe('pt-BR')
    expect(getLocaleFromPathname('/ja/goals/sleep/')).toBe('ja')
    expect(getLocaleFromPathname('/ko/safety/')).toBe('ko')
    expect(getLocaleFromPathname('/hi/goals/sleep/')).toBe('hi')
    expect(getLocaleFromPathname('/id/goals/sleep/')).toBe('id')
    expect(getLocaleFromPathname('/zh/mubiao/shuimian/')).toBe('zh-CN')
    expect(getLocaleFromPathname('/tr/hedefler/uyku/')).toBe('tr')
    expect(getLocaleFromPathname('/ar/ahdaf/nom/')).toBe('ar')
    expect(getLocaleFromPathname('/ru/celi/son/')).toBe('ru')
    expect(getLocaleFromPathname('/vi/muc-tieu/ngu/')).toBe('vi')
    expect(getLocaleFromPathname('/th/goals/sleep/')).toBe('th')
    expect(getLocaleFromPathname('/sv/mal/somn/')).toBe('sv')
    expect(getLocaleFromPathname('/herbs/ashwagandha/')).toBe('en-US')
  })

  it('builds translated hreflang pairs for the published herb index', () => {
    expect(getCurrentLocaleAlternates('/herbs/')).toEqual([
      { locale: 'en-US', url: 'https://thehippiescientist.net/herbs/' },
      { locale: 'es', url: 'https://thehippiescientist.net/es/hierbas/' },
      { locale: 'pt-BR', url: 'https://thehippiescientist.net/pt/ervas/' },
      { locale: 'fr', url: 'https://thehippiescientist.net/fr/plantes/' },
      { locale: 'de', url: 'https://thehippiescientist.net/de/kraeuter/' },
      { locale: 'it', url: 'https://thehippiescientist.net/it/erbe/' },
      { locale: 'nl', url: 'https://thehippiescientist.net/nl/kruiden/' },
      { locale: 'pl', url: 'https://thehippiescientist.net/pl/ziola/' },
      { locale: 'ja', url: 'https://thehippiescientist.net/ja/herbs/' },
      { locale: 'ko', url: 'https://thehippiescientist.net/ko/herbs/' },
      { locale: 'hi', url: 'https://thehippiescientist.net/hi/herbs/' },
      { locale: 'id', url: 'https://thehippiescientist.net/id/herbs/' },
      { locale: 'zh-CN', url: 'https://thehippiescientist.net/zh/herbs/' },
      { locale: 'tr', url: 'https://thehippiescientist.net/tr/bitkiler/' },
      { locale: 'ar', url: 'https://thehippiescientist.net/ar/herbs/' },
      { locale: 'ru', url: 'https://thehippiescientist.net/ru/travy/' },
      { locale: 'vi', url: 'https://thehippiescientist.net/vi/thao-duoc/' },
      { locale: 'th', url: 'https://thehippiescientist.net/th/herbs/' },
      { locale: 'sv', url: 'https://thehippiescientist.net/sv/orter/' },
      { locale: 'x-default', url: 'https://thehippiescientist.net/herbs/' },
    ])
  })

  it('resolves translated routes in both directions and fails closed for unpublished profile locales', () => {
    expect(getLocalizedRoute('/herbs/', 'es')).toBe('/es/hierbas/')
    expect(getLocalizedRoute('/es/hierbas/', 'en-US')).toBe('/herbs/')
    expect(getLocalizedRoute('/goals/sleep', 'es')).toBe('/es/objetivos/sueno/')
    expect(getLocalizedRoute('/herbs/', 'it')).toBe('/it/erbe/')
    expect(getLocalizedRoute('/nl/doelen/slaap/', 'en-US')).toBe('/goals/sleep/')
    expect(getLocalizedRoute('/goals/anxiety/', 'pl')).toBe('/pl/cele/lek/')
    expect(getLocalizedRoute('/goals/focus/', 'ja')).toBe('/ja/goals/focus/')
    expect(getLocalizedRoute('/ko/goals/sleep/', 'en-US')).toBe('/goals/sleep/')
    expect(getLocalizedRoute('/hi/goals/sleep/', 'en-US')).toBe('/goals/sleep/')
    expect(getLocalizedRoute('/id/goals/sleep/', 'en-US')).toBe('/goals/sleep/')
    expect(getLocalizedRoute('/zh/mubiao/shuimian/', 'en-US')).toBe('/goals/sleep/')
    expect(getLocalizedRoute('/tr/hedefler/uyku/', 'en-US')).toBe('/goals/sleep/')
    expect(getLocalizedRoute('/ar/ahdaf/nom/', 'en-US')).toBe('/goals/sleep/')
    expect(getLocalizedRoute('/ru/celi/son/', 'en-US')).toBe('/goals/sleep/')
    expect(getLocalizedRoute('/vi/muc-tieu/ngu/', 'en-US')).toBe('/goals/sleep/')
    expect(getLocalizedRoute('/th/goals/sleep/', 'en-US')).toBe('/goals/sleep/')
    expect(getLocalizedRoute('/sv/mal/somn/', 'en-US')).toBe('/goals/sleep/')
    expect(getLocalizedRoute('/herbs/ashwagandha/', 'it')).toBeNull()
    expect(getLocalizedRoute('/compounds/l-theanine/', 'ja')).toBeNull()
    expect(getLocalizedRoute('/herbs/ashwagandha/', 'ko')).toBeNull()
  })

  it('builds the default locale homepage URL', () => {
    expect(buildDefaultLocaleUrl('/')).toBe('https://thehippiescientist.net/')
  })

  it('exposes locale metadata for every language version', () => {
    expect(getLocaleMetadata('/').alternates).toHaveLength(SUPPORTED_LOCALES.length + 1)
    expect(getLocaleMetadata('/').openGraphLocale).toBe('en_US')
    expect(getLocaleMetadata('/es/', 'es').openGraphLocale).toBe('es_ES')
    expect(getLocaleMetadata('/it/', 'it').openGraphLocale).toBe('it_IT')
    expect(getLocaleMetadata('/nl/', 'nl').openGraphLocale).toBe('nl_NL')
    expect(getLocaleMetadata('/pl/', 'pl').openGraphLocale).toBe('pl_PL')
    expect(getLocaleMetadata('/ja/', 'ja').openGraphLocale).toBe('ja_JP')
    expect(getLocaleMetadata('/ko/', 'ko').openGraphLocale).toBe('ko_KR')
    expect(getLocaleMetadata('/hi/', 'hi').openGraphLocale).toBe('hi_IN')
    expect(getLocaleMetadata('/id/', 'id').openGraphLocale).toBe('id_ID')
    expect(getLocaleMetadata('/zh/', 'zh-CN').openGraphLocale).toBe('zh_CN')
    expect(getLocaleMetadata('/tr/', 'tr').openGraphLocale).toBe('tr_TR')
    expect(getLocaleMetadata('/ar/', 'ar').openGraphLocale).toBe('ar_SA')
    expect(getLocaleMetadata('/ru/', 'ru').openGraphLocale).toBe('ru_RU')
    expect(getLocaleMetadata('/vi/', 'vi').openGraphLocale).toBe('vi_VN')
    expect(getLocaleMetadata('/th/', 'th').openGraphLocale).toBe('th_TH')
    expect(getLocaleMetadata('/sv/', 'sv').openGraphLocale).toBe('sv_SE')
    expect(getLocaleMetadata('/ar/').textDirection).toBe('rtl')
  })

  it('keeps every published translation indexable, in every locale', () => {
    for (const route of LOCALIZED_ROUTES) {
      for (const translated of Object.values(route.translations)) {
        if (!translated) continue
        const decision = shouldIndexRoute(translated)
        expect(decision.index, `${translated} should be indexable`).toBe(true)
        expect(decision.follow).toBe(true)
      }
    }
  })

  it('does not contain duplicate translation paths', () => {
    const english = LOCALIZED_ROUTE_PAIRS.map((pair) => pair.english)
    const spanish = LOCALIZED_ROUTE_PAIRS.map((pair) => pair.spanish)
    expect(new Set(english).size).toBe(english.length)
    expect(new Set(spanish).size).toBe(spanish.length)
  })
})
