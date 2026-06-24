import type { ReactNode } from "react";

export default function NonEmpty({ children }: { children?: ReactNode }) {
  return children ? <>{children}</> : null;
}
