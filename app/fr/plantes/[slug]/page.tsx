import { createLocalizedProfileRoute } from '@/src/lib/localized-profile-route-runtime'

const route = createLocalizedProfileRoute({
  locale: 'fr',
  kind: 'herb',
  lang: 'fr',
  libraryHref: '/fr/plantes/',
})

export const dynamicParams = false
export const generateStaticParams = route.generateStaticParams
export const generateMetadata = route.generateMetadata
export default route.Page
