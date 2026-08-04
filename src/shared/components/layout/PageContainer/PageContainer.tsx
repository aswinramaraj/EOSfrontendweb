import type { ReactNode } from "react";

export function PageContainer({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-var(--topbar-h))] overflow-y-auto" style={{ background: "var(--background)" }}>
      <div className="mx-auto w-full max-w-[var(--content-max)] p-[var(--sp-6)]">{children}</div>
    </div>
  );
}
