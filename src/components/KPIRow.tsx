import clsx from 'clsx';

interface KPIRowProps {
  herbs: number;
  compounds: number;
  articles: number;
  className?: string;
}

export default function KPIRow({ herbs, compounds, articles, className }: KPIRowProps) {
  const Item = ({ num, label }: { num: number; label: string }) => (
    <div className="glass-pill flex items-center gap-3 px-4 min-h-[48px]">
      <div className="kpi-num">{num}</div>
      <div className="opacity-90">{label}</div>
    </div>
  );

  return (
    <div className={clsx('grid grid-cols-1 sm:grid-cols-3 gap-3 w-full', className)}>
      <Item num={herbs} label="psychoactive herbs" />
      <Item num={compounds} label="active compounds" />
      <Item num={articles} label="articles" />
    </div>
  );
}
