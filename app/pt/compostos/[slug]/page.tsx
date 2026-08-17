import { createLocalizedProfileRoute } from '@/src/lib/localized-profile-route-runtime'

const route = createLocalizedProfileRoute({
  locale: 'pt-BR',
  kind: 'compound',
  lang: 'pt-BR',
  libraryHref: '/pt/compostos/',
  libraryLabel: 'Voltar para compostos',
})

export const dynamicParams = false
export const generateStaticParams = route.generateStaticParams
export const generateMetadata = route.generateMetadata
export default route.Page
