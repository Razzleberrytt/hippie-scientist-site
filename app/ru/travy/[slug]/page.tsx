import { createExpandedHerbProfileRoute } from '@/lib/expanded-profile-route-runtime'

const route = createExpandedHerbProfileRoute({ locale: 'ru', lang: 'ru', libraryHref: '/ru/travy/' })

export const dynamicParams = false
export const generateStaticParams = route.generateStaticParams
export const generateMetadata = route.generateMetadata
export default route.Page
