import type { Metadata } from "next";
import { QueryProvider } from "@/shared/components/QueryProvider";
import { ToastProvider } from "@/shared/components/ui/ToastProvider";
import { FacultyShell } from "@/modules/faculty/components/FacultyShell";

export const metadata: Metadata = {
  title: "Faculty — EOS Portal",
};

export default function FacultyLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ToastProvider>
        <FacultyShell>{children}</FacultyShell>
      </ToastProvider>
    </QueryProvider>
  );
}
