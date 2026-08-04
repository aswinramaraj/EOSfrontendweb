import { QueryProvider } from "@/shared/components/QueryProvider";
import { ToastProvider } from "@/shared/components/ui/ToastProvider";

// Shared across every dashboard module (library, hostel, ...) so they share
// one Query cache/toast tree instead of each mounting their own.
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ToastProvider>{children}</ToastProvider>
    </QueryProvider>
  );
}
