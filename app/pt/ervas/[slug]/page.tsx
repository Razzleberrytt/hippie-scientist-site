import { createLocalizedProfileRoute } from '@/src/lib/localized-profile-route-runtime'

const route = createLocalizedProfileRoute({
  locale: 'pt-BR',
  kind: 'herb',
  lang: 'pt-BR',
  libraryHref: '/pt/ervas/',
})

export const dynamicParams = false
export const generateStaticParams = route.generateStaticParams
export const generateMetadata = route.generateMetadata
export default route.Page
