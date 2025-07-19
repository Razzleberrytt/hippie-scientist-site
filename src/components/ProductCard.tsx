import React from 'react'

interface Props {
  title: string
  link: string
  image?: string
  price?: string
}

export default function ProductCard({ title, link, image, price }: Props) {
  return (
    <a
      href={link}
      target='_blank'
      rel='noopener noreferrer'
      className='flex w-40 flex-col overflow-hidden rounded-lg bg-black/30 backdrop-blur transition hover:shadow-glow'
    >
      {image && <img src={image} alt={title} className='h-24 w-full object-cover' />}
      <div className='p-2 text-center'>
        <h3 className='text-sm font-bold text-white'>{title}</h3>
        {price && <p className='text-xs text-sand'>{price}</p>}
        <span className='mt-2 inline-block rounded-md bg-gradient-to-r from-green-700 to-lime-600 px-2 py-1 text-xs text-white'>
          Buy Now
        </span>
      </div>
    </a>
  )
}
