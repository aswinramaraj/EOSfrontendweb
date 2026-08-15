import type { ReactNode } from "react";

export function ContentContainer({ children }: { children?: ReactNode }) {
  return (
    <div className="min-h-[300px] pt-5">
      {children}
    </div>
  );
}
