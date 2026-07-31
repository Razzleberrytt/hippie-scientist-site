import CompoundPage, { generateMetadata as generateCompoundMetadata } from '../[slug]/page'

const slug = 'trimethylglycine'

export async function generateMetadata() {
  return generateCompoundMetadata({ params: Promise.resolve({ slug }) })
}

export default async function TrimethylglycinePage() {
  return CompoundPage({ params: Promise.resolve({ slug }) })
}
