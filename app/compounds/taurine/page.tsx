import CompoundPage, { generateMetadata as generateCompoundMetadata } from '../[slug]/page'

const slug = 'taurine'

export async function generateMetadata() {
  return generateCompoundMetadata({ params: Promise.resolve({ slug }) })
}

export default async function TaurinePage() {
  return CompoundPage({ params: Promise.resolve({ slug }) })
}
