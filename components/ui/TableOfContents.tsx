export default function TableOfContents(){
  const items=[
    {id:'effects',label:'Effects'},
    {id:'safety',label:'Safety'},
    {id:'faq',label:'FAQ'},
    {id:'related',label:'Related'}
  ]

  return(
    <aside className="sticky top-8 hidden h-fit lg:block">
      <div className="surface-subtle w-52 card-spacing space-y-5">
        <div className="eyebrow-label">
          On this page
        </div>

        <nav className="space-y-1.5">
          {items.map(i=>(
            <a
              key={i.id}
              href={`#${i.id}`}
              className="block rounded-xl px-3 py-2 text-sm font-medium text-[#526359] transition-all duration-300 hover:bg-white hover:text-brand-800"
            >
              {i.label}
            </a>
          ))}
        </nav>
      </div>
    </aside>
  )
}
