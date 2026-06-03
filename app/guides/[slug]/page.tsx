import { SeoEntryPage, generateSeoEntryMetadata, seoEntryPages } from '../../seo-entry-pages'

type Params = Promise<{ slug: string }>

export async function generateStaticParams() {
  return seoEntryPages
    .filter(page => page.route.startsWith('guides/'))
    .map(page => ({
      slug: page.route.replace('guides/', '')
    }))
}

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params
  return generateSeoEntryMetadata(`guides/${slug}`)
}

export default async function Page({ params }: { params: Params }) {
  const { slug } = await params
  return <SeoEntryPage route={`guides/${slug}`} />
}
