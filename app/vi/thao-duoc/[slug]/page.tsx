import { createExpandedHerbProfileRoute } from '@/lib/expanded-profile-route-runtime'

const route = createExpandedHerbProfileRoute({ locale: 'vi', lang: 'vi', libraryHref: '/vi/thao-duoc/' })

export const dynamicParams = false
export const generateStaticParams = route.generateStaticParams
export const generateMetadata = route.generateMetadata
export default route.Page
