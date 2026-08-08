import type { Metadata } from "next";
import { QueryProvider } from "@/shared/components/QueryProvider";
import { ToastProvider } from "@/shared/components/ui/ToastProvider";
import { PlacementShell } from "@/modules/placement/components/PlacementShell";

export const metadata: Metadata = {
  title: "Placement Cell — EOS Portal",
};

export default function PlacementLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ToastProvider>
        <PlacementShell>{children}</PlacementShell>
      </ToastProvider>
    </QueryProvider>
  );
}
