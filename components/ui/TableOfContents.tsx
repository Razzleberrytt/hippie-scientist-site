export default function TableOfContents(){
  const items=[
    {id:'effects',label:'Effects'},
    {id:'safety',label:'Safety'},
    {id:'faq',label:'FAQ'},
    {id:'related',label:'Related'}
  ]

  return(
    <div className="sticky top-4 text-xs space-y-2 hidden lg:block">
      {items.map(i=>(
        <a key={i.id} href={`#${i.id}`} className="block text-neutral-500 hover:text-black">
          {i.label}
        </a>
      ))}
    </div>
  )
}
