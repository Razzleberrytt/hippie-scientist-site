import { createExpandedHerbProfileRoute } from '@/lib/expanded-profile-route-runtime'

const route = createExpandedHerbProfileRoute({ locale: 'ar', lang: 'ar', libraryHref: '/ar/herbs/' })

export const dynamicParams = false
export const generateStaticParams = route.generateStaticParams
export const generateMetadata = route.generateMetadata
export default route.Page
