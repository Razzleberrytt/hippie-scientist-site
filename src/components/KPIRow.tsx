import clsx from 'clsx';

export default function KPIRow({
  herbs, compounds, articles, className,
}: { herbs: number; compounds: number; articles: number; className?: string }) {
  return (
    <div className={clsx('grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3', className)}>
      <KPI num={herbs} label='psychoactive herbs' />
      <KPI num={compounds} label='active compounds' />
      <KPI num={articles} label='articles' />
    </div>
  );
}

function KPI({ num, label }: { num: number; label: string }) {
  return (
    <div className='kpi flex items-center gap-3 rounded-full border border-white/14 bg-white/6 backdrop-blur-md min-h-[44px] px-4'>
      <div className='kpi-num grid place-items-center w-9 h-9 rounded-full font-semibold
                      bg-white/14 border border-white/20 [font-variant-numeric:tabular-nums]'>
        {num}
      </div>
      <div className='kpi-label truncate opacity-90'>{label}</div>
    </div>
  );
}
