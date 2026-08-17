import { createLocalizedProfileRoute } from '@/src/lib/localized-profile-route-runtime'

const route = createLocalizedProfileRoute({
  locale: 'es',
  kind: 'compound',
  lang: 'es',
  libraryHref: '/es/compuestos/',
  libraryLabel: 'Volver a compuestos',
})

export const dynamicParams = false
export const generateStaticParams = route.generateStaticParams
export const generateMetadata = route.generateMetadata
export default route.Page
