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
      <span className='pill'>
        <span className='count'>{herbs}</span>
        psychoactive herbs
      </span>
      <span className='pill'>
        <span className='count'>{compounds}</span>
        active compounds
      </span>
      <span className='pill'>
        <span className='count'>{posts}</span>
        articles
      </span>
    </div>
  );
}
