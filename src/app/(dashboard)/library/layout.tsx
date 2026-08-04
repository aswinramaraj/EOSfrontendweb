import type { Metadata } from "next";
import { QueryProvider } from "@/shared/components/QueryProvider";
import { ToastProvider } from "@/shared/components/ui/ToastProvider";
import { LibraryShell } from "@/modules/library/components/LibraryShell";

export const metadata: Metadata = {
  title: "Library — EOS Portal",
};

export default function LibraryLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ToastProvider>
        <LibraryShell>{children}</LibraryShell>
      </ToastProvider>
    </QueryProvider>
  );
}
