import { redirect } from 'next/navigation'

export const dynamic = 'force-static'

export default function ProductQualityRedirectPage() {
  redirect('/learn/product-quality/')
}
