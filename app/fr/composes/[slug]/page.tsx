import { createLocalizedProfileRoute } from '@/src/lib/localized-profile-route-runtime'

const route = createLocalizedProfileRoute({
  locale: 'fr',
  kind: 'compound',
  lang: 'fr',
  libraryHref: '/fr/composes/',
  libraryLabel: 'Retour aux composés',
})

export const dynamicParams = false
export const generateStaticParams = route.generateStaticParams
export const generateMetadata = route.generateMetadata
export default route.Page
