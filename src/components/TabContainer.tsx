import React from 'react'

interface Tab {
  id: string
  label: string
  content: React.ReactNode
}

interface Props {
  tabs: Tab[]
}

export default function TabContainer({ tabs }: Props) {
  const [active, setActive] = React.useState(0)
  const [mobile, setMobile] = React.useState(false)

  React.useEffect(() => {
    const check = () => setMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  if (mobile) {
    return (
      <div className='space-y-4'>
        {tabs.map((t, i) => (
          <details
            key={t.id}
            open={i === active}
            className='rounded-md bg-black/20 p-2'
            onClick={() => setActive(i)}
          >
            <summary className='cursor-pointer font-semibold'>{t.label}</summary>
            <div className='mt-2'>{t.content}</div>
          </details>
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className='flex gap-2 border-b border-comet/30'>
        {tabs.map((t, i) => (
          <button
            key={t.id}
            type='button'
            onClick={() => setActive(i)}
            className={`px-3 py-2 text-sm ${
              i === active
                ? 'border-b-2 border-sky-300 text-sky-300'
                : 'text-sand hover:text-sky-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className='pt-4'>{tabs[active]?.content}</div>
    </div>
  )
}
