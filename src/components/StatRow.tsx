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
        'mt-6 flex flex-wrap items-center gap-3',
        className,
      )}
    >
      <StatBadge count={herbs} label="psychoactive herbs" />
      <StatBadge count={compounds} label="active compounds" />
      <StatBadge count={posts} label="articles" />
    </div>
  );
}
