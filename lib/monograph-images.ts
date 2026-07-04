import { formatDisplayLabel } from '@/lib/display-utils'

export type MonographKind = 'herb' | 'compound'

export type MonographImage = {
  src: string
  alt: string
  credit?: string
}

const FEATURED_IMAGES: Record<string, string> = {
  // Photographic hero images for top-demand monographs (SEO + engagement).
  'compound:5-htp': '/images/monographs/photos/5-htp.jpg',
  'compound:alpha-gpc': '/images/monographs/photos/choline.jpg',
  'compound:berberine': '/images/monographs/photos/berberine.jpg',
  'compound:beta-alanine': '/images/monographs/photos/taurine.jpg',
  'compound:caffeine': '/images/monographs/photos/caffeine.jpg',
  'compound:chamomile': '/images/monographs/photos/chamomile.jpg',
  'compound:choline': '/images/monographs/photos/choline.jpg',
  'compound:coenzyme-q10': '/images/monographs/photos/coq10.jpg',
  'compound:coq10': '/images/monographs/photos/coq10.jpg',
  'compound:cordyceps': '/images/monographs/photos/cordyceps.jpg',
  'compound:creatine': '/images/monographs/photos/creatine.jpg',
  'compound:echinacea': '/images/monographs/photos/echinacea.jpg',
  'compound:fisetin': '/images/monographs/photos/nmn.jpg',
  'compound:gaba': '/images/monographs/photos/gaba.jpg',
  'compound:glutathione': '/images/monographs/photos/nac.jpg',
  'compound:glycine': '/images/monographs/photos/taurine.jpg',
  'compound:iron': '/images/monographs/photos/iron.jpg',
  'compound:kava': '/images/monographs/photos/kava.jpg',
  'compound:l-theanine': '/images/monographs/photos/l-theanine.jpg',
  'compound:l-tyrosine': '/images/monographs/photos/l-tyrosine.jpg',
  'compound:lemon-balm': '/images/monographs/photos/lemon-balm.jpg',
  'compound:melatonin': '/images/monographs/photos/melatonin.jpg',
  'compound:n-acetylcysteine': '/images/monographs/photos/nac.jpg',
  'compound:nmn': '/images/monographs/photos/nmn.jpg',
  'compound:omega-3': '/images/monographs/photos/omega-3.jpg',
  'compound:passionflower': '/images/monographs/photos/passionflower.jpg',
  'compound:pqq': '/images/monographs/photos/nmn.jpg',
  'compound:probiotics': '/images/monographs/photos/probiotics.jpg',
  'compound:shilajit': '/images/monographs/photos/shilajit.jpg',
  'compound:silymarin': '/images/monographs/photos/milk-thistle.jpg',
  'compound:spermidine': '/images/monographs/photos/nmn.jpg',
  'compound:spirulina': '/images/monographs/photos/spirulina.jpg',
  'compound:taurine': '/images/monographs/photos/taurine.jpg',
  'compound:theanine': '/images/monographs/photos/l-theanine.jpg',
  'compound:vitamin-c': '/images/monographs/photos/vitamin-c.jpg',
  'compound:vitamin-d': '/images/monographs/photos/vitamin-d.jpg',
  'compound:zinc': '/images/monographs/photos/zinc.jpg',
  'herb:astragalus': '/images/monographs/photos/astragalus.jpg',
  'herb:bacopa': '/images/monographs/photos/bacopa.jpg',
  'herb:blue-lotus': '/images/monographs/photos/blue-lotus.jpg',
  'herb:chaga': '/images/monographs/photos/chaga.jpg',
  'herb:citicoline': '/images/monographs/photos/choline.jpg',
  'herb:crocus-sativus': '/images/monographs/photos/saffron.jpg',
  'herb:elderberry': '/images/monographs/photos/elderberry.jpg',
  'herb:ganoderma-lucidum': '/images/monographs/photos/reishi.jpg',
  'herb:ginger': '/images/monographs/photos/ginger.jpg',
  'herb:ginkgo-biloba': '/images/monographs/photos/ginkgo.jpg',
  'herb:gotu-kola': '/images/monographs/photos/gotu-kola.jpg',
  'herb:holy-basil': '/images/monographs/photos/holy-basil.jpg',
  'herb:hypericum-perforatum': '/images/monographs/photos/st-johns-wort.jpg',
  'herb:kanna': '/images/monographs/photos/kanna.jpg',
  'herb:maca': '/images/monographs/photos/maca.jpg',
  'herb:melissa-officinalis': '/images/monographs/photos/lemon-balm.jpg',
  'herb:milk-thistle': '/images/monographs/photos/milk-thistle.jpg',
  'herb:moringa': '/images/monographs/photos/moringa.jpg',
  'herb:panax-ginseng': '/images/monographs/photos/panax-ginseng.jpg',
  'herb:panax-quinquefolius': '/images/monographs/photos/american-ginseng.jpg',
  'herb:quercetin': '/images/monographs/photos/quercetin.jpg',
  'herb:reishi': '/images/monographs/photos/reishi.jpg',
  'herb:resveratrol': '/images/monographs/photos/resveratrol.jpg',
  'herb:rhodiola': '/images/monographs/photos/rhodiola.jpg',
  'herb:saffron': '/images/monographs/photos/saffron.jpg',
  'herb:st-johns-wort': '/images/monographs/photos/st-johns-wort.jpg',
  'herb:tongkat-ali': '/images/monographs/photos/tongkat-ali.jpg',
  'herb:tyrosine': '/images/monographs/photos/l-tyrosine.jpg',
  'herb:valerian': '/images/monographs/photos/valerian.jpg',
  'herb:valerian': '/images/monographs/photos/valerian.jpg',
  'herb:bacopa': '/images/monographs/photos/bacopa.jpg',
  'herb:chamomile': '/images/monographs/photos/chamomile.jpg',
  'herb:garlic': '/images/guides/garlic.jpg',
  'herb:hawthorn': '/images/guides/hawthorn.jpg',
  'herb:saw-palmetto': '/images/guides/saw-palmetto.jpg',
  'herb:black-cohosh': '/images/guides/black-cohosh.jpg',
  'herb:kava': '/images/guides/kava.jpg',
  'herb:passionflower': '/images/guides/passionflower.jpg',
  'herb:echinacea': '/images/guides/echinacea.jpg',
  'herb:maca': '/images/guides/maca.jpg',
  'herb:peppermint': '/images/monographs/photos/peppermint.jpg',
  'herb:rosemary': '/images/monographs/photos/rosemary.jpg',
  'herb:dandelion': '/images/monographs/photos/dandelion.jpg',
  'herb:nettle': '/images/monographs/photos/nettle.jpg',
  'herb:cinnamon': '/images/monographs/photos/cinnamon.jpg',
  'herb:oregano': '/images/monographs/photos/oregano.jpg',
  'herb:cordyceps': '/images/guides/cordyceps.jpg',
  'herb:schisandra': '/images/monographs/photos/schisandra.jpg',
  'herb:sage': '/images/monographs/photos/sage.jpg',
  'herb:thyme': '/images/monographs/photos/thyme.jpg',
  'herb:licorice': '/images/monographs/photos/licorice.jpg',
  // Existing hand-made illustrations:
  'herb:ashwagandha': '/images/guides/ashwagandha-herb.jpg',
  'herb:lions-mane': '/images/guides/lions-mane.jpg',
  'herb:hericium-erinaceus': '/images/guides/lions-mane.jpg',
  'herb:turmeric': '/images/guides/turmeric-curcumin.jpg',
  'herb:turmeric-curcumin': '/images/guides/turmeric-curcumin.jpg',
  'compound:curcumin': '/images/guides/turmeric-curcumin.jpg',
  'compound:magnesium': '/images/guides/magnesium-for-sleep-and-anxiety.svg',
  'compound:magnesium-glycinate': '/images/guides/magnesium-for-sleep-and-anxiety.svg',
}

function asImagePath(value: unknown): string {
  if (typeof value !== 'string') return ''
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (trimmed.startsWith('/') || trimmed.startsWith('https://') || trimmed.startsWith('http://')) return trimmed
  return ''
}

function inferFallbackImage(kind: MonographKind, slug: string, record: Record<string, unknown>): string {
  const haystack = [
    slug,
    record.name,
    record.displayName,
    record.category,
    record.compoundClass,
    record.class,
  ].join(' ').toLowerCase()

  if (kind === 'compound') {
    if (/magnesium|zinc|iron|copper|selenium|lithium|mineral|electrolyte/.test(haystack)) {
      return '/images/monographs/mineral.svg'
    }
    return '/images/monographs/molecule.svg'
  }

  if (/mushroom|reishi|cordyceps|chaga|maitake|hericium|ganoderma|fung/.test(haystack)) {
    return '/images/monographs/mushroom.svg'
  }

  return '/images/monographs/botanical.svg'
}

export function getMonographImage(
  kind: MonographKind,
  slug: string,
  record: Record<string, unknown>,
): MonographImage {
  const displayName = formatDisplayLabel(record.displayName || record.name || slug) || 'Profile'
  const explicitImage = asImagePath(record.image || record.imageUrl || record.og || record.thumbnail)
  const featuredImage = FEATURED_IMAGES[`${kind}:${slug}`]
  const src = explicitImage || featuredImage || inferFallbackImage(kind, slug, record)
  const explicitCredit = typeof record.imageCredit === 'string' ? record.imageCredit.trim() : ''
  const isPhoto = typeof src === 'string' && src.includes('/images/monographs/photos/')
  const featuredCredit = isPhoto ? 'The Hippie Scientist' : 'The Hippie Scientist illustration'

  return {
    src,
    alt: `${displayName} monograph visual`,
    credit: explicitCredit || (featuredImage ? featuredCredit : 'Generated profile category visual'),
  }
}

export function toAbsoluteImageUrl(src: string, siteUrl: string): string {
  if (src.startsWith('http://') || src.startsWith('https://')) return src
  return `${siteUrl}${src.startsWith('/') ? src : `/${src}`}`
}
