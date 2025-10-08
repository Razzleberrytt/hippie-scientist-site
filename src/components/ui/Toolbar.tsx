import type { ReactNode } from 'react';

export default function Toolbar({ children }: { children: ReactNode }) {
  return <div className="blur-panel flex flex-wrap items-center gap-3 p-3 md:p-4">{children}</div>;
}
