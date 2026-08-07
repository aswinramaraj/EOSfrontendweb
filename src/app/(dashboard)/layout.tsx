import type { ReactNode } from "react";
import { QueryProvider } from "@/shared/components/QueryProvider";
import { ToastProvider } from "@/shared/components/ui/ToastProvider";

// Shared across every dashboard module (library, hostel, fees, ...) so they
// share one Query cache/toast tree instead of each mounting their own. This
// layout must stay module-agnostic — each module's own navbar/sidebar (e.g.
// FeesShell, LibraryShell, HostelShell) is applied by that module's own
// nested layout.tsx, not here.
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <ToastProvider>{children}</ToastProvider>
    </QueryProvider>
  );
}
