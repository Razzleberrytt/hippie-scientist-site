type ProductData = {
  slug: string
  preferred_vendor_url?: string
  affiliate_url_template?: string
  fallback_url?: string
  product_cta?: string
}

export function getProductLink(data: ProductData) {
  if (data.preferred_vendor_url) return data.preferred_vendor_url

  if (data.affiliate_url_template) {
    return data.affiliate_url_template.replace(
      '{query}',
      encodeURIComponent(data.slug)
    )
  }

  return `https://www.amazon.com/s?k=${encodeURIComponent(data.slug)}&tag=razzleberry02-20`
}
