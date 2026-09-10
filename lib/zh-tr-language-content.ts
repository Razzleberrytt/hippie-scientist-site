import type { LocalizedPageData, LocalizedUiCopy } from './localization'
import { buildLocalizedPageMetadata } from './localization'
import { TURKISH_OG_LOCALE, CHINESE_OG_LOCALE } from './international-seo'

type LocalePack = { prefix: string; language: string; og: string; name: string; english: string; ui: LocalizedUiCopy }

const packs: Record<'zh-CN' | 'tr', LocalePack> = {
  'zh-CN': {
    prefix: '/zh', language: 'zh', og: CHINESE_OG_LOCALE, name: '简体中文', english: 'English',
    ui: {
      translationNotice: '这是编辑内容的简体中文翻译。尚未完成中文全面审核的详细科学档案会明确标示为英文内容。',
      nextStepLabel: '下一步',
      nextStepBody: '继续使用相同标准比较：先看证据，清楚呈现安全性，不隐藏不确定性。',
      educationDisclaimer: '这些信息仅用于教育目的，不能替代个人医疗评估或专业建议。',
    },
  },
  tr: {
    prefix: '/tr', language: 'tr', og: TURKISH_OG_LOCALE, name: 'Türkçe', english: 'English',
    ui: {
      translationNotice: 'Bu, editoryal içeriğin Türkçe çevirisidir. Türkçe olarak tam incelenmemiş ayrıntılı bilimsel profiller açıkça İngilizce içerik olarak belirtilir.',
      nextStepLabel: 'Sonraki adım',
      nextStepBody: 'Aynı standardı kullanarak karşılaştırmaya devam edin: önce kanıta bakın, güvenliği açıkça gösterin ve belirsizliği gizlemeyin.',
      educationDisclaimer: 'Bu bilgiler yalnızca eğitim amaçlıdır ve kişisel tıbbi değerlendirme veya profesyonel tavsiyenin yerine geçmez.',
    },
  },
}

const pageCopy = {
  'zh-CN': {
    home: ['用证据而不是猜测了解补充剂', '根据人体研究、作用机制、研究剂量、安全性和相互作用比较草药与补充剂。'],
    herbs: ['草药：证据、机制与安全性', '优先查看人体研究质量、研究剂量、安全性和相互作用，了解草药。'],
    compounds: ['化合物与补充剂：比较证据', '根据人体研究、研究剂量、安全性、相互作用和证据质量进行比较。'],
    goals: ['从你的目标开始研究', '针对睡眠、压力、焦虑和专注等目标，使用一致的证据与安全标准。'],
    sleep: ['查看睡眠相关证据', '比较睡眠相关选择时，关注人体结果、剂量、安全性和不确定性。'],
    stress: ['查看压力相关证据', '根据人体研究和安全性信号评估压力相关选择。'],
    anxiety: ['查看焦虑相关证据', '结合证据质量、安全性和研究局限性审视焦虑相关选择。'],
    focus: ['查看专注相关证据', '根据人体结果和实际研究条件比较与专注相关的选择。'],
    methodology: ['我们如何评估证据', '综合考虑人体研究、结果一致性、研究剂量、安全性和研究局限性。'],
    safety: ['安全优先', '将相互作用、禁忌情况和不确定性与潜在益处同等重视。'],
  },
  tr: {
    home: ['Takviyeleri tahminle değil kanıtla inceleyin', 'Bitki ve takviyeleri insan araştırmaları, mekanizmalar, araştırılmış dozlar, güvenlik ve etkileşimlere göre karşılaştırın.'],
    herbs: ['Bitkiler: kanıt, mekanizma ve güvenlik', 'Bitkileri değerlendirirken insan araştırmalarının kalitesini, araştırılmış dozları, güvenliği ve etkileşimleri öne çıkarın.'],
    compounds: ['Bileşikler ve takviyeler: kanıtı karşılaştırın', 'İnsan araştırmaları, araştırılmış dozlar, güvenlik, etkileşimler ve kanıt kalitesine göre karşılaştırın.'],
    goals: ['Hedefinizden başlayın', 'Uyku, stres, kaygı ve odaklanma gibi hedeflerde aynı kanıt ve güvenlik standartlarını kullanın.'],
    sleep: ['Uyku için kanıtları inceleyin', 'Uyku seçeneklerini karşılaştırırken insan sonuçlarına, doza, güvenliğe ve belirsizliğe bakın.'],
    stress: ['Stres için kanıtları inceleyin', 'Stres seçeneklerini insan araştırmaları ve güvenlik sinyallerine göre değerlendirin.'],
    anxiety: ['Kaygı için kanıtları inceleyin', 'Kaygı seçeneklerini kanıt kalitesi, güvenlik ve araştırma sınırlamalarıyla birlikte değerlendirin.'],
    focus: ['Odaklanma için kanıtları inceleyin', 'Odaklanma seçeneklerini insan sonuçlarına ve gerçekten araştırılmış koşullara göre karşılaştırın.'],
    methodology: ['Kanıtı nasıl değerlendiriyoruz', 'İnsan araştırmalarını, sonuçların tutarlılığını, araştırılmış dozları, güvenliği ve sınırlamaları birlikte değerlendiriyoruz.'],
    safety: ['Güvenlik önce gelir', 'Etkileşimleri, kontrendikasyonları ve belirsizliği olası faydalar kadar ciddiye alın.'],
  },
} as const

const routeFor = (locale: 'zh-CN' | 'tr', key: string) => {
  if (locale === 'zh-CN') {
    const zh: Record<string, string> = { herbs: 'herbs', compounds: 'compounds', goals: 'mubiao', sleep: 'mubiao/shuimian', stress: 'mubiao/yali', anxiety: 'mubiao/jiaolv', focus: 'mubiao/zhuanzhu', methodology: 'methodology', safety: 'safety' }
    return `${packs[locale].prefix}/${zh[key]}/`
  }
  const tr: Record<string, string> = { herbs: 'bitkiler', compounds: 'bilesikler', goals: 'hedefler', sleep: 'hedefler/uyku', stress: 'hedefler/stres', anxiety: 'hedefler/kaygi', focus: 'hedefler/odak', methodology: 'metodoloji', safety: 'guvenlik' }
  return `${packs[locale].prefix}/${tr[key]}/`
}

function buildPages(locale: 'zh-CN' | 'tr') {
  const copy = pageCopy[locale]
  const pack = packs[locale]
  const make = (key: keyof typeof copy, path: string): LocalizedPageData => {
    const [title, description] = copy[key]
    const links = key === 'goals'
      ? ['sleep', 'stress', 'anxiety', 'focus'].map((k) => ({ href: routeFor(locale, k), label: copy[k as keyof typeof copy][0] }))
      : []
    const howToRead = locale === 'zh-CN'
      ? '从人体研究结果开始，而不是只看流行说法。研究剂量不是个人建议；同时考虑安全性与不确定性。'
      : 'Başlangıç noktası popüler iddialar değil, insan araştırmalarının sonuçlarıdır. Araştırılmış doz kişisel öneri değildir; güvenliği ve belirsizliği birlikte değerlendirin.'
    const chooseGoal = locale === 'zh-CN' ? '选择目标' : 'Hedef seç'
    return {
      path,
      eyebrow: `The Hippie Scientist ${pack.name}`,
      title,
      description,
      intro: description,
      sections: [{ title: locale === 'zh-CN' ? '如何阅读这些信息' : 'Nasıl okumalı', body: howToRead, links }],
      primaryCta: { href: routeFor(locale, 'goals'), label: chooseGoal },
      secondaryCta: { href: '/', label: pack.english },
    }
  }
  return {
    home: make('home', `${pack.prefix}/`),
    herbs: make('herbs', routeFor(locale, 'herbs')),
    compounds: make('compounds', routeFor(locale, 'compounds')),
    goals: make('goals', routeFor(locale, 'goals')),
    sleep: make('sleep', routeFor(locale, 'sleep')),
    stress: make('stress', routeFor(locale, 'stress')),
    anxiety: make('anxiety', routeFor(locale, 'anxiety')),
    focus: make('focus', routeFor(locale, 'focus')),
    methodology: make('methodology', routeFor(locale, 'methodology')),
    safety: make('safety', routeFor(locale, 'safety')),
  } satisfies Record<string, LocalizedPageData>
}

export const CHINESE_UI = packs['zh-CN'].ui
export const TURKISH_UI = packs.tr.ui
export const CHINESE_PAGES = buildPages('zh-CN')
export const TURKISH_PAGES = buildPages('tr')

export const CHINESE_ROUTE_KEYS = {
  herbs: 'herbs', compounds: 'compounds', mubiao: 'goals', 'mubiao/shuimian': 'sleep', 'mubiao/yali': 'stress',
  'mubiao/jiaolv': 'anxiety', 'mubiao/zhuanzhu': 'focus', methodology: 'methodology', safety: 'safety',
} as const
export const TURKISH_ROUTE_KEYS = {
  bitkiler: 'herbs', bilesikler: 'compounds', hedefler: 'goals', 'hedefler/uyku': 'sleep', 'hedefler/stres': 'stress',
  'hedefler/kaygi': 'anxiety', 'hedefler/odak': 'focus', metodoloji: 'methodology', guvenlik: 'safety',
} as const

export function buildChinesePageMetadata(page: LocalizedPageData) { return buildLocalizedPageMetadata(page, { openGraphLocale: CHINESE_OG_LOCALE }) }
export function buildTurkishPageMetadata(page: LocalizedPageData) { return buildLocalizedPageMetadata(page, { openGraphLocale: TURKISH_OG_LOCALE }) }
