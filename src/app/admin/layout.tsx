import type { Metadata } from "next";
import { QueryProvider } from "@/shared/components/QueryProvider";
import { ToastProvider } from "@/shared/components/ui/ToastProvider";
import { AdminShell } from "@/modules/admin/components/AdminShell";

export const metadata: Metadata = {
  title: "Admin Console — EOS Portal",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ToastProvider>
        <AdminShell>{children}</AdminShell>
      </ToastProvider>
    </QueryProvider>
  );
}
