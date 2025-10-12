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
    <div className={clsx('counter-row mt-4', className)}>
      <span className='counter-pill'>
        <span className='counter-num'>{herbs}</span>
        psychoactive herbs
      </span>
      <span className='counter-pill'>
        <span className='counter-num'>{compounds}</span>
        active compounds
      </span>
      <span className='counter-pill'>
        <span className='counter-num'>{posts}</span>
        articles
      </span>
    </div>
  );
}
