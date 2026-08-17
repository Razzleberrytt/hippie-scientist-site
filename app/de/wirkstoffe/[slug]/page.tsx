import { createLocalizedProfileRoute } from '@/src/lib/localized-profile-route-runtime'

const route = createLocalizedProfileRoute({
  locale: 'de',
  kind: 'compound',
  lang: 'de',
  libraryHref: '/de/wirkstoffe/',
  libraryLabel: 'Zurück zu den Wirkstoffen',
})

export const dynamicParams = false
export const generateStaticParams = route.generateStaticParams
export const generateMetadata = route.generateMetadata
export default route.Page
