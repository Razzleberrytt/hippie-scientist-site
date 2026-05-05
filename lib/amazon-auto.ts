export function generateAmazonProductPicks(slug: string) {
  const base = `https://www.amazon.com/s?k=${encodeURIComponent(slug)}&tag=razzleberry02-20`

  return {
    top: {
      name: `${slug} top rated supplement`,
      brand: 'Top Rated',
      url: base + '&s=review-rank',
      notes: 'Sorted by highest reviews'
    },
    budget: {
      name: `${slug} budget supplement`,
      brand: 'Best Value',
      url: base + '&s=price-asc-rank',
      notes: 'Lowest price options'
    },
    premium: {
      name: `${slug} premium supplement`,
      brand: 'Premium Choice',
      url: base + '&s=price-desc-rank',
      notes: 'Higher-end products'
    }
  }
}
