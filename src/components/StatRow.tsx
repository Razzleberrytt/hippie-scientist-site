import clsx from 'clsx';
import { siteStats } from '../lib/stats';

type StatRowProps = {
  herbs?: number | string;
  compounds?: number | string;
  posts?: number | string;
  className?: string;
};

export default function StatRow({
  herbs = siteStats.herbs,
  compounds = siteStats.compounds,
  posts = siteStats.posts,
  className,
}: StatRowProps) {
  return (
    <div className={clsx('mt-4 flex flex-wrap gap-3', className)}>
      <span className='inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-3 py-1.5'>
        <b className='grid h-6 w-8 place-items-center rounded-xl bg-white/10 text-white'>{herbs}</b>
        <span className='text-white/80'>psychoactive herbs</span>
      </span>
      <span className='inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-3 py-1.5'>
        <b className='grid h-6 w-8 place-items-center rounded-xl bg-white/10 text-white'>{compounds}</b>
        <span className='text-white/80'>active compounds</span>
      </span>
      <span className='inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-3 py-1.5'>
        <b className='grid h-6 w-8 place-items-center rounded-xl bg-white/10 text-white'>{posts}</b>
        <span className='text-white/80'>articles</span>
      </span>
    </div>
  );
}
