import { PathwayHub, generatePathwayMetadata } from '../../education/pathway-hub'

export const metadata = generatePathwayMetadata('inflammation')

export default async function InflammationPathwayPage() {
  return PathwayHub({ pathway: 'inflammation' })
}
