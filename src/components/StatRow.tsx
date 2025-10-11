import clsx from 'clsx';
import StatBadge from './StatBadge';
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
    <div
      className={clsx(
        'mt-4 -mx-1 overflow-x-auto overscroll-x-contain scrollbar-none',
        className,
      )}
    >
      <div className="flex flex-nowrap items-center gap-3 px-1 sm:gap-4">
        <StatBadge count={herbs} label="psychoactive herbs" />
        <StatBadge count={compounds} label="active compounds" />
        <StatBadge count={posts} label="articles" />
      </div>
    </div>
  );
}
