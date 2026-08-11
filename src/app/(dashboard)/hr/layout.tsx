import type { Metadata } from "next";
import { QueryProvider } from "@/shared/components/QueryProvider";
import { ToastProvider } from "@/shared/components/ui/ToastProvider";
import { HRShell } from "@/modules/hr/components/HRShell";

export const metadata: Metadata = {
  title: "HR — EOS Portal",
};

export default function HRLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ToastProvider>
        <HRShell>{children}</HRShell>
      </ToastProvider>
    </QueryProvider>
  );
}
