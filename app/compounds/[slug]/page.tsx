// Add affiliate import
import { getCompoundSearchLinks } from '@/lib/affiliate'

// inside component after label defined
const affiliateLinks = getCompoundSearchLinks(label)

// then inside sidebar (before reminder):
<section className='ds-card border-blue-300/20 bg-blue-300/10'>
  <p className='text-sm font-semibold uppercase tracking-[0.2em] text-blue-100'>
    Find {label} supplements
  </p>

  <p className='mt-2 text-xs text-blue-100/70'>
    Compare common product formats. As an Amazon Associate I earn from qualifying purchases.
  </p>

  <div className='mt-4 grid grid-cols-1 gap-2'>
    {affiliateLinks.map(link => (
      <a
        key={link.label}
        href={link.url}
        target='_blank'
        rel='noopener noreferrer'
        className='flex items-center justify-between rounded-xl border border-blue-300/30 bg-black/20 px-4 py-3 text-sm font-medium text-blue-100 transition hover:bg-blue-300/20'
      >
        <div>
          <div>{link.label}</div>
          <div className='text-xs text-blue-100/60'>{link.helperText}</div>
        </div>
        <span>→</span>
      </a>
    ))}
  </div>
</section>
