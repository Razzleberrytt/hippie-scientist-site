export interface Product {
  title: string
  link: string
  image?: string
  price?: string
}

export const compareData: Record<string, Product[]> = {
  'acacia-confusa': [
    {
      title: 'Acacia Root Bark 100g',
      link: 'https://example.com/acacia',
      image: 'https://via.placeholder.com/150',
      price: '$20-30',
    },
    {
      title: 'Acacia Powder 1lb',
      link: 'https://example.com/acacia2',
      image: 'https://via.placeholder.com/150',
      price: '$45-55',
    },
  ],
  dmt: [
    {
      title: 'DMT Reference Material',
      link: 'https://example.com/dmt',
      image: 'https://via.placeholder.com/150',
      price: '$50+',
    },
    {
      title: 'Portable Vapor Kit',
      link: 'https://example.com/dmt-vape',
      image: 'https://via.placeholder.com/150',
      price: '$80-120',
    },
  ],
}

export default compareData
