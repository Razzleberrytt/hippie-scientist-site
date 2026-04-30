// trimmed for brevity — applying targeted patch
// ADD stronger affiliate block UI

// locate existing affiliate section and replace it with:

<section className='ds-card border-emerald-300/20 bg-emerald-300/10'>
  <p className='text-sm font-semibold uppercase tracking-[0.2em] text-emerald-100'>
    Find {label} products
  </p>

  <p className='mt-2 text-xs text-emerald-100/70'>
    Compare common supplement forms. As an Amazon Associate I earn from qualifying purchases.
  </p>

  <div className='mt-4 grid grid-cols-1 gap-2'>
    {affiliateLinks.map(link => (
      <a
        key={link.label}
        href={link.url}
        target='_blank'
        rel='noopener noreferrer'
        className='flex items-center justify-between rounded-xl border border-emerald-300/30 bg-black/20 px-4 py-3 text-sm font-medium text-emerald-100 transition hover:bg-emerald-300/20'
      >
        <div>
          <div>{link.label}</div>
          <div className='text-xs text-emerald-100/60'>{link.helperText}</div>
        </div>
        <span>→</span>
      </a>
    ))}
  </div>
</section>
