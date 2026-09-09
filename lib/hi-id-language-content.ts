import type { LocalizedPageData, LocalizedUiCopy } from './localization'
import { buildLocalizedPageMetadata } from './localization'
import { HINDI_OG_LOCALE, INDONESIAN_OG_LOCALE } from './international-seo'

type LocalePack = { prefix: string; language: string; og: string; name: string; english: string; ui: LocalizedUiCopy }
const packs: Record<'hi' | 'id', LocalePack> = {
  hi: { prefix: '/hi', language: 'hi', og: HINDI_OG_LOCALE, name: 'हिन्दी', english: 'English', ui: { translationNotice: 'यह संपादकीय हिन्दी अनुवाद है। जिन विस्तृत वैज्ञानिक प्रोफाइलों की पूरी समीक्षा अभी हिन्दी में नहीं हुई है, उन्हें स्पष्ट रूप से अंग्रेज़ी सामग्री के रूप में दिखाया जाता है।', nextStepLabel: 'अगला कदम', nextStepBody: 'उसी मानक से तुलना जारी रखें: पहले प्रमाण देखें, सुरक्षा को स्पष्ट रखें और अनिश्चितता को छिपाएँ नहीं।', educationDisclaimer: 'यह जानकारी केवल शैक्षिक उद्देश्य के लिए है और व्यक्तिगत चिकित्सकीय मूल्यांकन या पेशेवर सलाह का विकल्प नहीं है।' } },
  id: { prefix: '/id', language: 'id', og: INDONESIAN_OG_LOCALE, name: 'Bahasa Indonesia', english: 'English', ui: { translationNotice: 'Ini adalah terjemahan editorial Bahasa Indonesia. Profil ilmiah terperinci yang belum sepenuhnya ditinjau dalam Bahasa Indonesia ditandai dengan jelas sebagai konten berbahasa Inggris.', nextStepLabel: 'Langkah berikutnya', nextStepBody: 'Lanjutkan perbandingan dengan standar yang sama: periksa bukti terlebih dahulu, tampilkan keamanan dengan jelas, dan jangan menyembunyikan ketidakpastian.', educationDisclaimer: 'Informasi ini hanya untuk tujuan edukasi dan bukan pengganti evaluasi medis individual atau nasihat profesional.' } },
}

const pageCopy = {
  hi: { home: ['पूरक आहार के बारे में अनुमान नहीं, प्रमाण से जानें','मानव अध्ययनों, तंत्र, शोधित मात्रा, सुरक्षा और अंतःक्रियाओं के आधार पर हर्ब्स और सप्लीमेंट्स की तुलना करें।'], herbs: ['हर्ब्स: प्रमाण, तंत्र और सुरक्षा','मानव शोध की गुणवत्ता, शोधित मात्रा, सुरक्षा और अंतःक्रियाओं के आधार पर हर्ब्स को समझें।'], compounds: ['यौगिक और सप्लीमेंट्स: प्रमाण की तुलना','मानव शोध, शोधित मात्रा, सुरक्षा, अंतःक्रियाओं और प्रमाण की गुणवत्ता के आधार पर तुलना करें।'], goals: ['अपने लक्ष्य के आधार पर शोध शुरू करें','नींद, तनाव, चिंता और ध्यान जैसे लक्ष्यों के लिए समान प्रमाण और सुरक्षा मानक अपनाएँ।'], sleep: ['नींद के लिए प्रमाण देखें','नींद से जुड़े विकल्पों की तुलना करते समय मानव परिणाम, मात्रा, सुरक्षा और अनिश्चितता पर ध्यान दें।'], stress: ['तनाव के लिए प्रमाण देखें','तनाव से जुड़े विकल्पों का मूल्यांकन मानव अध्ययनों और सुरक्षा संकेतों के आधार पर करें।'], anxiety: ['चिंता के लिए प्रमाण देखें','चिंता से जुड़े विकल्पों को प्रमाण की गुणवत्ता, सुरक्षा और शोध की सीमाओं के साथ देखें।'], focus: ['ध्यान और फोकस के लिए प्रमाण देखें','फोकस से जुड़े विकल्पों की तुलना मानव परिणामों और वास्तविक शोधित परिस्थितियों के आधार पर करें।'], methodology: ['हम प्रमाण का मूल्यांकन कैसे करते हैं','मानव शोध, परिणामों की संगति, शोधित मात्रा, सुरक्षा और सीमाओं को एक साथ देखते हैं।'], safety: ['सुरक्षा पहले','अंतःक्रियाओं, मतभेदों और अनिश्चितता को किसी भी संभावित लाभ के साथ समान महत्व दें।'] },
  id: { home: ['Teliti suplemen berdasarkan bukti, bukan tebakan','Bandingkan herbal dan suplemen berdasarkan penelitian pada manusia, mekanisme, dosis yang diteliti, keamanan, dan interaksi.'], herbs: ['Herbal: bukti, mekanisme, dan keamanan','Telusuri herbal dengan memprioritaskan kualitas penelitian manusia, dosis yang diteliti, keamanan, dan interaksi.'], compounds: ['Senyawa dan suplemen: bandingkan buktinya','Bandingkan berdasarkan penelitian manusia, dosis yang diteliti, keamanan, interaksi, dan kualitas bukti.'], goals: ['Mulai dari tujuan Anda','Gunakan standar bukti dan keamanan yang sama untuk tidur, stres, kecemasan, dan fokus.'], sleep: ['Periksa bukti untuk tidur','Bandingkan pilihan untuk tidur berdasarkan hasil pada manusia, dosis, keamanan, dan ketidakpastian.'], stress: ['Periksa bukti untuk stres','Nilai pilihan untuk stres berdasarkan penelitian manusia dan sinyal keamanan.'], anxiety: ['Periksa bukti untuk kecemasan','Tinjau pilihan untuk kecemasan bersama kualitas bukti, keamanan, dan keterbatasan penelitian.'], focus: ['Periksa bukti untuk fokus','Bandingkan pilihan fokus berdasarkan hasil pada manusia dan kondisi yang benar-benar diteliti.'], methodology: ['Cara kami menilai bukti','Kami mempertimbangkan penelitian manusia, konsistensi hasil, dosis yang diteliti, keamanan, dan keterbatasan.'], safety: ['Keamanan adalah prioritas','Pertimbangkan interaksi, kontraindikasi, dan ketidakpastian bersama potensi manfaat.'] },
} as const

const routeFor = (locale: 'hi'|'id', key: string) => key === 'sleep' || key === 'stress' || key === 'anxiety' || key === 'focus' ? `${packs[locale].prefix}/goals/${key}/` : `${packs[locale].prefix}/${key}/`

function buildPages(locale: 'hi'|'id') {
  const copy = pageCopy[locale]
  const pack = packs[locale]
  const make = (key: keyof typeof copy, path: string): LocalizedPageData => {
    const [title, description] = copy[key]
    const links = key === 'goals' ? ['sleep','stress','anxiety','focus'].map(k => ({ href: `${pack.prefix}/goals/${k}/`, label: copy[k as keyof typeof copy][0] })) : []
    return { path, eyebrow: `The Hippie Scientist ${pack.name}`, title, description, intro: description, sections: [{ title: locale === 'hi' ? 'इसे कैसे पढ़ें' : 'Cara membacanya', body: locale === 'hi' ? 'लोकप्रिय दावों के बजाय मानव अध्ययनों के परिणाम देखें। शोधित मात्रा को व्यक्तिगत सिफारिश न मानें और सुरक्षा तथा अनिश्चितता को साथ में देखें।' : 'Mulai dari hasil penelitian pada manusia, bukan sekadar klaim populer. Dosis yang diteliti bukan rekomendasi pribadi; pertimbangkan keamanan dan ketidakpastian bersama-sama.', links }], primaryCta: { href: `${pack.prefix}/goals/`, label: locale === 'hi' ? 'लक्ष्य चुनें' : 'Pilih tujuan' }, secondaryCta: { href: '/', label: pack.english } }
  }
  const pages = { home: make('home', `${pack.prefix}/`), herbs: make('herbs', routeFor(locale,'herbs')), compounds: make('compounds', routeFor(locale,'compounds')), goals: make('goals', routeFor(locale,'goals')), sleep: make('sleep', routeFor(locale,'sleep')), stress: make('stress', routeFor(locale,'stress')), anxiety: make('anxiety', routeFor(locale,'anxiety')), focus: make('focus', routeFor(locale,'focus')), methodology: make('methodology', routeFor(locale,'methodology')), safety: make('safety', routeFor(locale,'safety')) } satisfies Record<string, LocalizedPageData>
  return pages
}

export const HINDI_UI = packs.hi.ui
export const INDONESIAN_UI = packs.id.ui
export const HINDI_PAGES = buildPages('hi')
export const INDONESIAN_PAGES = buildPages('id')
export const HINDI_ROUTE_KEYS = { herbs:'herbs', compounds:'compounds', goals:'goals', 'goals/sleep':'sleep', 'goals/stress':'stress', 'goals/anxiety':'anxiety', 'goals/focus':'focus', methodology:'methodology', safety:'safety' } as const
export const INDONESIAN_ROUTE_KEYS = { herbs:'herbs', compounds:'compounds', goals:'goals', 'goals/sleep':'sleep', 'goals/stress':'stress', 'goals/anxiety':'anxiety', 'goals/focus':'focus', methodology:'methodology', safety:'safety' } as const
export type HindiPageKey = keyof typeof HINDI_PAGES
export type IndonesianPageKey = keyof typeof INDONESIAN_PAGES
export function buildHindiPageMetadata(page: LocalizedPageData) { return buildLocalizedPageMetadata(page, { openGraphLocale: HINDI_OG_LOCALE }) }
export function buildIndonesianPageMetadata(page: LocalizedPageData) { return buildLocalizedPageMetadata(page, { openGraphLocale: INDONESIAN_OG_LOCALE }) }
