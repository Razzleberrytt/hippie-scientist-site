import { createExpandedHerbProfileRoute } from '@/lib/expanded-profile-route-runtime'

const route = createExpandedHerbProfileRoute({ locale: 'th', lang: 'th', libraryHref: '/th/herbs/' })

export const dynamicParams = false
export const generateStaticParams = route.generateStaticParams
export const generateMetadata = route.generateMetadata
export default route.Page
