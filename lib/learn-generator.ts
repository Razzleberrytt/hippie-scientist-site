import { getCompoundDetailPayload } from '@/lib/runtime-data'

export async function generateLearnPage(slug: string) {
  const compounds = await getCompoundDetailPayload()

  if (!compounds || !Array.isArray(compounds)) return null

  const map: Record<string, string[]> = {
    'cognitive-stack': ['bacopa','ginkgo','l-theanine','rhodiola','lion-s-mane','gotu-kola'],
    'anti-inflammatory-stack': ['turmeric','ginger'],
    'adaptogens': ['ashwagandha','rhodiola','holy-basil'],
  }

  const slugs = map[slug]
  if (!slugs) return null

  const selected = compounds.filter((c:any)=> slugs.includes(c.slug))

  return {
    slug,
    title: slug.replace(/-/g,' '),
    intro: 'Generated from workbook data.',
    compounds: selected
  }
}
